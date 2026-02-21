
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, Download, X, Maximize2, Loader2, Image as ImageIcon, ZoomIn, ZoomOut, FolderHeart, ChevronRight } from 'lucide-react';
import { DarshanImage } from '../types';
import { DARSHAN_CATEGORIES, DarshanCategory, fetchDarshanCategory } from '../data/dailyDarshan';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

interface DailyDarshanScreenProps {
  onBack: () => void;
  scrollBarSide?: 'left' | 'right';
}

export const DailyDarshanScreen: React.FC<DailyDarshanScreenProps> = ({ onBack, scrollBarSide = 'left' }) => {
  // Navigation State
  const [selectedCategory, setSelectedCategory] = useState<DarshanCategory | null>(null);
  
  // Data State
  const [images, setImages] = useState<DarshanImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<DarshanImage | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); 
  const [isDownloading, setIsDownloading] = useState(false);
  const [categoryPreviews, setCategoryPreviews] = useState<Record<string, string>>({});

  // Zoom State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isZooming, setIsZooming] = useState(false); 
  
  const lastDist = useRef<number | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });

  // --- Effects ---

  // Fetch images when category or refresh key changes
  useEffect(() => {
    if (selectedCategory) {
      loadImages(selectedCategory);
    } else {
      setImages([]); // Clear images when going back to folder view
      
      // Load previews for categories
      DARSHAN_CATEGORIES.forEach(async (cat) => {
        setCategoryPreviews(prev => {
          if (prev[cat.id]) return prev; // Already loaded
          
          // Fetch if not loaded
          fetchDarshanCategory(cat).then(catImages => {
            if (catImages.length > 0) {
              setCategoryPreviews(current => ({ ...current, [cat.id]: catImages[0].imageUrl }));
            }
          }).catch(e => console.error("Failed to load preview for", cat.id, e));
          
          return prev;
        });
      });
    }
  }, [selectedCategory, refreshKey]);

  // Handle Hardware Back Button & PopState
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Priority 1: Close Image Viewer if open
      if (selectedImage) {
        setSelectedImage(null);
        setScale(1);
        setPosition({x:0, y:0});
        return;
      } 
      
      // Priority 2: Go back to Category List if in a category
      if (selectedCategory) {
        setSelectedCategory(null);
        return;
      } 
      
      // Priority 3: Close Screen (App level back)
      // If we are at the root, App.tsx or parent handles the final pop
      onBack();
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => {
       window.removeEventListener('popstate', handlePopState);
    };
  }, [selectedCategory, selectedImage, onBack]);

  const loadImages = async (category: DarshanCategory) => {
      setLoading(true);
      const results = await fetchDarshanCategory(category);
      setImages(results);
      setLoading(false);
  };

  const handleCategorySelect = (category: DarshanCategory) => {
      // Push history state for folder navigation
      window.history.pushState({ isPopup: true, view: 'darshan-category' }, '');
      setSelectedCategory(category);
  };

  const handleBackPress = () => {
      if (selectedImage || selectedCategory) {
          window.history.back(); // Triggers popstate listener
      } else {
          onBack();
      }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const openImage = (img: DarshanImage) => {
      // Push history state for image viewer
      window.history.pushState({ isPopup: true, view: 'darshan-image' }, '');
      setSelectedImage(img);
  };

  const closeImage = () => {
      window.history.back(); // Triggers popstate listener
  };

  const handleDownload = async (img: DarshanImage) => {
    if (!img || !img.imageUrl || isDownloading) return;
    
    setIsDownloading(true);
    try {
        if (Capacitor.isNativePlatform()) {
            // Native: Use Filesystem.downloadFile to bypass WebView CORS and handle large files
            const fileName = `cpbs-darshan-${img.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.jpg`;
            
            const result = await Filesystem.downloadFile({
                path: fileName,
                url: img.imageUrl,
                directory: Directory.Documents
            });
            
            if (result.path) {
                alert('Image saved to Documents folder');
            } else {
                throw new Error("Native download failed");
            }
        } else {
            // Web: Standard Blob download
            const response = await fetch(img.imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const filename = `cpbs-darshan-${img.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.jpg`;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }
    } catch (e) {
        console.error("Download failed", e);
        if (!Capacitor.isNativePlatform()) {
            window.open(img.imageUrl, '_blank');
        } else {
            alert("Download failed. Check internet connection.");
        }
    } finally {
        setIsDownloading(false);
    }
  };

  // --- Zoom Handlers ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
       const dist = Math.hypot(
         e.touches[0].clientX - e.touches[1].clientX,
         e.touches[0].clientY - e.touches[1].clientY
       );
       lastDist.current = dist;
       setIsZooming(true);
    } else if (e.touches.length === 1 && scale > 1) {
       setIsDragging(true);
       dragStart.current = { 
         x: e.touches[0].clientX - position.x, 
         y: e.touches[0].clientY - position.y 
       };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastDist.current) {
        e.preventDefault();
        const dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = dist / lastDist.current;
        const newScale = Math.min(Math.max(1, scale * factor), 5);
        setScale(newScale);
        lastDist.current = dist;
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
        e.preventDefault();
        const x = e.touches[0].clientX - dragStart.current.x;
        const y = e.touches[0].clientY - dragStart.current.y;
        setPosition({ x, y });
    }
  };

  const handleTouchEnd = () => {
    lastDist.current = null;
    setIsDragging(false);
    setIsZooming(false);
    if (scale <= 1) {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    }
  };

  const handleDoubleTap = () => {
      if (scale > 1) {
          setScale(1);
          setPosition({ x: 0, y: 0 });
      } else {
          setScale(2.5);
      }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#fdfbf7] dark:bg-slate-950 flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="flex-none bg-[#fdfbf7]/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-[#bc8d31]/30 p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center justify-between z-10 sticky top-0 shadow-sm">
        <div className="flex items-center gap-4">
            <button onClick={handleBackPress} className="p-2 hover:bg-[#bc8d31]/10 rounded-full transition-colors active:scale-95 text-[#bc8d31]">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-[#bc8d31] leading-none tracking-wide" style={{ fontFamily: '"Kaushan Script", cursive' }}>
                {selectedCategory ? selectedCategory.title : 'Daily Darshan'}
              </h2>
              {selectedCategory && !loading && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center gap-1">
                   {images.length} Images
                </p>
              )}
            </div>
        </div>
        
        {selectedCategory && (
            <button 
            onClick={handleRefresh}
            disabled={loading}
            className={`p-2.5 rounded-full bg-[#bc8d31]/10 dark:bg-slate-800 text-[#bc8d31] hover:bg-[#bc8d31]/20 dark:hover:bg-slate-700 transition-colors ${loading ? 'animate-spin opacity-50' : ''}`}
            title="Refresh Images"
            >
            <RefreshCw size={18} />
            </button>
        )}
      </div>

      {/* Main Content */}
      <div className={`flex-1 overflow-y-auto ${scrollBarSide === 'left' ? 'left-scrollbar' : ''} p-4 pb-[calc(3rem+env(safe-area-inset-bottom))]`}>
        <div dir={scrollBarSide === 'left' ? 'ltr' : undefined} className="max-w-6xl mx-auto min-h-[50vh]">
          
          {/* VIEW 1: CATEGORY LIST */}
          {!selectedCategory && (
              <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Select Temple / Location</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                      {DARSHAN_CATEGORIES.map((cat, idx) => {
                          const previewUrl = categoryPreviews[cat.id];
                          return (
                          <button 
                            key={cat.id}
                            onClick={() => handleCategorySelect(cat)}
                            className="relative overflow-hidden aspect-[4/5] bg-[#fdfbf7] dark:bg-slate-800 rounded-3xl border border-[#bc8d31]/30 shadow-sm hover:shadow-md hover:border-[#bc8d31]/60 transition-all text-left group animate-fade-in-up flex flex-col justify-end"
                            style={{ animationDelay: `${idx * 50}ms` }}
                          >
                              {previewUrl ? (
                                  <>
                                      <img src={previewUrl} alt={cat.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                  </>
                              ) : (
                                  <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
                                      <FolderHeart size={64} className="text-[#bc8d31]" />
                                  </div>
                              )}
                              
                              <div className="relative z-10 p-4 w-full">
                                  <h4 className={`font-bold text-sm sm:text-base leading-tight transition-colors ${previewUrl ? 'text-white' : 'text-slate-800 dark:text-white group-hover:text-[#bc8d31]'}`}>
                                      {cat.title}
                                  </h4>
                                  {cat.subtitle && (
                                      <p className={`text-[10px] sm:text-xs mt-1.5 line-clamp-2 font-medium ${previewUrl ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>{cat.subtitle}</p>
                                  )}
                              </div>
                          </button>
                      )})}
                  </div>
              </div>
          )}

          {/* VIEW 2: IMAGE GRID */}
          {selectedCategory && (
              <>
                {/* Loading State */}
                {loading && images.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 animate-fade-in-up">
                        <Loader2 className="w-10 h-10 text-[#bc8d31] animate-spin mb-4" />
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading {selectedCategory.title}...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && images.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-center animate-fade-in-up">
                        <div className="w-16 h-16 bg-[#bc8d31]/10 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-[#bc8d31]">
                            <ImageIcon size={32} />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">No images found in this folder.</p>
                        <button onClick={handleRefresh} className="mt-4 text-[#bc8d31] text-sm font-bold hover:underline">Try Refreshing</button>
                    </div>
                )}

                {/* Grid Layout */}
                {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 landscape:grid-cols-4 gap-3 md:gap-4">
                        {images.map((item, index) => (
                            <div 
                                key={item.id} 
                                onClick={() => openImage(item)}
                                className="group relative aspect-[4/5] bg-[#fdfbf7] dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm cursor-pointer border border-[#bc8d31]/20 hover:border-[#bc8d31]/50 hover:shadow-md transition-all animate-fade-in-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <img 
                                    src={item.imageUrl} 
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    loading="lazy"
                                />
                                
                                <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 group-hover:scale-100">
                                    <Maximize2 size={16} className="text-white" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
              </>
          )}

        </div>
      </div>

      {/* Full Screen Viewer Modal */}
      {selectedImage && (
          <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col animate-in fade-in duration-300 backdrop-blur-sm">
              
              {/* Modal Header */}
              <div className="absolute top-0 left-0 right-0 p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex justify-between items-start z-20 bg-gradient-to-b from-black/60 to-transparent">
                  <div className="text-white">
                      <h3 className="font-bold text-lg leading-tight">{selectedImage.description || selectedImage.title}</h3>
                  </div>
                  <button 
                    onClick={closeImage}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
                  >
                      <X size={24} />
                  </button>
              </div>
              
              {/* Image Container with Zoom */}
              <div 
                className="flex-1 flex items-center justify-center p-0 overflow-hidden relative touch-none"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onDoubleClick={handleDoubleTap}
              >
                  <img 
                    src={selectedImage.imageUrl} 
                    alt={selectedImage.title}
                    className="max-w-full max-h-[85vh] object-contain shadow-2xl"
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transition: isZooming ? 'none' : 'transform 200ms ease-out',
                        cursor: scale > 1 ? 'move' : 'zoom-in'
                    }}
                  />
              </div>
              
              {/* Zoom Hints/Controls if zoomed */}
              {scale > 1 && (
                  <div className="absolute bottom-24 left-0 right-0 flex justify-center z-20 pointer-events-none">
                      <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold">
                          {Math.round(scale * 100)}%
                      </div>
                  </div>
              )}

              {/* Modal Footer / Actions */}
              <div className="absolute bottom-0 left-0 right-0 p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] flex justify-center gap-4 z-20 bg-gradient-to-t from-black/80 to-transparent">
                  {scale === 1 ? (
                      <button 
                          onClick={() => handleDownload(selectedImage)}
                          disabled={isDownloading}
                          className="flex-1 max-w-[200px] flex items-center justify-center gap-2 bg-[#bc8d31] hover:brightness-110 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all active:scale-95 disabled:opacity-80 disabled:cursor-not-allowed"
                      >
                          {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                          {isDownloading ? 'Saving...' : 'Download'}
                      </button>
                  ) : (
                      <button 
                        onClick={() => { setScale(1); setPosition({x:0, y:0}); }}
                        className="flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-full font-bold"
                      >
                          <ZoomOut size={18} /> Reset Zoom
                      </button>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};
