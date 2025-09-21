/**
 * Progress Store - Zustand store for managing progress tracking state
 * Handles progress metrics, personal records, and statistics
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  TimeRange,
  ProgressMetrics,
  FrequencyData,
  PersonalRecord,
  VolumeData,
  ConsistencyMetrics,
  StrengthProgression
} from './models';
import { ProgressService } from './services/ProgressService';

interface ProgressFilters {
  timeRange: TimeRange;
  exerciseIds: string[];
}

interface ProgressStore {
  // State
  progressMetrics: Record<string, ProgressMetrics>;
  personalRecords: PersonalRecord[];
  workoutFrequency: FrequencyData | null;
  totalVolume: VolumeData | null;
  consistencyMetrics: ConsistencyMetrics | null;
  strengthProgressions: Record<string, StrengthProgression>;
  filters: ProgressFilters;
  selectedExerciseId: string | null;
  isLoading: boolean;
  error: string | null;

  // Progress data actions
  loadExerciseProgress: (exerciseId: string, timeRange?: TimeRange) => Promise<void>;
  loadPersonalRecords: () => Promise<void>;
  loadWorkoutFrequency: (timeRange?: TimeRange) => Promise<void>;
  loadTotalVolume: (timeRange?: TimeRange) => Promise<void>;
  loadConsistencyMetrics: (timeRange?: TimeRange) => Promise<void>;
  loadStrengthProgression: (exerciseId: string, timeRange?: TimeRange) => Promise<void>;
  refreshAllProgress: () => Promise<void>;

  // Filter and time range actions
  setTimeRange: (timeRange: TimeRange) => void;
  setSelectedExercise: (exerciseId: string | null) => void;
  addExerciseToFilters: (exerciseId: string) => void;
  removeExerciseFromFilters: (exerciseId: string) => void;
  clearExerciseFilters: () => void;

  // Data retrieval helpers
  getExerciseProgress: (exerciseId: string) => ProgressMetrics | null;
  getExercisePersonalRecord: (exerciseId: string) => PersonalRecord | null;
  getStrengthProgression: (exerciseId: string) => StrengthProgression | null;
  getProgressSummary: () => {
    totalWorkouts: number;
    totalVolume: number;
    averageConsistency: number;
    recordCount: number;
  };

  // Time range presets
  setLastWeek: () => void;
  setLastMonth: () => void;
  setLast3Months: () => void;
  setLast6Months: () => void;
  setLastYear: () => void;
  setAllTime: () => void;

  // Utility actions
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const createTimeRange = (daysBack: number): TimeRange => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  return { startDate, endDate };
};

const defaultTimeRange = createTimeRange(30); // Last 30 days

const defaultFilters: ProgressFilters = {
  timeRange: defaultTimeRange,
  exerciseIds: [],
};

export const useProgressStore = create<ProgressStore>()(
  subscribeWithSelector((set, get) => {
    const progressService = new ProgressService();

    return {
      // Initial state
      progressMetrics: {},
      personalRecords: [],
      workoutFrequency: null,
      totalVolume: null,
      consistencyMetrics: null,
      strengthProgressions: {},
      filters: { ...defaultFilters },
      selectedExerciseId: null,
      isLoading: false,
      error: null,

      // Progress data actions
      loadExerciseProgress: async (exerciseId: string, timeRange?: TimeRange) => {
        try {
          set({ isLoading: true, error: null });
          const range = timeRange || get().filters.timeRange;
          const progress = await progressService.getExerciseProgress(exerciseId, range);

          set({
            progressMetrics: {
              ...get().progressMetrics,
              [exerciseId]: progress
            }
          });
        } catch (error) {
          set({ error: `Failed to load progress for exercise: ${error.message}` });
        } finally {
          set({ isLoading: false });
        }
      },

      loadPersonalRecords: async () => {
        try {
          set({ isLoading: true, error: null });
          const records = await progressService.getPersonalRecords();
          set({ personalRecords: records });
        } catch (error) {
          set({ error: 'Failed to load personal records' });
        } finally {
          set({ isLoading: false });
        }
      },

      loadWorkoutFrequency: async (timeRange?: TimeRange) => {
        try {
          set({ isLoading: true, error: null });
          const range = timeRange || get().filters.timeRange;
          const frequency = await progressService.getWorkoutFrequency(range);
          set({ workoutFrequency: frequency });
        } catch (error) {
          set({ error: 'Failed to load workout frequency' });
        } finally {
          set({ isLoading: false });
        }
      },

      loadTotalVolume: async (timeRange?: TimeRange) => {
        try {
          set({ isLoading: true, error: null });
          const range = timeRange || get().filters.timeRange;
          const volume = await progressService.getTotalVolume(range);
          set({ totalVolume: volume });
        } catch (error) {
          set({ error: 'Failed to load total volume' });
        } finally {
          set({ isLoading: false });
        }
      },

      loadConsistencyMetrics: async (timeRange?: TimeRange) => {
        try {
          set({ isLoading: true, error: null });
          const range = timeRange || get().filters.timeRange;
          const consistency = await progressService.getConsistencyMetrics(range);
          set({ consistencyMetrics: consistency });
        } catch (error) {
          set({ error: 'Failed to load consistency metrics' });
        } finally {
          set({ isLoading: false });
        }
      },

      loadStrengthProgression: async (exerciseId: string, timeRange?: TimeRange) => {
        try {
          set({ isLoading: true, error: null });
          const range = timeRange || get().filters.timeRange;
          const progression = await progressService.getStrengthProgression(exerciseId, range);

          set({
            strengthProgressions: {
              ...get().strengthProgressions,
              [exerciseId]: progression
            }
          });
        } catch (error) {
          set({ error: `Failed to load strength progression: ${error.message}` });
        } finally {
          set({ isLoading: false });
        }
      },

      refreshAllProgress: async () => {
        try {
          set({ isLoading: true, error: null });
          const { filters, selectedExerciseId } = get();

          // Load all general progress data
          await Promise.all([
            get().loadPersonalRecords(),
            get().loadWorkoutFrequency(filters.timeRange),
            get().loadTotalVolume(filters.timeRange),
            get().loadConsistencyMetrics(filters.timeRange),
          ]);

          // Load exercise-specific data if exercises are selected
          if (filters.exerciseIds.length > 0) {
            await Promise.all(
              filters.exerciseIds.map(exerciseId =>
                Promise.all([
                  get().loadExerciseProgress(exerciseId, filters.timeRange),
                  get().loadStrengthProgression(exerciseId, filters.timeRange),
                ])
              )
            );
          }

          // Load selected exercise data
          if (selectedExerciseId) {
            await Promise.all([
              get().loadExerciseProgress(selectedExerciseId, filters.timeRange),
              get().loadStrengthProgression(selectedExerciseId, filters.timeRange),
            ]);
          }
        } catch (error) {
          set({ error: 'Failed to refresh progress data' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Filter and time range actions
      setTimeRange: (timeRange: TimeRange) => {
        set({
          filters: { ...get().filters, timeRange }
        });
        // Automatically refresh data with new time range
        get().refreshAllProgress();
      },

      setSelectedExercise: (exerciseId: string | null) => {
        set({ selectedExerciseId: exerciseId });
        if (exerciseId) {
          get().loadExerciseProgress(exerciseId);
          get().loadStrengthProgression(exerciseId);
        }
      },

      addExerciseToFilters: (exerciseId: string) => {
        const { filters } = get();
        if (!filters.exerciseIds.includes(exerciseId)) {
          const updatedFilters = {
            ...filters,
            exerciseIds: [...filters.exerciseIds, exerciseId]
          };
          set({ filters: updatedFilters });

          // Load data for the new exercise
          get().loadExerciseProgress(exerciseId);
          get().loadStrengthProgression(exerciseId);
        }
      },

      removeExerciseFromFilters: (exerciseId: string) => {
        const { filters, progressMetrics, strengthProgressions } = get();
        const updatedFilters = {
          ...filters,
          exerciseIds: filters.exerciseIds.filter(id => id !== exerciseId)
        };

        // Remove cached data for this exercise
        const updatedMetrics = { ...progressMetrics };
        const updatedProgressions = { ...strengthProgressions };
        delete updatedMetrics[exerciseId];
        delete updatedProgressions[exerciseId];

        set({
          filters: updatedFilters,
          progressMetrics: updatedMetrics,
          strengthProgressions: updatedProgressions
        });
      },

      clearExerciseFilters: () => {
        set({
          filters: { ...get().filters, exerciseIds: [] },
          progressMetrics: {},
          strengthProgressions: {}
        });
      },

      // Data retrieval helpers
      getExerciseProgress: (exerciseId: string) => {
        return get().progressMetrics[exerciseId] || null;
      },

      getExercisePersonalRecord: (exerciseId: string) => {
        const { personalRecords } = get();
        return personalRecords.find(record => record.exerciseId === exerciseId) || null;
      },

      getStrengthProgression: (exerciseId: string) => {
        return get().strengthProgressions[exerciseId] || null;
      },

      getProgressSummary: () => {
        const { workoutFrequency, totalVolume, consistencyMetrics, personalRecords } = get();

        return {
          totalWorkouts: workoutFrequency?.totalWorkouts || 0,
          totalVolume: totalVolume?.totalVolume || 0,
          averageConsistency: consistencyMetrics?.consistencyPercentage || 0,
          recordCount: personalRecords.length
        };
      },

      // Time range presets
      setLastWeek: () => {
        get().setTimeRange(createTimeRange(7));
      },

      setLastMonth: () => {
        get().setTimeRange(createTimeRange(30));
      },

      setLast3Months: () => {
        get().setTimeRange(createTimeRange(90));
      },

      setLast6Months: () => {
        get().setTimeRange(createTimeRange(180));
      },

      setLastYear: () => {
        get().setTimeRange(createTimeRange(365));
      },

      setAllTime: () => {
        const startDate = new Date('2020-01-01'); // Arbitrary early date
        const endDate = new Date();
        get().setTimeRange({ startDate, endDate });
      },

      // Utility actions
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
      reset: () => set({
        progressMetrics: {},
        personalRecords: [],
        workoutFrequency: null,
        totalVolume: null,
        consistencyMetrics: null,
        strengthProgressions: {},
        filters: { ...defaultFilters },
        selectedExerciseId: null,
        isLoading: false,
        error: null
      }),
    };
  })
);

// Initialize store on app launch
export const initializeProgressStore = async () => {
  await useProgressStore.getState().refreshAllProgress();
};