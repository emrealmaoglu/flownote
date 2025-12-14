import { useState, useEffect, useCallback } from 'react';
import { Users, Trash2, Shield, User as UserIcon, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { adminApi, AdminUser } from '../api/admin';
import { useAuth } from '../contexts/useAuth';

/**
 * AdminPage Component
 * Admin kullanıcı yönetim paneli
 */
export function AdminPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await adminApi.getUsers();
            setUsers(data);
        } catch (err) {
            setError('Kullanıcılar yüklenirken hata oluştu');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    async function handleDelete(userId: string) {
        if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            setDeletingId(userId);
            await adminApi.deleteUser(userId);
            setUsers((prev) => prev.filter((u) => u.id !== userId));
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            alert(error.response?.data?.message || 'Kullanıcı silinemedi');
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="min-h-screen bg-dark-950 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 rounded-xl bg-primary-600/20">
                        <Shield className="w-8 h-8 text-primary-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-dark-50">Admin Panel</h1>
                        <p className="text-dark-400">Kullanıcı yönetimi</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="p-4 rounded-xl bg-dark-800 border border-dark-700">
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-primary-400" />
                            <span className="text-dark-300">Toplam Kullanıcı</span>
                        </div>
                        <p className="text-2xl font-bold text-dark-50 mt-2">{users.length}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-dark-800 border border-dark-700">
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-yellow-400" />
                            <span className="text-dark-300">Admin</span>
                        </div>
                        <p className="text-2xl font-bold text-dark-50 mt-2">
                            {users.filter((u) => u.role === 'admin').length}
                        </p>
                    </div>
                    <div className="p-4 rounded-xl bg-dark-800 border border-dark-700">
                        <div className="flex items-center gap-3">
                            <UserIcon className="w-5 h-5 text-blue-400" />
                            <span className="text-dark-300">Kullanıcı</span>
                        </div>
                        <p className="text-2xl font-bold text-dark-50 mt-2">
                            {users.filter((u) => u.role === 'user').length}
                        </p>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-2 p-4 mb-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {/* Users Table */}
                <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-dark-700">
                        <h2 className="text-lg font-semibold text-dark-100">Kullanıcılar</h2>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-dark-700 text-left">
                                        <th className="px-4 py-3 text-dark-400 font-medium">Kullanıcı</th>
                                        <th className="px-4 py-3 text-dark-400 font-medium">Email</th>
                                        <th className="px-4 py-3 text-dark-400 font-medium">Rol</th>
                                        <th className="px-4 py-3 text-dark-400 font-medium">Kayıt Tarihi</th>
                                        <th className="px-4 py-3 text-dark-400 font-medium">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b border-dark-700/50 hover:bg-dark-700/30"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary-600/20 flex items-center justify-center">
                                                        <span className="text-primary-400 font-medium text-sm">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-dark-100 font-medium">{user.name}</p>
                                                        <p className="text-dark-400 text-sm">@{user.username}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-dark-300">
                                                {user.email || '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={cn(
                                                        'px-2 py-1 rounded-full text-xs font-medium',
                                                        user.role === 'admin'
                                                            ? 'bg-yellow-500/20 text-yellow-400'
                                                            : 'bg-blue-500/20 text-blue-400',
                                                    )}
                                                >
                                                    {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-dark-400 text-sm">
                                                {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    disabled={user.id === currentUser?.id || deletingId === user.id}
                                                    className={cn(
                                                        'p-2 rounded-lg transition-colors',
                                                        user.id === currentUser?.id
                                                            ? 'text-dark-600 cursor-not-allowed'
                                                            : 'text-red-400 hover:bg-red-500/20',
                                                    )}
                                                    title={
                                                        user.id === currentUser?.id
                                                            ? 'Kendinizi silemezsiniz'
                                                            : 'Kullanıcıyı sil'
                                                    }
                                                >
                                                    {deletingId === user.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminPage;
