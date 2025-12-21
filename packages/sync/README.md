# @flownote/sync

Sprint 14.2.2 - Sync Engine Package

Bidirectional synchronization between localStorage and PostgreSQL database for FlowNote.

## Features

- 🔄 **Bidirectional Sync** - Seamless sync between localStorage and database
- ⚡ **Real-time Updates** - Auto-sync with configurable intervals
- 🔌 **Offline Support** - Queue operations when offline, sync when back online
- 🤝 **Conflict Resolution** - Multiple strategies (last write wins, keep both, manual)
- 📦 **Queue System** - Reliable offline queue with retry mechanism
- 🎯 **Type-safe** - Full TypeScript support

## Installation

```bash
npm install @flownote/sync
```

## Usage

### Basic Setup

```typescript
import { SyncManager } from '@flownote/sync';

const syncManager = new SyncManager('user-id', {
  autoSync: true,
  syncInterval: 30000, // 30 seconds
  conflictStrategy: 'last_write_wins',
});

await syncManager.initialize();
```

### Manual Sync

```typescript
// Trigger sync manually
await syncManager.sync();
```

### Queue Operations (Offline)

```typescript
// Queue a create operation
await syncManager.queueOperation({
  id: 'note-123',
  type: 'note',
  operation: 'create',
  data: {
    title: 'My Note',
    content: 'Note content',
  },
  timestamp: Date.now(),
});
```

### Event Listening

```typescript
syncManager.addEventListener((event) => {
  if (event.type === 'sync_completed') {
    console.log(`Sync completed in ${event.duration}ms`);
  } else if (event.type === 'conflict_detected') {
    console.log('Conflict detected:', event.conflict);
  } else if (event.type === 'offline_detected') {
    console.log('Device is offline');
  }
});
```

### Configuration

```typescript
interface SyncConfig {
  enabled: boolean; // Enable/disable sync
  autoSync: boolean; // Automatic sync
  syncInterval: number; // Auto-sync interval (ms)
  conflictStrategy: ConflictStrategy; // Conflict resolution strategy
  offlineMode: boolean; // Allow offline operations
  batchSize: number; // Batch size for sync operations
  retryAttempts: number; // Max retry attempts
  retryDelay: number; // Delay between retries (ms)
}
```

### Conflict Resolution Strategies

- `last_write_wins` - Most recent change wins (default)
- `server_wins` - Always use server data
- `client_wins` - Always use client data
- `keep_both` - Create duplicate with suffix
- `manual` - Require manual resolution

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ SYNC ENGINE                                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌──────────────┐         ┌──────────────┐              │
│ │ localStorage │ ◄─────► │  Database    │              │
│ └──────────────┘         └──────────────┘              │
│        │                        │                       │
│        │    ┌──────────────┐    │                       │
│        └───►│ Sync Manager │◄───┘                       │
│             └──────────────┘                            │
│                    │                                    │
│        ┌───────────┼───────────┐                        │
│        │           │           │                        │
│  ┌─────▼────┐ ┌───▼────┐ ┌───▼────┐                    │
│  │ Conflict │ │ Offline│ │Priority│                    │
│  │ Resolver │ │ Queue  │ │Manager │                    │
│  └──────────┘ └────────┘ └────────┘                    │
└─────────────────────────────────────────────────────────┘
```

## Components

### SyncManager

Main orchestrator for all sync operations.

```typescript
const syncManager = new SyncManager(userId, config);
await syncManager.initialize();
```

### ConflictResolver

Handles conflicts between local and server data.

```typescript
const resolver = new ConflictResolver('last_write_wins');
const resolution = resolver.resolve(conflict);
```

### OfflineQueue

Queues operations when offline.

```typescript
const queue = new OfflineQueue();
await queue.enqueue(entity);
const item = queue.dequeue();
```

### Storage Adapters

Multiple storage backends supported.

```typescript
import { LocalStorageAdapter, IndexedDBAdapter } from '@flownote/sync';

const localStorage = new LocalStorageAdapter('flownote');
const indexedDB = new IndexedDBAdapter('flownote', 'data');
```

## Events

- `sync_started` - Sync process started
- `sync_completed` - Sync completed successfully
- `sync_error` - Sync error occurred
- `conflict_detected` - Conflict detected
- `conflict_resolved` - Conflict resolved
- `offline_detected` - Device went offline
- `online_detected` - Device came online
- `queue_processed` - Offline queue processed

## Development

```bash
# Type check
npm run type-check

# Build
npm run build

# Clean
npm run clean
```

## License

MIT
