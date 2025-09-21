/**
 * StorageService Implementation
 * Centralized AsyncStorage operations with error handling and validation
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageService {
  private static readonly MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50MB limit
  private static readonly RETRY_ATTEMPTS = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second

  static async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);

      // Check storage size
      if (serializedValue.length > StorageService.MAX_STORAGE_SIZE) {
        throw new Error(`Data too large for storage. Max size: ${StorageService.MAX_STORAGE_SIZE} bytes`);
      }

      await StorageService.retryOperation(async () => {
        await AsyncStorage.setItem(key, serializedValue);
      });
    } catch (error) {
      throw new Error(`Failed to store data for key ${key}: ${error.message}`);
    }
  }

  static async getItem<T>(key: string): Promise<T | null> {
    try {
      return await StorageService.retryOperation(async () => {
        const item = await AsyncStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      });
    } catch (error) {
      throw new Error(`Failed to retrieve data for key ${key}: ${error.message}`);
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await StorageService.retryOperation(async () => {
        await AsyncStorage.removeItem(key);
      });
    } catch (error) {
      throw new Error(`Failed to remove data for key ${key}: ${error.message}`);
    }
  }

  static async getAllKeys(): Promise<string[]> {
    try {
      return await StorageService.retryOperation(async () => {
        return await AsyncStorage.getAllKeys();
      });
    } catch (error) {
      throw new Error(`Failed to get all keys: ${error.message}`);
    }
  }

  static async clear(): Promise<void> {
    try {
      await StorageService.retryOperation(async () => {
        await AsyncStorage.clear();
      });
    } catch (error) {
      throw new Error(`Failed to clear storage: ${error.message}`);
    }
  }

  static async getStorageSize(): Promise<number> {
    try {
      const keys = await StorageService.getAllKeys();
      let totalSize = 0;

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }

      return totalSize;
    } catch (error) {
      throw new Error(`Failed to calculate storage size: ${error.message}`);
    }
  }

  static async getStorageInfo(): Promise<{
    totalSize: number;
    keyCount: number;
    keys: string[];
  }> {
    try {
      const keys = await StorageService.getAllKeys();
      const totalSize = await StorageService.getStorageSize();

      return {
        totalSize,
        keyCount: keys.length,
        keys
      };
    } catch (error) {
      throw new Error(`Failed to get storage info: ${error.message}`);
    }
  }

  // Batch operations for better performance
  static async multiSet<T>(items: [string, T][]): Promise<void> {
    try {
      const serializedItems: [string, string][] = items.map(([key, value]) => [
        key,
        JSON.stringify(value)
      ]);

      await StorageService.retryOperation(async () => {
        await AsyncStorage.multiSet(serializedItems);
      });
    } catch (error) {
      throw new Error(`Failed to store multiple items: ${error.message}`);
    }
  }

  static async multiGet<T>(keys: string[]): Promise<[string, T | null][]> {
    try {
      return await StorageService.retryOperation(async () => {
        const items = await AsyncStorage.multiGet(keys);
        return items.map(([key, value]) => [key, value ? JSON.parse(value) : null]);
      });
    } catch (error) {
      throw new Error(`Failed to retrieve multiple items: ${error.message}`);
    }
  }

  static async multiRemove(keys: string[]): Promise<void> {
    try {
      await StorageService.retryOperation(async () => {
        await AsyncStorage.multiRemove(keys);
      });
    } catch (error) {
      throw new Error(`Failed to remove multiple items: ${error.message}`);
    }
  }

  // Backup and restore functionality
  static async createBackup(): Promise<{ [key: string]: any }> {
    try {
      const keys = await StorageService.getAllKeys();
      const items = await StorageService.multiGet(keys);

      const backup: { [key: string]: any } = {};
      items.forEach(([key, value]) => {
        backup[key] = value;
      });

      return backup;
    } catch (error) {
      throw new Error(`Failed to create backup: ${error.message}`);
    }
  }

  static async restoreFromBackup(backup: { [key: string]: any }): Promise<void> {
    try {
      const items: [string, any][] = Object.entries(backup);
      await StorageService.multiSet(items);
    } catch (error) {
      throw new Error(`Failed to restore from backup: ${error.message}`);
    }
  }

  // Migration utilities
  static async migrateKey<T>(oldKey: string, newKey: string, transformer?: (value: T) => T): Promise<void> {
    try {
      const value = await StorageService.getItem<T>(oldKey);
      if (value !== null) {
        const transformedValue = transformer ? transformer(value) : value;
        await StorageService.setItem(newKey, transformedValue);
        await StorageService.removeItem(oldKey);
      }
    } catch (error) {
      throw new Error(`Failed to migrate key ${oldKey} to ${newKey}: ${error.message}`);
    }
  }

  // Data validation utilities
  static async validateAndSetItem<T>(
    key: string,
    value: T,
    validator: (value: T) => boolean
  ): Promise<void> {
    if (!validator(value)) {
      throw new Error(`Validation failed for key ${key}`);
    }
    await StorageService.setItem(key, value);
  }

  static async getItemWithDefault<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const value = await StorageService.getItem<T>(key);
      return value !== null ? value : defaultValue;
    } catch (error) {
      console.warn(`Failed to get item ${key}, returning default:`, error.message);
      return defaultValue;
    }
  }

  // Private retry mechanism
  private static async retryOperation<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= StorageService.RETRY_ATTEMPTS; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt < StorageService.RETRY_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, StorageService.RETRY_DELAY * attempt));
        }
      }
    }

    throw lastError!;
  }

  // Cleanup utilities
  static async cleanupOldData(retentionDays: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const keys = await StorageService.getAllKeys();
      const keysToRemove: string[] = [];

      for (const key of keys) {
        // Only cleanup keys that have timestamp patterns
        if (key.includes('_') && key.match(/\d{13}/)) {
          const timestampMatch = key.match(/(\d{13})/);
          if (timestampMatch) {
            const timestamp = parseInt(timestampMatch[1]);
            const date = new Date(timestamp);

            if (date < cutoffDate) {
              keysToRemove.push(key);
            }
          }
        }
      }

      if (keysToRemove.length > 0) {
        await StorageService.multiRemove(keysToRemove);
      }
    } catch (error) {
      throw new Error(`Failed to cleanup old data: ${error.message}`);
    }
  }
}