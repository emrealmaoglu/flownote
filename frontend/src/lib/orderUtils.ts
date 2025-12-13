/**
 * Order Utility Functions
 * Fractional indexing for drag & drop reordering
 * Sprint 2 - Drag & Drop Block Management
 */

/**
 * Calculate new order value between two positions
 * Uses fractional indexing to avoid reindexing all items
 */
export function calculateNewOrder(
    beforeOrder: number | null,
    afterOrder: number | null
): number {
    const BASE_GAP = 1000;

    // First item in empty list
    if (beforeOrder === null && afterOrder === null) {
        return BASE_GAP;
    }

    // Insert at beginning
    if (beforeOrder === null && afterOrder !== null) {
        return afterOrder / 2;
    }

    // Insert at end
    if (beforeOrder !== null && afterOrder === null) {
        return beforeOrder + BASE_GAP;
    }

    // Insert between two items
    return (beforeOrder! + afterOrder!) / 2;
}

/**
 * Check if reindexing is needed (when gap gets too small)
 * Threshold: 0.001
 */
export function needsReindex(orders: number[]): boolean {
    if (orders.length < 2) return false;

    const sorted = [...orders].sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] - sorted[i - 1] < 0.001) {
            return true;
        }
    }
    return false;
}

/**
 * Reindex all orders with fresh gaps
 */
export function reindexOrders(count: number): number[] {
    const BASE_GAP = 1000;
    return Array.from({ length: count }, (_, i) => (i + 1) * BASE_GAP);
}

/**
 * Get order value for a specific position in list
 */
export function getOrderForPosition(
    items: { order: number }[],
    newIndex: number
): number {
    const sorted = [...items].sort((a, b) => a.order - b.order);

    // Insert at beginning
    if (newIndex === 0) {
        const firstOrder = sorted[0]?.order ?? 1000;
        return firstOrder / 2;
    }

    // Insert at end
    if (newIndex >= sorted.length) {
        const lastOrder = sorted[sorted.length - 1]?.order ?? 0;
        return lastOrder + 1000;
    }

    // Insert between
    const before = sorted[newIndex - 1].order;
    const after = sorted[newIndex].order;
    return (before + after) / 2;
}
