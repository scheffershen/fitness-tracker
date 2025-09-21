/**
 * Exercise Details Screen
 * Shows detailed information about a specific exercise
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useExerciseStore } from '~/store/fitness/exerciseStore';
import { useWorkoutStore } from '~/store/fitness/workoutStore';
import { useProgressStore } from '~/store/fitness/progressStore';
import { Container } from '~/components/Container';
import { Exercise } from '~/store/fitness/models';

export default function ExerciseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getExerciseById,
    loadExercises,
    error: exerciseError,
    clearError: clearExerciseError,
  } = useExerciseStore();

  const {
    currentWorkout,
    addExerciseToWorkout,
    error: workoutError,
    clearError: clearWorkoutError,
  } = useWorkoutStore();

  const {
    getExercisePersonalRecord,
    loadPersonalRecords,
  } = useProgressStore();

  const [exercise, setExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    if (id) {
      const foundExercise = getExerciseById(id);
      setExercise(foundExercise);
    }

    loadExercises();
    loadPersonalRecords();
  }, [id]);

  useEffect(() => {
    if (exerciseError) {
      Alert.alert('Error', exerciseError, [
        { text: 'OK', onPress: clearExerciseError }
      ]);
    }
  }, [exerciseError]);

  useEffect(() => {
    if (workoutError) {
      Alert.alert('Error', workoutError, [
        { text: 'OK', onPress: clearWorkoutError }
      ]);
    }
  }, [workoutError]);

  const handleAddToWorkout = async () => {
    if (!exercise) return;

    if (!currentWorkout) {
      Alert.alert(
        'No Active Workout',
        'Please start a workout first to add exercises.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Start Workout',
            onPress: () => {
              router.dismissAll();
              router.push('/workout');
            },
          },
        ]
      );
      return;
    }

    try {
      await addExerciseToWorkout(exercise.id);
      Alert.alert(
        'Exercise Added',
        `${exercise.name} has been added to your workout!`,
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
    } catch (error) {
      // Error is handled by useEffect
    }
  };

  const handleViewProgress = () => {
    if (!exercise) return;
    router.push(`/progress/${exercise.id}`);
  };

  if (!exercise) {
    return (
      <Container>
        <View className="flex-1 items-center justify-center">
          <Text className="text-4xl mb-4">🚫</Text>
          <Text className="text-xl font-semibold text-gray-900 mb-2">
            Exercise Not Found
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            The exercise you&apos;re looking for could not be found.
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

  const personalRecord = getExercisePersonalRecord(exercise.id);
  const isInCurrentWorkout = currentWorkout?.exercises.some(e => e.exerciseId === exercise.id);

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
              Exercise Details
            </Text>

            <View className="w-16" />
          </View>
        </View>

        <View className="p-4">
          {/* Exercise Header */}
          <View className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <View className="flex-row items-start">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-900 mb-2">
                  {exercise.name}
                </Text>

                {/* Category */}
                <View className="flex-row items-center mb-3">
                  <View className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-sm font-medium text-blue-800">
                      {exercise.category}
                    </Text>
                  </View>
                </View>

                {/* Difficulty */}
                {exercise.difficulty && (
                  <View className="flex-row items-center mb-3">
                    <Text className="text-sm text-gray-600 mr-3">Difficulty:</Text>
                    <View className="flex-row">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <View
                          key={level}
                          className={`w-3 h-3 rounded-full mr-1 ${
                            level <= exercise.difficulty!
                              ? 'bg-orange-400'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </View>
                  </View>
                )}
              </View>

              {/* Exercise Image */}
              {exercise.imageUrl && (
                <View className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 ml-4">
                  <Image
                    source={{ uri: exercise.imageUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
              )}
            </View>
          </View>

          {/* Personal Record */}
          {personalRecord && (
            <View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <Text className="text-lg font-semibold text-green-900 mb-2">
                Personal Record
              </Text>
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-sm text-green-700">Best Weight</Text>
                  <Text className="text-xl font-bold text-green-900">
                    {personalRecord.maxWeight} lbs
                  </Text>
                </View>
                <View>
                  <Text className="text-sm text-green-700">Best Reps</Text>
                  <Text className="text-xl font-bold text-green-900">
                    {personalRecord.maxReps}
                  </Text>
                </View>
                <View>
                  <Text className="text-sm text-green-700">1RM</Text>
                  <Text className="text-xl font-bold text-green-900">
                    {Math.round(personalRecord.oneRepMax)} lbs
                  </Text>
                </View>
              </View>
              <Text className="text-xs text-green-600 mt-2">
                Achieved on {personalRecord.achievedDate.toLocaleDateString()}
              </Text>
            </View>
          )}

          {/* Description */}
          {exercise.description && (
            <View className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                Description
              </Text>
              <Text className="text-gray-700 leading-6">
                {exercise.description}
              </Text>
            </View>
          )}

          {/* Instructions */}
          {exercise.instructions && exercise.instructions.length > 0 && (
            <View className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Instructions
              </Text>
              {exercise.instructions.map((instruction, index) => (
                <View key={index} className="flex-row mb-2">
                  <View className="w-6 h-6 rounded-full bg-blue-500 items-center justify-center mr-3 mt-0.5">
                    <Text className="text-white text-xs font-bold">
                      {index + 1}
                    </Text>
                  </View>
                  <Text className="flex-1 text-gray-700 leading-6">
                    {instruction}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Muscle Groups */}
          <View className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Target Muscles
            </Text>
            <View className="flex-row flex-wrap">
              {exercise.muscleGroups.map((muscle, index) => (
                <View
                  key={index}
                  className="bg-gray-100 px-3 py-2 rounded-lg mr-2 mb-2"
                >
                  <Text className="text-sm text-gray-700">{muscle}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Equipment */}
          <View className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Required Equipment
            </Text>
            <View className="flex-row flex-wrap">
              {exercise.equipment.map((equipment, index) => (
                <View
                  key={index}
                  className="bg-green-100 px-3 py-2 rounded-lg mr-2 mb-2"
                >
                  <Text className="text-sm text-green-800">{equipment}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View className="space-y-3 mt-6">
            {!isInCurrentWorkout ? (
              <TouchableOpacity
                onPress={handleAddToWorkout}
                className="bg-blue-500 rounded-lg py-4 items-center"
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold text-lg">
                  Add to Workout
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="bg-green-100 border border-green-200 rounded-lg py-4 items-center">
                <Text className="text-green-800 font-semibold text-lg">
                  ✓ Already in Current Workout
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleViewProgress}
              className="bg-gray-100 rounded-lg py-4 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-gray-700 font-semibold text-lg">
                View Progress History
              </Text>
            </TouchableOpacity>

            {!currentWorkout && (
              <TouchableOpacity
                onPress={() => {
                  router.dismissAll();
                  router.push('/workout');
                }}
                className="bg-green-500 rounded-lg py-4 items-center"
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold text-lg">
                  Start New Workout
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </Container>
  );
}