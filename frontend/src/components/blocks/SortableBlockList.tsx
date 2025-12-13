import { useState, useCallback } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { DraggableBlock } from './DraggableBlock';
import { getOrderForPosition } from '../../lib/orderUtils';
import type { Block } from '../../types';

interface SortableBlockListProps {
    blocks: Block[];
    onReorder?: (blockId: string, newOrder: number, reorderedBlocks: Block[]) => void;
    className?: string;
}

/**
 * SortableBlockList Component
 * Sprint 2 - Drag & Drop Block Management
 * Wraps blocks with DndContext for reordering
 */
export function SortableBlockList({ blocks, onReorder, className }: SortableBlockListProps) {
    const [items, setItems] = useState(blocks);

    // Update items when blocks prop changes
    if (blocks !== items && blocks.length !== items.length) {
        setItems(blocks);
    }

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Prevent accidental drags
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;

            if (over && active.id !== over.id) {
                setItems((currentItems) => {
                    const oldIndex = currentItems.findIndex((item) => item.id === active.id);
                    const newIndex = currentItems.findIndex((item) => item.id === over.id);

                    const reorderedItems = arrayMove(currentItems, oldIndex, newIndex);

                    // Calculate new order for the moved block
                    const newOrder = getOrderForPosition(
                        reorderedItems.filter((_, i) => i !== newIndex),
                        newIndex
                    );

                    // Update the order in the reordered array
                    const updatedItems = reorderedItems.map((item, index) => {
                        if (index === newIndex) {
                            return { ...item, order: newOrder };
                        }
                        return item;
                    });

                    // Notify parent about the reorder
                    if (onReorder) {
                        onReorder(active.id as string, newOrder, updatedItems);
                    }

                    return updatedItems;
                });
            }
        },
        [onReorder]
    );

    // Sort items by order for display
    const sortedItems = [...items].sort((a, b) => a.order - b.order);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={sortedItems.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className={className}>
                    {sortedItems.map((block) => (
                        <DraggableBlock key={block.id} id={block.id} block={block} />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}

export default SortableBlockList;
