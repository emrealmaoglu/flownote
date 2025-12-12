import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn - Class Names Utility
 * TailwindCSS sınıflarını birleştirmek için
 * clsx ile koşullu sınıflar, twMerge ile çakışma çözümü
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Tarihi formatla
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

/**
 * Relative time (e.g., "2 hours ago")
 */
export function timeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals = {
        yıl: 31536000,
        ay: 2592000,
        hafta: 604800,
        gün: 86400,
        saat: 3600,
        dakika: 60,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit} önce`;
        }
    }

    return 'Az önce';
}

/**
 * UUID üret (block ID'leri için)
 */
export function generateId(): string {
    return crypto.randomUUID();
}
