import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { triggerHaptic } from '../utils/haptic';
import { DARSHAN_CATEGORIES, fetchDarshanCategory } from '../data/dailyDarshan';
import { Youtube, Instagram, Facebook, ExternalLink, Music, Lightbulb, Info, Smartphone, Play, X, MessageCircle } from 'lucide-react';

interface HomeScreenProps {
  onOpenDailyQuotes: () => void;
  onOpenDailyInfo: () => void;
  onOpenEvents: () => void;
  onOpenDailyDarshan: () => void;
  onOpenSevaCenter: () => void;
  onOpenDonate: () => void;
  onOpenBhajanList: () => void;
  onOpenAbout: () => void;
  onOpenOnboarding: () => void;
  settingsLanguage: 'en' | 'hi';
}

// Icon URLs
const VAISHNAV_CALENDAR_ICON = "/vaishnav.calender.png";
const DONATE_ICON = "/donate.png";
const OUR_CENTERS_ICON = "/our.centers.png";
const DAILY_INFO_ICON = "/daily.information.png";
const ABOUT_US_ICON = "/aboutUs.png";
const YOUTUBE_ICON = "/ytlogo.png";
const BHAJAN_ICON = "/music.png";
const FACEBOOK_ICON = "/fblogo.png";
const INSTAGRAM_ICON = "/instlogo.png";
const HOW_TO_USE_ICON = "/touse.png";

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenDailyQuotes,
  onOpenDailyInfo,
  onOpenEvents,
  onOpenDailyDarshan,
  onOpenSevaCenter,
  onOpenDonate,
  onOpenBhajanList,
  onOpenAbout,
  onOpenOnboarding,
  settingsLanguage
}) => {
  
  const isHindi = settingsLanguage === 'hi';
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [pendingLink, setPendingLink] = useState<{ url: string; title: string; icon: React.ReactNode; colorClass: string } | null>(null);

  const t = {
    dailyDarshan: isHindi ? 'दैनिक दर्शन' : 'Daily Darshan',
    dailyQuotes: isHindi ? 'नित्य वाणी' : 'Daily Quotes',
    vaishnavCalendar: isHindi ? 'वैष्णव कैलेंडर' : 'Vaishnav Calendar',
    ourCenters: isHindi ? 'हमारे केंद्र' : 'Our Centers',
    donate: isHindi ? 'सहयोग करें' : 'Donate',
    dailyInfo: isHindi ? 'दैनिक जानकारी' : 'Daily Information',
    youtube: isHindi ? 'यूट्यूब' : 'YouTube',
    instagram: isHindi ? 'इंस्टाग्राम' : 'Instagram',
    facebook: isHindi ? 'फेसबुक' : 'Facebook',
    bhajans: isHindi ? 'भजन सूची' : 'Bhajan List',
    howToUse: isHindi ? 'ऐप कैसे उपयोग करें' : 'How to Use App',
    aboutUs: isHindi ? 'परिचय (About)' : 'About Us',
    appTour: isHindi ? 'ऐप परिचय (टूर)' : 'App Tour',
    tourDesc: isHindi ? 'फीचर्स और सुविधाएँ जानें' : 'Know the features',
    watchVideo: isHindi ? 'वीडियो डेमो देखें' : 'Watch Video Demo',
    videoDesc: isHindi ? 'यूट्यूब पर वीडियो देखें' : 'Watch on YouTube',
    helpTitle: isHindi ? 'सहायता / हेल्प' : 'Help & Guide',
    openLink: isHindi ? 'लिंक खोलें?' : 'Open Link?',
    linkDesc: isHindi ? 'आप ऐप से बाहर जा रहे हैं:' : 'You are leaving the app to visit:',
    cancel: isHindi ? 'रद्द करें' : 'Cancel',
    open: isHindi ? 'खोलें' : 'Open'
  };

  const handlePress = (action: () => void) => {
    triggerHaptic('light');
    action();
  };

  const handleSocialClick = (url: string, title: string, icon: React.ReactNode, colorClass: string) => {
      triggerHaptic('light');
      setPendingLink({ url, title, icon, colorClass });
  };

  const confirmNavigation = () => {
      if (pendingLink) {
          window.open(pendingLink.url, '_blank');
          setPendingLink(null);
      }
  };

  useEffect(() => {
    if (showHelpModal) {
      const stateId = `help-modal-${Date.now()}`;
      window.history.pushState({ isPopup: true, modalId: stateId }, '');
      const handlePopState = () => setShowHelpModal(false);
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
        if (window.history.state?.modalId === stateId) window.history.back();
      };
    }
  }, [showHelpModal]);

  useEffect(() => {
    if (pendingLink) {
      const stateId = `link-modal-${Date.now()}`;
      window.history.pushState({ isPopup: true, modalId: stateId }, '');
      const handlePopState = () => setPendingLink(null);
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
        if (window.history.state?.modalId === stateId) window.history.back();
      };
    }
  }, [pendingLink]);

  return (
    <div className="relative min-h-full">
      <div className="relative z-10 pb-4 pt-2 px-3 space-y-5">
      
      {/* Hero Carousel Section */}
      <div className="w-full relative max-w-5xl mx-auto">
         <HeroCarousel 
            onOpenDailyDarshan={onOpenDailyDarshan} 
            labels={{ darshan: t.dailyDarshan }}
         />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-7xl mx-auto">
        
        <ImageCard 
           title={t.dailyQuotes}
           imageUrl={DAILY_INFO_ICON}
           onClick={() => handlePress(onOpenDailyQuotes)}
        />

        <ImageCard 
          title={t.donate} 
          imageUrl={DONATE_ICON}
          onClick={() => handlePress(onOpenDonate)}
        />

        <ImageCard 
          title={t.ourCenters} 
          imageUrl={OUR_CENTERS_ICON}
          onClick={() => handlePress(onOpenSevaCenter)}
        />

        <ImageCard 
          title={t.vaishnavCalendar} 
          imageUrl={VAISHNAV_CALENDAR_ICON}
          onClick={() => handlePress(onOpenEvents)}
        />

        <ImageCard 
            title={t.youtube}
            imageUrl={YOUTUBE_ICON}
            onClick={() => handleSocialClick('https://www.youtube.com/channel/UC3i5l3jbvNcnvd72DP1oPsA', t.youtube, <Youtube size={24} />, 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400')}
        />

        <ImageCard 
            title={t.instagram}
            imageUrl={INSTAGRAM_ICON}
            onClick={() => handleSocialClick('https://www.instagram.com/chaitanya_prem_bhakti/?hl=en', t.instagram, <Instagram size={24} />, 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400')}
        />

        <ImageCard 
            title={t.facebook}
            imageUrl={FACEBOOK_ICON}
            onClick={() => handleSocialClick('https://www.facebook.com/chaitanyaprembhakti/', t.facebook, <Facebook size={24} />, 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400')}
        />

        <ImageCard 
            title={t.bhajans}
            imageUrl={BHAJAN_ICON}
            onClick={() => handlePress(onOpenBhajanList)}
        />

        <ImageCard 
            title={t.howToUse}
            imageUrl={HOW_TO_USE_ICON}
            onClick={() => { triggerHaptic('light'); setShowHelpModal(true); }}
        />

        <ImageCard 
            title={t.aboutUs}
            imageUrl={ABOUT_US_ICON}
            onClick={() => handlePress(onOpenAbout)}
        />

      </div>

      {/* Modals omitted for brevity, keeping original modal code intact */}
      {showHelpModal && createPortal(
         /* ... your existing showHelpModal code ... */
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-3xl shadow-2xl p-6 relative border border-white/20">
                 <button onClick={() => setShowHelpModal(false)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500"><X size={18} /></button>
                 <div className="text-center mb-6">
                     <div className="w-16 h-16 bg-[#bc8d31]/10 text-[#bc8d31] rounded-full flex items-center justify-center mx-auto mb-3"><Lightbulb size={32} /></div>
                     <h3 className="text-xl font-bold text-slate-800">{t.helpTitle}</h3>
                 </div>
                 <div className="space-y-4">
                     <button onClick={() => { setShowHelpModal(false); onOpenOnboarding(); }} className="w-full flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-[#bc8d31]/50 transition-all">
                         <div className="w-12 h-12 rounded-full bg-[#bc8d31]/10 flex items-center justify-center text-[#bc8d31]"><Smartphone size={24} /></div>
                         <div className="text-left"><h4 className="font-bold text-slate-700">{t.appTour}</h4><p className="text-xs text-slate-500">{t.tourDesc}</p></div>
                     </button>
                     <button onClick={() => { window.open('https://youtube.com/shorts/fClTshoimkI?feature=share', '_blank'); }} className="w-full flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-[#bc8d31]/50 transition-all">
                         <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600"><Play size={24} className="ml-1" /></div>
                         <div className="text-left"><h4 className="font-bold text-slate-700">{t.watchVideo}</h4><p className="text-xs text-slate-500">{t.videoDesc}</p></div>
                     </button>
                 </div>
             </div>
         </div>,
         document.body
      )}

      {pendingLink && createPortal(
         /* ... your existing pendingLink code ... */
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-xs rounded-3xl shadow-2xl p-6 border border-white/10">
                  <div className="flex flex-col items-center text-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 shrink-0 ${pendingLink.colorClass} shadow-inner`}>
                          {pendingLink.icon}
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">{t.openLink}</h3>
                      <p className="text-sm text-slate-600 mb-8">{t.linkDesc} <br/><strong className="text-base text-slate-800 mt-1 block">{pendingLink.title}</strong></p>
                      <div className="flex gap-3 w-full">
                          <button onClick={() => setPendingLink(null)} className="flex-1 py-3.5 text-slate-600 font-bold bg-slate-100 rounded-xl">{t.cancel}</button>
                          <button onClick={confirmNavigation} className="flex-1 py-3.5 text-white font-bold bg-[#bc8d31] hover:bg-[#a67a26] rounded-xl flex items-center justify-center gap-2">
                              {t.open} <ExternalLink size={16} />
                          </button>
                      </div>
                  </div>
              </div>
          </div>,
          document.body
      )}
    </div>
    </div>
  );
};

// --- Components ---

interface SlideData {
    url: string;
    type: 'darshan' | 'quote';
}

const HeroCarousel = ({ 
    onOpenDailyDarshan, 
    labels 
}: { 
    onOpenDailyDarshan: () => void, 
    labels: { darshan: string }
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slides, setSlides] = useState<SlideData[]>([
        { url: "https://github.com/Damodar29/CPBS-DAILY/releases/download/kota/1.Gaur.Radha.Govind.Dev.Ji.jpeg", type: 'darshan' },
        { url: "https://github.com/Damodar29/CPBS-DAILY/releases/download/kota/2.Radha.Rani.Ji.jpeg", type: 'darshan' },
        { url: "https://github.com/Damodar29/CPBS-DAILY/releases/download/kota/3.Thakur.Ji-2.jpeg", type: 'darshan' }
    ]);

    const touchStart = React.useRef({ x: 0, y: 0 });
    const touchEnd = React.useRef({ x: 0, y: 0 });

    useEffect(() => {
        let isMounted = true;
        const fetchContent = async () => {
            try {
                const promises = DARSHAN_CATEGORIES.map(cat => fetchDarshanCategory(cat));
                const results = await Promise.all(promises);
                const darshanSlides: SlideData[] = [];
                const allImages = results.flat();
                
                for (const img of allImages) {
                    if (darshanSlides.length >= 3) break;
                    darshanSlides.push({ url: img.imageUrl, type: 'darshan' });
                }

                if (isMounted && darshanSlides.length > 0) {
                    setSlides(darshanSlides.slice(0, 3));
                }
            } catch (e) {
                console.error("Failed to fetch carousel content", e);
            }
        };

        fetchContent();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [slides]);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStart.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEnd.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
    };

    const handleTouchEnd = () => {
        if (!touchStart.current.x || !touchEnd.current.x) return;
        const distance = touchStart.current.x - touchEnd.current.x;
        if (distance > 50) setCurrentIndex((prev) => (prev + 1) % slides.length);
        else if (distance < -50) setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
        touchStart.current = { x: 0, y: 0 };
        touchEnd.current = { x: 0, y: 0 };
    };

    return (
        <div 
            className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden shadow-lg border-[1.5px] border-[#bc8d31]/60 bg-white group touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {slides.map((slide, idx) => (
                <div 
                    key={`${idx}-${slide.type}`}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                >
                    <img 
                        src={slide.url} 
                        alt={slide.type} 
                        className="w-full h-full object-cover object-center" 
                    />
                    {/* Changed from Blue to a neutral black gradient to let the images pop */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                </div>
            ))}
            
            <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                <h3 className="text-white font-serif font-bold text-lg drop-shadow-md tracking-wide" style={{ fontFamily: '"Kaushan Script", cursive' }}>{labels.darshan}</h3>
                
                <div className="flex gap-1.5 mb-1.5">
                    {slides.map((_, idx) => (
                        // Changed active dot color to the new Gold
                        <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentIndex ? 'bg-[#bc8d31]' : 'bg-white/50'}`} />
                    ))}
                </div>
            </div>

            <button 
                onClick={onOpenDailyDarshan}
                className="absolute inset-0 w-full h-full z-10"
                aria-label="Open Content"
            />
        </div>
    );
};

// Card that uses local images only - Text Below Image
const ImageCard = ({ title, onClick, imageUrl }: { title: string, onClick: () => void, imageUrl: string }) => {
    return (
        <button 
            onClick={onClick}
            className="flex flex-col items-center gap-2 w-full group active:scale-95 transition-transform"
        >
            {/* Changed background from blue/purple to soft cream gradient, updated border to Gold */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md border-[1.5px] border-[#bc8d31]/50 bg-gradient-to-br from-[#fdfbf7] to-[#f4ebd8] hover:shadow-xl hover:border-[#bc8d31]/80 transition-all">
                <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }}></div>

                <div className="absolute inset-0 p-0">
                    <img 
                        src={imageUrl} 
                        alt={title} 
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100 mix-blend-multiply"
                    />
                </div>
                
                {/* Updated Inner Border Effect to Gold */}
                <div className="absolute inset-1 border border-[#bc8d31]/30 rounded-xl pointer-events-none"></div>
            </div>
            
            {/* Changed text from Blue to Gold */}
            <span className="text-[#bc8d31] font-bold text-sm md:text-base tracking-wide leading-tight text-center px-1" style={{ fontFamily: '"Kaushan Script", cursive' }}>
                {title}
            </span>
        </button>
    );
};

// Card for Social Media & Features - Text Below Icon
const SocialCard = ({ title, onClick, icon, colorClass }: { title: string, onClick: () => void, icon: React.ReactNode, colorClass: string }) => {
    return (
        <button 
            onClick={onClick}
            className="flex flex-col items-center gap-2 w-full group active:scale-95 transition-transform"
        >
            {/* Changed background from blue/purple to soft cream gradient, updated border to Gold */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md border-[1.5px] border-[#bc8d31]/50 bg-gradient-to-br from-[#fdfbf7] to-[#f4ebd8] hover:shadow-xl hover:border-[#bc8d31]/80 transition-all flex items-center justify-center">
                <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }}></div>

                {/* Changed icon color to Gold */}
                <div className="relative z-10 text-[#bc8d31] group-hover:scale-110 transition-transform duration-300">
                    {React.cloneElement(icon as any, { size: 36, strokeWidth: 1.5, className: 'drop-shadow-[0_2px_4px_rgba(188,141,49,0.3)] transition-all' })}
                </div>
                
                {/* Updated Inner Border Effect to Gold */}
                <div className="absolute inset-1 border border-[#bc8d31]/30 rounded-xl pointer-events-none"></div>
            </div>

            {/* Changed text from Blue to Gold */}
            <span className="text-[#bc8d31] font-bold text-sm md:text-base tracking-wide leading-tight text-center px-1 flex items-center justify-center gap-1" style={{ fontFamily: '"Kaushan Script", cursive' }}>
                {title}
            </span>
        </button>
    );
};