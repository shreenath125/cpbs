
import { Capacitor, CapacitorHttp } from '@capacitor/core';

const SIZE_CACHE_KEY = 'cpbs_file_sizes';

// In-memory cache to reduce localStorage hits during session
const memoryCache: Record<string, number> = {};

// Helper to get size from cache
const getSizeFromCache = (url: string): number | null => {
    // Check memory first
    if (memoryCache[url]) return memoryCache[url];
    
    // Check persistent storage
    try {
        const cache = JSON.parse(localStorage.getItem(SIZE_CACHE_KEY) || '{}');
        if (cache[url]) {
            memoryCache[url] = cache[url]; // hydrate memory
            return cache[url];
        }
    } catch { }
    return null;
};

// Helper to save size to cache
const saveSizeToCache = (url: string, size: number) => {
    if (size <= 0) return;
    memoryCache[url] = size;
    try {
        const cache = JSON.parse(localStorage.getItem(SIZE_CACHE_KEY) || '{}');
        cache[url] = size;
        localStorage.setItem(SIZE_CACHE_KEY, JSON.stringify(cache));
    } catch {}
};

/**
 * Strategy to fetch size via GitHub API for releases.
 * This is "Smart" because fetching metadata for one file in a release
 * gives us the sizes for ALL files in that release, which we cache.
 */
const fetchGitHubAPI = async (url: string): Promise<number | null> => {
    try {
        // Regex to parse: github.com/{owner}/{repo}/releases/download/{tag}/{filename}
        const regex = /github\.com\/([^/]+)\/([^/]+)\/releases\/download\/([^/]+)\/(.+)$/;
        const match = url.match(regex);
        
        if (!match) return null;
        
        const [_, owner, repo, tag, filename] = match;
        const decodedName = decodeURIComponent(filename);
        
        // Construct API URL for the Tag
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`;
        
        // Fetch metadata (CORS is allowed for public GitHub API)
        const response = await fetch(apiUrl);
        if (!response.ok) return null;
        
        const data = await response.json();
        
        // Smart Caching: Save sizes for ALL assets in this release
        if (data.assets && Array.isArray(data.assets)) {
            data.assets.forEach((asset: any) => {
                if (asset.browser_download_url && asset.size) {
                    saveSizeToCache(asset.browser_download_url, asset.size);
                }
            });
            
            // Return specific target size
            const target = data.assets.find((a: any) => a.name === decodedName);
            return target ? target.size : null;
        }
        return null;
    } catch (e) {
        console.warn("GitHub API check failed", e);
        return null;
    }
};

/**
 * Robustly fetches the file size of a URL.
 * Strategies:
 * 1. Cache Check
 * 2. GitHub API (if applicable) -> Caches entire release
 * 3. Native GET with Range 0-0
 * 4. Web HEAD / Proxy
 */
export const getRemoteFileSize = async (url: string): Promise<number> => {
  try {
    if (!url) return 0;

    // 1. Check Cache
    const cached = getSizeFromCache(url);
    if (cached) return cached;

    // 2. Try GitHub API Strategy
    if (url.includes('github.com') && url.includes('/releases/download/')) {
        const ghSize = await fetchGitHubAPI(url);
        if (ghSize) return ghSize;
    }

    // 3. Helper for parsing headers
    const parseTotal = (headers: any): number => {
        const range = headers['Content-Range'] || headers['content-range'] || headers['Content-range'];
        if (range) {
            const parts = range.split('/');
            if (parts.length > 1) return parseInt(parts[1], 10) || 0;
        }
        const len = headers['Content-Length'] || headers['content-length'] || headers['Content-length'];
        return parseInt(len, 10) || 0;
    };

    let size = 0;

    if (Capacitor.isNativePlatform()) {
        // Native Strategy
        try {
            const response = await CapacitorHttp.request({
                method: 'GET',
                url: url,
                headers: { 'Range': 'bytes=0-0' }
            });
            size = parseTotal(response.headers);
        } catch (e) {
            console.warn("Native size fetch failed", e);
        }
    } else {
        // Web Strategy
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
               const len = response.headers.get('Content-Length');
               if (len) size = parseInt(len, 10);
            }
        } catch (e) {
             // Fallback to Proxy if CORS fails
             try {
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
                const res = await fetch(proxyUrl, { method: 'HEAD' });
                if (res.ok) size = parseInt(res.headers.get('Content-Length') || '0', 10);
             } catch {}
        }
    }

    if (size > 0) saveSizeToCache(url, size);
    return size;

  } catch (e) {
    console.warn("Failed to fetch file size:", e);
    return 0;
  }
};

export const formatBytes = (bytes: number) => {
    if (!bytes || isNaN(bytes) || bytes === 0) return 'Size Unknown';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};
