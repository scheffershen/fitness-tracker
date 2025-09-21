/**
 * Main Workout Screen
 * Shows current workout status and provides workout controls
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useWorkoutStore } from '~/store/fitness/workoutStore';
import { useExerciseStore } from '~/store/fitness/exerciseStore';
import { Container } from '~/components/Container';

export default function WorkoutScreen() {
  const {
    currentWorkout,
    isLoading,
    error,
    startWorkout,
    completeWorkout,
    abandonWorkout,
    loadWorkoutHistory,
    clearError,
  } = useWorkoutStore();

  const { loadExercises } = useExerciseStore();

  useEffect(() => {
    // Initialize stores
    loadWorkoutHistory();
    loadExercises();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error]);

  const handleStartWorkout = async () => {
    await startWorkout();
    router.push('/workout/active');
  };

  const handleCompleteWorkout = async () => {
    Alert.alert(
      'Complete Workout',
      'Are you sure you want to complete this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            await completeWorkout();
            Alert.alert('Success', 'Workout completed successfully!');
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
          onPress: abandonWorkout,
        },
      ]
    );
  };

  const getCurrentWorkoutDuration = () => {
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

  return (
    <Container>
      <ScrollView className="flex-1">
        {/* Current Workout Status */}
        {currentWorkout ? (
          <View className="mb-6">
            {/* Active Workout Header */}
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-lg font-semibold text-blue-900">
                  Active Workout
                </Text>
                <View className="bg-green-100 px-2 py-1 rounded-full">
                  <Text className="text-xs font-medium text-green-800">
                    In Progress
                  </Text>
                </View>
              </View>

              <Text className="text-xl font-bold text-blue-900 mb-1">
                {currentWorkout.name}
              </Text>

              <Text className="text-sm text-blue-700">
                Started: {currentWorkout.startTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })} • Duration: {getCurrentWorkoutDuration()}
              </Text>
            </View>

            {/* Current Workout Stats */}
            <View className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Current Stats
              </Text>
              <View className="flex-row justify-between">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-blue-600">
                    {currentWorkout.exercises.length}
                  </Text>
                  <Text className="text-xs text-gray-500">Exercises</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-green-600">
                    {getTotalSets()}
                  </Text>
                  <Text className="text-xs text-gray-500">Sets</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-orange-600">
                    {Math.round(getTotalVolume()).toLocaleString()}
                  </Text>
                  <Text className="text-xs text-gray-500">Volume (lbs)</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="space-y-3">
              <TouchableOpacity
                onPress={() => router.push('/workout/active')}
                className="bg-blue-500 rounded-lg py-4 items-center"
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold text-lg">
                  Continue Workout
                </Text>
              </TouchableOpacity>

              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={handleCompleteWorkout}
                  disabled={currentWorkout.exercises.length === 0 || isLoading}
                  className={`flex-1 rounded-lg py-3 items-center ${
                    currentWorkout.exercises.length > 0 && !isLoading
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                  activeOpacity={0.8}
                >
                  <Text
                    className={`font-medium ${
                      currentWorkout.exercises.length > 0 && !isLoading
                        ? 'text-white'
                        : 'text-gray-500'
                    }`}
                  >
                    {isLoading ? 'Completing...' : 'Complete'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleAbandonWorkout}
                  disabled={isLoading}
                  className="flex-1 bg-red-500 rounded-lg py-3 items-center"
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-medium">Abandon</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          /* No Active Workout */
          <View className="mb-6">
            <View className="bg-white rounded-lg border border-gray-200 p-6 items-center">
              <Text className="text-6xl mb-4">💪</Text>
              <Text className="text-xl font-semibold text-gray-900 mb-2">
                Ready to workout?
              </Text>
              <Text className="text-gray-600 text-center mb-6">
                Start a new workout to track your exercises, sets, and progress.
              </Text>

              <TouchableOpacity
                onPress={handleStartWorkout}
                disabled={isLoading}
                className="bg-blue-500 rounded-lg py-4 px-8 w-full items-center"
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold text-lg">
                  {isLoading ? 'Starting...' : 'Start New Workout'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Quick Actions
          </Text>

          <View className="space-y-3">
            <TouchableOpacity
              onPress={() => router.push('/exercises')}
              className="bg-white rounded-lg border border-gray-200 p-4 flex-row items-center justify-between"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">🏋️</Text>
                <View>
                  <Text className="font-medium text-gray-900">
                    Exercise Library
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Browse and learn exercises
                  </Text>
                </View>
              </View>
              <Text className="text-gray-400">›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/history')}
              className="bg-white rounded-lg border border-gray-200 p-4 flex-row items-center justify-between"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">📊</Text>
                <View>
                  <Text className="font-medium text-gray-900">
                    Workout History
                  </Text>
                  <Text className="text-sm text-gray-500">
                    View past workouts
                  </Text>
                </View>
              </View>
              <Text className="text-gray-400">›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/progress')}
              className="bg-white rounded-lg border border-gray-200 p-4 flex-row items-center justify-between"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">📈</Text>
                <View>
                  <Text className="font-medium text-gray-900">
                    Progress Tracking
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Monitor your improvements
                  </Text>
                </View>
              </View>
              <Text className="text-gray-400">›</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
}