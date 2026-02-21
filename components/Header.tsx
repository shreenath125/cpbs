import React from 'react';
import { Settings } from 'lucide-react';
import { triggerHaptic } from '../utils/haptic';

interface HeaderProps {
  onOpenMenu: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMenu, onOpenSettings }) => {
  return (
      <header className="fixed top-0 left-0 right-0 z-30 pt-[env(safe-area-inset-top)] h-16 bg-[#fdfbf7] dark:bg-slate-900 shadow-sm border-b-[1.5px] border-[#bc8d31]/30 landscape:h-full landscape:w-20 landscape:pt-0 landscape:pl-[env(safe-area-inset-left)] landscape:flex-col landscape:right-auto landscape:border-r-[1.5px] landscape:border-b-0 transition-all duration-300">
          {/* Background Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-multiply dark:opacity-10 dark:mix-blend-screen" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }}></div>

          <div className="relative w-full h-full flex items-center justify-between px-4 max-w-5xl mx-auto landscape:flex-col landscape:py-6 landscape:px-0">
              {/* Menu Button - Golden */}
              <button 
                  onClick={() => { triggerHaptic('light'); onOpenMenu(); }}
                  className="p-1.5 text-[#bc8d31] hover:bg-[#bc8d31]/10 rounded-xl transition-colors group"
                  aria-label="Open menu"
              >
                  <div className="flex flex-col gap-1.5">
                      <div className="w-6 h-0.5 bg-[#bc8d31] rounded-full shadow-sm group-hover:scale-105 transition-transform"></div>
                      <div className="w-6 h-0.5 bg-[#bc8d31] rounded-full shadow-sm group-hover:scale-105 transition-transform"></div>
                      <div className="w-6 h-0.5 bg-[#bc8d31] rounded-full shadow-sm group-hover:scale-105 transition-transform"></div>
                  </div>
              </button>

              {/* Center Logo - Stacked like the Splash Screen */}
              <div className="flex flex-col items-center justify-center gap-[2px] landscape:hidden mt-1">
                  {/* Tilak SVG */}
                  <div className="h-5 w-auto relative flex items-center justify-center drop-shadow-sm mb-0.5">
                     <svg viewBox="0 0 100 220" className="h-full w-auto">
                        <path d="M30 10v85q0 40 20 40t20-40V10" fill="transparent" stroke="#bc8d31" strokeWidth="12" strokeLinecap="round" />
                        <path d="M50 135 C28 135, 20 165, 50 200 C80 165, 72 135, 50 135 Z" fill="#bc8d31" stroke="#bc8d31" strokeWidth="8" strokeLinecap="round" />
                      </svg>
                  </div>
                  
                  {/* Text */}
                  <div className="flex flex-col items-center justify-center leading-none select-none">
                      <span className="text-[1.1rem] text-[#bc8d31] leading-none tracking-wide" style={{ fontFamily: '"Kaushan Script", cursive' }}>Shree Chaitanya</span>
                      <div className="w-12 h-[1px] bg-[#bc8d31]/60 my-[3px]"></div>
                      <span className="text-[0.5rem] font-sans font-bold tracking-[0.25em] text-[#bc8d31] uppercase">Prem Bhakti Sangh</span>
                  </div>
              </div>

              {/* Landscape Logo (Simplified) */}
              <div className="hidden landscape:flex flex-col items-center gap-1">
                   <span className="text-[#bc8d31] font-bold text-xl font-serif">CPBS</span>
              </div>

              {/* Settings Button - Golden */}
              <button
                  onClick={() => { triggerHaptic('light'); onOpenSettings(); }}
                  className="p-1.5 text-[#bc8d31] hover:bg-[#bc8d31]/10 rounded-full transition-colors group"
                  aria-label="Open settings"
              >
                  <Settings size={24} strokeWidth={2} className="drop-shadow-sm group-hover:rotate-45 transition-transform duration-500" />
              </button>
          </div>
      </header>
  );
};
