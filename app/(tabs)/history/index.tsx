/**
 * Workout History Screen
 * Shows list of completed workouts
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useWorkoutStore } from '~/store/fitness/workoutStore';
import { useExerciseStore } from '~/store/fitness/exerciseStore';
// import { WorkoutSummary } from '~/components/workout/WorkoutSummary';
import { Container } from '~/components/Container';
import { Workout } from '~/store/fitness/models';

export default function WorkoutHistoryScreen() {
  const {
    workoutHistory,
    isLoading,
    error,
    loadWorkoutHistory,
    deleteWorkout,
    duplicateWorkout,
    clearError,
  } = useWorkoutStore();

  const { exercises, loadExercises } = useExerciseStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadWorkoutHistory(),
      loadExercises(),
    ]);
    setRefreshing(false);
  };

  const handleWorkoutPress = (workout: Workout) => {
    router.push(`/history/${workout.id}`);
  };

  const handleDeleteWorkout = (workout: Workout) => {
    Alert.alert(
      'Delete Workout',
      `Are you sure you want to delete "${workout.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteWorkout(workout.id),
        },
      ]
    );
  };

  const handleDuplicateWorkout = async (workout: Workout) => {
    await duplicateWorkout(workout.id);
    Alert.alert(
      'Workout Duplicated',
      'The workout has been duplicated and set as your active workout.',
      [
        { text: 'Continue', style: 'default' },
        {
          text: 'Go to Workout',
          onPress: () => router.push('/workout/active'),
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    if (diffDays <= 30) return `${Math.ceil((diffDays - 1) / 7)} weeks ago`;
    if (diffDays <= 365) return `${Math.ceil((diffDays - 1) / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const getWorkoutStats = (workout: Workout) => {
    const totalSets = workout.exercises.reduce((total, exercise) => {
      return total + exercise.sets.length;
    }, 0);

    const totalVolume = workout.exercises.reduce((total, exercise) => {
      return total + exercise.sets.reduce((exerciseTotal, set) => {
        return exerciseTotal + (set.reps * set.weight);
      }, 0);
    }, 0);

    const duration = workout.endTime
      ? Math.round((workout.endTime.getTime() - workout.startTime.getTime()) / (1000 * 60))
      : 0;

    return { totalSets, totalVolume, duration };
  };

  const createExerciseLookup = () => {
    const lookup: Record<string, any> = {};
    exercises.forEach(exercise => {
      lookup[exercise.id] = exercise;
    });
    return lookup;
  };

  const renderWorkout = ({ item }: { item: Workout }) => {
    const stats = getWorkoutStats(item);
    const exerciseLookup = createExerciseLookup();

    return (
      <TouchableOpacity
        onPress={() => handleWorkoutPress(item)}
        className="bg-white rounded-lg border border-gray-200 p-4 mb-3"
        activeOpacity={0.7}
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 mb-1">
              {item.name}
            </Text>
            <Text className="text-sm text-gray-500">
              {formatDate(item.startTime)} • {stats.duration}m
            </Text>
          </View>

          <View className="bg-green-100 px-2 py-1 rounded-full">
            <Text className="text-xs font-medium text-green-800">
              Completed
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="flex-row justify-between mb-3">
          <View className="items-center">
            <Text className="text-lg font-bold text-blue-600">
              {item.exercises.length}
            </Text>
            <Text className="text-xs text-gray-500">Exercises</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-bold text-green-600">
              {stats.totalSets}
            </Text>
            <Text className="text-xs text-gray-500">Sets</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-bold text-orange-600">
              {Math.round(stats.totalVolume).toLocaleString()}
            </Text>
            <Text className="text-xs text-gray-500">Volume</Text>
          </View>
        </View>

        {/* Exercise Preview */}
        {item.exercises.length > 0 && (
          <View className="border-t border-gray-100 pt-3">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Exercises:
            </Text>
            <View className="flex-row flex-wrap">
              {item.exercises.slice(0, 3).map((exercise, index) => (
                <View
                  key={exercise.exerciseId}
                  className="bg-gray-100 px-2 py-1 rounded mr-1 mb-1"
                >
                  <Text className="text-xs text-gray-700">
                    {exerciseLookup[exercise.exerciseId]?.name || exercise.exerciseId}
                  </Text>
                </View>
              ))}
              {item.exercises.length > 3 && (
                <View className="bg-gray-100 px-2 py-1 rounded">
                  <Text className="text-xs text-gray-700">
                    +{item.exercises.length - 3} more
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row justify-end mt-3 space-x-2">
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleDuplicateWorkout(item);
            }}
            className="bg-blue-500 rounded px-3 py-1"
          >
            <Text className="text-white text-xs font-medium">Duplicate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteWorkout(item);
            }}
            className="bg-red-500 rounded px-3 py-1"
          >
            <Text className="text-white text-xs font-medium">Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-12">
      <Text className="text-4xl mb-4">📊</Text>
      <Text className="text-xl font-semibold text-gray-900 mb-2">
        No workouts yet
      </Text>
      <Text className="text-gray-600 text-center mb-6">
        Complete your first workout to see it here
      </Text>
      <TouchableOpacity
        onPress={() => router.push('/workout')}
        className="bg-blue-500 rounded-lg py-3 px-6"
      >
        <Text className="text-white font-medium">Start First Workout</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View className="mb-4">
      <View className="flex-row justify-between items-center">
        <Text className="text-lg font-semibold text-gray-900">
          Workout History ({workoutHistory.length})
        </Text>

        {isLoading && (
          <Text className="text-sm text-gray-500">Loading...</Text>
        )}
      </View>

      {workoutHistory.length > 0 && (
        <Text className="text-sm text-gray-600 mt-1">
          Tap a workout to view details
        </Text>
      )}
    </View>
  );

  return (
    <Container>
      <FlatList
        data={workoutHistory}
        renderItem={renderWorkout}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </Container>
  );
}