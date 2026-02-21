
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bhajan, FontSize, ScriptType, BhajanAudio, Playlist, DownloadItem } from '../types';
import { ArrowLeft, Save, Sun, Moon, Type, Share2, Hash, MessageCircle, AlignCenter, AlignLeft, AlignJustify, Maximize, Layout, Heart, Plus, CheckSquare, Square, BookOpen, ZoomIn, ZoomOut, RotateCcw, ListMusic, Check } from 'lucide-react';
import { AudioPlayer } from './AudioPlayer';
import { triggerHaptic } from '../utils/haptic';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { useAudio } from '../context/AudioContext';

interface BhajanReaderProps {
  bhajan: Bhajan;
  onBack: () => void;
  fontSize: FontSize;
  onChangeFontSize: (size: FontSize) => void;
  searchQuery: string;
  script: ScriptType;
  darkMode: boolean;
  onToggleTheme: () => void;
  keepAwake: boolean;
  devMode: boolean;
  onSave?: (id: string, title: string, content: string) => void;
  onDelete?: (id: string) => void;
  autoEdit?: boolean;
  scrollBarSide?: 'left' | 'right';
  activeDownloads?: Record<string, DownloadItem>;
  onDownloadTrack?: (track: BhajanAudio, title: string) => void;
  
  // Playlist Props
  playlists?: Playlist[];
  onAddToPlaylist?: (playlistId: string, bhajanId: string) => void;
  onRemoveFromPlaylist?: (playlistId: string, bhajanId: string) => void;
  onCreatePlaylist?: (name: string) => void;
  
  // Context Queue for Playlist Playback
  contextQueue?: BhajanAudio[];
  queueName?: string; // New Prop
  settingsLanguage: 'en' | 'hi';
}

type ViewFormat = 'center' | 'left' | 'justify' | 'wide-center' | 'wide-left';

export const BhajanReader: React.FC<BhajanReaderProps> = ({ 
  bhajan, onBack, fontSize, onChangeFontSize, searchQuery, script, darkMode, 
  onToggleTheme, keepAwake, devMode, onSave, onDelete, autoEdit = false, scrollBarSide = 'left',
  activeDownloads, onDownloadTrack, playlists = [], onAddToPlaylist, onRemoveFromPlaylist, onCreatePlaylist,
  contextQueue, queueName, settingsLanguage
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { setQueueOpen } = useAudio();
  
  // States for editing
  const [isEditing, setIsEditing] = useState(autoEdit);
  const [isPersonalEdit, setIsPersonalEdit] = useState(false);
  
  // Content states - Initialize with actual content to prevent empty state flash
  const [editedTitle, setEditedTitle] = useState(() => {
      const personalKey = `cpbs_personal_${bhajan.id}`;
      try {
          const savedPersonal = localStorage.getItem(personalKey);
          if (savedPersonal) {
              const parsed = JSON.parse(savedPersonal);
              return parsed.title || (script === 'iast' ? bhajan.titleIAST : bhajan.title);
          }
      } catch (e) {}
      return script === 'iast' ? bhajan.titleIAST : bhajan.title;
  });

  const [editedContent, setEditedContent] = useState(() => {
      const personalKey = `cpbs_personal_${bhajan.id}`;
      try {
          const savedPersonal = localStorage.getItem(personalKey);
          if (savedPersonal) {
              const parsed = JSON.parse(savedPersonal);
              return parsed.content || (script === 'iast' ? bhajan.contentIAST : bhajan.content);
          }
      } catch (e) {}
      return script === 'iast' ? bhajan.contentIAST : bhajan.content;
  });
  
  // Derived Author Name
  const authorName = bhajan.author && (script === 'iast' ? (bhajan.authorIAST || bhajan.author) : bhajan.author);

  // UI States
  const [showFontPanel, setShowFontPanel] = useState(false);
  
  const [lineGap, setLineGap] = useState(() => parseInt(localStorage.getItem('cpbs_line_gap') || '0', 10));
  const [showHeaderTitle, setShowHeaderTitle] = useState(false);
  const [showRequestConfirm, setShowRequestConfirm] = useState(false);
  const [showShareConfirm, setShowShareConfirm] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  // BookMode States (Now Persistent)
  const [isBookMode, setIsBookMode] = useState(() => localStorage.getItem('cpbs_reader_bookmode') === 'true');
  const [bookScale, setBookScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Check if bhajan is in ANY playlist
  const isLiked = playlists.some(p => p.items.includes(bhajan.id));

  // View Format State
  const [viewFormat, setViewFormat] = useState<ViewFormat>(() => 
    (localStorage.getItem('cpbs_view_format') as ViewFormat) || 'center'
  );

  // Pinch/Drag Zoom Refs
  const touchStartDist = useRef<number | null>(null);
  const startFontSizeRef = useRef<number>(fontSize);
  const startLineGapRef = useRef<number>(lineGap);
  const startBookScaleRef = useRef<number>(1);
  
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const isHindi = settingsLanguage === 'hi';

  const t = {
      requestAudio: isHindi ? 'ऑडियो मांगें' : 'Request Audio',
      requestConfirmTitle: isHindi ? 'ऑडियो अनुरोध?' : 'Request Audio?',
      cancel: isHindi ? 'रद्द करें' : 'Cancel',
      confirm: isHindi ? 'पुष्टि करें' : 'Confirm',
      shareTitle: isHindi ? 'भजन शेयर करें' : 'Share Bhajan',
      shareText: isHindi ? 'टेक्स्ट शेयर करें' : 'Share Text',
      savePlaylists: isHindi ? 'प्लेलिस्ट में सहेजें' : 'Save to Playlists',
      newPlaylist: isHindi ? 'नई प्लेलिस्ट' : 'New Playlist Name',
      done: isHindi ? 'हो गया' : 'Done',
      songs: isHindi ? 'भजन' : 'songs',
      noPlaylists: isHindi ? 'कोई प्लेलिस्ट नहीं।' : 'No playlists yet.'
  };

  // --- Screen Wake Lock Logic ---
  useEffect(() => {
    const manageWakeLock = async () => {
      try {
        if (keepAwake) {
          await KeepAwake.keepAwake();
        } else {
          await KeepAwake.allowSleep();
        }
      } catch (e) {
        console.warn('WakeLock error:', e);
      }
    };

    manageWakeLock();

    return () => {
      // Allow sleep when component unmounts
      KeepAwake.allowSleep().catch(() => {});
    };
  }, [keepAwake]);

  // Load content updates when bhajan or script changes (if not personal)
  useEffect(() => {
    const personalKey = `cpbs_personal_${bhajan.id}`;
    const savedPersonal = localStorage.getItem(personalKey);
    
    if (savedPersonal) {
      try {
        const parsed = JSON.parse(savedPersonal);
        setEditedTitle(parsed.title);
        setEditedContent(parsed.content);
      } catch (e) {
        setEditedTitle(script === 'iast' ? bhajan.titleIAST : bhajan.title);
        setEditedContent(script === 'iast' ? bhajan.contentIAST : bhajan.content);
      }
    } else {
      setEditedTitle(script === 'iast' ? bhajan.titleIAST : bhajan.title);
      setEditedContent(script === 'iast' ? bhajan.contentIAST : bhajan.content);
    }
  }, [bhajan, script]);

  useEffect(() => {
    localStorage.setItem('cpbs_line_gap', String(lineGap));
  }, [lineGap]);

  useEffect(() => {
    localStorage.setItem('cpbs_view_format', viewFormat);
  }, [viewFormat]);

  // Persist Book Mode
  useEffect(() => {
    localStorage.setItem('cpbs_reader_bookmode', String(isBookMode));
  }, [isBookMode]);

  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) setShowHeaderTitle(contentRef.current.scrollTop > 60);
    };
    const el = contentRef.current;
    el?.addEventListener('scroll', handleScroll, { passive: true });
    return () => el?.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper to clamp pan values to keep content in view (relaxed for free movement)
  const getClampedPan = (x: number, y: number, scale: number) => {
    if (!contentRef.current) return { x, y };
    
    const container = contentRef.current;
    const content = container.firstElementChild as HTMLElement;
    
    if (!content) return { x, y };

    const cW = container.clientWidth;
    const cH = container.clientHeight;
    // Use offset dimensions of the inner content wrapper
    const contentW = content.offsetWidth;
    const contentH = content.offsetHeight;

    const scaledW = contentW * scale;
    const scaledH = contentH * scale;

    // Safety margin to allow dragging content almost entirely off screen but keeping a handle
    // This allows free movement and prevents getting "stuck" at edges when zooming
    const margin = 100; 

    // Calculate bounds such that at least 'margin' pixels of content remain visible on relevant sides
    // or allows empty space up to 'margin' if content is small.
    // Essentially allowing "Free Pan" behavior.
    
    const minX = cW - scaledW - margin; 
    const maxX = margin;
    
    // If content is smaller than screen, these bounds might cross. 
    // We relax it to allow centering or placing anywhere.
    const effectiveMinX = Math.min(minX, 0 - scaledW + margin); // Ensure we can drag far left
    const effectiveMaxX = Math.max(maxX, cW - margin); // Ensure we can drag far right

    // Vertical bounds
    const minY = cH - scaledH - margin;
    const maxY = margin;
    
    const effectiveMinY = Math.min(minY, 0 - scaledH + margin);
    const effectiveMaxY = Math.max(maxY, cH - margin);

    return {
        x: Math.min(Math.max(x, effectiveMinX), effectiveMaxX),
        y: Math.min(Math.max(y, effectiveMinY), effectiveMaxY)
    };
  };

  // --- Touch Handlers (Pinch Zoom + Drag) ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch Start
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDist.current = dist;
      
      if (isBookMode) {
        startBookScaleRef.current = bookScale;
      } else {
        startFontSizeRef.current = fontSize;
        startLineGapRef.current = lineGap;
      }
    } else if (e.touches.length === 1 && isBookMode) {
      // Drag Start (Allowed even at 100% zoom)
      isDragging.current = true;
      dragStart.current = { 
        x: e.touches[0].clientX - pan.x, 
        y: e.touches[0].clientY - pan.y 
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDist.current !== null) {
      // Pinch Move
      if (e.cancelable) e.preventDefault(); 
      
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = dist / touchStartDist.current;
      
      if (isBookMode) {
        let newScale = startBookScaleRef.current * scale;
        newScale = Math.max(1, Math.min(4, newScale));
        setBookScale(newScale);
      } else {
        let newSize = startFontSizeRef.current * scale;
        newSize = Math.max(12, Math.min(60, newSize));
        onChangeFontSize(Math.round(newSize));

        let newGap = startLineGapRef.current * scale;
        newGap = Math.max(0, Math.min(16, newGap));
        setLineGap(Math.round(newGap));
      }
    } else if (e.touches.length === 1 && isDragging.current && isBookMode) {
      // Drag Move
      if (e.cancelable) e.preventDefault();
      const rawX = e.touches[0].clientX - dragStart.current.x;
      const rawY = e.touches[0].clientY - dragStart.current.y;
      
      const clamped = getClampedPan(rawX, rawY, bookScale);
      setPan(clamped);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchStartDist.current = null;
    isDragging.current = false;
  };

  // --- Mouse Handlers (Desktop Drag & Wheel) ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isBookMode) {
      e.preventDefault();
      isDragging.current = true;
      dragStart.current = { 
        x: e.clientX - pan.x, 
        y: e.clientY - pan.y 
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current && isBookMode) {
      e.preventDefault();
      const rawX = e.clientX - dragStart.current.x;
      const rawY = e.clientY - dragStart.current.y;
      
      const clamped = getClampedPan(rawX, rawY, bookScale);
      setPan(clamped);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!isBookMode) return;
    // Simple wheel zoom logic
    const delta = -e.deltaY * 0.001; 
    setBookScale(prev => Math.min(Math.max(1, prev + delta), 4));
  };

  const toggleBookMode = () => {
    const newVal = !isBookMode;
    setIsBookMode(newVal);
    // Reset scale and pan when toggling
    if (!newVal) {
      setBookScale(1);
      setPan({ x: 0, y: 0 });
    }
  };

  const executeShare = async () => {
    setShowShareConfirm(false);
    triggerHaptic('light');
    if (navigator.share) {
      try { 
        await navigator.share({ 
          title: editedTitle, 
          text: `${editedTitle}\n\n${editedContent}\n\n- Shared via CPBS App` 
        }); 
      } catch (e) {}
    } else {
      const textToCopy = `${editedTitle}\n\n${editedContent}`;
      navigator.clipboard.writeText(textToCopy).then(() => {
        triggerHaptic('light');
        // Toast could be here, but haptic is enough feedback usually
      }).catch(() => {});
    }
  };

  const handleRequestAudio = () => {
      // Use songNumber if available (the visible ID), otherwise fallback to internal ID
      const displayId = bhajan.songNumber || bhajan.id;
      
      const text = isHindi 
        ? `हरे कृष्णा! भजन का ऑडियो चाहिए: ${editedTitle} (ID: ${displayId})`
        : `Hare Krishna! Requesting audio for Bhajan: ${editedTitle} (ID: ${displayId})`;
        
      const url = `https://wa.me/917049304733?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
      setShowRequestConfirm(false);
  };

  const savePersonalized = () => {
    triggerHaptic('medium');
    localStorage.setItem(`cpbs_personal_${bhajan.id}`, JSON.stringify({
      title: editedTitle,
      content: editedContent
    }));
    setIsPersonalEdit(false);
    setIsEditing(false);
  };

  const handleSystemSave = () => {
    triggerHaptic('heavy');
    onSave?.(bhajan.id, editedTitle, editedContent);
    setIsEditing(false);
    setIsPersonalEdit(false);
  };

  const toggleViewFormat = () => {
      triggerHaptic('light');
      const formats: ViewFormat[] = ['center', 'left', 'justify', 'wide-center', 'wide-left'];
      const nextIndex = (formats.indexOf(viewFormat) + 1) % formats.length;
      setViewFormat(formats[nextIndex]);
  };

  const getViewIcon = () => {
      switch(viewFormat) {
          case 'left': return <AlignLeft size={22} />;
          case 'justify': return <AlignJustify size={22} />;
          case 'wide-center': return <Maximize size={22} />;
          case 'wide-left': return <Layout size={22} />;
          case 'center': default: return <AlignCenter size={22} />;
      }
  };

  const handleTogglePlaylist = (playlist: Playlist) => {
      const isAdded = playlist.items.includes(bhajan.id);
      if (isAdded) {
          if (onRemoveFromPlaylist) onRemoveFromPlaylist(playlist.id, bhajan.id);
      } else {
          if (onAddToPlaylist) onAddToPlaylist(playlist.id, bhajan.id);
      }
      triggerHaptic('light');
  };

  const handleCreateAndAdd = () => {
      if(newPlaylistName.trim() && onCreatePlaylist && onAddToPlaylist) {
          onCreatePlaylist(newPlaylistName.trim());
          setNewPlaylistName('');
      }
  };

  const renderFormattedContent = (content: string) => {
    const alignClass = viewFormat.includes('left') || viewFormat === 'wide-left' 
        ? 'text-left' 
        : viewFormat === 'justify' 
            ? 'text-justify' 
            : 'text-center';
            
    const subheadingJustify = viewFormat.includes('left') || viewFormat === 'wide-left' 
        ? 'justify-start' 
        : 'justify-center';

    return content.split('\n').map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={index} className="h-4" />;
      
      if (trimmed.startsWith('#') && trimmed.endsWith('#') && trimmed.length > 1) {
        const text = trimmed.slice(1, -1).trim();
        const processedLine = text.replace(/।।/g, '॥').replace(/\s+([।॥])/g, '\u00A0$1');

        return (
          <div key={index} className={`flex ${subheadingJustify} my-2 px-2`}>
            <div className={`
              text-center px-4 py-1 rounded-lg border-y border-x-[3px] shadow-sm
              ${darkMode 
                ? 'bg-[#1c100b] border-saffron-500' 
                : 'bg-saffron-50 border-saffron-400'
              }
            `}>
              <span className={`
                font-hindi font-bold text-sm tracking-wider
                ${darkMode ? 'text-saffron-500' : 'text-saffron-800'}
              `}>
                {processedLine}
              </span>
            </div>
          </div>
        );
      }

      const processedLine = trimmed.replace(/।।/g, '॥').replace(/\s+([।॥])/g, '\u00A0$1');
      const hasDoubleDanda = processedLine.includes('॥');

      return (
        <div 
            key={index} 
            className={`
                ${alignClass} px-1 font-hindi text-slate-800 dark:text-slate-200 select-none font-bold
                ${hasDoubleDanda ? 'border-b-[1.5px] border-saffron-400 dark:border-saffron-600' : ''}
            `} 
            style={{ 
                lineHeight: Math.max(1.6, 1.5 + (fontSize - 20) * 0.02), 
                paddingBottom: hasDoubleDanda ? '4px' : `${lineGap * 4}px`,
                marginBottom: hasDoubleDanda ? `${lineGap * 4 + 4}px` : '0px'
            }}
        >
          {processedLine}
        </div>
      );
    });
  };

  const maxWidthClass = viewFormat.startsWith('wide') ? 'max-w-full' : 'max-w-3xl';
  const isLeftAligned = viewFormat.includes('left') || viewFormat === 'wide-left';
  
  // Logic to adjust right spacing for zoom controls in landscape
  const showAudioSidebar = !(isEditing || isPersonalEdit) && (bhajan.audio && bhajan.audio.length > 0);

  return (
    <div className="fixed inset-0 bg-paper dark:bg-slate-950 z-50 flex flex-col h-full w-full animate-in slide-in-from-bottom duration-300 landscape:flex-row">
      
      {/* Header Bar - Increased Z-Index to 30 */}
      <div className="flex-none bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm border-b dark:border-slate-800 p-2 pt-[calc(0.5rem+env(safe-area-inset-top))] flex items-center justify-between z-30 relative landscape:w-16 landscape:h-full landscape:flex-col landscape:border-b-0 landscape:border-r landscape:pt-[env(safe-area-inset-top)]">
        
        {/* Left Actions - Removed Title from here to prevent crowding */}
        <div className="flex items-center gap-3 shrink-0 landscape:flex-col landscape:flex-none">
            <button 
                onClick={onBack} 
                className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all duration-200 shrink-0"
            >
                <ArrowLeft size={24} className="text-slate-700 dark:text-slate-200" />
            </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 shrink-0 landscape:flex-col landscape:gap-4 landscape:pb-4">
          {!(isEditing || isPersonalEdit) && (
            <>
                {/* Queue Button */}
                <button 
                    onClick={() => { triggerHaptic('light'); setQueueOpen(true); }}
                    className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all duration-200 text-slate-500"
                >
                    <ListMusic size={22} />
                </button>

                <button 
                    onClick={() => { triggerHaptic('light'); setShowPlaylistModal(true); }}
                    className={`p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all duration-200 ${isLiked ? 'text-red-500' : 'text-slate-500'}`}
                >
                    <Heart size={22} className={isLiked ? 'fill-current' : ''} />
                </button>
                <button 
                    onClick={() => { triggerHaptic('light'); setShowShareConfirm(true); }}
                    className="p-2.5 text-slate-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 active:text-saffron-500 active:scale-90 transition-all duration-200"
                >
                    <Share2 size={22} />
                </button>
            </>
          )}

          {(isEditing || isPersonalEdit) && (
            <button 
              onClick={isEditing ? handleSystemSave : savePersonalized} 
              className="p-2.5 text-green-600 active:scale-90 transition-transform duration-200"
            >
              <Save size={22} />
            </button>
          )}
          
          <button 
            onClick={toggleViewFormat}
            className="p-2.5 text-slate-500 active:text-saffron-500 active:scale-90 transition-all duration-200"
          >
            {getViewIcon()}
          </button>

          <button 
            onClick={() => { triggerHaptic('light'); setShowFontPanel(!showFontPanel); }} 
            className={`p-2.5 active:scale-90 transition-all duration-200 ${showFontPanel ? 'text-saffron-500' : 'text-slate-500'}`}
          >
            <Type size={22} />
          </button>
          <button 
            onClick={() => { triggerHaptic('light'); onToggleTheme(); }} 
            className="p-2.5 text-slate-500 active:scale-90 transition-all duration-200"
          >
            {darkMode ? <Sun size={22} /> : <Moon size={22} />}
          </button>
        </div>
      </div>

      {/* Secondary Header (Title & Author) - Slides from under top bar */}
      <div 
          className={`absolute left-0 right-0 z-20 flex flex-col items-start justify-center py-1 px-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b dark:border-slate-800 shadow-sm transition-all duration-300 ease-in-out landscape:hidden ${
              showHeaderTitle || isEditing || isPersonalEdit 
              ? 'translate-y-0 opacity-100' 
              : '-translate-y-full opacity-0 pointer-events-none'
          }`}
          style={{ top: 'calc(4rem + env(safe-area-inset-top))' }}
      >
          {authorName && (
              <div className="text-[8px] font-hindi font-bold text-saffron-600 dark:text-saffron-400 truncate uppercase tracking-wider mb-0 w-full text-left">
                  {authorName}
              </div>
          )}
          <div className="font-hindi font-bold text-base text-slate-800 dark:text-slate-100 w-full text-right leading-tight truncate">
              {(isEditing || isPersonalEdit) ? (
                  <span className="pointer-events-auto border-b border-saffron-400 pb-0.5">{editedTitle || 'Bhajan Title'}</span>
              ) : (
                  editedTitle
              )}
          </div>
      </div>

      {showFontPanel && (
        <div className="absolute top-[calc(4rem+env(safe-area-inset-top))] right-2 z-40 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-4 w-72 border dark:border-slate-700 animate-pop landscape:left-20 landscape:right-auto landscape:top-4">
           <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-2 uppercase text-slate-400">Size: {fontSize}px</div>
                <input type="range" min="12" max="60" step="2" value={fontSize} onChange={e => onChangeFontSize(parseInt(e.target.value))} className="w-full h-1.5 accent-saffron-500 rounded-lg appearance-none bg-slate-100 dark:bg-slate-700" />
              </div>
              
              <div className="pt-2 border-t dark:border-slate-700">
                <div className="flex justify-between text-xs font-bold mb-2 uppercase text-slate-400">
                  Spacing 
                  <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 rounded text-[10px]">{lineGap}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="16" 
                  step="1" 
                  value={lineGap} 
                  onChange={e => setLineGap(parseInt(e.target.value))} 
                  className="w-full h-1.5 accent-saffron-500 rounded-lg appearance-none bg-slate-100 dark:bg-slate-700" 
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t dark:border-slate-700">
                <div className="flex items-center gap-1.5">
                    <BookOpen size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase">Book Mode (Zoom/Pan)</span>
                </div>
                <button 
                  onClick={() => { triggerHaptic('light'); toggleBookMode(); }} 
                  className={`w-10 h-5 rounded-full transition-colors duration-200 relative ${isBookMode ? 'bg-saffron-500' : 'bg-slate-200 dark:bg-slate-600'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${isBookMode ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
           </div>
        </div>
      )}

      {/* Main Content & Audio Player Wrapper */}
      <div className="flex-1 flex flex-col h-full overflow-hidden landscape:flex-row">
        
        <div 
            ref={contentRef} 
            className={`flex-1 scroll-container select-none ${scrollBarSide === 'left' ? 'left-scrollbar' : ''} ${isBookMode ? 'overflow-hidden cursor-grab active:cursor-grabbing' : 'overflow-y-auto overflow-x-auto'} relative`}
            style={{ touchAction: isBookMode ? 'none' : 'pan-y' }}
            onClick={() => setShowFontPanel(false)}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div dir={scrollBarSide === 'left' ? 'ltr' : undefined} 
                className={`${maxWidthClass} mx-auto px-3 sm:px-6 py-8 pb-32 transition-transform duration-100 ease-out origin-center`}
                style={isBookMode ? { transform: `translate(${pan.x}px, ${pan.y}px) scale(${bookScale})` } : {}}
            >
            {!(isEditing || isPersonalEdit) && (
                <div className={`mb-8 mt-4 animate-fade-in-up ${isLeftAligned ? 'text-left' : 'text-center'}`}>
                <div className={`flex flex-col ${isLeftAligned ? 'items-start' : 'items-center'} mb-4 px-2`}>
                    
                    {/* Author Name - Top Left */}
                    {authorName && (
                        <div className={`text-[10px] font-hindi font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 text-left w-full`}>
                            {authorName}
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <h1 className="font-hindi font-bold text-3xl text-saffron-700 dark:text-saffron-400 leading-snug">
                            {editedTitle}
                        </h1>
                    </div>
                </div>
                <div className={`h-px w-24 bg-saffron-200 dark:bg-slate-800 ${isLeftAligned ? 'mr-auto' : 'mx-auto'}`} />
                </div>
            )}
            {(isEditing || isPersonalEdit) ? (
                <textarea 
                value={editedContent} 
                onChange={e => setEditedContent(e.target.value)} 
                className="w-full h-[60vh] p-4 font-hindi bg-white/50 dark:bg-slate-900/50 border border-saffron-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-saffron-400 transition-all" 
                style={{ fontSize: `${fontSize}px` }} 
                placeholder="Enter Bhajan Content..."
                />
            ) : (
                <div style={{ fontSize: `${fontSize}px` }}>{renderFormattedContent(editedContent)}</div>
            )}
            
            {!(isEditing || isPersonalEdit) && (
                <div className="mt-16 flex flex-col items-center">
                    <div className="font-logo text-2xl text-saffron-500 dark:text-saffron-400">RadheShyam</div>
                    
                    <div className="mt-2 px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm font-mono text-slate-400 dark:text-slate-500 flex items-center gap-2">
                        <Hash size={14} /> {bhajan.songNumber ?? bhajan.id}
                    </div>
                </div>
            )}
            </div>

            {/* Book Mode Zoom Controls */}
            {isBookMode && (
                <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-xl flex items-center gap-1 animate-in slide-in-from-bottom-4 landscape:bottom-auto landscape:top-1/2 landscape:-translate-y-1/2 landscape:left-auto landscape:translate-x-0 landscape:flex-col ${showAudioSidebar ? 'landscape:right-24' : 'landscape:right-4'}`}>
                    <button 
                        onClick={() => { triggerHaptic('light'); setBookScale(s => Math.max(1, s - 0.5)); }}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
                    >
                        <ZoomOut size={20}/>
                    </button>
                    <div className="w-12 text-center font-bold font-mono text-xs text-slate-800 dark:text-slate-200 landscape:py-1">
                        {Math.round(bookScale * 100)}%
                    </div>
                    <button 
                        onClick={() => { triggerHaptic('light'); setBookScale(s => Math.min(4, s + 0.5)); }}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
                    >
                        <ZoomIn size={20}/>
                    </button>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 landscape:w-6 landscape:h-px landscape:my-1 landscape:mx-0"></div>
                    <button 
                        onClick={() => { triggerHaptic('light'); setBookScale(1); setPan({x:0, y:0}); }}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                        title="Reset Zoom"
                    >
                        <RotateCcw size={18}/>
                    </button>
                </div>
            )}
        </div>

        {!(isEditing || isPersonalEdit) && (
            (bhajan.audio && bhajan.audio.length > 0) ? (
            <div className="flex-none landscape:w-20 landscape:h-full landscape:border-l landscape:border-slate-200 dark:landscape:border-slate-800">
                <AudioPlayer 
                audioTracks={bhajan.audio} 
                bhajanTitle={editedTitle} 
                activeDownloads={activeDownloads}
                onDownloadTrack={onDownloadTrack}
                parentBhajan={bhajan}
                contextQueue={contextQueue}
                queueName={queueName}
                />
            </div>
            ) : (
                <div className="fixed bottom-6 right-4 z-40 animate-in fade-in slide-in-from-bottom-4">
                    <button 
                        onClick={() => { triggerHaptic('light'); setShowRequestConfirm(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-saffron-200 dark:border-slate-700 rounded-full shadow-lg text-xs font-bold text-saffron-600 dark:text-saffron-400 hover:scale-105 transition-transform"
                    >
                        <MessageCircle size={16} />
                        {t.requestAudio}
                    </button>
                </div>
            )
        )}
      </div>

      {/* Playlist Modal */}
      {showPlaylistModal && createPortal(
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white dark:bg-slate-800 w-full max-w-sm landscape:max-w-lg rounded-2xl shadow-2xl p-5 flex flex-col max-h-[70vh] landscape:max-h-[90vh]">
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg dark:text-white">{t.savePlaylists}</h3>
                      <button onClick={() => setShowPlaylistModal(false)} className="p-1 text-slate-400"><XIcon size={20} /></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-2 mb-4 scroll-container">
                      {playlists.map(p => {
                          const isAdded = p.items.includes(bhajan.id);
                          return (
                              <button 
                                  key={p.id} 
                                  onClick={() => handleTogglePlaylist(p)}
                                  className={`w-full text-left p-3 rounded-xl flex justify-between items-center transition-all border ${
                                      isAdded 
                                        ? 'bg-saffron-50 dark:bg-slate-700 border-saffron-200 dark:border-saffron-500' 
                                        : 'bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-700 border-transparent'
                                  }`}
                              >
                                  <div className="flex-1 min-w-0">
                                      <span className={`font-bold block truncate ${isAdded ? 'text-saffron-700 dark:text-saffron-400' : 'text-slate-700 dark:text-white'}`}>{p.name}</span>
                                      <span className="text-xs text-slate-400">{p.items.length} {t.songs}</span>
                                  </div>
                                  <div className={`p-1 rounded-full ${isAdded ? 'text-saffron-600 dark:text-saffron-400' : 'text-slate-300 dark:text-slate-500'}`}>
                                      {isAdded ? <CheckSquare size={22} className="fill-current" /> : <Square size={22} />}
                                  </div>
                              </button>
                          );
                      })}
                      {playlists.length === 0 && <p className="text-center text-slate-400 text-sm py-4">{t.noPlaylists}</p>}
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700 shrink-0">
                      <div className="flex gap-2">
                          <input 
                              className="flex-1 p-3 bg-slate-100 dark:bg-slate-900 rounded-xl text-sm border-none outline-none focus:ring-2 focus:ring-saffron-500 dark:text-white"
                              placeholder={t.newPlaylist}
                              value={newPlaylistName}
                              onChange={e => setNewPlaylistName(e.target.value)}
                          />
                          <button 
                              onClick={handleCreateAndAdd}
                              disabled={!newPlaylistName.trim()}
                              className="bg-saffron-500 text-white p-3 rounded-xl disabled:opacity-50"
                          >
                              <Plus size={20} />
                          </button>
                      </div>
                  </div>
                  
                  <button 
                    onClick={() => setShowPlaylistModal(false)}
                    className="mt-3 w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl shrink-0"
                  >
                    {t.done}
                  </button>
              </div>
          </div>,
          document.body
      )}

      {/* Request Audio Confirmation Modal */}
      {showRequestConfirm && createPortal(
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 transform scale-100 transition-all animate-in zoom-in-95">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{t.requestConfirmTitle}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 whitespace-pre-line">
                    {isHindi 
                        ? <>क्या आप इस भजन (<strong>{editedTitle}</strong>) का ऑडियो अनुरोध करना चाहते हैं?</>
                        : <>Request the audio of this bhajan: <strong>{editedTitle}</strong>?</>
                    }
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowRequestConfirm(false)}
                        className="flex-1 py-2.5 text-slate-600 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-700 rounded-xl"
                    >
                        {t.cancel}
                    </button>
                    <button 
                        onClick={handleRequestAudio}
                        className="flex-1 py-2.5 text-white font-bold bg-green-500 hover:bg-green-600 rounded-xl shadow-lg flex items-center justify-center gap-2"
                    >
                        {t.confirm}
                    </button>
                </div>
            </div>
        </div>,
        document.body
      )}

      {/* Share Confirmation Modal */}
      {showShareConfirm && createPortal(
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 transform scale-100 transition-all animate-in zoom-in-95">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{t.shareTitle}</h3>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={executeShare}
                        className="w-full py-3 bg-saffron-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Share2 size={18} /> {t.shareText}
                    </button>
                    <button 
                        onClick={() => setShowShareConfirm(false)}
                        className="w-full py-3 text-slate-500 font-bold bg-slate-100 dark:bg-slate-700 rounded-xl"
                    >
                        {t.cancel}
                    </button>
                </div>
            </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const XIcon = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
