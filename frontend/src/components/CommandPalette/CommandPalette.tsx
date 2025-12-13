import { Command } from 'cmdk';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Search, X } from 'lucide-react';
import { notesApi, SearchResult } from '../../api/notes';
import { useDebounce } from '../../hooks/useDebounce';
import { cn } from '../../lib/utils';

interface CommandPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Command Palette Component
 * Sprint 1 - ⌘K veya Ctrl+K ile açılır
 * Global search ve quick actions sağlar
 */
export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    const debouncedSearch = useDebounce(search, 300);

    // Search API call
    useEffect(() => {
        if (debouncedSearch.length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        notesApi
            .search(debouncedSearch)
            .then((data) => setResults(data.results))
            .catch(() => setResults([]))
            .finally(() => setLoading(false));
    }, [debouncedSearch]);

    // Global ⌘K shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                onOpenChange(!open);
            }
            if (e.key === 'Escape' && open) {
                onOpenChange(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, onOpenChange]);

    const handleSelect = useCallback(
        (noteId: string) => {
            navigate(`/notes/${noteId}`);
            onOpenChange(false);
            setSearch('');
            setResults([]);
        },
        [navigate, onOpenChange]
    );

    const handleCreateNew = useCallback(() => {
        navigate('/new');
        onOpenChange(false);
        setSearch('');
    }, [navigate, onOpenChange]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => onOpenChange(false)}
            />

            {/* Dialog */}
            <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg px-4">
                <Command
                    className={cn(
                        'bg-dark-900 rounded-xl border border-dark-700',
                        'shadow-2xl overflow-hidden'
                    )}
                >
                    {/* Search Input */}
                    <div className="flex items-center border-b border-dark-700 px-4">
                        <Search className="w-5 h-5 text-dark-500 flex-shrink-0" />
                        <Command.Input
                            value={search}
                            onValueChange={setSearch}
                            placeholder="Search notes or type a command..."
                            className={cn(
                                'w-full px-3 py-4 bg-transparent text-dark-100',
                                'outline-none placeholder:text-dark-500'
                            )}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="p-1 hover:bg-dark-800 rounded text-dark-500"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Results List */}
                    <Command.List className="max-h-80 overflow-y-auto p-2">
                        <Command.Empty className="py-8 text-center text-dark-500">
                            {loading
                                ? 'Searching...'
                                : search.length < 2
                                    ? 'Type at least 2 characters to search'
                                    : 'No results found.'}
                        </Command.Empty>

                        {/* Quick Actions */}
                        {!search && (
                            <Command.Group
                                heading="Quick Actions"
                                className="text-xs text-dark-500 px-2 py-1.5"
                            >
                                <Command.Item
                                    onSelect={handleCreateNew}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer',
                                        'text-dark-200 hover:bg-dark-800',
                                        'aria-selected:bg-primary-600/20 aria-selected:text-primary-400'
                                    )}
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="flex-1">Create New Note</span>
                                    <kbd className="text-xs text-dark-500 bg-dark-800 px-2 py-0.5 rounded font-mono">
                                        ⌘N
                                    </kbd>
                                </Command.Item>
                            </Command.Group>
                        )}

                        {/* Search Results */}
                        {results.length > 0 && (
                            <Command.Group
                                heading="Notes"
                                className="text-xs text-dark-500 px-2 py-1.5"
                            >
                                {results.map((result) => (
                                    <Command.Item
                                        key={result.id}
                                        value={result.title}
                                        onSelect={() => handleSelect(result.id)}
                                        className={cn(
                                            'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer',
                                            'hover:bg-dark-800',
                                            'aria-selected:bg-primary-600/20'
                                        )}
                                    >
                                        <FileText className="w-4 h-4 text-primary-400 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-dark-100 truncate">{result.title}</p>
                                            {result.snippet && (
                                                <p className="text-xs text-dark-500 truncate mt-0.5">
                                                    {result.snippet}
                                                </p>
                                            )}
                                        </div>
                                        {result.matchType === 'title' && (
                                            <span className="text-xs text-primary-400 bg-primary-400/10 px-1.5 py-0.5 rounded">
                                                title
                                            </span>
                                        )}
                                    </Command.Item>
                                ))}
                            </Command.Group>
                        )}
                    </Command.List>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-4 py-2 border-t border-dark-700 text-xs text-dark-500">
                        <div className="flex items-center gap-4">
                            <span>
                                <kbd className="bg-dark-800 px-1.5 py-0.5 rounded font-mono">↑↓</kbd> navigate
                            </span>
                            <span>
                                <kbd className="bg-dark-800 px-1.5 py-0.5 rounded font-mono">↵</kbd> select
                            </span>
                        </div>
                        <span>
                            <kbd className="bg-dark-800 px-1.5 py-0.5 rounded font-mono">esc</kbd> close
                        </span>
                    </div>
                </Command>
            </div>
        </div>
    );
}

export default CommandPalette;
