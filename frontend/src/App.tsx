import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, FocusModeProvider } from './contexts';
import { MainLayout, ProtectedRoute } from './components';
import { HomePage, NoteDetailPage, NewNotePage, LoginPage, RegisterPage } from './pages';

// TanStack Query client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
        },
    },
});

/**
 * FlowNote Ana Uygulama
 * Block-based not tutma uygulaması
 * Sprint 1: Focus Mode ve Command Palette eklendi
 */
function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <FocusModeProvider>
                    <Router>
                        <Routes>
                            {/* Public routes - Auth pages */}
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />

                            {/* Protected routes - Main Layout */}
                            <Route
                                element={
                                    <ProtectedRoute>
                                        <MainLayout />
                                    </ProtectedRoute>
                                }
                            >
                                <Route path="/" element={<HomePage />} />
                                <Route path="/notes/:id" element={<NoteDetailPage />} />
                                <Route path="/new" element={<NewNotePage />} />
                            </Route>
                        </Routes>
                    </Router>
                    {/* Focus Mode Exit Hint */}
                    <div className="focus-mode-hint">
                        Press <kbd>Esc</kbd> or <kbd>F11</kbd> to exit focus mode
                    </div>
                </FocusModeProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;

