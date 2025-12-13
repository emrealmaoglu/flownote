import { GripVertical } from 'lucide-react';
import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { cn } from '../../lib/utils';

interface DragHandleProps {
    listeners?: SyntheticListenerMap;
    attributes?: DraggableAttributes;
    className?: string;
}

/**
 * DragHandle Component
 * Sprint 2 - Drag & Drop Block Management
 * Grip icon for initiating drag operations
 */
export function DragHandle({ listeners, attributes, className }: DragHandleProps) {
    return (
        <button
            type="button"
            className={cn(
                'p-1 cursor-grab active:cursor-grabbing',
                'text-dark-500 hover:text-dark-300',
                'opacity-0 group-hover:opacity-100 transition-opacity',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 rounded',
                className
            )}
            {...listeners}
            {...attributes}
        >
            <GripVertical className="w-4 h-4" />
        </button>
    );
}

export default DragHandle;
