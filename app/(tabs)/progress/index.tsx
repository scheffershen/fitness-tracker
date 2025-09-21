/**
 * Progress Tracking Screen
 * Shows progress metrics, charts, and personal records
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
import { router } from 'expo-router';
import { useProgressStore } from '~/store/fitness/progressStore';
import { useExerciseStore } from '~/store/fitness/exerciseStore';
import { ProgressChart } from '~/components/progress/ProgressChart';
import { Container } from '~/components/Container';

export default function ProgressTrackingScreen() {
  const {
    workoutFrequency,
    totalVolume,
    consistencyMetrics,
    personalRecords,
    filters,
    isLoading,
    error,
    refreshAllProgress,
    setLastWeek,
    setLastMonth,
    setLast3Months,
    setLast6Months,
    getProgressSummary,
    clearError,
  } = useProgressStore();

  const { exercises, loadExercises } = useExerciseStore();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1m');

  useEffect(() => {
    loadExercises();
    refreshAllProgress();
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
      loadExercises(),
      refreshAllProgress(),
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
    }
  };

  const getExerciseName = (exerciseId: string) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    return exercise?.name || exerciseId;
  };

  const formatTimeRange = () => {
    const start = filters.timeRange.startDate.toLocaleDateString();
    const end = filters.timeRange.endDate.toLocaleDateString();
    return `${start} - ${end}`;
  };

  const summary = getProgressSummary();

  const timeRanges = [
    { key: '1w', label: '1W' },
    { key: '1m', label: '1M' },
    { key: '3m', label: '3M' },
    { key: '6m', label: '6M' },
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
          {/* Overall Progress Summary */}
          <View className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Progress Overview
            </Text>

            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-2xl font-bold text-blue-600">
                  {summary.totalWorkouts}
                </Text>
                <Text className="text-xs text-gray-500">Workouts</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-green-600">
                  {Math.round(summary.totalVolume).toLocaleString()}
                </Text>
                <Text className="text-xs text-gray-500">Volume (lbs)</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-purple-600">
                  {Math.round(summary.averageConsistency)}%
                </Text>
                <Text className="text-xs text-gray-500">Consistency</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-orange-600">
                  {summary.recordCount}
                </Text>
                <Text className="text-xs text-gray-500">Records</Text>
              </View>
            </View>
          </View>

          {/* Workout Frequency */}
          {workoutFrequency && (
            <View className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Workout Frequency
              </Text>

              <View className="flex-row justify-between mb-3">
                <View>
                  <Text className="text-sm text-gray-600">
                    Average per week
                  </Text>
                  <Text className="text-xl font-bold text-blue-600">
                    {workoutFrequency.averagePerWeek.toFixed(1)}
                  </Text>
                </View>
                <View>
                  <Text className="text-sm text-gray-600">
                    Longest streak
                  </Text>
                  <Text className="text-xl font-bold text-green-600">
                    {workoutFrequency.longestStreak}
                  </Text>
                </View>
                <View>
                  <Text className="text-sm text-gray-600">
                    Current streak
                  </Text>
                  <Text className="text-xl font-bold text-orange-600">
                    {workoutFrequency.currentStreak}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Volume Chart */}
          {totalVolume && (
            <View className="mb-6">
              <ProgressChart
                data={totalVolume}
                type="volume"
                height={250}
                color="#10B981"
              />
            </View>
          )}

          {/* Consistency Metrics */}
          {consistencyMetrics && (
            <View className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Consistency Metrics
              </Text>

              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Workout days</Text>
                  <Text className="font-medium">
                    {consistencyMetrics.workoutDays} / {consistencyMetrics.totalDays}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Consistency rate</Text>
                  <Text className="font-medium text-green-600">
                    {consistencyMetrics.consistencyPercentage.toFixed(1)}%
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Avg workouts/week</Text>
                  <Text className="font-medium">
                    {consistencyMetrics.averageWorkoutsPerWeek.toFixed(1)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Personal Records */}
          <View className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold text-gray-900">
                Personal Records
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/progress/records')}
                className="bg-blue-500 rounded px-3 py-1"
              >
                <Text className="text-white text-sm font-medium">View All</Text>
              </TouchableOpacity>
            </View>

            {personalRecords.length > 0 ? (
              <View className="space-y-3">
                {personalRecords.slice(0, 5).map((record) => (
                  <TouchableOpacity
                    key={record.exerciseId}
                    onPress={() => router.push(`/progress/${record.exerciseId}`)}
                    className="flex-row justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <View className="flex-1">
                      <Text className="font-medium text-gray-900">
                        {getExerciseName(record.exerciseId)}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        1RM: {Math.round(record.oneRepMax)} lbs
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-sm font-medium text-gray-900">
                        {record.maxWeight} lbs × {record.maxReps}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {record.achievedDate.toLocaleDateString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}

                {personalRecords.length > 5 && (
                  <TouchableOpacity
                    onPress={() => router.push('/progress/records')}
                    className="items-center py-2"
                  >
                    <Text className="text-blue-500 font-medium">
                      View {personalRecords.length - 5} more records
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View className="items-center py-6">
                <Text className="text-gray-500 mb-2">No records yet</Text>
                <Text className="text-sm text-gray-400 text-center">
                  Complete some workouts to see your personal records
                </Text>
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View className="space-y-3">
            <TouchableOpacity
              onPress={() => router.push('/progress/exercises')}
              className="bg-white rounded-lg border border-gray-200 p-4 flex-row items-center justify-between"
            >
              <View>
                <Text className="font-medium text-gray-900">
                  Exercise Progress
                </Text>
                <Text className="text-sm text-gray-500">
                  View progress for specific exercises
                </Text>
              </View>
              <Text className="text-gray-400">›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/workout')}
              className="bg-blue-500 rounded-lg p-4 items-center"
            >
              <Text className="text-white font-medium">Start New Workout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
}