
import { Book } from '../types';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor, CapacitorHttp } from '@capacitor/core';

const CACHE_NAME = 'cpbs-book-cache-v3';
const STORAGE_KEY = 'cpbs_downloaded_books';
const BOOK_DIR = 'books';

// --- Helpers ---

const ensureNativeDir = async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
        await Filesystem.mkdir({
            path: BOOK_DIR,
            directory: Directory.Data,
            recursive: true
        });
    } catch (e) {
        // Ignore if exists
    }
};

export const getDirectPdfUrl = (url: string): string => {
  if (!url) return '';
  // Convert Drive View links to Download links
  const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) return `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
  const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) return `https://drive.google.com/uc?export=download&id=${idParamMatch[1]}`;
  return url;
};

// Robust File Size Fetcher
const getFileSize = async (url: string): Promise<number> => {
    try {
        if (Capacitor.isNativePlatform()) {
            // Native: Use CapacitorHttp to avoid CORS and get accurate headers
            const response = await CapacitorHttp.request({
                method: 'HEAD',
                url: url
            });
            // Headers can be lowercase or title case
            const len = response.headers['Content-Length'] || response.headers['content-length'];
            return len ? parseInt(len, 10) : 0;
        } else {
            // Web: Standard fetch
            const response = await fetch(url, { method: 'HEAD' });
            const len = response.headers.get('Content-Length');
            return len ? parseInt(len, 10) : 0;
        }
    } catch (e) {
        console.warn('Failed to get file size', e);
        return 0;
    }
};

export const getDownloadedBookIds = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const isBookDownloaded = (bookId: string): boolean => {
  const downloaded = getDownloadedBookIds();
  return downloaded.includes(bookId);
};

export const saveBook = async (
    book: Book, 
    onProgress?: (percent: number, loaded: number, total: number) => void, 
    signal?: AbortSignal
): Promise<boolean> => {
  try {
    // Initial update with pre-filled size to show instant feedback
    if (onProgress) onProgress(0, 0, book.sizeBytes || 0);

    if (Capacitor.isNativePlatform()) {
        // --- NATIVE DOWNLOAD STRATEGY ---
        await ensureNativeDir();
        const fileName = `${BOOK_DIR}/${book.id}.pdf`;
        
        const tryNativeDownload = async (url: string) => {
            const directUrl = getDirectPdfUrl(url);
            
            // 1. Get Size 
            // Priority: Pre-filled size > Network size > Fallback
            let totalBytes = book.sizeBytes || 0;
            
            if (totalBytes === 0) {
               // Only try to fetch if not pre-filled
               totalBytes = await getFileSize(directUrl);
            }
            if (totalBytes === 0) totalBytes = 15000000; // Fallback estimate 15MB
            
            // Initial progress update with total size
            if (onProgress) onProgress(1, 0, totalBytes);

            // 2. Start Simulation Timer (since standard plugin doesn't stream progress bytes easily)
            // We simulate the *percentage* but keep the *total bytes* accurate so UI shows "X MB"
            let simulatedLoaded = 0;
            const timer = setInterval(() => {
                if (simulatedLoaded < totalBytes * 0.9) {
                    simulatedLoaded += totalBytes * 0.05; // 5% increments
                    const percent = (simulatedLoaded / totalBytes) * 100;
                    if (onProgress) onProgress(percent, Math.floor(simulatedLoaded), totalBytes);
                }
            }, 250);

            try {
                // 3. Download
                const result = await Filesystem.downloadFile({
                    path: fileName,
                    directory: Directory.Data,
                    url: directUrl,
                    recursive: true
                });
                
                clearInterval(timer);
                if (onProgress) onProgress(100, totalBytes, totalBytes);
                return !!result.path;
            } catch (e) {
                clearInterval(timer);
                console.warn(`Native download failed for ${url}`, e);
                return false;
            }
        };

        let success = false;
        if (book.url) success = await tryNativeDownload(book.url);
        if (!success && book.secondaryUrl) success = await tryNativeDownload(book.secondaryUrl);

        if (!success) return false;

    } else {
        // --- WEB DOWNLOAD STRATEGY (Streaming) ---
        const strategies = [];
        if (book.url) {
            const u = getDirectPdfUrl(book.url);
            strategies.push(u);
            strategies.push(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`);
        }
        if (book.secondaryUrl) {
            const u2 = getDirectPdfUrl(book.secondaryUrl);
            strategies.push(u2);
        }

        let finalBlob: Blob | null = null;

        for (const url of strategies) {
            if (signal?.aborted) throw new Error('Aborted');
            try {
                const response = await fetch(url, { signal });
                if (!response.ok) continue;

                // Prefer Pre-filled size if header is missing or 0
                let total = book.sizeBytes || 0;
                if (total === 0) {
                    const contentLength = response.headers.get('content-length');
                    total = contentLength ? parseInt(contentLength, 10) : 0;
                }
                
                if (!response.body) {
                    finalBlob = await response.blob(); 
                    if (onProgress && total) onProgress(100, total, total);
                } else {
                    const reader = response.body.getReader();
                    const chunks = [];
                    let received = 0;

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        
                        chunks.push(value);
                        received += value.length;
                        
                        if (onProgress) {
                            // If total is known (either pre-filled or from header), calculate percent
                            const percent = total ? (received / total) * 100 : 0;
                            onProgress(percent, received, total || received); 
                        }
                    }
                    finalBlob = new Blob(chunks);
                }
                
                if (finalBlob) break;
            } catch (e: any) {
                if (e.name === 'AbortError') throw e;
                // Try next strategy
            }
        }

        if (!finalBlob) return false;
        
        // Cache in Cache API
        const cache = await caches.open(CACHE_NAME);
        const cacheKey = `book-${book.id}`;
        await cache.put(cacheKey, new Response(finalBlob, { headers: { 'Content-Type': 'application/pdf' } }));
    }
    
    const current = getDownloadedBookIds();
    if (!current.includes(book.id)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, book.id]));
      window.dispatchEvent(new Event('storage'));
    }
    return true;

  } catch (error) {
    console.error("Save Book Error:", error);
    return false;
  }
};

export const getCachedBookUrl = async (bookId: string): Promise<string | null> => {
  try {
    if (Capacitor.isNativePlatform()) {
        try {
            const fileName = `${BOOK_DIR}/${bookId}.pdf`;
            const uriResult = await Filesystem.getUri({
                path: fileName,
                directory: Directory.Data
            });
            return Capacitor.convertFileSrc(uriResult.uri);
        } catch (e) {
            return null;
        }
    } else {
        const cache = await caches.open(CACHE_NAME);
        const cacheKey = `book-${bookId}`;
        const response = await cache.match(cacheKey);
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

export const deleteBook = async (bookId: string): Promise<void> => {
  try {
    if (Capacitor.isNativePlatform()) {
        try {
            await Filesystem.deleteFile({
                path: `${BOOK_DIR}/${bookId}.pdf`,
                directory: Directory.Data
            });
        } catch (e) {}
    } else {
        try {
            const cache = await caches.open(CACHE_NAME);
            const cacheKey = `book-${bookId}`;
            await cache.delete(cacheKey);
        } catch (e) {}
    }
    
    const current = getDownloadedBookIds();
    const updated = current.filter(id => id !== bookId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error('Delete book failed:', error);
  }
};
