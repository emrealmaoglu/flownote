import axios from 'axios';

/**
 * API Client - Axios instance
 * Backend API'ye bağlantı için
 */
export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
    withCredentials: true, // Sprint 11: HttpOnly cookie desteği
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // Not: Token artık HttpOnly cookie üzerinden gönderiliyor
        // Authorization header'a gerek yok, browser otomatik ekler
        return config;
    },
    (error) => Promise.reject(error),
);

// Response interceptor - Error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // TODO: Global error handling
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    },
);

export default apiClient;
