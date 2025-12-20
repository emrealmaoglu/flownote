import type { Note, Folder } from '@flownote/database';

// ============================================
// SYNC OPERATION TYPES
// ============================================

export type SyncOperation = 'create' | 'update' | 'delete' | 'move';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

export type SyncDirection =
  | 'localStorage_to_db'
  | 'db_to_localStorage'
  | 'bidirectional';

export type ConflictStrategy =
  | 'last_write_wins'
  | 'manual'
  | 'keep_both'
  | 'server_wins'
  | 'client_wins';

// ============================================
// SYNC ENTITY TYPES
// ============================================

export interface SyncEntity {
  id: string;
  type: 'note' | 'folder';
  operation: SyncOperation;
  data: any;
  timestamp: number;
  localVersion?: number;
  serverVersion?: number;
}

export interface SyncQueueItem extends SyncEntity {
  retryCount: number;
  maxRetries: number;
  error?: string;
}

export interface SyncConflict {
  entityId: string;
  entityType: 'note' | 'folder';
  localData: any;
  serverData: any;
  localTimestamp: number;
  serverTimestamp: number;
}

// ============================================
// SYNC STATE
// ============================================

export interface SyncState {
  status: SyncStatus;
  lastSyncAt: number | null;
  pendingOperations: number;
  conflicts: SyncConflict[];
  errors: string[];
}

// ============================================
// SYNC CONFIGURATION
// ============================================

export interface SyncConfig {
  enabled: boolean;
  autoSync: boolean;
  syncInterval: number; // milliseconds
  conflictStrategy: ConflictStrategy;
  offlineMode: boolean;
  batchSize: number;
  retryAttempts: number;
  retryDelay: number;
}

// ============================================
// STORAGE ADAPTERS
// ============================================

export interface StorageAdapter {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
  getAll(prefix: string): Promise<Record<string, any>>;
  clear(): Promise<void>;
}

// ============================================
// SYNC EVENTS
// ============================================

export type SyncEvent =
  | { type: 'sync_started' }
  | { type: 'sync_completed'; duration: number }
  | { type: 'sync_error'; error: string }
  | { type: 'conflict_detected'; conflict: SyncConflict }
  | { type: 'conflict_resolved'; entityId: string }
  | { type: 'offline_detected' }
  | { type: 'online_detected' }
  | { type: 'queue_processed'; processed: number };

export type SyncEventListener = (event: SyncEvent) => void;
