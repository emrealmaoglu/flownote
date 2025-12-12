import { apiClient } from './client';
import type { Note, NoteSummary, CreateNoteRequest, UpdateNoteRequest } from '../types';

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
};

export default notesApi;
