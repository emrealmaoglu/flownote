import { useState, useEffect, useRef, useCallback } from 'react';

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

/**
 * debounce utility function
 * Sprint 7.5 - Auto-save için
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn(...args);
            timeoutId = null;
        }, delay);
    };
}

/**
 * useDebouncedCallback Hook
 * Callback'i debounce eder - auto-save için ideal
 */
export function useDebouncedCallback(
    callback: (...args: unknown[]) => void,
    delay: number
): (...args: unknown[]) => void {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useCallback(
        debounce((...args: unknown[]) => callbackRef.current(...args), delay),
        [delay]
    );
}
