
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Bhajan, Book, LectureData, EventData, Playlist, HistoryEntry, BhajanAudio, DownloadItem, DownloadConfirmation } from '../types';
import { RAW_BHAJAN_DATA } from '../data/rawBhajans';
import { BOOKS_DATA } from '../data/books';
import { LECTURES_DATA } from '../data/lectures';
import { parseRawBhajanText } from '../utils/textProcessor';
import { saveBook, isBookDownloaded, getDirectPdfUrl } from '../utils/bookStorage';
import { saveTrack, getPlayableUrl } from '../utils/audioStorage';
import { useToast } from './ToastContext';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { getRemoteFileSize } from '../utils/network';

// Incremented to force update
const DATA_VERSION = '30'; 
const EVENTS_URL = 'https://github.com/Damodar29/CPBS-DAILY/';

interface DataContextType {
  bhajans: Bhajan[];
  setBhajans: (data: Bhajan[]) => void;
  books: Book[];
  setBooks: (data: Book[]) => void;
  lectures: LectureData[];
  setLectures: (data: LectureData[]) => void;
  events: EventData[];
  setEvents: (data: EventData[]) => void;
  playlists: Playlist[];
  historyItems: HistoryEntry[];
  activeDownloads: Record<string, DownloadItem>;
  isLoading: boolean;
  bookmarks: Record<string, number>;
  
  // Download Modal State
  downloadConfirmation: DownloadConfirmation | null;
  
  // Actions
  fetchEvents: (force?: boolean) => Promise<boolean>;
  createPlaylist: (name: string) => void;
  renamePlaylist: (id: string, newName: string) => void;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (playlistId: string, bhajanId: string) => void;
  removeFromPlaylist: (playlistId: string, bhajanId: string) => void;
  addToHistory: (id: string, type: 'song' | 'book' | 'lecture') => void;
  clearHistory: () => void;
  downloadBook: (book: Book) => void;
  downloadTrack: (track: BhajanAudio, title: string) => void;
  cancelDownload: (id: string) => void;
  importData: (json: string) => boolean;
  resetData: () => void;
  saveBhajanLocally: (id: string, title: string, content: string) => void;
  setBookmark: (bookId: string, pageNum: number) => void;
  removeBookmark: (bookId: string) => void;
  
  // Backup & Restore
  backupUserData: () => Promise<void>;
  restoreUserData: (jsonString: string) => boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // --- Data State ---
  const [bhajans, setBhajans] = useState<Bhajan[]>([]);
  const [books, setBooks] = useState<Book[]>(() => {
    try { return JSON.parse(localStorage.getItem('cpbs_all_books') || '') || BOOKS_DATA; } catch { return BOOKS_DATA; }
  });
  const [lectures, setLectures] = useState<LectureData[]>(() => {
    try { return JSON.parse(localStorage.getItem('cpbs_all_lectures') || '') || LECTURES_DATA; } catch { return LECTURES_DATA; }
  });
  
  // Events: Start empty.
  const [events, setEvents] = useState<EventData[]>([]);

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try { return JSON.parse(localStorage.getItem('cpbs_playlists') || '') || []; } catch { return []; }
  });
  const [historyItems, setHistoryItems] = useState<HistoryEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem('cpbs_history') || '') || []; } catch { return []; }
  });
  const [bookmarks, setBookmarks] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem('cpbs_bookmarks') || '{}'); } catch { return {}; }
  });
  
  const [activeDownloads, setActiveDownloads] = useState<Record<string, DownloadItem>>({});
  const downloadControllers = useRef<Record<string, AbortController>>({});
  
  // Confirmation Modal State
  const [downloadConfirmation, setDownloadConfirmation] = useState<DownloadConfirmation | null>(null);

  // --- Persistence Effects ---
  useEffect(() => localStorage.setItem('cpbs_all_books', JSON.stringify(books)), [books]);
  useEffect(() => localStorage.setItem('cpbs_all_lectures', JSON.stringify(lectures)), [lectures]);
  useEffect(() => localStorage.setItem('cpbs_playlists', JSON.stringify(playlists)), [playlists]);
  useEffect(() => localStorage.setItem('cpbs_history', JSON.stringify(historyItems)), [historyItems]);
  useEffect(() => localStorage.setItem('cpbs_bookmarks', JSON.stringify(bookmarks)), [bookmarks]);

  // Ensure Default Playlist exists
  useEffect(() => {
      const hasFavorites = playlists.some(p => p.isDefault || p.name === 'Favorites');
      if (!hasFavorites && !isLoading) {
          const defaultPl: Playlist = {
              id: 'pl-default-fav',
              name: 'Favorites',
              items: [],
              createdAt: Date.now(),
              isDefault: true
          };
          setPlaylists(prev => [defaultPl, ...prev]);
      }
  }, [playlists, isLoading]);

  // Events Fetch
  const fetchEvents = useCallback(async (force = false) => {
    // Generate a timestamp to bypass browser and CDN caching
    const timestamp = Date.now();
    const urlWithCacheBuster = `${EVENTS_URL}?t=${timestamp}`;

    // Google Drive direct links often fail CORS in browsers. 
    // We iterate through proxies first, then try direct (for native apps).
    const strategies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(urlWithCacheBuster)}`,
        `https://corsproxy.io/?${encodeURIComponent(urlWithCacheBuster)}`,
        urlWithCacheBuster // Fallback: Direct works in Native Android/iOS or if CORS headers change
    ];

    for (const url of strategies) {
        try {
            // Add cache: 'no-store' to ensure the browser strictly goes to the network
            const response = await fetch(url, { cache: 'no-store' });
            
            if (response.ok) {
                const text = await response.text();
                // Validation: Check for minimal object structure or array
                if (text.includes('{') && text.includes('}')) {
                    try {
                        // Safe parsing of JS Object Literal syntax or JSON
                        const func = new Function(`return [${text}];`);
                        const data = func() as EventData[];
                        
                        // Flatten if the file structure is just the object/array directly
                        const flatData = Array.isArray(data[0]) ? data[0] : data;

                        if (Array.isArray(flatData)) {
                            setEvents(flatData);
                            if (force) showToast("Events updated successfully", "success");
                            return true; // Success, stop loop
                        }
                    } catch (parseError) {
                        console.warn("Parse error for", url, parseError);
                    }
                }
            }
        } catch (e) { 
            console.warn(`Fetch strategy failed: ${url}`);
        }
    }
    
    // If all strategies fail
    if (force) {
        showToast("Could not fetch latest events. Check internet.", "error");
    }
    return false;
  }, [showToast]);

  // Initial Load & Version Check
  useEffect(() => {
    const startTime = Date.now();
    const savedVersion = localStorage.getItem('cpbs_data_version');
    
    // Check for Version Update
    if (savedVersion !== DATA_VERSION) {
       // Reset Bhajans to raw data
       const freshBhajans = parseRawBhajanText(RAW_BHAJAN_DATA);
       setBhajans(freshBhajans);
       localStorage.setItem('cpbs_all_bhajans', JSON.stringify(freshBhajans));
       
       // Update version
       localStorage.setItem('cpbs_data_version', DATA_VERSION);
    } else {
        // Load Bhajans from storage or parse if missing
        const savedData = localStorage.getItem('cpbs_all_bhajans');
        if (savedData) {
            try { setBhajans(JSON.parse(savedData)); } catch { setBhajans(parseRawBhajanText(RAW_BHAJAN_DATA)); }
        } else {
            setBhajans(parseRawBhajanText(RAW_BHAJAN_DATA));
        }
    }
    
    const elapsed = Date.now() - startTime;
    setTimeout(() => setIsLoading(false), Math.max(0, 1500 - elapsed));
  }, []);

  // --- Actions ---

  const createPlaylist = (name: string) => {
      const newPlaylist: Playlist = {
          id: `pl-${Date.now()}`,
          name,
          items: [],
          createdAt: Date.now()
      };
      setPlaylists(prev => [...prev, newPlaylist]);
      showToast(`Created playlist: ${name}`, 'success');
  };

  const renamePlaylist = (id: string, newName: string) => {
      setPlaylists(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
      showToast("Playlist renamed", 'success');
  };

  const deletePlaylist = (id: string) => {
      setPlaylists(prev => prev.filter(p => p.id !== id));
      showToast("Playlist deleted", 'info');
  };

  const addToPlaylist = (playlistId: string, bhajanId: string) => {
      setPlaylists(prev => prev.map(p => {
          if (p.id === playlistId && !p.items.includes(bhajanId)) {
              return { ...p, items: [...p.items, bhajanId] };
          }
          return p;
      }));
  };

  const removeFromPlaylist = (playlistId: string, bhajanId: string) => {
      setPlaylists(prev => prev.map(p => {
          if (p.id === playlistId) {
              return { ...p, items: p.items.filter(id => id !== bhajanId) };
          }
          return p;
      }));
  };

  const addToHistory = (id: string, type: 'song' | 'book' | 'lecture') => {
    setHistoryItems(prev => {
      const filtered = prev.filter(item => !(item.id === id && item.type === type));
      return [{ id, type, timestamp: Date.now() }, ...filtered].slice(0, 50);
    });
  };

  const clearHistory = () => {
      setHistoryItems([]);
      showToast("History cleared", "success");
  };

  const setBookmark = (bookId: string, pageNum: number) => {
      setBookmarks(prev => ({ ...prev, [bookId]: pageNum }));
      showToast(`Bookmark saved at page ${pageNum}`, 'success');
  };

  const removeBookmark = (bookId: string) => {
      setBookmarks(prev => {
          const next = { ...prev };
          delete next[bookId];
          return next;
      });
      showToast('Bookmark removed', 'info');
  };

  // --- Download Logic with Pre-Check & Cancel ---

  const downloadBook = async (book: Book) => {
      if (activeDownloads[book.id] !== undefined) return;
      
      showToast("Checking file size...", "info");
      
      const directUrl = getDirectPdfUrl(book.url || book.secondaryUrl || '');
      // Step 1: Fetch Size
      let size = book.sizeBytes || 0;
      if (size === 0) {
          size = await getRemoteFileSize(directUrl);
      }

      // Step 2: Show Confirmation
      setDownloadConfirmation({
          isOpen: true,
          itemTitle: book.title,
          url: directUrl,
          sizeBytes: size,
          type: 'book',
          onCancel: () => setDownloadConfirmation(null),
          onConfirm: () => {
              setDownloadConfirmation(null);
              startBookDownload(book, size);
          }
      });
  };

  const startBookDownload = async (book: Book, knownSize: number) => {
      const controller = new AbortController();
      downloadControllers.current[book.id] = controller;

      setActiveDownloads(prev => ({ ...prev, [book.id]: { progress: 0, loaded: 0, total: knownSize, title: book.title, type: 'book' } }));
      
      // Update: Create a book object with the known size so saveBook doesn't need to fetch it again.
      // Use the old saveBook signature (no 4th argument).
      const bookWithSize = { ...book, sizeBytes: knownSize || book.sizeBytes };

      const success = await saveBook(bookWithSize, (percent, loaded, total) => {
          setActiveDownloads(prev => ({ 
              ...prev, 
              [book.id]: { progress: percent, loaded, total, title: book.title, type: 'book' } 
          }));
      }, controller.signal);

      if (success) showToast(`Downloaded: ${book.title}`, 'success');
      else if (!controller.signal.aborted) showToast(`Failed: ${book.title}`, 'error');
      
      delete downloadControllers.current[book.id];
      setTimeout(() => {
          setActiveDownloads(prev => {
              const newState = { ...prev };
              delete newState[book.id];
              return newState;
          });
      }, 1000);
  };

  const downloadTrack = async (track: BhajanAudio, title: string) => {
      if (activeDownloads[track.id] !== undefined) return;

      showToast("Checking file size...", "info");

      const directUrl = getPlayableUrl(track.url);
      const size = await getRemoteFileSize(directUrl);

      setDownloadConfirmation({
          isOpen: true,
          itemTitle: `${title} (${track.singer})`,
          url: directUrl,
          sizeBytes: size,
          type: 'audio',
          onCancel: () => setDownloadConfirmation(null),
          onConfirm: () => {
              setDownloadConfirmation(null);
              startTrackDownload(track, title, size);
          }
      });
  };

  const startTrackDownload = async (track: BhajanAudio, title: string, knownSize: number) => {
      const controller = new AbortController();
      downloadControllers.current[track.id] = controller;

      setActiveDownloads(prev => ({ ...prev, [track.id]: { progress: 0, loaded: 0, total: knownSize, title: title, type: 'audio' } }));
      
      const success = await saveTrack(track, title, (percent, loaded, total) => {
          setActiveDownloads(prev => ({ 
              ...prev, 
              [track.id]: { progress: percent, loaded, total, title: title, type: 'audio' } 
          }));
      }, controller.signal, knownSize);

      if (success) showToast(`Downloaded: ${title}`, 'success');
      else if (!controller.signal.aborted) showToast(`Download Failed`, 'error');
      
      delete downloadControllers.current[track.id];
      setTimeout(() => {
          setActiveDownloads(prev => {
              const newState = { ...prev };
              delete newState[track.id];
              return newState;
          });
      }, 1000);
  };

  const cancelDownload = (id: string) => {
      if (downloadControllers.current[id]) {
          downloadControllers.current[id].abort();
          delete downloadControllers.current[id];
          
          setActiveDownloads(prev => {
              const newState = { ...prev };
              delete newState[id];
              return newState;
          });
          showToast("Download cancelled", 'info');
      }
  };

  // --- Import / Export (Admin & User Backup) ---

  const importData = (json: string): boolean => {
    try {
        const data = JSON.parse(json);
        
        // 1. Check for User Backup (contains settings, playlists etc)
        if (data.isUserBackup) {
            return restoreUserData(json);
        }

        // 2. Admin Content Patch Logic
        let workingBhajans = [...bhajans]; 
        let updated = false;
        
        if (data.deleted && Array.isArray(data.deleted)) {
            const deletedIds = new Set(data.deleted);
            workingBhajans = workingBhajans.filter(b => !deletedIds.has(b.id));
            updated = true;
        }
        if (data.bhajans && Array.isArray(data.bhajans)) {
            const map = new Map(workingBhajans.map(b => [b.id, b]));
            data.bhajans.forEach((b: Bhajan) => map.set(b.id, b));
            workingBhajans = Array.from(map.values());
            updated = true;
        }
        if (data.added || data.modified) {
             const patchItems = [...(data.added || []), ...(data.modified || [])];
             const map = new Map(workingBhajans.map(b => [b.id, b]));
             patchItems.forEach((b: Bhajan) => map.set(b.id, b));
             workingBhajans = Array.from(map.values());
             updated = true;
        }
        
        if (updated) {
            setBhajans(workingBhajans);
            localStorage.setItem('cpbs_all_bhajans', JSON.stringify(workingBhajans));
        }
        if (data.books) setBooks(data.books);
        if (data.lectures) setLectures(data.lectures);
        if (data.events) {
            setEvents(data.events);
        }
        showToast("Content Imported Successfully", "success");
        return true;
    } catch (e) {
        showToast("Invalid JSON Data", "error");
        return false;
    }
  };

  const backupUserData = async () => {
      try {
          const backup = {
              isUserBackup: true,
              timestamp: Date.now(),
              dateString: new Date().toLocaleDateString(),
              data: {
                  playlists: playlists,
                  bookmarks: bookmarks,
                  // History excluded as requested
                  settings: {
                      fontSize: localStorage.getItem('cpbs_fontsize'),
                      script: localStorage.getItem('cpbs_script'),
                      // darkMode excluded as requested
                      language: localStorage.getItem('cpbs_settings_lang'),
                      scrollSide: localStorage.getItem('cpbs_scrollbar_side'),
                      sliderSide: localStorage.getItem('cpbs_slider_side'),
                      themeColor: localStorage.getItem('cpbs_theme_color'),
                      textBold: localStorage.getItem('cpbs_text_bold'),
                      lineGap: localStorage.getItem('cpbs_line_gap'),
                      viewFormat: localStorage.getItem('cpbs_view_format')
                  },
                  // Also backup personalized songs
                  personalizedSongs: Object.keys(localStorage)
                      .filter(k => k.startsWith('cpbs_personal_'))
                      .reduce((obj, key) => {
                          obj[key] = localStorage.getItem(key);
                          return obj;
                      }, {} as Record<string, string | null>)
              }
          };

          const fileName = `CPBS_Backup_${new Date().toISOString().slice(0, 10)}.json`;
          const jsonString = JSON.stringify(backup, null, 2);

          // Web Environment: Download as Blob
          if (!Capacitor.isNativePlatform()) {
              const blob = new Blob([jsonString], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = fileName;
              a.click();
              URL.revokeObjectURL(url);
              showToast("Backup downloaded", "success");
              return;
          }

          // Native: Save to Filesystem and Share
          await Filesystem.writeFile({
              path: fileName,
              data: jsonString,
              directory: Directory.Cache,
              encoding: Encoding.UTF8
          });

          const uriResult = await Filesystem.getUri({
              directory: Directory.Cache,
              path: fileName,
          });

          await Share.share({
              title: 'Backup CPBS Data',
              text: 'Save this file to Google Drive (Folder: CPBS) to backup your playlists and settings.',
              url: uriResult.uri,
              dialogTitle: 'Backup to Drive',
          });

      } catch (e) {
          console.error("Backup failed", e);
          showToast("Backup failed. See console.", "error");
      }
  };

  const restoreUserData = (jsonString: string): boolean => {
      try {
          const parsed = JSON.parse(jsonString);
          if (!parsed.isUserBackup || !parsed.data) {
              showToast("Invalid Backup File", "error");
              return false;
          }

          const { playlists: restoredPlaylists, settings, personalizedSongs, bookmarks: restoredBookmarks } = parsed.data;

          // Restore Playlists
          if (restoredPlaylists) {
              setPlaylists(restoredPlaylists);
              localStorage.setItem('cpbs_playlists', JSON.stringify(restoredPlaylists));
          }
          
          // Restore Bookmarks
          if (restoredBookmarks) {
              setBookmarks(restoredBookmarks);
              localStorage.setItem('cpbs_bookmarks', JSON.stringify(restoredBookmarks));
          }

          // Restore Settings (Dark mode excluded)
          if (settings) {
              if(settings.fontSize) localStorage.setItem('cpbs_fontsize', settings.fontSize);
              if(settings.script) localStorage.setItem('cpbs_script', settings.script);
              if(settings.language) localStorage.setItem('cpbs_settings_lang', settings.language);
              if(settings.scrollSide) localStorage.setItem('cpbs_scrollbar_side', settings.scrollSide);
              if(settings.sliderSide) localStorage.setItem('cpbs_slider_side', settings.sliderSide);
              if(settings.themeColor) localStorage.setItem('cpbs_theme_color', settings.themeColor);
              if(settings.textBold) localStorage.setItem('cpbs_text_bold', settings.textBold);
              if(settings.lineGap) localStorage.setItem('cpbs_line_gap', settings.lineGap);
              if(settings.viewFormat) localStorage.setItem('cpbs_view_format', settings.viewFormat);
          }

          // Restore Personalized Songs
          if (personalizedSongs) {
              Object.entries(personalizedSongs).forEach(([key, val]) => {
                  if (typeof val === 'string') {
                      localStorage.setItem(key, val);
                  }
              });
          }

          // Force Reload to apply settings context
          if (window.confirm("Restore successful! App needs to restart to apply settings. Restart now?")) {
              window.location.reload();
          } else {
              showToast("Data restored. Restart manually to see theme changes.", "success");
          }
          
          return true;
      } catch (e) {
          console.error(e);
          showToast("Failed to restore data.", "error");
          return false;
      }
  };

  const resetData = () => {
       localStorage.removeItem('cpbs_all_bhajans');
       localStorage.removeItem('cpbs_all_books');
       localStorage.removeItem('cpbs_all_lectures');
       // localStorage.removeItem('cpbs_all_events'); 
       localStorage.removeItem('cpbs_data_version');
       
       const freshBhajans = parseRawBhajanText(RAW_BHAJAN_DATA);
       setBhajans(freshBhajans);
       setBooks(BOOKS_DATA);
       setLectures(LECTURES_DATA);
       setEvents([]); // Clear events
       
       showToast("Data reset successfully", "success");
  };

  const saveBhajanLocally = (id: string, title: string, content: string) => {
      setBhajans(prev => {
          const newBhajans = prev.map(b => b.id === id ? { ...b, title, content } : b);
          localStorage.setItem('cpbs_all_bhajans', JSON.stringify(newBhajans));
          return newBhajans;
      });
      showToast("Saved locally", "success");
  };

  return (
    <DataContext.Provider value={{
      bhajans, setBhajans,
      books, setBooks,
      lectures, setLectures,
      events, setEvents,
      playlists,
      historyItems,
      activeDownloads,
      isLoading,
      bookmarks,
      downloadConfirmation, // Expose modal state
      fetchEvents,
      createPlaylist,
      renamePlaylist,
      deletePlaylist,
      addToPlaylist,
      removeFromPlaylist,
      addToHistory,
      clearHistory,
      downloadBook,
      downloadTrack,
      cancelDownload,
      importData,
      resetData,
      saveBhajanLocally,
      backupUserData,
      restoreUserData,
      setBookmark,
      removeBookmark
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};
