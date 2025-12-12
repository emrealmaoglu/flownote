import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';

/**
 * ProtectedRoute Component
 * Giriş yapmamış kullanıcıları login sayfasına yönlendirir
 */
interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isLoggedIn, isLoading } = useAuth();
    const location = useLocation();

    // Auth durumu yüklenirken loading göster
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-dark-950">
                <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
            </div>
        );
    }

    // Giriş yapılmamışsa login sayfasına yönlendir
    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}

export default ProtectedRoute;
