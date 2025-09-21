/**
 * Active Workout Screen
 * Shows current workout in progress with exercise management
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useWorkoutStore } from '~/store/fitness/workoutStore';
import { useExerciseStore } from '~/store/fitness/exerciseStore';
import { SetEntryForm } from '~/components/workout/SetEntryForm';
import { Container } from '~/components/Container';
import { SetInput } from '~/store/fitness/models';

export default function ActiveWorkoutScreen() {
  const {
    currentWorkout,
    isLoading,
    error,
    addSetToExercise,
    removeExerciseFromWorkout,
    removeSetFromExercise,
    updateExerciseNotes,
    completeWorkout,
    abandonWorkout,
    clearError,
  } = useWorkoutStore();

  const { exercises, loadExercises } = useExerciseStore();

  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');

  useEffect(() => {
    if (!currentWorkout) {
      router.replace('/workout');
      return;
    }

    loadExercises();
  }, [currentWorkout]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error]);

  const getExerciseName = (exerciseId: string) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    return exercise?.name || exerciseId;
  };

  const handleAddSet = async (exerciseId: string, set: SetInput) => {
    await addSetToExercise(exerciseId, set);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    const exerciseName = getExerciseName(exerciseId);
    Alert.alert(
      'Remove Exercise',
      `Remove ${exerciseName} from this workout?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeExerciseFromWorkout(exerciseId),
        },
      ]
    );
  };

  const handleRemoveSet = (exerciseId: string, setIndex: number) => {
    Alert.alert(
      'Remove Set',
      'Remove this set?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeSetFromExercise(exerciseId, setIndex),
        },
      ]
    );
  };

  const handleNotesEdit = (exerciseId: string, currentNotes: string) => {
    setEditingNotes(exerciseId);
    setNotesText(currentNotes);
  };

  const handleNotesSave = async (exerciseId: string) => {
    await updateExerciseNotes(exerciseId, notesText);
    setEditingNotes(null);
    setNotesText('');
  };

  const handleCompleteWorkout = () => {
    if (!currentWorkout || currentWorkout.exercises.length === 0) {
      Alert.alert('Error', 'Cannot complete workout with no exercises');
      return;
    }

    Alert.alert(
      'Complete Workout',
      'Are you sure you want to complete this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            await completeWorkout();
            router.replace('/history');
          },
        },
      ]
    );
  };

  const handleAbandonWorkout = () => {
    Alert.alert(
      'Abandon Workout',
      'Are you sure you want to abandon this workout? All progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Abandon',
          style: 'destructive',
          onPress: async () => {
            await abandonWorkout();
            router.replace('/workout');
          },
        },
      ]
    );
  };

  const getWorkoutDuration = () => {
    if (!currentWorkout) return '';

    const now = new Date();
    const duration = now.getTime() - currentWorkout.startTime.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getTotalSets = () => {
    if (!currentWorkout) return 0;
    return currentWorkout.exercises.reduce((total, exercise) => {
      return total + exercise.sets.length;
    }, 0);
  };

  const getTotalVolume = () => {
    if (!currentWorkout) return 0;
    return currentWorkout.exercises.reduce((total, exercise) => {
      return total + exercise.sets.reduce((exerciseTotal, set) => {
        return exerciseTotal + (set.reps * set.weight);
      }, 0);
    }, 0);
  };

  if (!currentWorkout) {
    return (
      <Container>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">No active workout</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Workout Header */}
        <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <Text className="text-xl font-bold text-blue-900 mb-1">
            {currentWorkout.name}
          </Text>
          <Text className="text-sm text-blue-700">
            Duration: {getWorkoutDuration()} • {currentWorkout.exercises.length} exercises
          </Text>

          {/* Current Stats */}
          <View className="flex-row justify-between mt-3">
            <View className="items-center">
              <Text className="text-lg font-bold text-blue-600">
                {getTotalSets()}
              </Text>
              <Text className="text-xs text-blue-700">Sets</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-bold text-green-600">
                {Math.round(getTotalVolume()).toLocaleString()}
              </Text>
              <Text className="text-xs text-blue-700">Volume (lbs)</Text>
            </View>
          </View>
        </View>

        {/* Add Exercise Button */}
        <TouchableOpacity
          onPress={() => router.push('/workout/select-exercise')}
          className="bg-white border border-dashed border-blue-300 rounded-lg p-4 mb-4 items-center"
          activeOpacity={0.7}
        >
          <Text className="text-blue-500 font-medium">+ Add Exercise</Text>
        </TouchableOpacity>

        {/* Exercises */}
        {currentWorkout.exercises.map((exercise) => {
          const exerciseName = getExerciseName(exercise.exerciseId);
          const isSelected = selectedExerciseId === exercise.exerciseId;
          const lastSet = exercise.sets[exercise.sets.length - 1];

          return (
            <View
              key={exercise.exerciseId}
              className="bg-white rounded-lg border border-gray-200 mb-4"
            >
              {/* Exercise Header */}
              <TouchableOpacity
                onPress={() => setSelectedExerciseId(
                  isSelected ? null : exercise.exerciseId
                )}
                className="p-4 border-b border-gray-100"
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900">
                      {exerciseName}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {exercise.sets.length} sets
                      {exercise.sets.length > 0 && (
                        <Text>
                          {' • '}
                          {exercise.sets.reduce((total, set) => total + (set.reps * set.weight), 0).toLocaleString()} lbs total
                        </Text>
                      )}
                    </Text>
                  </View>

                  <View className="flex-row items-center space-x-2">
                    <TouchableOpacity
                      onPress={() => handleRemoveExercise(exercise.exerciseId)}
                      className="bg-red-100 rounded px-2 py-1"
                    >
                      <Text className="text-red-600 text-xs font-medium">
                        Remove
                      </Text>
                    </TouchableOpacity>
                    <Text className="text-gray-400">
                      {isSelected ? '−' : '+'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Exercise Details */}
              {isSelected && (
                <View className="p-4">
                  {/* Sets List */}
                  {exercise.sets.length > 0 && (
                    <View className="mb-4">
                      <Text className="font-medium text-gray-900 mb-2">
                        Sets:
                      </Text>
                      {exercise.sets.map((set, index) => (
                        <View
                          key={index}
                          className="flex-row justify-between items-center p-2 bg-gray-50 rounded mb-1"
                        >
                          <Text className="text-gray-900">
                            Set {index + 1}: {set.reps} × {set.weight} lbs
                          </Text>
                          <TouchableOpacity
                            onPress={() => handleRemoveSet(exercise.exerciseId, index)}
                            className="bg-red-100 rounded px-2 py-1"
                          >
                            <Text className="text-red-600 text-xs">Remove</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Set Entry Form */}
                  <SetEntryForm
                    onAddSet={(set) => handleAddSet(exercise.exerciseId, set)}
                    previousSet={lastSet}
                    isLoading={isLoading}
                    exerciseName={exerciseName}
                  />

                  {/* Exercise Notes */}
                  <View className="mt-4">
                    <Text className="font-medium text-gray-900 mb-2">Notes:</Text>
                    {editingNotes === exercise.exerciseId ? (
                      <View>
                        <TextInput
                          value={notesText}
                          onChangeText={setNotesText}
                          placeholder="Add notes about this exercise..."
                          multiline
                          className="border border-gray-300 rounded-lg p-3 h-20 text-sm"
                        />
                        <View className="flex-row space-x-2 mt-2">
                          <TouchableOpacity
                            onPress={() => handleNotesSave(exercise.exerciseId)}
                            className="bg-blue-500 rounded px-3 py-1"
                          >
                            <Text className="text-white text-sm font-medium">
                              Save
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => setEditingNotes(null)}
                            className="bg-gray-300 rounded px-3 py-1"
                          >
                            <Text className="text-gray-700 text-sm font-medium">
                              Cancel
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => handleNotesEdit(exercise.exerciseId, exercise.notes)}
                        className="border border-gray-300 rounded-lg p-3 min-h-12"
                      >
                        <Text className="text-gray-700 text-sm">
                          {exercise.notes || 'Tap to add notes...'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {/* No Exercises State */}
        {currentWorkout.exercises.length === 0 && (
          <View className="bg-white rounded-lg border border-gray-200 p-6 items-center">
            <Text className="text-4xl mb-2">🏋️</Text>
            <Text className="text-lg font-medium text-gray-900 mb-1">
              No exercises yet
            </Text>
            <Text className="text-gray-600 text-center mb-4">
              Add your first exercise to get started
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/workout/select-exercise')}
              className="bg-blue-500 rounded-lg py-2 px-4"
            >
              <Text className="text-white font-medium">Add Exercise</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Actions */}
        <View className="flex-row space-x-3 mt-6 mb-6">
          <TouchableOpacity
            onPress={handleCompleteWorkout}
            disabled={currentWorkout.exercises.length === 0 || isLoading}
            className={`flex-1 rounded-lg py-4 items-center ${
              currentWorkout.exercises.length > 0 && !isLoading
                ? 'bg-green-500'
                : 'bg-gray-300'
            }`}
            activeOpacity={0.8}
          >
            <Text
              className={`font-semibold text-lg ${
                currentWorkout.exercises.length > 0 && !isLoading
                  ? 'text-white'
                  : 'text-gray-500'
              }`}
            >
              {isLoading ? 'Completing...' : 'Complete Workout'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleAbandonWorkout}
            disabled={isLoading}
            className="bg-red-500 rounded-lg py-4 px-6 items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Abandon</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Container>
  );
}