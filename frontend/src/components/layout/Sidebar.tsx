import { Link } from 'react-router-dom';
import { Plus, Settings, Home, Focus, LogOut, User, Activity, CalendarDays, Inbox, KanbanSquare, Users, Star, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { NoteList } from '../notes';
import { useFocusMode, useAuth } from '../../contexts';
import { notesApi } from '../../api/notes';
import type { NoteSummary } from '../../types';

/**
 * Sidebar Component
 * Sol navigasyon paneli
 */

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const { toggleFocusMode } = useFocusMode();
    const { user, logout } = useAuth();
    const [recentNotes, setRecentNotes] = useState<NoteSummary[]>([]);
    const [favoriteNotes, setFavoriteNotes] = useState<NoteSummary[]>([]);

    // Fetch recent and favorites on mount
    useEffect(() => {
        notesApi.getRecent(5).then(setRecentNotes).catch(console.error);
        notesApi.getFavorites().then(setFavoriteNotes).catch(console.error);
    }, []);

    return (
        <aside
            className={cn(
                'sidebar w-72 h-screen flex flex-col',
                'bg-dark-900 border-r border-dark-800',
                className,
            )}
        >
            {/* Header */}
            <div className="p-4 border-b border-dark-800">
                <Link to="/" className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">F</span>
                    </div>
                    <h1 className="text-lg font-semibold text-dark-50">FlowNote</h1>
                </Link>
            </div>

            {/* Actions */}
            <div className="p-4 border-b border-dark-800">
                <Link
                    to="/new"
                    className={cn(
                        'flex items-center gap-2 w-full px-4 py-2.5 rounded-lg',
                        'bg-primary-600 hover:bg-primary-500 text-white',
                        'font-medium transition-colors',
                    )}
                >
                    <Plus className="w-4 h-4" />
                    Yeni Not
                </Link>
            </div>

            {/* Navigation Groups */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">

                {/* FAVORITES Section */}
                {favoriteNotes.length > 0 && (
                    <div>
                        <h2 className="text-xs font-semibold text-dark-500 uppercase tracking-wider mb-2 px-2 flex items-center gap-2">
                            <Star className="w-3 h-3" />
                            Favorites
                        </h2>
                        <nav className="space-y-0.5">
                            {favoriteNotes.map((note) => (
                                <Link
                                    key={note.id}
                                    to={`/notes/${note.id}`}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-dark-300 hover:bg-dark-800 transition-colors"
                                >
                                    <span>{note.iconEmoji || '📄'}</span>
                                    <span className="truncate text-sm">{note.title}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                )}

                {/* RECENT Section */}
                {recentNotes.length > 0 && (
                    <div>
                        <h2 className="text-xs font-semibold text-dark-500 uppercase tracking-wider mb-2 px-2 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            Recent
                        </h2>
                        <nav className="space-y-0.5">
                            {recentNotes.map((note) => (
                                <Link
                                    key={note.id}
                                    to={`/notes/${note.id}`}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-dark-300 hover:bg-dark-800 transition-colors"
                                >
                                    <span>{note.iconEmoji || '📄'}</span>
                                    <span className="truncate text-sm">{note.title}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                )}

                {/* MY SPACE */}
                <div>
                    <h2 className="text-xs font-semibold text-dark-500 uppercase tracking-wider mb-2 px-2">
                        My Space
                    </h2>
                    <nav className="space-y-0.5">
                        <Link
                            to="/"
                            className={cn(
                                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                                'text-dark-300 hover:text-dark-100 hover:bg-dark-800',
                                'transition-colors',
                            )}
                        >
                            <Home className="w-4 h-4" />
                            Dashboard
                        </Link>
                        <Link
                            to="/inbox"
                            className={cn(
                                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                                'text-dark-300 hover:text-dark-100 hover:bg-dark-800',
                                'transition-colors',
                            )}
                        >
                            <Inbox className="w-4 h-4" />
                            Inbox
                        </Link>
                        <Link
                            to="/tasks"
                            className={cn(
                                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                                'text-dark-300 hover:text-dark-100 hover:bg-dark-800',
                                'transition-colors',
                            )}
                        >
                            <KanbanSquare className="w-4 h-4" />
                            Tasks
                        </Link>
                        <Link
                            to="/calendar"
                            className={cn(
                                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                                'text-dark-300 hover:text-dark-100 hover:bg-dark-800',
                                'transition-colors',
                            )}
                        >
                            <CalendarDays className="w-4 h-4" />
                            Calendar
                        </Link>
                    </nav>
                </div>

                {/* TEAM */}
                <div>
                    <h2 className="text-xs font-semibold text-dark-500 uppercase tracking-wider mb-2 px-2">
                        Team
                    </h2>
                    <nav className="space-y-0.5">
                        <div className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                            'text-dark-400 cursor-not-allowed opacity-50',
                        )}>
                            <Users className="w-4 h-4" />
                            Members
                        </div>
                        <div className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                            'text-dark-400 cursor-not-allowed opacity-50',
                        )}>
                            <Activity className="w-4 h-4" />
                            Activity
                        </div>
                    </nav>
                </div>

                {/* NOTES */}
                <div>
                    <div className="flex items-center justify-between mb-2 px-2">
                        <h2 className="text-xs font-semibold text-dark-500 uppercase tracking-wider">
                            Notes
                        </h2>
                    </div>
                    <NoteList />
                </div>
            </div>

            {/* User Info & Footer */}
            <div className="p-4 border-t border-dark-800 space-y-2">
                {/* User Info */}
                {user && (
                    <div className="flex items-center gap-2 px-3 py-2 mb-2">
                        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-dark-100 truncate">{user.name || user.username}</p>
                            <p className="text-xs text-dark-500 truncate">{user.role}</p>
                        </div>
                    </div>
                )}
                <button
                    onClick={toggleFocusMode}
                    className={cn(
                        'flex items-center gap-2 w-full px-3 py-2 rounded-lg',
                        'text-dark-400 hover:text-dark-200 hover:bg-dark-800',
                        'transition-colors text-sm',
                    )}
                    title="Focus Mode (F11)"
                >
                    <Focus className="w-4 h-4" />
                    Focus Mode
                </button>
                <button
                    className={cn(
                        'flex items-center gap-2 w-full px-3 py-2 rounded-lg',
                        'text-dark-400 hover:text-dark-200 hover:bg-dark-800',
                        'transition-colors text-sm',
                    )}
                >
                    <Settings className="w-4 h-4" />
                    Ayarlar
                </button>
                {/* Logout Button */}
                <button
                    onClick={logout}
                    className={cn(
                        'flex items-center gap-2 w-full px-3 py-2 rounded-lg',
                        'text-red-400 hover:text-red-300 hover:bg-red-900/20',
                        'transition-colors text-sm',
                    )}
                >
                    <LogOut className="w-4 h-4" />
                    Çıkış Yap
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
