/**
 * Exercise Service Contract
 * Defines the interface for exercise database operations
 */

export interface ExerciseService {
  /**
   * Get all exercises
   * @returns Promise<Exercise[]> Complete exercise database
   */
  getAllExercises(): Promise<Exercise[]>;

  /**
   * Get exercise by ID
   * @param exerciseId Exercise identifier
   * @returns Promise<Exercise | null> Exercise data or null if not found
   */
  getExerciseById(exerciseId: string): Promise<Exercise | null>;

  /**
   * Search exercises by name
   * @param query Search term
   * @returns Promise<Exercise[]> Matching exercises
   */
  searchExercises(query: string): Promise<Exercise[]>;

  /**
   * Filter exercises by muscle group
   * @param muscleGroup Target muscle group
   * @returns Promise<Exercise[]> Exercises targeting the muscle group
   */
  getExercisesByMuscleGroup(muscleGroup: string): Promise<Exercise[]>;

  /**
   * Filter exercises by equipment
   * @param equipment Required equipment
   * @returns Promise<Exercise[]> Exercises using the equipment
   */
  getExercisesByEquipment(equipment: string): Promise<Exercise[]>;

  /**
   * Filter exercises by category
   * @param category Exercise category
   * @returns Promise<Exercise[]> Exercises in the category
   */
  getExercisesByCategory(category: string): Promise<Exercise[]>;

  /**
   * Get all muscle groups
   * @returns Promise<string[]> Available muscle groups
   */
  getMuscleGroups(): Promise<string[]>;

  /**
   * Get all equipment types
   * @returns Promise<string[]> Available equipment types
   */
  getEquipmentTypes(): Promise<string[]>;

  /**
   * Get exercise categories
   * @returns Promise<ExerciseCategory[]> Available categories
   */
  getCategories(): Promise<ExerciseCategory[]>;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroups: string[];
  equipment: string[];
  category: string;
  instructions: string;
  imageUrl: string;
}

export interface ExerciseCategory {
  id: string;
  name: string;
  type: 'muscle' | 'equipment' | 'movement';
  parentId?: string;
}