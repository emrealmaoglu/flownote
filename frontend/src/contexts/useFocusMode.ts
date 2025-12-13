import { useContext } from 'react';
import { FocusModeContext, FocusModeContextType } from './FocusModeContext.types';

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
