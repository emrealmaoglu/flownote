import { useRef, useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import type { CalloutBlock as CalloutBlockType } from '../../types';

const COLORS = {
  blue: 'bg-blue-500/10 border-blue-500/30',
  green: 'bg-green-500/10 border-green-500/30',
  yellow: 'bg-yellow-500/10 border-yellow-500/30',
  red: 'bg-red-500/10 border-red-500/30',
  purple: 'bg-purple-500/10 border-purple-500/30',
  gray: 'bg-dark-700/50 border-dark-600',
};

const EMOJIS = ['💡', '⚠️', '📝', '✅', '❌', '🔥', '💬', 'ℹ️'];

export function CalloutBlock({ block }: { block: CalloutBlockType }) {
  const { text, emoji = '💡', color = 'blue' } = block.data;
  return (
    <div className={cn('flex gap-3 p-4 rounded-lg border', COLORS[color])}>
      <span className="text-xl">{emoji}</span>
      <p className="text-dark-200 flex-1">{text}</p>
    </div>
  );
}

export function CalloutBlockEditor({ block, onUpdate, onBlur }: {
  block: CalloutBlockType;
  onUpdate: (data: Partial<CalloutBlockType['data']>) => void;
  onBlur: () => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [showPicker, setShowPicker] = useState(false);
  const { emoji = '💡', color = 'blue' } = block.data;

  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div className={cn('flex gap-3 p-4 rounded-lg border', COLORS[color])}>
      <div className="relative">
        <button onClick={() => setShowPicker(!showPicker)} className="text-xl hover:bg-dark-700 rounded p-1">
          {emoji}
        </button>
        {showPicker && (
          <div className="absolute top-full left-0 mt-1 p-2 bg-dark-800 rounded-lg border border-dark-700 shadow-xl z-10">
            <div className="grid grid-cols-4 gap-1">
              {EMOJIS.map((e) => (
                <button key={e} onClick={() => { onUpdate({ emoji: e }); setShowPicker(false); }} className="text-xl p-1 hover:bg-dark-700 rounded">{e}</button>
              ))}
            </div>
            <div className="flex gap-1 mt-2 pt-2 border-t border-dark-700">
              {(Object.keys(COLORS) as Array<keyof typeof COLORS>).map((c) => (
                <button key={c} onClick={() => { onUpdate({ color: c }); setShowPicker(false); }}
                  className={cn('w-5 h-5 rounded-full border-2', c === color ? 'border-white' : 'border-transparent',
                    c === 'blue' && 'bg-blue-500', c === 'green' && 'bg-green-500', c === 'yellow' && 'bg-yellow-500',
                    c === 'red' && 'bg-red-500', c === 'purple' && 'bg-purple-500', c === 'gray' && 'bg-gray-500'
                  )} />
              ))}
            </div>
          </div>
        )}
      </div>
      <textarea ref={ref} defaultValue={block.data.text} onChange={(e) => onUpdate({ text: e.target.value })} onBlur={onBlur}
        placeholder="Callout içeriği..." className="flex-1 bg-transparent border-none outline-none resize-none text-dark-200" rows={1} />
    </div>
  );
}
