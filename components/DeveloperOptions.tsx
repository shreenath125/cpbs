
import React, { useState } from 'react';
import { Database, Plus, Upload, FileJson, Download, AlertTriangle, Settings as SettingsIcon } from 'lucide-react';
import { Bhajan, Book, LectureData, BhajanAudio, EventData } from '../types';
import { RAW_BHAJAN_DATA } from '../data/rawBhajans';
import { BOOKS_DATA } from '../data/books';
import { LECTURES_DATA } from '../data/lectures';
import { parseRawBhajanText } from '../utils/textProcessor';
import { AdminPanel } from './AdminPanel';

interface DeveloperOptionsProps {
  onAddBhajan: () => void;
  onResetData: () => void;
  onImportData: (json: string) => boolean;
  allBhajans: Bhajan[];
  books?: Book[];
  lectures?: LectureData[];
  events?: EventData[];
  onUpdateBhajans?: (data: Bhajan[]) => void;
  onUpdateBooks?: (data: Book[]) => void;
  onUpdateLectures?: (data: LectureData[]) => void;
  onUpdateEvents?: (data: EventData[]) => void;
  settingsLanguage: 'en' | 'hi';
}

export const DeveloperOptions: React.FC<DeveloperOptionsProps> = ({
  onAddBhajan,
  onResetData,
  onImportData,
  allBhajans,
  books,
  lectures,
  events,
  onUpdateBhajans,
  onUpdateBooks,
  onUpdateLectures,
  onUpdateEvents,
  settingsLanguage
}) => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [importText, setImportText] = useState('');

  // Translations internal to this component
  const t = {
    en: {
      devSectionTitle: "Data Management",
      devSectionDesc: "Manage content including Audio Links, Books, and Lectures.",
      openContentManager: "Open Content Manager",
      addBhajan: "Quick Add Bhajan",
      exportChanges: "Export Patch",
      exportFull: "Backup All",
      importData: "Import Data",
      resetFactory: "Factory Reset",
      cancel: "Cancel",
      pasteJson: "Paste JSON Data Here",
    },
    hi: {
      devSectionTitle: "डेटा प्रबंधन",
      devSectionDesc: "ऑडियो लिंक, किताबें और प्रवचन प्रबंधित करें।",
      openContentManager: "कंटेंट मैनेजर खोलें",
      addBhajan: "नया भजन जोड़ें",
      exportChanges: "पैच निर्यात",
      exportFull: "पूर्ण बैकअप",
      importData: "डेटा आयात",
      resetFactory: "फैक्ट्री रीसेट",
      cancel: "रद्द करें",
      pasteJson: "यहाँ JSON डेटा पेस्ट करें",
    }
  }[settingsLanguage];

  const copyToClipboard = (data: string, message: string) => {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(data).then(() => {
              alert(message);
          }).catch((err) => {
              console.error(err);
              alert("Failed to copy. Data logged to console.");
              console.log(data);
          });
      } else {
          alert("Clipboard access not available. Data logged to console.");
          console.log(data);
      }
  };

  const handleExportFull = () => {
      const dataStr = JSON.stringify({
          bhajans: allBhajans,
          books: books,
          lectures: lectures,
          events: events
      }, null, 2);
      copyToClipboard(dataStr, "Full Backup Copied to Clipboard!");
  };

  const handleExportChanges = () => {
    // 1. Get Baseline Data
    const originalBhajans = parseRawBhajanText(RAW_BHAJAN_DATA);
    
    const changes: {
      added: Partial<Bhajan>[];
      modified: Partial<Bhajan>[];
      deleted: string[];
    } = {
      added: [],
      modified: [],
      deleted: []
    };

    const currentMap = new Map(allBhajans.map(b => [b.id, b]));
    const originalMap = new Map(originalBhajans.map(b => [b.id, b]));

    // Detect Deleted
    originalBhajans.forEach(orig => {
        if (!currentMap.has(orig.id)) {
            changes.deleted.push(orig.id);
        }
    });

    // Detect Added & Modified
    allBhajans.forEach(current => {
      if (current.id.startsWith('custom-') || !originalMap.has(current.id)) {
        changes.added.push({
          id: current.id,
          title: current.title,
          content: current.content,
          author: current.author,
          audio: current.audio,
          songNumber: current.songNumber
        });
      } else {
        const original = originalMap.get(current.id);
        if (original) {
          const norm = (s?: string) => s ? s.replace(/\r\n/g, '\n').trim() : '';
          const normAudio = (list?: BhajanAudio[]) => (list || []).map(a => ({ 
              singer: a.singer.trim(), 
              url: a.url.trim() 
          })).sort((a, b) => a.url.localeCompare(b.url));

          const titleChanged = norm(current.title) !== norm(original.title);
          const contentChanged = norm(current.content) !== norm(original.content);
          const authorChanged = norm(current.author) !== norm(original.author);
          const audioChanged = JSON.stringify(normAudio(current.audio)) !== JSON.stringify(normAudio(original.audio));

          if (titleChanged || contentChanged || authorChanged || audioChanged) {
            changes.modified.push({
              id: current.id,
              title: current.title,
              content: current.content,
              author: current.author,
              audio: current.audio
            });
          }
        }
      }
    });

    const exportObj: any = {};
    if (changes.added.length > 0) exportObj.added = changes.added;
    if (changes.modified.length > 0) exportObj.modified = changes.modified;
    if (changes.deleted.length > 0) exportObj.deleted = changes.deleted;
    
    // --- SMART EXPORT FOR BOOKS ---
    const booksToExport: Book[] = [];
    const originalBooksMap = new Map(BOOKS_DATA.map(b => [b.id, b]));
    
    const normBook = (b: Book) => ({
        id: b.id, 
        title: (b.title || '').trim(),
        fileName: (b.fileName || '').trim(),
        url: (b.url || '').trim()
    });

    books?.forEach(book => {
        const original = originalBooksMap.get(book.id);
        if (!original) {
            booksToExport.push(book);
        } else {
            if (JSON.stringify(normBook(book)) !== JSON.stringify(normBook(original))) {
                booksToExport.push(book);
            }
        }
    });

    if (booksToExport.length > 0) {
        exportObj.books = booksToExport;
    }

    // --- SMART EXPORT FOR LECTURES ---
    const lecturesToExport: LectureData[] = [];
    const originalLecturesMap = new Map(LECTURES_DATA.map(l => [l.id, l]));

    const normLecture = (l: LectureData) => ({
        id: l.id,
        title: (l.title || '').trim(),
        description: (l.description || '').trim().replace(/\r\n/g, '\n'),
        date: (l.date || '').trim(),
        audio: (l.audio || []).map(a => ({ 
            singer: a.singer.trim(), 
            url: a.url.trim() 
        })).sort((a,b) => a.url.localeCompare(b.url))
    });

    lectures?.forEach(lecture => {
        const original = originalLecturesMap.get(lecture.id);
        if (!original) {
            lecturesToExport.push(lecture);
        } else {
             if (JSON.stringify(normLecture(lecture)) !== JSON.stringify(normLecture(original))) {
                lecturesToExport.push(lecture);
            }
        }
    });

    if (lecturesToExport.length > 0) {
        exportObj.lectures = lecturesToExport;
    }

    // --- EXPORT EVENTS ---
    // Events are now online-first, so we export whatever is current in state
    if (events && events.length > 0) {
        exportObj.events = events;
    }

    const dataStr = JSON.stringify(exportObj, null, 2);
    
    let totalCount = changes.added.length + changes.modified.length + changes.deleted.length;
    let statusMsg = `Patch Data Copied! (Song Changes: ${totalCount})`;
    if (booksToExport.length > 0) statusMsg += `, Books: ${booksToExport.length}`;
    if (lecturesToExport.length > 0) statusMsg += `, Lectures: ${lecturesToExport.length}`;
    if (events && events.length > 0) statusMsg += `, Events: ${events.length}`;

    copyToClipboard(dataStr, statusMsg);
  };

  const handleImportSubmit = () => {
      if (!importText.trim()) return;
      if (onImportData(importText)) {
          setShowImportModal(false);
          setImportText('');
      }
  };

  const handleOpenManager = () => {
      // Password protection removed
      setShowAdminPanel(true);
  };

  return (
    <>
        <div className="mt-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-saffron-200 dark:border-slate-700 overflow-hidden animate-fade-in-up">
            <div className="bg-saffron-50 dark:bg-slate-800/80 p-3 border-b border-saffron-100 dark:border-slate-700">
                <h3 className="text-xs font-bold text-saffron-700 dark:text-saffron-400 uppercase tracking-wider flex items-center gap-2">
                    <Database size={14} /> {t.devSectionTitle}
                </h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-xs text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">
                {t.devSectionDesc}
            </div>
            
            {/* Main Content Manager Trigger */}
            <button 
                onClick={handleOpenManager}
                className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 transition-colors border-b border-slate-100 dark:border-slate-700"
            >
                <SettingsIcon size={18} /> {t.openContentManager}
            </button>

            <div className="grid grid-cols-1 gap-px bg-slate-100 dark:bg-slate-700">
                <DevActionButton icon={<AlertTriangle size={18} className="text-red-500" />} label={t.resetFactory} onClick={onResetData} />
            </div>
        </div>

        {/* Import Data Modal */}
        {showImportModal && (
            <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-800 w-full max-w-sm p-6 rounded-2xl shadow-xl flex flex-col max-h-[80vh]">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <Upload size={20} className="text-saffron-500" /> {t.importData}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        Paste the JSON data you exported previously. This will merge or replace songs based on the data format.
                    </p>
                    <textarea
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                        className="flex-1 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg font-mono text-xs mb-4 focus:ring-2 focus:ring-saffron-500 focus:outline-none dark:text-white resize-none"
                        placeholder={t.pasteJson}
                    />
                    <div className="flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => { setShowImportModal(false); setImportText(''); }}
                            className="flex-1 py-2.5 text-slate-600 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-700 rounded-xl"
                        >
                            {t.cancel}
                        </button>
                        <button 
                            onClick={handleImportSubmit}
                            disabled={!importText.trim()}
                            className="flex-1 py-2.5 bg-blue-600 disabled:bg-blue-400 text-white rounded-xl font-bold shadow-sm"
                        >
                            {t.importData}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Admin Panel Modal */}
        {showAdminPanel && books && lectures && events && onUpdateBhajans && onUpdateBooks && onUpdateLectures && onUpdateEvents && (
            <AdminPanel 
                isOpen={showAdminPanel} 
                onClose={() => setShowAdminPanel(false)}
                bhajans={allBhajans}
                books={books}
                lectures={lectures}
                events={events}
                onUpdateBhajans={onUpdateBhajans}
                onUpdateBooks={onUpdateBooks}
                onUpdateLectures={onUpdateLectures}
                onUpdateEvents={onUpdateEvents}
            />
        )}
    </>
  );
};

const DevActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center p-3 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors gap-1 text-center"
  >
    {icon}
    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{label}</span>
  </button>
);
