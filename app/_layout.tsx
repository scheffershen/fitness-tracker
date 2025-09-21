import '../global.css';

import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { initializeWorkoutStore } from '~/store/fitness/workoutStore';
import { initializeExerciseStore } from '~/store/fitness/exerciseStore';
import { initializeProgressStore } from '~/store/fitness/progressStore';
import { MigrationService } from '~/store/fitness/services/MigrationService';
import { SyncService } from '~/store/fitness/services/SyncService';

export default function Layout() {
  useEffect(() => {
    // Initialize fitness stores on app launch
    const initializeStores = async () => {
      try {
        // Run migrations first
        await MigrationService.runMigrations();

        // Initialize sync service
        await SyncService.initialize();

        // Initialize stores
        await Promise.all([
          initializeWorkoutStore(),
          initializeExerciseStore(),
          initializeProgressStore(),
        ]);
      } catch (error) {
        console.error('Failed to initialize fitness stores:', error);
      }
    };

    initializeStores();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#3B82F6',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
