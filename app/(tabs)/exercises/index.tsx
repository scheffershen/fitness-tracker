/**
 * Exercise Library Screen
 * Browse and search through available exercises
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

export default function ExerciseLibraryScreen() {
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
    selectExercise,
    clearError,
  } = useExerciseStore();

  const {
    currentWorkout,
    addExerciseToWorkout,
  } = useWorkoutStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
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
    await loadExercises();
    setRefreshing(false);
  };

  const handleExercisePress = (exercise: Exercise) => {
    selectExercise(exercise.id);
    router.push(`/exercises/${exercise.id}`);
  };

  const handleAddToWorkout = async (exercise: Exercise) => {
    if (!currentWorkout) {
      Alert.alert(
        'No Active Workout',
        'Please start a workout first to add exercises.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Start Workout',
            onPress: () => router.push('/workout'),
          },
        ]
      );
      return;
    }

    try {
      await addExerciseToWorkout(exercise.id);
      Alert.alert(
        'Success',
        `${exercise.name} added to your workout!`,
        [
          { text: 'Continue', style: 'default' },
          {
            text: 'Go to Workout',
            onPress: () => router.push('/workout/active'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add exercise to workout');
    }
  };

  const renderExercise = ({ item }: { item: Exercise }) => (
    <ExerciseCard
      exercise={item}
      onPress={() => handleExercisePress(item)}
      onAddToWorkout={() => handleAddToWorkout(item)}
      showAddButton={!!currentWorkout}
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
      {/* Current Workout Status */}
      {currentWorkout && (
        <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="font-medium text-blue-900">
                Adding to: {currentWorkout.name}
              </Text>
              <Text className="text-sm text-blue-700">
                {currentWorkout.exercises.length} exercises already added
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/workout/active')}
              className="bg-blue-500 rounded px-3 py-1"
            >
              <Text className="text-white text-sm font-medium">
                Go to Workout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Exercise Count */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-semibold text-gray-900">
          Exercises ({filteredExercises.length})
        </Text>

        {isLoading && (
          <Text className="text-sm text-gray-500">Loading...</Text>
        )}
      </View>
    </View>
  );

  return (
    <Container>
      <View className="flex-1">
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
          getItemLayout={(data, index) => ({
            length: 150, // Approximate item height
            offset: 150 * index,
            index,
          })}
        />
      </View>
    </Container>
  );
}