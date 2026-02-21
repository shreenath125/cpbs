
import React, { useEffect, useState, useRef } from 'react';
import { BhajanAudio, Bhajan, DownloadItem } from '../types';
import { Play, Pause, Music, Loader2, X, Check, Mic2, ChevronsUpDown, RotateCcw, RotateCw, Download, Repeat, Repeat1 } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { isTrackDownloaded } from '../utils/audioStorage';

interface AudioPlayerProps {
  audioTracks: BhajanAudio[];
  bhajanTitle?: string;
  activeDownloads?: Record<string, DownloadItem>;
  onDownloadTrack?: (track: BhajanAudio, title: string) => void;
  parentBhajan?: Bhajan;
  contextQueue?: BhajanAudio[];
  queueName?: string; // New prop for context name
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
    audioTracks, 
    bhajanTitle = 'Bhajan', 
    activeDownloads = {}, 
    onDownloadTrack, 
    parentBhajan, 
    contextQueue, 
    queueName = 'Song List'
}) => {
  const { currentTrack, isPlaying, isLoading, progress, duration, playTrack, togglePlay, seek, closePlayer, repeatMode, toggleRepeat, updateQueueItem, queueTitle } = useAudio();
  
  // Local UI State
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  
  // Feedback Message State
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const verticalProgressBarRef = useRef<HTMLDivElement>(null);

  // Sync local index if current track in context matches one in our list
  useEffect(() => {
    if (currentTrack && audioTracks) {
        const idx = audioTracks.findIndex(t => t.id === currentTrack.id);
        if (idx !== -1) setCurrentTrackIndex(idx);
    }
  }, [currentTrack, audioTracks]);

  // Priority selection from Context Queue (e.g. Singer Selection)
  useEffect(() => {
      if (contextQueue && contextQueue.length > 0) {
          const preferredId = contextQueue[0].id;
          const idx = audioTracks.findIndex(t => t.id === preferredId);
          if (idx !== -1) {
              setCurrentTrackIndex(idx);
          }
      }
  }, [audioTracks, contextQueue]);

  // Helper to generate the correct queue with metadata
  const getQueueWithMetadata = (targetTrackId: string) => {
      // 1. Check if we are in a Playlist Context (Queue already provided externally)
      if (contextQueue && contextQueue.some(t => t.id === targetTrackId)) {
          return contextQueue;
      }
      
      // 2. Default: We are playing the versions of the current Bhajan from the list.
      // We must inject the title into the queue items so QueueManager can display them correctly.
      return audioTracks.map(track => ({
          ...track,
          bhajanTitle: bhajanTitle, // Inject the prop title
          parentBhajan: parentBhajan
      }));
  };

  const handlePlayClick = () => {
      const selectedTrack = audioTracks[currentTrackIndex];
      
      // If the selected track is the one currently loaded/playing, toggle play/pause.
      if (currentTrack?.id === selectedTrack.id) {
          togglePlay();
          return;
      }

      // Determine correct queue context with metadata
      const finalQueue = getQueueWithMetadata(selectedTrack.id);

      // Always call playTrack to ensure the Context (Playlist Queue) is updated correctly
      playTrack(selectedTrack, bhajanTitle, parentBhajan, '/icon.png', finalQueue, queueName);
  };

  const handleTrackSelect = (index: number) => {
      setCurrentTrackIndex(index);
      setIsPlaylistOpen(false);
      
      const newTrack = audioTracks[index];
      const finalQueue = getQueueWithMetadata(newTrack.id);
      
      // If we are currently in a playlist context
      if (contextQueue) {
          // Update the global queue to remember this singer choice for the future of this loop
          updateQueueItem(newTrack);
      }

      playTrack(newTrack, bhajanTitle, parentBhajan, '/icon.png', finalQueue, queueName);
  };

  const handleRepeatToggle = () => {
      toggleRepeat();
      
      // Determine the NEXT state based on current state (off -> one -> all -> off)
      let nextState = '';
      if (repeatMode === 'off') nextState = 'one';
      else if (repeatMode === 'one') nextState = 'all';
      else nextState = 'off';

      let msg: string | null = "";
      
      if (nextState === 'one') {
          msg = "Looping Current Song";
      } else if (nextState === 'all') {
          msg = "Looping Queue";
      } else {
          msg = "Repeat Turned Off";
      }

      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      
      if (msg) {
          setFeedbackMsg(msg);
          feedbackTimerRef.current = setTimeout(() => setFeedbackMsg(null), 1500);
      } else {
          setFeedbackMsg(null);
      }
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      seek(parseFloat(e.target.value));
  };

  const handleVerticalSeek = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      if (!duration || !isCurrentActive || !verticalProgressBarRef.current) return;
      
      const rect = verticalProgressBarRef.current.getBoundingClientRect();
      let clientY;
      
      if ('touches' in e) {
          clientY = e.touches[0].clientY;
      } else {
          clientY = (e as React.MouseEvent).clientY;
      }

      const height = rect.height;
      const relativeY = clientY - rect.top;
      // 0 at top, 100 at bottom (Standard Top-Down)
      const percentage = Math.max(0, Math.min(1, relativeY / height));
      
      const newTime = percentage * duration;
      seek(newTime);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || !Number.isFinite(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const skipForward = () => seek(Math.min(duration, progress + 10));
  const skipBackward = () => seek(Math.max(0, progress - 10));

  const activeTrack = audioTracks[currentTrackIndex];
  const isCurrentActive = currentTrack?.id === activeTrack.id;
  
  // Download logic
  // activeDownloads is now Record<string, DownloadItem>, we check key existence
  const downloadItem = activeDownloads[activeTrack.id];
  const isDownloading = downloadItem !== undefined;
  const downloadProgress = downloadItem?.progress;
  const isDownloaded = isTrackDownloaded(activeTrack.id);

  const handleDownload = () => {
      if (!onDownloadTrack) return;
      if (!navigator.onLine && !isDownloaded) {
          alert("Turn on internet to download.");
          return;
      }
      onDownloadTrack(activeTrack, bhajanTitle);
  };

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-saffron-200 dark:border-slate-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-[env(safe-area-inset-bottom)] z-50 transition-all duration-300 relative landscape:border-t-0 landscape:h-full landscape:flex landscape:flex-col landscape:justify-between landscape:pb-4">
      
      {/* Progress Bar (Top in Portrait, Hidden in Landscape) */}
      <div className={`relative h-1 w-full bg-slate-200 dark:bg-slate-800 ${isCurrentActive ? 'cursor-pointer group' : 'cursor-default opacity-50'} landscape:hidden`}>
        <div 
          className="absolute top-0 left-0 h-full bg-saffron-500 transition-all duration-100" 
          style={{ width: `${isCurrentActive ? (progress / (duration || 1)) * 100 : 0}%` }}
        />
        {isCurrentActive && (
            <input 
            type="range"
            min="0"
            max={duration || 100}
            value={progress}
            onChange={onSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
        )}
      </div>

      {/* Vertical Progress Bar (Landscape Only) */}
      <div 
        ref={verticalProgressBarRef}
        className={`hidden landscape:block absolute left-0 top-0 bottom-0 w-1.5 bg-slate-200 dark:bg-slate-800 z-10 ${isCurrentActive ? 'cursor-pointer' : 'opacity-50 pointer-events-none'}`}
        onClick={handleVerticalSeek}
        onTouchStart={handleVerticalSeek}
        onTouchMove={handleVerticalSeek}
      >
         <div 
            className="absolute top-0 left-0 w-full bg-saffron-500 transition-all duration-100"
            style={{ height: `${isCurrentActive ? (progress / (duration || 1)) * 100 : 0}%` }}
         />
      </div>

      <div className="p-2 flex items-center justify-between gap-2 landscape:flex-col landscape:h-full landscape:justify-center landscape:gap-6">
        
        {/* Controls */}
        <div className="flex items-center gap-3 relative landscape:flex-col landscape:gap-4">
            {/* Feedback Message Tooltip */}
            {feedbackMsg && (
                <div className="absolute bottom-full left-0 mb-3 w-max px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-2 z-50 pointer-events-none landscape:right-full landscape:left-auto landscape:top-0 landscape:bottom-auto landscape:mr-2">
                    {feedbackMsg}
                    <div className="absolute -bottom-1 left-4 w-2 h-2 bg-slate-800 dark:bg-slate-700 transform rotate-45 landscape:hidden"></div>
                </div>
            )}

            {/* Repeat: Order 4 (Bottom) in Landscape */}
            <button 
                onClick={handleRepeatToggle} 
                className={`transition-colors p-1 rounded-full active:bg-slate-100 dark:active:bg-slate-800 landscape:order-4 ${repeatMode !== 'off' ? 'text-saffron-600 dark:text-saffron-400' : 'text-slate-400 dark:text-slate-600'}`}
            >
                {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
            </button>

            {/* Backward: Order 2 */}
            <button 
                onClick={skipBackward} 
                disabled={!isCurrentActive} 
                className={`text-slate-500 hover:text-saffron-600 dark:text-slate-400 landscape:order-2 ${!isCurrentActive ? 'opacity-30' : ''}`}
            >
                <RotateCcw size={20} />
            </button>

            {/* Play: Order 3 */}
            <button 
                onClick={handlePlayClick}
                className={`w-10 h-10 sm:w-12 sm:h-12 flex-none flex items-center justify-center rounded-full shadow-md transition-all active:scale-95 landscape:order-3 ${
                    !isCurrentActive
                    ? 'bg-saffron-500 text-white' // Play icon state
                    : isLoading 
                        ? 'bg-slate-200 dark:bg-slate-700' 
                        : 'bg-saffron-500 text-white hover:bg-saffron-600'
                }`}
            >
                {isCurrentActive && isLoading ? (
                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-slate-500" />
                ) : (isCurrentActive && isPlaying) ? (
                    <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                ) : (
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-1" />
                )}
            </button>

            {/* Forward: Order 1 (Top) in Landscape */}
            <button 
                onClick={skipForward} 
                disabled={!isCurrentActive} 
                className={`text-slate-500 hover:text-saffron-600 dark:text-slate-400 landscape:order-1 ${!isCurrentActive ? 'opacity-30' : ''}`}
            >
                <RotateCw size={20} />
            </button>
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center px-2 landscape:w-full landscape:px-0 landscape:items-center">
            <div className="flex items-center justify-between mb-1 landscape:flex-col landscape:gap-1">
                <div className="flex items-center gap-2 landscape:hidden">
                    {isDownloaded && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider text-green-600 bg-green-50 dark:bg-green-900/20">
                            Offline
                        </span>
                    )}
                </div>
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                    {isCurrentActive ? `${formatTime(progress)}` : "0:00"}
                </span>
            </div>

            {/* Singer Selector */}
            {audioTracks.length > 1 ? (
                <button 
                onClick={() => setIsPlaylistOpen(true)}
                className="flex items-center justify-between w-full group bg-slate-100 dark:bg-slate-800 hover:bg-saffron-50 dark:hover:bg-slate-700/50 rounded-lg px-2 py-1.5 transition-colors border border-transparent hover:border-saffron-200 dark:hover:border-slate-600 landscape:flex-col landscape:p-1 landscape:gap-1"
                >
                <div className="flex items-center gap-2 min-w-0 flex-1 landscape:justify-center">
                    <Mic2 className="w-3 h-3 text-slate-400 group-hover:text-saffron-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 text-left line-clamp-2 leading-tight landscape:hidden">
                        {activeTrack.singer}
                    </span>
                </div>
                <div className="flex items-center gap-1 pl-2 text-[10px] font-bold text-slate-400 group-hover:text-saffron-600 dark:text-slate-500 shrink-0 landscape:pl-0">
                    <span>{currentTrackIndex + 1}/{audioTracks.length}</span>
                    <ChevronsUpDown className="w-3 h-3 landscape:hidden" />
                </div>
                </button>
            ) : (
                <div className="px-1 py-1 flex items-center gap-2 landscape:justify-center">
                <Mic2 className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 text-left line-clamp-2 leading-tight landscape:hidden">
                    {activeTrack.singer}
                </span>
                </div>
            )}
        </div>

        {/* Download Action */}
        <button 
            onClick={handleDownload} 
            disabled={isDownloaded || isDownloading}
            className={`p-2.5 rounded-full transition-colors ${
                isDownloaded 
                    ? 'text-green-500 bg-green-50 dark:bg-green-900/20' 
                    : isDownloading 
                        ? 'text-saffron-500 bg-saffron-50 dark:bg-slate-800 dark:text-saffron-400'
                        : 'text-slate-400 hover:text-saffron-600 hover:bg-saffron-50 dark:hover:bg-slate-800'
            }`}
        >
            {isDownloading ? (
                <div className="w-5 h-5 flex items-center justify-center">
                    <span className="text-[8px] font-black">{Math.round(downloadProgress || 0)}</span>
                </div>
            ) : isDownloaded ? <Check className="w-5 h-5" /> : <Download className="w-5 h-5" />}
        </button>

      </div>

      {/* Playlist Drawer */}
      {isPlaylistOpen && (
        <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 shadow-2xl rounded-t-2xl border-t border-slate-200 dark:border-slate-700 animate-in slide-in-from-bottom duration-300 z-50 overflow-hidden flex flex-col max-h-[60vh] landscape:right-full landscape:left-auto landscape:top-0 landscape:w-64 landscape:max-h-none landscape:rounded-none landscape:rounded-r-2xl landscape:border-t-0 landscape:border-r">
           <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                 <Music className="w-4 h-4 text-saffron-500" /> Select Version
              </h3>
              <button onClick={() => setIsPlaylistOpen(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full">
                 <X className="w-5 h-5 text-slate-500" />
              </button>
           </div>
           
           <div className="overflow-y-auto p-2 pb-[env(safe-area-inset-bottom)]">
              {audioTracks.map((track, idx) => (
                 <button
                   key={track.id || idx}
                   onClick={() => handleTrackSelect(idx)}
                   className={`w-full text-left p-3 rounded-xl flex items-center justify-between mb-1 transition-colors ${
                     currentTrackIndex === idx 
                       ? 'bg-saffron-50 dark:bg-slate-800 border border-saffron-200 dark:border-slate-700' 
                       : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                   }`}
                 >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          currentTrackIndex === idx ? 'bg-saffron-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                       }`}>
                          {idx + 1}
                       </div>
                       <span className={`text-sm font-bold text-left leading-tight ${currentTrackIndex === idx ? 'text-saffron-700 dark:text-saffron-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {track.singer}
                       </span>
                    </div>
                    {currentTrackIndex === idx && <Check className="w-5 h-5 text-saffron-500 shrink-0 ml-2" />}
                 </button>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};
