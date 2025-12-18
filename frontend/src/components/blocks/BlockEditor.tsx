import { useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import type { Block, TextBlock, HeadingBlock, CheckboxBlock, ImageBlock, CodeBlock } from '../../types';
import { DividerBlockEditor } from './DividerBlock';

interface BlockEditorProps {
    block: Block;
    onUpdate: (data: Partial<Block['data']>) => void;
    onBlur: () => void;
    onAddAfter?: (type: Block['type']) => void;
}

/**
 * BlockEditor Component
 * Sprint 7.5 - Block type-specific editors
 * Sprint 12 - Added divider and other Quick Wins block editors
 */
export function BlockEditor({ block, onUpdate, onBlur, onAddAfter }: BlockEditorProps) {
    switch (block.type) {
        case 'text':
            return <TextEditor block={block} onUpdate={onUpdate} onBlur={onBlur} onAddAfter={onAddAfter} />;
        case 'heading':
            return <HeadingEditor block={block} onUpdate={onUpdate} onBlur={onBlur} />;
        case 'checkbox':
            return <CheckboxEditor block={block} onUpdate={onUpdate} onBlur={onBlur} />;
        case 'image':
            return <ImageEditor block={block} onUpdate={onUpdate} onBlur={onBlur} />;
        case 'code':
            return <CodeEditor block={block} onUpdate={onUpdate} onBlur={onBlur} />;
        case 'divider':
            return <DividerBlockEditor onBlur={onBlur} />;
        default:
            return null;
    }
}

/**
 * Text Block Editor
 */
function TextEditor({
    block,
    onUpdate,
    onBlur,
    onAddAfter
}: {
    block: TextBlock;
    onUpdate: (data: Partial<TextBlock['data']>) => void;
    onBlur: () => void;
    onAddAfter?: (type: Block['type']) => void;
}) {
    const ref = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        ref.current?.focus();
        // Move cursor to end
        const len = ref.current?.value.length || 0;
        ref.current?.setSelectionRange(len, len);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onBlur();
            onAddAfter?.('text');
        }
    };

    return (
        <textarea
            ref={ref}
            defaultValue={block.data.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            onBlur={onBlur}
            onKeyDown={handleKeyDown}
            placeholder="Bir şeyler yazın..."
            className={cn(
                'w-full bg-transparent border-none outline-none resize-none',
                'text-dark-200 placeholder:text-dark-500',
                'min-h-[1.5em]'
            )}
            rows={1}
        />
    );
}

/**
 * Heading Block Editor
 */
function HeadingEditor({
    block,
    onUpdate,
    onBlur
}: {
    block: HeadingBlock;
    onUpdate: (data: Partial<HeadingBlock['data']>) => void;
    onBlur: () => void;
}) {
    const ref = useRef<HTMLInputElement>(null);
    const { level } = block.data;

    useEffect(() => {
        ref.current?.focus();
    }, []);

    const headingClasses = {
        1: 'text-2xl font-bold text-dark-50',
        2: 'text-xl font-semibold text-dark-100',
        3: 'text-lg font-medium text-dark-100',
    };

    return (
        <input
            ref={ref}
            type="text"
            defaultValue={block.data.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            onBlur={onBlur}
            placeholder="Başlık..."
            className={cn(
                'w-full bg-transparent border-none outline-none',
                'placeholder:text-dark-500',
                headingClasses[level]
            )}
        />
    );
}

/**
 * Checkbox Block Editor
 */
function CheckboxEditor({
    block,
    onUpdate,
    onBlur
}: {
    block: CheckboxBlock;
    onUpdate: (data: Partial<CheckboxBlock['data']>) => void;
    onBlur: () => void;
}) {
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        ref.current?.focus();
    }, []);

    return (
        <div className="flex items-center gap-3">
            <input
                type="checkbox"
                checked={block.data.checked}
                onChange={(e) => onUpdate({ checked: e.target.checked })}
                className="w-5 h-5 rounded accent-primary-500"
            />
            <input
                ref={ref}
                type="text"
                defaultValue={block.data.text}
                onChange={(e) => onUpdate({ text: e.target.value })}
                onBlur={onBlur}
                placeholder="Todo item..."
                className={cn(
                    'flex-1 bg-transparent border-none outline-none',
                    'text-dark-200 placeholder:text-dark-500',
                    block.data.checked && 'line-through text-dark-500'
                )}
            />
        </div>
    );
}

/**
 * Image Block Editor
 */
function ImageEditor({
    block,
    onUpdate,
    onBlur
}: {
    block: ImageBlock;
    onUpdate: (data: Partial<ImageBlock['data']>) => void;
    onBlur: () => void;
}) {
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        ref.current?.focus();
    }, []);

    return (
        <div className="space-y-2">
            <input
                ref={ref}
                type="url"
                defaultValue={block.data.url}
                onChange={(e) => onUpdate({ url: e.target.value })}
                onBlur={onBlur}
                placeholder="Resim URL'si..."
                className={cn(
                    'w-full bg-dark-800 border border-dark-700 rounded px-3 py-2',
                    'text-dark-200 placeholder:text-dark-500 outline-none',
                    'focus:border-primary-500'
                )}
            />
            <input
                type="text"
                defaultValue={block.data.caption || ''}
                onChange={(e) => onUpdate({ caption: e.target.value })}
                placeholder="Açıklama (opsiyonel)..."
                className={cn(
                    'w-full bg-dark-800 border border-dark-700 rounded px-3 py-2',
                    'text-dark-400 text-sm placeholder:text-dark-500 outline-none',
                    'focus:border-primary-500'
                )}
            />
        </div>
    );
}

/**
 * Code Block Editor
 */
function CodeEditor({
    block,
    onUpdate,
    onBlur
}: {
    block: CodeBlock;
    onUpdate: (data: Partial<CodeBlock['data']>) => void;
    onBlur: () => void;
}) {
    const ref = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        ref.current?.focus();
    }, []);

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <select
                    value={block.data.language}
                    onChange={(e) => onUpdate({ language: e.target.value as CodeBlock['data']['language'] })}
                    className={cn(
                        'bg-dark-800 border border-dark-700 rounded px-2 py-1',
                        'text-dark-300 text-sm outline-none',
                        'focus:border-primary-500'
                    )}
                >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="sql">SQL</option>
                    <option value="bash">Bash</option>
                    <option value="json">JSON</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="markdown">Markdown</option>
                    <option value="plaintext">Plain Text</option>
                </select>
                <input
                    type="text"
                    defaultValue={block.data.filename || ''}
                    onChange={(e) => onUpdate({ filename: e.target.value })}
                    placeholder="Dosya adı (opsiyonel)"
                    className={cn(
                        'flex-1 bg-dark-800 border border-dark-700 rounded px-2 py-1',
                        'text-dark-400 text-sm placeholder:text-dark-500 outline-none',
                        'focus:border-primary-500'
                    )}
                />
            </div>
            <textarea
                ref={ref}
                defaultValue={block.data.code}
                onChange={(e) => onUpdate({ code: e.target.value })}
                onBlur={onBlur}
                placeholder="// Kod yazın..."
                className={cn(
                    'w-full bg-dark-900 border border-dark-700 rounded p-3',
                    'text-dark-200 placeholder:text-dark-500 outline-none',
                    'font-mono text-sm resize-none min-h-[100px]',
                    'focus:border-primary-500'
                )}
                rows={5}
            />
        </div>
    );
}

export default BlockEditor;
