export * from './client';
export * from './notes';
import { apiClient } from './client';
export * from './notes';

export const usersApi = {
    getTeam: () => apiClient.get<{ id: string; name: string; username: string; role: string }[]>('/users/team').then(res => res.data),
};
