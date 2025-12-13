import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../lib/utils';
import { DragHandle } from './DragHandle';
import type { Block } from '../../types';
import { BlockRenderer } from './BlockRenderer';

interface DraggableBlockProps {
    block: Block;
    id: string;
}

/**
 * DraggableBlock Component
 * Sprint 2 - Wraps BlockRenderer with drag functionality
 */
export function DraggableBlock({ block, id }: DraggableBlockProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'group relative flex items-start gap-2',
                'rounded-lg transition-colors',
                isDragging && 'opacity-50 bg-dark-800 shadow-lg z-50',
                !isDragging && 'hover:bg-dark-800/50'
            )}
        >
            {/* Drag Handle */}
            <div className="flex-shrink-0 mt-2">
                <DragHandle listeners={listeners} attributes={attributes} />
            </div>

            {/* Block Content */}
            <div className="flex-1 min-w-0">
                <BlockRenderer block={block} />
            </div>
        </div>
    );
}

export default DraggableBlock;
