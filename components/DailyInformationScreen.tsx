
import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Loader2, Bell, Info, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Capacitor, CapacitorHttp } from '@capacitor/core';

interface DailyInformationScreenProps {
  onBack: () => void;
  scrollBarSide?: 'left' | 'right';
  settingsLanguage: 'en' | 'hi';
}

const TOP_INFO_URL = 'https://github.com/Damodar29/CPBS-DAILY/releases/download/dailyinfoTop/top.info.txt';
// Updated URL as provided by user (note the spelling in filename)
const BOTTOM_INFO_URL = 'https://github.com/Damodar29/CPBS-DAILY/releases/download/dailyinfoBottom/botom.info.txt';

export const DailyInformationScreen: React.FC<DailyInformationScreenProps> = ({ onBack, scrollBarSide = 'left', settingsLanguage }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [topInfo, setTopInfo] = useState<string | null>(null);
  const [bottomInfo, setBottomInfo] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const t = {
    title: settingsLanguage === 'hi' ? 'दैनिक जानकारी' : 'Daily Information',
    loading: settingsLanguage === 'hi' ? 'जानकारी लोड हो रही है...' : 'Loading information...',
    error: settingsLanguage === 'hi' ? 'जानकारी लोड करने में विफल।' : 'Failed to load information.',
    retry: settingsLanguage === 'hi' ? 'पुनः प्रयास करें' : 'Retry',
    topSection: settingsLanguage === 'hi' ? 'महत्वपूर्ण सूचना' : 'Important Update',
    bottomSection: settingsLanguage === 'hi' ? 'विशेष संदेश' : 'Special Message',
    updated: settingsLanguage === 'hi' ? 'जानकारी अपडेट की गई' : 'Information Updated'
  };

  const fetchTextWithStrategies = async (url: string): Promise<string | null> => {
    // Add a cache buster timestamp to bypass caching
    const timestamp = Date.now();
    const targetUrl = `${url}?t=${timestamp}`;

    console.log(`[DailyInfo] Fetching: ${url}`);

    // STRATEGY 1: NATIVE HTTP (Silver Bullet for Mobile Apps)
    // Bypasses CORS completely by using the native OS network stack
    if (Capacitor.isNativePlatform()) {
      try {
        console.log(`[DailyInfo] Using Native CapacitorHttp`);
        const response = await CapacitorHttp.get({
          url: targetUrl,
          // Ensure we don't get cached stale data
          headers: {
            'Cache-Control': 'no-cache'
          }
        });

        if (response.status === 200) {
          console.log(`[DailyInfo] Native fetch success`);
          return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        }
      } catch (e) {
        console.error("[DailyInfo] Native fetch failed", e);
        // If native fails (e.g. no internet), return null
      }
      return null; 
    }

    // STRATEGY 2: WEB PROXIES (For Browser/PWA/AI Studio)
    // GitHub download links usually block direct browser fetch due to CORS
    const strategies = [
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
      targetUrl // Direct fallback
    ];

    for (const fetchUrl of strategies) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout to avoid hanging

        console.log(`[DailyInfo] Trying Web Strategy: ${fetchUrl}`);
        
        const res = await fetch(fetchUrl, { 
            cache: 'no-store',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (res.ok) {
            const text = await res.text();
            if (text && text.trim().length > 0) {
                console.log(`[DailyInfo] Success via: ${fetchUrl}`);
                return text;
            }
        }
      } catch (e) {
        console.warn(`[DailyInfo] Strategy failed: ${fetchUrl}`, e);
        // Continue to next strategy
      }
    }
    
    console.error(`[DailyInfo] All strategies failed for ${url}`);
    return null;
  };

  const loadData = async (isRefresh = false) => {
    setLoading(true);
    setError(false);
    
    try {
      const [topData, bottomData] = await Promise.all([
        fetchTextWithStrategies(TOP_INFO_URL),
        fetchTextWithStrategies(BOTTOM_INFO_URL)
      ]);

      // Consider success if at least one loads, or allow empty if source is empty
      if (topData !== null || bottomData !== null) {
        setTopInfo(topData);
        setBottomInfo(bottomData);
        if (isRefresh) showToast(t.updated, 'success');
      } else {
        setError(true);
      }
    } catch (e) {
      console.error("Fetch failed", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col animate-in slide-in-from-right duration-300 font-hindi">
      
      {/* Header */}
      <div className="flex-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95">
              <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-slate-200" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-saffron-500" />
              {t.title}
            </h2>
        </div>
        <button 
          onClick={() => loadData(true)} 
          disabled={loading}
          className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all ${loading ? 'animate-spin' : ''}`}
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto ${scrollBarSide === 'left' ? 'left-scrollbar' : ''} p-4 pb-[calc(2rem+env(safe-area-inset-bottom))]`}>
        <div dir={scrollBarSide === 'left' ? 'ltr' : undefined} className="max-w-3xl mx-auto min-h-full flex flex-col">
           
           {loading ? (
             <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400">
                <Loader2 size={40} className="mb-4 animate-spin text-saffron-500" />
                <p className="font-medium animate-pulse">{t.loading}</p>
             </div>
           ) : error ? (
             <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle size={32} />
                </div>
                <p className="font-medium text-lg mb-4">{t.error}</p>
                <button 
                  onClick={() => loadData(true)}
                  className="px-6 py-2 bg-saffron-500 text-white rounded-full font-bold shadow-md active:scale-95 transition-transform"
                >
                  {t.retry}
                </button>
             </div>
           ) : (
             <div className="space-y-6 flex flex-col flex-1">
                
                {/* TOP INFO SECTION */}
                {topInfo && (
                  <div className="animate-fade-in-up">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-saffron-100 dark:border-slate-700 overflow-hidden relative">
                       {/* Decorative Header Bar */}
                       <div className="h-1.5 w-full bg-gradient-to-r from-saffron-400 to-red-500"></div>
                       
                       <div className="p-5 md:p-8">
                          <div className="flex items-center gap-3 mb-6">
                             <div className="w-10 h-10 rounded-full bg-saffron-50 dark:bg-slate-900 border border-saffron-100 dark:border-slate-700 text-saffron-600 dark:text-saffron-400 flex items-center justify-center shrink-0 shadow-sm">
                                <Bell size={20} className="fill-current" />
                             </div>
                             <h3 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                               {t.topSection}
                             </h3>
                          </div>
                          
                          <div className="prose dark:prose-invert max-w-none">
                            <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-hindi">
                              {topInfo}
                            </p>
                          </div>
                       </div>
                    </div>
                  </div>
                )}

                {/* BOTTOM INFO SECTION */}
                {bottomInfo && (
                  <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <div className="bg-blue-50 dark:bg-slate-900 rounded-2xl border border-blue-100 dark:border-slate-800 p-5 md:p-6 relative overflow-hidden">
                       
                       {/* Header Row: Icon + Title */}
                       <div className="flex items-center gap-3 mb-4 relative z-10">
                          <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-blue-500 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-sm ring-1 ring-blue-100 dark:ring-slate-700">
                             <Info size={18} />
                          </div>
                          <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                            {t.bottomSection}
                          </h4>
                       </div>

                       {/* Content Row: Full Width Text */}
                       <div className="relative z-10">
                         <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-hindi">
                           {bottomInfo}
                         </p>
                       </div>
                    </div>
                  </div>
                )}

                {!topInfo && !bottomInfo && (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center">
                        <Info size={32} className="mb-2 opacity-50" />
                        <p>{settingsLanguage === 'hi' ? 'कोई नई जानकारी उपलब्ध नहीं है' : 'No daily information available'}</p>
                    </div>
                )}

             </div>
           )}

        </div>
      </div>
    </div>
  );
};
