import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { notesApi } from '../api';
import type { NoteSummary } from '../types';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export function CalendarPage() {
    const [notes, setNotes] = useState<NoteSummary[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotes();
    }, []);

    async function loadNotes() {
        try {
            const data = await notesApi.getAll();
            setNotes(data);
        } catch (err) {
            console.error('Failed to load notes', err);
        } finally {
            setLoading(false);
        }
    }

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        
        const days = [];
        // Add empty days for padding
        for (let i = 0; i < (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1); i++) {
            days.push(null);
        }
        // Add actual days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const monthNames = [
        "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const getNotesForDate = (date: Date) => {
        return notes.filter(note => {
            const noteDate = new Date(note.createdAt);
            return noteDate.getDate() === date.getDate() &&
                   noteDate.getMonth() === date.getMonth() &&
                   noteDate.getFullYear() === date.getFullYear();
        });
    };

    const days = getDaysInMonth(currentDate);

    return (
        <div className="min-h-screen p-8 animate-in fade-in duration-500">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                            <CalendarIcon className="w-8 h-8 text-indigo-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-dark-100">Takvim</h1>
                            <p className="text-dark-400">Zaman çizelgende notların</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-dark-800 p-1 rounded-xl border border-dark-700">
                        <button onClick={prevMonth} className="p-2 hover:bg-dark-700 rounded-lg text-dark-300">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="min-w-[140px] text-center font-medium text-dark-100">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </span>
                        <button onClick={nextMonth} className="p-2 hover:bg-dark-700 rounded-lg text-dark-300">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-xl">
                    {/* Weekdays */}
                    <div className="grid grid-cols-7 border-b border-dark-800 bg-dark-800/50">
                        {['Pts', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
                            <div key={day} className="py-3 text-center text-sm font-medium text-dark-400">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days */}
                    <div className="grid grid-cols-7 auto-rows-[140px]">
                        {days.map((date, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "border-r border-b border-dark-800 p-2 relative group transition-colors",
                                    date ? "hover:bg-dark-800/30" : "bg-dark-900/50"
                                )}
                            >
                                {date && (
                                    <>
                                        <span className={cn(
                                            "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium mb-2",
                                            date.toDateString() === new Date().toDateString()
                                                ? "bg-indigo-500 text-white"
                                                : "text-dark-400"
                                        )}>
                                            {date.getDate()}
                                        </span>
                                        
                                        <div className="space-y-1 overflow-y-auto max-h-[90px] pr-1 scrollbar-thin scrollbar-thumb-dark-700">
                                            {getNotesForDate(date).map(note => (
                                                <Link
                                                    key={note.id}
                                                    to={`/notes/${note.id}`}
                                                    className="block p-1.5 rounded-lg bg-dark-800 border border-dark-700 hover:border-indigo-500/50 text-xs transition-colors group-hover:bg-dark-700"
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        <FileText className="w-3 h-3 text-indigo-400 shrink-0" />
                                                        <span className="truncate text-dark-200">{note.title || 'İsimsiz'}</span>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CalendarPage;
