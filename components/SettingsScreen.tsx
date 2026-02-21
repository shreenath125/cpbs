import React, { useState, useEffect, useRef } from 'react';
import { X, Moon, Sun, MessageCircle, Languages, Trash2, Layout, Smartphone, Type, Monitor, HardDrive, ExternalLink, ChevronRight, Palette, Clock, Info } from 'lucide-react';
import { FontSize, ScriptType, Bhajan, Book, LectureData, ThemeColor, EventData, ThemeMode } from '../types';
import { DeveloperOptions } from './DeveloperOptions';
import { THEME_PALETTES } from '../utils/theme';

interface SettingsScreenProps {
  isOpen: boolean;
  onClose: () => void;
  uiScale: number;
  onUiScaleChange: (scale: number) => void;
  script: ScriptType;
  onScriptChange: (script: ScriptType) => void;
  darkMode: boolean; // Keep for compatibility if needed, but UI uses themeMode
  onThemeChange: (isDark: boolean) => void; // Keep for compatibility
  
  themeMode?: ThemeMode; // Optional to prevent breaking if not passed immediately during refactor
  onThemeModeChange?: (mode: ThemeMode) => void;

  keepAwake: boolean;
  onKeepAwakeChange: (val: boolean) => void;
  settingsLanguage: 'en' | 'hi';
  onSettingsLanguageChange: (lang: 'en' | 'hi') => void;
  
  // New Settings Props
  scrollBarSide: 'left' | 'right';
  onScrollBarSideChange: (side: 'left' | 'right') => void;
  azSliderSide: 'left' | 'right';
  onAzSliderSideChange: (side: 'left' | 'right') => void;
  indexMode?: 'latin' | 'devanagari'; 
  
  themeColor: ThemeColor;
  onThemeColorChange: (color: ThemeColor) => void;

  devMode: boolean;
  onDevModeChange: (val: boolean) => void;
  onResetData: () => void;
  onRestoreDeleted?: () => void;
  onAddBhajan: () => void;
  onImportData: (json: string) => boolean;
  allBhajans: Bhajan[];
  
  // Admin Data Props
  books?: Book[];
  lectures?: LectureData[];
  events?: EventData[];
  onUpdateBhajans?: (data: Bhajan[]) => void;
  onUpdateBooks?: (data: Book[]) => void;
  onUpdateLectures?: (data: LectureData[]) => void;
  onUpdateEvents?: (data: EventData[]) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  isOpen, onClose, uiScale, onUiScaleChange, script, onScriptChange, 
  darkMode, onThemeChange, themeMode, onThemeModeChange, 
  keepAwake, onKeepAwakeChange, 
  settingsLanguage, onSettingsLanguageChange,
  scrollBarSide, onScrollBarSideChange,
  azSliderSide, onAzSliderSideChange,
  indexMode,
  themeColor, onThemeColorChange,
  devMode, onDevModeChange,
  onResetData, onRestoreDeleted, onAddBhajan, onImportData, allBhajans,
  books, lectures, events, onUpdateBhajans, onUpdateBooks, onUpdateLectures, onUpdateEvents
}) => {
  const clickCountRef = useRef(0);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authAction, setAuthAction] = useState<'ENABLE' | 'DISABLE'>('ENABLE');
  const [showDisabledMsg, setShowDisabledMsg] = useState(false);
  const [pendingLink, setPendingLink] = useState<{ url: string; title: string; icon?: React.ReactNode } | null>(null);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [infoPopup, setInfoPopup] = useState<{ title: string; description: string } | null>(null);

  // Translations
  const t = {
    en: {
      title: "Settings",
      sectionDisplay: "Display & Text",
      descDisplay: "Adjust text size and app theme (Light/Dark mode).",
      sectionContent: "Content & Language",
      descContent: "Choose App language and Bhajan script (Hindi/English).",
      sectionInterface: "Interface Layout",
      descInterface: "Customize layout for left/right handed use.",
      sectionSystem: "System & Support",
      descSystem: "Screen wake lock and support options.",
      sectionStorage: "Storage & Maintenance",
      descStorage: "Manage app data and cache.",
      
      uiScale: "App UI Size",
      theme: "App Theme",
      themeAuto: "Auto",
      themeLight: "Light",
      themeDark: "Dark",
      moreThemes: "Color Themes",
      
      scrollBarPos: "Scrollbar",
      azSliderPos: "Slider", 
      left: "Left",
      right: "Right",
      
      bhajanLang: "Bhajan Script",
      appLang: "App Language",
      
      keepAwake: "Keep Screen Awake",
      keepAwakeDesc: "Prevents screen from turning off while reading",
      
      feedback: "Send Feedback",
      feedbackDesc: "Contact us on WhatsApp",
      
      clearCache: "Clear App Cache",
      clearCacheDesc: "Fix issues by resetting local data",
      
      devOptions: "Developer Mode",
      devEnabled: "Active (Tap 3x to Disable)",
      devDisabled: "Inactive",
      
      enterPass: "Enter Developer Password",
      passDisable: "Password to Disable",
      cancel: "Cancel",
      submit: "Submit",
      close: "Close",
      
      infoDisplay: "Adjust text size, spacing, and app appearance.\nChoose Light, Dark, or Auto mode for reading.",
      infoContent: "Select App Language and Bhajan Script.\nChoose between Hindi or English script.",
      infoInterface: "Customize controls for left/right-hand usage.\nMove scrollbars and sliders to preferred side.",
      infoSystem: "Keep screen awake while reading.\nContact us directly on WhatsApp for help.",
      infoStorage: "Manage app storage and cache.\nClear local data to fix loading issues."
    },
    hi: {
      title: "सेटिंग्स",
      sectionDisplay: "दिखावट और अक्षर",
      descDisplay: "अक्षर का आकार और ऐप का थीम (लाइट/डार्क) बदलें।",
      sectionContent: "भाषा और सामग्री",
      descContent: "ऐप की भाषा और भजन की लिपि (हिंदी/अंग्रेजी) चुनें।",
      sectionInterface: "इंटरफ़ेस लेआउट",
      descInterface: "बाएं/दाएं हाथ के उपयोग के लिए लेआउट बदलें।",
      sectionSystem: "सिस्टम और सहायता",
      descSystem: "स्क्रीन ऑन रखने और सहायता के विकल्प।",
      sectionStorage: "स्टोरेज और रखरखाव",
      descStorage: "ऐप डेटा और कैश प्रबंधित करें।",
      
      uiScale: "ऐप का आकार",
      theme: "ऐप का थीम",
      themeAuto: "ऑटो",
      themeLight: "लाइट",
      themeDark: "डार्क",
      moreThemes: "रंग थीम",
      
      scrollBarPos: "स्क्रोलबार",
      azSliderPos: "स्लाइडर",
      left: "बायाँ",
      right: "दायाँ",
      
      bhajanLang: "भजन की लिपि",
      appLang: "ऐप की भाषा",
      
      keepAwake: "स्क्रीन को जगाए रखें",
      keepAwakeDesc: "पढ़ते समय स्क्रीन बंद नहीं होगी",
      
      feedback: "सुझाव भेजें",
      feedbackDesc: "व्हाट्सएप पर संपर्क करें",
      
      clearCache: "ऐप कैश मिटाएं",
      clearCacheDesc: "डेटा रीसेट करके समस्याएं ठीक करें",
      
      devOptions: "डेवलपर मोड",
      devEnabled: "सक्रिय (बंद करने के लिए 3 बार टैप करें)",
      devDisabled: "निष्क्रिय",
      
      enterPass: "डेवलपर पासवर्ड दर्ज करें",
      passDisable: "अक्षम करने के लिए पासवर्ड",
      cancel: "रद्द करें",
      submit: "जमा करें",
      close: "बंद करें",
      
      infoDisplay: "अक्षर का आकार, अंतराल और ऐप का रंग-रूप बदलें।\nपढ़ने के लिए आरामदायक लाइट, डार्क या ऑटो मोड चुनें।",
      infoContent: "ऐप की भाषा और भजन की लिपि (हिंदी/अंग्रेजी) चुनें।\nभजन पढ़ने के लिए अपनी पसंदीदा लिपि सेट करें।",
      infoInterface: "बाएं/दाएं हाथ के उपयोग के लिए लेआउट बदलें।\nकंट्रोल और स्क्रोलबार की दिशा अपनी सुविधानुसार सेट करें।",
      infoSystem: "पढ़ते समय स्क्रीन को बंद होने से रोकें।\nकिसी भी समस्या या सहायता के लिए सीधे व्हाट्सएप पर संपर्क करें।",
      infoStorage: "ऐप डेटा और कैश प्रबंधित करें।\nलोडिंग समस्याओं को ठीक करने के लिए डेटा साफ़ करें।"
    }
  }[settingsLanguage];

  useEffect(() => {
    if (!isOpen) {
      clickCountRef.current = 0;
      setShowPasswordModal(false);
      setShowDisabledMsg(false);
      setPendingLink(null);
      setPasswordInput('');
      setShowThemeModal(false);
      setInfoPopup(null);
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    }
  }, [isOpen]);

  useEffect(() => {
    if (showThemeModal) {
        const id = `theme-modal-${Date.now()}`;
        window.history.pushState({ isPopup: true, modalId: id }, '');
        const handler = () => setShowThemeModal(false);
        window.addEventListener('popstate', handler);
        return () => {
            window.removeEventListener('popstate', handler);
            if(window.history.state?.modalId === id) window.history.back();
        };
    }
  }, [showThemeModal]);

  useEffect(() => {
    if (showPasswordModal) {
        const id = `pass-modal-${Date.now()}`;
        window.history.pushState({ isPopup: true, modalId: id }, '');
        const handler = () => setShowPasswordModal(false);
        window.addEventListener('popstate', handler);
        return () => {
            window.removeEventListener('popstate', handler);
            if(window.history.state?.modalId === id) window.history.back();
        };
    }
  }, [showPasswordModal]);

  useEffect(() => {
    if (pendingLink) {
        const id = `link-modal-${Date.now()}`;
        window.history.pushState({ isPopup: true, modalId: id }, '');
        const handler = () => setPendingLink(null);
        window.addEventListener('popstate', handler);
        return () => {
            window.removeEventListener('popstate', handler);
            if(window.history.state?.modalId === id) window.history.back();
        };
    }
  }, [pendingLink]);

  useEffect(() => {
    if (infoPopup) {
        const id = `info-modal-${Date.now()}`;
        window.history.pushState({ isPopup: true, modalId: id }, '');
        const handler = () => setInfoPopup(null);
        window.addEventListener('popstate', handler);
        return () => {
            window.removeEventListener('popstate', handler);
            if(window.history.state?.modalId === id) window.history.back();
        };
    }
  }, [infoPopup]);

  const openInfoPopup = (title: string, description: string) => {
      setInfoPopup({ title, description });
  };

  const closeInfoPopup = () => {
      setInfoPopup(null); 
  };

  const handleSecretClick = () => {
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickCountRef.current += 1;

    clickTimeoutRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1000);

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      
      if (devMode) {
          onDevModeChange(false);
          alert(settingsLanguage === 'en' ? "Developer Mode Disabled" : "डेवलपर मोड अक्षम किया गया");
      } else {
          setAuthAction('ENABLE');
          setShowPasswordModal(true);
      }
    }
  };

  const handlePasswordSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (passwordInput === "470113") {
        setShowPasswordModal(false);
        setPasswordInput('');
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try { navigator.vibrate([100, 50, 100]); } catch (e) { }
        }
        if (authAction === 'ENABLE') {
             onDevModeChange(true);
             alert("Developer Mode Enabled!");
        } 
    } else {
        alert("Incorrect Password");
        setPasswordInput('');
    }
  };

  const handleFeedback = () => {
    setPendingLink({
        url: 'https://wa.me/917049304733',
        title: settingsLanguage === 'en' ? 'Feedback (WhatsApp)' : 'सुझाव (व्हाट्सएप)',
        icon: <MessageCircle size={24} />
    });
  };

  const confirmNavigation = () => {
      if (pendingLink) {
          window.open(pendingLink.url, '_blank');
          setPendingLink(null);
      }
  };

  const handleClearCache = async () => {
    if (window.confirm(settingsLanguage === 'en' ? "This will clear all app data, settings, and cached files. The app will restart. Continue?" : "यह सभी ऐप डेटा, सेटिंग्स और कैश को मिटा देगा। ऐप रीस्टार्ट होगा। जारी रखें?")) {
       try {
         localStorage.clear();
         if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map(key => caches.delete(key)));
         }
         window.location.reload();
       } catch (e) {
         console.error(e);
         alert("Failed to clear cache completely.");
       }
    }
  };

  const themeColors: { key: ThemeColor; label: string; color: string }[] = [
    { key: 'saffron', label: 'Saffron', color: THEME_PALETTES.saffron['500'] },
    { key: 'deepBlue', label: 'Deep Blue', color: THEME_PALETTES.deepBlue['500'] },
    { key: 'red', label: 'Red', color: THEME_PALETTES.red['500'] },
    { key: 'amber', label: 'Amber', color: THEME_PALETTES.amber['500'] },
    { key: 'lime', label: 'Lime', color: THEME_PALETTES.lime['500'] },
    { key: 'emerald', label: 'Emerald', color: THEME_PALETTES.emerald['500'] },
    { key: 'teal', label: 'Teal', color: THEME_PALETTES.teal['500'] },
    { key: 'cyan', label: 'Cyan', color: THEME_PALETTES.cyan['500'] },
    { key: 'sky', label: 'Sky', color: THEME_PALETTES.sky['500'] },
    { key: 'blue', label: 'Ocean', color: THEME_PALETTES.blue['500'] },
    { key: 'indigo', label: 'Indigo', color: THEME_PALETTES.indigo['500'] },
    { key: 'violet', label: 'Violet', color: THEME_PALETTES.violet['500'] },
    { key: 'purple', label: 'Royal', color: THEME_PALETTES.purple['500'] },
    { key: 'fuchsia', label: 'Fuchsia', color: THEME_PALETTES.fuchsia['500'] },
    { key: 'pink', label: 'Pink', color: THEME_PALETTES.pink['500'] },
    { key: 'rose', label: 'Rose', color: THEME_PALETTES.rose['500'] },
  ];

  if (!isOpen) return null;

  let buttonContent = devMode ? t.devEnabled : t.devDisabled;
  let buttonClass = devMode 
      ? "bg-green-600 hover:bg-green-700 active:bg-green-800 cursor-pointer select-none"
      : "bg-[#bc8d31] hover:bg-[#a67a26]";
  
  if (showDisabledMsg) {
      buttonContent = t.devDisabled;
      buttonClass = "bg-slate-500 cursor-default";
  }

  const sliderLabel = indexMode === 'latin' ? "A-Z Slider" : "अ-ज्ञ Slider";
  const currentThemeMode = themeMode || (darkMode ? 'dark' : 'light');

  const handleModeChange = (mode: ThemeMode) => {
      if (onThemeModeChange) {
          onThemeModeChange(mode);
      } else {
          onThemeChange(mode === 'dark'); 
      }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#fdfbf7] dark:bg-slate-950 flex flex-col animate-in slide-in-from-left duration-300">
      
      {/* Header - Updated to Cream & Gold */}
      <div dir="ltr" className="flex-none bg-[#fdfbf7] dark:bg-slate-900 text-[#bc8d31] p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center justify-between shadow-sm z-10 transition-colors duration-300 border-b border-[#bc8d31]/30">
        <div className="flex items-center gap-4">
            <button onClick={onClose} className="relative z-10 p-1 hover:bg-[#bc8d31]/10 rounded-full transition-colors text-[#bc8d31]" type="button">
            <X className="w-6 h-6" />
            </button>
            <h2 className="relative z-10 text-xl font-bold tracking-wide" style={{ fontFamily: '"Kaushan Script", cursive' }}>{t.title}</h2>
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto bg-[#fdfbf7] dark:bg-slate-950 ${scrollBarSide === 'left' ? 'left-scrollbar' : ''}`}>
        <div dir={scrollBarSide === 'left' ? 'ltr' : undefined} className="p-4 pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-6 max-w-2xl mx-auto mt-2">
          
          {/* Card 1: Display & Appearance */}
          <SectionCard 
            title={t.sectionDisplay} 
            icon={<Monitor size={22} className="text-[#bc8d31] dark:text-[#bc8d31]" />} 
            description={t.descDisplay}
            onInfoClick={() => openInfoPopup(t.sectionDisplay, t.infoDisplay)}
          >
             
             {/* App UI Size Slider */}
             <div className="mb-6">
                <div className="flex justify-between items-center mb-2 px-1">
                   <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{t.uiScale}</span>
                   <span className="text-xs font-bold bg-[#bc8d31]/10 dark:bg-slate-700 text-[#bc8d31] px-2 py-0.5 rounded border border-[#bc8d31]/20">{Math.round(uiScale * 100)}%</span>
                </div>
                <div className="flex items-center gap-3">
                   <span className="text-xs font-bold text-slate-400">A</span>
                   <input 
                      type="range" 
                      min="0.85" 
                      max="1.15" 
                      step="0.05"
                      value={uiScale}
                      onChange={(e) => onUiScaleChange(parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-[#bc8d31]/20 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#bc8d31]"
                   />
                   <span className="text-lg font-bold text-slate-600 dark:text-slate-300">A</span>
                </div>
             </div>

             {/* Theme Toggle (Segmented Control) */}
             <div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-2 px-1">{t.theme}</span>
                <div className="flex bg-[#bc8d31]/5 dark:bg-slate-900/50 p-1 rounded-xl gap-1 border border-[#bc8d31]/20">
                   <SegmentedButton 
                      active={currentThemeMode === 'auto'} 
                      onClick={() => handleModeChange('auto')} 
                      icon={<Clock size={16} />} 
                      label={t.themeAuto}
                   />
                   <SegmentedButton 
                      active={currentThemeMode === 'light'} 
                      onClick={() => handleModeChange('light')} 
                      icon={<Sun size={16} />} 
                      label={t.themeLight} 
                   />
                   <SegmentedButton 
                      active={currentThemeMode === 'dark'} 
                      onClick={() => handleModeChange('dark')} 
                      icon={<Moon size={16} />} 
                      label={t.themeDark} 
                   />
                </div>
             </div>

             {/* More Theme Colors */}
             <div className="pt-2">
                <button 
                  onClick={() => setShowThemeModal(true)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-[#bc8d31]/30 hover:bg-[#bc8d31]/5 dark:hover:bg-slate-700 transition-colors shadow-sm mt-2"
                >
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: THEME_PALETTES[themeColor]?.['500'] || THEME_PALETTES['saffron']['500'] }}>
                         <Palette size={16} />
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{t.moreThemes}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                         {themeColors.slice(0, 3).map(tc => (
                            <div key={tc.key} className="w-3 h-3 rounded-full" style={{ backgroundColor: tc.color }}></div>
                         ))}
                      </div>
                      <ChevronRight size={16} className="text-slate-400" />
                   </div>
                </button>
             </div>
          </SectionCard>

          {/* Card 2: Content & Language */}
          <SectionCard 
            title={t.sectionContent} 
            icon={<Languages size={22} className="text-[#bc8d31]" />} 
            description={t.descContent}
            onInfoClick={() => openInfoPopup(t.sectionContent, t.infoContent)}
          >
             
             {/* App Language */}
             <div className="mb-5">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-2 px-1">{t.appLang}</span>
                <div className="flex bg-[#bc8d31]/5 dark:bg-slate-900/50 p-1 rounded-xl border border-[#bc8d31]/20">
                   <SegmentedButton 
                      active={settingsLanguage === 'hi'} 
                      onClick={() => onSettingsLanguageChange('hi')} 
                      label="हिन्दी" 
                   />
                   <SegmentedButton 
                      active={settingsLanguage === 'en'} 
                      onClick={() => onSettingsLanguageChange('en')} 
                      label="English" 
                   />
                </div>
             </div>

             {/* Bhajan Script */}
             <div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-2 px-1">{t.bhajanLang}</span>
                <div className="flex bg-[#bc8d31]/5 dark:bg-slate-900/50 p-1 rounded-xl border border-[#bc8d31]/20">
                   <SegmentedButton 
                      active={script === 'devanagari'} 
                      onClick={() => onScriptChange('devanagari')} 
                      label="हिन्दी" 
                   />
                   <SegmentedButton 
                      active={script === 'iast'} 
                      onClick={() => onScriptChange('iast')} 
                      label="English" 
                   />
                </div>
             </div>
          </SectionCard>

          {/* Card 3: Interface Layout */}
          <SectionCard 
            title={t.sectionInterface} 
            icon={<Layout size={22} className="text-[#bc8d31]" />} 
            description={t.descInterface}
            onInfoClick={() => openInfoPopup(t.sectionInterface, t.infoInterface)}
          >
             
             {/* AZ Slider Position */}
             <div className="mb-5">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-2 px-1">{sliderLabel}</span>
                <div className="flex bg-[#bc8d31]/5 dark:bg-slate-900/50 p-1 rounded-xl border border-[#bc8d31]/20">
                   <SegmentedButton 
                      active={azSliderSide === 'left'} 
                      onClick={() => onAzSliderSideChange('left')} 
                      label={t.left} 
                   />
                   <SegmentedButton 
                      active={azSliderSide === 'right'} 
                      onClick={() => onAzSliderSideChange('right')} 
                      label={t.right} 
                   />
                </div>
             </div>

             {/* Scrollbar Position */}
             <div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-2 px-1">{t.scrollBarPos}</span>
                <div className="flex bg-[#bc8d31]/5 dark:bg-slate-900/50 p-1 rounded-xl border border-[#bc8d31]/20">
                   <SegmentedButton 
                      active={scrollBarSide === 'left'} 
                      onClick={() => onScrollBarSideChange('left')} 
                      label={t.left} 
                   />
                   <SegmentedButton 
                      active={scrollBarSide === 'right'} 
                      onClick={() => onScrollBarSideChange('right')} 
                      label={t.right} 
                   />
                </div>
             </div>
          </SectionCard>

          {/* Card 4: System & Support */}
          <SectionCard 
            title={t.sectionSystem} 
            icon={<Smartphone size={22} className="text-[#bc8d31]" />} 
            description={t.descSystem}
            onInfoClick={() => openInfoPopup(t.sectionSystem, t.infoSystem)}
          >
             
             {/* Keep Awake */}
             <ActionRow 
                icon={<Smartphone size={20} className="text-[#bc8d31]" />}
                label={t.keepAwake}
                desc={t.keepAwakeDesc}
                action={
                   <div 
                      onClick={() => onKeepAwakeChange(!keepAwake)}
                      className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${keepAwake ? 'bg-[#bc8d31]' : 'bg-slate-200 dark:bg-slate-600'}`}
                   >
                      <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${keepAwake ? 'left-6' : 'left-1'}`} />
                   </div>
                }
             />

             <div className="h-px bg-[#bc8d31]/10 dark:bg-slate-700 my-1" />

             {/* Feedback */}
             <ActionRow 
                icon={<MessageCircle size={20} className="text-[#bc8d31]" />}
                label={t.feedback}
                desc={t.feedbackDesc}
                onClick={handleFeedback}
                showChevron
             />
          </SectionCard>

          {/* Card 5: Storage & Maintenance */}
          <SectionCard 
            title={t.sectionStorage} 
            icon={<HardDrive size={22} className="text-[#bc8d31]" />} 
            description={t.descStorage}
            onInfoClick={() => openInfoPopup(t.sectionStorage, t.infoStorage)}
          >
             <ActionRow 
                icon={<Trash2 size={20} className="text-red-500" />}
                label={t.clearCache}
                desc={t.clearCacheDesc}
                onClick={handleClearCache}
                className="text-red-600 dark:text-red-400"
             />
          </SectionCard>

          {/* Card 6: Developer Options (Entry Only) */}
          <div className="pt-4">
             <button 
               type="button"
               onClick={handleSecretClick}
               className={`w-full py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-white transition-all ${buttonClass}`}
             >
                {t.devOptions}: {buttonContent}
             </button>

             {devMode && (
                <DeveloperOptions 
                    onAddBhajan={onAddBhajan}
                    onResetData={onResetData}
                    onImportData={onImportData}
                    allBhajans={allBhajans}
                    books={books}
                    lectures={lectures}
                    events={events}
                    onUpdateBhajans={onUpdateBhajans}
                    onUpdateBooks={onUpdateBooks}
                    onUpdateLectures={onUpdateLectures}
                    onUpdateEvents={onUpdateEvents}
                    settingsLanguage={settingsLanguage}
                />
             )}
          </div>

        </div>
      </div>

      {/* Theme Color Modal */}
      {showThemeModal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in duration-200">
           <div className="bg-[#fdfbf7] dark:bg-slate-900 w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl shadow-2xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[85vh] landscape:max-h-[95vh] overflow-hidden flex flex-col border border-[#bc8d31]/30">
              <div className="flex justify-between items-center mb-6 shrink-0">
                 <h3 className="text-lg font-bold text-[#bc8d31] dark:text-white">{t.moreThemes}</h3>
                 <button onClick={() => setShowThemeModal(false)} className="p-2 bg-[#bc8d31]/10 dark:bg-slate-800 rounded-full text-[#bc8d31] hover:bg-[#bc8d31]/20 transition-colors">
                    <X size={20} />
                 </button>
              </div>
              
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-4 gap-2 mb-2">
                   {themeColors.map((tc) => (
                      <button
                         key={tc.key}
                         onClick={() => { onThemeColorChange(tc.key); setShowThemeModal(false); }}
                         className={`flex flex-col items-center gap-2 p-2 rounded-xl border-[1.5px] transition-all ${themeColor === tc.key ? 'bg-[#bc8d31]/10 dark:bg-slate-800 border-[#bc8d31]' : 'border-transparent hover:bg-[#bc8d31]/5 dark:hover:bg-slate-800'}`}
                      >
                         <div className="w-12 h-12 rounded-full shadow-md flex items-center justify-center transition-transform active:scale-95" style={{ backgroundColor: tc.color }}>
                            {themeColor === tc.key && <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>}
                         </div>
                         <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{tc.label}</span>
                      </button>
                   ))}
                </div>
              </div>
              
              <div className="pt-4 mt-2 border-t border-[#bc8d31]/20 shrink-0">
                  <button 
                     onClick={() => setShowThemeModal(false)}
                     className="w-full py-3 bg-[#bc8d31] hover:brightness-110 text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
                  >
                     {t.cancel}
                  </button>
              </div>
           </div>
        </div>
      )}

      {/* Info Popup Modal */}
      {infoPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#fdfbf7] dark:bg-slate-800 w-full max-w-xs rounded-3xl shadow-2xl p-6 transform scale-100 transition-all animate-in zoom-in-95 duration-200 relative border border-[#bc8d31]/30">
                <button 
                    onClick={closeInfoPopup}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-[#bc8d31] rounded-full bg-white dark:bg-slate-700 transition-colors shadow-sm"
                >
                    <X size={18} />
                </button>
                
                <div className="flex flex-col items-center text-center mt-2">
                    <div className="w-14 h-14 bg-[#bc8d31]/10 dark:bg-slate-700 rounded-full flex items-center justify-center text-[#bc8d31] mb-4 border border-[#bc8d31]/20">
                        <Info size={28} />
                    </div>
                    
                    <h3 className="text-xl font-bold text-[#bc8d31] dark:text-white mb-4">
                        {infoPopup.title}
                    </h3>
                    
                    <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-[#bc8d31]/20 shadow-inner w-full text-left">
                        {infoPopup.description}
                    </div>
                    
                    <button 
                        onClick={closeInfoPopup}
                        className="mt-6 w-full py-3 bg-[#bc8d31] hover:brightness-110 text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
                    >
                        {t.close}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
               <form onSubmit={handlePasswordSubmit} className="bg-[#fdfbf7] dark:bg-slate-800 w-full max-w-xs p-6 rounded-3xl shadow-2xl transform scale-100 transition-all border border-[#bc8d31]/30">
                   <h3 className="text-lg font-bold text-[#bc8d31] dark:text-white mb-5 text-center">
                       {authAction === 'DISABLE' ? t.passDisable : t.enterPass}
                   </h3>
                   <input 
                      type="password" 
                      autoFocus
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full p-3 bg-white dark:bg-slate-700 rounded-xl text-center font-mono text-lg tracking-widest mb-6 focus:ring-2 focus:ring-[#bc8d31]/50 border border-[#bc8d31]/30 outline-none shadow-inner dark:text-white"
                      placeholder="••••••"
                   />
                   <div className="flex gap-3">
                       <button 
                          type="button" 
                          onClick={() => { setShowPasswordModal(false); setPasswordInput(''); }}
                          className="flex-1 py-2.5 text-slate-500 font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                       >
                          {t.cancel}
                       </button>
                       <button 
                          type="submit"
                          className="flex-1 py-2.5 bg-[#bc8d31] hover:brightness-110 text-white rounded-xl font-bold shadow-md transition-all"
                       >
                          {t.submit}
                       </button>
                   </div>
               </form>
          </div>
      )}

      {/* Confirmation Modal (Pending Link) */}
      {pendingLink && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-[#fdfbf7] dark:bg-slate-800 w-full max-w-xs rounded-3xl shadow-2xl p-6 transform scale-100 transition-all animate-in zoom-in-95 duration-200 border border-[#bc8d31]/30">
                  <div className="flex flex-col items-center text-center mt-2">
                      <div className="w-14 h-14 bg-[#bc8d31]/10 dark:bg-slate-700 rounded-full flex items-center justify-center text-[#bc8d31] mb-4 border border-[#bc8d31]/20">
                          {pendingLink.icon || <ExternalLink size={24} />}
                      </div>
                      
                      <h3 className="text-xl font-bold text-[#bc8d31] dark:text-white mb-2">
                          {settingsLanguage === 'en' ? 'Open WhatsApp?' : 'व्हाट्सएप खोलें?'}
                      </h3>
                      
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                          {settingsLanguage === 'en' ? 'You are leaving the app to open' : 'आप ऐप छोड़कर जा रहे हैं'}: <br/><strong className="text-lg mt-1 block">WhatsApp</strong>
                      </p>
                      
                      <div className="flex gap-3 w-full">
                          <button 
                              onClick={() => setPendingLink(null)}
                              className="flex-1 py-3 text-slate-500 font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                          >
                              {t.cancel}
                          </button>
                          <button 
                              onClick={confirmNavigation}
                              className="flex-1 py-3 text-white font-bold bg-[#bc8d31] hover:brightness-110 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                          >
                              Open
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

// Helper Components
const SectionCard: React.FC<{ 
    title: string; 
    icon: React.ReactNode; 
    description: string; 
    children: React.ReactNode;
    onInfoClick?: () => void; 
}> = ({ title, icon, description, children, onInfoClick }) => (
  <div className="bg-[#fdfbf7] dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-[#bc8d31]/30 dark:border-slate-700 animate-fade-in-up relative overflow-hidden">
    {/* Background Texture Overlay */}
    <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-multiply dark:opacity-10 dark:mix-blend-screen" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }}></div>

    <div className="relative z-10 flex items-center justify-between mb-3 border-b border-[#bc8d31]/10 pb-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#bc8d31]/10 dark:bg-slate-700 flex items-center justify-center text-[#bc8d31] border border-[#bc8d31]/20 shadow-sm">
          {React.cloneElement(icon as any, { size: 20 })}
        </div>
        <h3 className="text-lg font-bold text-[#bc8d31] dark:text-blue-200 tracking-wide" style={{ fontFamily: '"Kaushan Script", cursive' }}>{title}</h3>
      </div>
      {onInfoClick && (
        <button 
            onClick={onInfoClick}
            className="p-2 text-slate-400 hover:text-[#bc8d31] hover:bg-[#bc8d31]/10 dark:hover:bg-slate-700 rounded-full transition-colors"
        >
            <Info size={18} />
        </button>
      )}
    </div>
    <div className="relative z-10 pl-1">
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed font-medium">
        {description}
      </p>
      <div className="pl-1">
        {children}
      </div>
    </div>
  </div>
);

const SegmentedButton: React.FC<{ active: boolean; onClick: () => void; label: string; icon?: React.ReactNode }> = ({ active, onClick, label, icon }) => (
  <button 
    onClick={onClick}
    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${active ? 'bg-[#fdfbf7] dark:bg-slate-700 text-[#bc8d31] shadow-sm border border-[#bc8d31]/30' : 'text-slate-500 dark:text-slate-400 hover:text-[#bc8d31] dark:hover:text-slate-300 border border-transparent'}`}
  >
    {icon && React.cloneElement(icon as any, { className: active ? 'drop-shadow-sm text-[#bc8d31]' : '' })}
    {label}
  </button>
);

const ActionRow: React.FC<{ icon: React.ReactNode; label: string; desc?: string; action?: React.ReactNode; onClick?: () => void; className?: string; showChevron?: boolean }> = ({ icon, label, desc, action, onClick, className, showChevron }) => (
  <div 
    onClick={onClick}
    className={`flex items-center justify-between py-3 px-2 rounded-xl transition-colors ${onClick ? 'cursor-pointer hover:bg-[#bc8d31]/5 dark:hover:bg-slate-700/50 active:bg-[#bc8d31]/10 dark:active:bg-slate-700' : ''} ${className || ''}`}
  >
     <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-[#bc8d31]/5 flex items-center justify-center border border-[#bc8d31]/10 shrink-0">
          {icon}
        </div>
        <div>
           <div className={`text-sm font-bold text-slate-700 dark:text-slate-200 ${className || ''}`}>{label}</div>
           {desc && <div className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">{desc}</div>}
        </div>
     </div>
     {action}
     {showChevron && <ChevronRight size={18} className="text-slate-300 group-hover:text-[#bc8d31]" />}
  </div>
);