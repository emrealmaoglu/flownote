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
});

// Request interceptor - Auth token ekleme (Faz 4'te aktif edilecek)
apiClient.interceptors.request.use(
    (config) => {
        // TODO: Faz 4'te JWT token eklenecek
        // const token = localStorage.getItem('accessToken');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
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
