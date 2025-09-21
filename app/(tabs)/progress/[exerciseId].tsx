/**
 * Exercise Progress Screen
 * Shows detailed progress tracking for a specific exercise
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useProgressStore } from '~/store/fitness/progressStore';
import { useExerciseStore } from '~/store/fitness/exerciseStore';
import { ProgressChart } from '~/components/progress/ProgressChart';
import { Container } from '~/components/Container';

export default function ExerciseProgressScreen() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const {
    getExerciseProgress,
    getExercisePersonalRecord,
    getStrengthProgression,
    filters,
    isLoading,
    error,
    loadExerciseProgress,
    loadStrengthProgression,
    setSelectedExercise,
    setLastWeek,
    setLastMonth,
    setLast3Months,
    setLast6Months,
    setLastYear,
    clearError,
  } = useProgressStore();

  const { getExerciseById, loadExercises } = useExerciseStore();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('3m');

  useEffect(() => {
    if (exerciseId) {
      setSelectedExercise(exerciseId);
      loadExercises();
      loadData();
    }
  }, [exerciseId]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error]);

  const loadData = async () => {
    if (!exerciseId) return;

    await Promise.all([
      loadExerciseProgress(exerciseId),
      loadStrengthProgression(exerciseId),
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadExercises(),
      loadData(),
    ]);
    setRefreshing(false);
  };

  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range);
    switch (range) {
      case '1w':
        setLastWeek();
        break;
      case '1m':
        setLastMonth();
        break;
      case '3m':
        setLast3Months();
        break;
      case '6m':
        setLast6Months();
        break;
      case '1y':
        setLastYear();
        break;
    }
  };

  const formatTimeRange = () => {
    const start = filters.timeRange.startDate.toLocaleDateString();
    const end = filters.timeRange.endDate.toLocaleDateString();
    return `${start} - ${end}`;
  };

  if (!exerciseId) {
    return (
      <Container>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Exercise not found</Text>
        </View>
      </Container>
    );
  }

  const exercise = getExerciseById(exerciseId);
  const progressMetrics = getExerciseProgress(exerciseId);
  const personalRecord = getExercisePersonalRecord(exerciseId);
  const strengthProgression = getStrengthProgression(exerciseId);

  const timeRanges = [
    { key: '1w', label: '1W' },
    { key: '1m', label: '1M' },
    { key: '3m', label: '3M' },
    { key: '6m', label: '6M' },
    { key: '1y', label: '1Y' },
  ];

  return (
    <Container>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
          />
        }
        showsVerticalScrollIndicator={false}
      >
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
              Progress Tracking
            </Text>

            <TouchableOpacity
              onPress={() => router.push(`/exercises/${exerciseId}`)}
              className="bg-blue-100 rounded-lg px-3 py-2"
            >
              <Text className="text-blue-700 font-medium text-sm">Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Exercise Name */}
        <View className="p-4 bg-blue-50 border-b border-blue-200">
          <Text className="text-xl font-bold text-blue-900">
            {exercise?.name || exerciseId}
          </Text>
          <Text className="text-sm text-blue-700">
            Progress tracking and analytics
          </Text>
        </View>

        {/* Time Range Selector */}
        <View className="p-4 bg-white border-b border-gray-200">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Time Range
          </Text>
          <View className="flex-row space-x-2">
            {timeRanges.map((range) => (
              <TouchableOpacity
                key={range.key}
                onPress={() => handleTimeRangeChange(range.key)}
                className={`px-4 py-2 rounded-lg ${
                  selectedTimeRange === range.key
                    ? 'bg-blue-500'
                    : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`font-medium ${
                    selectedTimeRange === range.key
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}
                >
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text className="text-xs text-gray-500 mt-2">
            {formatTimeRange()}
          </Text>
        </View>

        <View className="p-4">
          {/* Personal Record */}
          {personalRecord && (
            <View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <Text className="text-lg font-semibold text-green-900 mb-3">
                Personal Records
              </Text>

              <View className="flex-row justify-between">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-green-600">
                    {personalRecord.maxWeight}
                  </Text>
                  <Text className="text-xs text-green-700">Max Weight (lbs)</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-green-600">
                    {personalRecord.maxReps}
                  </Text>
                  <Text className="text-xs text-green-700">Max Reps</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-green-600">
                    {Math.round(personalRecord.oneRepMax)}
                  </Text>
                  <Text className="text-xs text-green-700">1RM (lbs)</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-green-600">
                    {Math.round(personalRecord.maxVolume)}
                  </Text>
                  <Text className="text-xs text-green-700">Max Volume</Text>
                </View>
              </View>

              <Text className="text-sm text-green-700 mt-3">
                Achieved on {personalRecord.achievedDate.toLocaleDateString()}
              </Text>
            </View>
          )}

          {/* Progress Metrics */}
          {progressMetrics && (
            <View className="mb-6">
              <ProgressChart
                data={progressMetrics}
                type="metrics"
                height={160}
                color="#3B82F6"
              />
            </View>
          )}

          {/* Strength Progression Chart */}
          {strengthProgression && (
            <View className="mb-6">
              <ProgressChart
                data={strengthProgression}
                type="strength"
                height={300}
                color="#10B981"
              />
            </View>
          )}

          {/* Progress Summary */}
          {progressMetrics && (
            <View className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Progress Summary ({formatTimeRange()})
              </Text>

              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Total sets performed</Text>
                  <Text className="font-medium">{progressMetrics.totalSets}</Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Total reps performed</Text>
                  <Text className="font-medium">{progressMetrics.totalReps}</Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Total volume lifted</Text>
                  <Text className="font-medium">
                    {Math.round(progressMetrics.totalVolume).toLocaleString()} lbs
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Average weight</Text>
                  <Text className="font-medium">
                    {Math.round(progressMetrics.averageWeight)} lbs
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Progress change</Text>
                  <Text className={`font-medium ${
                    progressMetrics.progressPercentage >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {progressMetrics.progressPercentage >= 0 ? '+' : ''}
                    {Math.round(progressMetrics.progressPercentage)}%
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Strength Progression Details */}
          {strengthProgression && strengthProgression.dataPoints.length > 0 && (
            <View className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Strength Progression Details
              </Text>

              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Total workouts</Text>
                  <Text className="font-medium">{strengthProgression.dataPoints.length}</Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Progress trend</Text>
                  <View className="flex-row items-center">
                    <Text className={`font-medium ${
                      strengthProgression.trendDirection === 'up'
                        ? 'text-green-600'
                        : strengthProgression.trendDirection === 'down'
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}>
                      {strengthProgression.trendDirection === 'up' ? '↗' :
                       strengthProgression.trendDirection === 'down' ? '↘' : '→'}
                      {strengthProgression.trendDirection.charAt(0).toUpperCase() + strengthProgression.trendDirection.slice(1)}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Progress rate</Text>
                  <Text className={`font-medium ${
                    strengthProgression.progressRate >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {strengthProgression.progressRate >= 0 ? '+' : ''}
                    {strengthProgression.progressRate.toFixed(1)}% per week
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* No Data State */}
          {!progressMetrics && !personalRecord && (
            <View className="bg-white rounded-lg border border-gray-200 p-6 items-center">
              <Text className="text-4xl mb-4">📊</Text>
              <Text className="text-xl font-semibold text-gray-900 mb-2">
                No Progress Data
              </Text>
              <Text className="text-gray-600 text-center mb-6">
                Start tracking workouts with this exercise to see your progress here.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  router.dismissAll();
                  router.push('/workout');
                }}
                className="bg-blue-500 rounded-lg py-3 px-6"
              >
                <Text className="text-white font-medium">Start Workout</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Quick Actions */}
          <View className="space-y-3 mt-6">
            <TouchableOpacity
              onPress={() => router.push(`/exercises/${exerciseId}`)}
              className="bg-gray-100 rounded-lg py-4 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-gray-700 font-semibold text-lg">
                View Exercise Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                router.dismissAll();
                router.push('/workout');
              }}
              className="bg-blue-500 rounded-lg py-4 items-center"
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