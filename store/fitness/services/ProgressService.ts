/**
 * ProgressService Implementation
 * Implements contract from contracts/progress-service.ts with calculations
 */

import {
  TimeRange,
  ProgressMetrics,
  FrequencyData,
  PersonalRecord,
  VolumeData,
  ConsistencyMetrics,
  StrengthProgression,
  Workout,
  StrengthPoint,
  VolumePoint
} from '../models';
import { WorkoutService } from './WorkoutService';
import { ExerciseService } from './ExerciseService';

export class ProgressService {
  private workoutService: WorkoutService;
  private exerciseService: ExerciseService;

  constructor() {
    this.workoutService = new WorkoutService();
    this.exerciseService = new ExerciseService();
  }

  async getExerciseProgress(exerciseId: string, timeRange: TimeRange): Promise<ProgressMetrics> {
    try {
      const workouts = await this.getWorkoutsInTimeRange(timeRange);
      const exercise = await this.exerciseService.getExerciseById(exerciseId);

      if (!exercise) {
        throw new Error(`Exercise with ID ${exerciseId} not found`);
      }

      const exerciseWorkouts = workouts.filter(workout =>
        workout.exercises.some(e => e.exerciseId === exerciseId)
      );

      if (exerciseWorkouts.length === 0) {
        return {
          exerciseId,
          exerciseName: exercise.name,
          oneRepMax: 0,
          totalVolume: 0,
          averageWeight: 0,
          totalSets: 0,
          totalReps: 0,
          progressPercentage: 0
        };
      }

      let totalVolume = 0;
      let totalSets = 0;
      let totalReps = 0;
      let totalWeight = 0;
      let maxOneRepMax = 0;

      exerciseWorkouts.forEach(workout => {
        const exerciseData = workout.exercises.find(e => e.exerciseId === exerciseId);
        if (exerciseData) {
          exerciseData.sets.forEach(set => {
            totalSets++;
            totalReps += set.reps;
            totalWeight += set.weight;
            totalVolume += set.reps * set.weight;

            // Calculate 1RM using Brzycki formula
            const oneRepMax = set.reps === 1 ? set.weight : set.weight * (36 / (37 - set.reps));
            maxOneRepMax = Math.max(maxOneRepMax, oneRepMax);
          });
        }
      });

      const averageWeight = totalSets > 0 ? totalWeight / totalSets : 0;

      // Calculate progress percentage (comparing first and last workout performance)
      const progressPercentage = this.calculateProgressPercentage(exerciseWorkouts, exerciseId);

      return {
        exerciseId,
        exerciseName: exercise.name,
        oneRepMax: maxOneRepMax,
        totalVolume,
        averageWeight,
        totalSets,
        totalReps,
        progressPercentage
      };
    } catch (error) {
      throw new Error(`Failed to get exercise progress: ${error.message}`);
    }
  }

  async getWorkoutFrequency(timeRange: TimeRange): Promise<FrequencyData> {
    try {
      const workouts = await this.getWorkoutsInTimeRange(timeRange);
      const workoutDates = workouts.map(w => w.startTime).sort((a, b) => a.getTime() - b.getTime());

      const totalWorkouts = workouts.length;
      const totalDays = Math.ceil((timeRange.endDate.getTime() - timeRange.startDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalWeeks = totalDays / 7;
      const averagePerWeek = totalWeeks > 0 ? totalWorkouts / totalWeeks : 0;

      const { longestStreak, currentStreak } = this.calculateStreaks(workoutDates);

      return {
        totalWorkouts,
        averagePerWeek,
        longestStreak,
        currentStreak,
        workoutDates
      };
    } catch (error) {
      throw new Error(`Failed to get workout frequency: ${error.message}`);
    }
  }

  async getPersonalRecords(): Promise<PersonalRecord[]> {
    try {
      const allWorkouts = await this.workoutService.getWorkoutHistory();
      const exerciseRecords = new Map<string, PersonalRecord>();

      for (const workout of allWorkouts) {
        for (const exerciseData of workout.exercises) {
          const currentRecord = exerciseRecords.get(exerciseData.exerciseId);

          for (const set of exerciseData.sets) {
            const volume = set.reps * set.weight;
            const oneRepMax = set.reps === 1 ? set.weight : set.weight * (36 / (37 - set.reps));

            if (!currentRecord ||
                set.weight > currentRecord.maxWeight ||
                set.reps > currentRecord.maxReps ||
                volume > currentRecord.maxVolume ||
                oneRepMax > currentRecord.oneRepMax) {

              const exercise = await this.exerciseService.getExerciseById(exerciseData.exerciseId);

              exerciseRecords.set(exerciseData.exerciseId, {
                exerciseId: exerciseData.exerciseId,
                exerciseName: exercise?.name || exerciseData.exerciseId,
                maxWeight: Math.max(currentRecord?.maxWeight || 0, set.weight),
                maxReps: Math.max(currentRecord?.maxReps || 0, set.reps),
                maxVolume: Math.max(currentRecord?.maxVolume || 0, volume),
                oneRepMax: Math.max(currentRecord?.oneRepMax || 0, oneRepMax),
                achievedDate: workout.startTime
              });
            }
          }
        }
      }

      return Array.from(exerciseRecords.values());
    } catch (error) {
      throw new Error(`Failed to get personal records: ${error.message}`);
    }
  }

  async getExercisePersonalRecord(exerciseId: string): Promise<PersonalRecord | null> {
    try {
      const allRecords = await this.getPersonalRecords();
      return allRecords.find(record => record.exerciseId === exerciseId) || null;
    } catch (error) {
      throw new Error(`Failed to get exercise personal record: ${error.message}`);
    }
  }

  async getTotalVolume(timeRange: TimeRange): Promise<VolumeData> {
    try {
      const workouts = await this.getWorkoutsInTimeRange(timeRange);

      let totalVolume = 0;
      const volumeByDate: VolumePoint[] = [];

      // Group workouts by date and calculate daily volume
      const volumeByDateMap = new Map<string, number>();

      workouts.forEach(workout => {
        const dateKey = workout.startTime.toDateString();
        let workoutVolume = 0;

        workout.exercises.forEach(exercise => {
          exercise.sets.forEach(set => {
            workoutVolume += set.reps * set.weight;
          });
        });

        totalVolume += workoutVolume;
        volumeByDateMap.set(dateKey, (volumeByDateMap.get(dateKey) || 0) + workoutVolume);
      });

      // Convert to array and sort by date
      volumeByDateMap.forEach((volume, dateString) => {
        volumeByDate.push({
          date: new Date(dateString),
          volume
        });
      });

      volumeByDate.sort((a, b) => a.date.getTime() - b.date.getTime());

      // Calculate trend direction
      const trendDirection = this.calculateTrendDirection(volumeByDate.map(v => v.volume));

      return {
        timeRange,
        totalVolume,
        volumeByDate,
        trendDirection
      };
    } catch (error) {
      throw new Error(`Failed to get total volume: ${error.message}`);
    }
  }

  async getConsistencyMetrics(timeRange: TimeRange): Promise<ConsistencyMetrics> {
    try {
      const workouts = await this.getWorkoutsInTimeRange(timeRange);
      const workoutDates = new Set(workouts.map(w => w.startTime.toDateString()));

      const totalDays = Math.ceil((timeRange.endDate.getTime() - timeRange.startDate.getTime()) / (1000 * 60 * 60 * 24));
      const workoutDays = workoutDates.size;
      const missedDays = totalDays - workoutDays;
      const consistencyPercentage = totalDays > 0 ? (workoutDays / totalDays) * 100 : 0;
      const averageWorkoutsPerWeek = totalDays > 0 ? (workouts.length / totalDays) * 7 : 0;

      return {
        workoutDays,
        totalDays,
        consistencyPercentage,
        averageWorkoutsPerWeek,
        missedDays
      };
    } catch (error) {
      throw new Error(`Failed to get consistency metrics: ${error.message}`);
    }
  }

  async getStrengthProgression(exerciseId: string, timeRange: TimeRange): Promise<StrengthProgression> {
    try {
      const workouts = await this.getWorkoutsInTimeRange(timeRange);
      const exercise = await this.exerciseService.getExerciseById(exerciseId);

      if (!exercise) {
        throw new Error(`Exercise with ID ${exerciseId} not found`);
      }

      const dataPoints: StrengthPoint[] = [];

      workouts.forEach(workout => {
        const exerciseData = workout.exercises.find(e => e.exerciseId === exerciseId);
        if (exerciseData && exerciseData.sets.length > 0) {
          let maxWeight = 0;
          let totalVolume = 0;
          let maxOneRepMax = 0;

          exerciseData.sets.forEach(set => {
            maxWeight = Math.max(maxWeight, set.weight);
            totalVolume += set.reps * set.weight;
            const oneRepMax = set.reps === 1 ? set.weight : set.weight * (36 / (37 - set.reps));
            maxOneRepMax = Math.max(maxOneRepMax, oneRepMax);
          });

          dataPoints.push({
            date: workout.startTime,
            weight: maxWeight,
            oneRepMax: maxOneRepMax,
            volume: totalVolume
          });
        }
      });

      // Sort by date
      dataPoints.sort((a, b) => a.date.getTime() - b.date.getTime());

      // Calculate trend direction and progress rate
      const trendDirection = this.calculateTrendDirection(dataPoints.map(d => d.oneRepMax));
      const progressRate = this.calculateProgressRate(dataPoints);

      return {
        exerciseId,
        exerciseName: exercise.name,
        dataPoints,
        trendDirection,
        progressRate
      };
    } catch (error) {
      throw new Error(`Failed to get strength progression: ${error.message}`);
    }
  }

  // Private helper methods
  private async getWorkoutsInTimeRange(timeRange: TimeRange): Promise<Workout[]> {
    const allWorkouts = await this.workoutService.getWorkoutHistory();
    return allWorkouts.filter(workout =>
      workout.startTime >= timeRange.startDate &&
      workout.startTime <= timeRange.endDate &&
      workout.endTime !== null // Only completed workouts
    );
  }

  private calculateProgressPercentage(workouts: Workout[], exerciseId: string): number {
    if (workouts.length < 2) return 0;

    const sortedWorkouts = workouts.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    const firstWorkout = sortedWorkouts[0];
    const lastWorkout = sortedWorkouts[sortedWorkouts.length - 1];

    const firstExercise = firstWorkout.exercises.find(e => e.exerciseId === exerciseId);
    const lastExercise = lastWorkout.exercises.find(e => e.exerciseId === exerciseId);

    if (!firstExercise || !lastExercise) return 0;

    const firstMaxWeight = Math.max(...firstExercise.sets.map(s => s.weight));
    const lastMaxWeight = Math.max(...lastExercise.sets.map(s => s.weight));

    return firstMaxWeight > 0 ? ((lastMaxWeight - firstMaxWeight) / firstMaxWeight) * 100 : 0;
  }

  private calculateStreaks(workoutDates: Date[]): { longestStreak: number; currentStreak: number } {
    if (workoutDates.length === 0) return { longestStreak: 0, currentStreak: 0 };

    let longestStreak = 1;
    let currentStreak = 1;
    let tempStreak = 1;

    for (let i = 1; i < workoutDates.length; i++) {
      const daysDiff = Math.abs(workoutDates[i].getTime() - workoutDates[i - 1].getTime()) / (1000 * 60 * 60 * 24);

      if (daysDiff <= 7) { // Within a week
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate current streak (from most recent workout)
    const now = new Date();
    const mostRecentWorkout = workoutDates[workoutDates.length - 1];
    const daysSinceLastWorkout = (now.getTime() - mostRecentWorkout.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceLastWorkout <= 7) {
      currentStreak = tempStreak;
    } else {
      currentStreak = 0;
    }

    return { longestStreak, currentStreak };
  }

  private calculateTrendDirection(values: number[]): 'up' | 'down' | 'stable' {
    if (values.length < 2) return 'stable';

    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const change = (lastValue - firstValue) / firstValue;

    const threshold = 0.05; // 5% threshold
    if (change > threshold) return 'up';
    if (change < -threshold) return 'down';
    return 'stable';
  }

  private calculateProgressRate(dataPoints: StrengthPoint[]): number {
    if (dataPoints.length < 2) return 0;

    const sortedPoints = dataPoints.sort((a, b) => a.date.getTime() - b.date.getTime());
    const firstPoint = sortedPoints[0];
    const lastPoint = sortedPoints[sortedPoints.length - 1];

    const timeDiffWeeks = (lastPoint.date.getTime() - firstPoint.date.getTime()) / (1000 * 60 * 60 * 24 * 7);
    const oneRepMaxChange = lastPoint.oneRepMax - firstPoint.oneRepMax;

    return timeDiffWeeks > 0 && firstPoint.oneRepMax > 0
      ? (oneRepMaxChange / firstPoint.oneRepMax / timeDiffWeeks) * 100
      : 0;
  }
}