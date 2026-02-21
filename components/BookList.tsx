import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Book, DownloadItem } from '../types';
import { Download, Check, SearchX, BookOpen, Eye, ExternalLink, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import { HighlightText } from './HighlightText';
import { isPdfEngineDownloaded, downloadPdfEngine } from '../services/pdfLoader';

interface BookListProps {
  books: Book[];
  onSelect: (book: Book) => void;
  searchQuery?: string;
  activeDownloads?: Record<string, DownloadItem>;
  onDownload?: (book: Book) => void;
  settingsLanguage?: 'en' | 'hi';
}

// Utility to format bytes
const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const BookList: React.FC<BookListProps> = ({ books, onSelect, searchQuery = '', activeDownloads = {}, onDownload, settingsLanguage = 'en' }) => {
  const [pendingBook, setPendingBook] = useState<Book | null>(null);
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  
  // PDF Engine State
  const [engineReady, setEngineReady] = useState(false);
  const [downloadingEngine, setDownloadingEngine] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [engineMessage, setEngineMessage] = useState('');

  // Translations
  const t = {
    noBooks: settingsLanguage === 'hi' ? "कोई किताब नहीं मिली" : "No books found",
    trySearch: settingsLanguage === 'hi' ? "कोई अन्य शब्द खोजें" : "Try a different search term",
    readerReady: settingsLanguage === 'hi' ? "रीडर तैयार है" : "Reader Ready",
    readerMissing: settingsLanguage === 'hi' ? "रीडर अनुपलब्ध" : "Reader Missing",
    engineCached: settingsLanguage === 'hi' ? "पीडीएफ इंजन ऑफलाइन उपलब्ध है।" : "PDF Engine is cached offline.",
    downloadEngine: settingsLanguage === 'hi' ? "ऑफलाइन पढ़ने के लिए इंजन डाउनलोड करें।" : "Download engine to read offline.",
    loading: settingsLanguage === 'hi' ? "लोड हो रहा है..." : "Loading...",
    downloadLib: settingsLanguage === 'hi' ? "रीडर डाउनलोड करें" : "Download Reader",
    initializing: settingsLanguage === 'hi' ? "शुरू हो रहा है..." : "Initializing...",
    failed: settingsLanguage === 'hi' ? "विफल। इंटरनेट जाँचें।" : "Failed. Check internet.",
    headerTitle: settingsLanguage === 'hi' ? "ग्रंथ और साहित्य" : "Books & Literature",
    headerDesc: settingsLanguage === 'hi' ? "ऑफलाइन पढ़ने के लिए डाउनलोड करें।" : "Download to read offline. Direct Drive/GitHub Links.",
    offline: settingsLanguage === 'hi' ? "ऑफलाइन" : "Offline",
    openBook: settingsLanguage === 'hi' ? "किताब खोलें" : "Open Book",
    downloadRequired: settingsLanguage === 'hi' ? "डाउनलोड आवश्यक" : "Download Required",
    downloadedMsg: settingsLanguage === 'hi' ? "डाउनलोड हो चुकी है, ऑफलाइन पढ़ें।" : "is downloaded and ready to read offline.",
    mustDownload: settingsLanguage === 'hi' ? "इसे पढ़ने के लिए डाउनलोड करना आवश्यक है।" : "You must download this to read it.",
    size: settingsLanguage === 'hi' ? "साइज़:" : "Size:",
    cancel: settingsLanguage === 'hi' ? "रद्द करें" : "Cancel",
    readNow: settingsLanguage === 'hi' ? "अभी पढ़ें" : "Read Now",
    download: settingsLanguage === 'hi' ? "डाउनलोड" : "Download",
    troubleOpening: settingsLanguage === 'hi' ? "किताब नहीं खुल रही?" : "Book Not Opening?",
    downloadIssues: settingsLanguage === 'hi' ? "डाउनलोड में समस्या?" : "Download issues?",
    readTitle: settingsLanguage === 'hi' ? "किताब पढ़ें" : "Read Book",
    downloadTitle: settingsLanguage === 'hi' ? "डाउनलोड करें" : "Download to Read"
  };

  const refreshDownloadedList = () => {
      try {
          const ids = JSON.parse(localStorage.getItem('cpbs_downloaded_books') || '[]');
          setDownloadedIds(ids);
      } catch {}
  };

  useEffect(() => {
    refreshDownloadedList();
    window.addEventListener('storage', refreshDownloadedList); 
    
    // Check Engine Status
    checkPdfEngine();

    return () => window.removeEventListener('storage', refreshDownloadedList);
  }, []);

  // Handle Hardware Back Button for Modal
  useEffect(() => {
    if (pendingBook) {
      const stateId = `book-modal-${Date.now()}`;
      window.history.pushState({ isPopup: true, modalId: stateId }, '');

      const handlePopState = () => {
        setPendingBook(null);
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
        if (window.history.state?.modalId === stateId) {
            window.history.back();
        }
      };
    }
  }, [pendingBook]);

  const checkPdfEngine = async () => {
      const ready = await isPdfEngineDownloaded();
      setEngineReady(ready);
  };

  const handleDownloadEngine = async () => {
      try {
          setDownloadingEngine(true);
          setEngineMessage(t.initializing);
          await downloadPdfEngine((msg) => setEngineMessage(msg));
          setEngineReady(true);
          setEngineMessage('');
      } catch (e) {
          console.error(e);
          setEngineMessage(t.failed);
      } finally {
          setDownloadingEngine(false);
      }
  };

  const handleDownloadClick = async (e: React.MouseEvent | null, book: Book) => {
      e?.stopPropagation();
      
      // Auto-Fetch Strategy: If engine is missing, try to download it along with the book
      if (!engineReady && !downloadingEngine) {
          handleDownloadEngine(); // Fire and forget
      }

      if (onDownload) {
          onDownload(book);
      }
  };

  const handleOpenBook = (book: Book) => {
      setPendingBook(book);
  };
  
  const handleConfirmAction = () => {
      if (!pendingBook) return;
      
      const isDownloaded = downloadedIds.includes(pendingBook.id);
      
      if (isDownloaded) {
          onSelect(pendingBook);
      } else {
          handleDownloadClick(null, pendingBook);
      }
      setPendingBook(null);
  };

  if (books.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 p-8 text-center animate-fade-in-up">
              <SearchX className="w-16 h-16 opacity-30 mb-4 text-[#bc8d31]" />
              <p className="text-lg font-medium">{t.noBooks}</p>
              {searchQuery && <p className="text-sm opacity-70 mt-2">{t.trySearch}</p>}
          </div>
      );
  }

  return (
    <>
      <div className="pb-2 pt-2 px-2">
        {/* Header Card - Updated to Cream and Gold */}
        <div className="mb-4 bg-[#fdfbf7] dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-[#bc8d31]/30 flex justify-between items-start gap-4 relative overflow-hidden">
             {/* Background Texture Overlay */}
             <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-multiply dark:opacity-10 dark:mix-blend-screen" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }}></div>

             <div className="flex-1 min-w-0 relative z-10">
                 <h2 className="text-lg font-bold text-[#bc8d31] font-hindi flex items-center gap-2" style={{ fontFamily: '"Kaushan Script", cursive' }}>
                    <BookOpen className="w-5 h-5" />
                    {t.headerTitle}
                 </h2>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                   {t.headerDesc}
                 </p>
             </div>
             
             {!engineReady && (
                <button 
                    onClick={handleDownloadEngine}
                    disabled={downloadingEngine}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-[#bc8d31] hover:brightness-110 text-white rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 relative z-10"
                >
                    {downloadingEngine ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                    <span>{downloadingEngine ? t.loading : t.downloadLib}</span>
                </button>
             )}
        </div>
          
        <div className="space-y-2">
              {books.map((book, index) => {
                  const isDownloaded = downloadedIds.includes(book.id);
                  const downloadItem = activeDownloads[book.id];
                  const isDownloading = downloadItem !== undefined;
                  const progress = downloadItem?.progress || 0;
                  const delayStyle = { animationDelay: `${index * 40}ms` };
                  
                  return (
                    <div key={book.id} className="animate-fade-in-up opacity-0 fill-mode-forwards" style={delayStyle}>
                        {/* List Item Row */}
                        <div className="w-full flex items-center p-4 rounded-2xl border border-transparent hover:bg-[#bc8d31]/5 dark:hover:bg-slate-800/60 transition-colors gap-3 group relative">
                            
                            {/* Icon Box - Gold styling */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${isDownloaded ? 'bg-[#bc8d31]/20 dark:bg-slate-700 text-[#bc8d31]' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-[#bc8d31] group-hover:bg-[#bc8d31]/10 dark:group-hover:bg-slate-700'}`}>
                                {isDownloading ? (
                                    <Loader2 size={22} className="animate-spin text-[#bc8d31]" />
                                ) : isDownloaded ? (
                                    <Check size={22} />
                                ) : (
                                    <BookOpen size={22} />
                                )}
                            </div>
                            
                            {/* Main Info */}
                            <div className="flex-1 min-w-0" onClick={() => handleOpenBook(book)}>
                                <h3 className="font-hindi font-bold text-slate-700 dark:text-slate-200 text-base leading-snug group-hover:text-[#bc8d31] transition-colors cursor-pointer">
                                    <HighlightText text={book.title} highlight={searchQuery} />
                                </h3>
                                
                                {isDownloading ? (
                                    <div className="mt-1">
                                        <div className="h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-1">
                                            <div 
                                                className="h-full bg-[#bc8d31] transition-all duration-300"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-[#bc8d31] font-mono font-bold flex justify-between">
                                            <span>{Math.round(progress)}%</span>
                                            {downloadItem.total > 0 && (
                                                <span>{formatBytes(downloadItem.loaded)} / {formatBytes(downloadItem.total)}</span>
                                            )}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate flex items-center gap-1 font-medium">
                                        <HighlightText text={book.fileName} highlight={searchQuery} />
                                        {book.displaySize && (
                                            <span className="text-[10px] opacity-70 border-l border-slate-300 dark:border-slate-600 pl-1 ml-1">
                                                {book.displaySize}
                                            </span>
                                        )}
                                        {/* Offline Badge */}
                                        {isDownloaded && <span className="text-[#bc8d31] flex items-center gap-0.5 ml-1 text-[9px] uppercase tracking-wider font-bold">{t.offline}</span>}
                                    </p>
                                )}
                            </div>

                            {/* Actions Area */}
                            <div className="shrink-0 flex items-center gap-2 z-10 pl-2">
                                
                                {isDownloading ? (
                                    // Placeholder
                                    <div className="w-10 h-10 flex items-center justify-center">
                                    </div>
                                ) : isDownloaded ? (
                                    <button 
                                        onClick={() => onSelect(book)}
                                        className="w-10 h-10 flex items-center justify-center bg-[#bc8d31] text-white hover:brightness-110 rounded-full transition-all active:scale-95 shadow-sm"
                                        title={t.readTitle}
                                    >
                                        <Eye size={20} />
                                    </button>
                                ) : (
                                    <button 
                                        onClick={(e) => handleDownloadClick(e, book)}
                                        className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-[#bc8d31] hover:bg-[#bc8d31]/10 dark:hover:bg-slate-600 rounded-full transition-colors active:scale-95"
                                        title={t.downloadTitle}
                                    >
                                        <Download size={20} />
                                    </button>
                                )}

                            </div>
                        </div>
                    </div>
                  );
              })}
        </div>
      </div>

      {/* Action Modal - Cream & Gold Theme */}
      {pendingBook && createPortal(
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-[#fdfbf7] dark:bg-slate-800 w-full max-w-xs rounded-2xl shadow-2xl p-6 transform scale-100 transition-all animate-in zoom-in-95 duration-200 border border-[#bc8d31]/20">
                  <div className="flex flex-col items-center text-center">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 animate-pop bg-[#bc8d31]/10 text-[#bc8d31] border border-[#bc8d31]/30">
                          {downloadedIds.includes(pendingBook.id) ? <BookOpen size={28} /> : <Download size={28} />}
                      </div>
                      
                      <h3 className="text-lg font-bold text-[#bc8d31] dark:text-white mb-2">
                          {downloadedIds.includes(pendingBook.id) ? t.openBook : t.downloadRequired}
                      </h3>
                      
                      <div className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                          {downloadedIds.includes(pendingBook.id) 
                            ? <p><strong>{pendingBook.title}</strong> {t.downloadedMsg}</p>
                            : <p>
                                {t.mustDownload} <br/> <strong>{pendingBook.title}</strong>
                                {pendingBook.displaySize && <span className="block mt-2 font-bold text-xs text-[#bc8d31]">{t.size} {pendingBook.displaySize}</span>}
                              </p>
                          }
                      </div>
                      
                      <div className="flex gap-3 w-full">
                          <button 
                              onClick={() => setPendingBook(null)}
                              className="flex-1 py-2.5 text-slate-600 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors active:scale-95 border border-slate-200 dark:border-slate-600"
                          >
                              {t.cancel}
                          </button>
                          <button 
                              onClick={handleConfirmAction}
                              className="flex-1 py-2.5 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95 bg-[#bc8d31] hover:brightness-110"
                          >
                              {downloadedIds.includes(pendingBook.id) ? t.readNow : t.download}
                          </button>
                      </div>

                      {/* Fallback Option Links */}
                      {pendingBook.url && (
                          <div className="mt-4 pt-4 border-t border-[#bc8d31]/20 w-full">
                              <p className="text-[10px] text-slate-400 mb-2 uppercase tracking-wide font-bold">
                                {downloadedIds.includes(pendingBook.id) ? t.troubleOpening : t.downloadIssues}
                              </p>
                              <div className="flex gap-2">
                                {pendingBook.secondaryUrl && (
                                    <button 
                                        onClick={() => {
                                            window.open(pendingBook.secondaryUrl, '_blank');
                                            setPendingBook(null);
                                        }}
                                        className="flex-1 py-2.5 bg-[#bc8d31]/5 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1 hover:bg-[#bc8d31]/10 transition-colors border border-[#bc8d31]/20"
                                    >
                                        <ExternalLink size={14} /> GitHub
                                    </button>
                                )}
                                <button 
                                    onClick={() => {
                                        window.open(pendingBook.url, '_blank');
                                        setPendingBook(null);
                                    }}
                                    className="flex-1 py-2.5 bg-[#bc8d31]/10 dark:bg-slate-700/50 text-[#bc8d31] dark:text-[#bc8d31] rounded-xl text-xs font-bold flex items-center justify-center gap-1 hover:bg-[#bc8d31]/20 transition-colors border border-[#bc8d31]/20"
                                >
                                    <ExternalLink size={14} /> Drive
                                </button>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>,
          document.body
      )}
    </>
  );
};