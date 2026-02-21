
import { getFile, saveFile, checkFileExists } from './db';
import { PDF_LIB_URL, PDF_WORKER_URL } from '../constants';
import { Capacitor, CapacitorHttp } from '@capacitor/core';

const LIB_KEY = 'pdfjs_lib_main';
const WORKER_KEY = 'pdfjs_lib_worker';

export const isPdfEngineDownloaded = async (): Promise<boolean> => {
  const main = await checkFileExists(LIB_KEY);
  const worker = await checkFileExists(WORKER_KEY);
  return main && worker;
};

// Helper to robustly fetch text/blob content
const fetchContent = async (url: string): Promise<Blob> => {
    if (Capacitor.isNativePlatform()) {
        // Native: Use CapacitorHttp to bypass CORS
        const response = await CapacitorHttp.get({
            url: url,
            // 'blob' on CapacitorHttp android returns base64 in data
            responseType: 'blob' 
        });
        
        if (response.status !== 200) throw new Error(`Native fetch failed: ${response.status}`);
        
        // Convert Base64 to Blob
        const base64Data = response.data;
        const contentType = response.headers['Content-Type'] || 'text/javascript';
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: contentType });
    } else {
        // Web: Standard fetch
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Web fetch failed: ${res.status}`);
        return await res.blob();
    }
};

export const downloadPdfEngine = async (onProgress?: (msg: string) => void): Promise<void> => {
  try {
    if (onProgress) onProgress('Downloading PDF Engine Core...');
    const libBlob = await fetchContent(PDF_LIB_URL);
    await saveFile(LIB_KEY, libBlob);

    if (onProgress) onProgress('Downloading PDF Worker...');
    const workerBlob = await fetchContent(PDF_WORKER_URL);
    await saveFile(WORKER_KEY, workerBlob);

    if (onProgress) onProgress('Engine downloaded successfully.');
  } catch (error) {
    console.error("Error downloading PDF engine:", error);
    throw error;
  }
};

export const injectPdfEngine = async (): Promise<void> => {
  if ((window as any).pdfjsLib) return; // Already loaded

  const libBlob = await getFile(LIB_KEY);
  const workerBlob = await getFile(WORKER_KEY);

  if (!libBlob || !workerBlob) {
    throw new Error("PDF Engine not found in offline storage.");
  }

  // Create Blob URLs
  const libUrl = URL.createObjectURL(libBlob);
  const workerUrl = URL.createObjectURL(workerBlob);

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = libUrl;
    script.onload = () => {
      // Configure worker
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
      resolve();
    };
    script.onerror = (e) => reject(e);
    document.body.appendChild(script);
  });
};
