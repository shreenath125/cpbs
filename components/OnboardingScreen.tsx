
import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { THEME_PALETTES } from '../utils/theme';
import { 
  Check, ChevronRight, ChevronLeft, X, Palette, 
  Type, Languages, BookOpen, Music, Mic2, 
  ListMusic, Heart, Smartphone, Bookmark,
  Sun, Moon, Monitor, Calendar, Camera, Bell, Sparkles
} from 'lucide-react';
import { ThemeColor } from '../types';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const TOTAL_STEPS = 7;

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const { 
    themeColor, setThemeColor, 
    uiScale, setUiScale,
    darkMode, handleThemeChange, themeMode, setThemeMode,
    settingsLanguage, setSettingsLanguage
  } = useSettings();

  // Translations for the Onboarding
  const t = {
    skip: settingsLanguage === 'hi' ? "छोड़ें" : "Skip",
    next: settingsLanguage === 'hi' ? "अगला" : "Next",
    back: settingsLanguage === 'hi' ? "पीछे" : "Back",
    finish: settingsLanguage === 'hi' ? "शुरू करें" : "Get Started",
    
    // STEP 1: LANGUAGE
    step1Title: settingsLanguage === 'hi' ? "भाषा चुनें" : "Select Language",
    step1Desc: settingsLanguage === 'hi' ? "आप ऐप को किस भाषा में देखना पसंद करेंगे?" : "Which language do you prefer for the interface?",
    
    // STEP 2: APPEARANCE
    step2Title: settingsLanguage === 'hi' ? "दिखावट चुनें" : "Appearance",
    step2Desc: settingsLanguage === 'hi' ? "अपने पढ़ने के अनुभव को अनुकूलित करें।" : "Customize your reading experience.",
    uiSize: settingsLanguage === 'hi' ? "अक्षर का आकार" : "UI & Text Size",
    themeColor: settingsLanguage === 'hi' ? "रंग थीम" : "Theme Color",
    
    step3Title: settingsLanguage === 'hi' ? "भजन और पठन" : "Bhajan Reader",
    step3Desc: settingsLanguage === 'hi' ? "भजन पढ़ने के लिए विशेष सुविधाएँ।" : "Powerful features for reading Bhajans.",
    
    step4Title: settingsLanguage === 'hi' ? "ऑडियो और कीर्तन" : "Audio & Kirtan",
    step4Desc: settingsLanguage === 'hi' ? "आनंदमयी कीर्तन और कथा सुनें।" : "Listen to blissful Kirtans and Katha.",
    
    step5Title: settingsLanguage === 'hi' ? "ग्रंथ और पुस्तकें" : "Books & Literature",
    step5Desc: settingsLanguage === 'hi' ? "आध्यात्मिक ग्रंथों का विशाल संग्रह।" : "Vast collection of spiritual books.",

    // STEP 6: DAILY UPDATES (NEW)
    step6Title: settingsLanguage === 'hi' ? "दैनिक दर्शन और पंचांग" : "Daily Connect",
    step6Desc: settingsLanguage === 'hi' ? "नित्य दर्शन, वैष्णव कैलेंडर और सूचनाएं।" : "Daily Darshan, Calendar & Updates.",
    
    // STEP 7: LIBRARY (WAS 6)
    step7Title: settingsLanguage === 'hi' ? "लाइब्रेरी और संगठन" : "Library & Organize",
    step7Desc: settingsLanguage === 'hi' ? "अपनी पसंदीदा सूचियाँ बनाएं।" : "Create playlists and organize favorites."
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(s => s + 1);
    else onComplete();
  };

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
  };

  const themeColors = Object.keys(THEME_PALETTES) as ThemeColor[];

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col animate-in fade-in duration-300 isolate">
      
      {/* Top Bar */}
      <div className="flex-none flex justify-between items-center p-6 landscape:p-4 landscape:py-2 pt-[calc(1.5rem+env(safe-area-inset-top))] landscape:pt-[calc(0.5rem+env(safe-area-inset-top))] bg-white dark:bg-slate-950 z-10 relative">
        <div className="flex gap-2">
           {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
             <div 
               key={i} 
               className={`h-1.5 rounded-full transition-all duration-300 ${i + 1 === step ? 'w-8 bg-saffron-500' : 'w-2 bg-slate-200 dark:bg-slate-800'}`} 
             />
           ))}
        </div>
        <button 
          onClick={onComplete}
          className="text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-white dark:bg-slate-950 px-2 py-1 rounded-lg"
        >
          {t.skip}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-6 landscape:px-8 pb-8 scroll-container relative z-0 flex flex-col">
        <div className="w-full max-w-md landscape:max-w-5xl mx-auto my-auto pt-4 md:pt-10 landscape:pt-0">
          
          {/* STEP 1: LANGUAGE */}
          {step === 1 && (
            <div className="w-full grid grid-cols-1 landscape:grid-cols-2 gap-8 landscape:gap-16 items-center animate-in slide-in-from-right duration-300">
               <div className="text-center landscape:text-left space-y-4">
                   <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto landscape:mx-0 text-blue-600 dark:text-blue-400 mb-4 shadow-sm">
                      <Languages size={40} />
                   </div>
                   <h2 className="text-3xl font-bold text-slate-800 dark:text-white font-hindi leading-tight">{t.step1Title}</h2>
                   <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">{t.step1Desc}</p>
               </div>

               <div className="grid grid-cols-1 gap-4 w-full">
                  <button 
                    onClick={() => setSettingsLanguage('hi')}
                    className={`p-6 rounded-2xl border-2 flex items-center justify-between transition-all group ${
                        settingsLanguage === 'hi' 
                        ? 'border-saffron-500 bg-saffron-50 dark:bg-slate-800 dark:border-saffron-500 shadow-md ring-1 ring-saffron-500 dark:ring-saffron-400' 
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-saffron-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                     <div className="text-left">
                        <span className="text-xl font-bold block text-slate-800 dark:text-white group-hover:text-saffron-600 dark:group-hover:text-saffron-400 transition-colors">हिन्दी</span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">Hindi</span>
                     </div>
                     {settingsLanguage === 'hi' && <div className="bg-saffron-500 text-white p-1 rounded-full animate-pop"><Check size={20} /></div>}
                  </button>

                  <button 
                    onClick={() => setSettingsLanguage('en')}
                    className={`p-6 rounded-2xl border-2 flex items-center justify-between transition-all group ${
                        settingsLanguage === 'en' 
                        ? 'border-saffron-500 bg-saffron-50 dark:bg-slate-800 dark:border-saffron-500 shadow-md ring-1 ring-saffron-500 dark:ring-saffron-400' 
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-saffron-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                     <div className="text-left">
                        <span className="text-xl font-bold block text-slate-800 dark:text-white group-hover:text-saffron-600 dark:group-hover:text-saffron-400 transition-colors">English</span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">English</span>
                     </div>
                     {settingsLanguage === 'en' && <div className="bg-saffron-500 text-white p-1 rounded-full animate-pop"><Check size={20} /></div>}
                  </button>
               </div>
            </div>
          )}

          {/* STEP 2: APPEARANCE */}
          {step === 2 && (
            <div className="w-full grid grid-cols-1 landscape:grid-cols-2 gap-8 landscape:gap-16 items-center animate-in slide-in-from-right duration-300">
               <div className="text-center landscape:text-left space-y-4">
                  <div className="w-20 h-20 bg-saffron-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto landscape:mx-0 text-saffron-600 dark:text-saffron-400 mb-4 shadow-sm">
                    <Palette size={40} />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-800 dark:text-white font-hindi leading-tight">{t.step2Title}</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">{t.step2Desc}</p>
               </div>

               <div className="space-y-6 w-full">
                   {/* UI Scale */}
                   <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs font-bold uppercase text-slate-400">{t.uiSize}</span>
                        <span className="text-xs font-bold text-saffron-600 dark:text-saffron-400">{Math.round(uiScale * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Type size={16} className="text-slate-400"/>
                        <input 
                          type="range" min="0.85" max="1.15" step="0.05"
                          value={uiScale} onChange={(e) => setUiScale(parseFloat(e.target.value))}
                          className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-saffron-500"
                        />
                        <Type size={24} className="text-slate-800 dark:text-white"/>
                      </div>
                   </div>

                   {/* Mode */}
                   <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                       {['auto', 'light', 'dark'].map((m) => (
                         <button
                           key={m}
                           onClick={() => {
                              if (m === 'auto') setThemeMode('auto');
                              else handleThemeChange(m === 'dark');
                           }}
                           className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                             (m === 'auto' && themeMode === 'auto') || (m === 'light' && themeMode === 'light') || (m === 'dark' && themeMode === 'dark')
                               ? 'bg-white dark:bg-slate-800 text-saffron-600 shadow-sm' 
                               : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                           }`}
                         >
                            {m === 'auto' ? <Monitor size={14}/> : m === 'light' ? <Sun size={14}/> : <Moon size={14}/>}
                            {m.toUpperCase()}
                         </button>
                       ))}
                   </div>

                   {/* Color Grid */}
                   <div>
                      <span className="text-xs font-bold uppercase text-slate-400 mb-3 block">{t.themeColor}</span>
                      <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                        {themeColors.map(c => (
                          <button
                            key={c}
                            onClick={() => setThemeColor(c)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${themeColor === c ? 'scale-110 ring-2 ring-offset-2 ring-slate-300 dark:ring-slate-600' : 'hover:scale-105'}`}
                            style={{ backgroundColor: THEME_PALETTES[c]['500'] }}
                          >
                            {themeColor === c && <Check size={16} className="text-white drop-shadow-md" />}
                          </button>
                        ))}
                      </div>
                   </div>
               </div>
            </div>
          )}

          {/* STEP 3: READER FEATURES */}
          {step === 3 && (
            <div className="w-full grid grid-cols-1 landscape:grid-cols-2 gap-8 landscape:gap-16 items-center animate-in slide-in-from-right duration-300">
               <div className="text-center landscape:text-left space-y-4">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto landscape:mx-0 text-green-600 dark:text-green-400 mb-4 shadow-sm">
                    <BookOpen size={40} />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-800 dark:text-white font-hindi leading-tight">{t.step3Title}</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">{t.step3Desc}</p>
               </div>

               <div className="space-y-3 w-full">
                  <FeatureItem icon={<Smartphone size={18} />} title="Book Mode" desc="Pinch to zoom & pan like a real book." />
                  <FeatureItem icon={<Type size={18} />} title="Text Formatting" desc="Adjust size, spacing & alignment." />
                  <FeatureItem icon={<Heart size={18} />} title="Favorites" desc="Save bhajans to playlists instantly." />
                  <FeatureItem icon={<Type size={18} />} title="Dual Script" desc="Switch between Hindi & English text." />
               </div>
            </div>
          )}

          {/* STEP 4: AUDIO FEATURES */}
          {step === 4 && (
            <div className="w-full grid grid-cols-1 landscape:grid-cols-2 gap-8 landscape:gap-16 items-center animate-in slide-in-from-right duration-300">
               <div className="text-center landscape:text-left space-y-4">
                  <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto landscape:mx-0 text-purple-600 dark:text-purple-400 mb-4 shadow-sm">
                    <Music size={40} />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-800 dark:text-white font-hindi leading-tight">{t.step4Title}</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">{t.step4Desc}</p>
               </div>

               <div className="space-y-3 w-full">
                  <FeatureItem icon={<Music size={18} />} title="Background Play" desc="Audio continues when screen is off." />
                  <FeatureItem icon={<Mic2 size={18} />} title="Multiple Singers" desc="Choose different versions of songs." />
                  <FeatureItem icon={<ListMusic size={18} />} title="Katha & Kirtan" desc="Exclusive recordings of Gurudev." />
               </div>
            </div>
          )}

          {/* STEP 5: BOOKS FEATURES */}
          {step === 5 && (
            <div className="w-full grid grid-cols-1 landscape:grid-cols-2 gap-8 landscape:gap-16 items-center animate-in slide-in-from-right duration-300">
               <div className="text-center landscape:text-left space-y-4">
                  <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto landscape:mx-0 text-orange-600 dark:text-orange-400 mb-4 shadow-sm">
                    <BookOpen size={40} />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-800 dark:text-white font-hindi leading-tight">{t.step5Title}</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">{t.step5Desc}</p>
               </div>

               <div className="space-y-3 w-full">
                  <FeatureItem icon={<Bookmark size={18} />} title="Bookmarks" desc="Save your page reading progress." />
                  <FeatureItem icon={<BookOpen size={18} />} title="Offline PDF" desc="Download books to read anytime." />
                  <FeatureItem icon={<Type size={18} />} title="Zoom & View" desc="High quality PDF viewer built-in." />
               </div>
            </div>
          )}

          {/* STEP 6: DAILY UPDATES (NEW) */}
          {step === 6 && (
            <div className="w-full grid grid-cols-1 landscape:grid-cols-2 gap-8 landscape:gap-16 items-center animate-in slide-in-from-right duration-300">
               <div className="text-center landscape:text-left space-y-4">
                  <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto landscape:mx-0 text-yellow-600 dark:text-yellow-400 mb-4 shadow-sm">
                    <Sparkles size={40} />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-800 dark:text-white font-hindi leading-tight">{t.step6Title}</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">{t.step6Desc}</p>
               </div>

               <div className="space-y-3 w-full">
                  <FeatureItem icon={<Camera size={18} />} title="Daily Darshan" desc="Latest photos from temples & centers." />
                  <FeatureItem icon={<Calendar size={18} />} title="Vaishnav Calendar" desc="Ekadashi & Festival reminders." />
                  <FeatureItem icon={<Bell size={18} />} title="Daily Information" desc="Updates, news & announcements." />
               </div>
            </div>
          )}

          {/* STEP 7: LIBRARY (WAS 6) */}
          {step === 7 && (
            <div className="w-full grid grid-cols-1 landscape:grid-cols-2 gap-8 landscape:gap-16 items-center animate-in slide-in-from-right duration-300">
               <div className="text-center landscape:text-left space-y-4">
                  <div className="w-20 h-20 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto landscape:mx-0 text-pink-600 dark:text-pink-400 mb-4 shadow-sm">
                    <ListMusic size={40} />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-800 dark:text-white font-hindi leading-tight">{t.step7Title}</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">{t.step7Desc}</p>
               </div>

               <div className="space-y-3 w-full">
                  <FeatureItem icon={<ListMusic size={18} />} title="Playlists" desc="Create custom lists of Bhajans." />
                  <FeatureItem icon={<Mic2 size={18} />} title="Singers Tab" desc="Browse songs by specific singers." />
                  <FeatureItem icon={<Bookmark size={18} />} title="History" desc="Quickly access recently viewed items." />
               </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex-none p-6 landscape:p-4 landscape:py-2 pb-[calc(2rem+env(safe-area-inset-bottom))] landscape:pb-[calc(1rem+env(safe-area-inset-bottom))] bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex gap-4 z-10 relative">
         {step > 1 && (
           <button 
             onClick={handleBack}
             className="px-6 py-4 landscape:py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
           >
             {t.back}
           </button>
         )}
         <button 
           onClick={handleNext}
           className="flex-1 py-4 landscape:py-3 bg-saffron-500 hover:bg-saffron-600 text-white rounded-xl font-bold shadow-lg shadow-saffron-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
         >
           {step === TOTAL_STEPS ? t.finish : t.next}
           {step !== TOTAL_STEPS && <ChevronRight size={20} />}
         </button>
      </div>

    </div>
  );
};

const FeatureItem = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-saffron-200 dark:hover:border-saffron-900 transition-colors group">
      <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:text-saffron-500 dark:group-hover:text-saffron-400 transition-colors">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-slate-800 dark:text-white leading-tight group-hover:text-saffron-700 dark:group-hover:text-saffron-400 transition-colors">{title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
      </div>
  </div>
);
