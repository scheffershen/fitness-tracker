/**
 * ProgressChart Component
 * Displays progress data in various chart formats
 */

import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import {
  ProgressMetrics,
  StrengthProgression,
  VolumeData
} from '~/store/fitness/models';

interface ProgressChartProps {
  data: StrengthProgression | VolumeData | ProgressMetrics;
  type: 'strength' | 'volume' | 'metrics';
  height?: number;
  showGrid?: boolean;
  color?: string;
}

const { width: screenWidth } = Dimensions.get('window');
const defaultChartWidth = screenWidth - 40; // Account for padding

export function ProgressChart({
  data,
  type,
  height = 200,
  showGrid = true,
  color = '#3B82F6',
}: ProgressChartProps) {
  const chartWidth = defaultChartWidth;
  const chartHeight = height - 60; // Account for labels and padding

  const renderSimpleBarChart = (values: number[], labels: string[]) => {
    const maxValue = Math.max(...values, 1);
    const minValue = Math.min(...values, 0);
    const range = maxValue - minValue || 1;

    return (
      <View className="flex-1">
        {/* Chart Area */}
        <View
          style={{ height: chartHeight, width: chartWidth }}
          className="relative border-l-2 border-b-2 border-gray-300"
        >
          {/* Grid Lines */}
          {showGrid && (
            <>
              {[0.25, 0.5, 0.75].map((ratio) => (
                <View
                  key={ratio}
                  style={{
                    position: 'absolute',
                    bottom: chartHeight * ratio,
                    left: 0,
                    right: 0,
                    height: 1,
                  }}
                  className="bg-gray-200"
                />
              ))}
            </>
          )}

          {/* Bars */}
          <View className="flex-row items-end justify-between h-full px-2">
            {values.map((value, index) => {
              const normalizedValue = (value - minValue) / range;
              const barHeight = Math.max(normalizedValue * chartHeight, 2);

              return (
                <View key={index} className="flex-1 items-center mx-0.5">
                  <View
                    style={{
                      height: barHeight,
                      backgroundColor: color,
                    }}
                    className="w-full rounded-t-sm"
                  />
                </View>
              );
            })}
          </View>

          {/* Y-axis labels */}
          <View className="absolute -left-12 top-0 bottom-0 justify-between">
            <Text className="text-xs text-gray-500">{Math.round(maxValue)}</Text>
            <Text className="text-xs text-gray-500">{Math.round(maxValue * 0.75)}</Text>
            <Text className="text-xs text-gray-500">{Math.round(maxValue * 0.5)}</Text>
            <Text className="text-xs text-gray-500">{Math.round(maxValue * 0.25)}</Text>
            <Text className="text-xs text-gray-500">{Math.round(minValue)}</Text>
          </View>
        </View>

        {/* X-axis labels */}
        <View className="flex-row justify-between mt-2 px-2">
          {labels.map((label, index) => (
            <Text
              key={index}
              className="text-xs text-gray-500 flex-1 text-center"
              numberOfLines={1}
            >
              {label}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const renderLineChart = (points: { x: number; y: number }[], labels: string[]) => {
    if (points.length === 0) return null;

    const maxY = Math.max(...points.map(p => p.y), 1);
    const minY = Math.min(...points.map(p => p.y), 0);
    const rangeY = maxY - minY || 1;

    const stepX = chartWidth / Math.max(points.length - 1, 1);

    return (
      <View className="flex-1">
        {/* Chart Area */}
        <View
          style={{ height: chartHeight, width: chartWidth }}
          className="relative border-l-2 border-b-2 border-gray-300"
        >
          {/* Grid Lines */}
          {showGrid && (
            <>
              {[0.25, 0.5, 0.75].map((ratio) => (
                <View
                  key={ratio}
                  style={{
                    position: 'absolute',
                    bottom: chartHeight * ratio,
                    left: 0,
                    right: 0,
                    height: 1,
                  }}
                  className="bg-gray-200"
                />
              ))}
            </>
          )}

          {/* Data Points */}
          {points.map((point, index) => {
            const x = index * stepX;
            const y = chartHeight - ((point.y - minY) / rangeY) * chartHeight;

            return (
              <View
                key={index}
                style={{
                  position: 'absolute',
                  left: x - 3,
                  top: y - 3,
                  width: 6,
                  height: 6,
                  backgroundColor: color,
                }}
                className="rounded-full"
              />
            );
          })}

          {/* Connect points with lines (simplified) */}
          {points.length > 1 && (
            <View className="absolute inset-0">
              {points.slice(0, -1).map((point, index) => {
                const x1 = index * stepX;
                const y1 = chartHeight - ((point.y - minY) / rangeY) * chartHeight;
                const x2 = (index + 1) * stepX;
                const y2 = chartHeight - ((points[index + 1].y - minY) / rangeY) * chartHeight;

                const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

                return (
                  <View
                    key={index}
                    style={{
                      position: 'absolute',
                      left: x1,
                      top: y1,
                      width: length,
                      height: 2,
                      backgroundColor: color,
                      transformOrigin: '0 50%',
                      transform: [{ rotate: `${angle}deg` }],
                    }}
                  />
                );
              })}
            </View>
          )}

          {/* Y-axis labels */}
          <View className="absolute -left-12 top-0 bottom-0 justify-between">
            <Text className="text-xs text-gray-500">{Math.round(maxY)}</Text>
            <Text className="text-xs text-gray-500">{Math.round(maxY * 0.75)}</Text>
            <Text className="text-xs text-gray-500">{Math.round(maxY * 0.5)}</Text>
            <Text className="text-xs text-gray-500">{Math.round(maxY * 0.25)}</Text>
            <Text className="text-xs text-gray-500">{Math.round(minY)}</Text>
          </View>
        </View>

        {/* X-axis labels */}
        <View className="flex-row justify-between mt-2">
          {labels.slice(0, 5).map((label, index) => (
            <Text
              key={index}
              className="text-xs text-gray-500"
              numberOfLines={1}
            >
              {label}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const renderMetricsDisplay = (metrics: ProgressMetrics) => {
    return (
      <View className="flex-row justify-between items-center p-4">
        <View className="items-center">
          <Text className="text-2xl font-bold" style={{ color }}>
            {Math.round(metrics.oneRepMax)}
          </Text>
          <Text className="text-xs text-gray-500">1RM (lbs)</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold" style={{ color }}>
            {Math.round(metrics.totalVolume)}
          </Text>
          <Text className="text-xs text-gray-500">Volume</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold" style={{ color }}>
            {metrics.totalSets}
          </Text>
          <Text className="text-xs text-gray-500">Sets</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold" style={{ color }}>
            {Math.round(metrics.progressPercentage)}%
          </Text>
          <Text className="text-xs text-gray-500">Progress</Text>
        </View>
      </View>
    );
  };

  if (type === 'metrics' && 'oneRepMax' in data) {
    return (
      <View style={{ height }} className="bg-white rounded-lg border border-gray-200">
        {renderMetricsDisplay(data as ProgressMetrics)}
      </View>
    );
  }

  if (type === 'strength' && 'dataPoints' in data) {
    const strengthData = data as StrengthProgression;
    const points = strengthData.dataPoints.map((point, index) => ({
      x: index,
      y: point.oneRepMax,
    }));
    const labels = strengthData.dataPoints.map(point =>
      point.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    );

    return (
      <View style={{ height }} className="bg-white rounded-lg border border-gray-200 p-4">
        <Text className="text-lg font-semibold text-gray-900 mb-2">
          {strengthData.exerciseName} - Strength Progress
        </Text>
        {points.length > 0 ? (
          renderLineChart(points, labels)
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500">No data available</Text>
          </View>
        )}
      </View>
    );
  }

  if (type === 'volume' && 'volumeByDate' in data) {
    const volumeData = data as VolumeData;
    const values = volumeData.volumeByDate.map(point => point.volume);
    const labels = volumeData.volumeByDate.map(point =>
      point.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    );

    return (
      <View style={{ height }} className="bg-white rounded-lg border border-gray-200 p-4">
        <Text className="text-lg font-semibold text-gray-900 mb-2">
          Volume Progress
        </Text>
        {values.length > 0 ? (
          renderSimpleBarChart(values, labels)
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500">No data available</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={{ height }} className="bg-white rounded-lg border border-gray-200 p-4">
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">Chart type not supported</Text>
      </View>
    </View>
  );
}