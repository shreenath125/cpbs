import React, { useEffect, useRef, useState } from 'react';
import { injectPdfEngine } from '../services/pdfLoader';

interface PdfViewerProps {
  pdfBlob: Blob;
  onClose: () => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfBlob, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);

  useEffect(() => {
    const loadLibraryAndPdf = async () => {
      try {
        setLoading(true);
        // Inject the library from offline storage
        await injectPdfEngine();

        const pdfjs = (window as any).pdfjsLib;
        if (!pdfjs) throw new Error("PDF Library failed to load into window scope.");

        const pdfUrl = URL.createObjectURL(pdfBlob);
        const loadingTask = pdfjs.getDocument(pdfUrl);
        
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load PDF");
        setLoading(false);
      }
    };

    loadLibraryAndPdf();
    
    // Cleanup
    return () => {
        // Revoke URLs if tracked, but here simpler to let GC handle blobs
    };
  }, [pdfBlob]);

  useEffect(() => {
    if (!pdfDoc) return;
    renderPage(pageNum);
  }, [pdfDoc, pageNum, scale]);

  const renderPage = async (num: number) => {
    if (!pdfDoc || !canvasRef.current) return;
    
    try {
        const page = await pdfDoc.getPage(num);
        
        // Calculate scale to fit width if needed, or use current zoom
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if(!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport,
        };
        
        await page.render(renderContext).promise;
    } catch (e) {
        console.error("Render error", e);
    }
  };

  const changePage = (offset: number) => {
    setPageNum(prev => Math.min(Math.max(1, prev + offset), numPages));
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col h-screen">
      {/* Toolbar */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between shadow-md">
        <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        <div className="flex items-center space-x-4">
            <button 
                disabled={pageNum <= 1} 
                onClick={() => changePage(-1)}
                className="disabled:opacity-30 p-1 hover:bg-gray-700 rounded"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <span className="font-mono">{pageNum} / {numPages}</span>
            <button 
                disabled={pageNum >= numPages} 
                onClick={() => changePage(1)}
                className="disabled:opacity-30 p-1 hover:bg-gray-700 rounded"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
        <div className="flex items-center space-x-2">
            <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="p-1 hover:bg-gray-700 rounded">-</button>
            <span className="text-xs">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => Math.min(3.0, s + 0.2))} className="p-1 hover:bg-gray-700 rounded">+</button>
        </div>
      </div>

      {/* Viewer Area */}
      <div className="flex-1 overflow-auto bg-gray-500 p-4 flex justify-center" ref={containerRef}>
        {loading && <div className="text-white mt-20">Loading PDF...</div>}
        {error && <div className="text-red-300 mt-20">{error}</div>}
        
        <canvas ref={canvasRef} className={`shadow-2xl ${loading ? 'hidden' : 'block'}`} />
      </div>
    </div>
  );
};

export default PdfViewer;
