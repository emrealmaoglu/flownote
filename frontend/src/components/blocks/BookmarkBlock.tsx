import { useRef, useEffect } from 'react';
import { Link2, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { BookmarkBlock as BookmarkBlockType } from '../../types';

export function BookmarkBlock({ block }: { block: BookmarkBlockType }) {
  const { url, title, description } = block.data;
  if (!url) return <div className="text-dark-500 italic">Bookmark URL girilmedi</div>;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className={cn('flex items-center gap-4 p-4 rounded-lg border border-dark-700 bg-dark-800/50 hover:border-dark-600 transition-colors group')}>
      <Link2 className="w-8 h-8 text-dark-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-dark-200 truncate">{title || url}</span>
          <ExternalLink className="w-3 h-3 text-dark-500 opacity-0 group-hover:opacity-100" />
        </div>
        {description && <p className="text-sm text-dark-400 truncate mt-1">{description}</p>}
        <span className="text-xs text-dark-500 truncate block mt-1">{url}</span>
      </div>
    </a>
  );
}

export function BookmarkBlockEditor({ block, onUpdate, onBlur }: {
  block: BookmarkBlockType;
  onUpdate: (data: Partial<BookmarkBlockType['data']>) => void;
  onBlur: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div className="p-4 rounded-lg border border-dark-700 bg-dark-800/50 space-y-2">
      <input ref={ref} type="url" defaultValue={block.data.url} onChange={(e) => onUpdate({ url: e.target.value })}
        placeholder="https://..." className="w-full bg-dark-900 border border-dark-700 rounded px-3 py-2 text-dark-200" />
      <input type="text" defaultValue={block.data.title || ''} onChange={(e) => onUpdate({ title: e.target.value })}
        placeholder="Başlık (opsiyonel)" className="w-full bg-transparent border-none outline-none text-sm text-dark-300" />
      <input type="text" defaultValue={block.data.description || ''} onChange={(e) => onUpdate({ description: e.target.value })} onBlur={onBlur}
        placeholder="Açıklama (opsiyonel)" className="w-full bg-transparent border-none outline-none text-sm text-dark-400" />
    </div>
  );
}
