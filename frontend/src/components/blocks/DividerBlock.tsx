import { cn } from '../../lib/utils';

export function DividerBlock() {
  return (
    <div className="py-3">
      <hr className={cn('border-0 h-px bg-dark-700')} />
    </div>
  );
}

export function DividerBlockEditor({ onBlur }: { onBlur: () => void }) {
  return (
    <div className="py-3 cursor-pointer" onClick={onBlur} tabIndex={0}>
      <hr className={cn('border-0 h-px bg-dark-600 hover:bg-dark-500 transition-colors')} />
    </div>
  );
}
