/**
 * Exercise Selection Screen
 * Select exercises to add to current workout
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
import { useExerciseStore } from '~/store/fitness/exerciseStore';
import { useWorkoutStore } from '~/store/fitness/workoutStore';
import { ExerciseCard } from '~/components/exercise/ExerciseCard';
import { ExerciseFilter } from '~/components/exercise/ExerciseFilter';
import { Container } from '~/components/Container';
import { Exercise } from '~/store/fitness/models';

export default function SelectExerciseScreen() {
  const {
    filteredExercises,
    muscleGroups,
    equipmentTypes,
    categories,
    filters,
    isLoading,
    error,
    loadExercises,
    setSearchFilter,
    setMuscleGroupFilter,
    setEquipmentFilter,
    setCategoryFilter,
    setBodyweightFilter,
    setCompoundFilter,
    clearAllFilters,
    clearError,
  } = useExerciseStore();

  const {
    currentWorkout,
    addExerciseToWorkout,
    error: workoutError,
    clearError: clearWorkoutError,
  } = useWorkoutStore();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!currentWorkout) {
      router.replace('/workout');
      return;
    }

    loadExercises();

    // Pre-select exercises already in workout
    const existing = new Set(currentWorkout.exercises.map(e => e.exerciseId));
    setSelectedExercises(existing);
  }, [currentWorkout]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error]);

  useEffect(() => {
    if (workoutError) {
      Alert.alert('Error', workoutError, [
        { text: 'OK', onPress: clearWorkoutError }
      ]);
    }
  }, [workoutError]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadExercises();
    setRefreshing(false);
  };

  const handleExerciseSelect = async (exercise: Exercise) => {
    if (selectedExercises.has(exercise.id)) {
      // Exercise already added - show message
      Alert.alert(
        'Exercise Already Added',
        `${exercise.name} is already in your workout.`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      await addExerciseToWorkout(exercise.id);
      setSelectedExercises(prev => new Set(prev).add(exercise.id));

      Alert.alert(
        'Exercise Added',
        `${exercise.name} has been added to your workout!`,
        [
          { text: 'Add Another', style: 'default' },
          {
            text: 'Go to Workout',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      // Error is handled by useEffect
    }
  };

  const isExerciseSelected = (exerciseId: string) => {
    return selectedExercises.has(exerciseId);
  };

  const renderExercise = ({ item }: { item: Exercise }) => (
    <ExerciseCard
      exercise={item}
      onPress={() => handleExerciseSelect(item)}
      onAddToWorkout={() => handleExerciseSelect(item)}
      showAddButton={!isExerciseSelected(item.id)}
      isSelected={isExerciseSelected(item.id)}
    />
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-12">
      <Text className="text-4xl mb-4">🔍</Text>
      <Text className="text-xl font-semibold text-gray-900 mb-2">
        No exercises found
      </Text>
      <Text className="text-gray-600 text-center mb-4">
        Try adjusting your filters or search terms
      </Text>
      <TouchableOpacity
        onPress={clearAllFilters}
        className="bg-blue-500 rounded-lg py-2 px-4"
      >
        <Text className="text-white font-medium">Clear Filters</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View className="mb-4">
      {/* Current Workout Info */}
      {currentWorkout && (
        <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <Text className="font-medium text-blue-900 mb-1">
            Adding to: {currentWorkout.name}
          </Text>
          <Text className="text-sm text-blue-700">
            {currentWorkout.exercises.length} exercises • {selectedExercises.size} selected
          </Text>
        </View>
      )}

      {/* Exercise Count */}
      <View className="flex-row justify-between items-center">
        <Text className="text-lg font-semibold text-gray-900">
          Available Exercises ({filteredExercises.length})
        </Text>

        {isLoading && (
          <Text className="text-sm text-gray-500">Loading...</Text>
        )}
      </View>

      <Text className="text-sm text-gray-600 mt-1">
        Tap an exercise to add it to your workout
      </Text>
    </View>
  );

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
      <View className="flex-1">
        {/* Header with Back Button */}
        <View className="p-4 bg-white border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-gray-100 rounded-lg px-3 py-2"
            >
              <Text className="text-gray-700 font-medium">‹ Back to Workout</Text>
            </TouchableOpacity>

            <Text className="text-lg font-semibold text-gray-900">
              Add Exercise
            </Text>

            <View className="w-20" />
          </View>
        </View>

        {/* Filters */}
        <ExerciseFilter
          searchTerm={filters.search}
          selectedMuscleGroup={filters.muscleGroup}
          selectedEquipment={filters.equipment}
          selectedCategory={filters.category}
          bodyweightOnly={filters.bodyweightOnly}
          compoundOnly={filters.compoundOnly}
          muscleGroups={muscleGroups}
          equipmentTypes={equipmentTypes}
          categories={categories.map(cat => typeof cat === 'string' ? cat : cat.name)}
          onSearchChange={setSearchFilter}
          onMuscleGroupChange={setMuscleGroupFilter}
          onEquipmentChange={setEquipmentFilter}
          onCategoryChange={setCategoryFilter}
          onBodyweightToggle={setBodyweightFilter}
          onCompoundToggle={setCompoundFilter}
          onClearFilters={clearAllFilters}
        />

        {/* Exercise List */}
        <FlatList
          data={filteredExercises}
          renderItem={renderExercise}
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
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
        />
      </View>
    </Container>
  );
}