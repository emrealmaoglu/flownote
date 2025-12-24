import type {
  SyncConfig,
  SyncState,
  SyncEntity,
  SyncConflict,
  SyncEvent,
  SyncEventListener,
  StorageAdapter,
  BaseSyncData,
} from './types';
import { LocalStorageAdapter } from './storage-adapter';
import { ConflictResolver } from './conflict-resolver';
import { OfflineQueue } from './offline-queue';
import { prisma } from '@flownote/database';

export class SyncManager {
  private config: SyncConfig;
  private state: SyncState;
  private storage: StorageAdapter;
  private conflictResolver: ConflictResolver;
  private offlineQueue: OfflineQueue;
  private eventListeners: SyncEventListener[] = [];
  private syncIntervalId: NodeJS.Timeout | null = null;
  private isOnline: boolean = true;
  private userId: string;

  constructor(
    userId: string,
    config: Partial<SyncConfig> = {},
    storage?: StorageAdapter
  ) {
    this.userId = userId;
    this.config = {
      enabled: true,
      autoSync: true,
      syncInterval: 30000, // 30 seconds
      conflictStrategy: 'last_write_wins',
      offlineMode: false,
      batchSize: 50,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    };

    this.state = {
      status: 'idle',
      lastSyncAt: null,
      pendingOperations: 0,
      conflicts: [],
      errors: [],
    };

    this.storage = storage || new LocalStorageAdapter();
    this.conflictResolver = new ConflictResolver(this.config.conflictStrategy);
    this.offlineQueue = new OfflineQueue();

    this.setupOnlineDetection();
  }

  /**
   * Initialize sync manager and start auto-sync if enabled
   */
  async initialize(): Promise<void> {
    console.log('🔄 Initializing Sync Manager...');

    // Load pending operations from queue
    this.state.pendingOperations = this.offlineQueue.size();

    // Start auto-sync if enabled
    if (this.config.autoSync && this.config.enabled) {
      this.startAutoSync();
    }

    console.log('✅ Sync Manager initialized');
  }

  /**
   * Start automatic synchronization
   */
  startAutoSync(): void {
    if (this.syncIntervalId) {
      console.log('⚠️ Auto-sync already running');
      return;
    }

    console.log(
      `🔄 Starting auto-sync (interval: ${this.config.syncInterval}ms)`
    );

    this.syncIntervalId = setInterval(() => {
      this.sync().catch((error) => {
        console.error('Auto-sync error:', error);
      });
    }, this.config.syncInterval);
  }

  /**
   * Stop automatic synchronization
   */
  stopAutoSync(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
      console.log('⏹️ Auto-sync stopped');
    }
  }

  /**
   * Main synchronization method
   */
  async sync(): Promise<void> {
    if (!this.config.enabled) {
      console.log('⚠️ Sync is disabled');
      return;
    }

    if (this.state.status === 'syncing') {
      console.log('⚠️ Sync already in progress');
      return;
    }

    if (!this.isOnline && !this.config.offlineMode) {
      console.log('⚠️ Offline - queueing operations');
      this.emitEvent({ type: 'offline_detected' });
      return;
    }

    const startTime = Date.now();
    this.state.status = 'syncing';
    this.emitEvent({ type: 'sync_started' });

    try {
      // Process offline queue first
      await this.processOfflineQueue();

      // Sync localStorage to database
      await this.syncLocalStorageToDb();

      // Sync database to localStorage
      await this.syncDbToLocalStorage();

      // Update state
      this.state.status = 'idle';
      this.state.lastSyncAt = Date.now();
      this.state.pendingOperations = this.offlineQueue.size();

      const duration = Date.now() - startTime;
      console.log(`✅ Sync completed in ${duration}ms`);
      this.emitEvent({ type: 'sync_completed', duration });
    } catch (error) {
      this.state.status = 'error';
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.state.errors.push(errorMessage);
      console.error('❌ Sync error:', error);
      this.emitEvent({ type: 'sync_error', error: errorMessage });
    }
  }

  /**
   * Sync localStorage to database
   */
  private async syncLocalStorageToDb(): Promise<void> {
    console.log('📤 Syncing localStorage → Database');

    // Get all notes and folders from localStorage
    const notes = await this.storage.getAll('notes') as Record<string, BaseSyncData>;
    const folders = await this.storage.getAll('folders') as Record<string, BaseSyncData>;

    // Sync folders first (to maintain hierarchy)
    for (const [id, folderData] of Object.entries(folders)) {
      try {
        const existing = await prisma.folder.findUnique({
          where: { id },
        });

        if (existing) {
          // Check for conflicts
          const conflict = this.detectConflict(
            id,
            'folder',
            folderData,
            existing
          );

          if (conflict) {
            await this.handleConflict(conflict);
          } else {
            // Update if local is newer
            if (
              new Date(folderData.updatedAt) > new Date(existing.updatedAt)
            ) {
              await prisma.folder.update({
                where: { id },
                data: {
                  name: folderData.name,
                  parentId: folderData.parentId,
                  color: folderData.color,
                  icon: folderData.icon,
                  position: folderData.position,
                  updatedAt: new Date(folderData.updatedAt),
                },
              });
            }
          }
        } else {
          // Create new folder
          await prisma.folder.create({
            data: {
              id,
              name: folderData.name,
              parentId: folderData.parentId,
              color: folderData.color,
              icon: folderData.icon,
              position: folderData.position,
              userId: this.userId,
              createdAt: new Date(folderData.createdAt),
              updatedAt: new Date(folderData.updatedAt),
            },
          });
        }
      } catch (error) {
        console.error(`Failed to sync folder ${id}:`, error);
      }
    }

    // Sync notes
    for (const [id, noteData] of Object.entries(notes)) {
      try {
        const existing = await prisma.note.findUnique({
          where: { id },
        });

        if (existing) {
          // Check for conflicts
          const conflict = this.detectConflict(id, 'note', noteData, existing);

          if (conflict) {
            await this.handleConflict(conflict);
          } else {
            // Update if local is newer
            if (new Date(noteData.updatedAt) > new Date(existing.updatedAt)) {
              await prisma.note.update({
                where: { id },
                data: {
                  title: noteData.title,
                  content: noteData.content,
                  folderId: noteData.folderId,
                  color: noteData.color,
                  icon: noteData.icon,
                  coverImage: noteData.coverImage,
                  isFavorite: noteData.isFavorite,
                  updatedAt: new Date(noteData.updatedAt),
                },
              });
            }
          }
        } else {
          // Create new note
          await prisma.note.create({
            data: {
              id,
              title: noteData.title,
              content: noteData.content,
              folderId: noteData.folderId,
              color: noteData.color,
              icon: noteData.icon,
              coverImage: noteData.coverImage,
              isFavorite: noteData.isFavorite,
              userId: this.userId,
              createdAt: new Date(noteData.createdAt),
              updatedAt: new Date(noteData.updatedAt),
            },
          });
        }
      } catch (error) {
        console.error(`Failed to sync note ${id}:`, error);
      }
    }
  }

  /**
   * Sync database to localStorage
   */
  private async syncDbToLocalStorage(): Promise<void> {
    console.log('📥 Syncing Database → localStorage');

    // Get all folders and notes from database
    const folders = await prisma.folder.findMany({
      where: { userId: this.userId },
    });

    const notes = await prisma.note.findMany({
      where: { userId: this.userId },
    });

    // Sync folders
    for (const folder of folders) {
      try {
        const localData = await this.storage.get(`folders:${folder.id}`) as BaseSyncData | null;

        if (localData) {
          // Check for conflicts
          const conflict = this.detectConflict(
            folder.id,
            'folder',
            localData,
            folder
          );

          if (conflict) {
            await this.handleConflict(conflict);
          } else {
            // Update if server is newer
            if (
              new Date(folder.updatedAt) > new Date(localData.updatedAt)
            ) {
              await this.storage.set(`folders:${folder.id}`, {
                id: folder.id,
                name: folder.name,
                parentId: folder.parentId,
                color: folder.color,
                icon: folder.icon,
                position: folder.position,
                createdAt: folder.createdAt.toISOString(),
                updatedAt: folder.updatedAt.toISOString(),
              });
            }
          }
        } else {
          // Create in localStorage
          await this.storage.set(`folders:${folder.id}`, {
            id: folder.id,
            name: folder.name,
            parentId: folder.parentId,
            color: folder.color,
            icon: folder.icon,
            position: folder.position,
            createdAt: folder.createdAt.toISOString(),
            updatedAt: folder.updatedAt.toISOString(),
          });
        }
      } catch (error) {
        console.error(`Failed to sync folder ${folder.id} to localStorage:`, error);
      }
    }

    // Sync notes
    for (const note of notes) {
      try {
        const localData = await this.storage.get(`notes:${note.id}`) as BaseSyncData | null;

        if (localData) {
          // Check for conflicts
          const conflict = this.detectConflict(
            note.id,
            'note',
            localData,
            note
          );

          if (conflict) {
            await this.handleConflict(conflict);
          } else {
            // Update if server is newer
            if (
              new Date(note.updatedAt) > new Date(localData.updatedAt)
            ) {
              await this.storage.set(`notes:${note.id}`, {
                id: note.id,
                title: note.title,
                content: note.content,
                folderId: note.folderId,
                color: note.color,
                icon: note.icon,
                coverImage: note.coverImage,
                isFavorite: note.isFavorite,
                createdAt: note.createdAt.toISOString(),
                updatedAt: note.updatedAt.toISOString(),
              });
            }
          }
        } else {
          // Create in localStorage
          await this.storage.set(`notes:${note.id}`, {
            id: note.id,
            title: note.title,
            content: note.content,
            folderId: note.folderId,
            color: note.color,
            icon: note.icon,
            coverImage: note.coverImage,
            isFavorite: note.isFavorite,
            createdAt: note.createdAt.toISOString(),
            updatedAt: note.updatedAt.toISOString(),
          });
        }
      } catch (error) {
        console.error(`Failed to sync note ${note.id} to localStorage:`, error);
      }
    }
  }

  /**
   * Process offline queue
   */
  private async processOfflineQueue(): Promise<void> {
    const queueSize = this.offlineQueue.size();
    if (queueSize === 0) return;

    console.log(`📦 Processing ${queueSize} queued operations`);

    let processed = 0;
    let item = this.offlineQueue.dequeue();

    while (item) {
      try {
        await this.processSyncEntity(item);
        await this.offlineQueue.remove(item.id);
        processed++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        const retry = await this.offlineQueue.retry(item, errorMessage);
        if (!retry) {
          console.error(`Failed to process ${item.type}:${item.id}`, error);
        }
      }

      item = this.offlineQueue.dequeue();
    }

    console.log(`✅ Processed ${processed}/${queueSize} operations`);
    this.emitEvent({ type: 'queue_processed', processed });
  }

  /**
   * Process a single sync entity
   */
  private async processSyncEntity(entity: SyncEntity): Promise<void> {
    switch (entity.operation) {
      case 'create':
        await this.handleCreate(entity);
        break;
      case 'update':
        await this.handleUpdate(entity);
        break;
      case 'delete':
        await this.handleDelete(entity);
        break;
      case 'move':
        await this.handleMove(entity);
        break;
    }
  }

  /**
   * Handle create operation
   */
  private async handleCreate(entity: SyncEntity): Promise<void> {
    if (entity.type === 'note') {
      await prisma.note.create({
        data: {
          ...entity.data,
          userId: this.userId,
        },
      });
    } else if (entity.type === 'folder') {
      await prisma.folder.create({
        data: {
          ...entity.data,
          userId: this.userId,
        },
      });
    }
  }

  /**
   * Handle update operation
   */
  private async handleUpdate(entity: SyncEntity): Promise<void> {
    if (entity.type === 'note') {
      await prisma.note.update({
        where: { id: entity.id },
        data: entity.data,
      });
    } else if (entity.type === 'folder') {
      await prisma.folder.update({
        where: { id: entity.id },
        data: entity.data,
      });
    }
  }

  /**
   * Handle delete operation
   */
  private async handleDelete(entity: SyncEntity): Promise<void> {
    if (entity.type === 'note') {
      await prisma.note.delete({
        where: { id: entity.id },
      });
    } else if (entity.type === 'folder') {
      await prisma.folder.delete({
        where: { id: entity.id },
      });
    }
  }

  /**
   * Handle move operation
   */
  private async handleMove(entity: SyncEntity): Promise<void> {
    if (entity.type === 'note') {
      await prisma.note.update({
        where: { id: entity.id },
        data: {
          folderId: entity.data.folderId,
        },
      });
    } else if (entity.type === 'folder') {
      await prisma.folder.update({
        where: { id: entity.id },
        data: {
          parentId: entity.data.parentId,
        },
      });
    }
  }

  /**
   * Detect conflict between local and server data
   */
  private detectConflict(
    entityId: string,
    entityType: 'note' | 'folder',
    localData: BaseSyncData,
    serverData: BaseSyncData
  ): SyncConflict | null {
    const localTimestamp = new Date(localData.updatedAt).getTime();
    const serverTimestamp = new Date(serverData.updatedAt).getTime();

    // No conflict if timestamps match
    if (localTimestamp === serverTimestamp) {
      return null;
    }

    // Check if both were modified independently
    const timeDiff = Math.abs(localTimestamp - serverTimestamp);
    const conflictThreshold = 5000; // 5 seconds

    if (timeDiff < conflictThreshold) {
      return null; // Too close, likely same update
    }

    return {
      entityId,
      entityType,
      localData,
      serverData,
      localTimestamp,
      serverTimestamp,
    };
  }

  /**
   * Handle sync conflict
   */
  private async handleConflict(conflict: SyncConflict): Promise<void> {
    console.log(`⚠️ Conflict detected for ${conflict.entityType}:${conflict.entityId}`);

    this.state.conflicts.push(conflict);
    this.emitEvent({ type: 'conflict_detected', conflict });

    const resolution = this.conflictResolver.resolve(conflict);

    if (resolution.resolved) {
      console.log(`✅ Conflict resolved using strategy: ${resolution.action}`);

      if (resolution.action === 'use_server') {
        // Update localStorage with server data
        await this.storage.set(
          `${conflict.entityType}s:${conflict.entityId}`,
          conflict.serverData
        );
      } else if (resolution.action === 'use_local') {
        // Update database with local data
        if (conflict.entityType === 'note') {
          await prisma.note.update({
            where: { id: conflict.entityId },
            data: conflict.localData,
          });
        } else {
          await prisma.folder.update({
            where: { id: conflict.entityId },
            data: conflict.localData,
          });
        }
      } else if (resolution.action === 'merge') {
        // Keep both versions
        // Server version stays as is
        // Local version gets new ID
        // Implementation depends on requirements
      }

      // Remove from conflicts list
      this.state.conflicts = this.state.conflicts.filter(
        (c) => c.entityId !== conflict.entityId
      );

      this.emitEvent({ type: 'conflict_resolved', entityId: conflict.entityId });
    } else {
      console.log('⏸️ Manual conflict resolution required');
    }
  }

  /**
   * Queue operation for offline sync
   */
  async queueOperation(entity: SyncEntity): Promise<void> {
    await this.offlineQueue.enqueue(entity);
    this.state.pendingOperations = this.offlineQueue.size();
  }

  /**
   * Get current sync state
   */
  getState(): SyncState {
    return { ...this.state };
  }

  /**
   * Get current config
   */
  getConfig(): SyncConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...config };

    if (config.conflictStrategy) {
      this.conflictResolver.setStrategy(config.conflictStrategy);
    }

    if (config.autoSync !== undefined) {
      if (config.autoSync) {
        this.startAutoSync();
      } else {
        this.stopAutoSync();
      }
    }
  }

  /**
   * Add event listener
   */
  addEventListener(listener: SyncEventListener): void {
    this.eventListeners.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: SyncEventListener): void {
    this.eventListeners = this.eventListeners.filter((l) => l !== listener);
  }

  /**
   * Emit sync event
   */
  private emitEvent(event: SyncEvent): void {
    this.eventListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }

  /**
   * Setup online/offline detection
   */
  private setupOnlineDetection(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        console.log('🌐 Connection restored');
        this.emitEvent({ type: 'online_detected' });

        // Trigger sync when coming back online
        if (this.config.enabled) {
          this.sync().catch((error) => {
            console.error('Sync error after reconnection:', error);
          });
        }
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        console.log('📡 Connection lost');
        this.emitEvent({ type: 'offline_detected' });
      });

      this.isOnline = navigator.onLine;
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopAutoSync();
    this.eventListeners = [];
    console.log('🧹 Sync Manager destroyed');
  }
}
