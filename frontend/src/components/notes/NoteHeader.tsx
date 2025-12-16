import { Link } from 'react-router-dom';
import { ArrowLeft, Focus, Loader2, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SaveStatusIndicator } from './SaveStatusIndicator';
import type { SaveStatus } from '../../hooks/useAutoSave';

interface NoteHeaderProps {
    isFocusMode: boolean;
    toggleFocusMode: () => void;
    saveStatus: SaveStatus;
    handleDelete: () => void;
    deleting: boolean;
}

/**
 * Note Header Component
 * Contains navigation, actions, and status. Hidden in Focus Mode.
 */
export function NoteHeader({
    isFocusMode,
    toggleFocusMode,
    saveStatus,
    handleDelete,
    deleting
}: NoteHeaderProps) {
    if (isFocusMode) return null;

    return (
        <header className="sticky top-0 z-10 bg-dark-950/80 backdrop-blur-sm border-b border-dark-800">
            <div className="max-w-4xl mx-auto px-8 py-4">
                <div className="flex items-center justify-between">
                    <Link
                        to="/"
                        className={cn(
                            'flex items-center gap-2 text-dark-400 hover:text-dark-200',
                            'transition-colors',
                        )}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Geri
                    </Link>
                    <div className="flex items-center gap-2">
                        {/* Save Status Indicator */}
                        <SaveStatusIndicator status={saveStatus} />

                        {/* Focus Mode */}
                        <button
                            onClick={toggleFocusMode}
                            className={cn(
                                'flex items-center gap-2 px-3 py-1.5 rounded-lg',
                                'text-dark-400 hover:text-dark-200 hover:bg-dark-800',
                                'transition-colors text-sm',
                            )}
                            title="Focus Mode (F11)"
                        >
                            <Focus className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className={cn(
                                'flex items-center gap-2 px-3 py-1.5 rounded-lg',
                                'text-red-400 hover:text-red-300 hover:bg-red-500/10',
                                'transition-colors text-sm',
                                deleting && 'opacity-50 cursor-not-allowed',
                            )}
                        >
                            {deleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                            Sil
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default NoteHeader;
