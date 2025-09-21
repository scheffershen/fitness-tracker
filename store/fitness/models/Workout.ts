/**
 * Workout Model with Validation
 * Implements validation rules from data-model.md
 */

import { Workout, WorkoutExercise } from '../models';

export class WorkoutValidator {
  static validate(workout: Partial<Workout>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate required fields
    if (!workout.id || workout.id.trim() === '') {
      errors.push('Workout ID is required');
    }

    if (!workout.name || workout.name.trim() === '') {
      errors.push('Workout name is required');
    }

    if (!workout.startTime || !(workout.startTime instanceof Date)) {
      errors.push('Valid start time is required');
    }

    // Validate optional fields
    if (workout.endTime && !(workout.endTime instanceof Date)) {
      errors.push('End time must be a valid Date if provided');
    }

    if (workout.startTime && workout.endTime && workout.endTime.getTime() <= workout.startTime.getTime()) {
      errors.push('End time must be after start time');
    }

    if (!workout.exercises || !Array.isArray(workout.exercises)) {
      errors.push('Exercises must be an array');
    }

    if (workout.notes && typeof workout.notes !== 'string') {
      errors.push('Notes must be a string');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static sanitize(workout: Partial<Workout>): Workout {
    return {
      id: workout.id?.trim() || '',
      name: workout.name?.trim() || '',
      startTime: workout.startTime || new Date(),
      endTime: workout.endTime || null,
      exercises: workout.exercises || [],
      notes: workout.notes?.trim() || ''
    };
  }
}

export class WorkoutModel {
  private data: Workout;

  constructor(data: Partial<Workout>) {
    const validation = WorkoutValidator.validate(data);
    if (!validation.isValid) {
      throw new Error(`Invalid workout data: ${validation.errors.join(', ')}`);
    }
    this.data = WorkoutValidator.sanitize(data);
  }

  get id(): string {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get startTime(): Date {
    return new Date(this.data.startTime);
  }

  get endTime(): Date | null {
    return this.data.endTime ? new Date(this.data.endTime) : null;
  }

  get exercises(): WorkoutExercise[] {
    return [...this.data.exercises];
  }

  get notes(): string {
    return this.data.notes;
  }

  toPlainObject(): Workout {
    return {
      id: this.data.id,
      name: this.data.name,
      startTime: new Date(this.data.startTime),
      endTime: this.data.endTime ? new Date(this.data.endTime) : null,
      exercises: [...this.data.exercises],
      notes: this.data.notes
    };
  }

  getDuration(): number | null {
    if (!this.data.endTime) return null;
    return this.data.endTime.getTime() - this.data.startTime.getTime();
  }

  getDurationMinutes(): number | null {
    const duration = this.getDuration();
    return duration ? Math.round(duration / (1000 * 60)) : null;
  }

  isInProgress(): boolean {
    return this.data.endTime === null;
  }

  isCompleted(): boolean {
    return this.data.endTime !== null;
  }

  getTotalSets(): number {
    return this.data.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  }

  getTotalVolume(): number {
    return this.data.exercises.reduce((total, exercise) => {
      return total + exercise.sets.reduce((exerciseTotal, set) => {
        return exerciseTotal + (set.reps * set.weight);
      }, 0);
    }, 0);
  }

  getUniqueExerciseIds(): string[] {
    return Array.from(new Set(this.data.exercises.map(e => e.exerciseId)));
  }

  hasExercise(exerciseId: string): boolean {
    return this.data.exercises.some(e => e.exerciseId === exerciseId);
  }

  getExercise(exerciseId: string): WorkoutExercise | null {
    return this.data.exercises.find(e => e.exerciseId === exerciseId) || null;
  }

  complete(endTime?: Date): WorkoutModel {
    const completedData = {
      ...this.data,
      endTime: endTime || new Date()
    };
    return new WorkoutModel(completedData);
  }

  addExercise(exercise: WorkoutExercise): WorkoutModel {
    if (this.hasExercise(exercise.exerciseId)) {
      throw new Error('Exercise already exists in workout');
    }

    const updatedData = {
      ...this.data,
      exercises: [...this.data.exercises, exercise]
    };
    return new WorkoutModel(updatedData);
  }

  removeExercise(exerciseId: string): WorkoutModel {
    const updatedData = {
      ...this.data,
      exercises: this.data.exercises.filter(e => e.exerciseId !== exerciseId)
    };
    return new WorkoutModel(updatedData);
  }

  updateNotes(notes: string): WorkoutModel {
    const updatedData = {
      ...this.data,
      notes: notes.trim()
    };
    return new WorkoutModel(updatedData);
  }
}