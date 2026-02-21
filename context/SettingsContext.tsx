
import React, { createContext, useContext, useState, useEffect, useLayoutEffect } from 'react';
import { FontSize, ScriptType, ThemeColor, ThemeMode } from '../types';
import { applyThemeColor, THEME_PALETTES } from '../utils/theme';

interface SettingsContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  uiScale: number;
  setUiScale: (scale: number) => void;
  script: ScriptType;
  setScript: (script: ScriptType) => void;
  darkMode: boolean;
  setDarkMode: (isDark: boolean) => void;
  keepAwake: boolean;
  setKeepAwake: (keep: boolean) => void;
  settingsLanguage: 'en' | 'hi';
  setSettingsLanguage: (lang: 'en' | 'hi') => void;
  scrollBarSide: 'left' | 'right';
  setScrollBarSide: (side: 'left' | 'right') => void;
  azSliderSide: 'left' | 'right';
  setAzSliderSide: (side: 'left' | 'right') => void;
  devMode: boolean;
  setDevMode: (val: boolean) => void;
  indexMode: 'latin' | 'devanagari';
  setIndexMode: (mode: 'latin' | 'devanagari') => void;
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  handleThemeChange: (isDark: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme Logic
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('cpbs_theme_mode');
    if (saved === 'light' || saved === 'dark' || saved === 'auto') return saved as ThemeMode;
    return 'auto';
  });

  const [darkMode, setDarkMode] = useState(() => {
    // Initial State Check
    if (typeof localStorage !== 'undefined') {
        const savedMode = localStorage.getItem('cpbs_theme_mode') as ThemeMode;
        if (savedMode === 'dark') return true;
        if (savedMode === 'light') return false;
    }
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6;
  });

  useEffect(() => {
    const applyMode = () => {
        let isDark = false;
        if (themeMode === 'auto') {
            const hour = new Date().getHours();
            isDark = hour >= 18 || hour < 6;
        } else {
            isDark = themeMode === 'dark';
        }
        setDarkMode(isDark);
        localStorage.setItem('cpbs_theme_mode', themeMode);
        document.documentElement.classList.toggle('dark', isDark);
    };

    applyMode();

    let interval: any;
    if (themeMode === 'auto') {
        // Check every minute if in auto mode
        interval = setInterval(applyMode, 60000);
    }
    return () => clearInterval(interval);
  }, [themeMode]);

  const handleThemeChange = (isDark: boolean) => {
    // Manual toggle switches off auto mode
    setThemeMode(isDark ? 'dark' : 'light');
  };

  const [fontSize, setFontSize] = useState<FontSize>(() => {
    const saved = localStorage.getItem('cpbs_fontsize');
    return saved ? parseInt(saved, 10) || 20 : 20;
  });
  useEffect(() => localStorage.setItem('cpbs_fontsize', fontSize.toString()), [fontSize]);

  const [uiScale, setUiScale] = useState<number>(() => {
    const saved = localStorage.getItem('cpbs_ui_scale');
    return saved ? parseFloat(saved) : 1.0;
  });

  useLayoutEffect(() => {
    localStorage.setItem('cpbs_ui_scale', uiScale.toString());
    // Apply scale to root element to affect all rem units based on browser default (usually 16px)
    document.documentElement.style.fontSize = `${uiScale * 100}%`;
  }, [uiScale]);

  const [script, setScript] = useState<ScriptType>(() => (localStorage.getItem('cpbs_script') as ScriptType) || 'devanagari');
  useEffect(() => localStorage.setItem('cpbs_script', script), [script]);

  const [keepAwake, setKeepAwake] = useState<boolean>(() => localStorage.getItem('cpbs_awake') !== 'false');
  useEffect(() => localStorage.setItem('cpbs_awake', String(keepAwake)), [keepAwake]);

  const [settingsLanguage, setSettingsLanguage] = useState<'en' | 'hi'>(() => (localStorage.getItem('cpbs_settings_lang') as 'en' | 'hi') || 'en');
  useEffect(() => localStorage.setItem('cpbs_settings_lang', settingsLanguage), [settingsLanguage]);

  const [scrollBarSide, setScrollBarSide] = useState<'left' | 'right'>(() => (localStorage.getItem('cpbs_scrollbar_side') as 'left' | 'right') || 'left');
  useEffect(() => localStorage.setItem('cpbs_scrollbar_side', scrollBarSide), [scrollBarSide]);

  const [azSliderSide, setAzSliderSide] = useState<'left' | 'right'>(() => (localStorage.getItem('cpbs_slider_side') as 'left' | 'right') || 'left');
  useEffect(() => localStorage.setItem('cpbs_slider_side', azSliderSide), [azSliderSide]);

  const [devMode, setDevMode] = useState<boolean>(false);

  const [indexMode, setIndexMode] = useState<'latin' | 'devanagari'>(() => (localStorage.getItem('cpbs_index_mode') as 'latin' | 'devanagari') || 'devanagari');
  useEffect(() => localStorage.setItem('cpbs_index_mode', indexMode), [indexMode]);

  // Default set to 'blue' (Ocean) instead of 'saffron'
  const [themeColor, setThemeColor] = useState<ThemeColor>(() => (localStorage.getItem('cpbs_theme_color') as ThemeColor) || 'blue');
  
  useLayoutEffect(() => {
    applyThemeColor(themeColor);
    localStorage.setItem('cpbs_theme_color', themeColor);
  }, [themeColor]);

  return (
    <SettingsContext.Provider value={{
      fontSize, setFontSize,
      uiScale, setUiScale,
      script, setScript,
      darkMode, setDarkMode,
      keepAwake, setKeepAwake,
      settingsLanguage, setSettingsLanguage,
      scrollBarSide, setScrollBarSide,
      azSliderSide, setAzSliderSide,
      devMode, setDevMode,
      indexMode, setIndexMode,
      themeColor, setThemeColor,
      themeMode, setThemeMode,
      handleThemeChange
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within SettingsProvider");
  return context;
};
