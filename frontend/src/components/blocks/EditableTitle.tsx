import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface EditableTitleProps {
    title: string;
    onChange: (newTitle: string) => void;
    placeholder?: string;
    className?: string;
}

/**
 * EditableTitle Component
 * Sprint 7.5 - Click-to-edit title for notes
 */
export function EditableTitle({
    title,
    onChange,
    placeholder = 'Başlıksız',
    className
}: EditableTitleProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [localTitle, setLocalTitle] = useState(title);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync with prop changes
    useEffect(() => {
        setLocalTitle(title);
    }, [title]);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleClick = () => {
        setIsEditing(true);
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (localTitle !== title) {
            onChange(localTitle);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            inputRef.current?.blur();
        }
        if (e.key === 'Escape') {
            setLocalTitle(title);
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type="text"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={cn(
                    'w-full text-3xl font-bold bg-transparent border-none outline-none',
                    'text-dark-50 placeholder:text-dark-600',
                    className
                )}
            />
        );
    }

    return (
        <h1
            onClick={handleClick}
            className={cn(
                'text-3xl font-bold text-dark-50 cursor-pointer',
                'rounded px-1 -mx-1',
                'hover:bg-dark-800/50 transition-colors',
                !title && 'text-dark-600',
                className
            )}
        >
            {title || placeholder}
        </h1>
    );
}

export default EditableTitle;
