import { Link } from 'react-router-dom';
import { FileText, Clock } from 'lucide-react';
import { cn, timeAgo } from '../../lib/utils';
import type { NoteSummary } from '../../types';

/**
 * NoteCard Component
 * Not özeti gösteren kart bileşeni
 */

interface NoteCardProps {
    note: NoteSummary;
    isActive?: boolean;
}

export function NoteCard({ note, isActive }: NoteCardProps) {
    return (
        <Link
            to={`/notes/${note.id}`}
            className={cn(
                'block p-4 rounded-lg border transition-all duration-200',
                'hover:border-primary-500/50 hover:bg-dark-800/50',
                isActive
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-dark-700 bg-dark-800/30',
            )}
        >
            {/* Title */}
            <div className="flex items-center gap-2 mb-2">
                {note.iconEmoji ? (
                    <span className="text-base leading-none" data-testid="sidebar-note-icon">{note.iconEmoji}</span>
                ) : (
                    <FileText className="w-4 h-4 text-primary-400 flex-shrink-0" data-testid="sidebar-note-default-icon" />
                )}
                <h3 className="font-medium text-dark-100 truncate">
                    {note.title || 'Untitled'}
                </h3>
            </div>

            {/* Meta */}
            <div className="flex items-center justify-between text-xs text-dark-400">
                <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{timeAgo(note.updatedAt)}</span>
                </div>
                <span className="text-dark-500">
                    {note.blockCount} {note.blockCount === 1 ? 'block' : 'blocks'}
                </span>
            </div>
        </Link>
    );
}

export default NoteCard;
