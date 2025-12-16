import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Loader2, AlertCircle, Calendar, Check, Focus, Minimize2 } from 'lucide-react';
import { cn, formatDate, generateId } from '../lib/utils';
import { notesApi } from '../api';
import { BacklinksPanel } from '../components/links';
import { EditableBlock, EditableTitle, AddBlockButton, EmptyNoteState } from '../components/blocks';
import { useAutoSave, SaveStatus } from '../hooks/useAutoSave';
import { useFocusMode } from '../contexts';
import type { Note, Block, BlockType } from '../types';

/**
 * NoteDetailPage Component
 * Sprint 7.5 - Inline edit with auto-save
 * 
 * Features:
 * - Click-to-edit title and blocks
 * - Debounced auto-save (1s)
 * - Block add/delete
 * - Drag & drop reorder
 * - Save status indicator
 */
export function NoteDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toggleFocusMode, isFocusMode } = useFocusMode();

    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Auto-save hook
    const { queueChange, saveStatus } = useAutoSave({
        noteId: id || '',
        onSave: async (noteId, data) => {
            await notesApi.update(noteId, data);
        },
    });

    // Load note on mount
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

    // Delete note
    async function handleDelete() {
        if (!id || !confirm('Bu notu silmek istediğinize emin misiniz?')) return;

        try {
            setDeleting(true);
            await notesApi.delete(id);
            // Refresh sidebar notes list
            window.dispatchEvent(new CustomEvent('notes:refresh'));
            navigate('/');
        } catch (err) {
            console.error('Failed to delete note:', err);
            alert(`Not silinemedi: ${(err as any).message || 'Bilinmeyen hata'}`);
        } finally {
            setDeleting(false);
        }
    }

    // Title change
    const handleTitleChange = useCallback((newTitle: string) => {
        setNote(prev => prev ? { ...prev, title: newTitle } : null);
        queueChange({ title: newTitle });
    }, [queueChange]);

    // Block update
    const handleBlockUpdate = useCallback((blockId: string, data: Partial<Block['data']>) => {
        setNote(prev => {
            if (!prev) return null;
            const updatedBlocks = prev.content.blocks.map(b =>
                b.id === blockId ? { ...b, data: { ...b.data, ...data } } as Block : b
            );
            queueChange({ content: { blocks: updatedBlocks } });
            return { ...prev, content: { blocks: updatedBlocks } };
        });
    }, [queueChange]);

    // Block delete
    const handleBlockDelete = useCallback((blockId: string) => {
        setNote(prev => {
            if (!prev) return null;
            const updatedBlocks = prev.content.blocks
                .filter(b => b.id !== blockId)
                .map((b, i) => ({ ...b, order: i }));
            queueChange({ content: { blocks: updatedBlocks } });
            return { ...prev, content: { blocks: updatedBlocks } };
        });
    }, [queueChange]);

    // Block add
    const handleBlockAdd = useCallback((type: BlockType) => {
        setNote(prev => {
            if (!prev) return null;
            const newBlock = createBlock(type, prev.content.blocks.length);
            const updatedBlocks = [...prev.content.blocks, newBlock];
            queueChange({ content: { blocks: updatedBlocks } });
            return { ...prev, content: { blocks: updatedBlocks } };
        });
    }, [queueChange]);

    // Add block after specific block
    const handleAddAfter = useCallback((blockId: string, type: BlockType) => {
        setNote(prev => {
            if (!prev) return null;
            const index = prev.content.blocks.findIndex(b => b.id === blockId);
            if (index === -1) return prev;

            const newBlock = createBlock(type, index + 1);
            const updatedBlocks = [
                ...prev.content.blocks.slice(0, index + 1),
                newBlock,
                ...prev.content.blocks.slice(index + 1)
            ].map((b, i) => ({ ...b, order: i }));

            queueChange({ content: { blocks: updatedBlocks } });
            return { ...prev, content: { blocks: updatedBlocks } };
        });
    }, [queueChange]);

    // Component: Header
    const Header = () => (
        <header className={cn(
            "sticky top-0 z-10 bg-dark-950/80 backdrop-blur-sm border-b border-dark-800",
            isFocusMode && "hidden"
        )}>
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
                        {/* Save Status Indicator */}
                        <SaveStatusIndicator status={saveStatus} />

                        {/* Focus Mode */}
                        <button
                            onClick={toggleFocusMode}
                            className={cn(
                                'flex items-center gap-2 px-3 py-1.5 rounded-lg',
                                'text-dark-400 hover:text-dark-200 hover:bg-dark-800',
                                'transition-colors text-sm',
                            )}
                            title="Focus Mode (F11)"
                        >
                            <Focus className="w-4 h-4" />
                        </button>

                        {/* Delete */}
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
    );

    // Component: Focus Controls (Floating)
    const FocusControls = () => (
        isFocusMode ? (
            <>
                {/* Floating Exit Button */}
                <button
                    onClick={toggleFocusMode}
                    className="fixed top-6 right-8 z-50 p-2 text-dark-400 hover:text-dark-200 bg-dark-950/50 hover:bg-dark-800 rounded-lg backdrop-blur-sm transition-all border border-transparent hover:border-dark-700"
                    title="Exit Focus Mode (Esc)"
                >
                    <Minimize2 className="w-5 h-5" />
                </button>

                {/* Floating Save Status */}
                <div className="fixed bottom-6 right-8 z-50 bg-dark-950/50 px-3 py-2 rounded-lg backdrop-blur-sm border border-dark-800/50">
                    <SaveStatusIndicator status={saveStatus} />
                </div>
            </>
        ) : null
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
            <Header />
            <FocusControls />

            {/* Content */}
            <main className="max-w-4xl mx-auto px-8 py-8">
                {/* Title - Editable */}
                <EditableTitle
                    title={note.title}
                    onChange={handleTitleChange}
                    className="mb-4"
                />

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

                {/* Blocks - Editable */}
                <div className="space-y-1 pl-8">
                    {note.content?.blocks?.length > 0 ? (
                        note.content.blocks
                            .sort((a, b) => a.order - b.order)
                            .map((block) => (
                                <EditableBlock
                                    key={block.id}
                                    block={block}
                                    onUpdate={handleBlockUpdate}
                                    onDelete={handleBlockDelete}
                                    onAddAfter={handleAddAfter}
                                />
                            ))
                    ) : (
                        <EmptyNoteState onAddBlock={handleBlockAdd} />
                    )}
                </div>

                {/* Add Block Button - Always visible */}
                {note.content?.blocks?.length > 0 && (
                    <AddBlockButton
                        onAdd={handleBlockAdd}
                        className="mt-6"
                    />
                )}

                {/* Backlinks Panel */}
                {id && <BacklinksPanel noteId={id} className="mt-8" />}
            </main>
        </div>
    );
}

/**
 * Save Status Indicator
 */
function SaveStatusIndicator({ status }: { status: SaveStatus }) {
    if (status === 'idle') return null;

    return (
        <div className={cn(
            'flex items-center gap-1 px-2 py-1 rounded text-xs',
            status === 'saving' && 'text-dark-400',
            status === 'saved' && 'text-green-400',
            status === 'error' && 'text-red-400',
        )}>
            {status === 'saving' && (
                <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Kaydediliyor...</span>
                </>
            )}
            {status === 'saved' && (
                <>
                    <Check className="w-3 h-3" />
                    <span>Kaydedildi</span>
                </>
            )}
            {status === 'error' && (
                <>
                    <AlertCircle className="w-3 h-3" />
                    <span>Hata!</span>
                </>
            )}
        </div>
    );
}

/**
 * Create a new block with default data
 */
function createBlock(type: BlockType, order: number): Block {
    const id = generateId();

    switch (type) {
        case 'text':
            return { id, type: 'text', order, data: { text: '' } };
        case 'heading':
            return { id, type: 'heading', order, data: { text: '', level: 2 } };
        case 'checkbox':
            return { id, type: 'checkbox', order, data: { text: '', checked: false } };
        case 'image':
            return { id, type: 'image', order, data: { url: '', alt: '' } };
        case 'code':
            return { id, type: 'code', order, data: { code: '', language: 'javascript' } };
        default:
            return { id, type: 'text', order, data: { text: '' } };
    }
}

export default NoteDetailPage;
