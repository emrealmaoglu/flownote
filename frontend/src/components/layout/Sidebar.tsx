import { Link } from 'react-router-dom';
import { Plus, Settings, Home } from 'lucide-react';
import { cn } from '../../lib/utils';
import { NoteList } from '../notes';

/**
 * Sidebar Component
 * Sol navigasyon paneli
 */

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    return (
        <aside
            className={cn(
                'w-72 h-screen flex flex-col',
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

            {/* Navigation */}
            <nav className="p-2">
                <Link
                    to="/"
                    className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg',
                        'text-dark-300 hover:text-dark-100 hover:bg-dark-800',
                        'transition-colors',
                    )}
                >
                    <Home className="w-4 h-4" />
                    Ana Sayfa
                </Link>
            </nav>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto p-4">
                <h2 className="text-xs font-semibold text-dark-500 uppercase tracking-wider mb-3">
                    Notlarım
                </h2>
                <NoteList />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-dark-800">
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
            </div>
        </aside>
    );
}

export default Sidebar;
