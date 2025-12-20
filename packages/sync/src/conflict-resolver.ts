import type { SyncConflict, ConflictStrategy } from './types';

export class ConflictResolver {
  private strategy: ConflictStrategy;

  constructor(strategy: ConflictStrategy = 'last_write_wins') {
    this.strategy = strategy;
  }

  setStrategy(strategy: ConflictStrategy): void {
    this.strategy = strategy;
  }

  /**
   * Resolve a conflict between local and server data
   */
  resolve(conflict: SyncConflict): {
    resolved: boolean;
    data: any;
    action: 'use_local' | 'use_server' | 'merge' | 'manual';
  } {
    switch (this.strategy) {
      case 'last_write_wins':
        return this.lastWriteWins(conflict);

      case 'server_wins':
        return {
          resolved: true,
          data: conflict.serverData,
          action: 'use_server',
        };

      case 'client_wins':
        return {
          resolved: true,
          data: conflict.localData,
          action: 'use_local',
        };

      case 'keep_both':
        return this.keepBoth(conflict);

      case 'manual':
        return {
          resolved: false,
          data: null,
          action: 'manual',
        };

      default:
        return this.lastWriteWins(conflict);
    }
  }

  /**
   * Last write wins strategy
   */
  private lastWriteWins(conflict: SyncConflict): {
    resolved: boolean;
    data: any;
    action: 'use_local' | 'use_server';
  } {
    const useServer = conflict.serverTimestamp > conflict.localTimestamp;
    return {
      resolved: true,
      data: useServer ? conflict.serverData : conflict.localData,
      action: useServer ? 'use_server' : 'use_local',
    };
  }

  /**
   * Keep both strategy (create duplicate with suffix)
   */
  private keepBoth(conflict: SyncConflict): {
    resolved: boolean;
    data: any;
    action: 'merge';
  } {
    const localData = { ...conflict.localData };
    const serverData = { ...conflict.serverData };

    // Add suffix to local copy
    if (localData.title) {
      localData.title = `${localData.title} (Local Copy)`;
    } else if (localData.name) {
      localData.name = `${localData.name} (Local Copy)`;
    }

    return {
      resolved: true,
      data: {
        server: serverData,
        local: localData,
      },
      action: 'merge',
    };
  }

  /**
   * Smart merge for note content (future enhancement)
   */
  private _smartMerge(conflict: SyncConflict): any {
    // TODO: Implement 3-way merge algorithm
    // For now, fallback to last write wins
    return this.lastWriteWins(conflict);
  }
}
