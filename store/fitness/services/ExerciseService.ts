/**
 * ExerciseService Implementation
 * Implements contract from contracts/exercise-service.ts with JSON database
 */

import { Exercise, ExerciseCategory } from '../models';
import { ExerciseModel } from '../models/Exercise';

// Import static data
import exercisesData from '../../../assets/data/exercises.json';
import categoriesData from '../../../assets/data/categories.json';

export class ExerciseService {
  private exercises: Exercise[] = [];
  private categories: ExerciseCategory[] = [];
  private initialized: boolean = false;

  private async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load and validate exercises
      this.exercises = exercisesData.map(exerciseData => {
        const exerciseModel = new ExerciseModel(exerciseData);
        return exerciseModel.toPlainObject();
      });

      // Load categories
      this.categories = categoriesData as ExerciseCategory[];

      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize exercise service: ${error.message}`);
    }
  }

  async getAllExercises(): Promise<Exercise[]> {
    await this.initialize();
    return [...this.exercises];
  }

  async getExerciseById(exerciseId: string): Promise<Exercise | null> {
    await this.initialize();
    const exercise = this.exercises.find(e => e.id === exerciseId);
    return exercise ? { ...exercise } : null;
  }

  async searchExercises(query: string): Promise<Exercise[]> {
    await this.initialize();

    if (!query.trim()) {
      return [...this.exercises];
    }

    const searchTerm = query.toLowerCase();

    return this.exercises.filter(exercise => {
      const exerciseModel = new ExerciseModel(exercise);
      return exerciseModel.matchesSearch(searchTerm);
    });
  }

  async getExercisesByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
    await this.initialize();

    return this.exercises.filter(exercise => {
      const exerciseModel = new ExerciseModel(exercise);
      return exerciseModel.matchesMuscleGroup(muscleGroup);
    });
  }

  async getExercisesByEquipment(equipment: string): Promise<Exercise[]> {
    await this.initialize();

    return this.exercises.filter(exercise => {
      const exerciseModel = new ExerciseModel(exercise);
      return exerciseModel.matchesEquipment(equipment);
    });
  }

  async getExercisesByCategory(category: string): Promise<Exercise[]> {
    await this.initialize();

    return this.exercises.filter(exercise => exercise.category === category);
  }

  async getMuscleGroups(): Promise<string[]> {
    await this.initialize();

    const muscleGroups = new Set<string>();
    this.exercises.forEach(exercise => {
      exercise.muscleGroups.forEach(muscle => muscleGroups.add(muscle));
    });

    return Array.from(muscleGroups).sort();
  }

  async getEquipmentTypes(): Promise<string[]> {
    await this.initialize();

    const equipmentTypes = new Set<string>();
    this.exercises.forEach(exercise => {
      exercise.equipment.forEach(equipment => equipmentTypes.add(equipment));
    });

    return Array.from(equipmentTypes).sort();
  }

  async getCategories(): Promise<ExerciseCategory[]> {
    await this.initialize();
    return [...this.categories];
  }

  // Additional utility methods
  async getExercisesByMultipleFilters(filters: {
    muscleGroup?: string;
    equipment?: string;
    category?: string;
    search?: string;
  }): Promise<Exercise[]> {
    await this.initialize();

    let filteredExercises = [...this.exercises];

    if (filters.muscleGroup) {
      filteredExercises = filteredExercises.filter(exercise => {
        const exerciseModel = new ExerciseModel(exercise);
        return exerciseModel.matchesMuscleGroup(filters.muscleGroup!);
      });
    }

    if (filters.equipment) {
      filteredExercises = filteredExercises.filter(exercise => {
        const exerciseModel = new ExerciseModel(exercise);
        return exerciseModel.matchesEquipment(filters.equipment!);
      });
    }

    if (filters.category) {
      filteredExercises = filteredExercises.filter(exercise =>
        exercise.category === filters.category
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredExercises = filteredExercises.filter(exercise => {
        const exerciseModel = new ExerciseModel(exercise);
        return exerciseModel.matchesSearch(searchTerm);
      });
    }

    return filteredExercises;
  }

  async getBodyweightExercises(): Promise<Exercise[]> {
    await this.initialize();

    return this.exercises.filter(exercise => {
      const exerciseModel = new ExerciseModel(exercise);
      return exerciseModel.isBodyweight();
    });
  }

  async getCompoundExercises(): Promise<Exercise[]> {
    await this.initialize();

    return this.exercises.filter(exercise => {
      const exerciseModel = new ExerciseModel(exercise);
      return exerciseModel.getCompoundMuscles().length > 0;
    });
  }
}