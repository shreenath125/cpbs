import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Book, LectureData, Bhajan, ScriptType, HistoryEntry, Playlist, BhajanAudio } from '../types';
import { HistoryList } from './HistoryList';
import { getSingersList, normalizeSingerName } from '../utils/bhajanClassifier';
import { Music, User, History, Plus, ChevronRight, PlayCircle, Trash2, ListMusic, ChevronDown, ChevronUp, AlertTriangle, CloudUpload, CloudDownload, Pencil, Info, X, Languages } from 'lucide-react';
import { HighlightText } from './HighlightText';
import { useData } from '../context/DataContext';
import { triggerHaptic } from '../utils/haptic';

interface LibraryScreenProps {
  // History Props
  historyItems: HistoryEntry[];
  books: Book[];
  lectures: LectureData[];
  bhajans: Bhajan[];
  onClearHistory: () => void;
  onOpenBook: (book: Book) => void;
  onOpenLecture: (lecture: LectureData) => void;
  onOpenBhajan: (bhajan: Bhajan, contextQueue?: BhajanAudio[], queueName?: string) => void;
  
  // Settings
  script: ScriptType;
  searchQuery: string;
  scrollBarSide?: 'left' | 'right';

  // Playlist Props
  playlists: Playlist[];
  onCreatePlaylist: (name: string) => void;
  onDeletePlaylist: (id: string) => void;
  onRemoveFromPlaylist: (playlistId: string, bhajanId: string) => void;

  // Language
  settingsLanguage: 'en' | 'hi';
  onSettingsLanguageChange: (lang: 'en' | 'hi') => void;
}

type LibraryTab = 'singers' | 'list' | 'history';
type InfoType = 'backup' | 'restore';

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  historyItems, books, lectures, bhajans, onClearHistory, onOpenBook, onOpenLecture, onOpenBhajan,
  script, searchQuery, playlists, onCreatePlaylist, onDeletePlaylist, onRemoveFromPlaylist, scrollBarSide = 'left',
  settingsLanguage, onSettingsLanguageChange
}) => {
  const { backupUserData, restoreUserData, renamePlaylist } = useData();
  const [activeTab, setActiveTab] = useState<LibraryTab>('singers');
  const [animDirection, setAnimDirection] = useState<'left' | 'right' | 'none'>('none');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState<string | null>(null);
  const [playlistToRename, setPlaylistToRename] = useState<Playlist | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [renameInputValue, setRenameInputValue] = useState('');
  const [expandedSinger, setExpandedSinger] = useState<string | null>(null);
  const [viewPlaylistId, setViewPlaylistId] = useState<string | null>(null);
  
  const [activeInfoType, setActiveInfoType] = useState<InfoType | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // History Hooks for Modals
  useEffect(() => {
    if (showCreateModal) {
      const id = `create-pl-${Date.now()}`;
      window.history.pushState({ isPopup: true, modalId: id }, '');
      const handler = () => setShowCreateModal(false);
      window.addEventListener('popstate', handler);
      return () => {
        window.removeEventListener('popstate', handler);
        if(window.history.state?.modalId === id) window.history.back();
      }
    }
  }, [showCreateModal]);

  useEffect(() => {
    if (showRenameModal) {
      const id = `rename-pl-${Date.now()}`;
      window.history.pushState({ isPopup: true, modalId: id }, '');
      const handler = () => setShowRenameModal(false);
      window.addEventListener('popstate', handler);
      return () => {
        window.removeEventListener('popstate', handler);
        if(window.history.state?.modalId === id) window.history.back();
      }
    }
  }, [showRenameModal]);

  useEffect(() => {
    if (playlistToDelete) {
      const id = `del-pl-${Date.now()}`;
      window.history.pushState({ isPopup: true, modalId: id }, '');
      const handler = () => setPlaylistToDelete(null);
      window.addEventListener('popstate', handler);
      return () => {
        window.removeEventListener('popstate', handler);
        if(window.history.state?.modalId === id) window.history.back();
      }
    }
  }, [playlistToDelete]);

  useEffect(() => {
    if (activeInfoType) {
      const id = `info-lib-${Date.now()}`;
      window.history.pushState({ isPopup: true, modalId: id }, '');
      const handler = () => setActiveInfoType(null);
      window.addEventListener('popstate', handler);
      return () => {
        window.removeEventListener('popstate', handler);
        if(window.history.state?.modalId === id) window.history.back();
      }
    }
  }, [activeInfoType]);

  // Translations
  const t = {
    list: settingsLanguage === 'hi' ? 'सूचियां' : 'List',
    singers: settingsLanguage === 'hi' ? 'गायक' : 'Singers',
    history: settingsLanguage === 'hi' ? 'इतिहास' : 'History',
    
    emptyPlaylist: settingsLanguage === 'hi' ? 'खाली प्लेलिस्ट' : 'Empty Playlist',
    createPlaylist: settingsLanguage === 'hi' ? 'नई प्लेलिस्ट बनाएं' : 'Create New Playlist',
    noPlaylists: settingsLanguage === 'hi' ? 'अभी कोई प्लेलिस्ट नहीं है' : 'No playlists yet.',
    songs: settingsLanguage === 'hi' ? 'भजन' : 'Songs',
    bhajans: settingsLanguage === 'hi' ? 'भजन' : 'Bhajans',
    back: settingsLanguage === 'hi' ? 'वापस' : 'Back',
    cancel: settingsLanguage === 'hi' ? 'रद्द करें' : 'Cancel',
    create: settingsLanguage === 'hi' ? 'बनाएं' : 'Create',
    rename: settingsLanguage === 'hi' ? 'नाम बदलें' : 'Rename',
    delete: settingsLanguage === 'hi' ? 'हटाएं' : 'Delete',
    close: settingsLanguage === 'hi' ? 'बंद करें' : 'Close',
    confirm: settingsLanguage === 'hi' ? 'पुष्टि करें?' : 'Confirm?',
    
    backupRestore: settingsLanguage === 'hi' ? 'बैकअप और रिस्टोर' : 'Backup & Restore',
    backupData: settingsLanguage === 'hi' ? 'डेटा बैकअप' : 'Backup Data',
    savePlaylists: settingsLanguage === 'hi' ? 'प्लेलिस्ट और संपादन सहेजें' : 'Save Playlists & Edits',
    restoreData: settingsLanguage === 'hi' ? 'डेटा रिस्टोर' : 'Restore Data',
    importBackup: settingsLanguage === 'hi' ? 'बैकअप फ़ाइल आयात करें' : 'Import Backup File',
    
    newPlaylistTitle: settingsLanguage === 'hi' ? 'नई प्लेलिस्ट' : 'New Playlist',
    playlistNamePlaceholder: settingsLanguage === 'hi' ? 'प्लेलिस्ट का नाम' : 'Playlist Name',
    renamePlaylistTitle: settingsLanguage === 'hi' ? 'प्लेलिस्ट का नाम बदलें' : 'Rename Playlist',
    deletePlaylistTitle: settingsLanguage === 'hi' ? 'प्लेलिस्ट हटाएं?' : 'Delete Playlist?',
    deletePlaylistDesc: settingsLanguage === 'hi' 
        ? 'क्या आप वाकई इस प्लेलिस्ट को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।' 
        : 'Are you sure you want to delete this playlist? This action cannot be undone.',
    
    backupInfoTitle: settingsLanguage === 'hi' ? 'बैकअप जानकारी' : 'Backup Information',
    backupInfoContent: settingsLanguage === 'hi'
        ? "यह सुविधा एक सुरक्षित बैकअप फ़ाइल बनाती है जिसमें शामिल हैं:\n\n• आपकी बनाई गई प्लेलिस्ट\n• ऐप सेटिंग्स\n• आपके द्वारा संपादित/व्यक्तिगत किए गए भजन\n\nफ़ाइल आपके डिवाइस के 'Documents' फ़ोल्डर में सहेजी जाएगी।"
        : "This feature creates a secure backup file containing:\n\n• Your created Playlists\n• App Settings\n• Bhajans you have personalized/edited\n\nThe file will be saved to your device's Documents folder (or prompted to share/save via system dialog).",
    
    restoreInfoTitle: settingsLanguage === 'hi' ? 'रिस्टोर जानकारी' : 'Restore Information',
    restoreInfoContent: settingsLanguage === 'hi'
        ? "अपने डिवाइस स्टोरेज से पहले बनाई गई CPBS बैकअप फ़ाइल (.json) चुनें:\n\n• प्लेलिस्ट और सेटिंग्स\n• आपके व्यक्तिगत/संपादित भजन\n\nनोट: यह डेटा मर्ज करता है, लेकिन यदि बैकअप नया है तो मौजूदा स्थानीय संपादन ओवरराइट हो सकते हैं।"
        : "Select a previously created CPBS Backup file (.json) from your device storage to restore:\n\n• Playlists & Settings\n• Your personalized/edited Bhajans\n\nNote: This merges data, but existing local edits might be overwritten if the backup is newer."
  };

  const getInfoContent = () => {
      if (activeInfoType === 'backup') {
          return { title: t.backupInfoTitle, content: t.backupInfoContent };
      }
      if (activeInfoType === 'restore') {
          return { title: t.restoreInfoTitle, content: t.restoreInfoContent };
      }
      return { title: '', content: '' };
  };

  const touchStart = useRef({ x: 0, y: 0 });
  const touchEnd = useRef({ x: 0, y: 0 });
  const tabs: LibraryTab[] = ['singers', 'list', 'history'];

  const handleTabChange = (tab: LibraryTab) => {
      if (tab === activeTab) return;
      const currentIndex = tabs.indexOf(activeTab);
      const newIndex = tabs.indexOf(tab);
      setAnimDirection(newIndex > currentIndex ? 'right' : 'left');
      setActiveTab(tab);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
      e.stopPropagation();
      touchStart.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
      touchEnd.current = { x: 0, y: 0 };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      e.stopPropagation();
      touchEnd.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
      e.stopPropagation();
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

  // --- SINGERS DATA ---
  const singersList = useMemo(() => getSingersList(bhajans), [bhajans]);
  
  const filteredSingers = useMemo(() => {
      if (!searchQuery) return singersList;
      return singersList.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [singersList, searchQuery]);

  // --- PLAYLIST DATA ---
  const handleCreate = () => {
      if(newPlaylistName.trim()) {
          onCreatePlaylist(newPlaylistName.trim());
          setNewPlaylistName('');
          setShowCreateModal(false);
      }
  };

  const handleRenameClick = (playlist: Playlist) => {
      setPlaylistToRename(playlist);
      setRenameInputValue(playlist.name);
      setShowRenameModal(true);
  };

  const confirmRename = () => {
      if (playlistToRename && renameInputValue.trim()) {
          renamePlaylist(playlistToRename.id, renameInputValue.trim());
          setShowRenameModal(false);
          setPlaylistToRename(null);
      }
  };

  const confirmDelete = () => {
      if (playlistToDelete) {
          onDeletePlaylist(playlistToDelete);
          setPlaylistToDelete(null);
      }
  };

  const activePlaylist = useMemo(() => {
      if (!viewPlaylistId) return null;
      return playlists.find(p => p.id === viewPlaylistId);
  }, [playlists, viewPlaylistId]);

  const getPlaylistTracks = (playlist: Playlist) => {
      const tracks: BhajanAudio[] = [];
      playlist.items.forEach(id => {
          const b = bhajans.find(bh => bh.id === id);
          if (b && b.audio && b.audio.length > 0) {
              const firstTrack = b.audio[0];
              tracks.push({
                  ...firstTrack,
                  bhajanTitle: script === 'iast' ? b.titleIAST : b.title,
                  parentBhajan: b
              });
          }
      });
      return tracks;
  };

  const handleRestoreClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          const content = e.target?.result as string;
          if (content) {
              restoreUserData(content);
          }
      };
      reader.readAsText(file);
      event.target.value = '';
  };

  // --- RENDER CONTENT BASED ON TAB ---

  const renderListTab = () => {
      if (viewPlaylistId && activePlaylist) {
          // Playlist Detail View
          return (
              <div className="min-h-full pb-4">
                  <div dir={scrollBarSide === 'left' ? 'ltr' : undefined}>
                    <div className="sticky top-0 z-10 bg-[#fdfbf7]/95 dark:bg-slate-900/95 backdrop-blur-md p-4 border-b border-[#bc8d31]/30 flex items-center justify-between shadow-sm">
                        <button onClick={() => setViewPlaylistId(null)} className="flex items-center gap-1 text-slate-500 hover:text-[#bc8d31] font-bold text-sm transition-colors">
                            <ChevronRight className="rotate-180" size={18} /> {t.back}
                        </button>
                        <h3 className="font-bold text-xl truncate px-2 text-[#bc8d31]" style={{ fontFamily: '"Kaushan Script", cursive' }}>{activePlaylist.name}</h3>
                        <button 
                            onClick={() => handleRenameClick(activePlaylist)}
                            className="p-2 text-slate-400 hover:text-[#bc8d31] hover:bg-[#bc8d31]/10 rounded-full transition-colors"
                        >
                            <Pencil size={18} />
                        </button>
                    </div>
                    
                    {activePlaylist.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <Music className="w-12 h-12 opacity-20 mb-2 text-[#bc8d31]" />
                            <p>{t.emptyPlaylist}</p>
                        </div>
                    ) : (
                        <div className="p-2 space-y-2">
                            {activePlaylist.items.map((bhajanId, idx) => {
                                const bhajan = bhajans.find(b => b.id === bhajanId);
                                if (!bhajan) return null;
                                return (
                                    <div 
                                      key={bhajanId} 
                                      className="flex items-center justify-between pr-4 group animate-fade-in-up opacity-0 fill-mode-forwards rounded-2xl border border-transparent hover:bg-[#fdfbf7] dark:hover:bg-slate-800 hover:shadow-sm hover:border-[#bc8d31]/20 transition-all"
                                      style={{ animationDelay: `${idx * 40}ms` }}
                                    >
                                        <button 
                                            onClick={() => onOpenBhajan(bhajan, getPlaylistTracks(activePlaylist), activePlaylist.name)}
                                            className="flex-1 text-left p-4"
                                        >
                                            <div className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#bc8d31] transition-colors font-hindi text-lg">
                                                {script === 'iast' ? bhajan.titleIAST : bhajan.title}
                                            </div>
                                        </button>
                                        <DeleteConfirmButton 
                                            onConfirm={() => onRemoveFromPlaylist(activePlaylist.id, bhajan.id)}
                                            confirmText={t.confirm}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                  </div>
              </div>
          );
      }

      // Playlists List View
      return (
          <div className="p-4 pb-4 space-y-4 min-h-full">
              <div dir={scrollBarSide === 'left' ? 'ltr' : undefined}>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="w-full py-4 rounded-xl border-2 border-dashed border-[#bc8d31]/40 text-slate-500 font-bold flex items-center justify-center gap-2 hover:bg-[#bc8d31]/5 dark:hover:bg-slate-800 hover:text-[#bc8d31] hover:border-[#bc8d31] transition-all"
                >
                    <Plus size={20} /> {t.createPlaylist}
                </button>

                <div className="space-y-3 mt-4">
                    {playlists.map((playlist, idx) => (
                        <div 
                            key={playlist.id} 
                            className="bg-[#fdfbf7] dark:bg-slate-800 rounded-2xl shadow-sm border border-[#bc8d31]/20 overflow-hidden flex items-center animate-fade-in-up opacity-0 fill-mode-forwards hover:border-[#bc8d31]/50 hover:shadow-md transition-all group"
                            style={{ animationDelay: `${idx * 50}ms` }}
                        >
                            <button 
                                onClick={() => setViewPlaylistId(playlist.id)}
                                className="flex-1 p-4 flex items-center gap-4 text-left"
                            >
                                <div className="w-12 h-12 bg-[#bc8d31]/10 dark:bg-slate-700 rounded-full flex items-center justify-center text-[#bc8d31] group-hover:scale-110 transition-transform">
                                    <ListMusic size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-[#bc8d31] transition-colors">{playlist.name}</h3>
                                    <p className="text-xs text-slate-500">{playlist.items.length} {t.songs}</p>
                                </div>
                            </button>
                            <div className="px-4">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPlaylistToDelete(playlist.id);
                                    }}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {playlists.length === 0 && (
                        <div className="text-center py-10 text-slate-400">
                            <ListMusic className="w-12 h-12 mx-auto mb-2 opacity-30 text-[#bc8d31]" />
                            <p>{t.noPlaylists}</p>
                        </div>
                    )}
                </div>

                {/* Backup & Restore Section */}
                <div className="mt-8 pt-6 border-t border-[#bc8d31]/20">
                    <h3 className="text-sm font-bold text-[#bc8d31] uppercase tracking-wider mb-3">{t.backupRestore}</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative group">
                            <button 
                                onClick={backupUserData}
                                className="w-full flex flex-col items-center justify-center p-4 bg-[#fdfbf7] dark:bg-slate-800 border border-[#bc8d31]/20 rounded-2xl hover:bg-[#bc8d31]/5 transition-colors shadow-sm gap-2"
                            >
                                <div className="w-10 h-10 bg-[#bc8d31]/10 dark:bg-slate-700 text-[#bc8d31] rounded-full flex items-center justify-center">
                                    <CloudUpload size={20} />
                                </div>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-[#bc8d31] transition-colors">{t.backupData}</span>
                                <span className="text-[9px] text-slate-400 text-center leading-tight">{t.savePlaylists}</span>
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveInfoType('backup');
                                }}
                                className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-[#bc8d31] hover:bg-[#bc8d31]/10 rounded-full transition-colors z-10"
                            >
                                <Info size={14} />
                            </button>
                        </div>

                        <div className="relative group">
                            <button 
                                onClick={handleRestoreClick}
                                className="w-full flex flex-col items-center justify-center p-4 bg-[#fdfbf7] dark:bg-slate-800 border border-[#bc8d31]/20 rounded-2xl hover:bg-[#bc8d31]/5 transition-colors shadow-sm gap-2"
                            >
                                <div className="w-10 h-10 bg-[#bc8d31]/10 dark:bg-slate-700 text-[#bc8d31] rounded-full flex items-center justify-center">
                                    <CloudDownload size={20} />
                                </div>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-[#bc8d31] transition-colors">{t.restoreData}</span>
                                <span className="text-[9px] text-slate-400 text-center leading-tight">{t.importBackup}</span>
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveInfoType('restore');
                                }}
                                className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-[#bc8d31] hover:bg-[#bc8d31]/10 rounded-full transition-colors z-10"
                            >
                                <Info size={14} />
                            </button>
                        </div>
                    </div>
                    {/* Hidden File Input */}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept=".json"
                    />
                </div>
              </div>
          </div>
      );
  };

  const renderSingersTab = () => {
      return (
          <div className="pb-4 p-2 space-y-2">
              <div dir={scrollBarSide === 'left' ? 'ltr' : undefined}>
                {filteredSingers.map((singer, idx) => {
                    const isExpanded = expandedSinger === singer.name;
                    return (
                        <div 
                            key={idx} 
                            className={`rounded-2xl transition-all duration-300 border ${isExpanded ? 'bg-[#fdfbf7] dark:bg-slate-800 border-[#bc8d31]/40 shadow-md' : 'bg-transparent border-transparent hover:bg-[#bc8d31]/5 dark:hover:bg-slate-800'} animate-fade-in-up opacity-0 fill-mode-forwards mb-2`}
                            style={{ animationDelay: `${(idx % 20) * 40}ms` }}
                        >
                            <button 
                                onClick={() => setExpandedSinger(isExpanded ? null : singer.name)}
                                className="w-full flex items-center justify-between p-4 group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-colors ${isExpanded ? 'bg-[#bc8d31]/20 dark:bg-slate-700 text-[#bc8d31] border-[#bc8d31]/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent group-hover:bg-[#bc8d31]/10 group-hover:text-[#bc8d31]'}`}>
                                        <User size={22} />
                                    </div>
                                    <div className="text-left">
                                        <div className={`font-bold transition-colors ${isExpanded ? 'text-[#bc8d31]' : 'text-slate-700 dark:text-slate-200 group-hover:text-[#bc8d31]'}`}>
                                            <HighlightText text={singer.name} highlight={searchQuery} />
                                        </div>
                                        <div className="text-xs text-slate-500">{singer.bhajanIds.length} {t.bhajans}</div>
                                    </div>
                                </div>
                                {isExpanded ? <ChevronUp className="text-[#bc8d31]" /> : <ChevronDown className="text-slate-400 group-hover:text-[#bc8d31]" />}
                            </button>
                            
                            {isExpanded && (
                                <div className="px-4 pb-4 pt-0 animate-fade-in">
                                    <ul className="bg-[#bc8d31]/5 dark:bg-slate-900/50 rounded-xl p-2 space-y-1 border border-[#bc8d31]/20">
                                        {singer.bhajanIds.map((id, sIdx) => {
                                            const b = bhajans.find(bh => bh.id === id);
                                            if (!b) return null;
                                            
                                            const targetTracks = b.audio?.filter(t => normalizeSingerName(t.singer) === singer.name) || [];

                                            return (
                                                <li 
                                                    key={id} 
                                                    className="animate-fade-in-up opacity-0 fill-mode-forwards"
                                                    style={{ animationDelay: `${sIdx * 30}ms` }}
                                                >
                                                    <button 
                                                        onClick={() => onOpenBhajan(b, targetTracks, `Singer: ${singer.name}`)}
                                                        className="w-full text-left py-3 px-3 rounded-lg flex items-center gap-3 hover:bg-[#fdfbf7] dark:hover:bg-slate-800 border border-transparent hover:border-[#bc8d31]/30 hover:shadow-sm transition-all group/item"
                                                    >
                                                        <PlayCircle size={18} className="text-slate-400 group-hover/item:text-[#bc8d31] transition-colors shrink-0" />
                                                        <span className="text-sm font-medium truncate font-hindi text-slate-700 dark:text-slate-300 group-hover/item:text-[#bc8d31] transition-colors">
                                                            {script === 'iast' ? b.titleIAST : b.title}
                                                        </span>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>
                    );
                })}
              </div>
          </div>
      );
  };

  return (
    <div className="flex flex-col h-full bg-[#fdfbf7] dark:bg-slate-950">
      
      {/* Top Tabs */}
      <div className="flex bg-[#fdfbf7]/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-[#bc8d31]/30 sticky top-0 z-20 items-center pr-2">
          <div className="flex-1 flex">
            <TabButton active={activeTab === 'singers'} onClick={() => handleTabChange('singers')} label={t.singers} icon={<User size={18} />} />
            <TabButton active={activeTab === 'list'} onClick={() => handleTabChange('list')} label={t.list} icon={<ListMusic size={18} />} />
            <TabButton active={activeTab === 'history'} onClick={() => handleTabChange('history')} label={t.history} icon={<History size={18} />} />
          </div>
      </div>

      <div 
        className={`flex-1 overflow-y-auto ${scrollBarSide === 'left' ? 'left-scrollbar' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
          <div 
            key={activeTab} 
            className={animDirection === 'right' ? 'animate-slide-in-right' : animDirection === 'left' ? 'animate-slide-in-left' : ''}
          >
            {activeTab === 'list' && renderListTab()}
            {activeTab === 'singers' && renderSingersTab()}
            {activeTab === 'history' && (
                <HistoryList 
                    historyItems={historyItems} 
                    books={books} 
                    lectures={lectures} 
                    bhajans={bhajans}
                    onClearHistory={onClearHistory}
                    onOpenBook={onOpenBook}
                    onOpenLecture={onOpenLecture}
                    onOpenBhajan={onOpenBhajan}
                    script={script}
                    searchQuery={searchQuery}
                    settingsLanguage={settingsLanguage}
                />
            )}
          </div>
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && createPortal(
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-[#fdfbf7] dark:bg-slate-800 w-full max-w-xs landscape:max-w-md rounded-3xl p-6 shadow-2xl border border-[#bc8d31]/30 landscape:max-h-[90vh] overflow-y-auto">
                  <h3 className="text-lg font-bold mb-4 text-[#bc8d31]">{t.newPlaylistTitle}</h3>
                  <input 
                      autoFocus
                      className="w-full p-3 bg-white dark:bg-slate-700 rounded-xl mb-4 border border-[#bc8d31]/40 outline-none focus:ring-2 focus:ring-[#bc8d31]/50 text-slate-800 dark:text-white placeholder:text-slate-400 shadow-inner"
                      placeholder={t.playlistNamePlaceholder}
                      value={newPlaylistName}
                      onChange={e => setNewPlaylistName(e.target.value)}
                  />
                  <div className="flex gap-3">
                      <button onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 text-slate-500 font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 transition-colors">{t.cancel}</button>
                      <button onClick={handleCreate} disabled={!newPlaylistName.trim()} className="flex-1 py-2.5 bg-[#bc8d31] text-white rounded-xl font-bold shadow-md hover:brightness-110 disabled:opacity-50 transition-all">{t.create}</button>
                  </div>
              </div>
          </div>,
          document.body
      )}

      {/* Rename Playlist Modal */}
      {showRenameModal && createPortal(
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-[#fdfbf7] dark:bg-slate-800 w-full max-w-xs landscape:max-w-md rounded-3xl p-6 shadow-2xl border border-[#bc8d31]/30 landscape:max-h-[90vh] overflow-y-auto">
                  <h3 className="text-lg font-bold mb-4 text-[#bc8d31]">{t.renamePlaylistTitle}</h3>
                  <input 
                      autoFocus
                      className="w-full p-3 bg-white dark:bg-slate-700 rounded-xl mb-4 border border-[#bc8d31]/40 outline-none focus:ring-2 focus:ring-[#bc8d31]/50 text-slate-800 dark:text-white placeholder:text-slate-400 shadow-inner"
                      placeholder={t.playlistNamePlaceholder}
                      value={renameInputValue}
                      onChange={e => setRenameInputValue(e.target.value)}
                  />
                  <div className="flex gap-3">
                      <button onClick={() => setShowRenameModal(false)} className="flex-1 py-2.5 text-slate-500 font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 transition-colors">{t.cancel}</button>
                      <button onClick={confirmRename} disabled={!renameInputValue.trim()} className="flex-1 py-2.5 bg-[#bc8d31] text-white rounded-xl font-bold shadow-md hover:brightness-110 disabled:opacity-50 transition-all">{t.rename}</button>
                  </div>
              </div>
          </div>,
          document.body
      )}

      {/* Delete Confirmation Modal (Playlist) */}
      {playlistToDelete && createPortal(
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-[#fdfbf7] dark:bg-slate-800 w-full max-w-xs landscape:max-w-md rounded-3xl p-6 shadow-2xl text-center border border-red-200 dark:border-red-900 landscape:max-h-[90vh] overflow-y-auto">
                  <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-800">
                      <AlertTriangle size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">{t.deletePlaylistTitle}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                      {t.deletePlaylistDesc}
                  </p>
                  <div className="flex gap-3">
                      <button onClick={() => setPlaylistToDelete(null)} className="flex-1 py-3 text-slate-600 dark:text-slate-300 font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 transition-colors">{t.cancel}</button>
                      <button onClick={confirmDelete} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-md transition-colors">{t.delete}</button>
                  </div>
              </div>
          </div>,
          document.body
      )}

      {/* Info Modal */}
      {activeInfoType && createPortal(
          <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
              <div className="bg-[#fdfbf7] dark:bg-slate-800 w-full max-w-xs landscape:max-w-md rounded-3xl p-6 shadow-2xl relative border border-[#bc8d31]/30 animate-in zoom-in-95 landscape:max-h-[90vh] overflow-y-auto">
                  <button 
                      onClick={() => setActiveInfoType(null)}
                      className="absolute top-4 right-4 p-2 text-slate-400 hover:text-[#bc8d31] bg-white dark:bg-slate-700 rounded-full shadow-sm transition-colors"
                  >
                      <X size={18} />
                  </button>
                  <div className="flex flex-col items-center text-center mt-2">
                      <div className="w-14 h-14 bg-[#bc8d31]/10 dark:bg-slate-700 rounded-full flex items-center justify-center text-[#bc8d31] mb-4 border border-[#bc8d31]/20">
                          <Info size={28} />
                      </div>
                      
                      <h3 className="text-xl font-bold text-[#bc8d31] mb-3">
                          {getInfoContent().title}
                      </h3>

                      <button 
                        onClick={() => {
                            triggerHaptic('light');
                            onSettingsLanguageChange(settingsLanguage === 'en' ? 'hi' : 'en');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#bc8d31]/10 dark:bg-slate-700 text-[#bc8d31] hover:bg-[#bc8d31]/20 transition-colors mb-5"
                      >
                        <Languages size={14} />
                        <span className="text-xs font-bold uppercase">{settingsLanguage === 'en' ? 'Switch to Hindi' : 'Switch to English'}</span>
                      </button>

                      <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-left bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-[#bc8d31]/20 shadow-inner w-full">
                          {getInfoContent().content}
                      </div>
                      <button 
                          onClick={() => setActiveInfoType(null)}
                          className="mt-6 w-full py-3 bg-[#bc8d31] hover:brightness-110 text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
                      >
                          {t.close}
                      </button>
                  </div>
              </div>
          </div>,
          document.body
      )}
    </div>
  );
};

// Inline confirmation button for removing songs from playlist
const DeleteConfirmButton: React.FC<{ onConfirm: () => void, confirmText?: string }> = ({ onConfirm, confirmText = 'Confirm?' }) => {
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        if (confirming) {
            const timer = setTimeout(() => setConfirming(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [confirming]);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (confirming) {
            onConfirm();
            setConfirming(false);
        } else {
            setConfirming(true);
        }
    };

    return (
        <button 
            type="button"
            onClick={handleClick}
            className={`p-2 rounded-full transition-all active:scale-95 flex items-center gap-2 ${confirming ? 'bg-red-500 text-white px-3 shadow-md' : 'text-slate-300 hover:text-red-500 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-slate-700'}`}
            title={confirming ? "Click to Confirm Removal" : "Remove from Playlist"}
        >
            {confirming ? (
                <span className="text-xs font-bold whitespace-nowrap">{confirmText}</span>
            ) : (
                <Trash2 size={18} />
            )}
        </button>
    );
};

const TabButton = ({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) => (
    <button 
        onClick={onClick}
        className={`flex-1 py-3.5 flex items-center justify-center gap-2 text-sm font-bold border-b-[3px] transition-all ${active ? 'border-[#bc8d31] text-[#bc8d31] bg-[#bc8d31]/5 dark:bg-slate-800' : 'border-transparent text-slate-400 hover:text-[#bc8d31] hover:bg-[#bc8d31]/5 dark:hover:text-[#bc8d31]'}`}
    >
        {icon} {label}
    </button>
);