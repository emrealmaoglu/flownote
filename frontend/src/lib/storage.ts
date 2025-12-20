/**
 * LocalStorage Wrapper
 * Sprint 14.2 - Safe localStorage access with type safety
 */

const STORAGE_PREFIX = 'flownote';

export class Storage {
    private static getKey(key: string): string {
        return `${STORAGE_PREFIX}:${key}`;
    }

    static get<T>(key: string): T | null {
        try {
            const item = localStorage.getItem(this.getKey(key));
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Storage get error for key ${key}:`, error);
            return null;
        }
    }

    static set<T>(key: string, value: T): void {
        try {
            localStorage.setItem(this.getKey(key), JSON.stringify(value));
        } catch (error) {
            console.error(`Storage set error for key ${key}:`, error);
            throw error;
        }
    }

    static remove(key: string): void {
        try {
            localStorage.removeItem(this.getKey(key));
        } catch (error) {
            console.error(`Storage remove error for key ${key}:`, error);
        }
    }

    static clear(): void {
        try {
            const keys: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(STORAGE_PREFIX)) {
                    keys.push(key);
                }
            }
            keys.forEach((key) => localStorage.removeItem(key));
        } catch (error) {
            console.error('Storage clear error:', error);
        }
    }

    static getSize(): number {
        let size = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(STORAGE_PREFIX)) {
                const item = localStorage.getItem(key);
                if (item) {
                    size += key.length + item.length;
                }
            }
        }
        return size;
    }
}

export default Storage;
