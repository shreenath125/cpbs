
import React, { useState, useMemo, useEffect } from 'react';
import { Bhajan, ScriptType, Book, LectureData } from '../types';
import { getDownloadedTrackIds, deleteTrack } from '../utils/audioStorage';
import { getDownloadedBookIds, deleteBook } from '../utils/bookStorage';
import { ArrowLeft, Trash2, Download, PlayCircle, BookOpen, Mic, Music, Search, X, SearchX } from 'lucide-react';
import { BOOKS_DATA } from '../data/books';
import { LECTURES_DATA } from '../data/lectures';
import { calculateSearchScore, calculateBookScore, calculateLectureScore } from '../utils/textProcessor';
import { HighlightText } from './HighlightText';

interface DownloadedListProps {
  allBhajans: Bhajan[];
  onSelect: (item: any) => void; // Generic select
  onBack: () => void;
  script: ScriptType;
  scrollBarSide?: 'left' | 'right';
}

type SubTab = 'bhajans' | 'books' | 'lectures';

export const DownloadedList: React.FC<DownloadedListProps> = ({ allBhajans, onSelect, onBack, script, scrollBarSide = 'left' }) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('bhajans');
  const [downloadedTrackIds, setDownloadedTrackIds] = useState<string[]>([]);
  const [downloadedBookIds, setDownloadedBookIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const refreshData = () => {
      setDownloadedTrackIds(getDownloadedTrackIds());
      setDownloadedBookIds(getDownloadedBookIds());
  };

  useEffect(() => {
    refreshData();
    // Listen for storage events (triggered by delete operations)
    window.addEventListener('storage', refreshData);
    return () => window.removeEventListener('storage', refreshData);
  }, []);

  // Filter Bhajans (Songs)
  const downloadedBhajans = useMemo(() => {
    let list = allBhajans.filter(b => 
        b.audio && b.audio.some(track => downloadedTrackIds.includes(track.id))
    );

    if (searchQuery.trim()) {
        return list
            .map(b => ({ item: b, score: calculateSearchScore(b, searchQuery, script) }))
            .filter(res => res.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(res => res.item);
    }
    return list;
  }, [allBhajans, downloadedTrackIds, searchQuery, script]);

  // Filter Books
  const downloadedBooks = useMemo(() => {
      let sourceBooks = BOOKS_DATA;
      try {
          const storedBooks = localStorage.getItem('cpbs_all_books');
          if (storedBooks) sourceBooks = JSON.parse(storedBooks);
      } catch {}
      
      let list = sourceBooks.filter(b => downloadedBookIds.includes(b.id));

      if (searchQuery.trim()) {
          return list
            .map(b => ({ item: b, score: calculateBookScore(b, searchQuery) }))
            .filter(res => res.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(res => res.item);
      }
      return list;
  }, [downloadedBookIds, searchQuery]);

  // Filter Lectures
  const downloadedLectures = useMemo(() => {
      let sourceLectures = LECTURES_DATA;
      try {
          const storedLectures = localStorage.getItem('cpbs_all_lectures');
          if (storedLectures) sourceLectures = JSON.parse(storedLectures);
      } catch {}

      let list = sourceLectures.filter(l => 
          l.audio && l.audio.some(track => downloadedTrackIds.includes(track.id))
      );

      if (searchQuery.trim()) {
          return list
            .map(l => ({ item: l, score: calculateLectureScore(l, searchQuery) }))
            .filter(res => res.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(res => res.item);
      }
      return list;
  }, [downloadedTrackIds, searchQuery]);

  // --- Handlers ---

  const handleDeleteTrack = async (trackId: string, trackUrl: string) => {
      // Optimistic update: remove immediately from UI
      setDownloadedTrackIds(prev => prev.filter(id => id !== trackId));
      await deleteTrack(trackId, trackUrl);
      // refreshData will ensure sync if anything else changed
      setTimeout(refreshData, 100);
  };

  const handleDeleteBook = async (bookId: string) => {
      // Optimistic update
      setDownloadedBookIds(prev => prev.filter(id => id !== bookId));
      await deleteBook(bookId);
      setTimeout(refreshData, 100);
  };

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
        {/* Header */}
        <div className="flex-none bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-sm border-b border-saffron-100 dark:border-slate-800 p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center gap-4 z-10 sticky top-0">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-slate-200" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Download className="w-6 h-6 text-green-600" /> Downloads
            </h2>
        </div>

        <div className="flex-none p-4 pb-0 space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search downloads..."
                    className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl py-2.5 pl-10 pr-10 border-none outline-none focus:ring-2 focus:ring-saffron-500/50 transition-all placeholder:text-slate-400 shadow-inner"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                {searchQuery && (
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
                <TabButton active={activeSubTab === 'bhajans'} onClick={() => setActiveSubTab('bhajans')} label="Bhajans" icon={<Music size={14} />} />
                <TabButton active={activeSubTab === 'lectures'} onClick={() => setActiveSubTab('lectures')} label="Katha" icon={<Mic size={14} />} />
                <TabButton active={activeSubTab === 'books'} onClick={() => setActiveSubTab('books')} label="Books" icon={<BookOpen size={14} />} />
            </div>
        </div>

        {/* Content List */}
        <div className={`flex-1 overflow-y-auto ${scrollBarSide === 'left' ? 'left-scrollbar' : ''}`}>
            <div dir={scrollBarSide === 'left' ? 'ltr' : undefined} className="p-4 pb-[calc(5rem+env(safe-area-inset-bottom))]">
                
                {/* BHAJANS LIST */}
                {activeSubTab === 'bhajans' && (
                    downloadedBhajans.length === 0 ? (
                        <EmptyState 
                            message={isSearching ? "No matching bhajans" : "No downloaded bhajans"} 
                            sub={isSearching ? "Try a different search term" : "Download songs from the player to listen offline."} 
                            icon={isSearching ? <SearchX className="w-16 h-16 opacity-20 mb-4" /> : undefined}
                        />
                    ) : (
                        <ul className="space-y-3 landscape:grid landscape:grid-cols-2 landscape:gap-4 landscape:space-y-0">
                            {downloadedBhajans.map(bhajan => (
                                <li key={bhajan.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden animate-fade-in-up">
                                    <button 
                                        onClick={() => onSelect(bhajan)}
                                        className="w-full text-left p-4 hover:bg-saffron-50 dark:hover:bg-slate-700/50 transition-colors"
                                    >
                                        <h3 className="font-hindi font-bold text-slate-800 dark:text-slate-200 text-lg leading-tight mb-1">
                                            <HighlightText text={script === 'iast' ? bhajan.titleIAST : bhajan.title} highlight={searchQuery} />
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-medium">
                                            <PlayCircle size={14} /> Available Offline
                                        </div>
                                    </button>
                                    
                                    <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 px-4 py-2">
                                        {bhajan.audio?.filter(t => downloadedTrackIds.includes(t.id)).map(track => (
                                            <div key={track.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate pr-4">
                                                    {track.singer}
                                                </span>
                                                <DeleteButton 
                                                    onConfirm={() => handleDeleteTrack(track.id, track.url)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )
                )}

                {/* LECTURES LIST */}
                {activeSubTab === 'lectures' && (
                    downloadedLectures.length === 0 ? (
                        <EmptyState 
                            message={isSearching ? "No matching katha" : "No downloaded katha"} 
                            sub={isSearching ? "Try a different search term" : "Download audio tracks from the Audio section."} 
                            icon={isSearching ? <SearchX className="w-16 h-16 opacity-20 mb-4" /> : undefined}
                        />
                    ) : (
                        <ul className="space-y-3 landscape:grid landscape:grid-cols-2 landscape:gap-4 landscape:space-y-0">
                            {downloadedLectures.map(lecture => (
                                <li key={lecture.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden animate-fade-in-up">
                                    <button 
                                        onClick={() => onSelect(lecture)}
                                        className="w-full text-left p-4 hover:bg-saffron-50 dark:hover:bg-slate-700/50 transition-colors"
                                    >
                                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg leading-tight mb-1">
                                            <HighlightText text={lecture.title} highlight={searchQuery} />
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-medium">
                                            <Mic size={14} /> Available Offline
                                        </div>
                                    </button>
                                    
                                    <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 px-4 py-2">
                                        {lecture.audio?.filter(t => downloadedTrackIds.includes(t.id)).map(track => (
                                            <div key={track.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate pr-4">
                                                    {track.singer || 'Audio Track'}
                                                </span>
                                                <DeleteButton 
                                                    onConfirm={() => handleDeleteTrack(track.id, track.url)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )
                )}

                {/* BOOKS LIST */}
                {activeSubTab === 'books' && (
                    downloadedBooks.length === 0 ? (
                        <EmptyState 
                            message={isSearching ? "No matching books" : "No downloaded books"} 
                            sub={isSearching ? "Try a different search term" : "Download PDFs from the Books section."} 
                            icon={isSearching ? <SearchX className="w-16 h-16 opacity-20 mb-4" /> : undefined}
                        />
                    ) : (
                        <ul className="space-y-3 landscape:grid landscape:grid-cols-2 landscape:gap-4 landscape:space-y-0">
                            {downloadedBooks.map(book => (
                                <li key={book.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center p-3 gap-3 animate-fade-in-up">
                                    <button 
                                        onClick={() => onSelect(book)}
                                        className="flex-1 flex items-center gap-3 text-left min-w-0"
                                    >
                                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-saffron-600 dark:text-saffron-400 shrink-0">
                                            <BookOpen size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">
                                                <HighlightText text={book.title} highlight={searchQuery} />
                                            </h3>
                                            <p className="text-xs text-slate-400 truncate">
                                                <HighlightText text={book.fileName} highlight={searchQuery} />
                                            </p>
                                        </div>
                                    </button>
                                    <DeleteButton 
                                        onConfirm={() => handleDeleteBook(book.id)}
                                    />
                                </li>
                            ))}
                        </ul>
                    )
                )}

            </div>
        </div>
    </div>
  );
};

// Inline confirmation button to avoid window.confirm issues
const DeleteButton: React.FC<{ onConfirm: () => void }> = ({ onConfirm }) => {
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
            className={`p-2 rounded-full transition-all active:scale-95 flex items-center gap-2 ${confirming ? 'bg-red-500 text-white px-3' : 'text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            title={confirming ? "Click to Confirm Delete" : "Delete"}
        >
            {confirming ? (
                <span className="text-xs font-bold whitespace-nowrap">Confirm?</span>
            ) : (
                <Trash2 size={16} />
            )}
        </button>
    );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string; icon: React.ReactNode }> = ({ active, onClick, label, icon }) => (
    <button 
        onClick={onClick}
        className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${active ? 'bg-white dark:bg-slate-700 text-saffron-600 dark:text-saffron-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
    >
        {icon} {label}
    </button>
);

const EmptyState: React.FC<{ message: string; sub: string; icon?: React.ReactNode }> = ({ message, sub, icon }) => (
    <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 p-8 text-center animate-fade-in-up landscape:col-span-2">
        {icon || <Download className="w-16 h-16 opacity-20 mb-4" />}
        <p className="text-lg font-medium">{message}</p>
        <p className="text-sm opacity-70 mt-2">{sub}</p>
    </div>
);
