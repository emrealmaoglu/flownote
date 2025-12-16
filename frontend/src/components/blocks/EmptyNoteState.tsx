import { FileText, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { BlockType } from '../../types';

interface EmptyNoteStateProps {
    onAddBlock: (type: BlockType) => void;
    className?: string;
}

/**
 * EmptyNoteState Component
 * Sprint 7.5 - Shown when a note has no blocks
 */
export function EmptyNoteState({ onAddBlock, className }: EmptyNoteStateProps) {
    return (
        <div className={cn(
            'text-center py-16',
            'border-2 border-dashed border-dark-700 rounded-xl',
            'bg-dark-900/50',
            className
        )}>
            <FileText className="w-12 h-12 mx-auto text-dark-500 mb-4" />
            <h3 className="text-lg font-medium text-dark-300 mb-2">
                Bu not boş
            </h3>
            <p className="text-dark-500 mb-6 max-w-xs mx-auto">
                İçerik ekleyerek notunuzu zenginleştirin
            </p>
            <button
                onClick={() => onAddBlock('text')}
                className={cn(
                    'inline-flex items-center gap-2 px-4 py-2',
                    'bg-primary-600 hover:bg-primary-500 text-white',
                    'rounded-lg font-medium transition-colors'
                )}
            >
                <Plus className="w-4 h-4" />
                İlk Bloğu Ekle
            </button>
        </div>
    );
}

export default EmptyNoteState;
