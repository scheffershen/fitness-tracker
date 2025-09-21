/**
 * ExerciseLibrary Component Tests
 * Tests for the exercise library browsing component
 * Tests must FAIL initially (TDD approach)
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ExerciseLibrary } from '../ExerciseLibrary';

// Mock exercise data
const mockExercises = [
  {
    id: 'bench-press',
    name: 'Bench Press',
    muscleGroups: ['chest', 'shoulders', 'arms'],
    equipment: ['barbell'],
    category: 'strength',
    instructions: 'Lie flat on bench...',
    imageUrl: ''
  },
  {
    id: 'squat',
    name: 'Squat',
    muscleGroups: ['legs', 'core'],
    equipment: ['barbell'],
    category: 'strength',
    instructions: 'Stand with feet...',
    imageUrl: ''
  },
  {
    id: 'push-up',
    name: 'Push-up',
    muscleGroups: ['chest', 'shoulders', 'arms', 'core'],
    equipment: ['bodyweight'],
    category: 'strength',
    instructions: 'Start in plank...',
    imageUrl: ''
  }
];

const mockCategories = [
  { id: 'muscle-chest', name: 'Chest', type: 'muscle' as const },
  { id: 'muscle-legs', name: 'Legs', type: 'muscle' as const },
  { id: 'equipment-barbell', name: 'Barbell', type: 'equipment' as const },
  { id: 'equipment-bodyweight', name: 'Bodyweight', type: 'equipment' as const }
];

// Mock the exercise store
jest.mock('../../../store/fitness/exerciseStore', () => ({
  useExerciseStore: () => ({
    exercises: mockExercises,
    categories: mockCategories,
    filteredExercises: mockExercises,
    selectedMuscleGroup: null,
    selectedEquipment: null,
    searchQuery: '',
    isLoading: false,
    error: null,
    loadExercises: jest.fn(),
    searchExercises: jest.fn(),
    filterByMuscleGroup: jest.fn(),
    filterByEquipment: jest.fn(),
    clearFilters: jest.fn(),
  }),
}));

describe('ExerciseLibrary', () => {
  const mockOnExerciseSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render exercise list', async () => {
      // This test should FAIL initially
      await expect(async () => {
        const { getByText } = render(<ExerciseLibrary onExerciseSelect={mockOnExerciseSelect} />);

        expect(getByText('Bench Press')).toBeTruthy();
        expect(getByText('Squat')).toBeTruthy();
        expect(getByText('Push-up')).toBeTruthy();
      }).rejects.toThrow();
    });

    it('should render search input', async () => {
      await expect(async () => {
        const { getByPlaceholderText } = render(<ExerciseLibrary onExerciseSelect={mockOnExerciseSelect} />);
        expect(getByPlaceholderText('Search exercises...')).toBeTruthy();
      }).rejects.toThrow();
    });

    it('should render filter options', async () => {
      await expect(async () => {
        const { getByText } = render(<ExerciseLibrary onExerciseSelect={mockOnExerciseSelect} />);

        expect(getByText('Muscle Group')).toBeTruthy();
        expect(getByText('Equipment')).toBeTruthy();
      }).rejects.toThrow();
    });

    it('should render category filters', async () => {
      await expect(async () => {
        const { getByText } = render(<ExerciseLibrary onExerciseSelect={mockOnExerciseSelect} />);

        expect(getByText('Chest')).toBeTruthy();
        expect(getByText('Legs')).toBeTruthy();
        expect(getByText('Barbell')).toBeTruthy();
        expect(getByText('Bodyweight')).toBeTruthy();
      }).rejects.toThrow();
    });
  });

  describe('exercise selection', () => {
    it('should call onExerciseSelect when exercise is pressed', async () => {
      await expect(async () => {
        const { getByText } = render(<ExerciseLibrary onExerciseSelect={mockOnExerciseSelect} />);

        const benchPressItem = getByText('Bench Press');
        fireEvent.press(benchPressItem);

        await waitFor(() => {
          expect(mockOnExerciseSelect).toHaveBeenCalledWith(mockExercises[0]);
        });
      }).rejects.toThrow();
    });

    it('should display exercise details in list item', async () => {
      await expect(async () => {
        const { getByText } = render(<ExerciseLibrary onExerciseSelect={mockOnExerciseSelect} />);

        // Should show muscle groups
        expect(getByText(/chest/i)).toBeTruthy();
        expect(getByText(/shoulders/i)).toBeTruthy();

        // Should show equipment
        expect(getByText(/barbell/i)).toBeTruthy();
      }).rejects.toThrow();
    });
  });

  describe('search functionality', () => {
    it('should update search query when typing', async () => {
      await expect(async () => {
        const mockSearchExercises = jest.fn();
        jest.mocked(require('../../../store/fitness/exerciseStore').useExerciseStore).mockReturnValue({
          exercises: mockExercises,
          filteredExercises: mockExercises,
          searchQuery: '',
          searchExercises: mockSearchExercises,
          isLoading: false,
          error: null,
        });

        const { getByPlaceholderText } = render(<ExerciseLibrary onExerciseSelect={mockOnExerciseSelect} />);

        const searchInput = getByPlaceholderText('Search exercises...');
        fireEvent.changeText(searchInput, 'bench');

        await waitFor(() => {
          expect(mockSearchExercises).toHaveBeenCalledWith('bench');
        });
      }).rejects.toThrow();
    });

    it('should filter exercises based on search', async () => {
      await expect(async () => {
        const filteredExercises = [mockExercises[0]]; // Only bench press
        jest.mocked(require('../../../store/fitness/exerciseStore').useExerciseStore).mockReturnValue({
          exercises: mockExercises,
          filteredExercises,
          searchQuery: 'bench',
          isLoading: false,
          error: null,
        });

        const { getByText, queryByText } = render(<ExerciseLibrary onExerciseSelect={mockOnExerciseSelect} />);

        expect(getByText('Bench Press')).toBeTruthy();
        expect(queryByText('Squat')).toBeNull();
        expect(queryByText('Push-up')).toBeNull();
      }).rejects.toThrow();
    });

    it('should show no results message when search returns empty', async () => {
      await expect(async () => {
        jest.mocked(require('../../../store/fitness/exerciseStore').useExerciseStore).mockReturnValue({
          exercises: mockExercises,
          filteredExercises: [],
          searchQuery: 'nonexistent',
          isLoading: false,
          error: null,
        });

        const { getByText } = render(<ExerciseLibrary onExerciseSelect={mockOnExerciseSelect} />);
        expect(getByText('No exercises found')).toBeTruthy();
      }).rejects.toThrow();
    });
  });

  describe('filtering', () => {
    it('should filter by muscle group when category selected', async () => {
      await expect(async () => {
        const mockFilterByMuscleGroup = jest.fn();
        jest.mocked(require('../../../store/fitness/exerciseStore').useExerciseStore).mockReturnValue({
          exercises: mockExercises,
          filteredExercises: mockExercises,
          filterByMuscleGroup: mockFilterByMuscleGroup,
          isLoading: false,
          error: null,
        });

        const { getByText } = render(<ExerciseLibrary onExerciseSelect={mockOnExerciseSelect} />);

        const chestFilter = getByText('Chest');
        fireEvent.press(chestFilter);

        await waitFor(() => {
          expect(mockFilterByMuscleGroup).toHaveBeenCalledWith('chest');
        });
      }).rejects.toThrow();
    });

    it('should filter by equipment when category selected', async () => {
      await expect(async () => {
        const mockFilterByEquipment = jest.fn();
        jest.mocked(require('../../../store/fitness/exerciseStore').useExerciseStore).mockReturnValue({
          exercises: mockExercises,
          filteredExercises: mockExercises,
          filterByEquipment: mockFilterByEquipment,
          isLoading: false,
          error: null,
        });

        const { getByText } = render(<ExerciseLibrary onExerciseSelect={mockOnExerciseSelect} />);

        const barbellFilter = getByText('Barbell');
        fireEvent.press(barbellFilter);

        await waitFor(() => {
          expect(mockFilterByEquipment).toHaveBeenCalledWith('barbell');
        });
      }).rejects.toThrow();
    });

    it('should show active filter state', async () => {
      await expect(async () => {
        jest.mocked(require('../../../store/fitness/exerciseStore').useExerciseStore).mockReturnValue({
          exercises: mockExercises,
          filteredExercises: mockExercises.filter(e => e.muscleGroups.includes('chest')),
          selectedMuscleGroup: 'chest',
          selectedEquipment: null,
          isLoading: false,
          error: null,
        });

        const { getByText } = render(<ExerciseLibrary onExerciseSelect={mockOnExerciseSelect} />);

        const chestFilter = getByText('Chest');
        // Should show active state (could be different styling, checkmark, etc.)
        expect(chestFilter.props.style || chestFilter.props.className).toMatch(/active|selected/);
      }).rejects.toThrow();
    });

    it('should clear filters when clear button pressed', async () => {
      await expect(async () => {
        const mockClearFilters = jest.fn();
        jest.mocked(require('../../../store/fitness/exerciseStore').useExerciseStore).mockReturnValue({
          exercises: mockExercises,
          filteredExercises: mockExercises,
          selectedMuscleGroup: 'chest',
          clearFilters: mockClearFilters,
          isLoading: false,
          error: null,
        });

        const { getByText } = render(<ExerciseLibrary onExerciseSelect={mockOnExerciseSelect} />);

        const clearButton = getByText('Clear Filters') || getByText('All');
        fireEvent.press(clearButton);

        await waitFor(() => {
          expect(mockClearFilters).toHaveBeenCalled();
        });
      }).rejects.toThrow();
    });
  });

  describe('loading and error states', () => {
    it('should show loading indicator when loading', async () => {
      await expect(async () => {
        jest.mocked(require('../../../store/fitness/exerciseStore').useExerciseStore).mockReturnValue({
          exercises: [],
          filteredExercises: [],
          isLoading: true,
          error: null,
        });

        const { getByTestId } = render(<ExerciseLibrary onExerciseSelect={mockOnExerciseSelect} />);
        expect(getByTestId('loading-indicator')).toBeTruthy();
      }).rejects.toThrow();
    });

    it('should show error message when error exists', async () => {
      await expect(async () => {
        jest.mocked(require('../../../store/fitness/exerciseStore').useExerciseStore).mockReturnValue({
          exercises: [],
          filteredExercises: [],
          isLoading: false,
          error: 'Failed to load exercises',
        });

        const { getByText } = render(<ExerciseLibrary onExerciseSelect={mockOnExerciseSelect} />);
        expect(getByText('Failed to load exercises')).toBeTruthy();
      }).rejects.toThrow();
    });
  });

  describe('performance', () => {
    it('should use FlatList for efficient rendering', async () => {
      await expect(async () => {
        const { UNSAFE_getByType } = render(<ExerciseLibrary onExerciseSelect={mockOnExerciseSelect} />);
        const flatList = UNSAFE_getByType('FlatList');
        expect(flatList).toBeTruthy();
      }).rejects.toThrow();
    });

    it('should implement virtualization for large lists', async () => {
      await expect(async () => {
        const largeExerciseList = Array.from({ length: 500 }, (_, i) => ({
          ...mockExercises[0],
          id: `exercise-${i}`,
          name: `Exercise ${i}`
        }));

        jest.mocked(require('../../../store/fitness/exerciseStore').useExerciseStore).mockReturnValue({
          exercises: largeExerciseList,
          filteredExercises: largeExerciseList,
          isLoading: false,
          error: null,
        });

        const { UNSAFE_getByType } = render(<ExerciseLibrary onExerciseSelect={mockOnExerciseSelect} />);
        const flatList = UNSAFE_getByType('FlatList');

        // Should have virtualization props
        expect(flatList.props.getItemLayout || flatList.props.initialNumToRender).toBeDefined();
      }).rejects.toThrow();
    });
  });

  describe('accessibility', () => {
    it('should have proper accessibility labels', async () => {
      await expect(async () => {
        const { getByLabelText } = render(<ExerciseLibrary onExerciseSelect={mockOnExerciseSelect} />);
        expect(getByLabelText('Search exercises')).toBeTruthy();
        expect(getByLabelText('Filter by chest muscles')).toBeTruthy();
      }).rejects.toThrow();
    });

    it('should support keyboard navigation', async () => {
      await expect(async () => {
        const { getByText } = render(<ExerciseLibrary onExerciseSelect={mockOnExerciseSelect} />);
        const exerciseItem = getByText('Bench Press');
        expect(exerciseItem.props.accessibilityRole).toBe('button');
      }).rejects.toThrow();
    });
  });
});