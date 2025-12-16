import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { CommandPalette } from '../CommandPalette';
import { useFocusMode } from '../../contexts';

/**
 * MainLayout Component
 * Ana uygulama layout'u - Sidebar + Content + Command Palette
 * Sprint 7.5: Focus mode'da sidebar gizleme
 */
export function MainLayout() {
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const { isFocusMode } = useFocusMode();

    return (
        <div className="flex h-screen bg-dark-950">
            {/* Sidebar - Sol Panel (Focus mode'da gizli) */}
            {!isFocusMode && <Sidebar />}

            {/* Main Content - Sağ Panel */}
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>

            {/* Command Palette - Global Search (⌘K) */}
            <CommandPalette
                open={commandPaletteOpen}
                onOpenChange={setCommandPaletteOpen}
            />
        </div>
    );
}

export default MainLayout;
