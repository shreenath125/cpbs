
import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { BhajanAudio, Bhajan, RepeatMode } from '../types';
import { getPlayableUrl, isTrackDownloaded, getCachedAudioUrl, getNativeAudioSrc } from '../utils/audioStorage';
import { Capacitor } from '@capacitor/core';
import { MediaSession } from '@capgo/capacitor-media-session';

interface AudioContextType {
  currentTrack: BhajanAudio | null;
  currentBhajan: Bhajan | null;
  isPlaying: boolean;
  isLoading: boolean;
  progress: number;
  duration: number;
  // Queue & Repeat state
  repeatMode: RepeatMode;
  toggleRepeat: () => void;
  playTrack: (track: BhajanAudio, title: string, parentBhajan?: Bhajan, imageUrl?: string, contextQueue?: BhajanAudio[], queueTitle?: string) => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  closePlayer: () => void;
  trackTitle: string;
  trackImage: string;
  queue: BhajanAudio[]; 
  queueTitle: string; 
  updateQueueItem: (newTrack: BhajanAudio) => void;
  addToQueue: (newTrack: BhajanAudio) => void;
  removeFromQueue: (trackId: string) => void; 
  clearQueue: () => void; 
  playQueueTrack: (index: number) => void; 
  
  // UI State
  isQueueOpen: boolean;
  setQueueOpen: (open: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<BhajanAudio | null>(null);
  const [currentBhajan, setCurrentBhajan] = useState<Bhajan | null>(null);
  const [trackTitle, setTrackTitle] = useState('');
  const [trackImage, setTrackImage] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Queue UI State
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(() => {
    try {
      const saved = localStorage.getItem('cpbs_repeat_mode');
      if (saved === 'off' || saved === 'one' || saved === 'all') return saved;
      return 'one';
    } catch {
      return 'one';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cpbs_repeat_mode', repeatMode);
    } catch (e) {
      console.warn('Failed to save repeat mode', e);
    }
  }, [repeatMode]);

  const [queue, setQueue] = useState<BhajanAudio[]>([]);
  const [queueTitle, setQueueTitle] = useState<string>('Song List');
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentTrackIdRef = useRef<string | null>(null);

  // Manage Background Mode based on playback state
  useEffect(() => {
      const bgMode = (window as any).cordova?.plugins?.backgroundMode;
      if (bgMode) {
          if (isPlaying) {
              if (!bgMode.isActive()) bgMode.enable();

              // --- UPDATE NOTIFICATION TEXT ---
              bgMode.configure({
                  title: trackTitle || 'CPBS Bhajans',
                  text: currentTrack?.singer || 'Playing...',
                  silent: false,
                  hidden: false,
                  color: 'F97316' // Saffron color for status bar
              });

          } else {
              if (bgMode.isActive()) {
                  bgMode.configure({
                      title: trackTitle || 'CPBS Bhajans',
                      text: 'Paused',
                      silent: false,
                      hidden: false,
                      color: 'F97316'
                  });
              }
          }
      }
  }, [isPlaying, trackTitle, currentTrack]);

  const closePlayer = useCallback(() => {
    currentTrackIdRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src'); 
      audioRef.current.load(); 
    }
    setCurrentTrack(null);
    setCurrentBhajan(null);
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
    setQueue([]);
    setQueueTitle('Song List');
    
    // Explicitly disable background mode on close
    const bgMode = (window as any).cordova?.plugins?.backgroundMode;
    if (bgMode && bgMode.isActive()) {
        bgMode.disable();
    }
    
    if (Capacitor.isNativePlatform()) {
        MediaSession.setPlaybackState({ playbackState: 'none' }).catch(() => {});
    }
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
    }
  }, []);

  const handlePlay = useCallback(() => {
      audioRef.current?.play().catch(e => {
          if (e.name !== 'AbortError') console.error("Play failed", e);
      });
  }, []);
  
  const handlePause = useCallback(() => audioRef.current?.pause(), []);
  const handleStop = useCallback(() => closePlayer(), [closePlayer]);
  const handleSeek = useCallback((details: any) => {
      if (details?.seekTime != null && audioRef.current) {
        audioRef.current.currentTime = details.seekTime;
      }
  }, []);

  const updateQueueItem = (newTrack: BhajanAudio) => {
      setQueue(prevQueue => {
          const currentIndex = prevQueue.findIndex(t => t.id === currentTrack?.id);
          if (currentIndex === -1) return prevQueue;

          const updatedQueue = [...prevQueue];
          const oldTrack = updatedQueue[currentIndex];
          updatedQueue[currentIndex] = {
              ...newTrack,
              bhajanTitle: oldTrack.bhajanTitle,
              parentBhajan: oldTrack.parentBhajan
          };
          return updatedQueue;
      });
  };

  const addToQueue = (newTrack: BhajanAudio) => {
      setQueue(prev => [...prev, newTrack]);
  };

  const removeFromQueue = (trackId: string) => {
      setQueue(prev => prev.filter(t => t.id !== trackId));
  };

  const clearQueue = () => {
      setQueue([]);
  };

  const playQueueTrack = (index: number) => {
      if (index >= 0 && index < queue.length) {
          const track = queue[index];
          const title = track.bhajanTitle || trackTitle;
          const parent = track.parentBhajan || currentBhajan || undefined;
          playTrack(track, title, parent, trackImage, queue, queueTitle);
      }
  };

  const playTrack = async (track: BhajanAudio, title: string, parentBhajan?: Bhajan, imageUrl: string = '/icon.png', contextQueue?: BhajanAudio[], contextTitle?: string) => {
    const isSameTrack = currentTrackIdRef.current === track.id;
    
    // Ensure the track object stored in state has the title metadata
    // This is crucial for QueueManager to display the title correctly instead of "Unknown Title"
    const enhancedTrack = {
        ...track,
        bhajanTitle: title || track.bhajanTitle || parentBhajan?.title,
        parentBhajan: parentBhajan || track.parentBhajan
    };

    setCurrentTrack(enhancedTrack);
    currentTrackIdRef.current = track.id;
    setTrackTitle(title);
    setTrackImage(imageUrl);
    if (parentBhajan) setCurrentBhajan(parentBhajan);
    
    if (contextQueue) {
        // Safe mapping to ensure every item in the queue has a title
        // If an item lacks a title, fall back to the context title (e.g. Playlist Name or Lecture Title)
        const safeQueue = contextQueue.map(t => ({
            ...t,
            bhajanTitle: t.bhajanTitle || (t.id === track.id ? title : undefined) || t.parentBhajan?.title || contextTitle || 'Unknown Title',
            parentBhajan: t.parentBhajan || (t.id === track.id ? parentBhajan : undefined)
        }));
        
        setQueue(safeQueue);
        setQueueTitle(contextTitle || 'Playlist');
    } else {
        if (!contextQueue && queue.length === 0) {
             setQueue([enhancedTrack]);
             setQueueTitle(contextTitle || 'Song List');
        }
    }

    if (isSameTrack) {
        if (audioRef.current && audioRef.current.paused) {
            audioRef.current.play().catch(console.error);
            setIsPlaying(true);
        }
        return;
    }

    setIsLoading(true);
    setIsPlaying(false); 

    try {
      let src = '';
      const isDownloaded = isTrackDownloaded(track.id);

      if (Capacitor.isNativePlatform()) {
          // Native Path Handling
          if (isDownloaded) {
              const nativeSrc = await getNativeAudioSrc(track.id);
              src = nativeSrc || getPlayableUrl(track.url);
          } else {
              src = getPlayableUrl(track.url);
          }
      } else {
          // Web Cache Handling
          if (isDownloaded) {
              const cached = await getCachedAudioUrl(track.url);
              src = cached || getPlayableUrl(track.url);
          } else {
              src = getPlayableUrl(track.url);
          }
      }

      if (currentTrackIdRef.current !== track.id) {
          return;
      }

      if (audioRef.current) {
        audioRef.current.src = src;
        audioRef.current.load();
        
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    if (currentTrackIdRef.current === track.id) {
                        setIsPlaying(true);
                    }
                })
                .catch(e => {
                    if (e.name === 'AbortError' || e.message?.includes('interrupted')) {
                        // safe to ignore
                    } else {
                        console.error("Playback failed", e);
                        // Do not clear current track here, just stop spinning
                        if (currentTrackIdRef.current === track.id) setIsLoading(false);
                    }
                });
        }
      }
    } catch (e) {
      console.error("Error setting up track", e);
      if (currentTrackIdRef.current === track.id) setIsLoading(false);
    } finally {
      if (currentTrackIdRef.current === track.id) {
          setIsLoading(false);
      }
    }
  };

  const playNext = useCallback(() => {
      if (queue.length === 0) return;
      const currentIndex = queue.findIndex(t => t.id === currentTrackIdRef.current);
      if (currentIndex === -1) return;

      const nextIndex = (currentIndex + 1) % queue.length;
      const nextTrack = queue[nextIndex];
      
      const nextTitle = nextTrack.bhajanTitle || trackTitle;
      const nextParent = nextTrack.parentBhajan || currentBhajan || undefined;
      
      playTrack(nextTrack, nextTitle, nextParent, trackImage, queue, queueTitle);
  }, [queue, trackTitle, currentBhajan, trackImage, queueTitle]);

  const playPrevious = useCallback(() => {
      if (queue.length === 0) return;
      const currentIndex = queue.findIndex(t => t.id === currentTrackIdRef.current);
      if (currentIndex === -1) return;

      let prevIndex = currentIndex - 1;
      if (prevIndex < 0) prevIndex = queue.length - 1;
      const prevTrack = queue[prevIndex];
      
      const prevTitle = prevTrack.bhajanTitle || trackTitle;
      const prevParent = prevTrack.parentBhajan || currentBhajan || undefined;
      
      playTrack(prevTrack, prevTitle, prevParent, trackImage, queue, queueTitle);
  }, [queue, trackTitle, currentBhajan, trackImage, queueTitle]);

  useEffect(() => {
      if (Capacitor.isNativePlatform()) {
          MediaSession.setActionHandler({ action: 'play' }, handlePlay);
          MediaSession.setActionHandler({ action: 'pause' }, handlePause);
          MediaSession.setActionHandler({ action: 'stop' }, handleStop);
          MediaSession.setActionHandler({ action: 'seekto' }, handleSeek);
          MediaSession.setActionHandler({ action: 'nexttrack' }, playNext);
          MediaSession.setActionHandler({ action: 'previoustrack' }, playPrevious);
      }
      
      if ('mediaSession' in navigator) {
          navigator.mediaSession.setActionHandler('play', handlePlay);
          navigator.mediaSession.setActionHandler('pause', handlePause);
          navigator.mediaSession.setActionHandler('stop', handleStop);
          navigator.mediaSession.setActionHandler('seekto', (details) => handleSeek(details));
          navigator.mediaSession.setActionHandler('nexttrack', playNext);
          navigator.mediaSession.setActionHandler('previoustrack', playPrevious);
      }
  }, [handlePlay, handlePause, handleStop, handleSeek, playNext, playPrevious]);

  const updateMediaSession = useCallback(async () => {
    if (!currentTrack) return;

    // Use absolute URL for artwork to ensure native compatibility
    const artworkSrc = trackImage.startsWith('http') 
        ? trackImage 
        : window.location.origin + (trackImage.startsWith('/') ? trackImage : '/' + trackImage);

    if (Capacitor.isNativePlatform()) {
      try {
        await MediaSession.setMetadata({
          title: trackTitle || 'Bhajan',
          artist: currentTrack.singer || 'CPBS',
          album: queueTitle || 'Chaitanya Prem Bhakti Sangh',
          artwork: [
            { src: artworkSrc, sizes: '512x512', type: 'image/png' }
          ]
        });
        
        await MediaSession.setPlaybackState({
            playbackState: isPlaying ? 'playing' : 'paused'
        });
      } catch (e) {
        console.warn("Native MediaSession error:", e);
      }
    } 
    
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: trackTitle || 'Bhajan',
        artist: currentTrack.singer || 'CPBS',
        album: queueTitle || 'Chaitanya Prem Bhakti Sangh',
        artwork: [
          { src: artworkSrc, sizes: '512x512', type: 'image/png' }
        ]
      });
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [currentTrack, trackTitle, trackImage, isPlaying, queueTitle]);

  const toggleRepeat = () => {
      setRepeatMode(prev => {
          if (prev === 'off') return 'one';
          if (prev === 'one') return 'all';
          return 'off';
      });
  };

  useEffect(() => {
    updateMediaSession();
  }, [updateMediaSession]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const p = audioRef.current.play();
        if (p !== undefined) {
            p.catch(e => {
                if (e.name !== 'AbortError') console.error("Toggle play failed", e);
            });
        }
      }
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const onPlay = () => {
      if (currentTrackIdRef.current) {
          setIsPlaying(true);
      }
      if (Capacitor.isNativePlatform()) {
          MediaSession.setPlaybackState({ playbackState: 'playing' }).catch(() => {});
      }
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
  };

  const onPause = () => {
      setIsPlaying(false);
      if (Capacitor.isNativePlatform()) {
          MediaSession.setPlaybackState({ playbackState: 'paused' }).catch(() => {});
      }
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
  };

  const onEnded = () => {
      if (repeatMode === 'one') {
          if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(console.error);
          }
      } else if (repeatMode === 'all') {
          playNext();
      } else {
          if (queue.length > 0) {
              const currentIndex = queue.findIndex(t => t.id === currentTrackIdRef.current);
              if (currentIndex !== -1 && currentIndex < queue.length - 1) {
                  playNext();
              } else {
                  setIsPlaying(false);
              }
          } else {
              setIsPlaying(false);
          }
      }
  };

  const onAudioError = (e: any) => {
      if (!audioRef.current?.src || audioRef.current.src === window.location.href) return;
      console.error("Audio element error occurred", e.nativeEvent || e);
      // Ensure loading state is cleared so UI doesn't look broken
      setIsLoading(false);
      setIsPlaying(false);
  };

  return (
    <AudioContext.Provider value={{
      currentTrack, currentBhajan, isPlaying, isLoading, progress, duration,
      playTrack, togglePlay, seek, closePlayer, trackTitle, trackImage,
      repeatMode, toggleRepeat, updateQueueItem, queueTitle, addToQueue,
      playNext, playPrevious, queue, removeFromQueue, clearQueue, playQueueTrack,
      isQueueOpen, setQueueOpen: setIsQueueOpen
    }}>
      {children}
      <audio
        ref={audioRef}
        onTimeUpdate={onTimeUpdate}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
        onError={onAudioError}
        style={{ display: 'none' }}
      />
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio must be used within AudioProvider");
  return context;
};
