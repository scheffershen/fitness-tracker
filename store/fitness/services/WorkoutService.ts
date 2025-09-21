/**
 * WorkoutService Implementation
 * Implements contract from contracts/workout-service.ts with AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Workout, SetInput, WorkoutExercise } from '../models';
import { WorkoutModel } from '../models/Workout';

export class WorkoutService {
  private static readonly STORAGE_KEYS = {
    CURRENT_WORKOUT: 'fitness:currentWorkout',
    WORKOUT_HISTORY: 'fitness:workoutHistory',
  };

  private generateWorkoutId(): string {
    return `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateWorkoutName(): string {
    const now = new Date();
    return `Workout ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  async createWorkout(name?: string): Promise<Workout> {
    try {
      const workout: Workout = {
        id: this.generateWorkoutId(),
        name: name || this.generateWorkoutName(),
        startTime: new Date(),
        endTime: null,
        exercises: [],
        notes: '',
      };

      const workoutModel = new WorkoutModel(workout);
      const validatedWorkout = workoutModel.toPlainObject();

      await AsyncStorage.setItem(
        WorkoutService.STORAGE_KEYS.CURRENT_WORKOUT,
        JSON.stringify(validatedWorkout)
      );

      return validatedWorkout;
    } catch (error) {
      throw new Error(`Failed to create workout: ${error.message}`);
    }
  }

  async getCurrentWorkout(): Promise<Workout | null> {
    try {
      const workoutData = await AsyncStorage.getItem(WorkoutService.STORAGE_KEYS.CURRENT_WORKOUT);
      if (!workoutData) return null;

      const workout = JSON.parse(workoutData);

      // Convert date strings back to Date objects
      workout.startTime = new Date(workout.startTime);
      if (workout.endTime) {
        workout.endTime = new Date(workout.endTime);
      }

      return workout;
    } catch (error) {
      throw new Error(`Failed to get current workout: ${error.message}`);
    }
  }

  async addExerciseToWorkout(exerciseId: string): Promise<void> {
    try {
      const currentWorkout = await this.getCurrentWorkout();
      if (!currentWorkout) {
        throw new Error('No active workout');
      }

      // Check if exercise already exists
      if (currentWorkout.exercises.some(e => e.exerciseId === exerciseId)) {
        throw new Error('Exercise already added to workout');
      }

      const newExercise: WorkoutExercise = {
        exerciseId,
        sets: [],
        restTime: 120, // Default 2 minutes
        notes: '',
      };

      const updatedWorkout = {
        ...currentWorkout,
        exercises: [...currentWorkout.exercises, newExercise],
      };

      await AsyncStorage.setItem(
        WorkoutService.STORAGE_KEYS.CURRENT_WORKOUT,
        JSON.stringify(updatedWorkout)
      );
    } catch (error) {
      throw new Error(`Failed to add exercise to workout: ${error.message}`);
    }
  }

  async addSetToExercise(exerciseId: string, set: SetInput): Promise<void> {
    try {
      const currentWorkout = await this.getCurrentWorkout();
      if (!currentWorkout) {
        throw new Error('No active workout');
      }

      const exerciseIndex = currentWorkout.exercises.findIndex(e => e.exerciseId === exerciseId);
      if (exerciseIndex === -1) {
        throw new Error('Exercise not found in workout');
      }

      const newSet = {
        reps: set.reps,
        weight: set.weight,
        completed: set.completed ?? true,
        restTime: 0,
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

      await AsyncStorage.setItem(
        WorkoutService.STORAGE_KEYS.CURRENT_WORKOUT,
        JSON.stringify(updatedWorkout)
      );
    } catch (error) {
      throw new Error(`Failed to add set to exercise: ${error.message}`);
    }
  }

  async completeWorkout(): Promise<Workout> {
    try {
      const currentWorkout = await this.getCurrentWorkout();
      if (!currentWorkout) {
        throw new Error('No active workout to complete');
      }

      if (currentWorkout.exercises.length === 0) {
        throw new Error('Cannot complete workout with no exercises');
      }

      const completedWorkout = {
        ...currentWorkout,
        endTime: new Date(),
      };

      // Add to history
      const historyData = await AsyncStorage.getItem(WorkoutService.STORAGE_KEYS.WORKOUT_HISTORY);
      const history: Workout[] = historyData ? JSON.parse(historyData) : [];
      const updatedHistory = [completedWorkout, ...history];

      // Save to history and remove current workout
      await Promise.all([
        AsyncStorage.setItem(WorkoutService.STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(updatedHistory)),
        AsyncStorage.removeItem(WorkoutService.STORAGE_KEYS.CURRENT_WORKOUT),
      ]);

      return completedWorkout;
    } catch (error) {
      throw new Error(`Failed to complete workout: ${error.message}`);
    }
  }

  async getWorkoutHistory(limit?: number, offset?: number): Promise<Workout[]> {
    try {
      const historyData = await AsyncStorage.getItem(WorkoutService.STORAGE_KEYS.WORKOUT_HISTORY);
      if (!historyData) return [];

      let history: Workout[] = JSON.parse(historyData);

      // Convert date strings back to Date objects
      history = history.map(workout => ({
        ...workout,
        startTime: new Date(workout.startTime),
        endTime: workout.endTime ? new Date(workout.endTime) : null,
      }));

      // Sort by start time descending (most recent first)
      history.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

      // Apply pagination
      const start = offset || 0;
      const end = limit ? start + limit : undefined;

      return history.slice(start, end);
    } catch (error) {
      throw new Error(`Failed to get workout history: ${error.message}`);
    }
  }

  async getWorkoutById(workoutId: string): Promise<Workout | null> {
    try {
      const history = await this.getWorkoutHistory();
      const workout = history.find(w => w.id === workoutId);
      return workout || null;
    } catch (error) {
      throw new Error(`Failed to get workout by ID: ${error.message}`);
    }
  }

  async deleteWorkout(workoutId: string): Promise<boolean> {
    try {
      const historyData = await AsyncStorage.getItem(WorkoutService.STORAGE_KEYS.WORKOUT_HISTORY);
      if (!historyData) return false;

      const history: Workout[] = JSON.parse(historyData);
      const initialLength = history.length;
      const updatedHistory = history.filter(w => w.id !== workoutId);

      if (updatedHistory.length === initialLength) {
        return false; // Workout not found
      }

      await AsyncStorage.setItem(
        WorkoutService.STORAGE_KEYS.WORKOUT_HISTORY,
        JSON.stringify(updatedHistory)
      );

      return true;
    } catch (error) {
      throw new Error(`Failed to delete workout: ${error.message}`);
    }
  }
}