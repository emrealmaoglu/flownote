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
import { ILogger, ConsoleLogger } from './logger';
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
  private logger: ILogger;

  constructor(
    userId: string,
    config: Partial<SyncConfig> = {},
    storage?: StorageAdapter,
    logger?: ILogger
  ) {
    this.userId = userId;
    this.logger = logger || new ConsoleLogger('SyncManager');
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

    this.storage = storage || new LocalStorageAdapter('flownote', this.logger);
    this.conflictResolver = new ConflictResolver(this.config.conflictStrategy);
    this.offlineQueue = new OfflineQueue(this.logger);

    this.setupOnlineDetection();
  }

  /**
   * Initialize sync manager and start auto-sync if enabled
   */
  async initialize(): Promise<void> {
    this.logger.log('Initializing Sync Manager...', { userId: this.userId });

    // Load pending operations from queue
    this.state.pendingOperations = this.offlineQueue.size();

    // Start auto-sync if enabled
    if (this.config.autoSync && this.config.enabled) {
      this.startAutoSync();
    }

    this.logger.log('Sync Manager initialized', {
      autoSync: this.config.autoSync,
      syncInterval: this.config.syncInterval,
      pendingOperations: this.state.pendingOperations,
    });
  }

  /**
   * Start automatic synchronization
   */
  startAutoSync(): void {
    if (this.syncIntervalId) {
      this.logger.warn('Auto-sync already running');
      return;
    }

    this.logger.log('Starting auto-sync', { interval: this.config.syncInterval });

    this.syncIntervalId = setInterval(() => {
      this.sync().catch((error) => {
        this.logger.error('Auto-sync failed', error instanceof Error ? error : new Error(String(error)));
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
      this.logger.log('Auto-sync stopped');
    }
  }

  /**
   * Main synchronization method
   */
  async sync(): Promise<void> {
    if (!this.config.enabled) {
      this.logger.warn('Sync is disabled');
      return;
    }

    if (this.state.status === 'syncing') {
      this.logger.warn('Sync already in progress');
      return;
    }

    if (!this.isOnline && !this.config.offlineMode) {
      this.logger.warn('Offline - queueing operations');
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
      this.logger.log('Sync completed', { duration, pendingOperations: this.state.pendingOperations });
      this.emitEvent({ type: 'sync_completed', duration });
    } catch (error) {
      this.state.status = 'error';
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.state.errors.push(errorMessage);
      this.logger.error('Sync failed', error instanceof Error ? error : new Error(errorMessage));
      this.emitEvent({ type: 'sync_error', error: errorMessage });
    }
  }

  /**
   * Sync localStorage to database
   */
  private async syncLocalStorageToDb(): Promise<void> {
    this.logger.debug('Syncing localStorage → Database');

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
                } as any,
              });
              this.logger.debug('Folder updated in database', { folderId: id });
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
            } as any,
          });
          this.logger.debug('Folder created in database', { folderId: id });
        }
      } catch (error) {
        this.logger.error('Failed to sync folder to database', error instanceof Error ? error : new Error(String(error)), { folderId: id });
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
                } as any,
              });
              this.logger.debug('Note updated in database', { noteId: id });
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
            } as any,
          });
          this.logger.debug('Note created in database', { noteId: id });
        }
      } catch (error) {
        this.logger.error('Failed to sync note to database', error instanceof Error ? error : new Error(String(error)), { noteId: id });
      }
    }
  }

  /**
   * Sync database to localStorage
   */
  private async syncDbToLocalStorage(): Promise<void> {
    this.logger.debug('Syncing Database → localStorage');

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
              this.logger.debug('Folder updated in localStorage', { folderId: folder.id });
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
          this.logger.debug('Folder created in localStorage', { folderId: folder.id });
        }
      } catch (error) {
        this.logger.error('Failed to sync folder to localStorage', error instanceof Error ? error : new Error(String(error)), { folderId: folder.id });
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
                color: (note as any).color, // Legacy field
                icon: (note as any).icon, // Legacy field
                coverImage: (note as any).coverImage, // Legacy field
                isFavorite: note.isFavorite,
                createdAt: note.createdAt.toISOString(),
                updatedAt: note.updatedAt.toISOString(),
              });
              this.logger.debug('Note updated in localStorage', { noteId: note.id });
            }
          }
        } else {
          // Create in localStorage
          await this.storage.set(`notes:${note.id}`, {
            id: note.id,
            title: note.title,
            content: note.content,
            folderId: note.folderId,
            color: (note as any).color, // Legacy field
            icon: (note as any).icon, // Legacy field
            coverImage: (note as any).coverImage, // Legacy field
            isFavorite: note.isFavorite,
            createdAt: note.createdAt.toISOString(),
            updatedAt: note.updatedAt.toISOString(),
          });
          this.logger.debug('Note created in localStorage', { noteId: note.id });
        }
      } catch (error) {
        this.logger.error('Failed to sync note to localStorage', error instanceof Error ? error : new Error(String(error)), { noteId: note.id });
      }
    }
  }

  /**
   * Process offline queue
   */
  private async processOfflineQueue(): Promise<void> {
    const queueSize = this.offlineQueue.size();
    if (queueSize === 0) return;

    this.logger.log('Processing offline queue', { queueSize });

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
          this.logger.error('Failed to process queue item', error instanceof Error ? error : new Error(errorMessage), {
            entityType: item.type,
            entityId: item.id,
          });
        }
      }

      item = this.offlineQueue.dequeue();
    }

    this.logger.log('Offline queue processed', { processed, total: queueSize });
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
          ...(entity.data as any),
          userId: this.userId,
        },
      });
    } else if (entity.type === 'folder') {
      await prisma.folder.create({
        data: {
          ...(entity.data as any),
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
        data: entity.data as any,
      });
    } else if (entity.type === 'folder') {
      await prisma.folder.update({
        where: { id: entity.id },
        data: entity.data as any,
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
    this.logger.warn('Conflict detected', {
      entityType: conflict.entityType,
      entityId: conflict.entityId,
      localTimestamp: conflict.localTimestamp,
      serverTimestamp: conflict.serverTimestamp,
    });

    this.state.conflicts.push(conflict);
    this.emitEvent({ type: 'conflict_detected', conflict });

    const resolution = this.conflictResolver.resolve(conflict);

    if (resolution.resolved) {
      this.logger.log('Conflict resolved', {
        entityId: conflict.entityId,
        action: resolution.action,
        strategy: this.config.conflictStrategy,
      });

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
            data: conflict.localData as any,
          });
        } else {
          await prisma.folder.update({
            where: { id: conflict.entityId },
            data: conflict.localData as any,
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
      this.logger.warn('Manual conflict resolution required', { entityId: conflict.entityId });
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
        this.logger.error('Error in event listener', error instanceof Error ? error : new Error(String(error)));
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
        this.logger.log('Connection restored');
        this.emitEvent({ type: 'online_detected' });

        // Trigger sync when coming back online
        if (this.config.enabled) {
          this.sync().catch((error) => {
            this.logger.error('Sync error after reconnection', error instanceof Error ? error : new Error(String(error)));
          });
        }
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.logger.warn('Connection lost');
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
    this.logger.log('Sync Manager destroyed');
  }
}
