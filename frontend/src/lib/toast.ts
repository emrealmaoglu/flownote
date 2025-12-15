import { toast } from 'react-hot-toast';

/**
 * Toast utility functions
 * Separated for react-refresh compatibility
 */
export const showSuccess = (message: string) => toast.success(message);
export const showError = (message: string) => toast.error(message);
export const showInfo = (message: string) => toast(message);
export const showLoading = (message: string) => toast.loading(message);

export { toast };
