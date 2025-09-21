/**
 * Workout Service Contract
 * Defines the interface for workout management operations
 */

export interface WorkoutService {
  /**
   * Create a new workout session
   * @param name Optional workout name
   * @returns Promise<Workout> New workout with unique ID
   */
  createWorkout(name?: string): Promise<Workout>;

  /**
   * Get current in-progress workout
   * @returns Promise<Workout | null> Current workout or null if none active
   */
  getCurrentWorkout(): Promise<Workout | null>;

  /**
   * Add exercise to current workout
   * @param exerciseId Exercise to add
   * @returns Promise<void>
   */
  addExerciseToWorkout(exerciseId: string): Promise<void>;

  /**
   * Add set to exercise in current workout
   * @param exerciseId Exercise to add set to
   * @param set Set data
   * @returns Promise<void>
   */
  addSetToExercise(exerciseId: string, set: SetInput): Promise<void>;

  /**
   * Complete current workout
   * @returns Promise<Workout> Completed workout
   */
  completeWorkout(): Promise<Workout>;

  /**
   * Get workout history
   * @param limit Optional limit for pagination
   * @param offset Optional offset for pagination
   * @returns Promise<Workout[]> Array of completed workouts
   */
  getWorkoutHistory(limit?: number, offset?: number): Promise<Workout[]>;

  /**
   * Get specific workout by ID
   * @param workoutId Workout identifier
   * @returns Promise<Workout | null> Workout data or null if not found
   */
  getWorkoutById(workoutId: string): Promise<Workout | null>;

  /**
   * Delete workout
   * @param workoutId Workout to delete
   * @returns Promise<boolean> Success status
   */
  deleteWorkout(workoutId: string): Promise<boolean>;
}

export interface SetInput {
  reps: number;
  weight: number;
  completed?: boolean;
}

export interface Workout {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date | null;
  exercises: WorkoutExercise[];
  notes: string;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: Set[];
  restTime: number;
  notes: string;
}

export interface Set {
  reps: number;
  weight: number;
  completed: boolean;
  restTime: number;
}