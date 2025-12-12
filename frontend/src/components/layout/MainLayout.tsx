import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

/**
 * MainLayout Component
 * Ana uygulama layout'u - Sidebar + Content
 */
export function MainLayout() {
    return (
        <div className="flex h-screen bg-dark-950">
            {/* Sidebar - Sol Panel */}
            <Sidebar />

            {/* Main Content - Sağ Panel */}
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}

export default MainLayout;
