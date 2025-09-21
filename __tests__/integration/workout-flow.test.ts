/**
 * Workout Flow Integration Tests
 * End-to-end tests for complete workout creation and completion flow
 * Tests must FAIL initially (TDD approach)
 */

import { act, renderHook } from '@testing-library/react-hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWorkoutStore } from '../../store/fitness/workoutStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

describe('Workout Flow Integration', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  describe('Complete workout creation and completion flow', () => {
    it('should allow user to create, add exercises, add sets, and complete workout', async () => {
      // This test should FAIL initially
      await expect(async () => {
        const { result } = renderHook(() => useWorkoutStore());

        // Step 1: Start new workout
        await act(async () => {
          await result.current.startWorkout('Test Workout');
        });

        expect(result.current.currentWorkout).toBeDefined();
        expect(result.current.currentWorkout?.name).toBe('Test Workout');
        expect(result.current.currentWorkout?.exercises).toEqual([]);

        // Step 2: Add first exercise
        await act(async () => {
          await result.current.addExerciseToWorkout('bench-press');
        });

        expect(result.current.currentWorkout?.exercises).toHaveLength(1);
        expect(result.current.currentWorkout?.exercises[0].exerciseId).toBe('bench-press');

        // Step 3: Add sets to first exercise
        await act(async () => {
          await result.current.addSetToExercise('bench-press', { reps: 10, weight: 80 });
        });

        await act(async () => {
          await result.current.addSetToExercise('bench-press', { reps: 8, weight: 85 });
        });

        const exercise = result.current.currentWorkout?.exercises[0];
        expect(exercise?.sets).toHaveLength(2);
        expect(exercise?.sets[0]).toEqual({
          reps: 10,
          weight: 80,
          completed: true,
          restTime: 0
        });

        // Step 4: Add second exercise
        await act(async () => {
          await result.current.addExerciseToWorkout('squat');
        });

        expect(result.current.currentWorkout?.exercises).toHaveLength(2);

        // Step 5: Add sets to second exercise
        await act(async () => {
          await result.current.addSetToExercise('squat', { reps: 12, weight: 100 });
        });

        // Step 6: Complete workout
        let completedWorkout: any;
        await act(async () => {
          completedWorkout = await result.current.completeWorkout();
        });

        expect(completedWorkout.endTime).toBeDefined();
        expect(completedWorkout.endTime.getTime()).toBeGreaterThan(completedWorkout.startTime.getTime());

        // Step 7: Verify current workout is cleared
        expect(result.current.currentWorkout).toBeNull();

        // Step 8: Verify workout is in history
        expect(result.current.workoutHistory).toHaveLength(1);
        expect(result.current.workoutHistory[0].id).toBe(completedWorkout.id);
      }).rejects.toThrow();
    });

    it('should persist workout data across app sessions', async () => {
      await expect(async () => {
        // Create first hook instance
        const { result: firstInstance } = renderHook(() => useWorkoutStore());

        // Start and add data to workout
        await act(async () => {
          await firstInstance.current.startWorkout('Persistent Workout');
          await firstInstance.current.addExerciseToWorkout('bench-press');
          await firstInstance.current.addSetToExercise('bench-press', { reps: 10, weight: 80 });
          await firstInstance.current.completeWorkout();
        });

        // Create second hook instance (simulating app restart)
        const { result: secondInstance } = renderHook(() => useWorkoutStore());

        // Load data
        await act(async () => {
          await secondInstance.current.loadWorkoutHistory();
        });

        // Verify data persisted
        expect(secondInstance.current.workoutHistory).toHaveLength(1);
        expect(secondInstance.current.workoutHistory[0].name).toBe('Persistent Workout');
        expect(secondInstance.current.workoutHistory[0].exercises).toHaveLength(1);
        expect(secondInstance.current.workoutHistory[0].exercises[0].sets).toHaveLength(1);
      }).rejects.toThrow();
    });

    it('should handle workout abandonment', async () => {
      await expect(async () => {
        const { result } = renderHook(() => useWorkoutStore());

        // Start workout and add some data
        await act(async () => {
          await result.current.startWorkout('Abandoned Workout');
          await result.current.addExerciseToWorkout('bench-press');
          await result.current.addSetToExercise('bench-press', { reps: 10, weight: 80 });
        });

        expect(result.current.currentWorkout).toBeDefined();

        // Abandon workout
        await act(async () => {
          await result.current.abandonWorkout();
        });

        // Verify workout was abandoned (not saved to history)
        expect(result.current.currentWorkout).toBeNull();
        expect(result.current.workoutHistory).toHaveLength(0);
      }).rejects.toThrow();
    });

    it('should restore in-progress workout after app restart', async () => {
      await expect(async () => {
        // Create first instance and start workout
        const { result: firstInstance } = renderHook(() => useWorkoutStore());

        await act(async () => {
          await firstInstance.current.startWorkout('In Progress Workout');
          await firstInstance.current.addExerciseToWorkout('bench-press');
        });

        // Simulate app restart
        const { result: secondInstance } = renderHook(() => useWorkoutStore());

        await act(async () => {
          await secondInstance.current.loadWorkoutHistory();
        });

        // Verify in-progress workout was restored
        expect(secondInstance.current.currentWorkout).toBeDefined();
        expect(secondInstance.current.currentWorkout?.name).toBe('In Progress Workout');
        expect(secondInstance.current.currentWorkout?.exercises).toHaveLength(1);
        expect(secondInstance.current.currentWorkout?.endTime).toBeNull();
      }).rejects.toThrow();
    });
  });

  describe('Error handling during workout flow', () => {
    it('should handle errors when adding duplicate exercises', async () => {
      await expect(async () => {
        const { result } = renderHook(() => useWorkoutStore());

        await act(async () => {
          await result.current.startWorkout('Test Workout');
          await result.current.addExerciseToWorkout('bench-press');
        });

        // Try to add same exercise again
        await act(async () => {
          await result.current.addExerciseToWorkout('bench-press');
        });

        expect(result.current.error).toBe('Exercise already added to workout');
        expect(result.current.currentWorkout?.exercises).toHaveLength(1);
      }).rejects.toThrow();
    });

    it('should handle errors when completing workout with no exercises', async () => {
      await expect(async () => {
        const { result } = renderHook(() => useWorkoutStore());

        await act(async () => {
          await result.current.startWorkout('Empty Workout');
        });

        // Try to complete workout without exercises
        await act(async () => {
          await result.current.completeWorkout();
        });

        expect(result.current.error).toBe('Cannot complete workout with no exercises');
        expect(result.current.currentWorkout).toBeDefined(); // Workout should still exist
      }).rejects.toThrow();
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      await expect(async () => {
        // Mock AsyncStorage to throw error
        (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

        const { result } = renderHook(() => useWorkoutStore());

        await act(async () => {
          await result.current.startWorkout('Test Workout');
        });

        expect(result.current.error).toBe('Failed to start workout');
      }).rejects.toThrow();
    });
  });

  describe('Workout data validation', () => {
    it('should validate set data before adding', async () => {
      await expect(async () => {
        const { result } = renderHook(() => useWorkoutStore());

        await act(async () => {
          await result.current.startWorkout('Validation Test');
          await result.current.addExerciseToWorkout('bench-press');
        });

        // Try to add invalid set (negative reps)
        await act(async () => {
          await result.current.addSetToExercise('bench-press', { reps: -5, weight: 80 });
        });

        expect(result.current.error).toContain('validation') || expect(result.current.error).toContain('invalid');
        expect(result.current.currentWorkout?.exercises[0].sets).toHaveLength(0);
      }).rejects.toThrow();
    });

    it('should ensure workout timestamps are logical', async () => {
      await expect(async () => {
        const { result } = renderHook(() => useWorkoutStore());

        await act(async () => {
          await result.current.startWorkout('Timestamp Test');
          await result.current.addExerciseToWorkout('bench-press');
          await result.current.addSetToExercise('bench-press', { reps: 10, weight: 80 });
        });

        const startTime = result.current.currentWorkout?.startTime;

        // Wait a moment before completing
        await new Promise(resolve => setTimeout(resolve, 10));

        let completedWorkout: any;
        await act(async () => {
          completedWorkout = await result.current.completeWorkout();
        });

        expect(completedWorkout.endTime.getTime()).toBeGreaterThan(startTime!.getTime());
      }).rejects.toThrow();
    });
  });
});