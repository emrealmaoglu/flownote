import { useState, useEffect, useRef } from 'react';

/**
 * useDebounce Hook
 * Arama input'u için debounce sağlar
 * @param value - Debounce edilecek değer
 * @param delay - Gecikme süresi (ms)
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * useKeyboardShortcut Hook
 * Global keyboard shortcuts için
 */
export function useKeyboardShortcut(
    key: string,
    callback: () => void,
    modifiers: { ctrl?: boolean; meta?: boolean; shift?: boolean } = {}
): void {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const { ctrl, meta, shift } = modifiers;

            if (ctrl && !event.ctrlKey) return;
            if (meta && !event.metaKey) return;
            if (shift && !event.shiftKey) return;

            if (event.key.toLowerCase() === key.toLowerCase()) {
                event.preventDefault();
                callbackRef.current();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [key, modifiers]);
}
