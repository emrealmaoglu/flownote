import { apiClient } from './index';

/**
 * Admin API Types
 */
export interface AdminUser {
    id: string;
    username: string;
    email: string | null;
    name: string;
    role: 'admin' | 'user';
    createdAt: string;
    updatedAt: string;
}

/**
 * Admin API
 */
export const adminApi = {
    /**
     * Tüm kullanıcıları getir
     */
    getUsers: async (): Promise<AdminUser[]> => {
        const response = await apiClient.get<AdminUser[]>('/admin/users');
        return response.data;
    },

    /**
     * Kullanıcı sil
     */
    deleteUser: async (id: string): Promise<{ message: string; id: string }> => {
        const response = await apiClient.delete<{ message: string; id: string }>(`/admin/users/${id}`);
        return response.data;
    },
};

export default adminApi;
