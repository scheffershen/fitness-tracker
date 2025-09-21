/**
 * Progress Service Contract
 * Defines the interface for progress tracking and analytics
 */

export interface ProgressService {
  /**
   * Calculate progress metrics for an exercise
   * @param exerciseId Exercise to analyze
   * @param timeRange Time period for analysis
   * @returns Promise<ProgressMetrics> Calculated metrics
   */
  getExerciseProgress(exerciseId: string, timeRange: TimeRange): Promise<ProgressMetrics>;

  /**
   * Get workout frequency over time period
   * @param timeRange Time period to analyze
   * @returns Promise<FrequencyData> Workout frequency metrics
   */
  getWorkoutFrequency(timeRange: TimeRange): Promise<FrequencyData>;

  /**
   * Get personal records for all exercises
   * @returns Promise<PersonalRecord[]> List of personal records
   */
  getPersonalRecords(): Promise<PersonalRecord[]>;

  /**
   * Get personal record for specific exercise
   * @param exerciseId Exercise to check
   * @returns Promise<PersonalRecord | null> Exercise PR or null
   */
  getExercisePersonalRecord(exerciseId: string): Promise<PersonalRecord | null>;

  /**
   * Calculate total volume over time period
   * @param timeRange Time period to analyze
   * @returns Promise<VolumeData> Volume progression data
   */
  getTotalVolume(timeRange: TimeRange): Promise<VolumeData>;

  /**
   * Get consistency metrics
   * @param timeRange Time period to analyze
   * @returns Promise<ConsistencyMetrics> Consistency data
   */
  getConsistencyMetrics(timeRange: TimeRange): Promise<ConsistencyMetrics>;

  /**
   * Get strength progression for exercise
   * @param exerciseId Exercise to analyze
   * @param timeRange Time period to analyze
   * @returns Promise<StrengthProgression> Strength progression data
   */
  getStrengthProgression(exerciseId: string, timeRange: TimeRange): Promise<StrengthProgression>;
}

export interface TimeRange {
  startDate: Date;
  endDate: Date;
}

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