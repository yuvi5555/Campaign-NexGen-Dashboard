// Real Datasets for ML Analytics
// Provides realistic time series data with seasonal patterns, business cycles, and real-world variations
// Can load data from Power BI if configured

import { executeQuery, isAuthenticated } from './powerbi';

const POWERBI_DATASET_ID = import.meta.env.VITE_POWERBI_DATASET_ID;
const POWERBI_TABLE_NAME = import.meta.env.VITE_POWERBI_TABLE_NAME || 'Data'; // Default table name

export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
  metadata?: {
    dayOfWeek: number;
    hourOfDay: number;
    isBusinessHour: boolean;
    isPeakHour: boolean;
    season: 'winter' | 'spring' | 'summer' | 'fall';
  };
}

export interface MetricDataset {
  name: string;
  description: string;
  unit: string;
  current: number;
  historical: TimeSeriesDataPoint[];
  baseline: {
    mean: number;
    stdDev: number;
    min: number;
    max: number;
    normalRange: [number, number];
  };
  seasonality: {
    hasSeasonality: boolean;
    peakHours: number[];
    businessDaysPattern: number[];
    monthlyPattern: number[];
  };
}

// Generate realistic timestamps for the last N days
function generateTimestamps(days: number = 30, intervalMinutes: number = 60): string[] {
  const timestamps: string[] = [];
  const now = new Date();

  for (let i = days * 24 * (60 / intervalMinutes) - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * intervalMinutes * 60 * 1000);
    timestamps.push(timestamp.toISOString());
  }

  return timestamps;
}

// Add seasonal patterns to base values
function applySeasonalPattern(baseValue: number, timestamp: string, seasonality: {
  peakHours: number[];
  businessDaysPattern: number[];
  monthlyPattern: number[];
}): number {
  const date = new Date(timestamp);
  const hour = date.getHours();
  const dayOfWeek = date.getDay();
  const month = date.getMonth();

  let multiplier = 1;

  // Business hours pattern (9 AM - 5 PM higher activity)
  if (hour >= 9 && hour <= 17) {
    multiplier *= 1.3;
  } else if (hour >= 6 && hour <= 8) {
    multiplier *= 0.8; // Morning ramp-up
  } else {
    multiplier *= 0.4; // Off-hours
  }

  // Weekend pattern (lower activity)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    multiplier *= 0.6;
  }

  // Peak hours (11 AM - 2 PM, 4-5 PM)
  if ((hour >= 11 && hour <= 14) || (hour >= 16 && hour <= 17)) {
    multiplier *= 1.2;
  }

  // Monthly seasonal patterns
  const monthlyMultipliers = [0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.1, 1.05, 1.0, 0.95, 0.9, 0.85];
  multiplier *= monthlyMultipliers[month];

  // Add some random variation (±15%)
  const randomVariation = 0.85 + Math.random() * 0.3;
  multiplier *= randomVariation;

  return Math.round(baseValue * multiplier);
}

// Generate realistic active reports data
function generateActiveReportsData(): MetricDataset {
  const timestamps = generateTimestamps(30);
  const baseValue = 25;

  const historical: TimeSeriesDataPoint[] = timestamps.map(timestamp => {
    const date = new Date(timestamp);
    const value = applySeasonalPattern(baseValue, timestamp, {
      peakHours: [11, 12, 13, 14, 16, 17],
      businessDaysPattern: [0.6, 1.0, 1.0, 1.0, 1.0, 1.0, 0.7], // Sun-Sat
      monthlyPattern: [0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.1, 1.05, 1.0, 0.95, 0.9, 0.85]
    });

    return {
      timestamp,
      value,
      metadata: {
        dayOfWeek: date.getDay(),
        hourOfDay: date.getHours(),
        isBusinessHour: date.getHours() >= 9 && date.getHours() <= 17,
        isPeakHour: (date.getHours() >= 11 && date.getHours() <= 14) || (date.getHours() >= 16 && date.getHours() <= 17),
        season: getSeason(date.getMonth())
      }
    };
  });

  const values = historical.map(d => d.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return {
    name: 'activeReports',
    description: 'Number of active Power BI reports',
    unit: 'count',
    current: values[values.length - 1],
    historical,
    baseline: {
      mean: Math.round(mean),
      stdDev: Math.round(stdDev),
      min: Math.min(...values),
      max: Math.max(...values),
      normalRange: [Math.round(mean - stdDev), Math.round(mean + stdDev)]
    },
    seasonality: {
      hasSeasonality: true,
      peakHours: [11, 12, 13, 14, 16, 17],
      businessDaysPattern: [0.6, 1.0, 1.0, 1.0, 1.0, 1.0, 0.7],
      monthlyPattern: [0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.1, 1.05, 1.0, 0.95, 0.9, 0.85]
    }
  };
}

// Generate realistic email sent data
function generateEmailsSentData(): MetricDataset {
  const timestamps = generateTimestamps(30);
  const baseValue = 150;

  const historical: TimeSeriesDataPoint[] = timestamps.map(timestamp => {
    const date = new Date(timestamp);
    let value = applySeasonalPattern(baseValue, timestamp, {
      peakHours: [9, 10, 11, 14, 15, 16],
      businessDaysPattern: [0.3, 1.0, 1.0, 1.0, 1.0, 1.0, 0.4],
      monthlyPattern: [0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.2, 1.1, 1.0, 0.9, 0.8, 0.7]
    });

    // Add some spikes for marketing campaigns
    if (Math.random() < 0.05) { // 5% chance of campaign spike
      value *= 1.8;
    }

    return {
      timestamp,
      value: Math.round(value),
      metadata: {
        dayOfWeek: date.getDay(),
        hourOfDay: date.getHours(),
        isBusinessHour: date.getHours() >= 9 && date.getHours() <= 17,
        isPeakHour: date.getHours() >= 14 && date.getHours() <= 16,
        season: getSeason(date.getMonth())
      }
    };
  });

  const values = historical.map(d => d.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return {
    name: 'emailsSentToday',
    description: 'Number of emails sent today',
    unit: 'count',
    current: values[values.length - 1],
    historical,
    baseline: {
      mean: Math.round(mean),
      stdDev: Math.round(stdDev),
      min: Math.min(...values),
      max: Math.max(...values),
      normalRange: [Math.round(mean - stdDev), Math.round(mean + stdDev)]
    },
    seasonality: {
      hasSeasonality: true,
      peakHours: [9, 10, 11, 14, 15, 16],
      businessDaysPattern: [0.3, 1.0, 1.0, 1.0, 1.0, 1.0, 0.4],
      monthlyPattern: [0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.2, 1.1, 1.0, 0.9, 0.8, 0.7]
    }
  };
}

// Generate realistic distribution lists data
function generateDistributionListsData(): MetricDataset {
  const timestamps = generateTimestamps(30, 1440); // Daily data
  const baseValue = 8;

  const historical: TimeSeriesDataPoint[] = timestamps.map(timestamp => {
    const date = new Date(timestamp);
    let value = baseValue;

    // Slow growth trend
    const daysSinceStart = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    value += Math.floor(daysSinceStart / 30); // Add 1 every month

    // Add some random variation
    value += Math.floor((Math.random() - 0.5) * 2);

    // Business day vs weekend
    if (date.getDay() === 0 || date.getDay() === 6) {
      value = Math.max(1, value - 1); // Slightly lower on weekends
    }

    return {
      timestamp,
      value: Math.max(1, value),
      metadata: {
        dayOfWeek: date.getDay(),
        hourOfDay: date.getHours(),
        isBusinessHour: true,
        isPeakHour: false,
        season: getSeason(date.getMonth())
      }
    };
  });

  const values = historical.map(d => d.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return {
    name: 'distributionLists',
    description: 'Number of active distribution lists',
    unit: 'count',
    current: values[values.length - 1],
    historical,
    baseline: {
      mean: Math.round(mean),
      stdDev: Math.round(stdDev),
      min: Math.min(...values),
      max: Math.max(...values),
      normalRange: [Math.round(mean - stdDev), Math.round(mean + stdDev)]
    },
    seasonality: {
      hasSeasonality: false,
      peakHours: [],
      businessDaysPattern: [0.9, 1.0, 1.0, 1.0, 1.0, 1.0, 0.9],
      monthlyPattern: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
    }
  };
}

// Generate realistic failed deliveries data
function generateFailedDeliveriesData(): MetricDataset {
  const timestamps = generateTimestamps(30);
  const baseValue = 2;

  const historical: TimeSeriesDataPoint[] = timestamps.map(timestamp => {
    const date = new Date(timestamp);
    let value = baseValue;

    // Add random failures (mostly small numbers)
    if (Math.random() < 0.7) {
      value = 0;
    } else if (Math.random() < 0.9) {
      value = Math.floor(Math.random() * 3) + 1;
    } else {
      value = Math.floor(Math.random() * 5) + 3; // Occasional higher failures
    }

    // Slightly higher failures during peak hours due to load
    if ((date.getHours() >= 11 && date.getHours() <= 14) || (date.getHours() >= 16 && date.getHours() <= 17)) {
      if (Math.random() < 0.3) {
        value += 1;
      }
    }

    return {
      timestamp,
      value,
      metadata: {
        dayOfWeek: date.getDay(),
        hourOfDay: date.getHours(),
        isBusinessHour: date.getHours() >= 9 && date.getHours() <= 17,
        isPeakHour: (date.getHours() >= 11 && date.getHours() <= 14) || (date.getHours() >= 16 && date.getHours() <= 17),
        season: getSeason(date.getMonth())
      }
    };
  });

  const values = historical.map(d => d.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return {
    name: 'failedDeliveries',
    description: 'Number of failed email deliveries',
    unit: 'count',
    current: values[values.length - 1],
    historical,
    baseline: {
      mean: Math.round(mean * 10) / 10,
      stdDev: Math.round(stdDev * 10) / 10,
      min: Math.min(...values),
      max: Math.max(...values),
      normalRange: [0, Math.round(mean + stdDev * 2)]
    },
    seasonality: {
      hasSeasonality: false,
      peakHours: [11, 12, 13, 14, 16, 17],
      businessDaysPattern: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
      monthlyPattern: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
    }
  };
}

// Helper function to get season from month
function getSeason(month: number): 'winter' | 'spring' | 'summer' | 'fall' {
  if (month >= 11 || month <= 1) return 'winter';
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  return 'fall';
}

// Fetch time series data from Power BI
async function fetchTimeSeriesFromPowerBI(tableName: string = POWERBI_TABLE_NAME, timestampColumn: string = 'timestamp', valueColumn: string = 'value'): Promise<TimeSeriesDataPoint[]> {
  if (!isAuthenticated() || !POWERBI_DATASET_ID) {
    throw new Error('Power BI not configured or not authenticated');
  }

  const daxQuery = `
    EVALUATE
    SUMMARIZE(
      '${tableName}',
      '${tableName}'[${timestampColumn}],
      "value", SUM('${tableName}'[${valueColumn}])
    )
    ORDER BY '${tableName}'[${timestampColumn}]
  `;

  try {
    const result = await executeQuery(POWERBI_DATASET_ID, daxQuery);
    if (!result.tables || result.tables.length === 0) {
      throw new Error('No data returned from query');
    }

    const table = result.tables[0];
    return table.rows.map((row: Record<string, unknown>) => {
      const timestamp = row[timestampColumn] as string;
      const value = row.value as number;
      const date = new Date(timestamp);

      return {
        timestamp,
        value,
        metadata: {
          dayOfWeek: date.getDay(),
          hourOfDay: date.getHours(),
          isBusinessHour: date.getHours() >= 9 && date.getHours() <= 17,
          isPeakHour: (date.getHours() >= 11 && date.getHours() <= 14) || (date.getHours() >= 16 && date.getHours() <= 17),
          season: getSeason(date.getMonth())
        }
      };
    });
  } catch (error) {
    console.error('Failed to fetch data from Power BI:', error);
    throw error;
  }
}

// Generate additional realistic metrics
function generateUserSessionsData(): MetricDataset {
  const timestamps = generateTimestamps(30);
  const baseValue = 45;

  const historical: TimeSeriesDataPoint[] = timestamps.map(timestamp => {
    const date = new Date(timestamp);
    const value = applySeasonalPattern(baseValue, timestamp, {
      peakHours: [9, 10, 11, 14, 15, 16, 17],
      businessDaysPattern: [0.2, 1.0, 1.0, 1.0, 1.0, 1.0, 0.3],
      monthlyPattern: [0.8, 0.9, 1.0, 1.1, 1.2, 1.1, 1.0, 0.9, 0.8, 0.7, 0.8, 0.9]
    });

    return {
      timestamp,
      value: Math.round(value),
      metadata: {
        dayOfWeek: date.getDay(),
        hourOfDay: date.getHours(),
        isBusinessHour: date.getHours() >= 9 && date.getHours() <= 17,
        isPeakHour: date.getHours() >= 14 && date.getHours() <= 16,
        season: getSeason(date.getMonth())
      }
    };
  });

  const values = historical.map(d => d.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return {
    name: 'userSessions',
    description: 'Number of active user sessions',
    unit: 'count',
    current: values[values.length - 1],
    historical,
    baseline: {
      mean: Math.round(mean),
      stdDev: Math.round(stdDev),
      min: Math.min(...values),
      max: Math.max(...values),
      normalRange: [Math.round(mean - stdDev), Math.round(mean + stdDev)]
    },
    seasonality: {
      hasSeasonality: true,
      peakHours: [9, 10, 11, 14, 15, 16, 17],
      businessDaysPattern: [0.2, 1.0, 1.0, 1.0, 1.0, 1.0, 0.3],
      monthlyPattern: [0.8, 0.9, 1.0, 1.1, 1.2, 1.1, 1.0, 0.9, 0.8, 0.7, 0.8, 0.9]
    }
  };
}

function generateAPIResponseTimeData(): MetricDataset {
  const timestamps = generateTimestamps(30);
  const baseValue = 250; // milliseconds

  const historical: TimeSeriesDataPoint[] = timestamps.map(timestamp => {
    const date = new Date(timestamp);
    let value = baseValue;

    // Add some random variation
    value += (Math.random() - 0.5) * 100;

    // Higher response times during peak hours due to load
    if ((date.getHours() >= 11 && date.getHours() <= 14) || (date.getHours() >= 16 && date.getHours() <= 17)) {
      value *= 1.3;
    }

    // Occasional spikes
    if (Math.random() < 0.02) { // 2% chance of performance issue
      value *= 2.5;
    }

    return {
      timestamp,
      value: Math.round(value),
      metadata: {
        dayOfWeek: date.getDay(),
        hourOfDay: date.getHours(),
        isBusinessHour: date.getHours() >= 9 && date.getHours() <= 17,
        isPeakHour: (date.getHours() >= 11 && date.getHours() <= 14) || (date.getHours() >= 16 && date.getHours() <= 17),
        season: getSeason(date.getMonth())
      }
    };
  });

  const values = historical.map(d => d.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return {
    name: 'apiResponseTime',
    description: 'Average API response time',
    unit: 'ms',
    current: values[values.length - 1],
    historical,
    baseline: {
      mean: Math.round(mean),
      stdDev: Math.round(stdDev),
      min: Math.min(...values),
      max: Math.max(...values),
      normalRange: [Math.round(mean - stdDev), Math.round(mean + stdDev)]
    },
    seasonality: {
      hasSeasonality: true,
      peakHours: [11, 12, 13, 14, 16, 17],
      businessDaysPattern: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
      monthlyPattern: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
    }
  };
}

// Main dataset collection - initialized with generated data, can be updated with real data
export const REAL_DATASETS: Record<string, MetricDataset> = {
  activeReports: generateActiveReportsData(),
  emailsSentToday: generateEmailsSentData(),
  distributionLists: generateDistributionListsData(),
  failedDeliveries: generateFailedDeliveriesData(),
  userSessions: generateUserSessionsData(),
  apiResponseTime: generateAPIResponseTimeData()
};

// Load real data from Power BI if available
export async function loadRealDatasets(): Promise<void> {
  if (!isAuthenticated() || !POWERBI_DATASET_ID) {
    console.log('Power BI not configured, using generated data');
    return;
  }

  try {
    console.log('Loading data from Power BI...');

    // Load data for each metric - assuming tables named after metrics or generic
    const datasets = [
      { key: 'activeReports', table: 'ActiveReports' },
      { key: 'emailsSentToday', table: 'EmailsSent' },
      { key: 'distributionLists', table: 'DistributionLists' },
      { key: 'failedDeliveries', table: 'FailedDeliveries' },
      { key: 'userSessions', table: 'UserSessions' },
      { key: 'apiResponseTime', table: 'APIResponseTime' }
    ];

    for (const { key, table } of datasets) {
      try {
        const data = await fetchTimeSeriesFromPowerBI(table);
        if (data.length > 0) {
          // Create MetricDataset from fetched data
          const values = data.map(d => d.value);
          const mean = values.reduce((a, b) => a + b, 0) / values.length;
          const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
          const stdDev = Math.sqrt(variance);

          REAL_DATASETS[key] = {
            name: key,
            description: `${key} data from Power BI`,
            unit: key.includes('Time') ? 'ms' : 'count',
            current: values[values.length - 1] || 0,
            historical: data,
            baseline: {
              mean: Math.round(mean),
              stdDev: Math.round(stdDev),
              min: Math.min(...values),
              max: Math.max(...values),
              normalRange: [Math.round(mean - stdDev), Math.round(mean + stdDev)]
            },
            seasonality: {
              hasSeasonality: true, // Assume seasonality for now
              peakHours: [9, 10, 11, 14, 15, 16, 17],
              businessDaysPattern: [0.2, 1.0, 1.0, 1.0, 1.0, 1.0, 0.3],
              monthlyPattern: [0.8, 0.9, 1.0, 1.1, 1.2, 1.1, 1.0, 0.9, 0.8, 0.7, 0.8, 0.9]
            }
          };
        }
      } catch (error) {
        console.warn(`Failed to load ${key} from Power BI:`, error);
        // Keep generated data
      }
    }

    console.log('Data loaded from Power BI');
  } catch (error) {
    console.error('Failed to load data from Power BI:', error);
  }
}

// Data persistence and updates
let lastUpdateTime = Date.now();
const UPDATE_INTERVAL = 60000; // 1 minute

// Update datasets with new data points
export function updateDatasetsWithNewData(): void {
  const now = Date.now();
  const timeSinceLastUpdate = now - lastUpdateTime;

  if (timeSinceLastUpdate < UPDATE_INTERVAL) {
    return; // Don't update too frequently
  }

  lastUpdateTime = now;
  const currentTimestamp = new Date().toISOString();

  // Update each dataset with a new data point
  Object.values(REAL_DATASETS).forEach(dataset => {
    const lastValue = dataset.historical[dataset.historical.length - 1]?.value || dataset.current;
    const date = new Date(currentTimestamp);

    // Generate new value based on current patterns
    let newValue = applySeasonalPattern(dataset.baseline.mean, currentTimestamp, dataset.seasonality);

    // Add some realistic variation
    const variation = (Math.random() - 0.5) * dataset.baseline.stdDev * 0.5;
    newValue = Math.max(0, Math.round(newValue + variation));

    // For growing metrics like distribution lists, add slight growth
    if (dataset.name === 'distributionLists') {
      const growthTrend = Math.floor((Date.now() - new Date(dataset.historical[0]?.timestamp || currentTimestamp).getTime()) / (1000 * 60 * 60 * 24 * 30)); // Months since start
      newValue += growthTrend;
    }

    // For failed deliveries, keep it low most of the time
    if (dataset.name === 'failedDeliveries') {
      newValue = Math.random() < 0.8 ? 0 : Math.floor(Math.random() * 5);
    }

    // Add occasional spikes for emails (marketing campaigns)
    if (dataset.name === 'emailsSentToday' && Math.random() < 0.03) {
      newValue = Math.round(newValue * 1.6);
    }

    // Update current value
    dataset.current = newValue;

    // Add new data point to historical data
    const newDataPoint = {
      timestamp: currentTimestamp,
      value: newValue,
      metadata: {
        dayOfWeek: date.getDay(),
        hourOfDay: date.getHours(),
        isBusinessHour: date.getHours() >= 9 && date.getHours() <= 17,
        isPeakHour: (date.getHours() >= 11 && date.getHours() <= 14) || (date.getHours() >= 16 && date.getHours() <= 17),
        season: getSeason(date.getMonth())
      }
    };

    // Keep only last 720 data points (30 days of hourly data)
    dataset.historical.push(newDataPoint);
    if (dataset.historical.length > 720) {
      dataset.historical.shift();
    }

    // Update baseline statistics
    const values = dataset.historical.map(d => d.value);
    dataset.baseline.mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - dataset.baseline.mean, 2), 0) / values.length;
    dataset.baseline.stdDev = Math.sqrt(variance);
    dataset.baseline.min = Math.min(...values);
    dataset.baseline.max = Math.max(...values);
    dataset.baseline.normalRange = [
      Math.round(dataset.baseline.mean - dataset.baseline.stdDev),
      Math.round(dataset.baseline.mean + dataset.baseline.stdDev)
    ];
  });
}

// Auto-update datasets periodically
if (typeof window !== 'undefined') {
  setInterval(updateDatasetsWithNewData, UPDATE_INTERVAL);
}

// Export individual datasets
export { generateActiveReportsData, generateEmailsSentData, generateDistributionListsData, generateFailedDeliveriesData, generateUserSessionsData, generateAPIResponseTimeData };