import { useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import type { QuoteBlock as QuoteBlockType } from '../../types';

export function QuoteBlock({ block }: { block: QuoteBlockType }) {
  return (
    <blockquote className={cn('border-l-4 border-dark-500 pl-4 py-2 text-dark-300 italic')}>
      <p>{block.data.text}</p>
      {block.data.author && <footer className="mt-2 text-sm text-dark-500 not-italic">— {block.data.author}</footer>}
    </blockquote>
  );
}

export function QuoteBlockEditor({ block, onUpdate, onBlur }: {
  block: QuoteBlockType;
  onUpdate: (data: Partial<QuoteBlockType['data']>) => void;
  onBlur: () => void
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div className={cn('border-l-4 border-primary-500 pl-4 py-2 bg-dark-800/50 rounded-r-lg')}>
      <textarea
        ref={ref}
        defaultValue={block.data.text}
        onChange={(e) => onUpdate({ text: e.target.value })}
        onBlur={onBlur}
        placeholder="Alıntı..."
        className="w-full bg-transparent border-none outline-none resize-none text-dark-200 italic min-h-[2em]"
        rows={2}
      />
      <input
        type="text"
        defaultValue={block.data.author || ''}
        onChange={(e) => onUpdate({ author: e.target.value })}
        placeholder="— Yazar (opsiyonel)"
        className="w-full bg-transparent border-none outline-none text-sm text-dark-400 mt-1"
      />
    </div>
  );
}
