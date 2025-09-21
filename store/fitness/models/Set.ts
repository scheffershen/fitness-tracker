/**
 * Set Model with Validation
 * Implements validation rules from data-model.md
 */

import { Set } from '../models';

export class SetValidator {
  static validate(set: Partial<Set>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate required fields
    if (typeof set.reps !== 'number' || set.reps <= 0 || !Number.isInteger(set.reps)) {
      errors.push('Reps must be a positive integer');
    }

    if (typeof set.weight !== 'number' || set.weight < 0) {
      errors.push('Weight must be a non-negative number');
    }

    if (set.completed !== undefined && typeof set.completed !== 'boolean') {
      errors.push('Completed must be a boolean value');
    }

    if (typeof set.restTime !== 'number' || set.restTime < 0) {
      errors.push('Rest time must be a non-negative number');
    }

    // Validate reasonable ranges
    if (set.reps && set.reps > 1000) {
      errors.push('Reps must be less than 1000');
    }

    if (set.weight && set.weight > 10000) {
      errors.push('Weight must be less than 10000 kg/lbs');
    }

    if (set.restTime && set.restTime > 7200) {
      errors.push('Rest time must be less than 2 hours (7200 seconds)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static sanitize(set: Partial<Set>): Set {
    return {
      reps: Math.max(0, Math.floor(set.reps || 0)),
      weight: Math.max(0, set.weight || 0),
      completed: set.completed !== undefined ? set.completed : true,
      restTime: Math.max(0, set.restTime || 0)
    };
  }
}

export class SetModel {
  private data: Set;

  constructor(data: Partial<Set>) {
    const validation = SetValidator.validate(data);
    if (!validation.isValid) {
      throw new Error(`Invalid set data: ${validation.errors.join(', ')}`);
    }
    this.data = SetValidator.sanitize(data);
  }

  get reps(): number {
    return this.data.reps;
  }

  get weight(): number {
    return this.data.weight;
  }

  get completed(): boolean {
    return this.data.completed;
  }

  get restTime(): number {
    return this.data.restTime;
  }

  toPlainObject(): Set {
    return {
      reps: this.data.reps,
      weight: this.data.weight,
      completed: this.data.completed,
      restTime: this.data.restTime
    };
  }

  getVolume(): number {
    return this.data.reps * this.data.weight;
  }

  getEstimatedOneRepMax(): number {
    // Using Brzycki formula: 1RM = weight × (36 / (37 - reps))
    if (this.data.reps === 1) return this.data.weight;
    if (this.data.reps > 36) return this.data.weight; // Formula breaks down beyond 36 reps

    return this.data.weight * (36 / (37 - this.data.reps));
  }

  getIntensityCategory(): 'light' | 'moderate' | 'heavy' | 'max' {
    if (this.data.reps >= 15) return 'light';
    if (this.data.reps >= 8) return 'moderate';
    if (this.data.reps >= 3) return 'heavy';
    return 'max';
  }

  markCompleted(): SetModel {
    return new SetModel({ ...this.data, completed: true });
  }

  markIncomplete(): SetModel {
    return new SetModel({ ...this.data, completed: false });
  }

  updateRestTime(restTime: number): SetModel {
    return new SetModel({ ...this.data, restTime });
  }

  isPersonalRecord(previousBest?: Set): boolean {
    if (!previousBest) return true;

    // Check if this is a PR by volume (weight × reps)
    const currentVolume = this.getVolume();
    const previousVolume = previousBest.reps * previousBest.weight;

    return currentVolume > previousVolume;
  }

  static compareByVolume(a: Set, b: Set): number {
    const volumeA = a.reps * a.weight;
    const volumeB = b.reps * b.weight;
    return volumeB - volumeA; // Descending order
  }

  static compareByWeight(a: Set, b: Set): number {
    return b.weight - a.weight; // Descending order
  }

  static compareByReps(a: Set, b: Set): number {
    return b.reps - a.reps; // Descending order
  }
}