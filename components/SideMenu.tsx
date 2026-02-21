import React, { useState, useEffect } from 'react';
import { X, Info, MessageCircle, Home, Download, ShieldCheck, CircleHelp, Smartphone, Play } from 'lucide-react';
import { App } from '@capacitor/app';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAbout?: () => void;
  onOpenDonate?: () => void;
  onHome?: () => void;
  onOpenDownloaded?: () => void;
  onOpenDailyQuotes?: () => void;
  onOpenDailyInfo?: () => void;
  onOpenEvents?: () => void;
  onOpenDailyDarshan?: () => void;
  onOpenSevaCenter?: () => void;
  onOpenPrivacy?: () => void;
  onOpenOnboarding?: () => void;
  scrollBarSide?: 'left' | 'right';
  settingsLanguage: 'en' | 'hi';
}

export const SideMenu: React.FC<SideMenuProps> = ({ 
  isOpen, onClose, onOpenAbout, onHome, onOpenDownloaded, onOpenPrivacy, onOpenOnboarding, scrollBarSide = 'left', settingsLanguage 
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [appVersion, setAppVersion] = useState('v3.0.0');

  // Translations
  const t = {
    en: {
      title: "Shree Chaitanya Prem Bhakti Sangh",
      subtitle: "Official App",
      home: "Home",
      downloads: "Downloads / Offline",
      about: "About CPBS",
      privacy: "Privacy Policy",
      feedback: "Feedback / Queries",
      feedbackSub: "(replied within a day)",
      online: "Online",
      offline: "Offline Mode",
      howToUse: "How to use App",
      appTour: "App Tour",
      tourDesc: "Know the features",
      watchVideo: "Watch Video Demo",
      videoDesc: "Watch on YouTube",
      cancel: "Cancel",
      open: "Open"
    },
    hi: {
      title: "श्री चैतन्य प्रेम भक्ति संघ",
      subtitle: "आधिकारिक ऐप",
      home: "होम",
      downloads: "डाउनलोड्स / ऑफलाइन",
      about: "परिचय (CPBS)",
      privacy: "गोपनीयता नीति",
      feedback: "सुझाव / संपर्क",
      feedbackSub: "(एक दिन में उत्तर)",
      online: "ऑनलाइन",
      offline: "ऑफलाइन",
      howToUse: "उपयोग कैसे करें",
      appTour: "ऐप परिचय (टूर)",
      tourDesc: "फीचर्स और सुविधाएँ जानें",
      watchVideo: "वीडियो डेमो देखें",
      videoDesc: "यूट्यूब पर वीडियो देखें",
      cancel: "रद्द करें",
      open: "खोलें"
    }
  }[settingsLanguage];

  useEffect(() => {
    const handleStatusChange = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    // Fetch dynamic app version
    const fetchAppVersion = async () => {
        try {
            const info = await App.getInfo();
            setAppVersion(`v${info.version}`);
        } catch (e) {
            console.warn("Could not fetch app version:", e);
        }
    };
    fetchAppVersion();

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  // Close help modal when side menu closes
  useEffect(() => {
    if (!isOpen) {
      setShowHelpModal(false);
    }
  }, [isOpen]);

  // History listener for Help Modal
  useEffect(() => {
    if (showHelpModal) {
      const id = `help-modal-${Date.now()}`;
      window.history.pushState({ isPopup: true, modalId: id }, '');
      const handler = () => setShowHelpModal(false);
      window.addEventListener('popstate', handler);
      return () => {
        window.removeEventListener('popstate', handler);
        if(window.history.state?.modalId === id) window.history.back();
      }
    }
  }, [showHelpModal]);

  const handleFeedback = () => {
    window.open('https://wa.me/917049304733', '_blank');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-[#fdfbf7] dark:bg-slate-900 z-50 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header - Changed to Cream/Gold theme */}
        <div 
          onClick={onOpenAbout}
          className="relative h-56 landscape:h-auto landscape:min-h-[100px] bg-gradient-to-br from-[#fdfbf7] via-[#f4ebd8] to-[#e8d5b5] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col justify-end landscape:justify-center p-6 pt-[calc(3.5rem+env(safe-area-inset-top))] landscape:p-4 landscape:pt-[calc(1rem+env(safe-area-inset-top))] cursor-pointer hover:brightness-105 active:brightness-95 transition-all group shrink-0 border-b-[1.5px] border-[#bc8d31]/40"
        >
           {/* Background Texture Overlay */}
           <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-multiply dark:opacity-10 dark:mix-blend-screen" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }}></div>

           <div className="relative z-10 flex flex-col landscape:flex-row landscape:items-center landscape:gap-3">
               
               {/* Updated Golden Logo */}
               <div className="mb-3 landscape:mb-0 transform group-hover:scale-105 transition-transform duration-300 origin-left shrink-0 drop-shadow-sm">
                  <svg viewBox="0 0 100 220" className="h-16 w-auto landscape:h-12">
                     <path d="M30 10v85q0 40 20 40t20-40V10" fill="transparent" stroke="#bc8d31" strokeWidth="10" strokeLinecap="round" />
                     <path d="M50 135 C28 135, 20 165, 50 200 C80 165, 72 135, 50 135 Z" fill="#bc8d31" stroke="#bc8d31" strokeWidth="4" strokeLinecap="round" />
                  </svg>
               </div>

               <div className="flex-1 min-w-0 flex flex-col">
                   <h2 className="text-[#bc8d31] text-3xl landscape:text-lg tracking-wide leading-none group-hover:translate-x-1 transition-transform" style={{ fontFamily: '"Kaushan Script", cursive' }}>
                     Shree Chaitanya
                   </h2>
                   {/* Golden Separator Line */}
                   <div className="w-16 h-[1.5px] bg-[#bc8d31]/80 my-2 group-hover:translate-x-1 transition-transform"></div>
                   <p className="text-[#bc8d31] text-[0.65rem] font-sans font-bold tracking-[0.25em] uppercase group-hover:translate-x-1 transition-transform delay-75">
                     Prem Bhakti Sangh
                   </p>
               </div>
           </div>
        </div>

        {/* Close Button - Updated to Gold hover */}
        <button 
          onClick={onClose}
          className="absolute top-[calc(2.5rem+env(safe-area-inset-top))] right-4 landscape:top-2 landscape:right-2 p-2 text-[#bc8d31]/70 hover:text-[#bc8d31] hover:bg-[#bc8d31]/10 rounded-full transition-colors z-20"
        >
          <X className="w-6 h-6 landscape:w-5 landscape:h-5" />
        </button>

        {/* Menu Items */}
        <div className={`flex-1 overflow-y-auto bg-[#fdfbf7] dark:bg-slate-950 ${scrollBarSide === 'left' ? 'left-scrollbar' : ''}`}>
          <div dir={scrollBarSide === 'left' ? 'ltr' : undefined} className="p-4 space-y-1">
            
            {/* Utility Navigation */}
            <MenuItem icon={<Home />} label={t.home} onClick={onHome} />

            <MenuItem icon={<Download />} label={t.downloads} onClick={onOpenDownloaded} />

            {/* Golden Divider */}
            <div className="h-px bg-[#bc8d31]/20 my-2 mx-2" />
            
            {/* Information */}
            <MenuItem icon={<Info />} label={t.about} onClick={onOpenAbout} />

            <MenuItem icon={<ShieldCheck />} label={t.privacy} onClick={onOpenPrivacy} />

            <MenuItem icon={<CircleHelp />} label={t.howToUse} onClick={() => setShowHelpModal(true)} />
            
            {/* Golden Divider */}
            <div className="h-px bg-[#bc8d31]/20 my-2 mx-2" />
            
            {/* Contact */}
            <MenuItem 
              icon={<MessageCircle />} 
              label={t.feedback} 
              subtext={t.feedbackSub} 
              onClick={handleFeedback}
            />
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 text-center text-xs text-[#bc8d31]/50 font-medium pb-[calc(1rem+env(safe-area-inset-bottom))] landscape:py-2 border-t border-[#bc8d31]/20 bg-[#fdfbf7] dark:bg-slate-950 shrink-0">
           {appVersion}
        </div>
      </div>

      {/* Help / How to Use Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#fdfbf7] dark:bg-slate-800 w-full max-w-xs rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 relative border border-[#bc8d31]/20">
                <button 
                    onClick={() => setShowHelpModal(false)}
                    className="absolute top-4 right-4 p-1 text-slate-400 hover:text-[#bc8d31] transition-colors"
                >
                    <X size={20} />
                </button>
                <h3 className="text-xl font-bold text-[#bc8d31] mb-6 text-center">{t.howToUse}</h3>
                
                <div className="space-y-4">
                    <button 
                        onClick={() => { 
                            setShowHelpModal(false); 
                            if (onOpenOnboarding) {
                                onOpenOnboarding(); 
                                onClose(); 
                            }
                        }}
                        className="w-full flex items-center gap-4 p-4 bg-white dark:bg-slate-700/50 rounded-xl border border-[#bc8d31]/20 hover:border-[#bc8d31]/60 transition-all group active:scale-95 shadow-sm"
                    >
                        <div className="w-12 h-12 rounded-full bg-[#bc8d31]/10 flex items-center justify-center text-[#bc8d31] group-hover:scale-110 transition-transform">
                            <Smartphone size={24} />
                        </div>
                        <div className="text-left">
                            <h4 className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#bc8d31] transition-colors">{t.appTour}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t.tourDesc}</p>
                        </div>
                    </button>

                    <button 
                        onClick={() => { window.open('https://youtube.com/shorts/fClTshoimkI?feature=share', '_blank'); }}
                        className="w-full flex items-center gap-4 p-4 bg-white dark:bg-slate-700/50 rounded-xl border border-[#bc8d31]/20 hover:border-red-400 transition-all group active:scale-95 shadow-sm"
                    >
                        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                            <Play size={24} className="ml-1" />
                        </div>
                        <div className="text-left">
                            <h4 className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-red-500 transition-colors">{t.watchVideo}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t.videoDesc}</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

// Updated Menu Item with Golden Hover States
const MenuItem: React.FC<{ icon: React.ReactNode; label: string; subtext?: string; onClick?: () => void }> = ({ icon, label, subtext, onClick }) => (
  <button 
    onClick={onClick} 
    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-[#bc8d31]/5 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all text-left group border border-transparent hover:border-[#bc8d31]/20 hover:shadow-[0_2px_8px_rgba(188,141,49,0.05)]"
  >
    <div className="w-10 h-10 rounded-full bg-[#bc8d31]/10 dark:bg-slate-800 flex items-center justify-center text-[#bc8d31]/70 group-hover:text-[#bc8d31] dark:group-hover:text-[#bc8d31] group-hover:bg-[#bc8d31]/20 dark:group-hover:bg-slate-700 transition-all group-hover:scale-110 shrink-0">
        {React.cloneElement(icon as any, { size: 20 })}
    </div>
    <div className="min-w-0">
      <div className="font-bold text-slate-600 dark:text-slate-300 group-hover:text-[#bc8d31] transition-colors truncate">{label}</div>
      {subtext && <div className="text-xs text-slate-400 font-medium truncate group-hover:text-[#bc8d31]/70">{subtext}</div>}
    </div>
  </button>
);