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
    logout: () => Promise<void>;
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

    // Sayfa yüklendiğinde session kontrolü yap
    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            const response = await apiClient.get<AuthUser>('/auth/me');
            setUser(response.data);
            setToken('cookie-session'); // Session aktif işareti
        } catch (err) {
            // Session yok veya geçersiz
            setToken(null);
            setUser(null);
            localStorage.removeItem('user');
        } finally {
            setIsLoading(false);
        }
    }

    /**
     * Kullanıcı girişi
     * @param identifier - username veya email
     * @param password - şifre
     */
    async function login(identifier: string, password: string) {
        // Backend HttpOnly cookie set edecek
        const response = await apiClient.post<{ user: AuthUser }>(
            '/auth/login',
            { identifier, password },
        );

        const { user: userData } = response.data;

        // State güncelle
        setToken('cookie-session');
        setUser(userData);

        // LocalStorage'a sadece user bilgisini cache amaçlı kaydet
        localStorage.setItem('user', JSON.stringify(userData));
    }

    /**
     * Kullanıcı kaydı
     */
    async function register(username: string, email: string, password: string, name: string) {
        // Backend HttpOnly cookie set edecek
        const response = await apiClient.post<{ user: AuthUser }>(
            '/auth/register',
            { username, email, password, name },
        );

        const { user: userData } = response.data;

        // State güncelle
        setToken('cookie-session');
        setUser(userData);

        // LocalStorage'a kaydet
        localStorage.setItem('user', JSON.stringify(userData));
    }

    /**
     * Çıkış yap
     */
    /**
     * Çıkış yap
     */
    async function logout() {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setToken(null);
            setUser(null);
            localStorage.removeItem('user');
            // localStorage.removeItem('accessToken'); // Artık kullanılmıyor
        }
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
