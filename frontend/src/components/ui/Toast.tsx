import { Toaster } from 'react-hot-toast';

/**
 * Toast Provider Component
 * @Designer - Dark theme ile uyumlu premium toast'lar
 */
export function ToastProvider() {
    return (
        <Toaster
            position="bottom-right"
            gutter={12}
            containerStyle={{
                bottom: 24,
                right: 24,
            }}
            toastOptions={{
                duration: 4000,
                style: {
                    background: '#1f2937',
                    color: '#f9fafb',
                    border: '1px solid #374151',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontSize: '14px',
                },
                success: {
                    iconTheme: {
                        primary: '#10b981',
                        secondary: '#1f2937',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: '#1f2937',
                    },
                    duration: 5000,
                },
            }}
        />
    );
}

export default ToastProvider;
