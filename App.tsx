
import React, { useState, useEffect, useMemo, useRef, useCallback, Suspense } from 'react';
import { Search, Menu, Settings, X, Loader2 } from 'lucide-react';
import { calculateSearchScore, calculateBookScore, calculateLectureScore } from './utils/textProcessor';
import { Bhajan, AppTab, LectureData, Book, BhajanAudio } from './types';
import { BhajanList } from './components/BhajanList';
// Lazy load heavy components
const BhajanReader = React.lazy(() => import('./components/BhajanReader').then(module => ({ default: module.BhajanReader })));
const BookReader = React.lazy(() => import('./components/BookReader').then(module => ({ default: module.BookReader })));
const SettingsScreen = React.lazy(() => import('./components/SettingsScreen').then(module => ({ default: module.SettingsScreen })));
const AboutScreen = React.lazy(() => import('./components/AboutScreen').then(module => ({ default: module.AboutScreen })));
const DonateScreen = React.lazy(() => import('./components/DonateScreen').then(module => ({ default: module.DonateScreen })));
const DownloadedList = React.lazy(() => import('./components/DownloadedList').then(module => ({ default: module.DownloadedList })));
const DailyQuotes = React.lazy(() => import('./components/DailyQuotes').then(module => ({ default: module.DailyQuotes })));
const EventsScreen = React.lazy(() => import('./components/EventsScreen').then(module => ({ default: module.EventsScreen })));
const DailyDarshanScreen = React.lazy(() => import('./components/DailyDarshanScreen').then(module => ({ default: module.DailyDarshanScreen })));
const SevaCenterScreen = React.lazy(() => import('./components/SevaCenterScreen').then(module => ({ default: module.SevaCenterScreen })));
const CategoryList = React.lazy(() => import('./components/CategoryList').then(module => ({ default: module.CategoryList })));
const QuotePopup = React.lazy(() => import('./components/QuotePopup').then(module => ({ default: module.QuotePopup })));
const LibraryScreen = React.lazy(() => import('./components/LibraryScreen').then(module => ({ default: module.LibraryScreen })));
const PrivacyPolicyScreen = React.lazy(() => import('./components/PrivacyPolicyScreen').then(module => ({ default: module.PrivacyPolicyScreen })));
const DailyInformationScreen = React.lazy(() => import('./components/DailyInformationScreen').then(module => ({ default: module.DailyInformationScreen })));

import { SplashScreen } from './components/SplashScreen';
import { SideMenu } from './components/SideMenu';
import { BottomNav } from './components/BottomNav';
import { BookList } from './components/BookList';
import { LectureList } from './components/LectureList';
import { MiniPlayer } from './components/MiniPlayer';
import { DownloadManager } from './components/DownloadManager';
import { DownloadConfirmModal } from './components/DownloadConfirmModal';
import { QueueManager } from './components/QueueManager';
import { OnboardingScreen } from './components/OnboardingScreen';
import { HomeScreen } from './components/HomeScreen';
import { Header } from './components/Header';
import { AudioProvider, useAudio } from './context/AudioContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { DataProvider, useData } from './context/DataContext';
import { triggerHaptic } from './utils/haptic';
import { isBookDownloaded } from './utils/bookStorage';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app'; 
import { THEME_PALETTES } from './utils/theme';
import { TextZoom } from '@capacitor/text-zoom';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <SettingsProvider>
        <DataProvider>
          <AudioProvider>
            <MainApp />
          </AudioProvider>
        </DataProvider>
      </SettingsProvider>
    </ToastProvider>
  );
};

const MainApp: React.FC = () => {
  const { 
    fontSize, setFontSize, uiScale, setUiScale,
    script, setScript, darkMode, handleThemeChange, themeMode, setThemeMode,
    keepAwake, setKeepAwake, settingsLanguage, setSettingsLanguage, 
    scrollBarSide, setScrollBarSide, azSliderSide, setAzSliderSide, 
    devMode, setDevMode, indexMode, setIndexMode, themeColor, setThemeColor 
  } = useSettings();

  const { 
    bhajans, setBhajans, books, setBooks, lectures, setLectures, events, setEvents, 
    playlists, historyItems, activeDownloads, isLoading, 
    createPlaylist, renamePlaylist, deletePlaylist, addToPlaylist, removeFromPlaylist, 
    addToHistory, clearHistory, downloadBook, downloadTrack, 
    importData, resetData, saveBhajanLocally, downloadConfirmation 
  } = useData();

  const { currentBhajan, closePlayer } = useAudio();
  const { showToast } = useToast(); 

  // --- View State ---
  const [activeTab, setActiveTab] = useState<AppTab>('home'); // Initial tab set to home
  const [tabHistory, setTabHistory] = useState<AppTab[]>(['home']);
  
  const [animDirection, setAnimDirection] = useState<'left' | 'right' | 'none'>('none');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedBhajan, setSelectedBhajan] = useState<Bhajan | null>(null);
  const [selectedContextQueue, setSelectedContextQueue] = useState<BhajanAudio[] | undefined>(undefined);
  const [selectedQueueName, setSelectedQueueName] = useState<string | undefined>(undefined);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isNewBhajan, setIsNewBhajan] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showLandscapeSearch, setShowLandscapeSearch] = useState(false);

  // --- Modals State ---
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isDailyQuotesOpen, setIsDailyQuotesOpen] = useState(false);
  const [isDailyInfoOpen, setIsDailyInfoOpen] = useState(false);
  const [isEventsOpen, setIsEventsOpen] = useState(false);
  const [isDailyDarshanOpen, setIsDailyDarshanOpen] = useState(false);
  const [isSevaCenterOpen, setIsSevaCenterOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [showQuotePopup, setShowQuotePopup] = useState(false);
  
  // Onboarding State - Initialize directly from storage to prevent flash
  const [showOnboarding, setShowOnboarding] = useState(() => {
      try {
          return !localStorage.getItem('cpbs_intro_completed');
      } catch {
          return false;
      }
  });

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);
  
  // Swipe State
  const touchStart = useRef({ x: 0, y: 0 });
  const touchEnd = useRef({ x: 0, y: 0 });

  // Exit Logic Refs
  const exitAttemptRef = useRef(0);
  const exitTimeoutRef = useRef<any>(null);

  // --- SYSTEM CONFIG ---
  useEffect(() => {
    const configureNative = async () => {
      try { await TextZoom.set({ value: 1 }); } catch (e) {}
      if (Capacitor.isNativePlatform()) {
          const configureBackground = () => {
              const bgMode = (window as any).cordova?.plugins?.backgroundMode;
              if (bgMode) {
                  bgMode.setDefaults({
                      title: 'CPBS Bhajans',
                      text: 'Playing in background',
                      silent: false,
                      hidden: false
                  });
              }
          };
          if ((window as any).cordova) {
              configureBackground();
          } else {
              document.addEventListener('deviceready', configureBackground, false);
          }
      }
    };
    configureNative();
  }, []);

  // Tab Definitions - Added 'home'
  const tabs: AppTab[] = useMemo(() => {
      const base: AppTab[] = ['home', 'songs'];
      if (devMode) base.push('authors');
      base.push('lectures', 'books', 'library');
      return base;
  }, [devMode]);

  // Search Debounce
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedQuery(searchQuery); }, 250);
    return () => { clearTimeout(handler); };
  }, [searchQuery]);

  // Quote Popup Check & Preload
  useEffect(() => {
    // Only check if we are NOT in onboarding mode
    if (showOnboarding) return;

    const timer = setTimeout(() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const currentHour = now.getHours();
        const lastSeenDate = localStorage.getItem('cpbs_quote_last_seen_date'); 
        const lastSeenAfternoon = localStorage.getItem('cpbs_quote_last_seen_afternoon'); 

        const shouldShow = (lastSeenDate !== todayStr) || (currentHour >= 16 && lastSeenAfternoon !== todayStr);

        if (shouldShow) {
            // --- Preload Logic ---
            // Replicating DailyQuotes logic here to fetch URL without component overhead
            const getQuoteUrl = () => {
                // Determine day of year for 2024 (Leap)
                const month = now.getMonth();
                const day = now.getDate();
                const leapYearDate = new Date(2024, month, day);
                const start = new Date(2024, 0, 0); 
                const diff = leapYearDate.getTime() - start.getTime();
                const oneDay = 1000 * 60 * 60 * 24;
                const dayOfYear = Math.floor(diff / oneDay);
                const dayOfYearStr = String(dayOfYear).padStart(3, '0');
                
                const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
                const monthStr = months[now.getMonth()];
                
                // Try JPG first as it's most common
                return `https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/1/${dayOfYearStr}.${day}.${monthStr}.JPG`;
            };

            const url = getQuoteUrl();
            const img = new Image();
            img.src = url;
            
            // Only show popup if image successfully loads
            img.onload = () => {
                setShowQuotePopup(true);
                localStorage.setItem('cpbs_quote_last_seen_date', todayStr);
                if (currentHour >= 16) localStorage.setItem('cpbs_quote_last_seen_afternoon', todayStr);
            };
            
            // If JPG fails, we could try PNG, but for simplicity/performance in background,
            // we skip showing it to avoid bad UX. User can view in DailyQuotes section manually.
            img.onerror = () => {
                console.log("Quote image failed to preload, skipping popup.");
            };
        }
    }, 2000);
    return () => clearTimeout(timer);
  }, [showOnboarding]);

  // Status Bar Sync
  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const primaryColor = THEME_PALETTES[themeColor]['500'];

    if (selectedBhajan) {
       const readerBg = darkMode ? '#0f172a' : '#fdfbf7';
       if (metaThemeColor) metaThemeColor.setAttribute('content', readerBg);
       if (Capacitor.isNativePlatform()) {
         StatusBar.setBackgroundColor({ color: readerBg }).catch(() => {});
         const style = darkMode ? Style.Dark : Style.Light;
         StatusBar.setStyle({ style }).catch(() => {});
       }
    } else {
       if (metaThemeColor) metaThemeColor.setAttribute('content', primaryColor);
       if (Capacitor.isNativePlatform()) {
         StatusBar.setBackgroundColor({ color: primaryColor }).catch(() => {});
         StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
       }
    }
  }, [darkMode, selectedBhajan, themeColor]);

  // Back Button Logic
  const stateRef = useRef({ 
    hasSelectedBhajan: !!selectedBhajan, 
    hasSelectedBook: !!selectedBook, 
    isSettingsOpen, isAboutOpen, isDonateOpen, isSideMenuOpen, 
    isSearchFocused, searchQuery,
    isDailyQuotesOpen, isDailyInfoOpen, isEventsOpen, isDailyDarshanOpen, isSevaCenterOpen, isPrivacyOpen, 
    showQuotePopup, activeTab, showLandscapeSearch,
    tabHistory, showOnboarding
  });

  useEffect(() => {
    stateRef.current = { 
      hasSelectedBhajan: !!selectedBhajan, 
      hasSelectedBook: !!selectedBook, 
      isSettingsOpen, isAboutOpen, isDonateOpen, isSideMenuOpen, 
      isSearchFocused, searchQuery,
      activeTab, isDailyQuotesOpen, isDailyInfoOpen, isEventsOpen, isDailyDarshanOpen, isSevaCenterOpen, isPrivacyOpen, 
      showQuotePopup, showLandscapeSearch,
      tabHistory, showOnboarding
    };
  }, [selectedBhajan, selectedBook, isSettingsOpen, isAboutOpen, isDonateOpen, isSideMenuOpen, isSearchFocused, searchQuery, activeTab, isDailyQuotesOpen, isDailyInfoOpen, isEventsOpen, isDailyDarshanOpen, isSevaCenterOpen, isPrivacyOpen, showQuotePopup, showLandscapeSearch, tabHistory, showOnboarding]);

  const closeTopmostView = useCallback(() => {
      const { 
        hasSelectedBhajan, hasSelectedBook, isSettingsOpen, isAboutOpen, isDonateOpen, 
        isSideMenuOpen, isSearchFocused, searchQuery, 
        isDailyQuotesOpen, isDailyInfoOpen, isEventsOpen, isDailyDarshanOpen, isSevaCenterOpen, isPrivacyOpen, 
        showQuotePopup, showLandscapeSearch, tabHistory, showOnboarding 
      } = stateRef.current;
      
      // Onboarding blocks back button unless completed
      if (showOnboarding) return true;

      if (showLandscapeSearch) { setShowLandscapeSearch(false); return true; }
      if (showQuotePopup) { setShowQuotePopup(false); return true; }
      if (hasSelectedBhajan) { setSelectedBhajan(null); setSelectedContextQueue(undefined); setIsNewBhajan(false); return true; } 
      if (hasSelectedBook) { setSelectedBook(null); return true; }
      if (isDailyQuotesOpen) { setIsDailyQuotesOpen(false); return true; }
      if (isDailyInfoOpen) { setIsDailyInfoOpen(false); return true; }
      if (isDailyDarshanOpen) { 
          if (window.history.state?.view === 'darshan-image') return false; 
          setIsDailyDarshanOpen(false); 
          return true; 
      }
      if (isSevaCenterOpen) { setIsSevaCenterOpen(false); return true; }
      if (isPrivacyOpen) { setIsPrivacyOpen(false); return true; }
      if (isEventsOpen) { setIsEventsOpen(false); return true; }
      if (isDonateOpen) { 
          if (window.history.state?.internalNavigate) {
              window.history.back();
              return true;
          }
          setIsDonateOpen(false); 
          return true; 
      } 
      if (isSettingsOpen) { setIsSettingsOpen(false); return true; } 
      if (isAboutOpen) { setIsAboutOpen(false); return true; } 
      if (isSideMenuOpen) { setIsSideMenuOpen(false); return true; } 
      
      if (searchQuery.trim().length > 0 || isSearchFocused) {
          setSearchQuery('');
          setIsSearchFocused(false);
          if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
          }
          return true;
      }

      if (tabHistory.length > 1) {
          const newHistory = [...tabHistory];
          newHistory.pop(); 
          const prevTab = newHistory[newHistory.length - 1];
          setTabHistory(newHistory);
          setActiveTab(prevTab);
          setAnimDirection('left'); 
          return true;
      }

      return false;
  }, []);

  useEffect(() => {
    try { window.history.replaceState({ view: 'root' }, ''); } catch (e) {}
    
    const backButtonListener = CapApp.addListener('backButton', ({ canGoBack }) => {
        // Priority 1: Handle history-based popups (Modals)
        if (window.history.state?.isPopup) {
            window.history.back();
            return;
        }

        const handledInternally = closeTopmostView();
        if (handledInternally) {
            exitAttemptRef.current = 0;
            return;
        }
        exitAttemptRef.current += 1;
        if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
        exitTimeoutRef.current = setTimeout(() => {
            exitAttemptRef.current = 0;
        }, 2500);

        if (exitAttemptRef.current === 2) {
            showToast(
              settingsLanguage === 'hi' ? "बाहर निकलने के लिए फिर से दबाएं" : "Press back again to exit"
            );
        } else if (exitAttemptRef.current >= 3) {
            closePlayer();
            setTimeout(() => { CapApp.exitApp(); }, 100);
        }
    });

    return () => {
        backButtonListener.then(handler => handler.remove());
    };
  }, [closeTopmostView, settingsLanguage, showToast, closePlayer]);

  const goBack = useCallback(() => { closeTopmostView(); }, [closeTopmostView]);

  const handleTabChange = (tab: AppTab) => {
      if (tab === activeTab) return;
      
      // Clear search when switching tabs
      setSearchQuery('');
      setIsSearchFocused(false);

      const currentIndex = tabs.indexOf(activeTab);
      const newIndex = tabs.indexOf(tab);
      setAnimDirection(newIndex > currentIndex ? 'right' : 'left');
      setActiveTab(tab);
      setTabHistory(prev => [...prev, tab]);
      if (mainScrollRef.current) mainScrollRef.current.scrollTop = 0;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
      touchStart.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
      touchEnd.current = { x: 0, y: 0 };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      touchEnd.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
      if (touchEnd.current.x === 0 && touchEnd.current.y === 0) return;
      const dx = touchStart.current.x - touchEnd.current.x;
      const dy = touchStart.current.y - touchEnd.current.y;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
          const currentIndex = tabs.indexOf(activeTab);
          if (dx > 0) {
              if (currentIndex < tabs.length - 1) handleTabChange(tabs[currentIndex + 1]);
          } else {
              if (currentIndex > 0) handleTabChange(tabs[currentIndex - 1]);
          }
      }
      touchStart.current = { x: 0, y: 0 };
      touchEnd.current = { x: 0, y: 0 };
  };

  const handleOpenReader = (bhajan: Bhajan, contextQueue?: BhajanAudio[], queueName?: string) => {
    triggerHaptic('medium');
    window.history.pushState({ view: 'reader' }, '');
    if (mainScrollRef.current) scrollPositionRef.current = mainScrollRef.current.scrollTop;
    addToHistory(bhajan.id, 'song');
    setSelectedBhajan(bhajan);
    setSelectedContextQueue(contextQueue);
    setSelectedQueueName(queueName);
    setIsNewBhajan(false);
    setIsSearchFocused(false);
  };

  const handleOpenLecture = (lecture: LectureData, targetTrack?: BhajanAudio) => {
      triggerHaptic('medium');
      const existingBhajan = bhajans.find(b => b.id === lecture.id);
      if (existingBhajan) { 
          let queue = undefined;
          if (targetTrack && existingBhajan.audio) {
               const idx = existingBhajan.audio.findIndex(t => t.id === targetTrack.id);
               if (idx !== -1) {
                   queue = [...existingBhajan.audio.slice(idx), ...existingBhajan.audio.slice(0, idx)];
               }
          }
          handleOpenReader(existingBhajan, queue, lecture.title); 
          return; 
      }
      window.history.pushState({ view: 'lecture' }, '');
      addToHistory(lecture.id, 'lecture');
      let queue = undefined;
      if (targetTrack && lecture.audio) {
           const idx = lecture.audio.findIndex(t => t.id === targetTrack.id);
           if (idx !== -1) {
               const rawQueue = [...lecture.audio.slice(idx), ...lecture.audio.slice(0, idx)];
               queue = rawQueue.map(t => ({ ...t, bhajanTitle: lecture.title, parentBhajan: undefined }));
           }
      } else if (lecture.audio && lecture.audio.length > 0) {
           queue = lecture.audio.map(t => ({ ...t, bhajanTitle: lecture.title, parentBhajan: undefined }));
      }
      setSelectedBhajan({
          id: lecture.id, title: lecture.title, titleIAST: lecture.title,
          firstLine: lecture.description.substring(0, 30), firstLineIAST: lecture.description.substring(0, 30),
          content: lecture.description, contentIAST: lecture.description, searchIndex: '', searchTokens: [],
          audio: lecture.audio, author: lecture.date ? `Date: ${lecture.date}` : undefined,
      });
      setSelectedContextQueue(queue); 
      setSelectedQueueName(lecture.title);
  };

  const handleOpenBook = (book: Book) => {
      triggerHaptic('medium');
      window.history.pushState({ view: 'book' }, '');
      addToHistory(book.id, 'book');
      if (book.url) setSelectedBook(book);
  };

  const handleDownloadedItemSelect = (item: any) => {
      if (item.fileName) { handleOpenBook(item as Book); } 
      else if (item.description && item.date) { handleOpenLecture(item as LectureData); } 
      else { handleOpenReader(item as Bhajan); }
  };

  const getNextBhajanId = () => {
      const maxId = bhajans.reduce((max, b) => {
          const match = b.id.match(/(\d+)/);
          const num = match ? parseInt(match[0], 10) : 0;
          return !isNaN(num) && num > max ? num : max;
      }, 0);
      return `bhajan-${maxId + 1}`;
  };

  const handleAddBhajan = () => {
      window.history.pushState({ view: 'reader' }, '');
      setIsNewBhajan(true); 
      setSelectedBhajan({ 
          id: getNextBhajanId(), title: 'New', titleIAST: 'New', content: '', contentIAST: '', 
          firstLine: '', firstLineIAST: '', searchIndex: '', searchTokens: [] 
      }); 
      setSelectedContextQueue(undefined);
      setSelectedQueueName(undefined);
  };

  const filteredBhajans = useMemo(() => {
    if (!debouncedQuery.trim()) return bhajans;
    return bhajans.map(b => ({ bhajan: b, score: calculateSearchScore(b, debouncedQuery, script) }))
      .filter(item => item.score > 0).sort((a, b) => b.score - a.score).map(m => m.bhajan);
  }, [bhajans, debouncedQuery, script]);

  const filteredBooks = useMemo(() => {
    if (!debouncedQuery.trim()) return books;
    return books.map(b => ({ book: b, score: calculateBookScore(b, debouncedQuery) }))
      .filter(item => item.score > 0).sort((a, b) => b.score - a.score).map(item => item.book);
  }, [debouncedQuery, books]);

  const { filteredKatha, filteredKirtan } = useMemo(() => {
    const audioBhajans = bhajans.filter(b => b.audio && b.audio.length > 0).map(b => ({
        id: b.id, title: script === 'iast' ? b.titleIAST : b.title,
        description: script === 'iast' ? b.contentIAST : b.content, date: 'Kirtan', audio: b.audio
    }));
    if (!debouncedQuery.trim()) return { filteredKatha: lectures, filteredKirtan: audioBhajans };
    const scoreAndSort = (items: LectureData[]) => items.map(l => ({ lecture: l, score: calculateLectureScore(l, debouncedQuery) }))
      .filter(item => item.score > 0).sort((a, b) => b.score - a.score).map(item => item.lecture);
    return { filteredKatha: scoreAndSort(lectures), filteredKirtan: scoreAndSort(audioBhajans) };
  }, [debouncedQuery, bhajans, lectures, script]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('cpbs_intro_completed', 'true');
    setShowOnboarding(false);
  };

  if (isLoading) return <SplashScreen />;

  const LoadingFallback = () => (
    <div className="fixed inset-0 z-[60] bg-paper dark:bg-slate-900 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-saffron-500 animate-spin" />
    </div>
  );

  const searchPlaceholder = settingsLanguage === 'hi' ? 'खोजें (Hinglish)..' : 'Search (Hinglish)...';

  return (
    <div className="flex flex-col h-[100dvh] bg-paper dark:bg-slate-950 overflow-hidden transition-colors duration-500 relative">
      {/* Global Background Theme */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          <img src="/background.png" alt="" className="w-full h-full object-cover opacity-40 dark:opacity-20" />
      </div>

      {!selectedBhajan && currentBhajan && <MiniPlayer onExpand={() => handleOpenReader(currentBhajan)} />}
      
      <DownloadManager />
      <QueueManager />
      <DownloadConfirmModal confirmation={downloadConfirmation} />

      <SideMenu 
        isOpen={isSideMenuOpen} onClose={goBack} 
        onOpenAbout={() => { window.history.replaceState({ view: 'about' }, ''); setIsAboutOpen(true); setIsSideMenuOpen(false); }} 
        onOpenDonate={() => { window.history.replaceState({ view: 'donate' }, ''); setIsDonateOpen(true); setIsSideMenuOpen(false); }}
        onHome={() => { setTabHistory(['home']); setActiveTab('home'); goBack(); }}
        onOpenDownloaded={() => { window.history.replaceState({ view: 'downloaded' }, ''); handleTabChange('downloaded'); setIsSideMenuOpen(false); }}
        onOpenDailyQuotes={() => { window.history.replaceState({ view: 'quotes' }, ''); setIsDailyQuotesOpen(true); setIsSideMenuOpen(false); }}
        onOpenDailyInfo={() => { window.history.replaceState({ view: 'info' }, ''); setIsDailyInfoOpen(true); setIsSideMenuOpen(false); }}
        onOpenEvents={() => { window.history.replaceState({ view: 'events' }, ''); setIsEventsOpen(true); setIsSideMenuOpen(false); }}
        onOpenDailyDarshan={() => { window.history.replaceState({ view: 'darshan' }, ''); setIsDailyDarshanOpen(true); setIsSideMenuOpen(false); }}
        onOpenSevaCenter={() => { window.history.replaceState({ view: 'seva' }, ''); setIsSevaCenterOpen(true); setIsSideMenuOpen(false); }}
        onOpenPrivacy={() => { window.history.replaceState({ view: 'privacy' }, ''); setIsPrivacyOpen(true); setIsSideMenuOpen(false); }}
        onOpenOnboarding={() => { window.history.replaceState({ view: 'onboarding' }, ''); setShowOnboarding(true); setIsSideMenuOpen(false); }}
        scrollBarSide={scrollBarSide} settingsLanguage={settingsLanguage}
      />

      <Suspense fallback={<LoadingFallback />}>
        {showOnboarding && (
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        )}

        {isSettingsOpen && (
          <SettingsScreen 
            isOpen={isSettingsOpen} onClose={goBack} 
            uiScale={uiScale} onUiScaleChange={setUiScale}
            script={script} onScriptChange={setScript} darkMode={darkMode} onThemeChange={handleThemeChange}
            themeMode={themeMode} onThemeModeChange={setThemeMode}
            keepAwake={keepAwake} onKeepAwakeChange={setKeepAwake} settingsLanguage={settingsLanguage}
            onSettingsLanguageChange={setSettingsLanguage} scrollBarSide={scrollBarSide} onScrollBarSideChange={setScrollBarSide}
            azSliderSide={azSliderSide} onAzSliderSideChange={setAzSliderSide} indexMode={indexMode}
            themeColor={themeColor} onThemeColorChange={setThemeColor}
            devMode={devMode} onDevModeChange={setDevMode} onResetData={resetData} allBhajans={bhajans}
            onImportData={importData} onAddBhajan={handleAddBhajan}
            books={books} lectures={lectures} events={events}
            onUpdateBhajans={setBhajans} onUpdateBooks={setBooks}
            onUpdateLectures={setLectures} onUpdateEvents={setEvents}
          />
        )}
        
        {isAboutOpen && <AboutScreen isOpen={isAboutOpen} onClose={goBack} onOpenDonate={() => { window.history.replaceState({ view: 'donate' }, ''); setIsDonateOpen(true); setIsAboutOpen(false); }} onOpenSevaCenter={() => { window.history.replaceState({ view: 'seva' }, ''); setIsSevaCenterOpen(true); setIsAboutOpen(false); }} settingsLanguage={settingsLanguage} />}
        {isDonateOpen && <DonateScreen isOpen={isDonateOpen} onClose={goBack} settingsLanguage={settingsLanguage} />}
        {isDailyQuotesOpen && <DailyQuotes onBack={goBack} scrollBarSide={scrollBarSide} devMode={devMode} />}
        {isDailyInfoOpen && <DailyInformationScreen onBack={goBack} scrollBarSide={scrollBarSide} settingsLanguage={settingsLanguage} />}
        {isEventsOpen && <EventsScreen onBack={goBack} scrollBarSide={scrollBarSide} settingsLanguage={settingsLanguage} events={events} />}
        {isDailyDarshanOpen && <DailyDarshanScreen onBack={goBack} scrollBarSide={scrollBarSide} />}
        {isSevaCenterOpen && <SevaCenterScreen onBack={goBack} scrollBarSide={scrollBarSide} settingsLanguage={settingsLanguage} onOpenDonate={() => { window.history.replaceState({ view: 'donate' }, ''); setIsDonateOpen(true); setIsSevaCenterOpen(false); }} />}
        {isPrivacyOpen && <PrivacyPolicyScreen onBack={goBack} scrollBarSide={scrollBarSide} settingsLanguage={settingsLanguage} />}
        
        {showQuotePopup && <QuotePopup onClose={() => setShowQuotePopup(false)} onOpenFull={() => { window.history.pushState({ view: 'quotes' }, ''); setShowQuotePopup(false); setIsDailyQuotesOpen(true); }} />}

        {selectedBhajan && (
          <BhajanReader
            bhajan={selectedBhajan} onBack={goBack} fontSize={fontSize} onChangeFontSize={setFontSize}
            searchQuery={debouncedQuery} script={script} darkMode={darkMode} onToggleTheme={() => handleThemeChange(!darkMode)}
            keepAwake={keepAwake} devMode={devMode} scrollBarSide={scrollBarSide}
            onSave={saveBhajanLocally} autoEdit={isNewBhajan} activeDownloads={activeDownloads}
            onDownloadTrack={downloadTrack}
            playlists={playlists} 
            onAddToPlaylist={addToPlaylist}
            onRemoveFromPlaylist={removeFromPlaylist}
            onCreatePlaylist={createPlaylist}
            contextQueue={selectedContextQueue}
            queueName={selectedQueueName} 
            settingsLanguage={settingsLanguage}
          />
        )}

        {selectedBook && <BookReader book={selectedBook} onBack={goBack} scrollBarSide={scrollBarSide} />}

        {activeTab === 'downloaded' && (
            <div className="fixed inset-0 z-40 bg-white dark:bg-slate-900 animate-slide-in-bottom">
                <DownloadedList allBhajans={bhajans} onSelect={handleDownloadedItemSelect} onBack={goBack} script={script} scrollBarSide={scrollBarSide} />
            </div>
        )}
      </Suspense>

      <Header 
        onOpenMenu={() => { window.history.pushState({ view: 'menu' }, ''); setIsSideMenuOpen(true); }}
        onOpenSettings={() => { window.history.pushState({ view: 'settings' }, ''); setIsSettingsOpen(true); }}
      />

      {showLandscapeSearch && (
        <div className="fixed top-2 left-20 right-20 z-40 bg-white/95 dark:bg-slate-800/95 p-2 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-slate-200 dark:border-slate-700">
            <Search className="text-slate-400 ml-2" size={20} />
            <input 
              autoFocus
              className="flex-1 bg-transparent outline-none py-2 text-slate-900 dark:text-white"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => { if(!searchQuery) setShowLandscapeSearch(false); }}
            />
            <button onClick={() => setShowLandscapeSearch(false)} className="p-2 text-slate-400 hover:text-red-500">
               <X size={20} />
            </button>
        </div>
      )}

      <main 
        ref={mainScrollRef}
        className={`relative z-10 flex-1 overflow-y-auto w-full max-w-3xl mx-auto scroll-container pt-[calc(4rem+env(safe-area-inset-top))] pb-[calc(6rem+env(safe-area-inset-bottom))] landscape:pt-[env(safe-area-inset-top)] landscape:pb-[env(safe-area-inset-bottom)] landscape:pl-[calc(4rem+env(safe-area-inset-left))] landscape:pr-[calc(5rem+env(safe-area-inset-right))] landscape:max-w-none ${scrollBarSide === 'left' ? 'left-scrollbar' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
         <div 
            dir={scrollBarSide === 'left' ? 'ltr' : undefined} 
            className={`min-h-full ${animDirection === 'right' ? 'animate-slide-in-right' : animDirection === 'left' ? 'animate-slide-in-left' : ''}`}
            key={activeTab}
         >
             {activeTab === 'home' && (
               <HomeScreen
                  onOpenDailyQuotes={() => { window.history.pushState({ view: 'quotes' }, ''); setIsDailyQuotesOpen(true); }}
                  onOpenDailyInfo={() => { window.history.pushState({ view: 'info' }, ''); setIsDailyInfoOpen(true); }}
                  onOpenEvents={() => { window.history.pushState({ view: 'events' }, ''); setIsEventsOpen(true); }}
                  onOpenDailyDarshan={() => { window.history.pushState({ view: 'darshan' }, ''); setIsDailyDarshanOpen(true); }}
                  onOpenSevaCenter={() => { window.history.replaceState({ view: 'seva' }, ''); setIsSevaCenterOpen(true); }}
                  onOpenDonate={() => { window.history.replaceState({ view: 'donate' }, ''); setIsDonateOpen(true); }}
                  onOpenBhajanList={() => handleTabChange('songs')}
                  onOpenAbout={() => { window.history.replaceState({ view: 'about' }, ''); setIsAboutOpen(true); }}
                  onOpenOnboarding={() => { window.history.replaceState({ view: 'onboarding' }, ''); setShowOnboarding(true); }}
                  settingsLanguage={settingsLanguage}
               />
             )}
             {activeTab === 'songs' && <BhajanList 
                bhajans={filteredBhajans} 
                onSelect={(b) => handleOpenReader(b, undefined, 'Song List')} 
                searchQuery={debouncedQuery} 
                script={script} 
                indexMode={indexMode} 
                onIndexModeChange={setIndexMode} 
                azSliderSide={azSliderSide} 
                playlists={playlists}
                onCreatePlaylist={createPlaylist}
                scrollBarSide={scrollBarSide}
                settingsLanguage={settingsLanguage}
                onSettingsLanguageChange={setSettingsLanguage}
             />}
             <Suspense fallback={<div className="p-10 flex justify-center"><Loader2 className="animate-spin text-saffron-500"/></div>}>
                {activeTab === 'authors' && <CategoryList bhajans={filteredBhajans} onSelect={(b) => handleOpenReader(b, undefined, 'Authors List')} script={script} />}
                {activeTab === 'books' && <BookList books={filteredBooks} onSelect={handleOpenBook} searchQuery={debouncedQuery} activeDownloads={activeDownloads} onDownload={downloadBook} settingsLanguage={settingsLanguage} />}
                {activeTab === 'lectures' && <LectureList katha={filteredKatha} kirtan={filteredKirtan} onSelect={handleOpenLecture} searchQuery={debouncedQuery} activeDownloads={activeDownloads} onDownloadTrack={downloadTrack} settingsLanguage={settingsLanguage} />}
                {activeTab === 'library' && (
                    <LibraryScreen 
                      historyItems={historyItems} books={books} lectures={lectures} bhajans={bhajans}
                      onClearHistory={clearHistory} onOpenBook={handleOpenBook} onOpenLecture={handleOpenLecture}
                      onOpenBhajan={handleOpenReader} script={script} searchQuery={debouncedQuery}
                      playlists={playlists} onCreatePlaylist={createPlaylist} onDeletePlaylist={deletePlaylist}
                      onRemoveFromPlaylist={removeFromPlaylist}
                      scrollBarSide={scrollBarSide}
                      settingsLanguage={settingsLanguage}
                      onSettingsLanguageChange={setSettingsLanguage}
                    />
                )}
             </Suspense>
         </div>
      </main>

      <BottomNav activeTab={activeTab === 'downloaded' ? 'songs' : activeTab} onTabChange={handleTabChange} devMode={devMode} settingsLanguage={settingsLanguage} />
    </div>
  );
};
