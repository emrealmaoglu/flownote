import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Error Boundary Props
 */
interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Error Boundary State
 */
interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors in child components
 * @QA - Prevents app crashes from propagating
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error for debugging
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // TODO: Send to error tracking service (Sentry)
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-dark-950 p-4">
                    <div className="max-w-md w-full text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-red-500/20">
                            <AlertTriangle className="w-8 h-8 text-red-400" />
                        </div>

                        <h1 className="text-2xl font-bold text-dark-50 mb-2">
                            Bir şeyler yanlış gitti
                        </h1>

                        <p className="text-dark-400 mb-6">
                            Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya tekrar deneyin.
                        </p>

                        {import.meta.env.DEV && this.state.error && (
                            <pre className="text-left text-xs text-red-400 bg-dark-800 p-4 rounded-lg mb-6 overflow-auto max-h-40">
                                {this.state.error.message}
                            </pre>
                        )}

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleRetry}
                                className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Tekrar Dene
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-200 font-medium"
                            >
                                Ana Sayfaya Dön
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
