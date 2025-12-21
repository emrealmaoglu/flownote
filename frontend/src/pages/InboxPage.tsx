import { useState, useEffect } from 'react';
import { Inbox, Plus, Loader2, CheckCircle2 } from 'lucide-react';
import { notesApi } from '../api';
import type { NoteSummary } from '../types';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export function InboxPage() {
    const [notes, setNotes] = useState<NoteSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [newItem, setNewItem] = useState('');
    const [adding, setAdding] = useState(false);

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

    async function handleAddItem(e: React.FormEvent) {
        e.preventDefault();
        if (!newItem.trim()) return;

        try {
            setAdding(true);
            await notesApi.create({
                title: newItem,
                content: { blocks: [] }, // Empty content for quick capture
            });
            setNewItem('');
            loadNotes();
        } catch (err) {
            console.error('Failed to add item', err);
        } finally {
            setAdding(false);
        }
    }

    return (
        <div className="min-h-screen p-8 animate-in fade-in duration-500">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                        <Inbox className="w-8 h-8 text-rose-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-dark-50">Gelen Kutusu</h1>
                        <p className="text-dark-400">Hızlı düşünceler ve görevler</p>
                    </div>
                </div>

                {/* Quick Capture Input */}
                <form onSubmit={handleAddItem} className="mb-8 relative">
                    <input
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder="Aklındakini buraya yaz ve Enter'a bas..."
                        className="w-full pl-6 pr-14 py-4 rounded-xl bg-dark-800 border border-dark-700 text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all shadow-lg"
                        autoFocus
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {adding ? (
                            <Loader2 className="w-5 h-5 text-dark-400 animate-spin" />
                        ) : (
                            <button
                                type="submit"
                                disabled={!newItem.trim()}
                                className="p-1.5 rounded-lg bg-dark-700 text-dark-300 hover:text-white hover:bg-rose-600 transition-colors disabled:opacity-0"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </form>

                {/* List */}
                <div className="space-y-2">
                    {loading ? (
                        <p className="text-center text-dark-500 py-8">Yükleniyor...</p>
                    ) : notes.length > 0 ? (
                        notes.map((note) => (
                            <Link
                                key={note.id}
                                to={`/notes/${note.id}`}
                                className={cn(
                                    'flex items-center gap-4 p-4 rounded-xl',
                                    'bg-dark-800/30 border border-dark-700/50',
                                    'hover:bg-dark-800 hover:border-dark-600',
                                    'group transition-all duration-200'
                                )}
                            >
                                <button
                                    onClick={(e) => {
                                        e.preventDefault(); // Prevent navigation when clicking checkbox
                                        // TODO: Implement toggle done
                                    }}
                                    className="w-5 h-5 rounded-full border-2 border-dark-600 group-hover:border-rose-500/50 flex items-center justify-center transition-colors"
                                >
                                    <CheckCircle2 className="w-3 h-3 text-transparent group-hover:text-rose-500/50" />
                                </button>
                                <span className="flex-1 font-medium text-dark-200 group-hover:text-white transition-colors">
                                    {note.title || 'İsimsiz Öğe'}
                                </span>
                                <span className="text-xs text-dark-500 font-mono">
                                    {new Date(note.createdAt).toLocaleDateString('tr-TR')}
                                </span>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-dark-500">Inbox boş. Yeni bir şeyler ekle!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
export default InboxPage;
