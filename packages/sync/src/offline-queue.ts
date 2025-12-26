import type { SyncQueueItem, SyncEntity } from './types';
import { LocalStorageAdapter } from './storage-adapter';
import { ILogger, ConsoleLogger } from './logger';

export class OfflineQueue {
  private queue: SyncQueueItem[] = [];
  private storage: LocalStorageAdapter;
  private logger: ILogger;
  private readonly QUEUE_KEY = 'sync:queue';

  constructor(logger?: ILogger) {
    // Create new ConsoleLogger if none provided
    const baseLogger = logger || new ConsoleLogger('OfflineQueue');
    this.logger = baseLogger;

    // Pass logger to storage adapter
    this.storage = new LocalStorageAdapter('flownote', baseLogger);
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

    this.logger.log('Queued operation', {
      operation: entity.operation,
      type: entity.type,
      id: entity.id
    });
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
      this.logger.log(`Retry attempt ${item.retryCount}/${item.maxRetries}`, {
        type: item.type,
        id: item.id
      });
      return true;
    } else {
      this.logger.error(
        `Max retries reached`,
        new Error(error),
        { type: item.type, id: item.id }
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
        this.logger.log(`Loaded queue items`, { count: this.queue.length });
      }
    } catch (error) {
      this.logger.error('Failed to load queue', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Save queue to storage
   */
  private async saveQueue(): Promise<void> {
    try {
      await this.storage.set(this.QUEUE_KEY, this.queue);
    } catch (error) {
      this.logger.error('Failed to save queue', error instanceof Error ? error : new Error(String(error)));
    }
  }
}
