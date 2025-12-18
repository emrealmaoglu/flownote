import { useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import type { QuoteBlock as QuoteBlockType } from '../../types';

interface QuoteBlockProps {
    block: QuoteBlockType;
}

/**
 * QuoteBlock Component
 * Sprint 12 - Blockquote with left border
 * Notion style: thick left border, italic text
 */
export function QuoteBlock({ block }: QuoteBlockProps) {
    const { text, author } = block.data;

    return (
        <blockquote
            className={cn(
                'border-l-4 border-dark-500 pl-4 py-2',
                'text-dark-300 italic'
            )}
        >
            <p className="text-base leading-relaxed">{text}</p>
            {author && (
                <footer className="mt-2 text-sm text-dark-500 not-italic">
                    — {author}
                </footer>
            )}
        </blockquote>
    );
}

interface QuoteBlockEditorProps {
    block: QuoteBlockType;
    onUpdate: (data: Partial<QuoteBlockType['data']>) => void;
    onBlur: () => void;
}

/**
 * QuoteBlockEditor - Edit mode
 */
export function QuoteBlockEditor({ block, onUpdate, onBlur }: QuoteBlockEditorProps) {
    const textRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        textRef.current?.focus();
    }, []);

    return (
        <div
            className={cn(
                'border-l-4 border-primary-500 pl-4 py-2',
                'bg-dark-800/50 rounded-r-lg'
            )}
        >
            <textarea
                ref={textRef}
                defaultValue={block.data.text}
                onChange={(e) => onUpdate({ text: e.target.value })}
                onBlur={onBlur}
                placeholder="Alıntı yazın..."
                className={cn(
                    'w-full bg-transparent border-none outline-none resize-none',
                    'text-dark-200 italic placeholder:text-dark-500',
                    'min-h-[2em]'
                )}
                rows={2}
            />
            <input
                type="text"
                defaultValue={block.data.author || ''}
                onChange={(e) => onUpdate({ author: e.target.value })}
                onBlur={onBlur}
                placeholder="— Yazar (opsiyonel)"
                className={cn(
                    'w-full bg-transparent border-none outline-none',
                    'text-sm text-dark-400 placeholder:text-dark-600',
                    'mt-1'
                )}
            />
        </div>
    );
}

export default QuoteBlock;
