/**
 * ProgressMetric Model with Validation
 * Implements validation rules from data-model.md
 */

import { ProgressMetric } from '../models';

export class ProgressMetricValidator {
  static validate(metric: Partial<ProgressMetric>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate required fields
    if (!metric.userId || metric.userId.trim() === '') {
      errors.push('User ID is required');
    }

    if (!metric.exerciseId || metric.exerciseId.trim() === '') {
      errors.push('Exercise ID is required');
    }

    if (!metric.date || !(metric.date instanceof Date)) {
      errors.push('Valid date is required');
    }

    // Validate numeric fields
    if (typeof metric.oneRepMax !== 'number' || metric.oneRepMax < 0) {
      errors.push('One rep max must be a non-negative number');
    }

    if (typeof metric.totalVolume !== 'number' || metric.totalVolume < 0) {
      errors.push('Total volume must be a non-negative number');
    }

    if (typeof metric.frequency !== 'number' || metric.frequency < 0) {
      errors.push('Frequency must be a non-negative number');
    }

    if (metric.personalRecord !== undefined && typeof metric.personalRecord !== 'boolean') {
      errors.push('Personal record must be a boolean value');
    }

    // Validate reasonable ranges
    if (metric.oneRepMax && metric.oneRepMax > 10000) {
      errors.push('One rep max must be less than 10000 kg/lbs');
    }

    if (metric.totalVolume && metric.totalVolume > 1000000) {
      errors.push('Total volume must be less than 1,000,000');
    }

    if (metric.frequency && metric.frequency > 50) {
      errors.push('Frequency must be less than 50 per week');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static sanitize(metric: Partial<ProgressMetric>): ProgressMetric {
    return {
      userId: metric.userId?.trim() || '',
      exerciseId: metric.exerciseId?.trim() || '',
      date: metric.date || new Date(),
      oneRepMax: Math.max(0, metric.oneRepMax || 0),
      totalVolume: Math.max(0, metric.totalVolume || 0),
      frequency: Math.max(0, metric.frequency || 0),
      personalRecord: metric.personalRecord || false
    };
  }
}

export class ProgressMetricModel {
  private data: ProgressMetric;

  constructor(data: Partial<ProgressMetric>) {
    const validation = ProgressMetricValidator.validate(data);
    if (!validation.isValid) {
      throw new Error(`Invalid progress metric data: ${validation.errors.join(', ')}`);
    }
    this.data = ProgressMetricValidator.sanitize(data);
  }

  get userId(): string {
    return this.data.userId;
  }

  get exerciseId(): string {
    return this.data.exerciseId;
  }

  get date(): Date {
    return new Date(this.data.date);
  }

  get oneRepMax(): number {
    return this.data.oneRepMax;
  }

  get totalVolume(): number {
    return this.data.totalVolume;
  }

  get frequency(): number {
    return this.data.frequency;
  }

  get personalRecord(): boolean {
    return this.data.personalRecord;
  }

  toPlainObject(): ProgressMetric {
    return {
      userId: this.data.userId,
      exerciseId: this.data.exerciseId,
      date: new Date(this.data.date),
      oneRepMax: this.data.oneRepMax,
      totalVolume: this.data.totalVolume,
      frequency: this.data.frequency,
      personalRecord: this.data.personalRecord
    };
  }

  isPersonalRecord(): boolean {
    return this.data.personalRecord;
  }

  getProgressSince(previousMetric: ProgressMetric): {
    oneRepMaxChange: number;
    oneRepMaxPercentChange: number;
    volumeChange: number;
    volumePercentChange: number;
    frequencyChange: number;
  } {
    const oneRepMaxChange = this.data.oneRepMax - previousMetric.oneRepMax;
    const oneRepMaxPercentChange = previousMetric.oneRepMax > 0
      ? (oneRepMaxChange / previousMetric.oneRepMax) * 100
      : 0;

    const volumeChange = this.data.totalVolume - previousMetric.totalVolume;
    const volumePercentChange = previousMetric.totalVolume > 0
      ? (volumeChange / previousMetric.totalVolume) * 100
      : 0;

    const frequencyChange = this.data.frequency - previousMetric.frequency;

    return {
      oneRepMaxChange,
      oneRepMaxPercentChange,
      volumeChange,
      volumePercentChange,
      frequencyChange
    };
  }

  markAsPersonalRecord(): ProgressMetricModel {
    return new ProgressMetricModel({ ...this.data, personalRecord: true });
  }

  updateVolume(totalVolume: number): ProgressMetricModel {
    return new ProgressMetricModel({ ...this.data, totalVolume });
  }

  updateOneRepMax(oneRepMax: number): ProgressMetricModel {
    return new ProgressMetricModel({ ...this.data, oneRepMax });
  }

  static compareByDate(a: ProgressMetric, b: ProgressMetric): number {
    return b.date.getTime() - a.date.getTime(); // Descending order (newest first)
  }

  static compareByOneRepMax(a: ProgressMetric, b: ProgressMetric): number {
    return b.oneRepMax - a.oneRepMax; // Descending order
  }

  static compareByVolume(a: ProgressMetric, b: ProgressMetric): number {
    return b.totalVolume - a.totalVolume; // Descending order
  }

  static filterByDateRange(metrics: ProgressMetric[], startDate: Date, endDate: Date): ProgressMetric[] {
    return metrics.filter(metric =>
      metric.date >= startDate && metric.date <= endDate
    );
  }

  static getPersonalRecords(metrics: ProgressMetric[]): ProgressMetric[] {
    return metrics.filter(metric => metric.personalRecord);
  }

  static calculateTrendDirection(metrics: ProgressMetric[], property: keyof ProgressMetric): 'up' | 'down' | 'stable' {
    if (metrics.length < 2) return 'stable';

    const sortedMetrics = [...metrics].sort(ProgressMetricModel.compareByDate).reverse(); // Oldest first
    const firstValue = sortedMetrics[0][property] as number;
    const lastValue = sortedMetrics[sortedMetrics.length - 1][property] as number;

    const threshold = 0.05; // 5% threshold for considering stable
    const change = (lastValue - firstValue) / firstValue;

    if (change > threshold) return 'up';
    if (change < -threshold) return 'down';
    return 'stable';
  }
}