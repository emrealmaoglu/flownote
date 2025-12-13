import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { CommandPalette } from '../CommandPalette';

/**
 * MainLayout Component
 * Ana uygulama layout'u - Sidebar + Content + Command Palette
 * Sprint 1: Command Palette eklendi (⌘K)
 */
export function MainLayout() {
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

    return (
        <div className="flex h-screen bg-dark-950">
            {/* Sidebar - Sol Panel */}
            <Sidebar />

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

