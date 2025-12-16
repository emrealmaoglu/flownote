import { useState } from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { BlockRenderer } from './BlockRenderer';
import { BlockEditor } from './BlockEditor';
import type { Block } from '../../types';

interface EditableBlockProps {
    block: Block;
    onUpdate: (blockId: string, data: Partial<Block['data']>) => void;
    onDelete: (blockId: string) => void;
    onAddAfter?: (blockId: string, type: Block['type']) => void;
}

/**
 * EditableBlock Component
 * Sprint 7.5 - Click-to-edit wrapper for blocks
 * 
 * - Click to enter edit mode
 * - Blur/Enter to save
 * - Hover shows drag handle and delete button
 */
export function EditableBlock({ block, onUpdate, onDelete, onAddAfter }: EditableBlockProps) {
    const [isEditing, setIsEditing] = useState(false);

    const handleClick = () => {
        if (!isEditing) {
            setIsEditing(true);
        }
    };

    const handleBlur = () => {
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && block.type !== 'text' && block.type !== 'code') {
            e.preventDefault();
            setIsEditing(false);
            onAddAfter?.(block.id, 'text');
        }
        if (e.key === 'Escape') {
            setIsEditing(false);
        }
    };

    const handleDelete = () => {
        if (confirm('Bu bloğu silmek istediğinize emin misiniz?')) {
            onDelete(block.id);
        }
    };

    return (
        <div className="group relative flex items-start gap-2 py-1 -ml-8 pl-8">
            {/* Drag Handle - visible on hover */}
            <div
                className={cn(
                    'absolute left-0 top-1 flex items-center gap-0.5',
                    'opacity-0 group-hover:opacity-100 transition-opacity',
                    'cursor-grab active:cursor-grabbing'
                )}
            >
                <GripVertical className="w-4 h-4 text-dark-500" />
            </div>

            {/* Block Content */}
            <div
                className="flex-1 min-w-0"
                onClick={handleClick}
                onKeyDown={handleKeyDown}
            >
                {isEditing ? (
                    <BlockEditor
                        block={block}
                        onUpdate={(data: Partial<Block['data']>) => onUpdate(block.id, data)}
                        onBlur={handleBlur}
                        onAddAfter={onAddAfter ? (type: Block['type']) => onAddAfter(block.id, type) : undefined}
                    />
                ) : (
                    <div className={cn(
                        'cursor-pointer rounded px-1 -mx-1',
                        'hover:bg-dark-800/50 transition-colors'
                    )}>
                        <BlockRenderer block={block} />
                    </div>
                )}
            </div>

            {/* Delete Button - visible on hover */}
            <button
                onClick={handleDelete}
                className={cn(
                    'absolute right-0 top-1 p-1 rounded',
                    'opacity-0 group-hover:opacity-100 transition-opacity',
                    'text-dark-500 hover:text-red-400 hover:bg-red-500/10'
                )}
                title="Bloğu sil"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}

export default EditableBlock;
