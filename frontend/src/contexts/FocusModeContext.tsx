import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FocusModeContextType {
    isFocusMode: boolean;
    toggleFocusMode: () => void;
    enterFocusMode: () => void;
    exitFocusMode: () => void;
}

const FocusModeContext = createContext<FocusModeContextType | null>(null);

interface FocusModeProviderProps {
    children: ReactNode;
}

/**
 * Focus Mode Provider
 * Sprint 1 - Dikkat dağınıklığı önleme modu
 * F11 ile toggle, Escape ile çıkış
 */
export function FocusModeProvider({ children }: FocusModeProviderProps) {
    const [isFocusMode, setIsFocusMode] = useState(false);

    // Keyboard shortcuts: F11 toggle, Escape exit
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F11') {
                e.preventDefault();
                setIsFocusMode((prev) => !prev);
            }
            if (e.key === 'Escape' && isFocusMode) {
                setIsFocusMode(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isFocusMode]);

    // Apply body class for global CSS effects
    useEffect(() => {
        document.body.classList.toggle('focus-mode', isFocusMode);

        // Cleanup on unmount
        return () => {
            document.body.classList.remove('focus-mode');
        };
    }, [isFocusMode]);

    const value: FocusModeContextType = {
        isFocusMode,
        toggleFocusMode: () => setIsFocusMode((prev) => !prev),
        enterFocusMode: () => setIsFocusMode(true),
        exitFocusMode: () => setIsFocusMode(false),
    };

    return (
        <FocusModeContext.Provider value={value}>
            {children}
        </FocusModeContext.Provider>
    );
}

/**
 * useFocusMode Hook
 * Focus mode state ve actions erişimi
 */
export function useFocusMode(): FocusModeContextType {
    const context = useContext(FocusModeContext);
    if (!context) {
        throw new Error('useFocusMode must be used within a FocusModeProvider');
    }
    return context;
}
