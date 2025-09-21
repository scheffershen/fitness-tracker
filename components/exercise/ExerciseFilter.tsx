/**
 * ExerciseFilter Component
 * Provides filtering options for exercise library
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';

interface ExerciseFilterProps {
  searchTerm: string;
  selectedMuscleGroup: string | null;
  selectedEquipment: string | null;
  selectedCategory: string | null;
  bodyweightOnly: boolean;
  compoundOnly: boolean;
  muscleGroups: string[];
  equipmentTypes: string[];
  categories: string[];
  onSearchChange: (search: string) => void;
  onMuscleGroupChange: (muscleGroup: string | null) => void;
  onEquipmentChange: (equipment: string | null) => void;
  onCategoryChange: (category: string | null) => void;
  onBodyweightToggle: (enabled: boolean) => void;
  onCompoundToggle: (enabled: boolean) => void;
  onClearFilters: () => void;
}

export function ExerciseFilter({
  searchTerm,
  selectedMuscleGroup,
  selectedEquipment,
  selectedCategory,
  bodyweightOnly,
  compoundOnly,
  muscleGroups,
  equipmentTypes,
  categories,
  onSearchChange,
  onMuscleGroupChange,
  onEquipmentChange,
  onCategoryChange,
  onBodyweightToggle,
  onCompoundToggle,
  onClearFilters,
}: ExerciseFilterProps) {
  const [showMuscleModal, setShowMuscleModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const hasActiveFilters = () => {
    return (
      selectedMuscleGroup ||
      selectedEquipment ||
      selectedCategory ||
      bodyweightOnly ||
      compoundOnly ||
      searchTerm.trim().length > 0
    );
  };

  const FilterModal = ({
    visible,
    onClose,
    title,
    options,
    selectedValue,
    onSelect,
  }: {
    visible: boolean;
    onClose: () => void;
    title: string;
    options: string[];
    selectedValue: string | null;
    onSelect: (value: string | null) => void;
  }) => (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-lg max-h-96">
          <View className="p-4 border-b border-gray-200">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-semibold text-gray-900">
                {title}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Text className="text-blue-500 font-medium">Done</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="p-2">
            <TouchableOpacity
              onPress={() => {
                onSelect(null);
                onClose();
              }}
              className={`p-3 rounded-lg m-1 ${
                !selectedValue ? 'bg-blue-100' : 'bg-gray-50'
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  !selectedValue ? 'text-blue-800' : 'text-gray-700'
                }`}
              >
                All {title}
              </Text>
            </TouchableOpacity>

            {options.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
                className={`p-3 rounded-lg m-1 ${
                  selectedValue === option ? 'bg-blue-100' : 'bg-gray-50'
                }`}
              >
                <Text
                  className={`text-center font-medium ${
                    selectedValue === option ? 'text-blue-800' : 'text-gray-700'
                  }`}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View className="bg-white border-b border-gray-200">
      {/* Search Bar */}
      <View className="p-4">
        <TextInput
          value={searchTerm}
          onChangeText={onSearchChange}
          placeholder="Search exercises..."
          className="bg-gray-100 rounded-lg px-4 py-3 text-base"
          clearButtonMode="while-editing"
        />
      </View>

      {/* Filter Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 pb-4"
      >
        <View className="flex-row space-x-3">
          {/* Muscle Group Filter */}
          <TouchableOpacity
            onPress={() => setShowMuscleModal(true)}
            className={`px-4 py-2 rounded-full border ${
              selectedMuscleGroup
                ? 'bg-blue-500 border-blue-500'
                : 'bg-white border-gray-300'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                selectedMuscleGroup ? 'text-white' : 'text-gray-700'
              }`}
            >
              {selectedMuscleGroup || 'Muscle Group'}
            </Text>
          </TouchableOpacity>

          {/* Equipment Filter */}
          <TouchableOpacity
            onPress={() => setShowEquipmentModal(true)}
            className={`px-4 py-2 rounded-full border ${
              selectedEquipment
                ? 'bg-green-500 border-green-500'
                : 'bg-white border-gray-300'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                selectedEquipment ? 'text-white' : 'text-gray-700'
              }`}
            >
              {selectedEquipment || 'Equipment'}
            </Text>
          </TouchableOpacity>

          {/* Category Filter */}
          <TouchableOpacity
            onPress={() => setShowCategoryModal(true)}
            className={`px-4 py-2 rounded-full border ${
              selectedCategory
                ? 'bg-purple-500 border-purple-500'
                : 'bg-white border-gray-300'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                selectedCategory ? 'text-white' : 'text-gray-700'
              }`}
            >
              {selectedCategory || 'Category'}
            </Text>
          </TouchableOpacity>

          {/* Bodyweight Toggle */}
          <TouchableOpacity
            onPress={() => onBodyweightToggle(!bodyweightOnly)}
            className={`px-4 py-2 rounded-full border ${
              bodyweightOnly
                ? 'bg-orange-500 border-orange-500'
                : 'bg-white border-gray-300'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                bodyweightOnly ? 'text-white' : 'text-gray-700'
              }`}
            >
              Bodyweight
            </Text>
          </TouchableOpacity>

          {/* Compound Toggle */}
          <TouchableOpacity
            onPress={() => onCompoundToggle(!compoundOnly)}
            className={`px-4 py-2 rounded-full border ${
              compoundOnly
                ? 'bg-red-500 border-red-500'
                : 'bg-white border-gray-300'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                compoundOnly ? 'text-white' : 'text-gray-700'
              }`}
            >
              Compound
            </Text>
          </TouchableOpacity>

          {/* Clear Filters */}
          {hasActiveFilters() && (
            <TouchableOpacity
              onPress={onClearFilters}
              className="px-4 py-2 rounded-full bg-gray-500 border-gray-500"
            >
              <Text className="text-sm font-medium text-white">Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Active Filters Summary */}
      {hasActiveFilters() && (
        <View className="px-4 pb-3">
          <Text className="text-sm text-gray-600">
            Active filters:{' '}
            {[
              selectedMuscleGroup,
              selectedEquipment,
              selectedCategory,
              bodyweightOnly && 'Bodyweight',
              compoundOnly && 'Compound',
              searchTerm.trim() && `"${searchTerm.trim()}"`,
            ]
              .filter(Boolean)
              .join(', ')}
          </Text>
        </View>
      )}

      {/* Filter Modals */}
      <FilterModal
        visible={showMuscleModal}
        onClose={() => setShowMuscleModal(false)}
        title="Muscle Groups"
        options={muscleGroups}
        selectedValue={selectedMuscleGroup}
        onSelect={onMuscleGroupChange}
      />

      <FilterModal
        visible={showEquipmentModal}
        onClose={() => setShowEquipmentModal(false)}
        title="Equipment"
        options={equipmentTypes}
        selectedValue={selectedEquipment}
        onSelect={onEquipmentChange}
      />

      <FilterModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Categories"
        options={categories.map(cat => typeof cat === 'string' ? cat : cat.name)}
        selectedValue={selectedCategory}
        onSelect={onCategoryChange}
      />
    </View>
  );
}