/**
 * SetEntryForm Component
 * Form for entering reps and weight for a set during a workout
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Keyboard,
} from 'react-native';
import { SetInput } from '~/store/fitness/models';

interface SetEntryFormProps {
  onAddSet: (set: SetInput) => void;
  previousSet?: { reps: number; weight: number };
  isLoading?: boolean;
  exerciseName?: string;
}

export function SetEntryForm({
  onAddSet,
  previousSet,
  isLoading = false,
  exerciseName,
}: SetEntryFormProps) {
  const [reps, setReps] = useState(previousSet?.reps?.toString() || '');
  const [weight, setWeight] = useState(previousSet?.weight?.toString() || '');
  const [isCompleted, setIsCompleted] = useState(true);

  const weightInputRef = useRef<TextInput>(null);

  const handleRepsChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setReps(numericValue);
  };

  const handleWeightChange = (value: string) => {
    // Allow numbers and one decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');

    // Prevent multiple decimal points
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return;
    }

    setWeight(numericValue);
  };

  const validateAndSubmit = () => {
    const repsNum = parseInt(reps);
    const weightNum = parseFloat(weight);

    // Validation
    if (!reps || isNaN(repsNum) || repsNum <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number of reps (greater than 0)');
      return;
    }

    if (!weight || isNaN(weightNum) || weightNum < 0) {
      Alert.alert('Invalid Input', 'Please enter a valid weight (0 or greater)');
      return;
    }

    if (repsNum > 100) {
      Alert.alert('Invalid Input', 'Number of reps cannot exceed 100');
      return;
    }

    if (weightNum > 9999) {
      Alert.alert('Invalid Input', 'Weight cannot exceed 9999');
      return;
    }

    // Submit the set
    const newSet: SetInput = {
      reps: repsNum,
      weight: weightNum,
      completed: isCompleted,
    };

    onAddSet(newSet);

    // Reset form but keep weight for next set
    setReps('');
    // Keep weight the same for convenience
    setIsCompleted(true);

    Keyboard.dismiss();
  };

  const handleRepsFocus = () => {
    // Auto-select text when focusing
    setTimeout(() => {
      setReps('');
    }, 50);
  };

  const handleRepsSubmit = () => {
    // Move to weight input when reps are entered
    weightInputRef.current?.focus();
  };

  const isFormValid = () => {
    const repsNum = parseInt(reps);
    const weightNum = parseFloat(weight);
    return (
      !isNaN(repsNum) &&
      repsNum > 0 &&
      repsNum <= 100 &&
      !isNaN(weightNum) &&
      weightNum >= 0 &&
      weightNum <= 9999
    );
  };

  return (
    <View className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {exerciseName && (
        <Text className="text-lg font-semibold text-gray-900 mb-3">
          {exerciseName}
        </Text>
      )}

      <View className="flex-row space-x-3">
        {/* Reps Input */}
        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Reps
          </Text>
          <TextInput
            value={reps}
            onChangeText={handleRepsChange}
            onFocus={handleRepsFocus}
            onSubmitEditing={handleRepsSubmit}
            placeholder="12"
            keyboardType="numeric"
            returnKeyType="next"
            className="border border-gray-300 rounded-lg px-3 py-3 text-lg font-medium text-center bg-gray-50"
            maxLength={3}
            selectTextOnFocus
            accessibilityLabel="Number of repetitions"
            accessibilityHint="Enter the number of reps for this set"
          />
        </View>

        {/* Weight Input */}
        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Weight (lbs)
          </Text>
          <TextInput
            ref={weightInputRef}
            value={weight}
            onChangeText={handleWeightChange}
            placeholder="135"
            keyboardType="decimal-pad"
            returnKeyType="done"
            onSubmitEditing={validateAndSubmit}
            className="border border-gray-300 rounded-lg px-3 py-3 text-lg font-medium text-center bg-gray-50"
            maxLength={6}
            selectTextOnFocus
            accessibilityLabel="Weight in pounds"
            accessibilityHint="Enter the weight for this set"
          />
        </View>
      </View>

      {/* Completion Toggle */}
      <View className="flex-row items-center justify-between mt-4">
        <Text className="text-sm font-medium text-gray-700">
          Mark as completed
        </Text>
        <TouchableOpacity
          onPress={() => setIsCompleted(!isCompleted)}
          className={`w-12 h-6 rounded-full flex-row items-center px-1 ${
            isCompleted ? 'bg-green-500' : 'bg-gray-300'
          }`}
          activeOpacity={0.8}
        >
          <View
            className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
              isCompleted ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </TouchableOpacity>
      </View>

      {/* Previous Set Reference */}
      {previousSet && (
        <View className="mt-3 p-3 bg-blue-50 rounded-lg">
          <Text className="text-sm text-blue-800">
            Previous set: {previousSet.reps} reps × {previousSet.weight} lbs
          </Text>
        </View>
      )}

      {/* Add Set Button */}
      <TouchableOpacity
        onPress={validateAndSubmit}
        disabled={!isFormValid() || isLoading}
        className={`mt-4 rounded-lg py-3 px-4 flex-row items-center justify-center ${
          isFormValid() && !isLoading
            ? 'bg-blue-500'
            : 'bg-gray-300'
        }`}
        activeOpacity={0.8}
      >
        <Text
          className={`font-medium text-lg ${
            isFormValid() && !isLoading
              ? 'text-white'
              : 'text-gray-500'
          }`}
        >
          {isLoading ? 'Adding...' : 'Add Set'}
        </Text>
      </TouchableOpacity>

      {/* Quick Weight Adjustments */}
      <View className="flex-row justify-center space-x-2 mt-3">
        <TouchableOpacity
          onPress={() => {
            const currentWeight = parseFloat(weight) || 0;
            setWeight((currentWeight - 5).toString());
          }}
          className="bg-gray-100 rounded-lg px-3 py-2"
          activeOpacity={0.7}
        >
          <Text className="text-sm font-medium text-gray-700">-5</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            const currentWeight = parseFloat(weight) || 0;
            setWeight((currentWeight - 2.5).toString());
          }}
          className="bg-gray-100 rounded-lg px-3 py-2"
          activeOpacity={0.7}
        >
          <Text className="text-sm font-medium text-gray-700">-2.5</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            const currentWeight = parseFloat(weight) || 0;
            setWeight((currentWeight + 2.5).toString());
          }}
          className="bg-gray-100 rounded-lg px-3 py-2"
          activeOpacity={0.7}
        >
          <Text className="text-sm font-medium text-gray-700">+2.5</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            const currentWeight = parseFloat(weight) || 0;
            setWeight((currentWeight + 5).toString());
          }}
          className="bg-gray-100 rounded-lg px-3 py-2"
          activeOpacity={0.7}
        >
          <Text className="text-sm font-medium text-gray-700">+5</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}