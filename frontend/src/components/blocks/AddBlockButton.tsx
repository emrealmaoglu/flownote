import { useState } from 'react';
import { Plus, Type, Heading1, CheckSquare, Image, Code, Minus, Quote, Lightbulb, Link2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { BlockType } from '../../types';

interface AddBlockButtonProps {
    onAdd: (type: BlockType) => void;
    className?: string;
}

const BLOCK_OPTIONS: { type: BlockType; label: string; icon: React.ReactNode }[] = [
    { type: 'text', label: 'Text', icon: <Type className="w-4 h-4" /> },
    { type: 'heading', label: 'Heading', icon: <Heading1 className="w-4 h-4" /> },
    { type: 'checkbox', label: 'Checkbox', icon: <CheckSquare className="w-4 h-4" /> },
    { type: 'image', label: 'Image', icon: <Image className="w-4 h-4" /> },
    { type: 'code', label: 'Code', icon: <Code className="w-4 h-4" /> },
    { type: 'divider', label: 'Divider', icon: <Minus className="w-4 h-4" /> },
    { type: 'quote', label: 'Quote', icon: <Quote className="w-4 h-4" /> },
    { type: 'callout', label: 'Callout', icon: <Lightbulb className="w-4 h-4" /> },
    { type: 'bookmark', label: 'Bookmark', icon: <Link2 className="w-4 h-4" /> },
];

/**
 * AddBlockButton Component
 * Sprint 7.5 - Button to add new blocks
 */
export function AddBlockButton({ onAdd, className }: AddBlockButtonProps) {
    const [showMenu, setShowMenu] = useState(false);

    const handleAdd = (type: BlockType) => {
        onAdd(type);
        setShowMenu(false);
    };

    return (
        <div className={cn('relative', className)}>
            <button
                onClick={() => setShowMenu(!showMenu)}
                className={cn(
                    'flex items-center justify-center w-full py-2',
                    'border-2 border-dashed border-dark-700 rounded-lg',
                    'text-dark-500 hover:text-dark-400 hover:border-dark-600',
                    'transition-colors'
                )}
            >
                <Plus className="w-5 h-5 mr-2" />
                Block ekle
            </button>

            {showMenu && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                    />

                    {/* Menu */}
                    <div className={cn(
                        'absolute left-0 right-0 top-full mt-2 z-20',
                        'bg-dark-800 border border-dark-700 rounded-lg',
                        'shadow-lg overflow-hidden'
                    )}>
                        {BLOCK_OPTIONS.map((option) => (
                            <button
                                key={option.type}
                                onClick={() => handleAdd(option.type)}
                                className={cn(
                                    'w-full flex items-center gap-3 px-4 py-3',
                                    'text-dark-300 hover:text-dark-100',
                                    'hover:bg-dark-700 transition-colors',
                                    'text-left'
                                )}
                            >
                                {option.icon}
                                <span>{option.label}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default AddBlockButton;
