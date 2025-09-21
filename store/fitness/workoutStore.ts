/**
 * Workout Store - Zustand store for managing workout session state
 * Handles current workout, workout history, and workout operations
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Workout, WorkoutExercise, SetInput } from './models';

interface WorkoutStore {
  // State
  currentWorkout: Workout | null;
  workoutHistory: Workout[];
  isLoading: boolean;
  error: string | null;

  // Current workout actions
  startWorkout: (name?: string) => Promise<void>;
  addExerciseToWorkout: (exerciseId: string) => Promise<void>;
  addSetToExercise: (exerciseId: string, set: SetInput) => Promise<void>;
  updateExerciseNotes: (exerciseId: string, notes: string) => Promise<void>;
  removeExerciseFromWorkout: (exerciseId: string) => Promise<void>;
  removeSetFromExercise: (exerciseId: string, setIndex: number) => Promise<void>;
  completeWorkout: () => Promise<void>;
  abandonWorkout: () => Promise<void>;

  // Workout history actions
  loadWorkoutHistory: () => Promise<void>;
  getWorkoutById: (workoutId: string) => Workout | null;
  deleteWorkout: (workoutId: string) => Promise<void>;
  duplicateWorkout: (workoutId: string) => Promise<void>;

  // Utility actions
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const STORAGE_KEYS = {
  CURRENT_WORKOUT: 'fitness:currentWorkout',
  WORKOUT_HISTORY: 'fitness:workoutHistory',
};

const generateWorkoutId = (): string => {
  return `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const generateWorkoutName = (): string => {
  const now = new Date();
  return `Workout ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export const useWorkoutStore = create<WorkoutStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentWorkout: null,
    workoutHistory: [],
    isLoading: false,
    error: null,

    // Current workout actions
    startWorkout: async (name?: string) => {
      try {
        set({ isLoading: true, error: null });

        const newWorkout: Workout = {
          id: generateWorkoutId(),
          name: name || generateWorkoutName(),
          startTime: new Date(),
          endTime: null,
          exercises: [],
          notes: '',
        };

        set({ currentWorkout: newWorkout });
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_WORKOUT, JSON.stringify(newWorkout));
      } catch (error) {
        set({ error: 'Failed to start workout' });
      } finally {
        set({ isLoading: false });
      }
    },

    addExerciseToWorkout: async (exerciseId: string) => {
      try {
        const { currentWorkout } = get();
        if (!currentWorkout) {
          throw new Error('No active workout');
        }

        // Check if exercise already exists in workout
        const existingExercise = currentWorkout.exercises.find(e => e.exerciseId === exerciseId);
        if (existingExercise) {
          set({ error: 'Exercise already added to workout' });
          return;
        }

        const newExercise: WorkoutExercise = {
          exerciseId,
          sets: [],
          restTime: 120, // Default 2 minutes rest
          notes: '',
        };

        const updatedWorkout = {
          ...currentWorkout,
          exercises: [...currentWorkout.exercises, newExercise],
        };

        set({ currentWorkout: updatedWorkout });
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_WORKOUT, JSON.stringify(updatedWorkout));
      } catch (error) {
        set({ error: 'Failed to add exercise to workout' });
      }
    },

    addSetToExercise: async (exerciseId: string, setInput: SetInput) => {
      try {
        const { currentWorkout } = get();
        if (!currentWorkout) {
          throw new Error('No active workout');
        }

        const exerciseIndex = currentWorkout.exercises.findIndex(e => e.exerciseId === exerciseId);
        if (exerciseIndex === -1) {
          throw new Error('Exercise not found in workout');
        }

        const newSet = {
          reps: setInput.reps,
          weight: setInput.weight,
          completed: setInput.completed ?? true,
          restTime: 0, // Will be updated when next set starts
        };

        const updatedExercises = [...currentWorkout.exercises];
        updatedExercises[exerciseIndex] = {
          ...updatedExercises[exerciseIndex],
          sets: [...updatedExercises[exerciseIndex].sets, newSet],
        };

        const updatedWorkout = {
          ...currentWorkout,
          exercises: updatedExercises,
        };

        set({ currentWorkout: updatedWorkout });
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_WORKOUT, JSON.stringify(updatedWorkout));
      } catch (error) {
        set({ error: 'Failed to add set to exercise' });
      }
    },

    updateExerciseNotes: async (exerciseId: string, notes: string) => {
      try {
        const { currentWorkout } = get();
        if (!currentWorkout) return;

        const exerciseIndex = currentWorkout.exercises.findIndex(e => e.exerciseId === exerciseId);
        if (exerciseIndex === -1) return;

        const updatedExercises = [...currentWorkout.exercises];
        updatedExercises[exerciseIndex] = {
          ...updatedExercises[exerciseIndex],
          notes,
        };

        const updatedWorkout = {
          ...currentWorkout,
          exercises: updatedExercises,
        };

        set({ currentWorkout: updatedWorkout });
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_WORKOUT, JSON.stringify(updatedWorkout));
      } catch (error) {
        set({ error: 'Failed to update exercise notes' });
      }
    },

    removeExerciseFromWorkout: async (exerciseId: string) => {
      try {
        const { currentWorkout } = get();
        if (!currentWorkout) return;

        const updatedWorkout = {
          ...currentWorkout,
          exercises: currentWorkout.exercises.filter(e => e.exerciseId !== exerciseId),
        };

        set({ currentWorkout: updatedWorkout });
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_WORKOUT, JSON.stringify(updatedWorkout));
      } catch (error) {
        set({ error: 'Failed to remove exercise from workout' });
      }
    },

    removeSetFromExercise: async (exerciseId: string, setIndex: number) => {
      try {
        const { currentWorkout } = get();
        if (!currentWorkout) return;

        const exerciseIndex = currentWorkout.exercises.findIndex(e => e.exerciseId === exerciseId);
        if (exerciseIndex === -1) return;

        const updatedExercises = [...currentWorkout.exercises];
        updatedExercises[exerciseIndex] = {
          ...updatedExercises[exerciseIndex],
          sets: updatedExercises[exerciseIndex].sets.filter((_, index) => index !== setIndex),
        };

        const updatedWorkout = {
          ...currentWorkout,
          exercises: updatedExercises,
        };

        set({ currentWorkout: updatedWorkout });
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_WORKOUT, JSON.stringify(updatedWorkout));
      } catch (error) {
        set({ error: 'Failed to remove set from exercise' });
      }
    },

    completeWorkout: async () => {
      try {
        set({ isLoading: true, error: null });

        const { currentWorkout, workoutHistory } = get();
        if (!currentWorkout) {
          throw new Error('No active workout to complete');
        }

        if (currentWorkout.exercises.length === 0) {
          set({ error: 'Cannot complete workout with no exercises' });
          return;
        }

        const completedWorkout = {
          ...currentWorkout,
          endTime: new Date(),
        };

        const updatedHistory = [completedWorkout, ...workoutHistory];

        set({
          currentWorkout: null,
          workoutHistory: updatedHistory
        });

        await Promise.all([
          AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_WORKOUT),
          AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(updatedHistory)),
        ]);
      } catch (error) {
        set({ error: 'Failed to complete workout' });
      } finally {
        set({ isLoading: false });
      }
    },

    abandonWorkout: async () => {
      try {
        set({ currentWorkout: null });
        await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_WORKOUT);
      } catch (error) {
        set({ error: 'Failed to abandon workout' });
      }
    },

    // Workout history actions
    loadWorkoutHistory: async () => {
      try {
        set({ isLoading: true, error: null });

        const [currentWorkoutData, historyData] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.CURRENT_WORKOUT),
          AsyncStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY),
        ]);

        const currentWorkout = currentWorkoutData ? JSON.parse(currentWorkoutData) : null;
        const workoutHistory = historyData ? JSON.parse(historyData) : [];

        // Convert date strings back to Date objects
        if (currentWorkout) {
          currentWorkout.startTime = new Date(currentWorkout.startTime);
          if (currentWorkout.endTime) {
            currentWorkout.endTime = new Date(currentWorkout.endTime);
          }
        }

        workoutHistory.forEach((workout: Workout) => {
          workout.startTime = new Date(workout.startTime);
          if (workout.endTime) {
            workout.endTime = new Date(workout.endTime);
          }
        });

        set({ currentWorkout, workoutHistory });
      } catch (error) {
        set({ error: 'Failed to load workout data' });
      } finally {
        set({ isLoading: false });
      }
    },

    getWorkoutById: (workoutId: string) => {
      const { workoutHistory } = get();
      return workoutHistory.find(w => w.id === workoutId) || null;
    },

    deleteWorkout: async (workoutId: string) => {
      try {
        const { workoutHistory } = get();
        const updatedHistory = workoutHistory.filter(w => w.id !== workoutId);

        set({ workoutHistory: updatedHistory });
        await AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(updatedHistory));
      } catch (error) {
        set({ error: 'Failed to delete workout' });
      }
    },

    duplicateWorkout: async (workoutId: string) => {
      try {
        const { workoutHistory } = get();
        const originalWorkout = workoutHistory.find(w => w.id === workoutId);

        if (!originalWorkout) {
          set({ error: 'Workout not found' });
          return;
        }

        const duplicatedWorkout: Workout = {
          ...originalWorkout,
          id: generateWorkoutId(),
          name: `${originalWorkout.name} (Copy)`,
          startTime: new Date(),
          endTime: null,
          exercises: originalWorkout.exercises.map(exercise => ({
            ...exercise,
            sets: [], // Start with empty sets for the new workout
          })),
        };

        set({ currentWorkout: duplicatedWorkout });
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_WORKOUT, JSON.stringify(duplicatedWorkout));
      } catch (error) {
        set({ error: 'Failed to duplicate workout' });
      }
    },

    // Utility actions
    setError: (error: string | null) => set({ error }),
    clearError: () => set({ error: null }),
    reset: () => set({
      currentWorkout: null,
      workoutHistory: [],
      isLoading: false,
      error: null
    }),
  }))
);

// Initialize store on app launch
export const initializeWorkoutStore = async () => {
  await useWorkoutStore.getState().loadWorkoutHistory();
};