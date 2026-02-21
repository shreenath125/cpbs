
import React from 'react';
import { Users } from 'lucide-react';
import { AppTab } from '../types';
import { triggerHaptic } from '../utils/haptic';

interface BottomNavProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  devMode: boolean;
  settingsLanguage: 'en' | 'hi';
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, devMode, settingsLanguage }) => {
  const t = {
    en: {
      home: "Home",
      bhajans: "Bhajans",
      authors: "Authors",
      books: "Books",
      lectures: "Audio",
      library: "Library"
    },
    hi: {
      home: "होम",
      bhajans: "भजन",
      authors: "रचयिता",
      books: "ग्रंथ",
      lectures: "ऑडियो",
      library: "लाइब्रेरी"
    }
  }[settingsLanguage];

  const handleTabClick = (tab: AppTab) => {
    if (activeTab !== tab) {
      triggerHaptic('light');
      onTabChange(tab);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] landscape:top-0 landscape:bottom-0 landscape:right-0 landscape:left-auto landscape:w-20 landscape:h-full landscape:pb-0 landscape:pt-0 landscape:pr-[env(safe-area-inset-right)]">
      <nav className="relative bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 backdrop-blur-xl border-2 border-[#d4af37] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] pointer-events-auto max-w-lg mx-auto landscape:h-full landscape:w-full landscape:flex-col landscape:justify-center landscape:rounded-none landscape:border-l landscape:border-t-0 landscape:border-r-0 landscape:border-b-0 landscape:max-w-none overflow-hidden">
        
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-30 pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }}></div>

        <div className="relative flex items-center justify-around h-16 landscape:h-full landscape:flex-col landscape:gap-4 landscape:py-4">
          <NavButton 
            iconUrl="/Homeicon.png" 
            label={t.home}
            active={activeTab === 'home'} 
            onClick={() => handleTabClick('home')} 
          />
          <NavButton 
            iconUrl="/Bhajan.png" 
            label={t.bhajans}
            active={activeTab === 'songs'} 
            onClick={() => handleTabClick('songs')} 
          />
          {devMode && (
            <NavButton 
              icon={<Users />} 
              label={t.authors} 
              active={activeTab === 'authors'} 
              onClick={() => handleTabClick('authors')} 
            />
          )}
          <NavButton 
            iconUrl="/Audio.png" 
            label={t.lectures}
            active={activeTab === 'lectures'} 
            onClick={() => handleTabClick('lectures')} 
          />
          <NavButton 
            iconUrl="/Books.png" 
            label={t.books}
            active={activeTab === 'books'} 
            onClick={() => handleTabClick('books')} 
          />
          <NavButton 
            iconUrl="/Library.png" 
            label={t.library}
            active={activeTab === 'library'} 
            onClick={() => handleTabClick('library')} 
          />
        </div>
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ icon?: React.ReactElement; iconUrl?: string; label: string; active: boolean; onClick: () => void }> = ({ icon, iconUrl, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center w-full h-full transition-all duration-300 group ${active ? 'text-[#1e3a8a] dark:text-blue-300' : 'text-slate-400 dark:text-slate-500'}`}
  >
    <div className={`p-1.5 rounded-2xl transition-all duration-300 relative ${active ? '-translate-y-1' : 'group-hover:-translate-y-0.5'}`}>
      {iconUrl ? (
          <img 
            src={iconUrl} 
            alt={label} 
            className={`w-6 h-6 transition-all duration-300 ${active ? 'brightness-100 drop-shadow-[0_0_8px_rgba(212,175,55,0.6)] scale-110' : 'brightness-75 grayscale opacity-70'}`} 
          />
      ) : (
          React.cloneElement(icon!, { size: 24, strokeWidth: active ? 2.5 : 2, className: active ? 'drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]' : '' } as any)
      )}
      {/* Active Glow Dot */}
      {active && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#d4af37] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]"></div>
      )}
    </div>
    <span className={`text-[10px] font-bold mt-0.5 tracking-tight transition-all duration-300 ${active ? 'opacity-100 font-extrabold text-[#1e3a8a] dark:text-blue-200' : 'opacity-0 scale-0 h-0 overflow-hidden'}`} style={active ? { fontFamily: '"Kaushan Script", cursive' } : {}}>{label}</span>
  </button>
);
