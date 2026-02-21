
import { DarshanImage } from '../types';

export interface DarshanCategory {
  id: string;
  title: string;
  subtitle?: string;
  type: 'github' | 'legacy';
  tag?: string; // Required for github type
}

export const DARSHAN_CATEGORIES: DarshanCategory[] = [
  // Legacy 'daily' category removed as requested
  { 
    id: 'kota', 
    title: 'Kota', 
    subtitle: 'Shri Krishna Chaitanya Prem Bhakti Dham', 
    type: 'github', 
    tag: 'kota' 
  },
  { 
    id: 'harrai', 
    title: 'Harrai', 
    subtitle: 'Shri Gaur Radha Gopinath Mandir', 
    type: 'github', 
    tag: 'harrai' 
  },
  { 
    id: 'sagar', 
    title: 'Guru Dham Sagar', 
    subtitle: 'Bhuteshwar Path', 
    type: 'github', 
    tag: 'sagar' 
  },
  { 
    id: 'damoh', 
    title: 'Damoh', 
    subtitle: 'Shri Gaur Radha Raman Mandir', 
    type: 'github', 
    tag: 'damoh' 
  },
];

// Base URL for legacy probing
const LEGACY_BASE_URL = "https://github.com/Damodar29/CPBS-DAILY/releases/download/kota/";

/**
 * Fetches images based on category type.
 */
export const fetchDarshanCategory = async (category: DarshanCategory): Promise<DarshanImage[]> => {
    // Strategy 1: GitHub Releases (Dynamic List)
    if (category.type === 'github' && category.tag) {
        try {
            const url = `https://api.github.com/repos/Damodar29/CPBS-DAILY/releases/tags/${category.tag}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                console.warn(`GitHub API Error: ${response.status}`);
                return [];
            }
            
            const data = await response.json();
            
            if (!data.assets || !Array.isArray(data.assets)) return [];
            
            // Map assets to DarshanImage
            return data.assets
                .filter((asset: any) => /\.(jpg|jpeg|png|webp)$/i.test(asset.name))
                .map((asset: any) => ({
                    id: String(asset.id),
                    date: asset.created_at ? asset.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
                    title: asset.name.replace(/\.[^/.]+$/, "").replace(/-/g, " "), // Remove extension and hyphens
                    imageUrl: asset.browser_download_url
                }));

        } catch (error) {
            console.error("Error fetching GitHub release:", error);
            return [];
        }
    } 
    
    // Strategy 2: Legacy Github Probing (Fixed Naming)
    if (category.type === 'legacy') {
        const timestamp = Date.now(); // Cache buster
        const urls: string[] = [];
        
        // Construct potential URLs: i.jpg, i-2.jpg ... i-50.jpg
        urls.push(`${LEGACY_BASE_URL}i.jpg`);
        for (let i = 2; i <= 50; i++) {
            urls.push(`${LEGACY_BASE_URL}i-${i}.jpg`);
        }
        
        // Probe all URLs in parallel
        const promises = urls.map((url, index) => {
            return new Promise<DarshanImage | null>((resolve) => {
                const img = new Image();
                const cacheUrl = `${url}?t=${timestamp}`; // Bust cache
                
                img.onload = () => resolve({
                    id: `legacy-${index}`,
                    date: new Date().toISOString().split('T')[0],
                    title: `Darshan ${index + 1}`,
                    imageUrl: cacheUrl
                });
                
                img.onerror = () => resolve(null); // Failed to load
                
                img.src = cacheUrl;
            });
        });
        
        const results = await Promise.all(promises);
        return results.filter((i): i is DarshanImage => i !== null);
    }
    
    return [];
};
