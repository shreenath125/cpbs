
import React, { useState, useMemo, useEffect } from 'react';
import { Bhajan, Book, LectureData, BhajanAudio, EventData } from '../types';
import { X, Plus, Trash2, Edit2, Save, Music, BookOpen, Mic, Search, ChevronRight, PlayCircle, Check, X as XIcon, RotateCcw, FileText, Hash, User, CalendarCheck, MessageCircle, Send } from 'lucide-react';
import { calculateSearchScore, convertToIAST, transliterateForSearch, smartNormalize } from '../utils/textProcessor';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  bhajans: Bhajan[];
  onUpdateBhajans: (data: Bhajan[]) => void;
  books: Book[];
  onUpdateBooks: (data: Book[]) => void;
  lectures: LectureData[];
  onUpdateLectures: (data: LectureData[]) => void;
  events: EventData[];
  onUpdateEvents: (data: EventData[]) => void;
}

type AdminTab = 'bhajans' | 'books' | 'lectures' | 'events';

// Constant for the developer WhatsApp number
const DEV_WHATSAPP = '917974422740';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen, onClose, bhajans, onUpdateBhajans, books, onUpdateBooks, lectures, onUpdateLectures, events, onUpdateEvents
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('bhajans');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selection State for Bhajans (handled separately as it was working)
  const [selectedBhajan, setSelectedBhajan] = useState<Bhajan | null>(null);
  
  if (!isOpen) return null;

  const handleUpdateBhajanList = (newList: Bhajan[]) => {
      onUpdateBhajans(newList);
  };

  const handleUpdateBookList = (newList: Book[]) => {
      onUpdateBooks(newList);
  };

  const handleUpdateLectureList = (newList: LectureData[]) => {
      onUpdateLectures(newList);
  };

  const handleUpdateEventList = (newList: EventData[]) => {
      onUpdateEvents(newList);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-100 dark:bg-slate-900 flex flex-col animate-in slide-in-from-bottom duration-300">
      
      {/* Header */}
      <div className="flex-none bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center justify-between shadow-sm z-10">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
             <Edit2 size={16} />
           </div>
           Content Manager
        </h2>
        <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
          <X size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
      </div>

      {/* Tabs */}
      {!selectedBhajan && (
        <div className="flex bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
            <TabButton active={activeTab === 'bhajans'} onClick={() => setActiveTab('bhajans')} label="Bhajans" icon={<Music size={16} />} />
            <TabButton active={activeTab === 'books'} onClick={() => setActiveTab('books')} label="Books" icon={<BookOpen size={16} />} />
            <TabButton active={activeTab === 'lectures'} onClick={() => setActiveTab('lectures')} label="Lectures" icon={<Mic size={16} />} />
            <TabButton active={activeTab === 'events'} onClick={() => setActiveTab('events')} label="Events" icon={<CalendarCheck size={16} />} />
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
          
          {activeTab === 'bhajans' && (
              <BhajanManager 
                  bhajans={bhajans} 
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedBhajan={selectedBhajan}
                  onSelectBhajan={setSelectedBhajan}
                  onUpdateList={handleUpdateBhajanList}
              />
          )}

          {activeTab === 'books' && (
              <BookManager 
                  books={books}
                  onUpdateList={handleUpdateBookList}
              />
          )}

          {activeTab === 'lectures' && (
              <LectureManager 
                  lectures={lectures}
                  onUpdateList={handleUpdateLectureList}
              />
          )}

          {activeTab === 'events' && (
              <EventManager 
                  events={events}
                  onUpdateList={handleUpdateEventList}
              />
          )}

      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string; icon: React.ReactNode }> = ({ active, onClick, label, icon }) => (
    <button 
        onClick={onClick}
        className={`flex-1 min-w-[80px] py-3 flex items-center justify-center gap-2 text-sm font-bold border-b-2 transition-colors ${active ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
    >
        {icon} {label}
    </button>
);

// --- Reusable Delete Button with Confirmation State (No Haptics, No Alerts) ---
const DeleteWithConfirm = ({ onDelete }: { onDelete: () => void }) => {
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (confirming) {
      const timer = setTimeout(() => setConfirming(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [confirming]);

  if (confirming) {
    return (
      <button 
        onClick={(e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            onDelete(); 
        }} 
        className="p-2 px-3 bg-red-600 text-white rounded-lg text-xs font-bold animate-in fade-in"
      >
        Confirm?
      </button>
    );
  }

  return (
    <button 
      onClick={(e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
          setConfirming(true); 
      }} 
      className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
    >
      <Trash2 size={18} />
    </button>
  );
};

// ==========================================
// 4. EVENT MANAGER
// ==========================================

const EventManager: React.FC<{
    events: EventData[], 
    onUpdateList: (list: EventData[]) => void
}> = ({ events, onUpdateList }) => {
    const [draft, setDraft] = useState<EventData | null>(null);
    const [deletedStack, setDeletedStack] = useState<EventData[]>([]);

    const startEdit = (event?: EventData) => {
        if (event) {
            setDraft({ ...event });
        } else {
            const maxId = events.reduce((max, e) => {
                const num = parseInt(e.id, 10);
                return !isNaN(num) && num > max ? num : max;
            }, 0);
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            setDraft({ 
                id: (maxId + 1).toString(), 
                title: '', 
                description: '',
                date: dateStr,
                day: String(today.getDate()).padStart(2, '0'),
                month: String(today.getMonth() + 1).padStart(2, '0'),
                year: String(today.getFullYear()),
                time: '',
                location: ''
            });
        }
    };

    const saveEvent = () => {
        if (!draft || !draft.title) return;
        const exists = events.find(e => e.id === draft.id);
        const newList = exists 
            ? events.map(e => e.id === draft.id ? draft : e)
            : [draft, ...events];
        onUpdateList(newList);
        setDraft(null);
    };

    const deleteEvent = (id: string) => {
        const eventToDelete = events.find(e => e.id === id);
        if (eventToDelete) {
            setDeletedStack(prev => [...prev, eventToDelete]);
        }
        const newList = events.filter(e => e.id !== id);
        onUpdateList(newList);
        if (draft?.id === id) setDraft(null);
    };

    const restoreLastDeleted = () => {
        if (deletedStack.length === 0) return;
        const last = deletedStack[deletedStack.length - 1];
        setDeletedStack(prev => prev.slice(0, -1));
        onUpdateList([...events, last]);
    };

    // --- EDITOR ---
    if (draft) {
        return (
            <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 p-4 animate-in slide-in-from-right overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => setDraft(null)} className="flex items-center gap-1 text-slate-500 font-bold">
                        <ChevronRight className="rotate-180" /> Back
                    </button>
                    <h3 className="text-lg font-bold">{!events.find(e => e.id === draft.id) ? 'Add Event' : 'Edit Event'}</h3>
                </div>
                
                <div className="space-y-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Title</label>
                        <input className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"
                            value={draft.title} onChange={e => setDraft({...draft, title: e.target.value})} placeholder="Event Title" />
                    </div>
                    
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Date</label>
                        <input 
                            type="date"
                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"
                            value={draft.date} 
                            onChange={e => setDraft({...draft, date: e.target.value})} 
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Time (Optional)</label>
                        <input className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"
                            value={draft.time || ''} onChange={e => setDraft({...draft, time: e.target.value})} placeholder="e.g. 4:30 PM" />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Location (Optional)</label>
                        <input className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"
                            value={draft.location || ''} onChange={e => setDraft({...draft, location: e.target.value})} placeholder="City / Venue" />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Description</label>
                        <textarea className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 h-24"
                            value={draft.description} onChange={e => setDraft({...draft, description: e.target.value})} placeholder="Event Details..." />
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button onClick={saveEvent} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg">
                        <Save size={18} /> Save Event
                    </button>
                </div>
            </div>
        );
    }

    // --- LIST ---
    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-10 flex justify-between items-center">
                <span className="font-bold text-slate-500">{events.length} Events</span>
                <div className="flex gap-2">
                    {deletedStack.length > 0 && (
                        <button onClick={restoreLastDeleted} className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm border border-slate-200 dark:border-slate-600">
                            <RotateCcw size={16} /> Restore
                        </button>
                    )}
                    <button onClick={() => startEdit()} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm">
                        <Plus size={18} /> Add New
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {events.map(event => (
                    <div key={event.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center shadow-sm">
                        <div className="flex-1 min-w-0 pr-4">
                            <h4 className="font-bold text-slate-800 dark:text-white truncate">{event.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                <span>{event.date}</span>
                                {event.location && <><span>•</span><span>{event.location}</span></>}
                            </div>
                        </div>
                        <div className="flex gap-2 shrink-0 items-center">
                            <button onClick={() => startEdit(event)} className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-blue-600 dark:text-blue-400">
                                <Edit2 size={18} />
                            </button>
                            <DeleteWithConfirm onDelete={() => deleteEvent(event.id)} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ==========================================
// 1. RECREATED BOOK MANAGER
// ==========================================

const BookManager: React.FC<{
    books: Book[], 
    onUpdateList: (list: Book[]) => void
}> = ({ books, onUpdateList }) => {
    const [draft, setDraft] = useState<Book | null>(null);

    const startEdit = (book?: Book) => {
        if (book) {
            setDraft({ ...book });
        } else {
            const maxId = books.reduce((max, b) => {
                const num = parseInt(b.id, 10);
                return !isNaN(num) && num > max ? num : max;
            }, 0);
            setDraft({ id: (maxId + 1).toString(), title: '', fileName: '', url: '', secondaryUrl: '' });
        }
    };

    const saveBook = () => {
        if (!draft || !draft.title) return;
        const exists = books.find(b => b.id === draft.id);
        const newList = exists 
            ? books.map(b => b.id === draft.id ? draft : b)
            : [draft, ...books];
        onUpdateList(newList);
        setDraft(null);
    };

    const saveAndSend = () => {
        if (!draft || !draft.title) return;
        
        // 1. Save locally first
        const exists = books.find(b => b.id === draft.id);
        const newList = exists 
            ? books.map(b => b.id === draft.id ? draft : b)
            : [draft, ...books];
        onUpdateList(newList);

        // 2. Generate Message (With Prefix)
        const msg = `Please update this Book:\n([id:"${draft.id}"] [title:"${draft.title}"] [filename:"${draft.fileName}"] [url:"${draft.url || ''}"] [secondaryUrl:"${draft.secondaryUrl || ''}"])`;
        
        // 3. Open WhatsApp
        window.open(`https://wa.me/${DEV_WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
        
        setDraft(null);
    };

    const deleteBook = (id: string) => {
        const newList = books.filter(b => b.id !== id);
        onUpdateList(newList);
        if (draft?.id === id) setDraft(null);
    };

    // --- EDITOR ---
    if (draft) {
        return (
            <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 p-4 animate-in slide-in-from-right">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => setDraft(null)} className="flex items-center gap-1 text-slate-500 font-bold">
                        <ChevronRight className="rotate-180" /> Back
                    </button>
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold mr-2">{!books.find(b => b.id === draft.id) ? 'Add Book' : 'Edit Book'}</h3>
                        <button 
                            onClick={saveAndSend}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm flex items-center gap-2"
                            title="Save Locally & Send to WhatsApp"
                        >
                            <MessageCircle size={14} /> Send Update
                        </button>
                    </div>
                </div>
                
                <div className="space-y-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-y-auto max-h-[80vh]">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Title</label>
                        <input className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"
                            value={draft.title} onChange={e => setDraft({...draft, title: e.target.value})} placeholder="Book Title" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">File Name</label>
                        <input className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"
                            value={draft.fileName} onChange={e => setDraft({...draft, fileName: e.target.value})} placeholder="file.pdf" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Primary URL</label>
                        <input className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-sm"
                            value={draft.url || ''} onChange={e => setDraft({...draft, url: e.target.value})} placeholder="https://..." />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Secondary URL (Backup)</label>
                        <input className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-sm"
                            value={draft.secondaryUrl || ''} onChange={e => setDraft({...draft, secondaryUrl: e.target.value})} placeholder="https://..." />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button onClick={saveBook} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                            <Save size={18} /> Save Locally
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- LIST ---
    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-10 flex justify-between items-center">
                <span className="font-bold text-slate-500">{books.length} Books</span>
                <button onClick={() => startEdit()} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm">
                    <Plus size={18} /> Add New
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {books.map(book => (
                    <div key={book.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center shadow-sm">
                        <div className="flex-1 min-w-0 pr-4">
                            <h4 className="font-bold text-slate-800 dark:text-white truncate">{book.title}</h4>
                            <p className="text-xs text-slate-400 truncate mt-0.5">{book.fileName}</p>
                        </div>
                        <div className="flex gap-2 shrink-0 items-center">
                            <button onClick={() => startEdit(book)} className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-blue-600 dark:text-blue-400">
                                <Edit2 size={18} />
                            </button>
                            <DeleteWithConfirm onDelete={() => deleteBook(book.id)} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ==========================================
// 2. RECREATED LECTURE MANAGER
// ==========================================

const LectureManager: React.FC<{
    lectures: LectureData[], 
    onUpdateList: (list: LectureData[]) => void
}> = ({ lectures, onUpdateList }) => {
    const [draft, setDraft] = useState<LectureData | null>(null);

    const startEdit = (lecture?: LectureData) => {
        if (lecture) {
            setDraft({ ...lecture });
        } else {
            const maxId = lectures.reduce((max, l) => {
                const num = parseInt(l.id.replace('lec-', ''), 10);
                return !isNaN(num) && num > max ? num : max;
            }, 0);
            setDraft({ id: `lec-${maxId + 1}`, title: '', description: '', audio: [] });
        }
    };

    const saveLecture = () => {
        if (!draft || !draft.title) return;
        const exists = lectures.find(l => l.id === draft.id);
        const newList = exists 
            ? lectures.map(l => l.id === draft.id ? draft : l)
            : [draft, ...lectures];
        onUpdateList(newList);
        setDraft(null);
    };

    const saveAndSend = () => {
        if (!draft || !draft.title) return;
        
        // 1. Save Locally
        const exists = lectures.find(l => l.id === draft.id);
        const newList = exists 
            ? lectures.map(l => l.id === draft.id ? draft : l)
            : [draft, ...lectures];
        onUpdateList(newList);

        // 2. Generate JSON & Message (With Prefix)
        const tracksCount = draft.audio?.length || 0;
        const audioJson = JSON.stringify(draft.audio);
        const msg = `Please update this Lecture:\n([id:"${draft.id}"] [title:"${draft.title}"] [date:"${draft.date || ''}"] [tracks:"${tracksCount}"] [audioJson:${audioJson}])`;
        
        // 3. Open WhatsApp
        window.open(`https://wa.me/${DEV_WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
        
        setDraft(null);
    };

    const deleteLecture = (id: string) => {
        const newList = lectures.filter(l => l.id !== id);
        onUpdateList(newList);
        if (draft?.id === id) setDraft(null);
    };

    const addAudioToDraft = () => {
        if (!draft) return;
        setDraft({
            ...draft,
            audio: [...(draft.audio || []), { id: `aud-${Date.now()}`, singer: '', url: '' }]
        });
    };

    const updateAudioInDraft = (idx: number, field: keyof BhajanAudio, val: string) => {
        if (!draft || !draft.audio) return;
        const newAudio = [...draft.audio];
        newAudio[idx] = { ...newAudio[idx], [field]: val };
        setDraft({ ...draft, audio: newAudio });
    };

    const removeAudioFromDraft = (idx: number) => {
        if (!draft || !draft.audio) return;
        const newAudio = draft.audio.filter((_, i) => i !== idx);
        setDraft({ ...draft, audio: newAudio });
    };

    // --- EDITOR ---
    if (draft) {
        return (
            <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 p-4 animate-in slide-in-from-right overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => setDraft(null)} className="flex items-center gap-1 text-slate-500 font-bold">
                        <ChevronRight className="rotate-180" /> Back
                    </button>
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold mr-2">{draft.id.startsWith('lec-') && !lectures.find(l=>l.id===draft.id) ? 'Add Lecture' : 'Edit Lecture'}</h3>
                        <button 
                            onClick={saveAndSend}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm flex items-center gap-2"
                            title="Save Locally & Send to WhatsApp"
                        >
                            <MessageCircle size={14} /> Send Update
                        </button>
                    </div>
                </div>

                <div className="space-y-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Title</label>
                        <input className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"
                            value={draft.title} onChange={e => setDraft({...draft, title: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Date</label>
                        <input className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"
                            value={draft.date || ''} onChange={e => setDraft({...draft, date: e.target.value})} placeholder="YYYY-MM-DD" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Description</label>
                        <textarea className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 h-24"
                            value={draft.description} onChange={e => setDraft({...draft, description: e.target.value})} />
                    </div>
                </div>

                <div className="mb-2 flex justify-between items-end px-1">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Audio Tracks</h4>
                    <button onClick={addAudioToDraft} className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg font-bold">
                        + Add Audio
                    </button>
                </div>
                
                <div className="space-y-3 mb-8">
                    {draft.audio?.map((audio, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 relative">
                            <div className="flex gap-2">
                                <input className="flex-1 p-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                                    placeholder="Speaker Name" value={audio.singer} onChange={e => updateAudioInDraft(idx, 'singer', e.target.value)} />
                                <button onClick={() => removeAudioFromDraft(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <input className="w-full p-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                                placeholder="Audio URL" value={audio.url} onChange={e => updateAudioInDraft(idx, 'url', e.target.value)} />
                        </div>
                    ))}
                </div>

                <button onClick={saveLecture} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 mt-auto">
                    <Save size={18} /> Save Locally
                </button>
            </div>
        );
    }

    // --- LIST ---
    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-10 flex justify-between items-center">
                <span className="font-bold text-slate-500">{lectures.length} Lectures</span>
                <button onClick={() => startEdit()} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm">
                    <Plus size={18} /> Add New
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {lectures.map(lecture => (
                    <div key={lecture.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center shadow-sm">
                        <div className="flex-1 min-w-0 pr-4">
                            <h4 className="font-bold text-slate-800 dark:text-white truncate">{lecture.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                <span>{lecture.date || 'No Date'}</span>
                                <span>•</span>
                                <span>{lecture.audio?.length || 0} Tracks</span>
                            </div>
                        </div>
                        <div className="flex gap-2 shrink-0 items-center">
                            <button onClick={() => startEdit(lecture)} className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-blue-600 dark:text-blue-400">
                                <Edit2 size={18} />
                            </button>
                            <DeleteWithConfirm onDelete={() => deleteLecture(lecture.id)} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ==========================================
// 3. EXISTING BHAJAN MANAGER (Refined)
// ==========================================

const BhajanManager: React.FC<{ 
    bhajans: Bhajan[], searchQuery: string, setSearchQuery: (s: string) => void,
    selectedBhajan: Bhajan | null, onSelectBhajan: (b: Bhajan | null) => void,
    onUpdateList: (list: Bhajan[]) => void
}> = ({ bhajans, searchQuery, setSearchQuery, selectedBhajan, onSelectBhajan, onUpdateList }) => {
    
    const filtered = useMemo(() => {
        if (!searchQuery.trim()) return bhajans;
        return bhajans
            .map(b => ({ bhajan: b, score: calculateSearchScore(b, searchQuery, 'devanagari') }))
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(item => item.bhajan);
    }, [bhajans, searchQuery]);

    const handleSave = (updatedBhajan: Bhajan) => {
        let newList: Bhajan[];
        const exists = bhajans.find(b => b.id === updatedBhajan.id);
        if (exists) {
            newList = bhajans.map(b => b.id === updatedBhajan.id ? updatedBhajan : b);
        } else {
            newList = [...bhajans, updatedBhajan];
        }
        onUpdateList(newList);
        onSelectBhajan(null); 
    };

    const handleDelete = (id: string) => {
        // No haptics, no native confirm
        const newList = bhajans.filter(b => b.id !== id);
        onUpdateList(newList);
        if (selectedBhajan && selectedBhajan.id === id) {
            onSelectBhajan(null);
        }
    };

    const handleAddNew = () => {
        const maxId = bhajans.reduce((max, b) => {
            const match = b.id.match(/(\d+)/);
            const num = match ? parseInt(match[0], 10) : 0;
            return !isNaN(num) && num > max ? num : max;
        }, 0);

        // Start new IDs from 501
        const nextIdNum = Math.max(maxId + 1, 501);

        const newBhajan: Bhajan = {
            id: nextIdNum.toString(),
            songNumber: 'New (Please Add ID)', // Put text here
            title: '', // Empty title so user can type
            titleIAST: '',
            content: '',
            contentIAST: '',
            firstLine: '',
            firstLineIAST: '',
            searchIndex: '',
            searchTokens: [],
            audio: []
        };
        onSelectBhajan(newBhajan);
    };

    if (selectedBhajan) {
        return (
            <BhajanEditor 
                bhajan={selectedBhajan} 
                onSave={handleSave} 
                onDelete={handleDelete}
                onCancel={() => onSelectBhajan(null)} 
            />
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-10 flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input 
                        className="w-full bg-slate-100 dark:bg-slate-900 rounded-lg py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search to edit..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <button 
                    onClick={handleAddNew}
                    className="bg-blue-600 text-white px-3 rounded-lg font-bold flex items-center gap-1 shadow-sm"
                >
                    <Plus size={18} /> Add
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {filtered.map(b => (
                    <button 
                        key={b.id} 
                        type="button"
                        onClick={() => { /* No Haptics */ onSelectBhajan(b); }}
                        className="w-full text-left p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
                    >
                        <div className="truncate flex-1 min-w-0 pr-2">
                            <div className="font-bold text-sm truncate group-hover:text-blue-600 transition-colors">
                                {b.songNumber ? <span className="inline-block w-8 text-xs text-slate-400 font-mono">#{b.songNumber}</span> : null}
                                {b.title}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate pl-0.5">{b.firstLine}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            {b.audio && b.audio.length > 0 && (
                                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">
                                    {b.audio.length} Audio
                                </span>
                            )}
                            <ChevronRight size={18} className="text-slate-400" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- HELPER FOR BHAJAN SAVING ---
const prepareBhajanForSave = (bhajan: Bhajan): Bhajan => {
    const titleIAST = convertToIAST(bhajan.title);
    const contentIAST = convertToIAST(bhajan.content);
    const authorIAST = bhajan.author ? convertToIAST(bhajan.author) : undefined;
    
    const lines = bhajan.content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const firstLine = lines.length > 0 ? lines[0] : bhajan.title;
    const firstLineIAST = convertToIAST(firstLine);
    
    const combinedText = `${bhajan.title} ${bhajan.content} ${bhajan.author || ''}`;
    const transliteratedText = transliterateForSearch(combinedText);
    const normalizedIndex = smartNormalize(transliteratedText);
    
    const searchIndex = `${bhajan.songNumber || ''} ${combinedText.toLowerCase()} ${normalizedIndex}`;
    
    const rawTokens = transliteratedText.toLowerCase().split(/[\s,।॥!?-]+/);
    const searchTokens = rawTokens.filter(t => t.length > 2).map(t => smartNormalize(t));
    const uniqueTokens = Array.from(new Set(searchTokens));

    return {
        ...bhajan,
        titleIAST,
        contentIAST,
        authorIAST,
        firstLine,
        firstLineIAST,
        searchIndex,
        searchTokens
    };
};

const AudioEditItem: React.FC<{ 
    audio: BhajanAudio, 
    onUpdate: (a: BhajanAudio) => void, 
    onRemove: (id: string) => void 
}> = ({ audio, onUpdate, onRemove }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [singer, setSinger] = useState(audio.singer);
    const [url, setUrl] = useState(audio.url);

    if (isEditing) {
        return (
            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-blue-500 shadow-sm space-y-2 mb-2">
                <input 
                    className="w-full p-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded outline-none"
                    placeholder="Singer Name"
                    value={singer}
                    onChange={e => setSinger(e.target.value)}
                />
                <input 
                    className="w-full p-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded outline-none"
                    placeholder="Audio URL"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                />
                <div className="flex justify-end gap-2 pt-1">
                    <button onClick={() => setIsEditing(false)} className="p-1.5 text-slate-500"><XIcon size={16} /></button>
                    <button 
                        onClick={() => { onUpdate({ ...audio, singer, url }); setIsEditing(false); }}
                        className="p-1.5 bg-blue-600 text-white rounded"
                    >
                        <Check size={16} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-center mb-2">
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                    <PlayCircle size={16} />
                </div>
                <div className="truncate min-w-0">
                    <div className="font-bold text-sm truncate">{audio.singer}</div>
                    <div className="text-[10px] text-slate-400 truncate">{audio.url}</div>
                </div>
            </div>
            <div className="flex gap-1 shrink-0 items-center">
                <button onClick={() => setIsEditing(true)} className="p-2 text-blue-500 bg-slate-50 dark:bg-slate-700/50 rounded-full"><Edit2 size={14} /></button>
                <button onClick={() => onRemove(audio.id)} className="p-2 text-red-500 bg-slate-50 dark:bg-slate-700/50 rounded-full"><Trash2 size={14} /></button>
            </div>
        </div>
    );
};

// --- Bhajan Editor Component ---
const BhajanEditor: React.FC<{
    bhajan: Bhajan;
    onSave: (b: Bhajan) => void;
    onDelete: (id: string) => void;
    onCancel: () => void;
}> = ({ bhajan, onSave, onDelete, onCancel }) => {
    // Local Draft State
    const [draft, setDraft] = useState<Bhajan>(bhajan);
    const [editTab, setEditTab] = useState<'text' | 'audio'>('text');
    const [newAudioUrl, setNewAudioUrl] = useState('');
    const [newAudioSinger, setNewAudioSinger] = useState('');

    // Handlers for Text
    const updateField = (field: keyof Bhajan, value: string) => {
        setDraft(prev => ({ ...prev, [field]: value }));
    };

    // Handlers for Audio
    const handleAddAudio = () => {
        if (!newAudioUrl || !newAudioSinger) return;
        const newTrack: BhajanAudio = { id: `audio-${Date.now()}`, singer: newAudioSinger, url: newAudioUrl };
        setDraft(prev => ({ ...prev, audio: [...(prev.audio || []), newTrack] }));
        setNewAudioUrl('');
        setNewAudioSinger('');
    };

    const handleUpdateAudioTrack = (updatedTrack: BhajanAudio) => {
        setDraft(prev => ({
            ...prev,
            audio: prev.audio?.map(a => a.id === updatedTrack.id ? updatedTrack : a) || []
        }));
    };

    const handleRemoveAudioTrack = (trackId: string) => {
        setDraft(prev => ({
            ...prev,
            audio: prev.audio?.filter(a => a.id !== trackId) || []
        }));
    };

    const commitSave = () => {
        if (!draft.title.trim()) { alert("Title is required"); return; }
        const readyToSave = prepareBhajanForSave(draft);
        onSave(readyToSave);
    };

    const handleSaveAndSend = () => {
        if (!draft.title.trim()) { alert("Title is required"); return; }
        const readyToSave = prepareBhajanForSave(draft);
        onSave(readyToSave); // Save locally

        // Extract clean ID (digits only) for the message
        // PRIORITY: Use Song Number if available, otherwise ID
        
        let cleanId = readyToSave.songNumber;

        // Special Check: If the user kept the placeholder text, force the message ID to be a prompt
        if (cleanId === 'New (Please Add ID)') {
            cleanId = "please add new id yourself";
        } else {
            // Otherwise try to extract number or use raw value
            const numericId = cleanId ? cleanId.replace(/\D/g, '') : readyToSave.id.replace(/\D/g, '');
            if (numericId) cleanId = numericId;
            // Fallback if regex fails (e.g. empty)
            if (!cleanId) cleanId = readyToSave.id;
        }

        // Construct Message (With Prefix)
        const msg = `Please update this Bhajan:\n([id:"${cleanId}"] [title:"${readyToSave.title}"] [author:"${readyToSave.author || ''}"] [content:"${readyToSave.content}"])`;
        window.open(`https://wa.me/${DEV_WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 animate-in slide-in-from-right">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
                <button onClick={onCancel} className="flex items-center gap-1 text-slate-500 font-bold text-sm">
                    <ChevronRight className="rotate-180" size={18} /> Back
                </button>
                <div className="flex gap-2 items-center">
                    
                    {/* Send Update Button */}
                    <button 
                        onClick={handleSaveAndSend}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-full font-bold text-sm shadow-sm flex items-center gap-1.5 mr-1"
                        title="Save & Send to WhatsApp"
                    >
                        <Send size={14} /> Send
                    </button>

                    {/* Delete with Confirm - No Haptics */}
                    <DeleteWithConfirm onDelete={() => onDelete(bhajan.id)} />
                    
                    <button 
                        type="button"
                        onClick={() => setDraft(bhajan)} 
                        className="p-2 text-slate-400 hover:text-blue-500 transition-colors" title="Reset Changes"
                    >
                        <RotateCcw size={18} />
                    </button>
                    <button 
                        type="button"
                        onClick={commitSave}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-sm flex items-center gap-2"
                    >
                        <Save size={16} /> Save
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-2 gap-2 bg-slate-100 dark:bg-slate-900">
                <button 
                    onClick={() => setEditTab('text')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${editTab === 'text' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500'}`}
                >
                    <FileText size={16} /> Text & Details
                </button>
                <button 
                    onClick={() => setEditTab('audio')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${editTab === 'audio' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500'}`}
                >
                    <Music size={16} /> Audio ({draft.audio?.length || 0})
                </button>
            </div>

            {/* Content Form */}
            <div className="flex-1 overflow-y-auto p-4">
                {editTab === 'text' ? (
                    <div className="space-y-4 max-w-2xl mx-auto">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Title (Devanagari)</label>
                                <input 
                                    value={draft.title}
                                    onChange={e => updateField('title', e.target.value)}
                                    className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-lg"
                                    placeholder="Bhajan Title"
                                />
                            </div>
                            <div className="w-24">
                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block flex items-center gap-1"><Hash size={10}/> Song #</label>
                                <input 
                                    value={draft.songNumber || ''}
                                    onChange={e => updateField('songNumber', e.target.value)}
                                    className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-center"
                                    placeholder="#"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block flex items-center gap-1"><User size={12}/> Author (Devanagari)</label>
                            <input 
                                value={draft.author || ''}
                                onChange={e => updateField('author', e.target.value)}
                                className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                                placeholder="Author Name"
                            />
                        </div>

                        <div className="flex-1 flex flex-col min-h-[400px]">
                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Content / Lyrics</label>
                            <textarea 
                                value={draft.content}
                                onChange={e => updateField('content', e.target.value)}
                                className="w-full flex-1 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-hindi leading-loose resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Paste lyrics here..."
                            />
                        </div>
                    </div>
                ) : (
                    <div className="max-w-xl mx-auto">
                        <h3 className="text-xs font-bold uppercase text-slate-500 mb-3">Linked Audio Tracks</h3>
                        {draft.audio && draft.audio.length > 0 ? (
                            draft.audio.map((audio, idx) => (
                                <AudioEditItem 
                                    key={audio.id || idx}
                                    audio={audio}
                                    onUpdate={handleUpdateAudioTrack}
                                    onRemove={handleRemoveAudioTrack}
                                />
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-400 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                <Music size={24} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No audio tracks linked.</p>
                            </div>
                        )}

                        <div className="mt-6 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                                <Plus size={16} className="text-blue-600" /> Add New Audio
                            </h4>
                            <div className="space-y-3">
                                <input 
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                                    placeholder="Singer Name"
                                    value={newAudioSinger}
                                    onChange={e => setNewAudioSinger(e.target.value)}
                                />
                                <input 
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                                    placeholder="URL (MP3 / Drive Link)"
                                    value={newAudioUrl}
                                    onChange={e => setNewAudioUrl(e.target.value)}
                                />
                                <button 
                                    onClick={handleAddAudio}
                                    disabled={!newAudioUrl || !newAudioSinger}
                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold rounded-lg transition-colors"
                                >
                                    Add Track
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
