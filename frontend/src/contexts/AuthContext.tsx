import { createContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../api';

/**
 * User Role Type
 */
export type UserRole = 'admin' | 'user';

/**
 * Auth Types
 */
interface AuthUser {
    id: string;
    username: string;
    email: string | null;
    name: string;
    role: UserRole;
}

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    isAdmin: boolean;
    login: (identifier: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string, name: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Component
 * Kullanıcı kimlik doğrulama durumunu yönetir
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Sayfa yüklendiğinde localStorage'dan token kontrol et
    useEffect(() => {
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            // API client'a token ekle
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        setIsLoading(false);
    }, []);

    /**
     * Kullanıcı girişi
     * @param identifier - username veya email
     * @param password - şifre
     */
    async function login(identifier: string, password: string) {
        const response = await apiClient.post<{ accessToken: string; user: AuthUser }>(
            '/auth/login',
            { identifier, password },
        );

        const { accessToken, user: userData } = response.data;

        // State güncelle
        setToken(accessToken);
        setUser(userData);

        // LocalStorage'a kaydet
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));

        // API client'a token ekle
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }

    /**
     * Kullanıcı kaydı
     */
    async function register(username: string, email: string, password: string, name: string) {
        const response = await apiClient.post<{ accessToken: string; user: AuthUser }>(
            '/auth/register',
            { username, email, password, name },
        );

        const { accessToken, user: userData } = response.data;

        // State güncelle
        setToken(accessToken);
        setUser(userData);

        // LocalStorage'a kaydet
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));

        // API client'a token ekle
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }

    /**
     * Çıkış yap
     */
    function logout() {
        setToken(null);
        setUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        delete apiClient.defaults.headers.common['Authorization'];
    }

    const value: AuthContextType = {
        user,
        token,
        isLoggedIn: !!token,
        isLoading,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
