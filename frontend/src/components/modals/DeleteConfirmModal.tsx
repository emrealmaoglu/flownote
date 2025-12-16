import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    isDeleting?: boolean;
}

/**
 * Delete Confirmation Modal
 * Replaces native window.confirm for a more stable and styled experience
 */
export function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Notu Sil',
    description = 'Bu notu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
    isDeleting = false,
}: DeleteConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="w-full max-w-md bg-dark-900 border border-dark-800 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200"
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-dark-800">
                    <div className="flex items-center gap-2 text-red-400">
                        <AlertTriangle className="w-5 h-5" />
                        <h2 className="text-lg font-semibold">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="text-dark-400 hover:text-dark-200 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-dark-300">
                        {description}
                    </p>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-4 bg-dark-950/50 rounded-b-xl border-t border-dark-800">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-4 py-2 text-sm font-medium text-dark-300 hover:text-dark-100 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors"
                    >
                        İptal
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className={cn(
                            "px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors",
                            isDeleting && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isDeleting ? 'Siliniyor...' : 'Evet, Sil'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteConfirmModal;
