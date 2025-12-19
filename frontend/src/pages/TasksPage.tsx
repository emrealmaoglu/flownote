import { useState, useEffect } from 'react';
import { KanbanSquare, Plus, MoreHorizontal } from 'lucide-react';
import { notesApi } from '../api';
import type { NoteSummary } from '../types';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

type Status = 'todo' | 'in-progress' | 'done';

export function TasksPage() {
    const [notes, setNotes] = useState<NoteSummary[]>([]);
    const [taskStatus, setTaskStatus] = useState<Record<string, Status>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [notesData] = await Promise.all([notesApi.getAll()]);
            setNotes(notesData);
            
            // Load status from local storage
            const savedStatus = localStorage.getItem('task_status_map');
            if (savedStatus) {
                setTaskStatus(JSON.parse(savedStatus));
            }
        } catch (err) {
            console.error('Failed to load tasks', err);
        } finally {
            setLoading(false);
        }
    }

    function moveTask(noteId: string, status: Status) {
        const newStatus = { ...taskStatus, [noteId]: status };
        setTaskStatus(newStatus);
        localStorage.setItem('task_status_map', JSON.stringify(newStatus));
    }

    const columns: { id: Status; title: string; color: string }[] = [
        { id: 'todo', title: 'Yapılacaklar', color: 'bg-dark-700' },
        { id: 'in-progress', title: 'Sürüyor', color: 'bg-primary-900/30' },
        { id: 'done', title: 'Tamamlandı', color: 'bg-green-900/20' },
    ];

    return (
        <div className="min-h-screen p-8 animate-in fade-in duration-500 overflow-x-auto">
            <div className="min-w-[1000px] mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-2xl bg-primary-500/10 border border-primary-500/20">
                        <KanbanSquare className="w-8 h-8 text-primary-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-dark-100">Görevler</h1>
                        <p className="text-dark-400">Projelerini Kanban ile yönet</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {columns.map((col) => (
                        <div key={col.id} className="flex flex-col h-[calc(100vh-200px)] rounded-2xl bg-dark-900/50 border border-dark-800">
                            {/* Column Header */}
                            <div className="p-4 border-b border-dark-800 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={cn("w-3 h-3 rounded-full", col.id === 'todo' ? 'bg-dark-500' : col.id === 'in-progress' ? 'bg-primary-500' : 'bg-green-500')} />
                                    <h3 className="font-semibold text-dark-100">{col.title}</h3>
                                    <span className="px-2 py-0.5 rounded-full bg-dark-800 text-xs text-dark-400">
                                        {notes.filter(n => (taskStatus[n.id] || 'todo') === col.id).length}
                                    </span>
                                </div>
                                <button className="text-dark-500 hover:text-dark-300">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Column Content */}
                            <div className="flex-1 p-3 overflow-y-auto space-y-3">
                                {loading ? (
                                    <div className="h-24 rounded-lg bg-dark-800/50 animate-pulse" />
                                ) : (
                                    notes
                                        .filter(note => (taskStatus[note.id] || 'todo') === col.id)
                                        .map(note => (
                                            <div
                                                key={note.id}
                                                className="group p-4 rounded-xl bg-dark-800 border border-dark-700 shadow-sm hover:border-primary-500/50 transition-all cursor-grab active:cursor-grabbing"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <Link to={`/notes/${note.id}`} className="font-medium text-dark-200 hover:text-primary-400 line-clamp-2">
                                                        {note.title || 'İsimsiz'}
                                                    </Link>
                                                    <button className="text-dark-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-2 mt-3">
                                                    {/* Move Buttons */}
                                                    <div className="flex gap-1">
                                                        {col.id !== 'todo' && (
                                                            <button
                                                                onClick={() => moveTask(note.id, 'todo')}
                                                                className="text-xs px-2 py-1 rounded bg-dark-700 hover:bg-dark-600 text-dark-400"
                                                            >
                                                                Yapılacak
                                                            </button>
                                                        )}
                                                        {col.id !== 'in-progress' && (
                                                            <button
                                                                onClick={() => moveTask(note.id, 'in-progress')}
                                                                className="text-xs px-2 py-1 rounded bg-dark-700 hover:bg-dark-600 text-primary-400"
                                                            >
                                                                Devam
                                                            </button>
                                                        )}
                                                        {col.id !== 'done' && (
                                                            <button
                                                                onClick={() => moveTask(note.id, 'done')}
                                                                className="text-xs px-2 py-1 rounded bg-dark-700 hover:bg-dark-600 text-green-400"
                                                            >
                                                                Bitti
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                )}
                                {notes.filter(n => (taskStatus[n.id] || 'todo') === col.id).length === 0 && !loading && (
                                    <div className="text-center py-8 border-2 border-dashed border-dark-800 rounded-xl">
                                        <p className="text-sm text-dark-600">Boş</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default TasksPage;
