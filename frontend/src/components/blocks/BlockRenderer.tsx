import { lazy, Suspense } from 'react';
import { CheckSquare, Square } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Block, TextBlock, HeadingBlock, CheckboxBlock, ImageBlock, CodeBlock, QuoteBlock as QuoteBlockType, CalloutBlock as CalloutBlockType, BookmarkBlock as BookmarkBlockType } from '../../types';
import { DividerBlock } from './DividerBlock';
import { QuoteBlock } from './QuoteBlock';
import { CalloutBlock } from './CalloutBlock';
import { BookmarkBlock } from './BookmarkBlock';

// Lazy load CodeBlockRenderer for bundle optimization
const CodeBlockRenderer = lazy(() => import('./CodeBlockRenderer'));

/**
 * BlockRenderer - Projenin Kalbi
 * Block tipine göre doğru HTML render eden bileşen
 * @Dev - TECH_SPEC.md'ye uygun olarak tasarlandı
 * Sprint 1: CodeBlock desteği eklendi
 */

interface BlockRendererProps {
    block: Block;
    className?: string;
}

/**
 * Text Block Renderer
 */
function TextBlockRenderer({ block }: { block: TextBlock }) {
    return (
        <p className="text-dark-200 leading-relaxed">
            {block.data.text || <span className="text-dark-500 italic">Empty text block</span>}
        </p>
    );
}

/**
 * Heading Block Renderer
 */
function HeadingBlockRenderer({ block }: { block: HeadingBlock }) {
    const { text, level } = block.data;

    const headingClasses = {
        1: 'text-2xl font-bold text-dark-50',
        2: 'text-xl font-semibold text-dark-100',
        3: 'text-lg font-medium text-dark-100',
    };

    const Tag = `h${level}` as keyof JSX.IntrinsicElements;

    return (
        <Tag className={headingClasses[level]}>
            {text || <span className="text-dark-500 italic">Empty heading</span>}
        </Tag>
    );
}

/**
 * Checkbox Block Renderer
 */
function CheckboxBlockRenderer({ block }: { block: CheckboxBlock }) {
    const { text, checked } = block.data;

    return (
        <div className="flex items-start gap-3 group">
            <div className="mt-1 flex-shrink-0">
                {checked ? (
                    <CheckSquare className="w-5 h-5 text-primary-500" />
                ) : (
                    <Square className="w-5 h-5 text-dark-500 group-hover:text-dark-400" />
                )}
            </div>
            <span
                className={cn(
                    'text-dark-200',
                    checked && 'line-through text-dark-500',
                )}
            >
                {text || <span className="text-dark-500 italic">Empty checkbox</span>}
            </span>
        </div>
    );
}

/**
 * Image Block Renderer
 */
function ImageBlockRenderer({ block }: { block: ImageBlock }) {
    const { url, alt, caption } = block.data;

    return (
        <figure className="space-y-2">
            <div className="rounded-lg overflow-hidden border border-dark-700 bg-dark-800">
                <img
                    src={url}
                    alt={alt || 'Image'}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/1e293b/64748b?text=Image+Not+Found';
                    }}
                />
            </div>
            {caption && (
                <figcaption className="text-sm text-dark-400 text-center italic">
                    {caption}
                </figcaption>
            )}
        </figure>
    );
}

/**
 * Code Block Loading Skeleton
 */
function CodeBlockSkeleton() {
    return (
        <div className="rounded-lg border border-dark-700 bg-dark-900 p-4 animate-pulse my-2">
            <div className="h-4 bg-dark-800 rounded w-1/4 mb-3" />
            <div className="space-y-2">
                <div className="h-3 bg-dark-800 rounded w-full" />
                <div className="h-3 bg-dark-800 rounded w-3/4" />
                <div className="h-3 bg-dark-800 rounded w-5/6" />
            </div>
        </div>
    );
}

/**
 * Ana BlockRenderer Component
 * Block tipine göre doğru renderer'ı seçer
 */
export function BlockRenderer({ block, className }: BlockRendererProps) {
    return (
        <div className={cn('py-1', className)}>
            {block.type === 'text' && <TextBlockRenderer block={block as TextBlock} />}
            {block.type === 'heading' && <HeadingBlockRenderer block={block as HeadingBlock} />}
            {block.type === 'checkbox' && <CheckboxBlockRenderer block={block as CheckboxBlock} />}
            {block.type === 'image' && <ImageBlockRenderer block={block as ImageBlock} />}
            {block.type === 'code' && (
                <Suspense fallback={<CodeBlockSkeleton />}>
                    <CodeBlockRenderer block={block as CodeBlock} />
                </Suspense>
            )}
            {block.type === 'divider' && <DividerBlock />}
            {block.type === 'quote' && <QuoteBlock block={block as QuoteBlockType} />}
            {block.type === 'callout' && <CalloutBlock block={block as CalloutBlockType} />}
            {block.type === 'bookmark' && <BookmarkBlock block={block as BookmarkBlockType} />}
        </div>
    );
}

export default BlockRenderer;

