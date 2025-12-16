import { Loader2, Check, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { SaveStatus } from '../../hooks/useAutoSave';

interface SaveStatusIndicatorProps {
    status: SaveStatus;
}

/**
 * Save Status Indicator Component
 * Shows saving, saved, or error state
 */
export function SaveStatusIndicator({ status }: SaveStatusIndicatorProps) {
    if (status === 'idle') return null;

    return (
        <div className={cn(
            'flex items-center gap-1 px-2 py-1 rounded text-xs',
            status === 'saving' && 'text-dark-400',
            status === 'saved' && 'text-green-400',
            status === 'error' && 'text-red-400',
        )}>
            {status === 'saving' && (
                <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Kaydediliyor...</span>
                </>
            )}
            {status === 'saved' && (
                <>
                    <Check className="w-3 h-3" />
                    <span>Kaydedildi</span>
                </>
            )}
            {status === 'error' && (
                <>
                    <AlertCircle className="w-3 h-3" />
                    <span>Hata!</span>
                </>
            )}
        </div>
    );
}

export default SaveStatusIndicator;
