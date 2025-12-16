import { useState, useCallback, useRef } from 'react';
import { useDebouncedCallback } from './useDebounce';
import type { UpdateNoteRequest } from '../types';
import { toast } from '../lib/toast';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions {
    noteId: string;
    delay?: number;
    onSave: (noteId: string, data: UpdateNoteRequest) => Promise<void>;
}

/**
 * useAutoSave Hook
 * Sprint 7.5 - Debounced auto-save with status tracking
 * 
 * @example
 * const { queueChange, saveStatus } = useAutoSave({
 *     noteId: 'abc',
 *     onSave: async (id, data) => await notesApi.update(id, data),
 * });
 * 
 * // Queue a change (will be saved after 1s of inactivity)
 * queueChange({ title: 'New Title' });
 */
export function useAutoSave({ noteId, delay = 1000, onSave }: UseAutoSaveOptions) {
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const pendingChanges = useRef<UpdateNoteRequest>({});
    const isSaving = useRef(false);

    const performSave = useCallback(async () => {
        if (isSaving.current || Object.keys(pendingChanges.current).length === 0) {
            return;
        }

        isSaving.current = true;
        setSaveStatus('saving');

        const dataToSave = { ...pendingChanges.current };
        pendingChanges.current = {};

        try {
            await onSave(noteId, dataToSave);
            setSaveStatus('saved');
            // Reset to idle after 2 seconds
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
            console.error('Auto-save failed:', error);
            setSaveStatus('error');
            toast.error('Kaydetme başarısız. Lütfen tekrar deneyin.');
            // Requeue failed changes
            pendingChanges.current = { ...dataToSave, ...pendingChanges.current };
        } finally {
            isSaving.current = false;
        }
    }, [noteId, onSave]);

    const debouncedSave = useDebouncedCallback(performSave, delay);

    const queueChange = useCallback((change: Partial<UpdateNoteRequest>) => {
        // Merge with pending changes
        if (change.title !== undefined) {
            pendingChanges.current.title = change.title;
        }
        if (change.content !== undefined) {
            pendingChanges.current.content = change.content;
        }
        debouncedSave();
    }, [debouncedSave]);

    // Force save immediately (useful for blur events)
    const saveNow = useCallback(async () => {
        if (Object.keys(pendingChanges.current).length > 0) {
            await performSave();
        }
    }, [performSave]);

    return {
        queueChange,
        saveNow,
        saveStatus,
        isSaving: saveStatus === 'saving',
    };
}

export default useAutoSave;
