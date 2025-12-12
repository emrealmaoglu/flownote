import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Type, Heading1, CheckSquare, Image } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn, generateId } from '../lib/utils';
import { notesApi } from '../api';
import { BlockRenderer } from '../components';
import type { Block, NoteContent } from '../types';

/**
 * NewNotePage Component
 * Yeni not oluşturma sayfası
 */
export function NewNotePage() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [saving, setSaving] = useState(false);

    // Block ekleme
    function addBlock(type: Block['type']) {
        const newBlock: Block = {
            id: generateId(),
            type,
            order: blocks.length,
            data: getDefaultData(type),
        } as Block;

        setBlocks([...blocks, newBlock]);
    }

    function getDefaultData(type: Block['type']) {
        switch (type) {
            case 'text':
                return { text: '' };
            case 'heading':
                return { text: '', level: 1 };
            case 'checkbox':
                return { text: '', checked: false };
            case 'image':
                return { url: '', alt: '' };
        }
    }

    // Block silme
    function removeBlock(id: string) {
        setBlocks(blocks.filter((b) => b.id !== id).map((b, i) => ({ ...b, order: i }) as Block));
    }

    // Block güncelleme
    function updateBlock(id: string, data: Record<string, unknown>) {
        setBlocks(
            blocks.map((b) => (b.id === id ? { ...b, data: { ...b.data, ...data } } as Block : b)),
        );
    }

    // Kaydetme
    async function handleSave() {
        if (!title.trim()) {
            alert('Lütfen bir başlık girin');
            return;
        }

        try {
            setSaving(true);
            const content: NoteContent = { blocks };
            const note = await notesApi.create({ title, content });
            navigate(`/notes/${note.id}`);
        } catch (err) {
            console.error('Failed to save note:', err);
            alert('Not kaydedilemedi');
        } finally {
            setSaving(false);
        }
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
                            İptal
                        </Link>
                        <button
                            onClick={handleSave}
                            disabled={saving || !title.trim()}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 rounded-lg',
                                'bg-primary-600 hover:bg-primary-500 text-white font-medium',
                                'transition-colors',
                                (saving || !title.trim()) && 'opacity-50 cursor-not-allowed',
                            )}
                        >
                            {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                'Kaydet'
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-8 py-8">
                {/* Title Input */}
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Başlık..."
                    className={cn(
                        'w-full text-3xl font-bold bg-transparent border-none outline-none',
                        'text-dark-50 placeholder:text-dark-600 mb-8',
                    )}
                    autoFocus
                />

                {/* Blocks */}
                <div className="space-y-4 mb-8">
                    {blocks.map((block) => (
                        <div
                            key={block.id}
                            className="group relative p-4 rounded-lg border border-dark-700 bg-dark-800/30"
                        >
                            {/* Block Editor */}
                            {block.type === 'text' && (
                                <textarea
                                    value={(block.data as { text: string }).text}
                                    onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                                    placeholder="Metin yazın..."
                                    className="w-full bg-transparent border-none outline-none text-dark-200 resize-none"
                                    rows={2}
                                />
                            )}
                            {block.type === 'heading' && (
                                <input
                                    type="text"
                                    value={(block.data as { text: string }).text}
                                    onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                                    placeholder="Başlık yazın..."
                                    className="w-full bg-transparent border-none outline-none text-xl font-semibold text-dark-100"
                                />
                            )}
                            {block.type === 'checkbox' && (
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={(block.data as { checked: boolean }).checked}
                                        onChange={(e) => updateBlock(block.id, { checked: e.target.checked })}
                                        className="w-5 h-5 rounded"
                                    />
                                    <input
                                        type="text"
                                        value={(block.data as { text: string }).text}
                                        onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                                        placeholder="Todo item..."
                                        className="flex-1 bg-transparent border-none outline-none text-dark-200"
                                    />
                                </div>
                            )}
                            {block.type === 'image' && (
                                <input
                                    type="url"
                                    value={(block.data as { url: string }).url}
                                    onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                                    placeholder="Resim URL'si..."
                                    className="w-full bg-transparent border-none outline-none text-dark-200"
                                />
                            )}

                            {/* Remove Button */}
                            <button
                                onClick={() => removeBlock(block.id)}
                                className={cn(
                                    'absolute -right-2 -top-2 p-1 rounded-full',
                                    'bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100',
                                    'transition-opacity hover:bg-red-500/30',
                                )}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>

                {/* Add Block Buttons */}
                <div className="flex items-center gap-2 p-4 rounded-lg border border-dashed border-dark-700">
                    <span className="text-dark-500 text-sm mr-2">Block ekle:</span>
                    <button
                        onClick={() => addBlock('text')}
                        className={cn(
                            'flex items-center gap-1 px-3 py-1.5 rounded-lg',
                            'bg-dark-800 hover:bg-dark-700 text-dark-300 text-sm',
                            'transition-colors',
                        )}
                    >
                        <Type className="w-4 h-4" />
                        Text
                    </button>
                    <button
                        onClick={() => addBlock('heading')}
                        className={cn(
                            'flex items-center gap-1 px-3 py-1.5 rounded-lg',
                            'bg-dark-800 hover:bg-dark-700 text-dark-300 text-sm',
                            'transition-colors',
                        )}
                    >
                        <Heading1 className="w-4 h-4" />
                        Heading
                    </button>
                    <button
                        onClick={() => addBlock('checkbox')}
                        className={cn(
                            'flex items-center gap-1 px-3 py-1.5 rounded-lg',
                            'bg-dark-800 hover:bg-dark-700 text-dark-300 text-sm',
                            'transition-colors',
                        )}
                    >
                        <CheckSquare className="w-4 h-4" />
                        Checkbox
                    </button>
                    <button
                        onClick={() => addBlock('image')}
                        className={cn(
                            'flex items-center gap-1 px-3 py-1.5 rounded-lg',
                            'bg-dark-800 hover:bg-dark-700 text-dark-300 text-sm',
                            'transition-colors',
                        )}
                    >
                        <Image className="w-4 h-4" />
                        Image
                    </button>
                </div>

                {/* Preview */}
                {blocks.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-dark-800">
                        <h3 className="text-sm font-medium text-dark-500 mb-4">Önizleme</h3>
                        <div className="space-y-2">
                            {blocks.map((block) => (
                                <BlockRenderer key={block.id} block={block} />
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default NewNotePage;
