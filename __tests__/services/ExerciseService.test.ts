/**
 * ExerciseService Contract Tests
 * These tests define the expected behavior of the ExerciseService
 * Tests must FAIL initially (TDD approach)
 */

import { ExerciseService } from '../../specs/001-build-a-fitness/contracts/exercise-service';
import { Exercise, ExerciseCategory } from '../../store/fitness/models';

// Mock implementation for testing (will be replaced with actual implementation)
class MockExerciseService implements ExerciseService {
  async getAllExercises(): Promise<Exercise[]> {
    throw new Error('Not implemented');
  }

  async getExerciseById(exerciseId: string): Promise<Exercise | null> {
    throw new Error('Not implemented');
  }

  async searchExercises(query: string): Promise<Exercise[]> {
    throw new Error('Not implemented');
  }

  async getExercisesByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
    throw new Error('Not implemented');
  }

  async getExercisesByEquipment(equipment: string): Promise<Exercise[]> {
    throw new Error('Not implemented');
  }

  async getExercisesByCategory(category: string): Promise<Exercise[]> {
    throw new Error('Not implemented');
  }

  async getMuscleGroups(): Promise<string[]> {
    throw new Error('Not implemented');
  }

  async getEquipmentTypes(): Promise<string[]> {
    throw new Error('Not implemented');
  }

  async getCategories(): Promise<ExerciseCategory[]> {
    throw new Error('Not implemented');
  }
}

describe('ExerciseService Contract', () => {
  let exerciseService: ExerciseService;

  beforeEach(() => {
    exerciseService = new MockExerciseService();
  });

  describe('getAllExercises', () => {
    it('should return all exercises from database', async () => {
      await expect(async () => {
        const exercises = await exerciseService.getAllExercises();
        expect(Array.isArray(exercises)).toBe(true);
        expect(exercises.length).toBeGreaterThan(0);

        // Verify exercise structure
        const firstExercise = exercises[0];
        expect(firstExercise).toHaveProperty('id');
        expect(firstExercise).toHaveProperty('name');
        expect(firstExercise).toHaveProperty('muscleGroups');
        expect(firstExercise).toHaveProperty('equipment');
        expect(firstExercise).toHaveProperty('category');
        expect(firstExercise).toHaveProperty('instructions');
        expect(firstExercise).toHaveProperty('imageUrl');

        expect(Array.isArray(firstExercise.muscleGroups)).toBe(true);
        expect(Array.isArray(firstExercise.equipment)).toBe(true);
      }).rejects.toThrow('Not implemented');
    });
  });

  describe('getExerciseById', () => {
    it('should return exercise by valid ID', async () => {
      await expect(async () => {
        const exercise = await exerciseService.getExerciseById('bench-press');
        expect(exercise).toBeDefined();
        expect(exercise!.id).toBe('bench-press');
        expect(exercise!.name).toBe('Bench Press');
        expect(exercise!.muscleGroups).toContain('chest');
        expect(exercise!.equipment).toContain('barbell');
        expect(exercise!.category).toBe('strength');
      }).rejects.toThrow('Not implemented');
    });

    it('should return null for invalid ID', async () => {
      await expect(async () => {
        const exercise = await exerciseService.getExerciseById('non-existent-exercise');
        expect(exercise).toBeNull();
      }).rejects.toThrow('Not implemented');
    });
  });

  describe('searchExercises', () => {
    it('should return exercises matching search query', async () => {
      await expect(async () => {
        const results = await exerciseService.searchExercises('bench');
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBeGreaterThan(0);

        // Should contain exercises with 'bench' in name
        const benchPress = results.find(e => e.id === 'bench-press');
        expect(benchPress).toBeDefined();
      }).rejects.toThrow('Not implemented');
    });

    it('should return empty array for no matches', async () => {
      await expect(async () => {
        const results = await exerciseService.searchExercises('xyzzyx123');
        expect(results).toEqual([]);
      }).rejects.toThrow('Not implemented');
    });

    it('should be case insensitive', async () => {
      await expect(async () => {
        const lowerResults = await exerciseService.searchExercises('bench');
        const upperResults = await exerciseService.searchExercises('BENCH');
        expect(lowerResults).toEqual(upperResults);
      }).rejects.toThrow('Not implemented');
    });

    it('should support partial matching', async () => {
      await expect(async () => {
        const results = await exerciseService.searchExercises('push');
        expect(results.length).toBeGreaterThan(0);

        // Should include push-ups and potentially other exercises with 'push' in name
        const pushUp = results.find(e => e.name.toLowerCase().includes('push'));
        expect(pushUp).toBeDefined();
      }).rejects.toThrow('Not implemented');
    });
  });

  describe('getExercisesByMuscleGroup', () => {
    it('should return exercises targeting specific muscle group', async () => {
      await expect(async () => {
        const chestExercises = await exerciseService.getExercisesByMuscleGroup('chest');
        expect(Array.isArray(chestExercises)).toBe(true);
        expect(chestExercises.length).toBeGreaterThan(0);

        // All returned exercises should target chest
        chestExercises.forEach(exercise => {
          expect(exercise.muscleGroups).toContain('chest');
        });

        // Should include known chest exercises
        const benchPress = chestExercises.find(e => e.id === 'bench-press');
        expect(benchPress).toBeDefined();
      }).rejects.toThrow('Not implemented');
    });

    it('should return empty array for non-existent muscle group', async () => {
      await expect(async () => {
        const results = await exerciseService.getExercisesByMuscleGroup('non-existent-muscle');
        expect(results).toEqual([]);
      }).rejects.toThrow('Not implemented');
    });
  });

  describe('getExercisesByEquipment', () => {
    it('should return exercises using specific equipment', async () => {
      await expect(async () => {
        const barbellExercises = await exerciseService.getExercisesByEquipment('barbell');
        expect(Array.isArray(barbellExercises)).toBe(true);
        expect(barbellExercises.length).toBeGreaterThan(0);

        // All returned exercises should use barbell
        barbellExercises.forEach(exercise => {
          expect(exercise.equipment).toContain('barbell');
        });

        // Should include known barbell exercises
        const benchPress = barbellExercises.find(e => e.id === 'bench-press');
        expect(benchPress).toBeDefined();
      }).rejects.toThrow('Not implemented');
    });

    it('should return bodyweight exercises', async () => {
      await expect(async () => {
        const bodyweightExercises = await exerciseService.getExercisesByEquipment('bodyweight');
        expect(bodyweightExercises.length).toBeGreaterThan(0);

        const pushUp = bodyweightExercises.find(e => e.id === 'push-up');
        expect(pushUp).toBeDefined();
      }).rejects.toThrow('Not implemented');
    });
  });

  describe('getExercisesByCategory', () => {
    it('should return exercises in specific category', async () => {
      await expect(async () => {
        const strengthExercises = await exerciseService.getExercisesByCategory('strength');
        expect(Array.isArray(strengthExercises)).toBe(true);
        expect(strengthExercises.length).toBeGreaterThan(0);

        // All returned exercises should be strength category
        strengthExercises.forEach(exercise => {
          expect(exercise.category).toBe('strength');
        });
      }).rejects.toThrow('Not implemented');
    });

    it('should return cardio exercises', async () => {
      await expect(async () => {
        const cardioExercises = await exerciseService.getExercisesByCategory('cardio');
        expect(cardioExercises.length).toBeGreaterThan(0);

        cardioExercises.forEach(exercise => {
          expect(exercise.category).toBe('cardio');
        });
      }).rejects.toThrow('Not implemented');
    });
  });

  describe('getMuscleGroups', () => {
    it('should return list of available muscle groups', async () => {
      await expect(async () => {
        const muscleGroups = await exerciseService.getMuscleGroups();
        expect(Array.isArray(muscleGroups)).toBe(true);
        expect(muscleGroups.length).toBeGreaterThan(0);

        // Should include common muscle groups
        expect(muscleGroups).toContain('chest');
        expect(muscleGroups).toContain('back');
        expect(muscleGroups).toContain('legs');
        expect(muscleGroups).toContain('shoulders');
        expect(muscleGroups).toContain('arms');
        expect(muscleGroups).toContain('core');

        // Should not contain duplicates
        const uniqueGroups = [...new Set(muscleGroups)];
        expect(muscleGroups.length).toBe(uniqueGroups.length);
      }).rejects.toThrow('Not implemented');
    });
  });

  describe('getEquipmentTypes', () => {
    it('should return list of available equipment types', async () => {
      await expect(async () => {
        const equipmentTypes = await exerciseService.getEquipmentTypes();
        expect(Array.isArray(equipmentTypes)).toBe(true);
        expect(equipmentTypes.length).toBeGreaterThan(0);

        // Should include common equipment types
        expect(equipmentTypes).toContain('barbell');
        expect(equipmentTypes).toContain('dumbbell');
        expect(equipmentTypes).toContain('bodyweight');
        expect(equipmentTypes).toContain('machine');

        // Should not contain duplicates
        const uniqueTypes = [...new Set(equipmentTypes)];
        expect(equipmentTypes.length).toBe(uniqueTypes.length);
      }).rejects.toThrow('Not implemented');
    });
  });

  describe('getCategories', () => {
    it('should return list of exercise categories', async () => {
      await expect(async () => {
        const categories = await exerciseService.getCategories();
        expect(Array.isArray(categories)).toBe(true);
        expect(categories.length).toBeGreaterThan(0);

        // Verify category structure
        const firstCategory = categories[0];
        expect(firstCategory).toHaveProperty('id');
        expect(firstCategory).toHaveProperty('name');
        expect(firstCategory).toHaveProperty('type');
        expect(['muscle', 'equipment', 'movement']).toContain(firstCategory.type);

        // Should include different types of categories
        const muscleCategories = categories.filter(c => c.type === 'muscle');
        const equipmentCategories = categories.filter(c => c.type === 'equipment');
        const movementCategories = categories.filter(c => c.type === 'movement');

        expect(muscleCategories.length).toBeGreaterThan(0);
        expect(equipmentCategories.length).toBeGreaterThan(0);
        expect(movementCategories.length).toBeGreaterThan(0);
      }).rejects.toThrow('Not implemented');
    });

    it('should support hierarchical categories with parentId', async () => {
      await expect(async () => {
        const categories = await exerciseService.getCategories();

        // Some categories might have parent categories
        const categoriesWithParent = categories.filter(c => c.parentId);
        if (categoriesWithParent.length > 0) {
          const childCategory = categoriesWithParent[0];
          const parentCategory = categories.find(c => c.id === childCategory.parentId);
          expect(parentCategory).toBeDefined();
        }
      }).rejects.toThrow('Not implemented');
    });
  });
});