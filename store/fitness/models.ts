/**
 * Fitness Tracker Data Models
 * Type definitions for all entities in the fitness tracking system
 */

// Core entity interfaces
export interface Exercise {
  id: string;
  name: string;
  muscleGroups: string[];
  equipment: string[];
  category: string;
  instructions: string;
  imageUrl: string;
}

export interface Set {
  reps: number;
  weight: number;
  completed: boolean;
  restTime: number;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: Set[];
  restTime: number;
  notes: string;
}

export interface Workout {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date | null;
  exercises: WorkoutExercise[];
  notes: string;
}

export interface ExerciseCategory {
  id: string;
  name: string;
  type: 'muscle' | 'equipment' | 'movement';
  parentId?: string;
}

export interface ProgressMetric {
  userId: string;
  exerciseId: string;
  date: Date;
  oneRepMax: number;
  totalVolume: number;
  frequency: number;
  personalRecord: boolean;
}

// Input types for forms
export interface SetInput {
  reps: number;
  weight: number;
  completed?: boolean;
}

export interface TimeRange {
  startDate: Date;
  endDate: Date;
}

// Progress tracking interfaces
export interface ProgressMetrics {
  exerciseId: string;
  exerciseName: string;
  oneRepMax: number;
  totalVolume: number;
  averageWeight: number;
  totalSets: number;
  totalReps: number;
  progressPercentage: number;
}

export interface FrequencyData {
  totalWorkouts: number;
  averagePerWeek: number;
  longestStreak: number;
  currentStreak: number;
  workoutDates: Date[];
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  maxWeight: number;
  maxReps: number;
  maxVolume: number;
  oneRepMax: number;
  achievedDate: Date;
}

export interface VolumeData {
  timeRange: TimeRange;
  totalVolume: number;
  volumeByDate: VolumePoint[];
  trendDirection: 'up' | 'down' | 'stable';
}

export interface VolumePoint {
  date: Date;
  volume: number;
}

export interface ConsistencyMetrics {
  workoutDays: number;
  totalDays: number;
  consistencyPercentage: number;
  averageWorkoutsPerWeek: number;
  missedDays: number;
}

export interface StrengthProgression {
  exerciseId: string;
  exerciseName: string;
  dataPoints: StrengthPoint[];
  trendDirection: 'up' | 'down' | 'stable';
  progressRate: number; // percentage improvement per week
}

export interface StrengthPoint {
  date: Date;
  weight: number;
  oneRepMax: number;
  volume: number;
}

// User preferences
export interface UserPreferences {
  weightUnit: 'kg' | 'lbs';
  defaultRestTime: number;
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
}

// Validation errors
export interface ValidationError {
  field: string;
  message: string;
}

// Common utility types
export type WorkoutStatus = 'in_progress' | 'completed' | 'abandoned';
export type ExerciseType = 'strength' | 'cardio' | 'flexibility' | 'sports';
export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'full_body';
export type EquipmentType = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'resistance_band' | 'kettlebell';