import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, FileText, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { notesApi } from '../../api';
import { NoteCard } from './NoteCard';
import type { NoteSummary } from '../../types';

/**
 * NoteList Component
 * Sidebar'da gösterilen not listesi
 */

interface NoteListProps {
    onNotesLoaded?: (notes: NoteSummary[]) => void;
}

export function NoteList({ onNotesLoaded }: NoteListProps) {
    const location = useLocation();
    const [notes, setNotes] = useState<NoteSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get current note ID from URL
    const currentNoteId = location.pathname.match(/\/notes\/(.+)/)?.[1];

    const loadNotes = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await notesApi.getAll();
            setNotes(data);
            onNotesLoaded?.(data);
        } catch (err) {
            setError('Notlar yüklenemedi');
            console.error('Failed to load notes:', err);
        } finally {
            setLoading(false);
        }
    }, [onNotesLoaded]);

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    // Listen for notes refresh events (triggered on create/delete)
    useEffect(() => {
        const handleRefresh = () => {
            loadNotes();
        };
        window.addEventListener('notes:refresh', handleRefresh);
        return () => window.removeEventListener('notes:refresh', handleRefresh);
    }, [loadNotes]);

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="p-4 text-center">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-dark-400">{error}</p>
                <button
                    onClick={loadNotes}
                    className="mt-2 text-sm text-primary-400 hover:text-primary-300"
                >
                    Tekrar dene
                </button>
            </div>
        );
    }

    // Empty state
    if (notes.length === 0) {
        return (
            <div className="p-4 text-center">
                <FileText className="w-10 h-10 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400 text-sm mb-4">Henüz not yok</p>
                <Link
                    to="/new"
                    className={cn(
                        'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
                        'bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium',
                        'transition-colors',
                    )}
                >
                    <Plus className="w-4 h-4" />
                    Yeni Not
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {notes.map((note) => (
                <NoteCard
                    key={note.id}
                    note={note}
                    isActive={note.id === currentNoteId}
                />
            ))}
        </div>
    );
}

export default NoteList;
