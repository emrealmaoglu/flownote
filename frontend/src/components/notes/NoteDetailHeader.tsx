import { useState, useRef, useEffect } from 'react';
import { Smile, ImageIcon, X, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Note } from '../../types';

interface NoteDetailHeaderProps {
    note: Note;
    onUpdate: (data: Partial<Note>) => void;
    isFocusMode: boolean;
}

const GRADIENTS = [
    'none',
    'linear-gradient(to right, #ff80b5, #9089fc)', // Pink-Purple
    'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)', // Blue-Cyan
    'linear-gradient(120deg, #f6d365 0%, #fda085 100%)', // Orange-Yellow
    'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)', // Gray-White
    'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)', // Green-Mint
] as const;

const EMOJIS = ['📝', '💡', '✅', '🚀', '🎨', '📚', '💼', '🏠', '💻', '🎮', '🎵', '🎬'];

export function NoteDetailHeader({ note, onUpdate, isFocusMode }: NoteDetailHeaderProps) {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showCoverMenu, setShowCoverMenu] = useState(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const coverMenuRef = useRef<HTMLDivElement>(null);

    // Click outside handler
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
            if (coverMenuRef.current && !coverMenuRef.current.contains(event.target as Node)) {
                setShowCoverMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const hasCover = note.coverType && note.coverType !== 'none';

    return (
        <div
            className={cn("relative group mb-8 transition-all duration-300", isFocusMode && "mb-16")}
            data-testid="note-detail-header"
        >

            {/* COVER AREA */}
            {hasCover && (
                <div
                    className="w-full h-40 md:h-52 rounded-b-3xl relative transition-all duration-500 overflow-hidden group-hover:shadow-lg"
                    style={{
                        background: note.coverType === 'gradient' ? note.coverValue : undefined,
                        backgroundColor: note.coverType === 'color' ? note.coverValue : undefined
                    }}
                    data-testid="note-cover"
                    data-cover-type={note.coverType}
                >
                    {/* Cover Actions (Hover only) */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button
                            onClick={() => setShowCoverMenu(!showCoverMenu)}
                            className="bg-black/50 hover:bg-black/70 text-white px-3 py-1 text-xs rounded-md backdrop-blur-md transition-colors"
                            data-testid="change-cover-btn"
                        >
                            Change Cover
                        </button>
                        <button
                            onClick={() => onUpdate({ coverType: 'none', coverValue: null })}
                            className="bg-black/50 hover:bg-red-500/80 text-white p-1 text-xs rounded-md backdrop-blur-md transition-colors"
                            title="Remove Cover"
                            data-testid="remove-cover-btn"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Cover Menu (Popover) */}
                    {showCoverMenu && (
                        <div ref={coverMenuRef} className="absolute top-14 right-4 bg-dark-900 border border-dark-700 shadow-xl rounded-xl p-3 w-64 z-20 animate-in fade-in zoom-in-95 duration-200">
                            <h4 className="text-xs font-semibold text-dark-400 uppercase mb-2">Gradients</h4>
                            <div className="grid grid-cols-5 gap-2">
                                {GRADIENTS.map((g, i) => (
                                    <button
                                        key={i}
                                        className={cn("w-8 h-8 rounded-full border border-white/10 hover:scale-110 transition-transform", g === 'none' && "bg-dark-800 text-dark-500 flex items-center justify-center")}
                                        style={{ background: g !== 'none' ? g : undefined }}
                                        onClick={() => {
                                            if (g === 'none') {
                                                onUpdate({ coverType: 'none', coverValue: null });
                                            } else {
                                                onUpdate({ coverType: 'gradient', coverValue: g });
                                            }
                                            setShowCoverMenu(false);
                                        }}
                                        title={g === 'none' ? 'No Cover' : 'Apply Gradient'}
                                        data-testid={`gradient-option-${i}`}
                                    >
                                        {g === 'none' && <X className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* CONTROLS (Add Cover / Add Icon) - Only visible when hovering top area if no cover/icon */}
            <div className={cn(
                "flex items-center gap-2 mt-4 px-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                !hasCover && "absolute -top-10 left-0 hover:opacity-100" // Show above when no cover
            )}>
                {!hasCover && (
                    <button
                        onClick={() => onUpdate({ coverType: 'gradient', coverValue: GRADIENTS[1] })}
                        className="flex items-center gap-1.5 text-dark-400 hover:text-dark-100 text-sm transition-colors py-1 px-2 rounded hover:bg-dark-800"
                        data-testid="add-cover-btn"
                    >
                        <ImageIcon className="w-4 h-4" />
                        Add Cover
                    </button>
                )}
                {!note.iconEmoji && (
                    <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="flex items-center gap-1.5 text-dark-400 hover:text-dark-100 text-sm transition-colors py-1 px-2 rounded hover:bg-dark-800"
                        data-testid="add-icon-btn"
                    >
                        <Smile className="w-4 h-4" />
                        Add Icon
                    </button>
                )}
            </div>

            {/* ICON AREA */}
            <div className={cn(
                "px-8 transition-all duration-300 relative",
                hasCover ? "-mt-10" : "mt-0"
            )}>
                {note.iconEmoji && (
                    <div className="relative inline-block group/icon">
                        <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="text-7xl shadow-sm hover:bg-dark-800/50 rounded-lg p-1 transition-colors cursor-pointer"
                            data-testid="note-icon-display"
                        >
                            {note.iconEmoji}
                        </button>

                        {/* Remove Icon Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onUpdate({ iconEmoji: null });
                            }}
                            className="absolute -top-1 -right-1 bg-dark-800 text-dark-400 hover:text-red-400 rounded-full p-1 opacity-0 group-hover/icon:opacity-100 transition-opacity shadow-sm border border-dark-700"
                            title="Remove Icon"
                            data-testid="remove-icon-btn"
                        >
                            <X className="w-3 h-3" />
                        </button>

                        {/* Emoji Picker (Simple) */}
                        {showEmojiPicker && (
                            <div ref={emojiPickerRef} className="absolute top-20 left-0 bg-dark-900 border border-dark-700 shadow-xl rounded-xl p-3 w-64 z-20 animate-in fade-in zoom-in-95 duration-200" data-testid="emoji-picker">
                                <h4 className="text-xs font-semibold text-dark-400 uppercase mb-2">Select Icon</h4>
                                <div className="grid grid-cols-6 gap-2">
                                    {EMOJIS.map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => {
                                                onUpdate({ iconEmoji: emoji });
                                                setShowEmojiPicker(false);
                                            }}
                                            className="text-2xl hover:bg-dark-800 rounded p-1 transition-colors"
                                            data-testid={`emoji-option-${emoji}`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
