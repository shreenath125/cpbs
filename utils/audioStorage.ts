
import { BhajanAudio } from '../types';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { getRemoteFileSize } from './network';

const CACHE_NAME = 'cpbs-audio-cache-v1';
const STORAGE_KEY = 'cpbs_downloaded_tracks';
const AUDIO_DIR = 'audio_tracks';

const getSafeFileName = (id: string) => `track-${id}.mp3`;

export const getPlayableUrl = (url: string): string => {
  if (!url) return '';
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    let fileId = '';
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) fileId = fileIdMatch[1];
    else {
      const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idParamMatch && idParamMatch[1]) fileId = idParamMatch[1];
    }
    if (fileId) return `https://docs.google.com/uc?export=download&id=${fileId}`;
  }
  return url;
};

export const getDownloadedTrackIds = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const isTrackDownloaded = (audioId: string): boolean => {
  const downloaded = getDownloadedTrackIds();
  return downloaded.includes(audioId);
};

const ensureNativeDir = async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
        await Filesystem.mkdir({
            path: AUDIO_DIR,
            directory: Directory.Data,
            recursive: true
        });
    } catch (e) {
        // Ignore
    }
};

export const saveTrack = async (
    audio: BhajanAudio, 
    title: string, 
    onProgress?: (percent: number, loaded: number, total: number) => void, 
    signal?: AbortSignal,
    knownTotalBytes?: number // New parameter
): Promise<boolean> => {
  try {
    const directUrl = getPlayableUrl(audio.url);
    
    // Initialize progress immediately with known size
    if (onProgress && knownTotalBytes) onProgress(0, 0, knownTotalBytes);

    // NATIVE DOWNLOAD STRATEGY
    if (Capacitor.isNativePlatform()) {
        await ensureNativeDir();
        const fileName = `${AUDIO_DIR}/${getSafeFileName(audio.id)}`;
        
        let totalBytes = knownTotalBytes || 0;
        if (totalBytes === 0) {
            totalBytes = await getRemoteFileSize(directUrl);
        }
        if (totalBytes === 0) totalBytes = 5000000; // 5MB Fallback
        
        if (onProgress) onProgress(1, 0, totalBytes);

        // Simulation Interval
        let simulatedLoaded = 0;
        const timer = setInterval(() => {
             if (simulatedLoaded < totalBytes * 0.95) {
                 simulatedLoaded += totalBytes * 0.05;
                 const pct = (simulatedLoaded / totalBytes) * 100;
                 if (onProgress) onProgress(pct, Math.floor(simulatedLoaded), totalBytes);
             }
        }, 500);

        try {
            const result = await Filesystem.downloadFile({
                path: fileName,
                directory: Directory.Data,
                url: directUrl,
                recursive: true
            });
            
            clearInterval(timer);
            if (!result.path) throw new Error("Path empty");
            if (onProgress) onProgress(100, totalBytes, totalBytes);
        } catch (e) {
            clearInterval(timer);
            console.error("Native audio download failed", e);
            return false;
        }
    } else {
        // WEB DOWNLOAD STRATEGY (Streaming)
        let finalBlob: Blob | null = null;
        const strategies = [
            directUrl, 
            `https://corsproxy.io/?${encodeURIComponent(directUrl)}`,
            `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(directUrl)}`
        ];

        for (const url of strategies) {
            if (signal?.aborted) throw new Error('Aborted');
            try {
                const res = await fetch(url, { signal });
                if (res.ok) {
                    const contentLength = res.headers.get('content-length');
                    const total = contentLength ? parseInt(contentLength, 10) : (knownTotalBytes || 0);

                    if (!res.body) {
                        finalBlob = await res.blob();
                    } else {
                        const reader = res.body.getReader();
                        const chunks = [];
                        let received = 0;
                        while(true) {
                            const {done, value} = await reader.read();
                            if(done) break;
                            chunks.push(value);
                            received += value.length;
                            if (onProgress) {
                                const percent = total ? (received / total) * 100 : 0;
                                onProgress(percent, received, total);
                            }
                        }
                        finalBlob = new Blob(chunks);
                    }
                    break;
                }
            } catch (e: any) {
                if (e.name === 'AbortError') throw e;
            }
        }

        if (!finalBlob) return false;
        if (onProgress) onProgress(100, finalBlob.size, finalBlob.size);

        // Save to Cache Storage
        const cache = await caches.open(CACHE_NAME);
        await cache.put(audio.url, new Response(finalBlob));
    }

    const current = getDownloadedTrackIds();
    if (!current.includes(audio.id)) {
      const updated = [...current, audio.id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    }
    
    return true;
  } catch (error: any) {
    if (error.name !== 'AbortError') console.error('Download failed:', error);
    return false;
  }
};

export const getCachedAudioUrl = async (urlOrId: string): Promise<string | null> => {
  try {
    if (!Capacitor.isNativePlatform()) {
        const cache = await caches.open(CACHE_NAME);
        const response = await cache.match(urlOrId);
        if (response) {
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        }
    }
    return null;
  } catch {
    return null;
  }
};

export const getNativeAudioSrc = async (trackId: string): Promise<string | null> => {
    if (!Capacitor.isNativePlatform()) return null;
    try {
        const fileName = `${AUDIO_DIR}/${getSafeFileName(trackId)}`;
        const uriResult = await Filesystem.getUri({
            path: fileName,
            directory: Directory.Data
        });
        return Capacitor.convertFileSrc(uriResult.uri);
    } catch (e) {
        return null;
    }
};

export const deleteTrack = async (audioId: string, url: string): Promise<void> => {
  try {
    if (Capacitor.isNativePlatform()) {
        try {
            await Filesystem.deleteFile({
                path: `${AUDIO_DIR}/${getSafeFileName(audioId)}`,
                directory: Directory.Data
            });
        } catch(e) {}
    } else {
        try {
            const cache = await caches.open(CACHE_NAME);
            await cache.delete(url);
        } catch (e) {}
    }
    
    const current = getDownloadedTrackIds();
    const updated = current.filter(id => id !== audioId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error('Delete process failed:', error);
  }
};
