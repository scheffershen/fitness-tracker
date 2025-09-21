/**
 * Tab Navigation Layout
 * Main navigation structure for the fitness tracker
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

// Icon components (simplified for now)
const WorkoutIcon = ({ focused }: { focused: boolean }) => (
  <Text className={`text-lg ${focused ? 'text-blue-500' : 'text-gray-400'}`}>
    💪
  </Text>
);

const HistoryIcon = ({ focused }: { focused: boolean }) => (
  <Text className={`text-lg ${focused ? 'text-blue-500' : 'text-gray-400'}`}>
    📊
  </Text>
);

const ProgressIcon = ({ focused }: { focused: boolean }) => (
  <Text className={`text-lg ${focused ? 'text-blue-500' : 'text-gray-400'}`}>
    📈
  </Text>
);

const ExercisesIcon = ({ focused }: { focused: boolean }) => (
  <Text className={`text-lg ${focused ? 'text-blue-500' : 'text-gray-400'}`}>
    🏋️
  </Text>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: '#111827',
        },
        headerTintColor: '#3B82F6',
      }}
    >
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          tabBarIcon: WorkoutIcon,
          headerTitle: 'Workout',
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Exercises',
          tabBarIcon: ExercisesIcon,
          headerTitle: 'Exercise Library',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: HistoryIcon,
          headerTitle: 'Workout History',
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ProgressIcon,
          headerTitle: 'Progress Tracking',
        }}
      />
    </Tabs>
  );
}