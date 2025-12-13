import { apiClient } from './client';
import type { Note, NoteSummary, CreateNoteRequest, UpdateNoteRequest } from '../types';

/**
 * Search Result Types (Sprint 1)
 */
export interface SearchResult {
    id: string;
    title: string;
    snippet: string;
    matchType: 'title' | 'content';
    score: number;
    updatedAt: string;
}

export interface SearchResponse {
    query: string;
    results: SearchResult[];
    totalCount: number;
}

/**
 * Notes API
 * Backend Notes endpoints ile iletişim
 */
export const notesApi = {
    /**
     * Tüm notları listele
     */
    async getAll(): Promise<NoteSummary[]> {
        const response = await apiClient.get<{ notes: NoteSummary[] }>('/notes');
        return response.data.notes;
    },

    /**
     * Tek not getir (full content)
     */
    async getById(id: string): Promise<Note> {
        const response = await apiClient.get<Note>(`/notes/${id}`);
        return response.data;
    },

    /**
     * Yeni not oluştur
     */
    async create(data: CreateNoteRequest): Promise<Note> {
        const response = await apiClient.post<Note>('/notes', data);
        return response.data;
    },

    /**
     * Not güncelle
     */
    async update(id: string, data: UpdateNoteRequest): Promise<Note> {
        const response = await apiClient.put<Note>(`/notes/${id}`, data);
        return response.data;
    },

    /**
     * Not sil
     */
    async delete(id: string): Promise<void> {
        await apiClient.delete(`/notes/${id}`);
    },

    /**
     * Not ara (Command Palette için)
     * Sprint 1 - Global Search
     */
    async search(query: string, limit = 10): Promise<SearchResponse> {
        const response = await apiClient.get<SearchResponse>('/notes/search', {
            params: { q: query, limit },
        });
        return response.data;
    },

    /**
     * Block sırasını güncelle (Drag & Drop için)
     * Sprint 2 - Drag & Drop Block Management
     */
    async reorderBlock(noteId: string, blockId: string, newOrder: number): Promise<Note> {
        const response = await apiClient.patch<Note>(`/notes/${noteId}/blocks/reorder`, {
            blockId,
            newOrder,
        });
        return response.data;
    },
};

export default notesApi;

