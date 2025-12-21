import { useState, useEffect, useCallback, useRef } from 'react';
import { SyncManager } from '@flownote/sync';
import type { Note } from '../types';
import { notesApi } from '../api/notes';
import { Storage } from '../lib/storage';
import { toast } from '../lib/toast';

/**
 * useSyncNote Hook
 * Sprint 14.2.3 - Bidirectional sync with offline support
 */

export type SyncStatus = 'idle' | 'syncing' | 'offline' | 'error';

interface UseSyncNoteOptions {
    noteId: string;
    autoSync?: boolean;
    syncInterval?: number;
}

interface UseSyncNoteReturn {
    note: Note | null;
    isLoading: boolean;
    syncStatus: SyncStatus;
    lastSyncAt: Date | null;
    pendingChanges: number;

    updateNote: (updates: Partial<Note>) => void;
    syncNow: () => Promise<void>;
    revertToServer: () => Promise<void>;
}

export function useSyncNote({
    noteId,
    autoSync = true,
    syncInterval = 30000,
}: UseSyncNoteOptions): UseSyncNoteReturn {
    const [note, setNote] = useState<Note | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
    const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
    const [pendingChanges, setPendingChanges] = useState(0);

    const syncManagerRef = useRef<SyncManager | null>(null);
    const mountedRef = useRef(true);

    // Initialize sync manager
    useEffect(() => {
        const userId = Storage.get<string>('userId') || 'anonymous';

        const syncManager = new SyncManager(userId, {
            enabled: true,
            autoSync,
            syncInterval,
            conflictStrategy: 'last_write_wins',
            offlineMode: !navigator.onLine,
            batchSize: 10,
            retryAttempts: 3,
            retryDelay: 1000,
        });

        // Event listeners
        syncManager.addEventListener((event) => {
            if (!mountedRef.current) return;

            switch (event.type) {
                case 'sync_started':
                    setSyncStatus('syncing');
                    break;

                case 'sync_completed':
                    setSyncStatus('idle');
                    setLastSyncAt(new Date());
                    break;

                case 'sync_error':
                    setSyncStatus('error');
                    toast.error(`Sync error: ${event.error}`);
                    break;

                case 'offline_detected':
                    setSyncStatus('offline');
                    toast.error('You are offline. Changes will sync when connection is restored.');
                    break;

                case 'online_detected':
                    setSyncStatus('idle');
                    toast.success('Connection restored. Syncing...');
                    break;

                case 'queue_processed':
                    setPendingChanges(syncManager.getState().pendingOperations);
                    break;
            }
        });

        syncManagerRef.current = syncManager;
        syncManager.initialize();

        return () => {
            mountedRef.current = false;
            syncManager.destroy();
        };
    }, [noteId, autoSync, syncInterval]);

    // Load note on mount
    useEffect(() => {
        async function loadNote() {
            setIsLoading(true);

            try {
                // Try localStorage first
                const localNote = Storage.get<Note>(`note:${noteId}`);

                if (localNote && mountedRef.current) {
                    setNote(localNote);
                    setIsLoading(false);
                }

                // Then fetch from server
                if (navigator.onLine) {
                    const serverNote = await notesApi.getById(noteId);

                    if (mountedRef.current) {
                        setNote(serverNote);
                        Storage.set(`note:${noteId}`, serverNote);
                        setLastSyncAt(new Date());
                    }
                }
            } catch (error) {
                console.error('Failed to load note:', error);
                if (mountedRef.current) {
                    toast.error('Failed to load note');
                }
            } finally {
                if (mountedRef.current) {
                    setIsLoading(false);
                }
            }
        }

        loadNote();
    }, [noteId]);

    // Update note
    const updateNote = useCallback((updates: Partial<Note>) => {
        if (!note) return;

        const updatedNote = {
            ...note,
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        setNote(updatedNote);
        Storage.set(`note:${noteId}`, updatedNote);

        // Queue for sync
        if (syncManagerRef.current) {
            syncManagerRef.current.queueOperation({
                id: noteId,
                type: 'note',
                operation: 'update',
                data: updatedNote,
                timestamp: Date.now(),
            });
            setPendingChanges((prev) => prev + 1);
        }
    }, [note, noteId]);

    // Sync now
    const syncNow = useCallback(async () => {
        if (!syncManagerRef.current) return;

        setSyncStatus('syncing');

        try {
            await syncManagerRef.current.sync();

            // Reload from server
            const serverNote = await notesApi.getById(noteId);

            if (mountedRef.current) {
                setNote(serverNote);
                Storage.set(`note:${noteId}`, serverNote);
                setSyncStatus('idle');
                setLastSyncAt(new Date());
                toast.success('Synced successfully');
            }
        } catch (error) {
            if (mountedRef.current) {
                setSyncStatus('error');
                toast.error('Sync failed');
            }
        }
    }, [noteId]);

    // Revert to server
    const revertToServer = useCallback(async () => {
        try {
            const serverNote = await notesApi.getById(noteId);

            if (mountedRef.current) {
                setNote(serverNote);
                Storage.set(`note:${noteId}`, serverNote);
                setLastSyncAt(new Date());
                toast.success('Reverted to server version');
            }
        } catch (error) {
            toast.error('Failed to revert');
        }
    }, [noteId]);

    return {
        note,
        isLoading,
        syncStatus,
        lastSyncAt,
        pendingChanges,
        updateNote,
        syncNow,
        revertToServer,
    };
}

export default useSyncNote;
