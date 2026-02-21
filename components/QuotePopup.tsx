
import React, { useState } from 'react';
import { X, RefreshCw, Sparkles, Image as ImageIcon } from 'lucide-react';

interface QuotePopupProps {
  onClose: () => void;
  onOpenFull: () => void;
}

const EXTENSIONS = ['JPG', 'jpg', 'PNG', 'png', 'jpeg'];

export const QuotePopup: React.FC<QuotePopupProps> = ({ onClose, onOpenFull }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [extensionIndex, setExtensionIndex] = useState(0);

  // --- IMAGE LOGIC (Matches DailyQuotes.tsx) ---
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

  const today = new Date();
  const imageUrl = getQuoteImageUrl(today);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] transform transition-all animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 flex flex-col max-h-[80vh] border border-white/20 relative">
        
        {/* Top Header - Distinguished from Splash */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 flex justify-between items-center relative overflow-hidden border-b border-slate-100 dark:border-slate-800">
           <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 bg-saffron-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-saffron-600 dark:text-saffron-400">
                  <Sparkles size={20} className="animate-pulse-slow" />
              </div>
              <div>
                  <h3 className="text-slate-800 dark:text-white font-bold text-lg font-hindi leading-tight">नित्य वाणी</h3>
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                      Daily Wisdom • {today.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
              </div>
           </div>
           
           <button 
              onClick={onClose} 
              className="relative z-10 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-2 transition-all active:scale-90"
           >
              <X size={20} />
           </button>
        </div>

        {/* Image Container - Focused Content */}
        <div 
            className="relative bg-slate-100 dark:bg-slate-950 flex-1 min-h-[320px] flex items-center justify-center overflow-hidden cursor-pointer group"
            onClick={onOpenFull}
        >
           {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-0">
                  <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-800 border-t-saffron-500 rounded-full animate-spin"></div>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Seeking Vani...</span>
                  </div>
              </div>
           )}
           
           {!error ? (
              <>
                <img 
                    src={imageUrl} 
                    alt="Daily Quote" 
                    className={`w-full h-full object-contain transition-all duration-700 ease-out ${isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
                    onLoad={() => setIsLoading(false)}
                    onError={() => { 
                        if (extensionIndex < EXTENSIONS.length - 1) {
                            setExtensionIndex(prev => prev + 1);
                        } else {
                            setError(true); 
                            setIsLoading(false); 
                        }
                    }}
                />
                
                {/* Visual Hint */}
                {!isLoading && (
                    <div className="absolute top-4 right-4 z-20">
                         <div className="bg-black/20 backdrop-blur-md p-1.5 rounded-lg border border-white/10 text-white/80 group-hover:scale-110 transition-transform">
                             <ImageIcon size={14} />
                         </div>
                    </div>
                )}
                
                {!isLoading && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-6 flex items-end justify-center pointer-events-none animate-in fade-in duration-700">
                        <span className="text-white text-xs font-bold bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                            Tap to view in Full
                        </span>
                    </div>
                )}
              </>
           ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                 <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <RefreshCw size={24} />
                 </div>
                 <p className="text-sm mb-4 font-bold text-slate-500 uppercase tracking-wide">Connection Lost</p>
                 <button 
                    onClick={(e) => { e.stopPropagation(); setIsLoading(true); setError(false); setExtensionIndex(0); }} 
                    className="text-xs bg-saffron-500 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-saffron-600 transition-all shadow-lg shadow-saffron-500/20 font-bold"
                 >
                    <RefreshCw size={14} /> Retry Now
                 </button>
              </div>
           )}
        </div>

        {/* Decorative background circle */}
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-saffron-500/5 rounded-full blur-3xl pointer-events-none"></div>
      </div>
    </div>
  );
};
