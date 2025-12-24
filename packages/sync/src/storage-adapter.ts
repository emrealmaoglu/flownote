import { StorageAdapter } from './types';
import { ILogger, ConsoleLogger } from './logger';

/**
 * LocalStorage adapter for browser
 */
export class LocalStorageAdapter implements StorageAdapter {
  private prefix: string;
  private logger: ILogger;

  constructor(prefix = 'flownote', logger?: ILogger) {
    this.prefix = prefix;
    this.logger = logger || new ConsoleLogger('LocalStorageAdapter');
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  async get(key: string): Promise<any> {
    try {
      const item = localStorage.getItem(this.getKey(key));
      return item ? JSON.parse(item) : null;
    } catch (error) {
      this.logger.error(`LocalStorage get error`, error instanceof Error ? error : new Error(String(error)), { key });
      return null;
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(value));
    } catch (error) {
      this.logger.error(`LocalStorage set error`, error instanceof Error ? error : new Error(String(error)), { key });
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      this.logger.error(`LocalStorage delete error`, error instanceof Error ? error : new Error(String(error)), { key });
      throw error;
    }
  }

  async getAll(prefix: string): Promise<Record<string, any>> {
    const result: Record<string, any> = {};
    const fullPrefix = this.getKey(prefix);

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(fullPrefix)) {
          const item = localStorage.getItem(key);
          if (item) {
            const shortKey = key.replace(fullPrefix + ':', '');
            // @SecOps - JSON parse vulnerabilities managed by try-catch
            try {
              result[shortKey] = JSON.parse(item);
            } catch (e) {
              this.logger.warn(`Skipping invalid JSON for key: ${key}`);
            }
          }
        }
      }
    } catch (error) {
      this.logger.error(`LocalStorage getAll error`, error instanceof Error ? error : new Error(String(error)));
    }

    return result;
  }

  async clear(): Promise<void> {
    try {
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      this.logger.error(`LocalStorage clear error`, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get storage size in bytes
   */
  getSize(): number {
    let size = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        const item = localStorage.getItem(key);
        if (item) {
          size += key.length + item.length;
        }
      }
    }
    return size;
  }
}

/**
 * IndexedDB adapter for larger storage (future)
 */
export class IndexedDBAdapter implements StorageAdapter {
  private dbName: string;
  private storeName: string;
  private db: IDBDatabase | null = null;

  constructor(dbName = 'flownote', storeName = 'data') {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  private async openDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  async get(key: string): Promise<any> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async set(key: string, value: any): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(value, key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async delete(key: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getAll(prefix: string): Promise<Record<string, any>> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.openCursor();
      const result: Record<string, any> = {};

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const key = cursor.key as string;
          if (key.startsWith(prefix)) {
            result[key] = cursor.value;
          }
          cursor.continue();
        } else {
          resolve(result);
        }
      };
    });
  }

  async clear(): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}
