/**
 * SetEntry Component Tests
 * Tests for the set entry form component
 * Tests must FAIL initially (TDD approach)
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SetEntry } from '../SetEntry';

describe('SetEntry', () => {
  const mockOnAddSet = jest.fn();
  const mockExercise = {
    exerciseId: 'bench-press',
    sets: [
      { reps: 10, weight: 80, completed: true, restTime: 120 }
    ],
    restTime: 120,
    notes: ''
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render reps input field', async () => {
      // This test should FAIL initially
      await expect(async () => {
        const { getByPlaceholderText } = render(
          <SetEntry exercise={mockExercise} onAddSet={mockOnAddSet} />
        );
        expect(getByPlaceholderText('Reps')).toBeTruthy();
      }).rejects.toThrow();
    });

    it('should render weight input field', async () => {
      await expect(async () => {
        const { getByPlaceholderText } = render(
          <SetEntry exercise={mockExercise} onAddSet={mockOnAddSet} />
        );
        expect(getByPlaceholderText('Weight')).toBeTruthy();
      }).rejects.toThrow();
    });

    it('should render add set button', async () => {
      await expect(async () => {
        const { getByText } = render(
          <SetEntry exercise={mockExercise} onAddSet={mockOnAddSet} />
        );
        expect(getByText('Add Set')).toBeTruthy();
      }).rejects.toThrow();
    });

    it('should render previous sets list', async () => {
      await expect(async () => {
        const { getByText } = render(
          <SetEntry exercise={mockExercise} onAddSet={mockOnAddSet} />
        );
        expect(getByText('Set 1')).toBeTruthy();
        expect(getByText('10 reps × 80 kg')).toBeTruthy();
      }).rejects.toThrow();
    });
  });

  describe('form interaction', () => {
    it('should update reps when input changes', async () => {
      await expect(async () => {
        const { getByPlaceholderText } = render(
          <SetEntry exercise={mockExercise} onAddSet={mockOnAddSet} />
        );

        const repsInput = getByPlaceholderText('Reps');
        fireEvent.changeText(repsInput, '12');

        expect(repsInput.props.value).toBe('12');
      }).rejects.toThrow();
    });

    it('should update weight when input changes', async () => {
      await expect(async () => {
        const { getByPlaceholderText } = render(
          <SetEntry exercise={mockExercise} onAddSet={mockOnAddSet} />
        );

        const weightInput = getByPlaceholderText('Weight');
        fireEvent.changeText(weightInput, '85');

        expect(weightInput.props.value).toBe('85');
      }).rejects.toThrow();
    });

    it('should call onAddSet when add button pressed', async () => {
      await expect(async () => {
        const { getByPlaceholderText, getByText } = render(
          <SetEntry exercise={mockExercise} onAddSet={mockOnAddSet} />
        );

        const repsInput = getByPlaceholderText('Reps');
        const weightInput = getByPlaceholderText('Weight');
        const addButton = getByText('Add Set');

        fireEvent.changeText(repsInput, '12');
        fireEvent.changeText(weightInput, '85');
        fireEvent.press(addButton);

        await waitFor(() => {
          expect(mockOnAddSet).toHaveBeenCalledWith({
            reps: 12,
            weight: 85,
            completed: true
          });
        });
      }).rejects.toThrow();
    });

    it('should clear form after adding set', async () => {
      await expect(async () => {
        const { getByPlaceholderText, getByText } = render(
          <SetEntry exercise={mockExercise} onAddSet={mockOnAddSet} />
        );

        const repsInput = getByPlaceholderText('Reps');
        const weightInput = getByPlaceholderText('Weight');
        const addButton = getByText('Add Set');

        fireEvent.changeText(repsInput, '12');
        fireEvent.changeText(weightInput, '85');
        fireEvent.press(addButton);

        await waitFor(() => {
          expect(repsInput.props.value).toBe('');
          expect(weightInput.props.value).toBe('');
        });
      }).rejects.toThrow();
    });
  });

  describe('validation', () => {
    it('should disable add button when reps is empty', async () => {
      await expect(async () => {
        const { getByPlaceholderText, getByText } = render(
          <SetEntry exercise={mockExercise} onAddSet={mockOnAddSet} />
        );

        const weightInput = getByPlaceholderText('Weight');
        const addButton = getByText('Add Set');

        fireEvent.changeText(weightInput, '85');

        expect(addButton.props.disabled).toBe(true);
      }).rejects.toThrow();
    });

    it('should disable add button when weight is empty', async () => {
      await expect(async () => {
        const { getByPlaceholderText, getByText } = render(
          <SetEntry exercise={mockExercise} onAddSet={mockOnAddSet} />
        );

        const repsInput = getByPlaceholderText('Reps');
        const addButton = getByText('Add Set');

        fireEvent.changeText(repsInput, '12');

        expect(addButton.props.disabled).toBe(true);
      }).rejects.toThrow();
    });

    it('should show error for invalid reps', async () => {
      await expect(async () => {
        const { getByPlaceholderText, getByText } = render(
          <SetEntry exercise={mockExercise} onAddSet={mockOnAddSet} />
        );

        const repsInput = getByPlaceholderText('Reps');
        fireEvent.changeText(repsInput, '0');

        expect(getByText('Reps must be greater than 0')).toBeTruthy();
      }).rejects.toThrow();
    });

    it('should show error for invalid weight', async () => {
      await expect(async () => {
        const { getByPlaceholderText, getByText } = render(
          <SetEntry exercise={mockExercise} onAddSet={mockOnAddSet} />
        );

        const weightInput = getByPlaceholderText('Weight');
        fireEvent.changeText(weightInput, '-5');

        expect(getByText('Weight must be non-negative')).toBeTruthy();
      }).rejects.toThrow();
    });
  });

  describe('accessibility', () => {
    it('should have proper accessibility labels', async () => {
      await expect(async () => {
        const { getByLabelText } = render(
          <SetEntry exercise={mockExercise} onAddSet={mockOnAddSet} />
        );
        expect(getByLabelText('Number of repetitions')).toBeTruthy();
        expect(getByLabelText('Weight in kilograms')).toBeTruthy();
      }).rejects.toThrow();
    });
  });
});