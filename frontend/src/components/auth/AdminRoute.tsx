import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';

/**
 * AdminRoute Component
 * Sadece admin kullanıcıların erişebildiği route guard
 * Admin olmayan kullanıcıları ana sayfaya yönlendirir
 */
interface AdminRouteProps {
    children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
    const { isLoggedIn, isAdmin, isLoading } = useAuth();
    const location = useLocation();

    // Yükleniyor
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-950">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
        );
    }

    // Giriş yapılmamış
    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Admin değil
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}

export default AdminRoute;
