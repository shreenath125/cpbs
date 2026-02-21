
import React, { useState, useRef } from 'react';
import { useAudio } from '../context/AudioContext';
import { Play, Pause, X, Music, Repeat, Repeat1 } from 'lucide-react';

export const MiniPlayer: React.FC<{ onExpand: () => void }> = ({ onExpand }) => {
  const { currentTrack, isPlaying, togglePlay, closePlayer, trackTitle, progress, duration, repeatMode, toggleRepeat } = useAudio();
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!currentTrack) return null;

  const progressPercent = duration ? (progress / duration) * 100 : 0;

  const handleRepeatToggle = () => {
      toggleRepeat();
      
      let msg = "";
      if (repeatMode === 'off') msg = "Looping Current Song";
      else if (repeatMode === 'one') msg = "Looping Queue";
      else msg = "Repeat Off";

      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      setFeedbackMsg(msg);
      feedbackTimerRef.current = setTimeout(() => setFeedbackMsg(null), 1500);
  };

  return (
    <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-2 right-2 z-40 animate-slide-in-bottom landscape:bottom-4 landscape:left-20 landscape:right-24">
      <div className="bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700 flex flex-col overflow-visible">
        
        {/* Progress Bar Line */}
        <div className="h-0.5 w-full bg-slate-800 rounded-t-xl overflow-hidden">
            <div 
                className="h-full bg-saffron-500 transition-all duration-300 ease-linear"
                style={{ width: `${progressPercent}%` }}
            />
        </div>

        <div className="flex items-center justify-between p-2 pl-3 relative">
            {/* Feedback Message Tooltip */}
            {feedbackMsg && (
                <div className="absolute bottom-full right-4 mb-2 px-3 py-1.5 bg-saffron-500 text-white text-[10px] font-bold rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-2 z-50 pointer-events-none">
                    {feedbackMsg}
                    <div className="absolute -bottom-1 right-8 w-2 h-2 bg-saffron-500 transform rotate-45"></div>
                </div>
            )}

            {/* Info Section */}
            <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={onExpand}>
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-saffron-500 shrink-0">
                    <Music size={20} className={isPlaying ? 'animate-pulse' : ''} />
                </div>
                <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate leading-tight">
                        {trackTitle || 'Bhajan'}
                    </h4>
                    <p className="text-xs text-slate-400 truncate">
                        {currentTrack.singer}
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1">
                <button 
                    onClick={(e) => { e.stopPropagation(); handleRepeatToggle(); }}
                    className={`p-2.5 rounded-full transition-colors ${repeatMode !== 'off' ? 'text-saffron-400' : 'text-slate-500'}`}
                >
                    {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
                </button>

                <button 
                    onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                    className="p-2.5 text-white hover:bg-white/10 rounded-full transition-colors"
                >
                    {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current" />}
                </button>
                
                <button 
                    onClick={(e) => { e.stopPropagation(); closePlayer(); }}
                    className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
