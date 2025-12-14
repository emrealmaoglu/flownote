import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { LinkIcon, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { notesApi } from '../../api';
import { cn } from '../../lib/utils';
import type { NoteSummary } from '../../types';

interface BacklinksPanelProps {
    noteId: string;
    className?: string;
}

/**
 * BacklinksPanel Component
 * Sprint 2 - Bi-directional Linking
 * Bu nota link veren notları listeler
 */
export function BacklinksPanel({ noteId, className }: BacklinksPanelProps) {
    const [backlinks, setBacklinks] = useState<NoteSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(true);

    const loadBacklinks = useCallback(async () => {
        try {
            setLoading(true);
            const data = await notesApi.getBacklinks(noteId);
            setBacklinks(data);
        } catch (err) {
            console.error('Failed to load backlinks:', err);
            setBacklinks([]);
        } finally {
            setLoading(false);
        }
    }, [noteId]);

    useEffect(() => {
        loadBacklinks();
    }, [loadBacklinks]);

    if (loading) {
        return (
            <div className={cn('p-4 border-t border-dark-800', className)}>
                <div className="animate-pulse">
                    <div className="h-4 bg-dark-800 rounded w-1/3 mb-3" />
                    <div className="h-3 bg-dark-800 rounded w-2/3" />
                </div>
            </div>
        );
    }

    return (
        <div className={cn('border-t border-dark-800', className)}>
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className={cn(
                    'flex items-center justify-between w-full p-4',
                    'text-dark-400 hover:text-dark-200 transition-colors'
                )}
            >
                <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">
                        Backlinks ({backlinks.length})
                    </span>
                </div>
                {expanded ? (
                    <ChevronDown className="w-4 h-4" />
                ) : (
                    <ChevronRight className="w-4 h-4" />
                )}
            </button>

            {/* Content */}
            {expanded && (
                <div className="px-4 pb-4">
                    {backlinks.length === 0 ? (
                        <p className="text-sm text-dark-500 italic">
                            Bu nota henüz hiçbir not link vermiyor.
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {backlinks.map((note) => (
                                <li key={note.id}>
                                    <Link
                                        to={`/notes/${note.id}`}
                                        className={cn(
                                            'flex items-center gap-2 p-2 rounded-lg',
                                            'text-dark-300 hover:text-dark-100 hover:bg-dark-800',
                                            'transition-colors text-sm'
                                        )}
                                    >
                                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">{note.title}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

export default BacklinksPanel;
