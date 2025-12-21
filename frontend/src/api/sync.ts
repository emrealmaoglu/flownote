import { apiClient } from './client';
import type { Note } from '../types';

/**
 * Sync API
 * Sprint 14.2 - Bidirectional Sync Endpoints
 */

export interface SyncChanges {
    notes: Note[];
    deletedNoteIds: string[];
    timestamp: number;
}

export interface SyncRequest {
    lastSyncAt?: number;
    changes?: {
        created: Note[];
        updated: Note[];
        deleted: string[];
    };
}

export const syncApi = {
    /**
     * Pull changes from server since last sync
     */
    async pullChanges(lastSyncAt?: number): Promise<SyncChanges> {
        const params = lastSyncAt ? { since: lastSyncAt } : {};
        const response = await apiClient.get<SyncChanges>('/sync/pull', { params });
        return response.data;
    },

    /**
     * Push local changes to server
     */
    async pushChanges(changes: SyncRequest['changes']): Promise<SyncChanges> {
        const response = await apiClient.post<SyncChanges>('/sync/push', { changes });
        return response.data;
    },

    /**
     * Full bidirectional sync
     */
    async sync(request: SyncRequest): Promise<SyncChanges> {
        const response = await apiClient.post<SyncChanges>('/sync', request);
        return response.data;
    },

    /**
     * Get sync status
     */
    async getStatus(): Promise<{
        lastSyncAt: number | null;
        pendingChanges: number;
        conflicts: number;
    }> {
        const response = await apiClient.get('/sync/status');
        return response.data;
    },
};

export default syncApi;
