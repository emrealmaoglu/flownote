import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

/**
 * RegisterPage Component
 * Kullanıcı kayıt sayfası
 */
export function RegisterPage() {
    const navigate = useNavigate();
    const { register, isLoggedIn } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Zaten giriş yapılmışsa ana sayfaya yönlendir
    if (isLoggedIn) {
        navigate('/', { replace: true });
        return null;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        // Validasyon
        if (!name || !email || !password || !confirmPassword) {
            setError('Lütfen tüm alanları doldurun');
            return;
        }

        if (password.length < 8) {
            setError('Şifre en az 8 karakter olmalı');
            return;
        }

        if (password !== confirmPassword) {
            setError('Şifreler eşleşmiyor');
            return;
        }

        try {
            setLoading(true);
            await register(email, password, name);
            navigate('/', { replace: true });
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Kayıt başarısız');
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
                    <h1 className="text-2xl font-bold text-dark-50">FlowNote'a Kayıt Ol</h1>
                    <p className="text-dark-400 mt-2">Yeni bir hesap oluştur</p>
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

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">
                            İsim
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Adınız"
                                className={cn(
                                    'w-full pl-10 pr-4 py-3 rounded-lg',
                                    'bg-dark-800 border border-dark-700',
                                    'text-dark-100 placeholder:text-dark-500',
                                    'focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500',
                                )}
                            />
                        </div>
                    </div>

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
                                placeholder="En az 8 karakter"
                                className={cn(
                                    'w-full pl-10 pr-4 py-3 rounded-lg',
                                    'bg-dark-800 border border-dark-700',
                                    'text-dark-100 placeholder:text-dark-500',
                                    'focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500',
                                )}
                            />
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">
                            Şifre Tekrar
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Şifreyi tekrar girin"
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
                            'Kayıt Ol'
                        )}
                    </button>
                </form>

                {/* Login Link */}
                <p className="text-center text-dark-400 mt-6">
                    Zaten hesabın var mı?{' '}
                    <Link to="/login" className="text-primary-400 hover:text-primary-300">
                        Giriş Yap
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;
