import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from './components';
import { HomePage, NoteDetailPage, NewNotePage } from './pages';

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
            <Router>
                <Routes>
                    {/* Main Layout ile sarılmış sayfalar */}
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/notes/:id" element={<NoteDetailPage />} />
                        <Route path="/new" element={<NewNotePage />} />
                    </Route>
                </Routes>
            </Router>
        </QueryClientProvider>
    );
}

export default App;
