/**
 * Workout Details Screen
 * Shows detailed view of a specific completed workout
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useWorkoutStore } from '~/store/fitness/workoutStore';
import { useExerciseStore } from '~/store/fitness/exerciseStore';
import { WorkoutSummary } from '~/components/workout/WorkoutSummary';
import { Container } from '~/components/Container';
import { Workout } from '~/store/fitness/models';

export default function WorkoutDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getWorkoutById,
    deleteWorkout,
    duplicateWorkout,
    error,
    clearError,
  } = useWorkoutStore();

  const { exercises, loadExercises } = useExerciseStore();

  const [workout, setWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    if (id) {
      const foundWorkout = getWorkoutById(id);
      setWorkout(foundWorkout);
    }

    loadExercises();
  }, [id]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error]);

  const handleEdit = () => {
    Alert.alert(
      'Edit Workout',
      'Editing completed workouts is not currently supported. You can duplicate this workout to create a new one.',
      [
        { text: 'OK', style: 'default' },
        {
          text: 'Duplicate',
          onPress: handleDuplicate,
        },
      ]
    );
  };

  const handleDelete = () => {
    if (!workout) return;

    Alert.alert(
      'Delete Workout',
      `Are you sure you want to delete "${workout.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteWorkout(workout.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleDuplicate = async () => {
    if (!workout) return;

    await duplicateWorkout(workout.id);
    Alert.alert(
      'Workout Duplicated',
      'The workout has been duplicated and set as your active workout.',
      [
        { text: 'Continue', style: 'default' },
        {
          text: 'Go to Workout',
          onPress: () => {
            router.dismissAll();
            router.push('/workout/active');
          },
        },
      ]
    );
  };

  const handleExercisePress = (exerciseId: string) => {
    router.push(`/exercises/${exerciseId}`);
  };

  const createExerciseLookup = () => {
    const lookup: Record<string, any> = {};
    exercises.forEach(exercise => {
      lookup[exercise.id] = exercise;
    });
    return lookup;
  };

  if (!workout) {
    return (
      <Container>
        <View className="flex-1 items-center justify-center">
          <Text className="text-4xl mb-4">🚫</Text>
          <Text className="text-xl font-semibold text-gray-900 mb-2">
            Workout Not Found
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            The workout you&apos;re looking for could not be found.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-blue-500 rounded-lg py-3 px-6"
          >
            <Text className="text-white font-medium">Go Back</Text>
          </TouchableOpacity>
        </View>
      </Container>
    );
  }

  const exerciseLookup = createExerciseLookup();

  return (
    <Container>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="p-4 bg-white border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-gray-100 rounded-lg px-3 py-2"
            >
              <Text className="text-gray-700 font-medium">‹ Back</Text>
            </TouchableOpacity>

            <Text className="text-lg font-semibold text-gray-900">
              Workout Details
            </Text>

            <View className="w-16" />
          </View>
        </View>

        {/* Workout Summary */}
        <View className="p-4">
          <WorkoutSummary
            workout={workout}
            exercises={exerciseLookup}
            onExercisePress={handleExercisePress}
            showActions={true}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
          />

          {/* Additional Details */}
          <View className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Workout Information
            </Text>

            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Started at</Text>
                <Text className="font-medium">
                  {workout.startTime.toLocaleString()}
                </Text>
              </View>

              {workout.endTime && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Completed at</Text>
                  <Text className="font-medium">
                    {workout.endTime.toLocaleString()}
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between">
                <Text className="text-gray-600">Duration</Text>
                <Text className="font-medium">
                  {workout.endTime ? (
                    (() => {
                      const duration = workout.endTime.getTime() - workout.startTime.getTime();
                      const hours = Math.floor(duration / (1000 * 60 * 60));
                      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
                      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                    })()
                  ) : (
                    'In Progress'
                  )}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-gray-600">Total exercises</Text>
                <Text className="font-medium">{workout.exercises.length}</Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-gray-600">Total sets</Text>
                <Text className="font-medium">
                  {workout.exercises.reduce((total, exercise) => {
                    return total + exercise.sets.length;
                  }, 0)}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-gray-600">Total reps</Text>
                <Text className="font-medium">
                  {workout.exercises.reduce((total, exercise) => {
                    return total + exercise.sets.reduce((exerciseTotal, set) => {
                      return exerciseTotal + set.reps;
                    }, 0);
                  }, 0)}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-gray-600">Total volume</Text>
                <Text className="font-medium">
                  {Math.round(
                    workout.exercises.reduce((total, exercise) => {
                      return total + exercise.sets.reduce((exerciseTotal, set) => {
                        return exerciseTotal + (set.reps * set.weight);
                      }, 0);
                    }, 0)
                  ).toLocaleString()} lbs
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="mt-6 space-y-3">
            <TouchableOpacity
              onPress={handleDuplicate}
              className="bg-blue-500 rounded-lg py-4 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-lg">
                Duplicate This Workout
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/workout')}
              className="bg-green-500 rounded-lg py-4 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-lg">
                Start New Workout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
}