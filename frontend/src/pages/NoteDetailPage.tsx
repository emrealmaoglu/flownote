import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Edit3, Loader2, AlertCircle, Calendar } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { notesApi } from '../api';
import { SortableBlockList } from '../components/blocks';
import type { Note, Block } from '../types';

/**
 * NoteDetailPage Component
 * Not detay sayfası - Block'ları render eder
 * Sprint 2: Drag & Drop Block Management eklendi
 */
export function NoteDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (id) {
            loadNote(id);
        }
    }, [id]);

    async function loadNote(noteId: string) {
        try {
            setLoading(true);
            setError(null);
            const data = await notesApi.getById(noteId);
            setNote(data);
        } catch (err) {
            setError('Not bulunamadı');
            console.error('Failed to load note:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (!id || !confirm('Bu notu silmek istediğinize emin misiniz?')) return;

        try {
            setDeleting(true);
            await notesApi.delete(id);
            navigate('/');
        } catch (err) {
            console.error('Failed to delete note:', err);
            alert('Not silinemedi');
        } finally {
            setDeleting(false);
        }
    }

    /**
     * Handle block reorder from drag & drop
     * Sprint 2 - Drag & Drop Block Management
     */
    const handleReorder = useCallback(
        async (blockId: string, newOrder: number, reorderedBlocks: Block[]) => {
            if (!id || !note) return;

            // Optimistic update
            setNote((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    content: { blocks: reorderedBlocks },
                };
            });

            // API call
            try {
                await notesApi.reorderBlock(id, blockId, newOrder);
            } catch (err) {
                console.error('Failed to reorder block:', err);
                // Revert on error
                loadNote(id);
            }
        },
        [id, note]
    );

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
            </div>
        );
    }

    // Error state
    if (error || !note) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-8">
                <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                <h2 className="text-xl font-semibold text-dark-100 mb-2">
                    {error || 'Not bulunamadı'}
                </h2>
                <p className="text-dark-400 mb-6">
                    Bu not mevcut değil veya silinmiş olabilir.
                </p>
                <Link
                    to="/"
                    className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg',
                        'bg-dark-800 hover:bg-dark-700 text-dark-200',
                        'transition-colors',
                    )}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Ana Sayfaya Dön
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-dark-950/80 backdrop-blur-sm border-b border-dark-800">
                <div className="max-w-4xl mx-auto px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link
                            to="/"
                            className={cn(
                                'flex items-center gap-2 text-dark-400 hover:text-dark-200',
                                'transition-colors',
                            )}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Geri
                        </Link>
                        <div className="flex items-center gap-2">
                            <button
                                className={cn(
                                    'flex items-center gap-2 px-3 py-1.5 rounded-lg',
                                    'text-dark-400 hover:text-dark-200 hover:bg-dark-800',
                                    'transition-colors text-sm',
                                )}
                            >
                                <Edit3 className="w-4 h-4" />
                                Düzenle
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className={cn(
                                    'flex items-center gap-2 px-3 py-1.5 rounded-lg',
                                    'text-red-400 hover:text-red-300 hover:bg-red-500/10',
                                    'transition-colors text-sm',
                                    deleting && 'opacity-50 cursor-not-allowed',
                                )}
                            >
                                {deleting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                                Sil
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-8 py-8">
                {/* Title */}
                <h1 className="text-3xl font-bold text-dark-50 mb-4">
                    {note.title || 'Untitled'}
                </h1>

                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-dark-500 mb-8 pb-8 border-b border-dark-800">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Oluşturulma: {formatDate(note.createdAt)}</span>
                    </div>
                    <span>•</span>
                    <span>Güncelleme: {formatDate(note.updatedAt)}</span>
                    <span>•</span>
                    <span>{note.content?.blocks?.length || 0} block</span>
                </div>

                {/* Blocks - Sortable */}
                <div className="space-y-2">
                    {note.content?.blocks?.length > 0 ? (
                        <SortableBlockList
                            blocks={note.content.blocks}
                            onReorder={handleReorder}
                        />
                    ) : (
                        <div className="text-center py-12 text-dark-500">
                            <p>Bu not boş. Henüz block eklenmemiş.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default NoteDetailPage;

