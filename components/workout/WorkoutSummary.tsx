/**
 * WorkoutSummary Component
 * Displays summary of completed or current workout
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Workout, Exercise } from '~/store/fitness/models';

interface WorkoutSummaryProps {
  workout: Workout;
  exercises?: Record<string, Exercise>;
  onExercisePress?: (exerciseId: string) => void;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export function WorkoutSummary({
  workout,
  exercises = {},
  onExercisePress,
  showActions = false,
  onEdit,
  onDelete,
  onDuplicate,
}: WorkoutSummaryProps) {
  const formatDuration = (startTime: Date, endTime: Date | null) => {
    if (!endTime) return 'In Progress';

    const durationMs = endTime.getTime() - startTime.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const calculateTotalVolume = () => {
    return workout.exercises.reduce((total, exercise) => {
      return total + exercise.sets.reduce((exerciseTotal, set) => {
        return exerciseTotal + (set.reps * set.weight);
      }, 0);
    }, 0);
  };

  const calculateTotalSets = () => {
    return workout.exercises.reduce((total, exercise) => {
      return total + exercise.sets.length;
    }, 0);
  };

  const calculateTotalReps = () => {
    return workout.exercises.reduce((total, exercise) => {
      return total + exercise.sets.reduce((exerciseTotal, set) => {
        return exerciseTotal + set.reps;
      }, 0);
    }, 0);
  };

  const getExerciseName = (exerciseId: string) => {
    return exercises[exerciseId]?.name || exerciseId;
  };

  const getExerciseStats = (exerciseId: string) => {
    const exerciseData = workout.exercises.find(e => e.exerciseId === exerciseId);
    if (!exerciseData) return { sets: 0, reps: 0, volume: 0, maxWeight: 0 };

    const sets = exerciseData.sets.length;
    const reps = exerciseData.sets.reduce((total, set) => total + set.reps, 0);
    const volume = exerciseData.sets.reduce((total, set) => total + (set.reps * set.weight), 0);
    const maxWeight = Math.max(...exerciseData.sets.map(set => set.weight), 0);

    return { sets, reps, volume, maxWeight };
  };

  return (
    <ScrollView className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <View className="p-4 border-b border-gray-100">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900 mb-1">
              {workout.name}
            </Text>
            <Text className="text-sm text-gray-500">
              {workout.startTime.toLocaleDateString()} • {formatDuration(workout.startTime, workout.endTime)}
            </Text>
          </View>

          {workout.endTime && (
            <View className={`px-3 py-1 rounded-full ${
              workout.endTime ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              <Text className={`text-xs font-medium ${
                workout.endTime ? 'text-green-800' : 'text-blue-800'
              }`}>
                {workout.endTime ? 'Completed' : 'In Progress'}
              </Text>
            </View>
          )}
        </View>

        {/* Notes */}
        {workout.notes && (
          <View className="mt-3 p-3 bg-gray-50 rounded-lg">
            <Text className="text-sm text-gray-700">{workout.notes}</Text>
          </View>
        )}
      </View>

      {/* Overall Stats */}
      <View className="p-4 border-b border-gray-100">
        <Text className="text-lg font-semibold text-gray-900 mb-3">
          Workout Stats
        </Text>
        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className="text-2xl font-bold text-blue-600">
              {workout.exercises.length}
            </Text>
            <Text className="text-xs text-gray-500">Exercises</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-green-600">
              {calculateTotalSets()}
            </Text>
            <Text className="text-xs text-gray-500">Sets</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-purple-600">
              {calculateTotalReps()}
            </Text>
            <Text className="text-xs text-gray-500">Reps</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-orange-600">
              {Math.round(calculateTotalVolume()).toLocaleString()}
            </Text>
            <Text className="text-xs text-gray-500">Volume (lbs)</Text>
          </View>
        </View>
      </View>

      {/* Exercise Breakdown */}
      <View className="p-4">
        <Text className="text-lg font-semibold text-gray-900 mb-3">
          Exercise Breakdown
        </Text>

        {workout.exercises.map((exercise, index) => {
          const stats = getExerciseStats(exercise.exerciseId);

          return (
            <TouchableOpacity
              key={exercise.exerciseId}
              onPress={() => onExercisePress?.(exercise.exerciseId)}
              className="mb-4 p-3 bg-gray-50 rounded-lg"
              activeOpacity={0.7}
            >
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-base font-medium text-gray-900 flex-1">
                  {getExerciseName(exercise.exerciseId)}
                </Text>
                <Text className="text-sm text-gray-500">
                  {stats.sets} sets
                </Text>
              </View>

              {/* Exercise Stats */}
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-600">
                  {stats.reps} total reps
                </Text>
                <Text className="text-sm text-gray-600">
                  Max: {stats.maxWeight} lbs
                </Text>
                <Text className="text-sm text-gray-600">
                  Volume: {Math.round(stats.volume)} lbs
                </Text>
              </View>

              {/* Sets Detail */}
              <View className="flex-row flex-wrap gap-1">
                {exercise.sets.map((set, setIndex) => (
                  <View
                    key={setIndex}
                    className={`px-2 py-1 rounded ${
                      set.completed ? 'bg-green-100' : 'bg-gray-200'
                    }`}
                  >
                    <Text className={`text-xs ${
                      set.completed ? 'text-green-800' : 'text-gray-600'
                    }`}>
                      {set.reps} × {set.weight}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Exercise Notes */}
              {exercise.notes && (
                <View className="mt-2 p-2 bg-white rounded border border-gray-200">
                  <Text className="text-sm text-gray-700">{exercise.notes}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {workout.exercises.length === 0 && (
          <View className="items-center py-8">
            <Text className="text-gray-500">No exercises in this workout</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      {showActions && (
        <View className="p-4 border-t border-gray-100">
          <View className="flex-row space-x-3">
            {onEdit && (
              <TouchableOpacity
                onPress={onEdit}
                className="flex-1 bg-blue-500 rounded-lg py-3 items-center"
                activeOpacity={0.8}
              >
                <Text className="text-white font-medium">Edit</Text>
              </TouchableOpacity>
            )}

            {onDuplicate && (
              <TouchableOpacity
                onPress={onDuplicate}
                className="flex-1 bg-green-500 rounded-lg py-3 items-center"
                activeOpacity={0.8}
              >
                <Text className="text-white font-medium">Duplicate</Text>
              </TouchableOpacity>
            )}

            {onDelete && (
              <TouchableOpacity
                onPress={onDelete}
                className="flex-1 bg-red-500 rounded-lg py-3 items-center"
                activeOpacity={0.8}
              >
                <Text className="text-white font-medium">Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}