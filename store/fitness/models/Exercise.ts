/**
 * Exercise Model with Validation
 * Implements validation rules from data-model.md
 */

import { Exercise } from '../models';

export class ExerciseValidator {
  static validate(exercise: Partial<Exercise>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate required fields
    if (!exercise.id || exercise.id.trim() === '') {
      errors.push('Exercise ID is required');
    }

    if (!exercise.name || exercise.name.trim() === '') {
      errors.push('Exercise name is required');
    }

    if (!exercise.muscleGroups || exercise.muscleGroups.length === 0) {
      errors.push('At least one muscle group is required');
    }

    if (!exercise.equipment) {
      errors.push('Equipment field is required (can be empty array for bodyweight)');
    }

    if (!exercise.category || exercise.category.trim() === '') {
      errors.push('Exercise category is required');
    }

    // Validate data types
    if (exercise.muscleGroups && !Array.isArray(exercise.muscleGroups)) {
      errors.push('Muscle groups must be an array');
    }

    if (exercise.equipment && !Array.isArray(exercise.equipment)) {
      errors.push('Equipment must be an array');
    }

    // Validate enum values
    const validCategories = ['strength', 'cardio', 'flexibility', 'sports'];
    if (exercise.category && !validCategories.includes(exercise.category)) {
      errors.push(`Category must be one of: ${validCategories.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static sanitize(exercise: Partial<Exercise>): Exercise {
    return {
      id: exercise.id?.trim() || '',
      name: exercise.name?.trim() || '',
      muscleGroups: exercise.muscleGroups || [],
      equipment: exercise.equipment || [],
      category: exercise.category?.trim() || 'strength',
      instructions: exercise.instructions?.trim() || '',
      imageUrl: exercise.imageUrl?.trim() || ''
    };
  }

  static isComplete(exercise: Partial<Exercise>): exercise is Exercise {
    const validation = ExerciseValidator.validate(exercise);
    return validation.isValid;
  }
}

export class ExerciseModel {
  private data: Exercise;

  constructor(data: Partial<Exercise>) {
    const validation = ExerciseValidator.validate(data);
    if (!validation.isValid) {
      throw new Error(`Invalid exercise data: ${validation.errors.join(', ')}`);
    }
    this.data = ExerciseValidator.sanitize(data);
  }

  get id(): string {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get muscleGroups(): string[] {
    return [...this.data.muscleGroups];
  }

  get equipment(): string[] {
    return [...this.data.equipment];
  }

  get category(): string {
    return this.data.category;
  }

  get instructions(): string {
    return this.data.instructions;
  }

  get imageUrl(): string {
    return this.data.imageUrl;
  }

  toPlainObject(): Exercise {
    return {
      id: this.data.id,
      name: this.data.name,
      muscleGroups: [...this.data.muscleGroups],
      equipment: [...this.data.equipment],
      category: this.data.category,
      instructions: this.data.instructions,
      imageUrl: this.data.imageUrl
    };
  }

  matchesMuscleGroup(muscleGroup: string): boolean {
    return this.data.muscleGroups.includes(muscleGroup.toLowerCase());
  }

  matchesEquipment(equipment: string): boolean {
    return this.data.equipment.includes(equipment.toLowerCase());
  }

  matchesSearch(query: string): boolean {
    const searchTerm = query.toLowerCase();
    return (
      this.data.name.toLowerCase().includes(searchTerm) ||
      this.data.muscleGroups.some(mg => mg.toLowerCase().includes(searchTerm)) ||
      this.data.equipment.some(eq => eq.toLowerCase().includes(searchTerm)) ||
      this.data.category.toLowerCase().includes(searchTerm)
    );
  }

  isBodyweight(): boolean {
    return this.data.equipment.length === 0 || this.data.equipment.includes('bodyweight');
  }

  getCompoundMuscles(): string[] {
    return this.data.muscleGroups.filter(mg =>
      ['full_body', 'core'].includes(mg) || this.data.muscleGroups.length > 2
    );
  }
}