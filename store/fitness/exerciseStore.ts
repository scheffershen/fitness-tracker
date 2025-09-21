/**
 * Exercise Store - Zustand store for managing exercise library state
 * Handles exercise data, filtering, searching, and categories
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Exercise, ExerciseCategory } from './models';
import { ExerciseService } from './services/ExerciseService';

interface ExerciseFilters {
  search: string;
  muscleGroup: string | null;
  equipment: string | null;
  category: string | null;
  bodyweightOnly: boolean;
  compoundOnly: boolean;
}

interface ExerciseStore {
  // State
  exercises: Exercise[];
  categories: ExerciseCategory[];
  muscleGroups: string[];
  equipmentTypes: string[];
  filteredExercises: Exercise[];
  filters: ExerciseFilters;
  selectedExercise: Exercise | null;
  isLoading: boolean;
  error: string | null;

  // Exercise data actions
  loadExercises: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadMuscleGroups: () => Promise<void>;
  loadEquipmentTypes: () => Promise<void>;
  refreshAllData: () => Promise<void>;

  // Exercise selection actions
  selectExercise: (exerciseId: string) => void;
  getExerciseById: (exerciseId: string) => Exercise | null;
  clearSelectedExercise: () => void;

  // Filtering and search actions
  setSearchFilter: (search: string) => void;
  setMuscleGroupFilter: (muscleGroup: string | null) => void;
  setEquipmentFilter: (equipment: string | null) => void;
  setCategoryFilter: (category: string | null) => void;
  setBodyweightFilter: (bodyweightOnly: boolean) => void;
  setCompoundFilter: (compoundOnly: boolean) => void;
  clearAllFilters: () => void;
  applyFilters: () => void;

  // Utility actions
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const defaultFilters: ExerciseFilters = {
  search: '',
  muscleGroup: null,
  equipment: null,
  category: null,
  bodyweightOnly: false,
  compoundOnly: false,
};

export const useExerciseStore = create<ExerciseStore>()(
  subscribeWithSelector((set, get) => {
    const exerciseService = new ExerciseService();

    return {
      // Initial state
      exercises: [],
      categories: [],
      muscleGroups: [],
      equipmentTypes: [],
      filteredExercises: [],
      filters: { ...defaultFilters },
      selectedExercise: null,
      isLoading: false,
      error: null,

      // Exercise data actions
      loadExercises: async () => {
        try {
          set({ isLoading: true, error: null });
          const exercises = await exerciseService.getAllExercises();
          set({ exercises });
          get().applyFilters(); // Apply current filters to new data
        } catch (error) {
          set({ error: 'Failed to load exercises' });
        } finally {
          set({ isLoading: false });
        }
      },

      loadCategories: async () => {
        try {
          const categories = await exerciseService.getCategories();
          set({ categories });
        } catch (error) {
          set({ error: 'Failed to load exercise categories' });
        }
      },

      loadMuscleGroups: async () => {
        try {
          const muscleGroups = await exerciseService.getMuscleGroups();
          set({ muscleGroups });
        } catch (error) {
          set({ error: 'Failed to load muscle groups' });
        }
      },

      loadEquipmentTypes: async () => {
        try {
          const equipmentTypes = await exerciseService.getEquipmentTypes();
          set({ equipmentTypes });
        } catch (error) {
          set({ error: 'Failed to load equipment types' });
        }
      },

      refreshAllData: async () => {
        try {
          set({ isLoading: true, error: null });
          await Promise.all([
            get().loadExercises(),
            get().loadCategories(),
            get().loadMuscleGroups(),
            get().loadEquipmentTypes(),
          ]);
        } catch (error) {
          set({ error: 'Failed to refresh exercise data' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Exercise selection actions
      selectExercise: (exerciseId: string) => {
        const { exercises } = get();
        const exercise = exercises.find(e => e.id === exerciseId);
        set({ selectedExercise: exercise || null });
      },

      getExerciseById: (exerciseId: string) => {
        const { exercises } = get();
        return exercises.find(e => e.id === exerciseId) || null;
      },

      clearSelectedExercise: () => {
        set({ selectedExercise: null });
      },

      // Filtering and search actions
      setSearchFilter: (search: string) => {
        set({
          filters: { ...get().filters, search }
        });
        get().applyFilters();
      },

      setMuscleGroupFilter: (muscleGroup: string | null) => {
        set({
          filters: { ...get().filters, muscleGroup }
        });
        get().applyFilters();
      },

      setEquipmentFilter: (equipment: string | null) => {
        set({
          filters: { ...get().filters, equipment }
        });
        get().applyFilters();
      },

      setCategoryFilter: (category: string | null) => {
        set({
          filters: { ...get().filters, category }
        });
        get().applyFilters();
      },

      setBodyweightFilter: (bodyweightOnly: boolean) => {
        set({
          filters: { ...get().filters, bodyweightOnly }
        });
        get().applyFilters();
      },

      setCompoundFilter: (compoundOnly: boolean) => {
        set({
          filters: { ...get().filters, compoundOnly }
        });
        get().applyFilters();
      },

      clearAllFilters: () => {
        set({ filters: { ...defaultFilters } });
        get().applyFilters();
      },

      applyFilters: () => {
        const { exercises, filters } = get();

        let filtered = [...exercises];

        // Apply search filter
        if (filters.search.trim()) {
          const searchTerm = filters.search.toLowerCase();
          filtered = filtered.filter(exercise =>
            exercise.name.toLowerCase().includes(searchTerm) ||
            exercise.muscleGroups.some(muscle =>
              muscle.toLowerCase().includes(searchTerm)
            ) ||
            exercise.equipment.some(eq =>
              eq.toLowerCase().includes(searchTerm)
            ) ||
            exercise.category.toLowerCase().includes(searchTerm)
          );
        }

        // Apply muscle group filter
        if (filters.muscleGroup) {
          filtered = filtered.filter(exercise =>
            exercise.muscleGroups.includes(filters.muscleGroup!)
          );
        }

        // Apply equipment filter
        if (filters.equipment) {
          filtered = filtered.filter(exercise =>
            exercise.equipment.includes(filters.equipment!)
          );
        }

        // Apply category filter
        if (filters.category) {
          filtered = filtered.filter(exercise =>
            exercise.category === filters.category
          );
        }

        // Apply bodyweight filter
        if (filters.bodyweightOnly) {
          filtered = filtered.filter(exercise =>
            exercise.equipment.includes('Bodyweight') ||
            exercise.equipment.includes('None')
          );
        }

        // Apply compound filter
        if (filters.compoundOnly) {
          filtered = filtered.filter(exercise =>
            exercise.muscleGroups.length > 1
          );
        }

        set({ filteredExercises: filtered });
      },

      // Utility actions
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
      reset: () => set({
        exercises: [],
        categories: [],
        muscleGroups: [],
        equipmentTypes: [],
        filteredExercises: [],
        filters: { ...defaultFilters },
        selectedExercise: null,
        isLoading: false,
        error: null
      }),
    };
  })
);

// Initialize store on app launch
export const initializeExerciseStore = async () => {
  await useExerciseStore.getState().refreshAllData();
};