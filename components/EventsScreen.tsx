import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Heart, ArrowLeft, CalendarCheck, Languages } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { hi, enUS } from 'date-fns/locale';
import { EventData } from '../types';
import { STATIC_EVENTS } from '../data/staticEvents';

interface EventsScreenProps {
  onBack: () => void;
  scrollBarSide?: 'left' | 'right';
  settingsLanguage?: 'en' | 'hi';
  events?: EventData[];
}

export const EventsScreen: React.FC<EventsScreenProps> = ({ onBack, scrollBarSide = 'left', settingsLanguage = 'hi' }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [lang, setLang] = useState<'en' | 'hi'>(settingsLanguage || 'hi');
  
  const currentLocale = lang === 'hi' ? hi : enUS;

  // Combine Static (Offline) and potentially any other events
  const events = useMemo(() => {
      return STATIC_EVENTS;
  }, []);

  // Calendar Grid Logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const jumpToToday = () => {
    const now = new Date();
    setCurrentMonth(now);
    setSelectedDate(now);
  };

  const getEventsForDay = (date: Date) => events.filter(e => isSameDay(new Date(e.date), date));

  // Upcoming events logic (starting from selected date)
  const getUpcomingDays = () => {
    const days = [];
    let count = 0;
    let iterDate = addDays(selectedDate, 1);
    let safety = 0;
    while(count < 5 && safety < 60) {
        const dayEvents = getEventsForDay(iterDate);
        if (dayEvents.length > 0) {
            days.push({ date: iterDate, events: dayEvents });
            count++;
        }
        iterDate = addDays(iterDate, 1);
        safety++;
    }
    return days;
  };

  const selectedDayEvents = getEventsForDay(selectedDate);
  const upcomingDays = getUpcomingDays();

  const isHindi = lang === 'hi';

  const t = {
      title: isHindi ? "वैष्णव कैलेंडर" : "Vaishnav Calendar",
      today: isHindi ? "आज" : "Today",
      ekadashiFast: isHindi ? "एकादशी व्रत" : "Ekadashi Fast",
      fastDesc: isHindi ? "अन्न और बीन्स का त्याग करें।" : "Fast from grains & beans.",
      eventsOnDay: isHindi ? "इस दिन के कार्यक्रम" : "Events on this day",
      noEvents: isHindi ? "कोई कार्यक्रम नहीं" : "No events listed",
      upcoming: isHindi ? "आगामी कार्यक्रम" : "Upcoming Next",
  };

  // Generate localized week days
  const weekDays = useMemo(() => {
      const days = [];
      const start = startOfWeek(new Date(), { weekStartsOn: 1 });
      for (let i = 0; i < 7; i++) {
          days.push(format(addDays(start, i), 'EEE', { locale: currentLocale }));
      }
      return days;
  }, [currentLocale]);

  // Helper to get correct title based on language
  const getEventTitle = (event: EventData) => {
      if (isHindi && event.titleHi) return event.titleHi;
      return event.title;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col animate-in slide-in-from-right duration-300 font-hindi">
        
        {/* Header */}
        <div className="flex-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center justify-between z-10 sticky top-0">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95">
                    <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-slate-200" />
                </button>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <CalendarCheck className="w-6 h-6 text-saffron-500" />
                    {t.title}
                </h2>
            </div>

            <button 
                onClick={() => setLang(prev => prev === 'hi' ? 'en' : 'hi')}
                className="flex items-center gap-1.5 bg-saffron-50 dark:bg-slate-800 border border-saffron-200 dark:border-slate-700 hover:bg-saffron-100 dark:hover:bg-slate-700 px-3 py-1.5 rounded-full transition-colors text-sm font-medium text-saffron-700 dark:text-saffron-400"
            >
                <Languages size={16} />
                <span className="font-bold uppercase">{lang === 'hi' ? 'English' : 'हिंदी'}</span>
            </button>
        </div>

        <div className={`flex-1 overflow-y-auto ${scrollBarSide === 'left' ? 'left-scrollbar' : ''} p-4 pb-[calc(2rem+env(safe-area-inset-bottom))]`}>
            <div dir={scrollBarSide === 'left' ? 'ltr' : undefined} className="h-full flex flex-col lg:flex-row gap-6 lg:gap-8 max-w-6xl mx-auto">
            
                {/* --- LEFT COLUMN: CALENDAR GRID --- */}
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px]">
                    {/* Top Navigation Bar */}
                    <div className="p-4 md:p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/30">
                        <button onClick={prevMonth} className="p-3 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-slate-500 dark:text-slate-300 transition-all shadow-sm hover:shadow active:scale-95">
                            <ChevronLeft size={20} />
                        </button>
                        
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center">
                                <span className="text-xl font-bold text-slate-800 dark:text-white capitalize">
                                    {format(currentMonth, 'MMMM', { locale: currentLocale })}
                                </span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{format(currentMonth, 'yyyy')}</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={jumpToToday} className="p-3 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-saffron-600 dark:text-saffron-400 transition-all shadow-sm hover:shadow active:scale-95 bg-saffron-50 dark:bg-slate-800" title="Today">
                                <RotateCcw size={20} />
                            </button>
                            <button onClick={nextMonth} className="p-3 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-slate-500 dark:text-slate-300 transition-all shadow-sm hover:shadow active:scale-95">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Week Headers */}
                    <div className="grid grid-cols-7 gap-1 px-4 md:px-8 py-4 bg-white dark:bg-slate-900">
                        {weekDays.map(day => (
                            <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="flex-1 px-4 md:px-8 pb-8">
                        <div className="grid grid-cols-7 gap-y-2 gap-x-1 h-full">
                            {calendarDays.map((day) => {
                                const dayEvents = getEventsForDay(day);
                                const isSelected = isSameDay(day, selectedDate);
                                const isCurrentMonth = isSameMonth(day, currentMonth);
                                const isTodayDate = isToday(day);
                                const hasEkadashi = dayEvents.some(e => e.isEkadashi);

                                return (
                                    <div 
                                        key={day.toISOString()} 
                                        onClick={() => setSelectedDate(day)}
                                        className={`
                                            aspect-square lg:aspect-auto flex flex-col items-center justify-center cursor-pointer relative group rounded-2xl transition-all duration-200 border border-transparent min-h-[50px]
                                            ${isSelected ? 'bg-saffron-600 text-white shadow-lg shadow-saffron-200 dark:shadow-none scale-105 z-10' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}
                                            ${!isSelected && isTodayDate ? 'bg-saffron-50 dark:bg-slate-800 text-saffron-700 dark:text-saffron-400 font-bold ring-1 ring-saffron-200 dark:ring-saffron-900' : ''}
                                            ${!isCurrentMonth ? 'opacity-30 grayscale' : ''}
                                        `}
                                    >
                                        <span className={`text-sm md:text-base ${isSelected ? 'font-bold' : 'font-medium'}`}>{format(day, 'd')}</span>
                                        
                                        {/* Dots */}
                                        <div className="flex gap-1 mt-1 h-1.5">
                                            {dayEvents.length > 0 && (
                                                <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : (hasEkadashi ? 'bg-red-500' : 'bg-saffron-400')}`}></div>
                                            )}
                                            {dayEvents.length > 1 && (
                                                <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: DETAILS PANEL --- */}
                <div className="lg:w-96 flex-shrink-0 space-y-6">
                    
                    {/* Selected Day Info */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-serif font-bold text-slate-800 dark:text-white text-2xl capitalize">
                                    {format(selectedDate, 'd', { locale: currentLocale })} <span className="text-slate-400 text-lg font-sans font-normal">{format(selectedDate, 'MMMM', { locale: currentLocale })}</span>
                                </h3>
                                <p className="text-slate-400 font-medium text-sm capitalize">{format(selectedDate, 'EEEE, yyyy', { locale: currentLocale })}</p>
                            </div>
                            {isToday(selectedDate) && <span className="text-xs font-bold text-saffron-600 dark:text-saffron-400 bg-saffron-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-saffron-100 dark:border-slate-700">{t.today}</span>}
                        </div>

                        {/* Fasting Info */}
                        {selectedDayEvents.some(e => e.isEkadashi) && (
                            <div className="mb-6">
                                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-xl p-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-800 flex items-center justify-center text-orange-600 dark:text-orange-300">
                                        <Heart size={16} fill="currentColor" />
                                    </div>
                                    <div>
                                        <p className="text-orange-800 dark:text-orange-200 font-bold text-xs uppercase tracking-wider">{t.ekadashiFast}</p>
                                        <p className="text-orange-600 dark:text-orange-300 text-xs">{t.fastDesc}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <h4 className="font-bold text-slate-400 text-xs uppercase tracking-widest mb-3">{t.eventsOnDay}</h4>
                        <div className="space-y-3">
                            {selectedDayEvents.length > 0 ? (
                                selectedDayEvents.map((event, idx) => (
                                    <div key={`${event.id}-${idx}`} className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                        <div>
                                            <span className="text-slate-800 dark:text-white font-bold text-sm block">
                                                {getEventTitle(event)}
                                            </span>
                                            <span className="text-xs text-saffron-500 font-bold mt-0.5 block uppercase tracking-wide">{event.type}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                    <p className="text-slate-400 text-sm italic">{t.noEvents}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming List (Always visible in this layout) */}
                    <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-[2rem] p-6 border border-slate-200/50 dark:border-slate-700/50">
                        <h4 className="font-bold text-slate-400 text-xs uppercase tracking-widest mb-4">{t.upcoming}</h4>
                        <div className="space-y-4">
                            {upcomingDays.map((item) => (
                                <div key={item.date.toISOString()} className="group">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-saffron-300 dark:bg-saffron-600 group-hover:bg-saffron-500 transition-colors"></span>
                                        <div className="font-bold text-slate-700 dark:text-slate-300 text-sm capitalize">
                                            {format(item.date, 'd MMM', { locale: currentLocale })} <span className="text-slate-400 font-normal">| {format(item.date, 'eee', { locale: currentLocale })}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2 pl-4 border-l-2 border-slate-200 dark:border-slate-700 group-hover:border-saffron-200 dark:group-hover:border-saffron-800 transition-colors">
                                        {item.events.map((event, idx) => (
                                            <div key={`${event.id}-${idx}`} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 shadow-sm">
                                                {getEventTitle(event)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
  );
};