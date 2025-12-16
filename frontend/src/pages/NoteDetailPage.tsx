import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, Calendar } from 'lucide-react';
import { cn, formatDate, generateId } from '../lib/utils';
import { notesApi } from '../api';
import { BacklinksPanel } from '../components/links';
import { EditableBlock, EditableTitle, AddBlockButton, EmptyNoteState } from '../components/blocks';
import { NoteHeader, FocusControls } from '../components/notes';
import { DeleteConfirmModal } from '../components/modals/DeleteConfirmModal';
import { useAutoSave } from '../hooks/useAutoSave';
import { useFocusMode } from '../contexts';
import type { Note, Block, BlockType } from '../types';

/**
 * NoteDetailPage Component
 * Sprint 7.5 - Inline edit with auto-save
 * Refactored for modularity and improved Focus Mode UX
 */
export function NoteDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toggleFocusMode, isFocusMode } = useFocusMode();

    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

    // Delete note handler (Triggered by Modal)
    async function confirmDelete() {
        if (!id) return;

        try {
            setDeleting(true);
            await notesApi.delete(id);
            // Refresh sidebar notes list
            window.dispatchEvent(new CustomEvent('notes:refresh'));
            navigate('/');
        } catch (err) {
            console.error('Failed to delete note:', err);
            // Close modal on error so user sees the issue, or keep it open with error state?
            // For now close and alert/toast
            setIsDeleteModalOpen(false);
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
            <NoteHeader
                isFocusMode={isFocusMode}
                toggleFocusMode={toggleFocusMode}
                saveStatus={saveStatus}
                handleDelete={() => setIsDeleteModalOpen(true)} // Open modal instead of direct delete
                deleting={deleting}
            />

            <FocusControls
                isFocusMode={isFocusMode}
                toggleFocusMode={toggleFocusMode}
                saveStatus={saveStatus}
            />

            {/* Custom Delete Modal */}
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                isDeleting={deleting}
                title={note.title ? `"${note.title}" Silinsin mi?` : 'Notu Sil'}
            />

            {/* Content */}
            <main className={cn(
                "mx-auto transition-all duration-500 ease-in-out",
                isFocusMode
                    ? "max-w-[1600px] px-16 py-16" // Focus Mode: Ultra wide for large screens
                    : "max-w-4xl px-8 py-8"   // Normal: Standard width
            )}>
                {/* Title - Editable */}
                <EditableTitle
                    title={note.title}
                    onChange={handleTitleChange}
                    className={cn(
                        "mb-4",
                        isFocusMode && "text-6xl font-black mb-12 tracking-tight" // Bigger, bolder title in Focus Mode
                    )}
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
                <div className={cn(
                    "space-y-1 pl-8",
                    isFocusMode && "pl-0 space-y-6 text-lg md:text-xl text-dark-200 leading-relaxed" // Larger text, more spacing, better color
                )}>
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
                                // Pass additional props for Focus Mode styling if needed
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
