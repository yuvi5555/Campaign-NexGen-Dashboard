// Machine Learning Analytics Service
// Implements predictive analytics, anomaly detection, and smart recommendations
// Uses real datasets with seasonal patterns and business cycles

import { REAL_DATASETS } from './real-datasets';

export interface PredictiveMetrics {
  current: number;
  predicted: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  nextHourPrediction: number;
  nextDayPrediction: number;
}

export interface AnomalyAlert {
  id: string;
  metric: string;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  description: string;
}

export interface TrendAnalysis {
  metric: string;
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  strength: number; // 0-1
  period: string; // '1h', '24h', '7d', '30d'
  slope: number;
  r2: number; // coefficient of determination
  seasonality: boolean;
  forecast: number[];
}

export interface SmartRecommendation {
  id: string;
  type: 'optimization' | 'alert' | 'insight' | 'action';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
  actions: string[];
  metrics: string[];
}

export interface MLAnalyticsData {
  predictions: Record<string, PredictiveMetrics>;
  anomalies: AnomalyAlert[];
  trends: TrendAnalysis[];
  recommendations: SmartRecommendation[];
  insights: string[];
}

// Simple Linear Regression for trend analysis
function linearRegression(data: number[]): { slope: number; intercept: number; r2: number } {
  const n = data.length;
  const x = Array.from({ length: n }, (_, i) => i);

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = data.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * data[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumYY = data.reduce((sum, yi) => sum + yi * yi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R²
  const yMean = sumY / n;
  const ssRes = data.reduce((sum, yi, i) => {
    const predicted = slope * i + intercept;
    return sum + Math.pow(yi - predicted, 2);
  }, 0);
  const ssTot = data.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
  const r2 = 1 - (ssRes / ssTot);

  return { slope, intercept, r2: isNaN(r2) ? 0 : r2 };
}

// Simple moving average for smoothing
function movingAverage(data: number[], window: number = 3): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const end = i + 1;
    const slice = data.slice(start, end);
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
    result.push(avg);
  }
  return result;
}

// Detect seasonality using autocorrelation
function detectSeasonality(data: number[], period: number = 24): boolean {
  if (data.length < period * 2) return false;

  const correlations: number[] = [];
  for (let lag = 1; lag <= period; lag++) {
    let sum = 0;
    let count = 0;
    for (let i = lag; i < data.length; i++) {
      sum += data[i] * data[i - lag];
      count++;
    }
    correlations.push(sum / count);
  }

  const maxCorr = Math.max(...correlations);
  return maxCorr > 0.7; // Threshold for seasonality detection
}

// Generate predictive metrics
export function generatePredictions(currentMetrics: Record<string, number>): Record<string, PredictiveMetrics> {
  const predictions: Record<string, PredictiveMetrics> = {};

  Object.entries(currentMetrics).forEach(([key, current]) => {
    // Generate historical data (simulate last 24 hours)
    const historicalData = Array.from({ length: 24 }, () =>
      current * (0.8 + Math.random() * 0.4) // ±20% variation
    );

    // Add current value
    historicalData.push(current);

    // Calculate trend
    const { slope, r2 } = linearRegression(historicalData);
    const trend: 'up' | 'down' | 'stable' = slope > 0.01 ? 'up' : slope < -0.01 ? 'down' : 'stable';

    // Simple exponential smoothing for prediction
    const alpha = 0.3;
    let smoothed = historicalData[0];
    for (let i = 1; i < historicalData.length; i++) {
      smoothed = alpha * historicalData[i] + (1 - alpha) * smoothed;
    }

    // Generate predictions
    const nextHour = smoothed * (0.95 + Math.random() * 0.1); // ±5% variation
    const nextDay = smoothed * (0.9 + Math.random() * 0.2); // ±10% variation

    const changePercent = ((nextHour - current) / current) * 100;
    const confidence = Math.min(0.95, r2 + 0.3); // Base confidence on R²

    predictions[key] = {
      current,
      predicted: nextHour,
      confidence,
      trend,
      changePercent,
      nextHourPrediction: nextHour,
      nextDayPrediction: nextDay
    };
  });

  return predictions;
}

// Detect anomalies using statistical methods
export function detectAnomalies(metrics: Record<string, number>, historicalData: Record<string, number[]>): AnomalyAlert[] {
  const anomalies: AnomalyAlert[] = [];

  Object.entries(metrics).forEach(([metric, currentValue]) => {
    const history = historicalData[metric] || [];
    if (history.length < 5) return;

    // Calculate mean and standard deviation
    const mean = history.reduce((a, b) => a + b, 0) / history.length;
    const variance = history.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / history.length;
    const stdDev = Math.sqrt(variance);

    // Z-score calculation
    const zScore = Math.abs((currentValue - mean) / stdDev);

    // Determine if it's an anomaly
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let description = '';

    if (zScore > 3) {
      severity = 'critical';
      description = `Critical anomaly detected: ${metric} is ${zScore.toFixed(1)} standard deviations from normal`;
    } else if (zScore > 2.5) {
      severity = 'high';
      description = `High anomaly detected: ${metric} significantly deviates from normal range`;
    } else if (zScore > 2) {
      severity = 'medium';
      description = `Medium anomaly detected: ${metric} shows unusual behavior`;
    } else if (zScore > 1.5) {
      severity = 'low';
      description = `Minor anomaly detected: ${metric} slightly outside normal range`;
    }

    if (severity !== 'low') {
      anomalies.push({
        id: `anomaly-${Date.now()}-${metric}`,
        metric,
        value: currentValue,
        expectedValue: mean,
        deviation: zScore,
        severity,
        timestamp: new Date().toISOString(),
        description
      });
    }
  });

  return anomalies;
}

// Analyze trends using ML techniques
export function analyzeTrends(metrics: Record<string, number[]>, period: string = '24h'): TrendAnalysis[] {
  const trends: TrendAnalysis[] = [];

  Object.entries(metrics).forEach(([metric, data]) => {
    if (data.length < 5) return;

    // Apply moving average to smooth data
    const smoothed = movingAverage(data, 3);

    // Linear regression for trend
    const { slope, r2 } = linearRegression(smoothed);

    // Determine trend type and strength
    let trend: 'increasing' | 'decreasing' | 'stable' | 'volatile' = 'stable';
    let strength = Math.min(1, Math.abs(slope) / Math.max(...data) * 10);

    if (Math.abs(slope) < 0.001) {
      trend = 'stable';
    } else if (slope > 0) {
      trend = 'increasing';
    } else {
      trend = 'decreasing';
    }

    // Check for volatility
    const volatility = calculateVolatility(data);
    if (volatility > 0.3) {
      trend = 'volatile';
      strength = Math.min(1, volatility);
    }

    // Detect seasonality
    const seasonality = detectSeasonality(data);

    // Generate forecast (simple extrapolation)
    const forecast = [];
    const lastValue = data[data.length - 1];
    for (let i = 1; i <= 7; i++) {
      forecast.push(lastValue + slope * i);
    }

    trends.push({
      metric,
      trend,
      strength,
      period,
      slope,
      r2,
      seasonality,
      forecast
    });
  });

  return trends;
}

// Calculate volatility (coefficient of variation)
function calculateVolatility(data: number[]): number {
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);
  return stdDev / mean;
}

// Generate smart recommendations based on ML insights
export function generateRecommendations(
  predictions: Record<string, PredictiveMetrics>,
  anomalies: AnomalyAlert[],
  trends: TrendAnalysis[]
): SmartRecommendation[] {
  const recommendations: SmartRecommendation[] = [];

  // Recommendations based on predictions
  Object.entries(predictions).forEach(([metric, pred]) => {
    if (pred.trend === 'up' && pred.changePercent > 10) {
      recommendations.push({
        id: `rec-growth-${metric}`,
        type: 'insight',
        priority: 'high',
        title: `${metric} Growth Opportunity`,
        description: `${metric} is predicted to grow by ${pred.changePercent.toFixed(1)}% in the next hour. Consider scaling resources.`,
        impact: 'positive',
        confidence: pred.confidence,
        actions: [
          'Increase resource allocation',
          'Prepare for higher demand',
          'Monitor closely for next 24 hours'
        ],
        metrics: [metric]
      });
    } else if (pred.trend === 'down' && Math.abs(pred.changePercent) > 15) {
      recommendations.push({
        id: `rec-decline-${metric}`,
        type: 'alert',
        priority: 'high',
        title: `${metric} Decline Alert`,
        description: `${metric} is expected to decrease by ${Math.abs(pred.changePercent).toFixed(1)}%. Investigate potential issues.`,
        impact: 'negative',
        confidence: pred.confidence,
        actions: [
          'Investigate root cause',
          'Prepare contingency plans',
          'Review recent changes'
        ],
        metrics: [metric]
      });
    }
  });

  // Recommendations based on anomalies
  anomalies.forEach(anomaly => {
    if (anomaly.severity === 'critical' || anomaly.severity === 'high') {
      recommendations.push({
        id: `rec-anomaly-${anomaly.id}`,
        type: 'alert',
        priority: anomaly.severity === 'critical' ? 'high' : 'medium',
        title: `Critical Anomaly in ${anomaly.metric}`,
        description: anomaly.description,
        impact: 'negative',
        confidence: 0.9,
        actions: [
          'Immediate investigation required',
          'Check system health',
          'Review recent deployments',
          'Contact on-call engineer'
        ],
        metrics: [anomaly.metric]
      });
    }
  });

  // Recommendations based on trends
  trends.forEach(trend => {
    if (trend.trend === 'volatile' && trend.strength > 0.5) {
      recommendations.push({
        id: `rec-volatility-${trend.metric}`,
        type: 'optimization',
        priority: 'medium',
        title: `Stabilize ${trend.metric} Volatility`,
        description: `${trend.metric} shows high volatility (${(trend.strength * 100).toFixed(0)}%). Consider implementing stabilization measures.`,
        impact: 'neutral',
        confidence: 0.8,
        actions: [
          'Implement load balancing',
          'Add circuit breakers',
          'Review caching strategies',
          'Monitor for patterns'
        ],
        metrics: [trend.metric]
      });
    } else if (trend.seasonality) {
      recommendations.push({
        id: `rec-seasonal-${trend.metric}`,
        type: 'insight',
        priority: 'low',
        title: `Seasonal Pattern Detected in ${trend.metric}`,
        description: `${trend.metric} exhibits seasonal behavior. Plan resources accordingly.`,
        impact: 'positive',
        confidence: 0.85,
        actions: [
          'Schedule resources for peak periods',
          'Implement predictive scaling',
          'Prepare seasonal reports'
        ],
        metrics: [trend.metric]
      });
    }
  });

  // Sort by priority and confidence
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.confidence - a.confidence;
  });
}

// Generate AI insights
export function generateInsights(
  predictions: Record<string, PredictiveMetrics>,
  trends: TrendAnalysis[],
  anomalies: AnomalyAlert[]
): string[] {
  const insights: string[] = [];

  // Overall system health
  const criticalAnomalies = anomalies.filter(a => a.severity === 'critical').length;
  const highAnomalies = anomalies.filter(a => a.severity === 'high').length;

  if (criticalAnomalies > 0) {
    insights.push(`🚨 Critical system issues detected (${criticalAnomalies}). Immediate attention required.`);
  } else if (highAnomalies > 0) {
    insights.push(`⚠️ High-priority anomalies detected (${highAnomalies}). Monitor closely.`);
  } else {
    insights.push(`✅ System operating within normal parameters.`);
  }

  // Growth insights
  const growingMetrics = Object.entries(predictions).filter(([_, pred]) =>
    pred.trend === 'up' && pred.changePercent > 5
  );

  if (growingMetrics.length > 0) {
    insights.push(`📈 ${growingMetrics.length} metrics showing positive growth trends.`);
  }

  // Trend insights
  const volatileMetrics = trends.filter(t => t.trend === 'volatile' && t.strength > 0.4);
  if (volatileMetrics.length > 0) {
    insights.push(`🔄 ${volatileMetrics.length} metrics exhibiting high volatility. Consider stabilization.`);
  }

  // Seasonal insights
  const seasonalMetrics = trends.filter(t => t.seasonality);
  if (seasonalMetrics.length > 0) {
    insights.push(`📅 ${seasonalMetrics.length} metrics show seasonal patterns. Resource planning recommended.`);
  }

  return insights;
}

// Backend ML prediction service
export async function getBackendPredictions(
  metric: string,
  payload: {
    company?: string;
    campaign_type?: string;
    channel?: string;
    target_audience?: string;
    location?: string;
    language?: string;
    customer_segment?: string;
    horizon?: number;
  } = {}
): Promise<{
  timestamp: string;
  metric: string;
  horizon: number;
  current: number | null;
  prediction: number | null;
  confidence: number;
  xgb_prediction: number | null;
  prophet_prediction: number | null;
  models_used: number;
  insights: { best_channels_by_roi: Array<{ [key: string]: unknown }> };
}> {
  try {
    const response = await fetch('http://localhost:3001/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metric,
        ...payload
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Prediction API error: ${response.statusText} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from prediction API');
    }

    return data;
  } catch (error) {
    console.error('Backend prediction error:', error);
    throw error;
  }
}

// Main ML analytics function using backend models
export async function performMLAnalytics(
  currentMetrics: Record<string, number>,
  historicalData?: Record<string, number[]>
): Promise<MLAnalyticsData> {
  try {
    // Get predictions from backend for key metrics
    const predictionPromises = Object.keys(currentMetrics).map(async (metric) => {
      try {
        const backendResult = await getBackendPredictions(metric, {
          company: "TechCorp",
          campaign_type: "Email",
          channel: "Social",
          target_audience: "Young Professionals",
          location: "Global",
          language: "English",
          customer_segment: "Premium",
          horizon: 1
        });

        // Convert backend result to frontend format
        const current = backendResult.current || currentMetrics[metric];
        const predicted = backendResult.prediction || currentMetrics[metric];
        const trend: 'up' | 'down' | 'stable' = predicted > current ? 'up' : predicted < current ? 'down' : 'stable';

        return {
          metric,
          prediction: {
            current,
            predicted,
            confidence: backendResult.confidence,
            trend,
            changePercent: backendResult.prediction ?
              ((backendResult.prediction - current) / current) * 100 : 0,
            nextHourPrediction: backendResult.prediction || currentMetrics[metric],
            nextDayPrediction: backendResult.prediction ? backendResult.prediction * (0.95 + Math.random() * 0.1) : currentMetrics[metric]
          }
        };
      } catch (error) {
        console.warn(`Failed to get backend prediction for ${metric}:`, error);
        // Fallback to client-side prediction
        return {
          metric,
          prediction: generatePredictions({ [metric]: currentMetrics[metric] })[metric]
        };
      }
    });

    const predictionResults = await Promise.all(predictionPromises);
    const predictions: Record<string, PredictiveMetrics> = {};
    predictionResults.forEach(({ metric, prediction }) => {
      predictions[metric] = prediction;
    });

    // Use real datasets for analysis (fallback for anomalies and trends)
    const realHistoricalData: Record<string, number[]> = {};
    Object.keys(currentMetrics).forEach(metricName => {
      if (REAL_DATASETS[metricName]) {
        const historicalValues = REAL_DATASETS[metricName].historical
          .slice(-24)
          .map(d => d.value);
        realHistoricalData[metricName] = historicalValues;
      } else if (historicalData?.[metricName]) {
        realHistoricalData[metricName] = historicalData[metricName];
      }
    });

    const anomalies = detectAnomalies(currentMetrics, realHistoricalData);
    const trends = analyzeTrends(realHistoricalData);
    const recommendations = generateRecommendations(predictions, anomalies, trends);
    const insights = generateInsights(predictions, trends, anomalies);

    return {
      predictions,
      anomalies,
      trends,
      recommendations,
      insights
    };
  } catch (error) {
    console.error('ML Analytics error:', error);
    // Fallback to client-side analysis
    const realHistoricalData: Record<string, number[]> = {};
    Object.keys(currentMetrics).forEach(metricName => {
      if (REAL_DATASETS[metricName]) {
        const historicalValues = REAL_DATASETS[metricName].historical
          .slice(-24)
          .map(d => d.value);
        realHistoricalData[metricName] = historicalValues;
      } else if (historicalData?.[metricName]) {
        realHistoricalData[metricName] = historicalData[metricName];
      }
    });

    const predictions = generatePredictions(currentMetrics);
    const anomalies = detectAnomalies(currentMetrics, realHistoricalData);
    const trends = analyzeTrends(realHistoricalData);
    const recommendations = generateRecommendations(predictions, anomalies, trends);
    const insights = generateInsights(predictions, trends, anomalies);

    return {
      predictions,
      anomalies,
      trends,
      recommendations,
      insights
    };
  }
}

// Types are already exported as interfaces above