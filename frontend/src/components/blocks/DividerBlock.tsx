import { cn } from '../../lib/utils';

/**
 * DividerBlock Component
 * Sprint 12 - Simple horizontal divider
 * Notion style: thin gray line with margin
 */
export function DividerBlock() {
    return (
        <div className="py-3">
            <hr
                className={cn(
                    'border-0 h-px',
                    'bg-dark-700',
                    'my-1'
                )}
            />
        </div>
    );
}

/**
 * DividerBlockEditor - Edit mode (sadece görsel)
 */
export function DividerBlockEditor({ onBlur }: { onBlur: () => void }) {
    return (
        <div
            className="py-3 cursor-pointer group"
            onClick={onBlur}
            onKeyDown={(e) => e.key === 'Enter' && onBlur()}
            tabIndex={0}
        >
            <hr
                className={cn(
                    'border-0 h-px',
                    'bg-dark-600 group-hover:bg-dark-500',
                    'transition-colors'
                )}
            />
        </div>
    );
}

export default DividerBlock;
