
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Book } from '../types';
import { ArrowLeft, Loader2, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Download, ExternalLink, RefreshCw, AlertCircle, Bookmark } from 'lucide-react';
import { getCachedBookUrl, isBookDownloaded, deleteBook } from '../utils/bookStorage';
import { injectPdfEngine, downloadPdfEngine } from '../services/pdfLoader';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';

interface BookReaderProps {
  book: Book;
  onBack: () => void;
  scrollBarSide?: 'left' | 'right';
}

export const BookReader: React.FC<BookReaderProps> = ({ book, onBack }) => {
  const { bookmarks, setBookmark, removeBookmark } = useData();
  const { showToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null); // To track specific error kind
  
  // Retry mechanism state
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [isFixingEngine, setIsFixingEngine] = useState(false);

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const minScale = useRef(1);
  
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const startTransform = useRef({ x: 0, y: 0 });
  const dragConstraints = useRef({ minX: 0, maxX: 0, minY: 0, maxY: 0 });
  
  const isPinching = useRef(false);
  const pinchStartDist = useRef(0);
  const pinchStartTransform = useRef({ x: 0, y: 0, scale: 1 });
  const pinchCenter = useRef({ x: 0, y: 0 });

  const isBookmarked = bookmarks[book.id] === pageNum;

  useEffect(() => {
    let active = true;
    let loadingTask: any = null;

    const loadPdf = async () => {
      setIsLoading(true);
      setError(null);
      setErrorType(null);
      
      try {
        // Enforce Offline Reading Only
        if (!isBookDownloaded(book.id)) {
            throw new Error("NOT_DOWNLOADED");
        }

        // 1. Inject Engine from DB if needed
        try {
            await injectPdfEngine();
        } catch (e) {
            throw new Error("ENGINE_LOAD_FAILED");
        }

        // Access the global PDF.js library (now injected)
        const pdfjsLib = (window as any).pdfjsLib;

        if (!pdfjsLib) {
             throw new Error("ENGINE_NOT_READY");
        }

        // 2. Load Book from Cache
        const cachedUrl = await getCachedBookUrl(book.id);
        if (!cachedUrl) {
            throw new Error("CACHE_MISS");
        }

        loadingTask = pdfjsLib.getDocument(cachedUrl);
        const pdf = await loadingTask.promise;
        
        if (active) {
            setPdfDoc(pdf);
            setNumPages(pdf.numPages);
            
            // Check bookmark
            const savedPage = bookmarks[book.id];
            if (savedPage && savedPage > 0 && savedPage <= pdf.numPages) {
                setPageNum(savedPage);
                showToast(`Resumed from page ${savedPage}`, 'info');
            } else {
                setPageNum(1);
            }
            
            setIsLoading(false);
        }
      } catch (err: any) {
        if (active) {
            console.error("PDF Load Error:", err);
            
            // Check for corruption errors
            const isCorrupt = err.name === 'MissingPDFException' 
                           || err.name === 'InvalidPDFException' 
                           || err.message?.includes('Invalid PDF structure')
                           || err.message?.includes('Invalid PDF');

            if (err.message === "NOT_DOWNLOADED" || err.message === "CACHE_MISS") {
                setError("Book file not found. Please go back and download it again.");
                setErrorType("DOWNLOAD");
            } else if (err.message === "ENGINE_LOAD_FAILED" || err.message === "ENGINE_NOT_READY") {
                setError("PDF Viewer Library is missing or corrupted.");
                setErrorType("ENGINE");
            } else if (isCorrupt) {
                // Crucial: Delete the bad file so the user can try again
                await deleteBook(book.id); 
                setError("Download corrupted. File has been deleted. Please download again.");
                setErrorType("DOWNLOAD");
            } else {
                setError(`Unexpected Error: ${err.message || 'Unknown'}`);
                setErrorType("UNKNOWN");
            }
            setIsLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      active = false;
      if (loadingTask) { try { loadingTask.destroy(); } catch(e) {} }
    };
  }, [book, retryTrigger]);

  const handleFixAndRetry = async () => {
      if (errorType === 'ENGINE') {
          setIsFixingEngine(true);
          try {
              await downloadPdfEngine();
              setRetryTrigger(prev => prev + 1); // Trigger re-render
          } catch (e) {
              console.error(e);
              alert("Failed to download library. Please check your internet connection.");
          } finally {
              setIsFixingEngine(false);
          }
      } else {
          // Generic retry
          setRetryTrigger(prev => prev + 1);
      }
  };

  const handleToggleBookmark = () => {
      if (isBookmarked) {
          removeBookmark(book.id);
      } else {
          setBookmark(book.id, pageNum);
      }
  };

  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || !containerRef.current) return;

    if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel(); } catch (e) {}
    }
    
    try {
        const page = await pdfDoc.getPage(pageNum);
        const containerWidth = containerRef.current.clientWidth;
        
        // 1. Get Device Pixel Ratio (DPR) for sharp text
        const dpr = window.devicePixelRatio || 1;
        
        // 2. Calculate Scale
        // We render at a higher resolution (High Quality) to support zooming without blur.
        // Factor of 2.0 extra allows 200% zoom with native 1:1 pixel mapping.
        const qualityFactor = 2.5; 
        
        // Get unscaled dimensions
        const unscaledViewport = page.getViewport({ scale: 1 });
        
        // Calculate the scale needed to fill the screen *at high DPI*
        const fitScale = (containerWidth - 10) / unscaledViewport.width;
        
        // Target render scale combining fit, dpr, and extra quality
        let renderScale = fitScale * dpr * qualityFactor;
        
        // 3. Safety Cap for Texture Size
        // iOS/Mobile browsers often crash if canvas > 4096px or 16MP total
        const maxDimension = 4096; 
        const proposedViewport = page.getViewport({ scale: renderScale });
        
        if (proposedViewport.width > maxDimension || proposedViewport.height > maxDimension) {
            const ratio = Math.min(
                maxDimension / proposedViewport.width,
                maxDimension / proposedViewport.height
            );
            renderScale = renderScale * ratio;
        }

        const viewport = page.getViewport({ scale: renderScale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (canvas && context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // 4. Calculate Visual CSS Scale (Transform)
            // We want the huge canvas to shrink down to fit the screen container initially.
            // visualScale * viewport.width = (containerWidth - 10)
            const startVisualScale = (containerWidth - 10) / viewport.width;
            
            minScale.current = startVisualScale;
            
            // Center visually
            const x = (containerWidth - viewport.width * startVisualScale) / 2;
            const y = 20; 

            setTransform({ x, y, scale: startVisualScale });

            const renderContext = { canvasContext: context, viewport: viewport };
            const renderTask = page.render(renderContext);
            renderTaskRef.current = renderTask;
            await renderTask.promise;
        }
    } catch (err: any) {
        if (err.name !== 'RenderingCancelledException') {
            console.error("Render Error:", err);
        }
    }
  }, [pdfDoc, pageNum]);

  useEffect(() => {
      renderPage();
  }, [renderPage]);

  // --- Interaction Handlers ---
  const handlePointerDown = (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (isPinching.current || !containerRef.current) return;
      isDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      startTransform.current = { x: transform.x, y: transform.y };
      
      const cw = containerRef.current.clientWidth;
      const ch = containerRef.current.clientHeight;
      const sw = canvasRef.current!.width * transform.scale;
      const sh = canvasRef.current!.height * transform.scale;

      if (sw > cw) { dragConstraints.current.minX = cw - sw; dragConstraints.current.maxX = 0; }
      else { const cx = (cw - sw) / 2; dragConstraints.current.minX = cx; dragConstraints.current.maxX = cx; }

      if (sh > ch) { dragConstraints.current.minY = ch - sh; dragConstraints.current.maxY = 0; }
      else { const cy = (ch - sh) / 2; dragConstraints.current.minY = cy; dragConstraints.current.maxY = cy; }
      
      (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
      if (!isDragging.current || isPinching.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setTransform(prev => ({
          ...prev,
          x: Math.min(Math.max(startTransform.current.x + dx, dragConstraints.current.minX), dragConstraints.current.maxX),
          y: Math.min(Math.max(startTransform.current.y + dy, dragConstraints.current.minY), dragConstraints.current.maxY)
      }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
      isDragging.current = false;
      try { (e.target as Element).releasePointerCapture(e.pointerId); } catch(e){}
  };

  const getTouchDistance = (touches: React.TouchList) => Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);

  const handleTouchStart = (e: React.TouchEvent) => {
      if (e.touches.length === 2 && containerRef.current) {
          isPinching.current = true;
          isDragging.current = false;
          pinchStartDist.current = getTouchDistance(e.touches);
          pinchStartTransform.current = { ...transform };
          
          const rect = containerRef.current.getBoundingClientRect();
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];
          const cx = (touch1.clientX + touch2.clientX) / 2;
          const cy = (touch1.clientY + touch2.clientY) / 2;
          
          pinchCenter.current = {
              x: cx - rect.left,
              y: cy - rect.top
          };
      }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      if (e.touches.length === 2 && isPinching.current) {
          e.preventDefault(); 
          const dist = getTouchDistance(e.touches);
          const factor = dist / pinchStartDist.current;
          
          // Allow zooming up to 5x relative to current, or absolute max based on texture
          // We limit relative zoom for UX stability
          const newScale = Math.max(minScale.current, Math.min(pinchStartTransform.current.scale * factor, minScale.current * 8.0));
          
          // Calculate new translation to keep pinch center fixed
          const start = pinchStartTransform.current;
          const center = pinchCenter.current;
          const scaleRatio = newScale / start.scale;
          
          const newX = center.x - (center.x - start.x) * scaleRatio;
          const newY = center.y - (center.y - start.y) * scaleRatio;
          
          setTransform({ x: newX, y: newY, scale: newScale });
      }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
      if (e.touches.length < 2) isPinching.current = false;
  };

  // Bounds Checking & Centering Effect
  useEffect(() => {
      if (!containerRef.current || !canvasRef.current) return;
      setTransform(prev => {
          const cw = containerRef.current!.clientWidth;
          const ch = containerRef.current!.clientHeight;
          const sw = canvasRef.current!.width * prev.scale;
          const sh = canvasRef.current!.height * prev.scale;
          let { x, y } = prev;
          
          // Center horizontally if smaller than container, else clamp
          if (sw <= cw) x = (cw - sw) / 2;
          else { if (x > 0) x = 0; if (x < cw - sw) x = cw - sw; }
          
          // Center vertically if smaller than container, else clamp
          if (sh <= ch) y = (ch - sh) / 2;
          else { if (y > 0) y = 0; if (y < ch - sh) y = ch - sh; }
          
          return { ...prev, x, y };
      });
  }, [transform.scale]);

  const changePage = (newPage: number) => {
      const p = Math.max(1, Math.min(numPages, newPage));
      if (p !== pageNum) setPageNum(p);
  };

  const zoomIn = () => {
      setTransform(prev => {
          if (!containerRef.current) return prev;
          const cw = containerRef.current.clientWidth;
          const ch = containerRef.current.clientHeight;
          // Zoom towards center of container
          const cx = cw / 2;
          const cy = ch / 2;
          
          const newScale = Math.min(prev.scale * 1.5, minScale.current * 8);
          if (newScale === prev.scale) return prev;
          
          const factor = newScale / prev.scale;
          const newX = cx - (cx - prev.x) * factor;
          const newY = cy - (cy - prev.y) * factor;
          
          return { x: newX, y: newY, scale: newScale };
      });
  };

  const zoomOut = () => {
      setTransform(prev => {
          if (!containerRef.current) return prev;
          const cw = containerRef.current.clientWidth;
          const ch = containerRef.current.clientHeight;
          const cx = cw / 2;
          const cy = ch / 2;

          const newScale = Math.max(prev.scale / 1.5, minScale.current);
          if (newScale === prev.scale) return prev;

          const factor = newScale / prev.scale;
          const newX = cx - (cx - prev.x) * factor;
          const newY = cy - (cy - prev.y) * factor;
          
          return { x: newX, y: newY, scale: newScale };
      });
  };

  const [sliderValue, setSliderValue] = useState(1);
  const [isSliding, setIsSliding] = useState(false);
  useEffect(() => setSliderValue(pageNum), [pageNum]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-900 flex flex-col landscape:flex-row animate-in slide-in-from-right duration-300">
      
      {/* Header (Top in Portrait, Left in Landscape) */}
      <div className="flex-none bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 p-2 pt-[calc(0.5rem+env(safe-area-inset-top))] flex items-center gap-2 z-20 shadow-sm
          landscape:w-16 landscape:h-full landscape:flex-col landscape:border-b-0 landscape:border-r landscape:pt-[env(safe-area-inset-top)] landscape:justify-between landscape:pb-4">
         
         <button onClick={onBack} className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95">
            <ArrowLeft size={24} className="text-slate-700 dark:text-slate-200" />
         </button>
         
         <div className="flex-1 min-w-0 text-center landscape:hidden">
             <h2 className="font-bold text-slate-800 dark:text-white truncate text-base">{book.title}</h2>
             <p className="text-[10px] text-green-600 dark:text-green-400 truncate font-mono uppercase tracking-wider font-bold">
               Offline Reader (HD)
             </p>
         </div>

         {/* Bookmark Button */}
         <button 
            onClick={handleToggleBookmark} 
            className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
            disabled={isLoading || !!error}
            title="Bookmark"
         >
            <Bookmark size={22} className={isBookmarked ? "fill-current text-saffron-500" : "text-slate-400 dark:text-slate-500"} />
         </button>
      </div>

      {/* Main Canvas Area */}
      <div 
        ref={containerRef}
        className="flex-1 relative bg-slate-100 dark:bg-black w-full h-full overflow-hidden touch-none select-none cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
         {isLoading && !error && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 z-10 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                 <Loader2 className="w-10 h-10 text-saffron-500 animate-spin mb-4" />
                 <p className="text-sm font-medium">Opening Book...</p>
             </div>
         )}

         {error && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 z-10 px-8 text-center bg-slate-50 dark:bg-slate-900">
                 <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle size={32} />
                 </div>
                 
                 <p className="text-slate-800 dark:text-white font-bold mb-2 text-lg">Unable to Open Book</p>
                 <p className="text-sm mb-8 max-w-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {error}
                 </p>
                 
                 <div className="flex flex-col gap-3 w-full max-w-xs">
                    {errorType === 'ENGINE' && (
                        <button 
                            onClick={handleFixAndRetry}
                            disabled={isFixingEngine}
                            className="bg-saffron-500 hover:bg-saffron-600 text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isFixingEngine ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Downloading...
                                </>
                            ) : (
                                <>
                                    <RefreshCw size={18} />
                                    Download Library & Retry
                                </>
                            )}
                        </button>
                    )}

                    {errorType === 'DOWNLOAD' && (
                        <button onClick={onBack} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                            Go Back & Download Again
                        </button>
                    )}

                    {book.url && errorType !== 'ENGINE' && (
                        <button 
                            onClick={() => window.open(book.url, '_blank')}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 px-6 py-3.5 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                            <ExternalLink size={16} /> View Online (Drive)
                        </button>
                    )}
                    
                    {errorType !== 'DOWNLOAD' && (
                        <button onClick={onBack} className="text-slate-500 dark:text-slate-400 px-6 py-3 text-sm font-bold hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                            Cancel & Go Back
                        </button>
                    )}
                 </div>
             </div>
         )}
         
         <div style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0', willChange: 'transform', position: 'absolute', top: 0, left: 0 }}>
             <canvas ref={canvasRef} className="shadow-2xl bg-white" />
         </div>
         
         {isSliding && (
             <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                 <div className="bg-black/70 backdrop-blur-md text-white px-6 py-3 rounded-2xl text-2xl font-bold shadow-xl animate-in zoom-in duration-200">
                     Page {sliderValue}
                 </div>
             </div>
         )}
      </div>

      {/* Bottom Control Bar (Bottom in Portrait, Right in Landscape) */}
      {!isLoading && !error && (
          <div className="flex-none bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-[calc(0.2rem+env(safe-area-inset-bottom))] z-20 transition-all duration-300
              landscape:w-20 landscape:h-full landscape:flex-col landscape:border-t-0 landscape:border-l landscape:pb-4 landscape:pt-[env(safe-area-inset-top)] landscape:justify-between">
              
              {/* Slider Section */}
              <div className="px-2 pt-2 flex items-center gap-2 mb-1 landscape:flex-col landscape:h-1/2 landscape:w-full landscape:mb-0 landscape:justify-center landscape:order-2">
                  <span className="text-[9px] font-bold text-slate-400 w-5 text-right landscape:text-center landscape:w-full">{pageNum}</span>
                  
                  <div className="flex-1 relative h-3 flex items-center w-full landscape:h-full landscape:w-3 landscape:justify-center">
                      <input 
                        type="range" 
                        min="1" 
                        max={numPages} 
                        value={sliderValue} 
                        onChange={(e) => { setSliderValue(parseInt(e.target.value)); setIsSliding(true); }} 
                        onTouchEnd={() => { setIsSliding(false); changePage(sliderValue); }} 
                        onMouseUp={() => { setIsSliding(false); changePage(sliderValue); }} 
                        className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-saffron-500 landscape:h-full landscape:w-1 landscape:[appearance:slider-vertical] landscape:rotate-180" 
                      />
                  </div>
                  
                  <span className="text-[9px] font-bold text-slate-400 w-5 landscape:text-center landscape:w-full">{numPages}</span>
              </div>

              {/* Controls Grid */}
              <div className="grid grid-cols-2 gap-3 px-3 pb-2 h-10 landscape:flex landscape:flex-col landscape:h-auto landscape:w-full landscape:px-2 landscape:gap-4 landscape:order-1">
                  
                  {/* Prev/Next */}
                  <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700 landscape:flex-col landscape:h-24 landscape:w-full">
                      <button onClick={() => changePage(pageNum - 1)} disabled={pageNum <= 1} className="flex-1 h-full w-full flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded-md disabled:opacity-30 transition-all active:scale-95">
                        <ChevronLeft size={18} className="text-slate-700 dark:text-slate-300 landscape:rotate-90" />
                      </button>
                      <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1 landscape:w-4 landscape:h-px landscape:my-1"></div>
                      <button onClick={() => changePage(pageNum + 1)} disabled={pageNum >= numPages} className="flex-1 h-full w-full flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded-md disabled:opacity-30 transition-all active:scale-95">
                        <ChevronRight size={18} className="text-slate-700 dark:text-slate-300 landscape:rotate-90" />
                      </button>
                  </div>

                  {/* Zoom Controls */}
                  <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700 landscape:flex-col landscape:h-24 landscape:w-full landscape:order-3">
                      <button onClick={zoomIn} className="flex-1 h-full w-full flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all active:scale-95">
                        <ZoomIn size={16} className="text-slate-700 dark:text-slate-300" />
                      </button>
                      
                      <div className="px-2 min-w-[2.5rem] text-center landscape:py-1">
                        <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400">{Math.round((transform.scale / minScale.current) * 100)}%</span>
                      </div>
                      
                      <button onClick={zoomOut} disabled={transform.scale <= minScale.current * 1.01} className="flex-1 h-full w-full flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded-md disabled:opacity-30 transition-all active:scale-95">
                        <ZoomOut size={16} className="text-slate-700 dark:text-slate-300" />
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
