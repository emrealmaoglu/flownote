import { useRef, useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import type { CalloutBlock as CalloutBlockType } from '../../types';

// Renk paleti
const CALLOUT_COLORS = {
    blue: 'bg-blue-500/10 border-blue-500/30',
    green: 'bg-green-500/10 border-green-500/30',
    yellow: 'bg-yellow-500/10 border-yellow-500/30',
    red: 'bg-red-500/10 border-red-500/30',
    purple: 'bg-purple-500/10 border-purple-500/30',
    gray: 'bg-dark-700/50 border-dark-600',
};

// Default emojiler
const DEFAULT_EMOJIS = ['💡', '⚠️', '📝', '✅', '❌', '🔥', '💬', 'ℹ️'];

interface CalloutBlockProps {
    block: CalloutBlockType;
}

/**
 * CalloutBlock Component
 * Sprint 12 - Colored info box with emoji
 */
export function CalloutBlock({ block }: CalloutBlockProps) {
    const { text, emoji = '💡', color = 'blue' } = block.data;

    return (
        <div
            className={cn(
                'flex gap-3 p-4 rounded-lg border',
                CALLOUT_COLORS[color]
            )}
        >
            <span className="text-xl flex-shrink-0">{emoji}</span>
            <p className="text-dark-200 leading-relaxed flex-1">{text}</p>
        </div>
    );
}

interface CalloutBlockEditorProps {
    block: CalloutBlockType;
    onUpdate: (data: Partial<CalloutBlockType['data']>) => void;
    onBlur: () => void;
}

/**
 * CalloutBlockEditor - Edit mode with emoji picker
 */
export function CalloutBlockEditor({ block, onUpdate, onBlur }: CalloutBlockEditorProps) {
    const textRef = useRef<HTMLTextAreaElement>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const { emoji = '💡', color = 'blue' } = block.data;

    useEffect(() => {
        textRef.current?.focus();
    }, []);

    return (
        <div
            className={cn(
                'flex gap-3 p-4 rounded-lg border',
                CALLOUT_COLORS[color]
            )}
        >
            {/* Emoji Picker */}
            <div className="relative">
                <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-xl hover:bg-dark-700 rounded p-1 transition-colors"
                >
                    {emoji}
                </button>

                {showEmojiPicker && (
                    <div className="absolute top-full left-0 mt-1 p-2 bg-dark-800 rounded-lg border border-dark-700 shadow-xl z-10">
                        <div className="grid grid-cols-4 gap-1">
                            {DEFAULT_EMOJIS.map((e) => (
                                <button
                                    key={e}
                                    onClick={() => {
                                        onUpdate({ emoji: e });
                                        setShowEmojiPicker(false);
                                    }}
                                    className="text-xl p-1 hover:bg-dark-700 rounded"
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                        {/* Color Picker */}
                        <div className="flex gap-1 mt-2 pt-2 border-t border-dark-700">
                            {(Object.keys(CALLOUT_COLORS) as Array<keyof typeof CALLOUT_COLORS>).map((c) => (
                                <button
                                    key={c}
                                    onClick={() => {
                                        onUpdate({ color: c });
                                        setShowEmojiPicker(false);
                                    }}
                                    className={cn(
                                        'w-5 h-5 rounded-full border-2',
                                        c === color ? 'border-white' : 'border-transparent',
                                        c === 'blue' && 'bg-blue-500',
                                        c === 'green' && 'bg-green-500',
                                        c === 'yellow' && 'bg-yellow-500',
                                        c === 'red' && 'bg-red-500',
                                        c === 'purple' && 'bg-purple-500',
                                        c === 'gray' && 'bg-gray-500',
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Text Input */}
            <textarea
                ref={textRef}
                defaultValue={block.data.text}
                onChange={(e) => onUpdate({ text: e.target.value })}
                onBlur={onBlur}
                placeholder="Callout içeriği..."
                className={cn(
                    'flex-1 bg-transparent border-none outline-none resize-none',
                    'text-dark-200 placeholder:text-dark-500',
                    'min-h-[1.5em]'
                )}
                rows={1}
            />
        </div>
    );
}

export default CalloutBlock;
