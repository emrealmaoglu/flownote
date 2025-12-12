import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { notesApi } from '../api';
import type { NoteSummary } from '../types';

/**
 * HomePage Component
 * Ana sayfa - Hoş geldin mesajı ve hızlı erişim
 */
export function HomePage() {
    const [notes, setNotes] = useState<NoteSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotes();
    }, []);

    async function loadNotes() {
        try {
            const data = await notesApi.getAll();
            setNotes(data);
        } catch (err) {
            console.error('Failed to load notes:', err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-3xl mx-auto">
                {/* Welcome Section */}
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-dark-50 mb-3">
                        FlowNote'a Hoş Geldin 👋
                    </h1>
                    <p className="text-dark-400 text-lg max-w-md mx-auto">
                        Block-based not tutma uygulaması. Düşüncelerini text, başlık, checkbox
                        ve resim bloklarıyla organize et.
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                    <Link
                        to="/new"
                        className={cn(
                            'flex items-center gap-4 p-6 rounded-xl',
                            'bg-gradient-to-br from-primary-600 to-primary-700',
                            'hover:from-primary-500 hover:to-primary-600',
                            'transition-all duration-200 group',
                        )}
                    >
                        <div className="p-3 rounded-lg bg-white/10">
                            <Plus className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Yeni Not Oluştur</h3>
                            <p className="text-primary-200 text-sm">
                                Hemen yazmaya başla
                            </p>
                        </div>
                    </Link>

                    <div
                        className={cn(
                            'flex items-center gap-4 p-6 rounded-xl',
                            'bg-dark-800/50 border border-dark-700',
                        )}
                    >
                        <div className="p-3 rounded-lg bg-dark-700">
                            <FileText className="w-6 h-6 text-dark-300" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-dark-200">
                                {loading ? '...' : notes.length} Not
                            </h3>
                            <p className="text-dark-500 text-sm">
                                {loading ? 'Yükleniyor...' : 'Toplam notların'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Recent Notes */}
                {notes.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-lg font-semibold text-dark-200 mb-4">
                            Son Notlar
                        </h2>
                        <div className="space-y-2">
                            {notes.slice(0, 5).map((note) => (
                                <Link
                                    key={note.id}
                                    to={`/notes/${note.id}`}
                                    className={cn(
                                        'block p-4 rounded-lg',
                                        'bg-dark-800/30 border border-dark-700',
                                        'hover:border-primary-500/50 hover:bg-dark-800/50',
                                        'transition-all duration-200',
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-4 h-4 text-primary-400" />
                                            <span className="font-medium text-dark-100">
                                                {note.title || 'Untitled'}
                                            </span>
                                        </div>
                                        <span className="text-xs text-dark-500">
                                            {note.blockCount} block
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && notes.length === 0 && (
                    <div className="mt-12 text-center py-12 rounded-xl bg-dark-800/30 border border-dark-700">
                        <FileText className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                        <h3 className="text-dark-300 font-medium mb-2">Henüz not yok</h3>
                        <p className="text-dark-500 text-sm mb-4">
                            İlk notunu oluşturarak başla
                        </p>
                        <Link
                            to="/new"
                            className={cn(
                                'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
                                'bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium',
                                'transition-colors',
                            )}
                        >
                            <Plus className="w-4 h-4" />
                            Yeni Not
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default HomePage;
