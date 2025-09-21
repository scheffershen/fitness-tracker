/**
 * MigrationService Implementation
 * Handles data migration and versioning for fitness tracker data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from './StorageService';

interface MigrationDefinition {
  version: string;
  description: string;
  migrate: () => Promise<void>;
}

export class MigrationService {
  private static readonly VERSION_KEY = 'fitness:dataVersion';
  private static readonly CURRENT_VERSION = '1.0.0';

  private static migrations: MigrationDefinition[] = [
    {
      version: '1.0.0',
      description: 'Initial data structure',
      migrate: async () => {
        // Initial migration - ensure basic structure exists
        const keys = await StorageService.getAllKeys();
        console.log(`Migration 1.0.0: Found ${keys.length} existing keys`);
      },
    },
  ];

  /**
   * Check if migrations need to be run and execute them
   */
  static async runMigrations(): Promise<void> {
    try {
      const currentVersion = await this.getCurrentVersion();
      const targetVersion = this.CURRENT_VERSION;

      if (currentVersion === targetVersion) {
        console.log(`Data is up to date (v${currentVersion})`);
        return;
      }

      console.log(`Migrating data from v${currentVersion} to v${targetVersion}`);

      // Run migrations in order
      for (const migration of this.migrations) {
        if (this.shouldRunMigration(currentVersion, migration.version)) {
          console.log(`Running migration: ${migration.description} (v${migration.version})`);
          await migration.migrate();
        }
      }

      // Update version
      await this.setCurrentVersion(targetVersion);
      console.log(`Migration completed successfully to v${targetVersion}`);
    } catch (error) {
      console.error('Migration failed:', error);
      throw new Error(`Data migration failed: ${error.message}`);
    }
  }

  /**
   * Get the current data version
   */
  private static async getCurrentVersion(): Promise<string> {
    try {
      const version = await AsyncStorage.getItem(this.VERSION_KEY);
      return version || '0.0.0'; // Default for new installations
    } catch (error) {
      console.warn('Could not read data version, assuming new installation');
      return '0.0.0';
    }
  }

  /**
   * Set the current data version
   */
  private static async setCurrentVersion(version: string): Promise<void> {
    await AsyncStorage.setItem(this.VERSION_KEY, version);
  }

  /**
   * Determine if a migration should be run
   */
  private static shouldRunMigration(currentVersion: string, migrationVersion: string): boolean {
    return this.compareVersions(currentVersion, migrationVersion) < 0;
  }

  /**
   * Compare version strings
   * Returns: -1 if a < b, 0 if a === b, 1 if a > b
   */
  private static compareVersions(a: string, b: string): number {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    const maxLength = Math.max(aParts.length, bParts.length);

    for (let i = 0; i < maxLength; i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;

      if (aPart < bPart) return -1;
      if (aPart > bPart) return 1;
    }

    return 0;
  }

  /**
   * Create a backup before running migrations
   */
  static async createBackupBeforeMigration(): Promise<void> {
    try {
      const backup = await StorageService.createBackup();
      const timestamp = new Date().toISOString();
      const backupKey = `fitness:backup:${timestamp}`;

      await AsyncStorage.setItem(backupKey, JSON.stringify({
        timestamp,
        version: await this.getCurrentVersion(),
        data: backup,
      }));

      console.log(`Backup created: ${backupKey}`);
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw new Error(`Backup creation failed: ${error.message}`);
    }
  }

  /**
   * List available backups
   */
  static async listBackups(): Promise<{
    key: string;
    timestamp: string;
    version: string;
  }[]> {
    try {
      const keys = await StorageService.getAllKeys();
      const backupKeys = keys.filter(key => key.startsWith('fitness:backup:'));

      const backups = [];
      for (const key of backupKeys) {
        try {
          const backupData = await AsyncStorage.getItem(key);
          if (backupData) {
            const parsed = JSON.parse(backupData);
            backups.push({
              key,
              timestamp: parsed.timestamp,
              version: parsed.version,
            });
          }
        } catch (error) {
          console.warn(`Invalid backup data for key: ${key}`);
        }
      }

      return backups.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Failed to list backups:', error);
      return [];
    }
  }

  /**
   * Restore from a backup
   */
  static async restoreFromBackup(backupKey: string): Promise<void> {
    try {
      const backupData = await AsyncStorage.getItem(backupKey);
      if (!backupData) {
        throw new Error(`Backup not found: ${backupKey}`);
      }

      const backup = JSON.parse(backupData);

      // Clear current data
      await StorageService.clear();

      // Restore backup data
      await StorageService.restoreFromBackup(backup.data);

      // Set version
      await this.setCurrentVersion(backup.version);

      console.log(`Restored from backup: ${backupKey}`);
    } catch (error) {
      console.error('Failed to restore backup:', error);
      throw new Error(`Backup restoration failed: ${error.message}`);
    }
  }

  /**
   * Clean up old backups (keep only the most recent N)
   */
  static async cleanupOldBackups(keepCount: number = 5): Promise<void> {
    try {
      const backups = await this.listBackups();

      if (backups.length <= keepCount) {
        return; // Nothing to clean up
      }

      const toDelete = backups.slice(keepCount);
      const keysToDelete = toDelete.map(backup => backup.key);

      await StorageService.multiRemove(keysToDelete);

      console.log(`Cleaned up ${keysToDelete.length} old backups`);
    } catch (error) {
      console.error('Failed to cleanup old backups:', error);
    }
  }

  /**
   * Get migration status and information
   */
  static async getMigrationStatus(): Promise<{
    currentVersion: string;
    targetVersion: string;
    isUpToDate: boolean;
    pendingMigrations: string[];
  }> {
    const currentVersion = await this.getCurrentVersion();
    const targetVersion = this.CURRENT_VERSION;
    const isUpToDate = currentVersion === targetVersion;

    const pendingMigrations = this.migrations
      .filter(migration => this.shouldRunMigration(currentVersion, migration.version))
      .map(migration => migration.version);

    return {
      currentVersion,
      targetVersion,
      isUpToDate,
      pendingMigrations,
    };
  }
}