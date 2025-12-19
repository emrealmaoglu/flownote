import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Sparkles, Loader2, Users, Activity, Clock } from 'lucide-react';
import { cn, generateId } from '../lib/utils';
import { notesApi, usersApi } from '../api';
import type { NoteSummary } from '../types';

/**
 * HomePage Component
 * Ana sayfa - Hoş geldin mesajı ve hızlı erişim
 */
export function HomePage() {
    const [notes, setNotes] = useState<NoteSummary[]>([]);
    const [teamMembers, setTeamMembers] = useState<{ id: string; name: string; username: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [notesData, teamData] = await Promise.all([
                notesApi.getAll(),
                usersApi.getTeam().catch(() => []) // Silently fail if team endpoint not ready
            ]);
            setNotes(notesData);
            setTeamMembers(teamData);
        } catch (err: any) {
            console.error('Veri yüklenemedi:', err);
            const msg = err.response?.data?.message || 'Veriler yüklenemedi';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    const [quickNote, setQuickNote] = useState('');
    const [quickNoteLoading, setQuickNoteLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Hızlı not ekleme
    async function handleQuickNote(e: React.FormEvent) {
        e.preventDefault();
        if (!quickNote.trim()) return;

        try {
            setQuickNoteLoading(true);
            await notesApi.create({
                title: 'Hızlı Not ' + new Date().toLocaleString('tr-TR'),
                content: { blocks: [{ id: generateId(), type: 'text', order: 0, data: { text: quickNote } }] },
            });
            setQuickNote('');
            loadData(); // Listeyi yenile
        } catch (err: any) {
            console.error('Quick note failed:', err);
            // Extract specific validation message if available
            const backendMsg = err.response?.data?.message || err.message;
            const validationErrors = err.response?.data?.errors?.map((e: any) => e.message).join(', ');

            setError(validationErrors ? `Hata: ${validationErrors}` : `Hata: ${backendMsg}`);
            setTimeout(() => setError(null), 5000);
        } finally {
            setQuickNoteLoading(false);
        }
    }

    // Generate recent activity from notes
    const activities = notes.slice(0, 5).map(note => ({
        id: note.id,
        user: 'Sen', // Şimdilik sadece kendi notlarımız olduğu için
        action: 'güncelledi',
        target: note.title || 'İsimsiz Not',
        time: new Date(note.updatedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    }));

    return (
        <div className="min-h-screen p-8 animate-in fade-in duration-500">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Sol Kolon (Ana İçerik) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* HATA MESAJI - ÜST KISIMDA GÖSTER */}
                    {error && (
                        <div className="bg-red-500/10 border-2 border-red-500 rounded-xl p-4">
                            <p className="text-red-400 font-semibold text-lg">⚠️ {error}</p>
                        </div>
                    )}

                    {/* Welcome Section */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h1 className="text-3xl font-bold text-dark-50 mb-2">
                                FlowNote'a Hoş Geldin 👋
                            </h1>
                            <p className="text-dark-400 text-lg">
                                Notlarını, fikirlerini ve projelerini yönetmeye başla.
                            </p>
                        </div>
                    </div>

                    {/* Quick Note Widget */}
                    <div className="bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700 rounded-2xl p-6 shadow-lg">
                        <h3 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-yellow-500" />
                            Hızlı Not Ekle
                        </h3>
                        <form onSubmit={handleQuickNote} className="flex gap-4">
                            <input
                                type="text"
                                value={quickNote}
                                onChange={(e) => setQuickNote(e.target.value)}
                                placeholder="Aklındakini hemen yaz..."
                                className={cn(
                                    'flex-1 px-4 py-3 rounded-xl',
                                    'bg-dark-950 border border-dark-700',
                                    'text-dark-100 placeholder:text-dark-500',
                                    'focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500',
                                    'transition-all duration-200'
                                )}
                            />
                            <button
                                type="submit"
                                disabled={quickNoteLoading || !quickNote.trim()}
                                className={cn(
                                    'px-6 py-3 rounded-xl font-medium flex items-center gap-2',
                                    'bg-primary-600 hover:bg-primary-500 text-white',
                                    'disabled:opacity-50 disabled:cursor-not-allowed',
                                    'transition-all duration-200 shadow-md hover:shadow-primary-500/20'
                                )}
                            >
                                {quickNoteLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Plus className="w-5 h-5" />
                                        Ekle
                                    </>
                                )}
                            </button>
                        </form>
                        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    </div>

                    {/* Recent Notes Grid */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-dark-200">Son Notlar</h2>
                            <Link to="/notes" className="text-primary-400 hover:text-primary-300 text-sm">Tümünü Gör</Link>
                        </div>

                        {notes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {notes.slice(0, 4).map((note) => (
                                    <Link
                                        key={note.id}
                                        to={`/notes/${note.id}`}
                                        className={cn(
                                            'group p-5 rounded-xl',
                                            'bg-dark-800 border border-dark-700',
                                            'hover:border-primary-500/50 hover:bg-dark-800/80',
                                            'transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg'
                                        )}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="p-2 rounded-lg bg-dark-700 group-hover:bg-dark-600 transition-colors">
                                                <FileText className="w-5 h-5 text-primary-400" />
                                            </div>
                                            <span className="text-xs text-dark-500 font-mono">
                                                {new Date(note.updatedAt).toLocaleDateString('tr-TR')}
                                            </span>
                                        </div>
                                        <h3 className="font-medium text-dark-100 mb-1 line-clamp-1 group-hover:text-primary-400 transition-colors">
                                            {note.title || 'İsimsiz Not'}
                                        </h3>
                                        <p className="text-sm text-dark-400">
                                            {note.blockCount} blok içerik
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            !loading && (
                                <div className="text-center py-12 rounded-2xl bg-dark-800/30 border border-dark-700 border-dashed">
                                    <p className="text-dark-400 mb-4">Henüz notun yok.</p>
                                    <Link to="/new" className="text-primary-400 hover:text-primary-300">İlk notunu oluştur</Link>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* Sağ Kolon (Yan Widgetlar) */}
                <div className="space-y-8">

                    {/* Team Members Widget */}
                    <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-dark-100 flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-400" />
                                Takım
                            </h3>
                            <span className="text-xs text-dark-500 bg-dark-800 px-2 py-1 rounded-full">
                                {teamMembers.length} Üye
                            </span>
                        </div>
                        <div className="space-y-3">
                            {teamMembers.length > 0 ? (
                                teamMembers.map(member => (
                                    <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-dark-800 rounded-lg transition-colors cursor-default">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                                            {member.username.substring(0, 2)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-dark-200">{member.name}</p>
                                            <p className="text-xs text-dark-500">@{member.username}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-dark-500 italic">Takım üyesi bulunamadı.</p>
                            )}
                        </div>
                    </div>

                    {/* Activity Feed Widget */}
                    <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-green-400" />
                            Aktivite Ekranı
                        </h3>
                        <div className="space-y-4 relative">
                            {/* Timeline line */}
                            <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-dark-800" />

                            {activities.length > 0 ? activities.map((activity, i) => (
                                <div key={i} className="flex gap-4 relative">
                                    <div className="w-8 h-8 rounded-full bg-dark-800 border-2 border-dark-900 z-10 flex items-center justify-center shrink-0">
                                        <Clock className="w-3 h-3 text-dark-400" />
                                    </div>
                                    <div className="pb-2">
                                        <p className="text-sm text-dark-300">
                                            <span className="font-semibold text-dark-200">{activity.user}</span>{' '}
                                            <span className="text-dark-500">{activity.action}</span>
                                            <br />
                                            <span className="text-primary-400">{activity.target}</span>
                                        </p>
                                        <span className="text-xs text-dark-600">{activity.time}</span>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-dark-500 pl-10">Henüz aktivite yok.</p>
                            )}
                        </div>
                    </div>

                    {/* Stats Widget */}
                    <div className="bg-dark-800/50 border border-dark-700 p-4 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary-900/20">
                                <FileText className="w-5 h-5 text-primary-400" />
                            </div>
                            <div>
                                <p className="text-xs text-dark-400">Toplam Notlar</p>
                                <p className="text-lg font-bold text-dark-100">
                                    {loading ? '...' : notes.length}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default HomePage;
