
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, RefreshCw, WifiOff, Maximize2, X, ZoomIn, ZoomOut, Calendar, Download, Loader2, Image as ImageIcon } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

interface DailyQuotesProps {
  onBack: () => void;
  scrollBarSide?: 'left' | 'right';
  devMode?: boolean;
}

const EXTENSIONS = ['JPG', 'jpg', 'PNG', 'png', 'jpeg'];

export const DailyQuotes: React.FC<DailyQuotesProps> = ({ onBack, scrollBarSide = 'left', devMode = false }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [extensionIndex, setExtensionIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Lightbox State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Sliding / Panning State
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, left: 0, top: 0 });
  const hasDragged = useRef(false);

  // Swipe Navigation State
  const touchStart = useRef({ x: 0, y: 0 });
  const touchEnd = useRef({ x: 0, y: 0 });

  // Pinch Zoom State
  const pinchStartDist = useRef<number>(0);
  const pinchStartZoom = useRef<number>(1);
  const isPinching = useRef<boolean>(false);
  const prevZoomLevel = useRef<number>(1);

  // History listener for Lightbox
  useEffect(() => {
    if (isLightboxOpen) {
      const id = `lightbox-${Date.now()}`;
      window.history.pushState({ isPopup: true, modalId: id }, '');
      const handler = () => {
          setIsLightboxOpen(false);
      };
      window.addEventListener('popstate', handler);
      return () => {
        window.removeEventListener('popstate', handler);
        if(window.history.state?.modalId === id) window.history.back();
      }
    }
  }, [isLightboxOpen]);

  // Smart Zoom Centering Effect
  useEffect(() => {
    if (isLightboxOpen && scrollRef.current) {
        const container = scrollRef.current;
        
        // 1. Switching from Fit (1) to Zoomed (>1)
        // We need a slight delay to allow the DOM to update dimensions before scrolling
        if (prevZoomLevel.current <= 1.01 && zoomLevel > 1.01) {
            setTimeout(() => {
                const centerX = (container.scrollWidth - container.clientWidth) / 2;
                const centerY = (container.scrollHeight - container.clientHeight) / 2;
                container.scrollTo({ left: centerX, top: centerY, behavior: 'instant' });
            }, 10);
        }
        // 2. Adjusting Zoom while already zoomed (e.g. 2x -> 2.5x)
        // This keeps the view centered on the same point as before zooming
        else if (prevZoomLevel.current > 1.01 && zoomLevel > 1.01 && prevZoomLevel.current !== zoomLevel) {
             const ratio = zoomLevel / prevZoomLevel.current;
             
             // Calculate center of current view
             const centerX = container.scrollLeft + container.clientWidth / 2;
             const centerY = container.scrollTop + container.clientHeight / 2;
             
             const newScrollLeft = (centerX * ratio) - container.clientWidth / 2;
             const newScrollTop = (centerY * ratio) - container.clientHeight / 2;

             container.scrollTo({ left: newScrollLeft, top: newScrollTop, behavior: 'instant' });
        }
        
        prevZoomLevel.current = zoomLevel;
    }
  }, [zoomLevel, isLightboxOpen]);

  // Month names in Hindi to match data keys (for display)
  const HINDI_MONTHS = [
    "जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून",
    "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"
  ];

  const WEEKDAYS = [
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];

  const formatDateDisplay = (date: Date): string => {
    const day = date.getDate();
    const monthIndex = date.getMonth();
    return `${day} ${HINDI_MONTHS[monthIndex]}`;
  };

  const formatYearDayDisplay = (date: Date): string => {
      return `${date.getFullYear()} ${WEEKDAYS[date.getDay()]}`;
  };

  // --- DYNAMIC IMAGE URL GENERATION ---
  
  // Calculate Day of Year (1 - 366) based on a LEAP YEAR (e.g. 2024)
  const getStaticDayOfYear = (date: Date) => {
    const month = date.getMonth();
    const day = date.getDate();
    const leapYearDate = new Date(2024, month, day);
    const start = new Date(2024, 0, 0); 
    const diff = leapYearDate.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  const getQuoteImageUrl = (date: Date) => {
    const dayOfYear = getStaticDayOfYear(date);
    const dayOfYearStr = String(dayOfYear).padStart(3, '0');
    
    const dayOfMonth = date.getDate();
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const monthStr = months[date.getMonth()];
    
    const ext = EXTENSIONS[extensionIndex];
    const fileName = `${dayOfYearStr}.${dayOfMonth}.${monthStr}.${ext}`;
    
    return `https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/1/${fileName}`;
  };

  const quoteImage = getQuoteImageUrl(currentDate);

  // Helper to determine boundaries
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const currentCheck = new Date(currentDate);
  currentCheck.setHours(0,0,0,0);
  
  const isToday = currentCheck.getTime() === today.getTime();
  
  const jan1 = new Date(today.getFullYear(), 0, 1);
  const isJan1 = currentCheck.getTime() === jan1.getTime();

  // Navigation Logic with Boundaries
  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    
    // Boundary Checks for Normal Users
    if (!devMode) {
       const checkNew = new Date(newDate);
       checkNew.setHours(0,0,0,0);
       
       if (checkNew > today) return; // Future
       if (checkNew < jan1) return;  // Pre Jan 1
    }

    setCurrentDate(newDate);
    setImageError(false);
    setIsLoading(true);
    setExtensionIndex(0); // Reset extension search
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setImageError(false);
    setIsLoading(true);
    setExtensionIndex(0); // Reset extension search
  };

  const handleRetry = () => {
      setIsLoading(true);
      setImageError(false);
      setExtensionIndex(0); // Restart extension search
  };

  const handleDownload = async () => {
    if (isDownloading || imageError) return;
    
    setIsDownloading(true);
    try {
        if (Capacitor.isNativePlatform()) {
            const safeDateStr = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
            const fileName = `cpbs-vani-${safeDateStr}-${Date.now()}.jpg`;
            
            const result = await Filesystem.downloadFile({
                path: fileName,
                url: quoteImage,
                directory: Directory.Documents
            });
             if (result.path) {
                alert('Image saved to Documents folder');
            } else {
                throw new Error("Download failed");
            }
        } else {
            // Web Logic
            const response = await fetch(quoteImage);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const safeDateStr = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
            const filename = `cpbs-vani-${safeDateStr}.jpg`;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }
    } catch (e) {
        console.error("Download failed", e);
        alert("Download failed. Check internet connection.");
    } finally {
        setIsDownloading(false);
    }
  };

  const openLightbox = () => {
      if (!imageError) {
          setZoomLevel(1);
          setIsLightboxOpen(true);
      }
  };

  const closeLightbox = () => {
      // Don't close if we just finished a pinch or drag
      if (!hasDragged.current && !isPinching.current) {
          setIsLightboxOpen(false);
      }
      hasDragged.current = false;
      isPinching.current = false;
  };

  const handleDoubleTap = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (zoomLevel > 1) {
          setZoomLevel(1);
      } else {
          setZoomLevel(3.0); // Double tap zooms to 300%
      }
  };

  // --- Mouse Drag Handlers (Desktop) ---
  const onMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1 || !scrollRef.current) return;
    e.preventDefault();
    setIsDragging(true);
    hasDragged.current = false;
    dragStart.current = {
        x: e.pageX,
        y: e.pageY,
        left: scrollRef.current.scrollLeft,
        top: scrollRef.current.scrollTop
    };
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const dx = e.pageX - dragStart.current.x;
    const dy = e.pageY - dragStart.current.y;
    
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        hasDragged.current = true;
    }

    scrollRef.current.scrollLeft = dragStart.current.left - dx;
    scrollRef.current.scrollTop = dragStart.current.top - dy;
  };

  // --- Helper for Pinch Distance ---
  const getTouchDistance = (touches: React.TouchList) => {
    return Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY
    );
  };

  // --- Touch Handlers (Swipe + Pinch) ---
  const onTouchStart = (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
          // Pinch Start
          isPinching.current = true;
          pinchStartDist.current = getTouchDistance(e.touches);
          pinchStartZoom.current = zoomLevel;
          return;
      }

      // Swipe/Pan Start
      isPinching.current = false;
      touchStart.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
      touchEnd.current = { x: 0, y: 0 }; 
  };

  const onTouchMove = (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
          // Pinch Move
          e.preventDefault(); // Prevent native browser zooming
          const currentDist = getTouchDistance(e.touches);
          
          if (pinchStartDist.current > 0) {
              const scale = currentDist / pinchStartDist.current;
              let newZoom = pinchStartZoom.current * scale;
              
              // Clamp zoom level (1.0 to 5.0)
              newZoom = Math.min(Math.max(newZoom, 1), 5.0);
              setZoomLevel(newZoom);
          }
          return;
      }

      // Swipe/Pan Move
      touchEnd.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
      // If fingers are lifted but one remains, or all lifted
      if (isPinching.current) {
          // If all fingers lifted, reset pinch flag
          if (e.touches.length === 0) {
              // Add a small delay before allowing click/swipe logic again to prevent accidental triggers
              setTimeout(() => { isPinching.current = false; }, 100);
          }
          return;
      }

      // 1. If zoomed in, do not swipe dates (allow native pan).
      if (zoomLevel > 1) return;
      
      // Ensure we actually moved
      if (touchEnd.current.x === 0 && touchEnd.current.y === 0) return;

      const dx = touchStart.current.x - touchEnd.current.x;
      const dy = touchStart.current.y - touchEnd.current.y;
      
      // LIGHTBOX SPECIFIC: Swipe Down/Up to close
      if (isLightboxOpen) {
          if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 100) {
              closeLightbox();
              return;
          }
      }
      
      // Horizontal Swipe to change date (works in both modes unless we return above)
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
          if (dx > 0) {
              // Swiped Left -> Next Day
              changeDate(1);
          } else {
              // Swiped Right -> Prev Day
              changeDate(-1);
          }
      }
      
      // Reset logic
      touchStart.current = { x: 0, y: 0 };
      touchEnd.current = { x: 0, y: 0 };
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header - Matches Screenshot Orange */}
      <div className="flex-none bg-saffron-500 text-white p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold font-hindi">नित्य वाणी</h2>
        </div>
        {!isToday && (
          <button 
             onClick={handleToday}
             className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors flex items-center gap-1.5"
          >
              <Calendar size={12} />
              आज (Today)
          </button>
        )}
      </div>

      {/* Content Area - Scrollbar Applied */}
      <div className={`flex-1 overflow-y-auto ${scrollBarSide === 'left' ? 'left-scrollbar' : ''}`}>
        <div dir={scrollBarSide === 'left' ? 'ltr' : undefined} className="p-4 pb-[calc(6rem+env(safe-area-inset-bottom))] flex flex-col items-center min-h-full">
          
          {/* Date Navigation Pill - Theme Aware */}
          <div className={`w-full max-w-md bg-white dark:bg-slate-800 rounded-full p-2 px-4 flex items-center justify-between shadow-lg mb-8 mt-4 landscape:mt-2 landscape:mb-12 border border-slate-200 dark:border-slate-700`}>
              <button 
                  onClick={() => changeDate(-1)}
                  disabled={!devMode && isJan1}
                  className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors ${!devMode && isJan1 ? 'opacity-20 cursor-not-allowed' : ''}`}
              >
                  <ChevronLeft size={24} />
              </button>
              
              <div className="flex flex-col items-center">
                  <span className="text-xl font-bold text-saffron-500 font-hindi leading-none mb-1">
                      {formatDateDisplay(currentDate)}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-sans tracking-wide">
                      {formatYearDayDisplay(currentDate)}
                  </span>
              </div>

              <button 
                  onClick={() => changeDate(1)}
                  disabled={!devMode && isToday}
                  className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors ${!devMode && isToday ? 'opacity-20 cursor-not-allowed' : ''}`}
              >
                  <ChevronRight size={24} />
              </button>
          </div>

          {/* Main Card - Theme Aware */}
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative landscape:mt-2">
              
              {/* Quote Image Container */}
              <div className="relative min-h-[300px] flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden group">
                  {!imageError ? (
                      <>
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center z-0">
                                <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-700 border-t-saffron-500 rounded-full animate-spin"></div>
                            </div>
                        )}
                        <img 
                            src={quoteImage} 
                            alt={`Quote for ${formatDateDisplay(currentDate)}`} 
                            onClick={openLightbox}
                            className={`w-full h-auto rounded-xl shadow-inner relative z-10 transition-all duration-300 cursor-zoom-in ${isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                            onLoad={() => setIsLoading(false)}
                            onError={() => {
                                if (extensionIndex < EXTENSIONS.length - 1) {
                                    setExtensionIndex(prev => prev + 1);
                                } else {
                                    setImageError(true);
                                    setIsLoading(false);
                                }
                            }}
                        />
                        {!isLoading && (
                             <>
                                <button 
                                    onClick={openLightbox}
                                    className="absolute bottom-3 right-3 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition-all z-20 shadow-lg"
                                    title="Zoom Image"
                                >
                                    <Maximize2 size={20} />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                                    disabled={isDownloading}
                                    className="absolute bottom-3 left-3 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition-all z-20 shadow-lg disabled:opacity-50"
                                    title="Download Quote"
                                >
                                    {isDownloading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                                </button>
                             </>
                        )}
                      </>
                  ) : (
                      <div className="py-12 text-slate-500 flex flex-col items-center justify-center w-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                          <WifiOff className="w-10 h-10 opacity-50 mb-4" />
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Image not available</p>
                          <button 
                             onClick={handleRetry}
                             className="mt-4 flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-saffron-500 dark:text-saffron-400 px-4 py-2 rounded-full text-xs font-bold transition-colors"
                          >
                             <RefreshCw size={14} /> Retry
                          </button>
                      </div>
                  )}
              </div>
          </div>
          
        </div>
      </div>

      {/* Zoom Lightbox */}
      {isLightboxOpen && (
          <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col animate-in fade-in duration-200">
              
              {/* Toolbar */}
              <div className="flex-none p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center justify-between bg-black/50 backdrop-blur-sm z-20">
                  <div className="text-white/80 text-sm font-medium">
                      {formatDateDisplay(currentDate)}
                  </div>
                  <div className="flex items-center gap-3">
                      <button 
                          onClick={handleDownload}
                          disabled={isDownloading}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors disabled:opacity-50"
                          title="Download"
                      >
                          {isDownloading ? <Loader2 size={24} className="animate-spin" /> : <Download size={24} />}
                      </button>
                      <button 
                          onClick={() => setIsLightboxOpen(false)}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                      >
                          <X size={24} />
                      </button>
                  </div>
              </div>

              {/* Scrollable Image Area with Drag/Swipe Support */}
              <div 
                  ref={scrollRef}
                  className={`flex-1 overflow-auto w-full h-full relative ${zoomLevel > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
                  onClick={closeLightbox}
                  onMouseDown={onMouseDown}
                  onMouseUp={onMouseUp}
                  onMouseLeave={onMouseUp}
                  onMouseMove={onMouseMove}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
              >
                   <div className={`min-w-full min-h-full flex ${zoomLevel > 1 ? 'items-start justify-start' : 'items-center justify-center'} p-4`}>
                       <img 
                          src={quoteImage}
                          alt="Full Quote"
                          onClick={(e) => e.stopPropagation()}
                          onDoubleClick={handleDoubleTap}
                          draggable={false}
                          className="transition-all duration-200 ease-out shadow-2xl select-none"
                          style={{ 
                              // Use width/height scaling for native scrolling compatibility
                              width: zoomLevel === 1 ? 'auto' : `${zoomLevel * 100}%`,
                              height: zoomLevel === 1 ? 'auto' : 'auto',
                              maxWidth: zoomLevel === 1 ? '100%' : 'none',
                              maxHeight: zoomLevel === 1 ? '100%' : 'none',
                              objectFit: 'contain',
                              touchAction: zoomLevel > 1 ? 'pan-x pan-y' : 'pan-y'
                          }}
                       />
                   </div>
                   
                   {/* Swipe Hints (Visible only at 1x Zoom and only for Devs/Admins if unrestricted) */}
                   {zoomLevel === 1 && devMode && (
                       <>
                         <button onClick={(e) => { e.stopPropagation(); changeDate(-1); }} className="absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-white/20 rounded-full text-white/50 hover:text-white transition-all">
                             <ChevronLeft size={32} />
                         </button>
                         <button onClick={(e) => { e.stopPropagation(); changeDate(1); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-white/20 rounded-full text-white/50 hover:text-white transition-all">
                             <ChevronRight size={32} />
                         </button>
                       </>
                   )}
              </div>
          </div>
      )}

    </div>
  );
};
