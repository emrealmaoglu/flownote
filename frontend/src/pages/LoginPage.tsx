import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/useAuth';

/**
 * LoginPage Component
 * Kullanıcı giriş sayfası
 */
export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isLoggedIn } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Zaten giriş yapılmışsa ana sayfaya yönlendir
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

    if (isLoggedIn) {
        navigate(from, { replace: true });
        return null;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!email || !password) {
            setError('Lütfen tüm alanları doldurun');
            return;
        }

        try {
            setLoading(true);
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Giriş başarısız');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-950 p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600">
                        <span className="text-white font-bold text-2xl">F</span>
                    </div>
                    <h1 className="text-2xl font-bold text-dark-50">FlowNote'a Giriş Yap</h1>
                    <p className="text-dark-400 mt-2">Hesabına giriş yaparak devam et</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ornek@email.com"
                                className={cn(
                                    'w-full pl-10 pr-4 py-3 rounded-lg',
                                    'bg-dark-800 border border-dark-700',
                                    'text-dark-100 placeholder:text-dark-500',
                                    'focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500',
                                )}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">
                            Şifre
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className={cn(
                                    'w-full pl-10 pr-4 py-3 rounded-lg',
                                    'bg-dark-800 border border-dark-700',
                                    'text-dark-100 placeholder:text-dark-500',
                                    'focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500',
                                )}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                            'w-full py-3 rounded-lg font-medium',
                            'bg-primary-600 hover:bg-primary-500 text-white',
                            'transition-colors',
                            loading && 'opacity-50 cursor-not-allowed',
                        )}
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        ) : (
                            'Giriş Yap'
                        )}
                    </button>
                </form>

                {/* Register Link */}
                <p className="text-center text-dark-400 mt-6">
                    Hesabın yok mu?{' '}
                    <Link to="/register" className="text-primary-400 hover:text-primary-300">
                        Kayıt Ol
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
