/**
 * @flownote/sync
 *
 * Sprint 14.2.2 - Sync Engine Package
 * Provides bidirectional synchronization between localStorage and database
 */

// Export main sync manager
export { SyncManager } from './sync-manager';

// Export components
export { ConflictResolver } from './conflict-resolver';
export { OfflineQueue } from './offline-queue';
export { LocalStorageAdapter } from './storage-adapter';
export { IndexedDBAdapter } from './storage-adapter';
export type { ILogger } from './logger';
export { ConsoleLogger, NoopLogger } from './logger';

// Export types
export type {
  SyncConfig,
  SyncState,
  SyncEntity,
  SyncQueueItem,
  SyncConflict,
  SyncEvent,
  SyncEventListener,
  SyncOperation,
  SyncStatus,
  SyncDirection,
  ConflictStrategy,
  StorageAdapter,
} from './types';
