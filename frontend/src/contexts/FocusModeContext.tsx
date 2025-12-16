import { useState, useEffect, useCallback, ReactNode } from 'react';
import { FocusModeContext, FocusModeContextType } from './FocusModeContext.types';

interface FocusModeProviderProps {
    children: ReactNode;
}

/**
 * Focus Mode Provider
 * Sprint 7.5 - Enhanced with Fullscreen API
 * F11 ile toggle, Escape ile çıkış
 */
export function FocusModeProvider({ children }: FocusModeProviderProps) {
    const [isFocusMode, setIsFocusMode] = useState(false);

    // Enter focus mode with optional fullscreen
    const enterFocusMode = useCallback(async () => {
        setIsFocusMode(true);
        // Try to enter fullscreen
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }
        } catch (err) {
            // Fullscreen not supported or denied, continue with CSS-only mode
            console.log('Fullscreen not available, using CSS mode');
        }
    }, []);

    // Exit focus mode
    const exitFocusMode = useCallback(async () => {
        setIsFocusMode(false);
        // Exit fullscreen if active
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            }
        } catch (err) {
            console.log('Error exiting fullscreen:', err);
        }
    }, []);

    // Toggle focus mode
    const toggleFocusMode = useCallback(() => {
        if (isFocusMode) {
            exitFocusMode();
        } else {
            enterFocusMode();
        }
    }, [isFocusMode, enterFocusMode, exitFocusMode]);

    // Listen for fullscreen changes (user pressed ESC in fullscreen)
    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && isFocusMode) {
                setIsFocusMode(false);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [isFocusMode]);

    // Keyboard shortcuts: F11 toggle, Escape exit
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F11') {
                e.preventDefault();
                toggleFocusMode();
            }
            if (e.key === 'Escape' && isFocusMode) {
                // exitFocusMode will be called by fullscreenchange event
                // or manually if not in fullscreen
                if (!document.fullscreenElement) {
                    setIsFocusMode(false);
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isFocusMode, toggleFocusMode]);

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
        toggleFocusMode,
        enterFocusMode,
        exitFocusMode,
    };

    return (
        <FocusModeContext.Provider value={value}>
            {children}
        </FocusModeContext.Provider>
    );
}
