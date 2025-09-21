/**
 * ExerciseCard Component
 * Displays exercise information in a card format with actions
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Exercise } from '~/store/fitness/models';

interface ExerciseCardProps {
  exercise: Exercise;
  onPress?: () => void;
  onAddToWorkout?: () => void;
  showAddButton?: boolean;
  showDetails?: boolean;
  isSelected?: boolean;
}

const ExerciseCard = React.memo<ExerciseCardProps>(({
  exercise,
  onPress,
  onAddToWorkout,
  showAddButton = true,
  showDetails = true,
  isSelected = false,
}: ExerciseCardProps) => {
  const handlePress = () => {
    onPress?.();
  };

  const handleAddToWorkout = (e: any) => {
    e.stopPropagation();
    onAddToWorkout?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`bg-white rounded-lg shadow-sm border p-4 mb-3 ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}
      activeOpacity={0.7}
    >
      <View className="flex-row items-start justify-between">
        {/* Exercise Info */}
        <View className="flex-1 mr-3">
          <Text className="text-lg font-semibold text-gray-900 mb-1">
            {exercise.name}
          </Text>

          {showDetails && (
            <>
              {/* Category */}
              <View className="flex-row items-center mb-2">
                <View className="bg-blue-100 px-2 py-1 rounded-full">
                  <Text className="text-xs font-medium text-blue-800">
                    {exercise.category}
                  </Text>
                </View>
              </View>

              {/* Muscle Groups */}
              <View className="flex-row flex-wrap mb-2">
                {exercise.muscleGroups.slice(0, 3).map((muscle, index) => (
                  <View
                    key={index}
                    className="bg-gray-100 px-2 py-1 rounded mr-1 mb-1"
                  >
                    <Text className="text-xs text-gray-700">{muscle}</Text>
                  </View>
                ))}
                {exercise.muscleGroups.length > 3 && (
                  <View className="bg-gray-100 px-2 py-1 rounded">
                    <Text className="text-xs text-gray-700">
                      +{exercise.muscleGroups.length - 3} more
                    </Text>
                  </View>
                )}
              </View>

              {/* Equipment */}
              <View className="flex-row flex-wrap">
                {exercise.equipment.slice(0, 2).map((equipment, index) => (
                  <View
                    key={index}
                    className="bg-green-100 px-2 py-1 rounded mr-1"
                  >
                    <Text className="text-xs text-green-800">{equipment}</Text>
                  </View>
                ))}
                {exercise.equipment.length > 2 && (
                  <View className="bg-green-100 px-2 py-1 rounded">
                    <Text className="text-xs text-green-800">
                      +{exercise.equipment.length - 2} more
                    </Text>
                  </View>
                )}
              </View>

              {/* Description Preview */}
              {exercise.description && (
                <Text className="text-sm text-gray-600 mt-2" numberOfLines={2}>
                  {exercise.description}
                </Text>
              )}
            </>
          )}
        </View>

        {/* Exercise Image */}
        {exercise.imageUrl && (
          <View className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
            <Image
              source={{ uri: exercise.imageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {showAddButton && onAddToWorkout && (
        <View className="mt-3 pt-3 border-t border-gray-100">
          <TouchableOpacity
            onPress={handleAddToWorkout}
            className="bg-blue-500 rounded-lg py-2 px-4 flex-row items-center justify-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-medium text-sm">
              Add to Workout
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Exercise Stats (if available) */}
      {exercise.difficulty && (
        <View className="mt-2 flex-row items-center">
          <Text className="text-xs text-gray-500 mr-2">Difficulty:</Text>
          <View className="flex-row">
            {[1, 2, 3, 4, 5].map((level) => (
              <View
                key={level}
                className={`w-2 h-2 rounded-full mr-1 ${
                  level <= (exercise.difficulty || 0)
                    ? 'bg-orange-400'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
});

ExerciseCard.displayName = 'ExerciseCard';

export { ExerciseCard };