import { createContext } from 'react';

/**
 * Focus Mode Context Type
 */
export interface FocusModeContextType {
    isFocusMode: boolean;
    toggleFocusMode: () => void;
    enterFocusMode: () => void;
    exitFocusMode: () => void;
}

/**
 * Focus Mode Context
 * Ayrı dosyada tutularak react-refresh uyumluluğu sağlandı
 */
export const FocusModeContext = createContext<FocusModeContextType | null>(null);
