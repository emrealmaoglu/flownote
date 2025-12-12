import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
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
 */
function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
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
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
