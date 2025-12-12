import { CheckSquare, Square } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Block, TextBlock, HeadingBlock, CheckboxBlock, ImageBlock } from '../../types';

/**
 * BlockRenderer - Projenin Kalbi
 * Block tipine göre doğru HTML render eden bileşen
 * @Dev - TECH_SPEC.md'ye uygun olarak tasarlandı
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
        </div>
    );
}

export default BlockRenderer;
