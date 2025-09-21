/**
 * ProgressView Component Tests
 * Tests for the progress tracking component
 * Tests must FAIL initially (TDD approach)
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ProgressView } from '../index';

const mockProgressData = {
  workoutFrequency: {
    totalWorkouts: 15,
    averagePerWeek: 3.5,
    longestStreak: 7,
    currentStreak: 3,
    workoutDates: [new Date(), new Date()]
  },
  consistencyMetrics: {
    workoutDays: 15,
    totalDays: 30,
    consistencyPercentage: 50,
    averageWorkoutsPerWeek: 3.5,
    missedDays: 15
  }
};

// Mock the progress store
jest.mock('../../../../store/fitness/progressStore', () => ({
  useProgressStore: () => ({
    workoutFrequency: mockProgressData.workoutFrequency,
    consistencyMetrics: mockProgressData.consistencyMetrics,
    personalRecords: [],
    isLoading: false,
    error: null,
    loadProgressData: jest.fn(),
    getExerciseProgress: jest.fn(),
  }),
}));

describe('ProgressView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render progress overview', async () => {
      // This test should FAIL initially
      await expect(async () => {
        const { getByText } = render(<ProgressView />);
        expect(getByText('Progress Overview')).toBeTruthy();
      }).rejects.toThrow();
    });

    it('should display workout frequency stats', async () => {
      await expect(async () => {
        const { getByText } = render(<ProgressView />);
        expect(getByText('15')).toBeTruthy(); // Total workouts
        expect(getByText('3.5')).toBeTruthy(); // Average per week
        expect(getByText('7')).toBeTruthy(); // Longest streak
      }).rejects.toThrow();
    });

    it('should display consistency percentage', async () => {
      await expect(async () => {
        const { getByText } = render(<ProgressView />);
        expect(getByText('50%')).toBeTruthy(); // Consistency percentage
      }).rejects.toThrow();
    });
  });

  it('should load progress data on mount', async () => {
    await expect(async () => {
      const mockLoadProgressData = jest.fn();
      jest.mocked(require('../../../../store/fitness/progressStore').useProgressStore).mockReturnValue({
        ...mockProgressData,
        loadProgressData: mockLoadProgressData,
        isLoading: false,
        error: null,
      });

      render(<ProgressView />);

      await waitFor(() => {
        expect(mockLoadProgressData).toHaveBeenCalled();
      });
    }).rejects.toThrow();
  });
});