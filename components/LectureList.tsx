import React, { useState, useEffect } from 'react';
import { LectureData, BhajanAudio, DownloadItem } from '../types';
import { Mic, Calendar, SearchX, Music, ChevronDown, ChevronUp, Download, Check, Loader2, Play, Trash2 } from 'lucide-react';
import { HighlightText } from './HighlightText';
import { deleteTrack } from '../utils/audioStorage';

interface LectureListProps {
  katha: LectureData[];
  kirtan: LectureData[];
  onSelect: (lecture: LectureData, track?: BhajanAudio) => void;
  searchQuery?: string;
  activeDownloads?: Record<string, DownloadItem>;
  onDownloadTrack?: (track: BhajanAudio, title: string) => void;
  settingsLanguage: 'en' | 'hi';
}

export const LectureList: React.FC<LectureListProps> = ({ katha, kirtan, onSelect, searchQuery = '', activeDownloads = {}, onDownloadTrack, settingsLanguage }) => {
  const [activeTab, setActiveTab] = useState<'katha' | 'kirtan'>('kirtan');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [downloadedTracks, setDownloadedTracks] = useState<string[]>([]);

  // Translations
  const t = {
    en: {
      kathaTab: "Katha",
      kirtanTab: "Kirtans",
      noKatha: "No katha found",
      noKirtan: "No kirtans found",
      trySearch: "Try a different search term",
      tracks: "Tracks",
      audioTrack: "Audio Track",
      download: "Download Audio"
    },
    hi: {
      kathaTab: "कथा",
      kirtanTab: "कीर्तन",
      noKatha: "कोई कथा नहीं मिली",
      noKirtan: "कोई कीर्तन नहीं मिला",
      trySearch: "कोई अन्य शब्द खोजें",
      tracks: "ट्रैक",
      audioTrack: "ऑडियो ट्रैक",
      download: "ऑडियो डाउनलोड करें"
    }
  }[settingsLanguage];

  const currentList = activeTab === 'katha' ? katha : kirtan;
  const emptyText = activeTab === 'katha' ? t.noKatha : t.noKirtan;

  // Refresh downloads helper
  const refreshDownloads = () => {
      try {
          const ids = JSON.parse(localStorage.getItem('cpbs_downloaded_tracks') || '[]');
          setDownloadedTracks(ids);
      } catch {}
  };

  useEffect(() => {
      refreshDownloads();
      window.addEventListener('storage', refreshDownloads);
      return () => window.removeEventListener('storage', refreshDownloads);
  }, []);

  const handleDownloadClick = (e: React.MouseEvent, track: BhajanAudio, title: string) => {
      e.stopPropagation();
      if (onDownloadTrack) {
          onDownloadTrack(track, title);
      }
  };

  const handleDeleteTrack = async (track: BhajanAudio) => {
      // Optimistic Update
      setDownloadedTracks(prev => prev.filter(id => id !== track.id));
      await deleteTrack(track.id, track.url);
      setTimeout(refreshDownloads, 100);
  };

  const toggleExpand = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="pb-2 pt-2">
       {/* Tabs - Updated to Gold/Cream Theme */}
       <div className="px-4 mb-4">
          <div className="flex bg-[#bc8d31]/10 dark:bg-slate-800 p-1 rounded-xl border border-[#bc8d31]/20">
             <button
               onClick={() => setActiveTab('kirtan')}
               className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'kirtan' ? 'bg-[#fdfbf7] dark:bg-slate-700 text-[#bc8d31] shadow-sm border border-[#bc8d31]/20' : 'text-slate-500 dark:text-slate-400 hover:text-[#bc8d31] dark:hover:text-[#bc8d31]'}`}
             >
                <Music size={16} /> {t.kirtanTab}
             </button>
             <button
               onClick={() => setActiveTab('katha')}
               className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'katha' ? 'bg-[#fdfbf7] dark:bg-slate-700 text-[#bc8d31] shadow-sm border border-[#bc8d31]/20' : 'text-slate-500 dark:text-slate-400 hover:text-[#bc8d31] dark:hover:text-[#bc8d31]'}`}
             >
                <Mic size={16} /> {t.kathaTab}
             </button>
          </div>
       </div>

       {currentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 p-8 text-center animate-fade-in-up">
              <SearchX className="w-16 h-16 opacity-30 mb-4 text-[#bc8d31]" />
              <p className="text-lg font-medium">{emptyText}</p>
              {searchQuery && <p className="text-sm opacity-70 mt-2">{t.trySearch}</p>}
          </div>
       ) : (
          <div className="px-2 space-y-2">
             {currentList.map((item, index) => {
                 const delayStyle = { animationDelay: `${Math.min(index * 40, 600)}ms` };
                 const isExpanded = expandedId === item.id;
                 const hasAudio = item.audio && item.audio.length > 0;

                 return (
                     <div key={item.id} className="animate-fade-in-up opacity-0 fill-mode-forwards" style={delayStyle}>
                         {/* Expanded Card background changed to cream */}
                         <div className={`rounded-2xl transition-all duration-300 border ${isExpanded ? 'bg-[#fdfbf7] dark:bg-slate-800 border-[#bc8d31]/40 shadow-md' : 'bg-transparent border-transparent hover:bg-[#bc8d31]/5 dark:hover:bg-slate-800/40'}`}>
                                  <button 
                                      onClick={() => onSelect(item)}
                                      className="w-full text-left p-4 flex items-center gap-4 group"
                                  >
                                 {/* Icon Container - Gold instead of Navy */}
                                 <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${isExpanded ? 'bg-[#bc8d31]/20 dark:bg-slate-700 text-[#bc8d31]' : 'bg-[#bc8d31]/5 dark:bg-slate-800 text-slate-400 group-hover:text-[#bc8d31] group-hover:bg-[#bc8d31]/10 dark:group-hover:bg-slate-700'}`}>
                                     {activeTab === 'katha' ? <Mic size={22} /> : <Music size={22} />}
                                 </div>
                                 
                                 <div className="flex-1 min-w-0">
                                     {/* Title - Gold instead of Navy on hover/active */}
                                     <h3 className={`font-hindi font-bold text-lg leading-snug transition-colors ${isExpanded ? 'text-[#bc8d31] dark:text-[#bc8d31]' : 'text-slate-700 dark:text-slate-200 group-hover:text-[#bc8d31]'}`}>
                                         <HighlightText text={item.title} highlight={searchQuery} />
                                     </h3>
                                     <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                         {item.date && item.date !== 'Kirtan' && (
                                             <span className="flex items-center gap-1">
                                                 <Calendar size={12} className="text-[#bc8d31]/70" /> <HighlightText text={item.date} highlight={searchQuery} />
                                             </span>
                                         )}
                                         {/* Tracks count badge */}
                                         <span className="truncate bg-[#bc8d31]/10 text-[#bc8d31] font-bold dark:bg-slate-700 px-2 py-0.5 rounded-full border border-[#bc8d31]/20">
                                             {item.audio?.length || 0} {t.tracks}
                                         </span>
                                     </div>
                                 </div>

                                 {hasAudio && (
                                     <div 
                                       onClick={(e) => toggleExpand(e, item.id)}
                                       className={`h-10 w-10 flex items-center justify-center rounded-full transition-all active:scale-95 z-10 shrink-0 ${isExpanded ? 'bg-[#bc8d31] text-white shadow-md' : 'text-slate-400 hover:bg-[#bc8d31]/10 dark:hover:bg-slate-700 hover:text-[#bc8d31]'}`}
                                     >
                                         {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                     </div>
                                 )}
                             </button>

                             {/* Expanded Track List */}
                             {isExpanded && hasAudio && (
                                 <div className="px-4 pb-4 pt-0 animate-fade-in">
                                     {/* Sub-list background */}
                                     <div className="bg-[#bc8d31]/5 dark:bg-slate-900/50 rounded-xl p-2 space-y-1 border border-[#bc8d31]/20">
                                         {item.audio!.map((track) => {
                                             const isDownloaded = downloadedTracks.includes(track.id);
                                             const downloadItem = activeDownloads[track.id];
                                             const isDownloading = downloadItem !== undefined;
                                             const progress = downloadItem?.progress || 0;
                                             
                                             return (
                                                 <div 
                                                   key={track.id} 
                                                   onClick={(e) => {
                                                       e.stopPropagation();
                                                       onSelect(item, track);
                                                   }}
                                                   className="flex items-center justify-between p-3 rounded-lg hover:bg-white dark:hover:bg-slate-800 active:bg-white dark:active:bg-slate-800 transition-colors border border-transparent hover:border-[#bc8d31]/30 hover:shadow-sm cursor-pointer group/track"
                                                 >
                                                     <div className="flex items-center gap-3 overflow-hidden">
                                                         {/* Track Icon */}
                                                         <div className="w-8 h-8 rounded-full bg-[#bc8d31]/10 dark:bg-slate-700 flex items-center justify-center text-[#bc8d31]/60 shrink-0 group-hover/track:bg-[#bc8d31]/20 dark:group-hover/track:bg-slate-600 group-hover/track:text-[#bc8d31] transition-colors">
                                                             <Music size={14} />
                                                         </div>
                                                         <div className="min-w-0">
                                                             <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate group-hover/track:text-[#bc8d31] transition-colors">{track.singer || t.audioTrack}</p>
                                                         </div>
                                                     </div>
                                                     
                                                     <div className="flex items-center gap-2">
                                                         {/* Play Button */}
                                                         <button 
                                                           onClick={(e) => {
                                                               e.stopPropagation();
                                                               onSelect(item, track);
                                                           }}
                                                           className="p-2 text-[#bc8d31] hover:bg-[#bc8d31]/20 active:bg-[#bc8d31]/30 rounded-full dark:hover:bg-slate-700 transition-colors"
                                                         >
                                                             <Play size={16} fill="currentColor" />
                                                         </button>

                                                         {isDownloading ? (
                                                             <div className="w-8 h-8 flex items-center justify-center bg-[#bc8d31]/10 dark:bg-slate-800 rounded-full border border-[#bc8d31]/40">
                                                                 <span className="text-[9px] font-bold text-[#bc8d31]">{Math.round(progress)}%</span>
                                                             </div>
                                                         ) : isDownloaded ? (
                                                             <DeleteButton 
                                                               onConfirm={() => handleDeleteTrack(track)}
                                                             />
                                                         ) : (
                                                             <button 
                                                               onClick={(e) => handleDownloadClick(e, track, item.title)}
                                                               className="p-2 text-slate-400 hover:text-[#bc8d31] active:text-[#bc8d31] transition-colors"
                                                               title={t.download}
                                                             >
                                                                 <Download size={18} />
                                                             </button>
                                                         )}
                                                     </div>
                                                 </div>
                                             );
                                         })}
                                     </div>
                                 </div>
                             )}
                         </div>
                     </div>
                 );
             })}
          </div>
       )}
    </div>
  );
};

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
            className={`p-2 rounded-full transition-all active:scale-95 flex items-center gap-2 ${confirming ? 'bg-red-500 text-white px-3' : 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800'}`}
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