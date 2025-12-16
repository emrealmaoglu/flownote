import { Minimize2 } from 'lucide-react';
import { SaveStatusIndicator } from './SaveStatusIndicator';
import type { SaveStatus } from '../../hooks/useAutoSave';

interface FocusControlsProps {
    isFocusMode: boolean;
    toggleFocusMode: () => void;
    saveStatus: SaveStatus;
}

/**
 * Focus Controls Component
 * Floating controls visible only in Focus Mode (Zen Mode)
 */
export function FocusControls({ isFocusMode, toggleFocusMode, saveStatus }: FocusControlsProps) {
    if (!isFocusMode) return null;

    return (
        <>
            {/* Floating Exit Button */}
            <button
                onClick={toggleFocusMode}
                className="fixed top-6 right-8 z-50 p-2 text-dark-400 hover:text-dark-200 bg-dark-950/50 hover:bg-dark-800 rounded-lg backdrop-blur-sm transition-all border border-transparent hover:border-dark-700"
                title="Exit Focus Mode (Esc)"
            >
                <Minimize2 className="w-5 h-5" />
            </button>

            {/* Floating Save Status */}
            <div className="fixed bottom-6 right-8 z-50 bg-dark-950/50 px-3 py-2 rounded-lg backdrop-blur-sm border border-dark-800/50">
                <SaveStatusIndicator status={saveStatus} />
            </div>
        </>
    );
}

export default FocusControls;
