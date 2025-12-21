import type { SyncQueueItem, SyncEntity } from './types';
import { LocalStorageAdapter } from './storage-adapter';

export class OfflineQueue {
  private queue: SyncQueueItem[] = [];
  private storage: LocalStorageAdapter;
  private readonly QUEUE_KEY = 'sync:queue';

  constructor() {
    this.storage = new LocalStorageAdapter();
    this.loadQueue();
  }

  /**
   * Add operation to queue
   */
  async enqueue(entity: SyncEntity): Promise<void> {
    const item: SyncQueueItem = {
      ...entity,
      retryCount: 0,
      maxRetries: 3,
    };

    this.queue.push(item);
    await this.saveQueue();

    console.log(
      `📥 Queued ${entity.operation} operation for ${entity.type}:${entity.id}`
    );
  }

  /**
   * Get next item from queue
   */
  dequeue(): SyncQueueItem | null {
    return this.queue.shift() || null;
  }

  /**
   * Peek at queue without removing
   */
  peek(): SyncQueueItem | null {
    return this.queue[0] || null;
  }

  /**
   * Get all items in queue
   */
  getAll(): SyncQueueItem[] {
    return [...this.queue];
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Clear all items
   */
  async clear(): Promise<void> {
    this.queue = [];
    await this.saveQueue();
  }

  /**
   * Remove specific item
   */
  async remove(itemId: string): Promise<void> {
    this.queue = this.queue.filter((item) => item.id !== itemId);
    await this.saveQueue();
  }

  /**
   * Mark item as failed and retry
   */
  async retry(item: SyncQueueItem, error: string): Promise<boolean> {
    item.retryCount++;
    item.error = error;

    if (item.retryCount < item.maxRetries) {
      // Re-add to end of queue
      this.queue.push(item);
      await this.saveQueue();
      console.log(
        `🔄 Retry ${item.retryCount}/${item.maxRetries} for ${item.type}:${item.id}`
      );
      return true;
    } else {
      console.error(
        `❌ Max retries reached for ${item.type}:${item.id}`,
        error
      );
      return false;
    }
  }

  /**
   * Load queue from storage
   */
  private async loadQueue(): Promise<void> {
    try {
      const saved = await this.storage.get(this.QUEUE_KEY);
      if (saved && Array.isArray(saved)) {
        this.queue = saved;
        console.log(`📂 Loaded ${this.queue.length} items from queue`);
      }
    } catch (error) {
      console.error('Failed to load queue:', error);
    }
  }

  /**
   * Save queue to storage
   */
  private async saveQueue(): Promise<void> {
    try {
      await this.storage.set(this.QUEUE_KEY, this.queue);
    } catch (error) {
      console.error('Failed to save queue:', error);
    }
  }
}
