import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bhajan, ScriptType, BhajanCategory, Playlist } from '../types';
import { ChevronRight, Music, Filter, Flame, CloudRain, Bell, Book, Gift, X, Check, Sun, Moon, Plus, ListMusic, Languages } from 'lucide-react';
import { HighlightText } from './HighlightText';
import { AzSlider } from './AzSlider';
import { getMatchingSnippet, getDevanagariBaseChar } from '../utils/textProcessor';
import { getBhajanCategory, MORNING_SONG_NUMBERS, EVENING_SONG_NUMBERS } from '../utils/bhajanClassifier';
import { triggerHaptic } from '../utils/haptic';

interface BhajanListProps {
  bhajans: Bhajan[];
  onSelect: (bhajan: Bhajan) => void;
  searchQuery: string;
  script: ScriptType;
  indexMode: 'latin' | 'devanagari';
  onIndexModeChange: (mode: 'latin' | 'devanagari') => void;
  azSliderSide: 'left' | 'right';
  playlists: Playlist[];
  onCreatePlaylist: (name: string) => void;
  scrollBarSide?: 'left' | 'right';
  settingsLanguage?: 'en' | 'hi';
  onSettingsLanguageChange?: (lang: 'en' | 'hi') => void;
}

// ----------------------------------------------------------------------
// Memoized List Item to prevent re-renders of the whole list
// ----------------------------------------------------------------------
const BhajanItem = React.memo(({ 
  bhajan, 
  script, 
  searchQuery, 
  onSelect 
}: { 
  bhajan: Bhajan, 
  script: ScriptType, 
  searchQuery: string, 
  onSelect: (b: Bhajan) => void 
}) => {
  const displayTitle = script === 'iast' ? bhajan.titleIAST : bhajan.title;
  const matchedSnippet = getMatchingSnippet(bhajan, searchQuery, script);
  const isContentMatch = !!matchedSnippet;
  const subtitle = matchedSnippet || (script === 'iast' ? bhajan.firstLineIAST : bhajan.firstLine);
  const authorName = bhajan.author && (script === 'iast' ? (bhajan.authorIAST || bhajan.author) : bhajan.author);

  const handleClick = () => {
    triggerHaptic('medium');
    onSelect(bhajan);
  };

  return (
    <div className="animate-fade-in-up">
      <button
        onClick={handleClick}
        // Updated to Cream/Gold card styling
        className="w-full text-left p-5 bg-[#fdfbf7] dark:bg-slate-800 rounded-2xl shadow-sm border border-[#bc8d31]/20 active:scale-[0.98] transition-all duration-200 flex items-center gap-4 group hover:border-[#bc8d31]/60 hover:shadow-md"
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-hindi font-bold text-slate-800 dark:text-slate-100 truncate mb-1.5 leading-snug group-hover:text-[#bc8d31] transition-colors">
            <HighlightText text={displayTitle} highlight={searchQuery} />
          </h3>
          <div className="flex items-start gap-2">
            <p className={`text-base font-hindi leading-snug line-clamp-2 ${isContentMatch ? 'text-[#bc8d31]' : 'text-slate-500 dark:text-slate-400'}`}>
              <HighlightText text={subtitle} highlight={searchQuery} />
            </p>
          </div>
          {authorName && <div className="mt-2 text-xs uppercase tracking-wide text-[#bc8d31] font-bold font-hindi">{authorName}</div>}
        </div>
        <ChevronRight className="text-slate-300 dark:text-slate-600 shrink-0 group-hover:text-[#bc8d31] transition-colors" size={24} />
      </button>
    </div>
  );
});

const SimpleBhajanItem = React.memo(({
  bhajan,
  script,
  onSelect,
  paddingClass
}: {
  bhajan: Bhajan,
  script: ScriptType,
  onSelect: (b: Bhajan) => void,
  paddingClass: string
}) => {
  const displayTitle = script === 'iast' ? bhajan.titleIAST : bhajan.title;
  const subtitle = script === 'iast' ? bhajan.firstLineIAST : bhajan.firstLine;
  const authorName = bhajan.author && (script === 'iast' ? (bhajan.authorIAST || bhajan.author) : bhajan.author);

  const handleClick = () => {
    triggerHaptic('medium');
    onSelect(bhajan);
  };

  return (
    <li className="animate-fade-in-up">
      <button
        onClick={handleClick}
        className={`w-full text-left py-5 active:bg-[#bc8d31]/5 dark:active:bg-slate-800/50 transition-all flex items-center justify-between group ${paddingClass}`}
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-hindi font-bold text-slate-800 dark:text-slate-200 truncate leading-snug mb-1.5 group-hover:text-[#bc8d31] transition-colors">
            {displayTitle}
          </h3>
           <div className="flex items-center gap-2 truncate">
              {authorName && <span className="text-xs uppercase tracking-wider text-[#bc8d31] font-bold shrink-0">{authorName} •</span>}
              <p className="text-sm text-slate-400 dark:text-slate-500 truncate font-hindi">{subtitle}</p>
           </div>
        </div>
      </button>
    </li>
  );
});

export const BhajanList: React.FC<BhajanListProps> = ({ 
  bhajans, onSelect, searchQuery, script, indexMode, onIndexModeChange, azSliderSide, playlists, onCreatePlaylist, scrollBarSide = 'left', settingsLanguage = 'en', onSettingsLanguageChange
}) => {
  
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  // Handle Hardware Back Button for Filter Modal
  useEffect(() => {
    if (showFilterModal) {
      const stateId = `filter-modal-${Date.now()}`;
      window.history.pushState({ isPopup: true, modalId: stateId }, '');

      const handlePopState = () => {
        setShowFilterModal(false);
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
        if (window.history.state?.modalId === stateId) {
            window.history.back();
        }
      };
    }
  }, [showFilterModal]);

  // Translations
  const t = {
    filterTitle: settingsLanguage === 'hi' ? "फ़िल्टर और संग्रह" : "Filter & Collections",
    nityaKriya: settingsLanguage === 'hi' ? "नित्य क्रिया" : "Nitya Kriya",
    morning: settingsLanguage === 'hi' ? "प्रातः (Morning)" : "Morning",
    evening: settingsLanguage === 'hi' ? "सायं (Evening)" : "Evening",
    collections: settingsLanguage === 'hi' ? "मेरे संग्रह" : "My Collections",
    customList: settingsLanguage === 'hi' ? "कस्टम सूची" : "Custom List",
    listName: settingsLanguage === 'hi' ? "सूची का नाम" : "List Name",
    add: settingsLanguage === 'hi' ? "जोड़ें" : "Add",
    categories: settingsLanguage === 'hi' ? "श्रेणियाँ" : "Categories",
    allBhajans: settingsLanguage === 'hi' ? "सभी भजन" : "All Bhajans",
    badhai: settingsLanguage === 'hi' ? "बधाई / जन्मोत्सव" : "Badhai / Janmotsav",
    holi: settingsLanguage === 'hi' ? "होली / फाग" : "Holi / Phag",
    jhula: settingsLanguage === 'hi' ? "झूलन / सावन" : "Jhulan / Sawan",
    aarti: settingsLanguage === 'hi' ? "आरतियाँ" : "Aartis",
    ashtak: settingsLanguage === 'hi' ? "अष्टक और स्तोत्र" : "Ashtakas & Stotras",
    morningNitya: settingsLanguage === 'hi' ? "प्रातः नित्य क्रिया" : "Morning Nitya Kriya",
    eveningNitya: settingsLanguage === 'hi' ? "सायं नित्य क्रिया" : "Evening Nitya Kriya",
  };

  // Filter Logic
  const filteredBhajans = useMemo(() => {
    if (activeFilter === 'all') return bhajans;
    
    if (activeFilter === 'morning') {
        const morningSet = new Set(MORNING_SONG_NUMBERS);
        return bhajans.filter(b => b.songNumber && morningSet.has(b.songNumber));
    }

    if (activeFilter === 'evening') {
        const eveningSet = new Set(EVENING_SONG_NUMBERS);
        return bhajans.filter(b => b.songNumber && eveningSet.has(b.songNumber));
    }

    if (activeFilter.startsWith('playlist-')) {
        const playlistId = activeFilter.replace('playlist-', '');
        const playlist = playlists.find(p => p.id === playlistId);
        if (!playlist) return [];
        return bhajans.filter(b => playlist.items.includes(b.id));
    }

    return bhajans.filter(b => {
      const cats = getBhajanCategory(b);
      return cats.includes(activeFilter as BhajanCategory);
    });
  }, [bhajans, activeFilter, playlists]);

  const groupedBhajans = useMemo(() => {
    const groups: Record<string, Bhajan[]> = {};
    
    // Sort logic
    const sorted = [...filteredBhajans].sort((a, b) => {
        if (activeFilter === 'morning') {
            return MORNING_SONG_NUMBERS.indexOf(a.songNumber || '') - MORNING_SONG_NUMBERS.indexOf(b.songNumber || '');
        }
        if (activeFilter === 'evening') {
            return EVENING_SONG_NUMBERS.indexOf(a.songNumber || '') - EVENING_SONG_NUMBERS.indexOf(b.songNumber || '');
        }

        if (activeFilter !== 'all') {
           const numA = parseInt(a.songNumber || '0');
           const numB = parseInt(b.songNumber || '0');
           if (numA > 0 && numB > 0) return numA - numB;
        }

        if (indexMode === 'devanagari') {
            return a.title.localeCompare(b.title, 'hi');
        }
        return a.titleIAST.localeCompare(b.titleIAST);
    });

    sorted.forEach(bhajan => {
      const targetKeys: string[] = [];
      if (activeFilter !== 'all') {
         targetKeys.push(getFilterLabel(activeFilter));
      } else {
          if (indexMode === 'latin') {
             const devaChar = getDevanagariBaseChar(bhajan.title);
             const hinglishMap: Record<string, string[]> = {
                'ऐ': ['A', 'E'], 'ए': ['E'], 'औ': ['A', 'O'], 'ओ': ['O'],
                'ज्ञ': ['G', 'J'], 'क्ष': ['K'], 'ऋ': ['R'],
             };
             if (hinglishMap[devaChar]) {
                 targetKeys.push(...hinglishMap[devaChar]);
             } else {
                 const rawChar = bhajan.titleIAST.charAt(0).toUpperCase();
                 const normalizedChar = rawChar.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                 const key = /^[A-Z]/.test(normalizedChar) ? normalizedChar : '#';
                 targetKeys.push(key);
             }
          } else {
             const baseChar = getDevanagariBaseChar(bhajan.title);
             const vowelMap: Record<string, string> = { 'आ': 'अ', 'ई': 'इ', 'ऊ': 'उ', 'ऐ': 'ए', 'औ': 'ओ' };
             targetKeys.push(vowelMap[baseChar] || baseChar);
          }
      }
      targetKeys.forEach(k => {
          if (!groups[k]) groups[k] = [];
          if (!groups[k].includes(bhajan)) groups[k].push(bhajan);
      });
    });
    return groups;
  }, [filteredBhajans, indexMode, activeFilter, settingsLanguage]);

  const sortedKeys = useMemo(() => {
    return Object.keys(groupedBhajans).sort((a, b) => {
      if (activeFilter !== 'all') return 0; // Single group
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b, indexMode === 'devanagari' ? 'hi' : 'en');
    });
  }, [groupedBhajans, indexMode, activeFilter]);

  const scrollToSection = (key: string) => {
    triggerHaptic('light');
    const element = document.getElementById(`section-${key}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const listPaddingClass = azSliderSide === 'left' ? 'pl-12 pr-4' : 'pr-12 pl-4';
  const headerPaddingClass = azSliderSide === 'left' ? 'pl-12 pr-4' : 'pr-12 pl-4';

  function getFilterLabel(filter: string) {
      if (filter.startsWith('playlist-')) {
          const pid = filter.replace('playlist-', '');
          const p = playlists.find(pl => pl.id === pid);
          return p ? p.name : t.customList;
      }
      switch(filter) {
          case 'morning': return t.morningNitya;
          case 'evening': return t.eveningNitya;
          case 'holi': return t.holi;
          case 'jhula': return t.jhula;
          case 'badhai': return t.badhai;
          case 'aarti': return t.aarti;
          case 'ashtak': return t.ashtak;
          default: return t.allBhajans;
      }
  }

  const handleCreatePlaylist = () => {
      if (newPlaylistName.trim()) {
          onCreatePlaylist(newPlaylistName.trim());
          setNewPlaylistName('');
          setIsCreatingPlaylist(false);
      }
  };

  // Filter options styled with gold
  const FilterOption = ({ type, label, icon }: { type: string, label: string, icon: React.ReactNode }) => (
      <button 
          onClick={() => {
              setActiveFilter(type);
              setShowFilterModal(false);
              triggerHaptic('light');
          }}
          className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeFilter === type ? 'bg-[#bc8d31]/10 dark:bg-slate-800 border border-[#bc8d31]/40' : 'hover:bg-[#bc8d31]/5 dark:hover:bg-slate-800 border border-transparent'}`}
      >
          <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeFilter === type ? 'bg-[#bc8d31]/20 text-[#bc8d31] dark:bg-slate-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  {icon}
              </div>
              <span className={`font-bold text-sm ${activeFilter === type ? 'text-[#bc8d31]' : 'text-slate-600 dark:text-slate-300'}`}>
                  {label}
              </span>
          </div>
          {activeFilter === type && <Check size={18} className="text-[#bc8d31]" />}
      </button>
  );

  const isFilterSticky = activeFilter !== 'all';
  const stickyClass = isFilterSticky ? 'sticky top-0 z-20 shadow-sm' : 'relative';

  return (
    <div className="relative pb-2">
      
      {/* Filter Header - Updated to Cream/Gold */}
      {!searchQuery.trim() && activeFilter !== 'all' && (
        <div className={`${stickyClass} bg-[#fdfbf7]/95 dark:bg-slate-900/95 backdrop-blur-md py-3 border-b border-[#bc8d31]/20 flex justify-between items-center ${headerPaddingClass}`}>
           <div className="flex items-center gap-2">
               {activeFilter !== 'all' && (
                   <button onClick={() => setActiveFilter('all')} className="p-1.5 bg-[#bc8d31]/10 hover:bg-[#bc8d31]/20 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors">
                       <X size={14} className="text-[#bc8d31] dark:text-[#bc8d31]" />
                   </button>
               )}
               <span className={`text-sm font-bold uppercase tracking-wider ${activeFilter !== 'all' ? 'text-[#bc8d31]' : 'text-slate-500'}`}>
                   {getFilterLabel(activeFilter)}
               </span>
           </div>
           
           <button 
              onClick={() => setShowFilterModal(true)}
              className={`p-2 rounded-full transition-all active:scale-95 ${activeFilter !== 'all' ? 'bg-[#bc8d31]/10 text-[#bc8d31] dark:bg-slate-800' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200'}`}
           >
               <Filter size={16} />
           </button>
        </div>
      )}

      {/* Floating Filter Button - Gold styling */}
      {!searchQuery.trim() && activeFilter === 'all' && sortedKeys.length > 0 && (
        <div className={`sticky top-0 z-20 flex justify-end h-0 overflow-visible pointer-events-none ${headerPaddingClass}`}>
           <div className="py-2 pointer-events-auto">
               <button 
                  onClick={() => {
                      triggerHaptic('light');
                      setShowFilterModal(true);
                  }}
                  className="p-3 rounded-full text-[#bc8d31]/80 hover:text-[#bc8d31] hover:bg-[#bc8d31]/10 transition-colors bg-[#fdfbf7]/90 dark:bg-slate-900/90 shadow-sm border border-[#bc8d31]/20 backdrop-blur-sm"
               >
                   <Filter size={20} />
               </button>
           </div>
        </div>
      )}

      {/* SEARCH RESULTS VIEW */}
      {searchQuery.trim() ? (
        <div className="pt-2 px-3 pb-20 space-y-3">
          {bhajans.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <Music className="w-12 h-12 opacity-20 mb-2" />
                <p>No matches found</p>
             </div>
          ) : (
            bhajans.map((bhajan) => (
              <BhajanItem 
                key={bhajan.id} 
                bhajan={bhajan} 
                script={script} 
                searchQuery={searchQuery} 
                onSelect={onSelect} 
              />
            ))
          )}
        </div>
      ) : (
        /* STANDARD / FILTERED LIST VIEW */
        <div className="px-0 space-y-4">
          {sortedKeys.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Filter className="w-12 h-12 opacity-20 mb-2" />
                <p>No bhajans in this category</p>
                {activeFilter.startsWith('playlist-') && <p className="text-xs mt-2">Add songs from the reader view</p>}
             </div>
          ) : (
            sortedKeys.map((key) => (
              <div key={key} id={`section-${key}`} className="scroll-mt-28"> 
                {/* Alphabet Section Headers - Gold themed */}
                {activeFilter === 'all' && (
                  <div className={`sticky top-0 z-10 bg-[#fdfbf7]/95 dark:bg-slate-950/95 backdrop-blur-md py-2 border-b border-dashed border-[#bc8d31]/30 text-[#bc8d31] text-sm font-black uppercase tracking-widest flex items-center justify-between ${headerPaddingClass}`}>
                    <span className="bg-[#bc8d31]/10 dark:bg-slate-800 w-8 h-8 flex items-center justify-center rounded-lg shadow-sm border border-[#bc8d31]/20 dark:border-slate-700">
                      {key}
                    </span>
                  </div>
                )}
                <ul className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {groupedBhajans[key].map((bhajan) => (
                    <SimpleBhajanItem
                      key={bhajan.id}
                      bhajan={bhajan}
                      script={script}
                      onSelect={onSelect}
                      paddingClass={listPaddingClass}
                    />
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}

      {/* AZ Slider */}
      {!searchQuery && activeFilter === 'all' && (
        <AzSlider 
          sortedKeys={sortedKeys} 
          onSelect={scrollToSection} 
          indexMode={indexMode}
          onToggleMode={() => { triggerHaptic('light'); onIndexModeChange(indexMode === 'latin' ? 'devanagari' : 'latin'); }}
          side={azSliderSide}
        />
      )}

      {/* Filter Modal - Redesigned for Gold Theme */}
      {showFilterModal && createPortal(
          <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
              <div className="bg-[#fdfbf7] dark:bg-slate-900 w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col border border-[#bc8d31]/20">
                  <div className="flex items-center justify-between p-5 border-b border-[#bc8d31]/20 bg-[#fdfbf7] dark:bg-slate-900 rounded-t-3xl">
                      <div className="flex items-center gap-3">
                          <h3 className="font-bold text-lg text-[#bc8d31] dark:text-white">{t.filterTitle}</h3>
                          {onSettingsLanguageChange && (
                            <button 
                                onClick={() => {
                                    triggerHaptic('light');
                                    onSettingsLanguageChange(settingsLanguage === 'en' ? 'hi' : 'en');
                                }}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#bc8d31]/10 dark:bg-slate-800 text-[#bc8d31] dark:text-[#bc8d31] hover:bg-[#bc8d31]/20 transition-colors"
                            >
                                <Languages size={14} />
                                <span className="text-xs font-bold uppercase">{settingsLanguage === 'en' ? 'HI' : 'EN'}</span>
                            </button>
                          )}
                      </div>
                      <button onClick={() => setShowFilterModal(false)} className="p-2 bg-[#bc8d31]/10 dark:bg-slate-800 rounded-full text-[#bc8d31] hover:bg-[#bc8d31]/20 transition-colors">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className={`flex-1 overflow-y-auto ${scrollBarSide === 'left' ? 'left-scrollbar' : ''} p-5 space-y-6`}>
                      <div dir={scrollBarSide === 'left' ? 'ltr' : undefined}>
                          
                          {/* Section 1: Nitya Kriya */}
                          <div className="mb-6">
                              <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 px-1 tracking-wider">{t.nityaKriya}</h4>
                              <div className="grid grid-cols-2 gap-3">
                                  {/* Morning Button */}
                                  <button 
                                    onClick={() => { setActiveFilter('morning'); setShowFilterModal(false); }}
                                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 shadow-sm ${activeFilter === 'morning' ? 'bg-[#bc8d31]/10 border-[#bc8d31]/40 text-[#bc8d31]' : 'bg-white dark:bg-slate-800 border-[#bc8d31]/20 text-slate-500 hover:border-[#bc8d31]/40'}`}
                                  >
                                      <Sun size={28} className={activeFilter === 'morning' ? 'text-[#bc8d31]' : 'text-[#bc8d31]/70'} />
                                      <span className="text-xs font-bold">{t.morning}</span>
                                  </button>
                                  {/* Evening Button */}
                                  <button 
                                    onClick={() => { setActiveFilter('evening'); setShowFilterModal(false); }}
                                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 shadow-sm ${activeFilter === 'evening' ? 'bg-[#bc8d31]/10 border-[#bc8d31]/40 text-[#bc8d31]' : 'bg-white dark:bg-slate-800 border-[#bc8d31]/20 text-slate-500 hover:border-[#bc8d31]/40'}`}
                                  >
                                      <Moon size={28} className={activeFilter === 'evening' ? 'text-[#bc8d31]' : 'text-[#bc8d31]/70'} />
                                      <span className="text-xs font-bold">{t.evening}</span>
                                  </button>
                              </div>
                          </div>

                          {/* Section 2: My Collections */}
                          <div className="mb-6">
                              <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 px-1 tracking-wider">{t.collections}</h4>
                              <div className="flex flex-wrap gap-2">
                                  {playlists.map(p => (
                                      <button
                                        key={p.id}
                                        onClick={() => { setActiveFilter(`playlist-${p.id}`); setShowFilterModal(false); }}
                                        className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors shadow-sm ${activeFilter === `playlist-${p.id}` ? 'bg-[#bc8d31]/10 text-[#bc8d31] border-[#bc8d31]/40' : 'bg-white dark:bg-slate-800 text-slate-500 border-[#bc8d31]/20 hover:bg-[#bc8d31]/5'}`}
                                      >
                                          {p.name}
                                      </button>
                                  ))}
                                  
                                  {!isCreatingPlaylist ? (
                                      <button 
                                        onClick={() => setIsCreatingPlaylist(true)}
                                        className="px-4 py-2 rounded-full text-xs font-bold bg-[#bc8d31]/10 text-[#bc8d31] border border-[#bc8d31]/30 flex items-center gap-1 hover:bg-[#bc8d31]/20 transition-colors"
                                      >
                                          <Plus size={14} /> {t.customList}
                                      </button>
                                  ) : (
                                      <div className="flex gap-1 w-full animate-in fade-in mt-1">
                                          <input 
                                            autoFocus
                                            className="flex-1 px-4 py-2 rounded-full text-xs bg-white dark:bg-slate-800 outline-none border border-[#bc8d31]/40 text-[#bc8d31] placeholder:text-[#bc8d31]/50 shadow-sm"
                                            placeholder={t.listName}
                                            value={newPlaylistName}
                                            onChange={e => setNewPlaylistName(e.target.value)}
                                          />
                                          <button onClick={handleCreatePlaylist} className="px-4 py-2 bg-[#bc8d31] text-white rounded-full text-xs font-bold shadow-md hover:brightness-110">{t.add}</button>
                                          <button onClick={() => setIsCreatingPlaylist(false)} className="px-2 text-slate-400 hover:text-red-500"><X size={16} /></button>
                                      </div>
                                  )}
                              </div>
                          </div>

                          {/* Section 3: Categories */}
                          <div>
                              <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 px-1 tracking-wider">{t.categories}</h4>
                              <div className="space-y-2">
                                  <FilterOption type="all" label={t.allBhajans} icon={<ListMusic size={20} />} />
                                  <FilterOption type="badhai" label={t.badhai} icon={<Gift size={20} />} />
                                  <FilterOption type="holi" label={t.holi} icon={<Flame size={20} />} />
                                  <FilterOption type="jhula" label={t.jhula} icon={<CloudRain size={20} />} />
                                  <FilterOption type="aarti" label={t.aarti} icon={<Bell size={20} />} />
                                  <FilterOption type="ashtak" label={t.ashtak} icon={<Book size={20} />} />
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>,
          document.body
      )}
    </div>
  );
};