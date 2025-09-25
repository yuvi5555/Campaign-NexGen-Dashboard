import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Cpu,
  BarChart3,
  TrendingUp,
  Calendar,
  Clock,
  Target,
  Zap,
  Layers,
  Activity,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureInfo {
  name: string;
  type: 'temporal' | 'lag' | 'rolling' | 'categorical' | 'derived';
  importance: number;
  description: string;
  example: string;
}

interface FeatureEngineeringData {
  temporal: FeatureInfo[];
  lag: FeatureInfo[];
  rolling: FeatureInfo[];
  categorical: FeatureInfo[];
  derived: FeatureInfo[];
}

export function FeatureEngineering() {
  const [selectedMetric, setSelectedMetric] = useState<string>("clicks");
  const [featureData, setFeatureData] = useState<FeatureEngineeringData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeatureData();
  }, [selectedMetric]);

  const loadFeatureData = async () => {
    setIsLoading(true);
    try {
      // Mock feature engineering data
      const mockData: FeatureEngineeringData = {
        temporal: [
          {
            name: 'day_of_week',
            type: 'temporal',
            importance: 0.25,
            description: 'Day of the week (0-6)',
            example: 'Monday = 0, Sunday = 6'
          },
          {
            name: 'month',
            type: 'temporal',
            importance: 0.15,
            description: 'Month of the year (1-12)',
            example: 'January = 1, December = 12'
          },
          {
            name: 'quarter',
            type: 'temporal',
            importance: 0.12,
            description: 'Quarter of the year (1-4)',
            example: 'Q1 = 1, Q4 = 4'
          },
          {
            name: 'is_month_start',
            type: 'temporal',
            importance: 0.08,
            description: 'Binary flag for month start',
            example: '1 if first day of month, 0 otherwise'
          }
        ],
        lag: [
          {
            name: `${selectedMetric}_lag_1`,
            type: 'lag',
            importance: 0.30,
            description: 'Previous day value',
            example: 'Yesterday\'s clicks'
          },
          {
            name: `${selectedMetric}_lag_7`,
            type: 'lag',
            importance: 0.20,
            description: 'Value from 7 days ago',
            example: 'Same day last week'
          },
          {
            name: `${selectedMetric}_lag_14`,
            type: 'lag',
            importance: 0.15,
            description: 'Value from 14 days ago',
            example: 'Two weeks ago'
          },
          {
            name: `${selectedMetric}_lag_30`,
            type: 'lag',
            importance: 0.10,
            description: 'Value from 30 days ago',
            example: 'One month ago'
          }
        ],
        rolling: [
          {
            name: `${selectedMetric}_roll_mean_7`,
            type: 'rolling',
            importance: 0.22,
            description: '7-day rolling average',
            example: 'Average of last 7 days'
          },
          {
            name: `${selectedMetric}_roll_mean_14`,
            type: 'rolling',
            importance: 0.18,
            description: '14-day rolling average',
            example: 'Average of last 14 days'
          },
          {
            name: `${selectedMetric}_roll_mean_30`,
            type: 'rolling',
            importance: 0.14,
            description: '30-day rolling average',
            example: 'Average of last 30 days'
          },
          {
            name: `${selectedMetric}_roll_std_7`,
            type: 'rolling',
            importance: 0.12,
            description: '7-day rolling standard deviation',
            example: 'Volatility over last 7 days'
          }
        ],
        categorical: [
          {
            name: 'Channel_Used_freq',
            type: 'categorical',
            importance: 0.20,
            description: 'Frequency encoding of channel',
            example: 'How often this channel is used'
          },
          {
            name: 'Target_Audience_freq',
            type: 'categorical',
            importance: 0.15,
            description: 'Frequency encoding of audience',
            example: 'How often this audience is targeted'
          },
          {
            name: 'Campaign_Type_freq',
            type: 'categorical',
            importance: 0.12,
            description: 'Frequency encoding of campaign type',
            example: 'How often this campaign type is used'
          }
        ],
        derived: [
          {
            name: 'CTR',
            type: 'derived',
            importance: 0.18,
            description: 'Click-through rate (Clicks/Impressions)',
            example: 'Percentage of impressions that resulted in clicks'
          },
          {
            name: 'CPC',
            type: 'derived',
            importance: 0.16,
            description: 'Cost per click (Acquisition_Cost/Clicks)',
            example: 'Average cost for each click'
          },
          {
            name: 'ROAS',
            type: 'derived',
            importance: 0.14,
            description: 'Return on ad spend (ROI/Acquisition_Cost)',
            example: 'Revenue generated per dollar spent'
          }
        ]
      };

      setFeatureData(mockData);
    } catch (error) {
      console.error('Failed to load feature data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFeatureTypeColor = (type: string) => {
    switch (type) {
      case 'temporal': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'lag': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'rolling': return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
      case 'categorical': return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
      case 'derived': return 'bg-pink-500/10 text-pink-700 border-pink-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getFeatureTypeIcon = (type: string) => {
    switch (type) {
      case 'temporal': return <Calendar className="h-4 w-4" />;
      case 'lag': return <Clock className="h-4 w-4" />;
      case 'rolling': return <TrendingUp className="h-4 w-4" />;
      case 'categorical': return <Layers className="h-4 w-4" />;
      case 'derived': return <Zap className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-gray-900/90 dark:via-gray-900/70 dark:to-gray-900/50 backdrop-blur-xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span className="text-muted-foreground">Loading feature data...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Feature Overview */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-gray-900/90 dark:via-gray-900/70 dark:to-gray-900/50 backdrop-blur-xl">
        <CardHeader className="bg-gradient-to-r from-indigo-500/5 via-indigo-500/10 to-transparent border-b border-indigo-500/10">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-indigo-500/10 rounded-xl">
              <Cpu className="h-5 w-5 text-indigo-500" />
            </div>
            <span className="text-xl font-display font-bold">Feature Engineering</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Select Metric:</label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clicks">Clicks</SelectItem>
                  <SelectItem value="impressions">Impressions</SelectItem>
                  <SelectItem value="roi">ROI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {featureData && Object.entries(featureData).map(([category, features]) => (
                <div key={category} className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">{features.length}</div>
                  <div className="text-sm text-muted-foreground capitalize">{category} Features</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Categories */}
      {featureData && Object.entries(featureData).map(([category, features]) => (
        <Card key={category} className="border-0 shadow-xl bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-gray-900/90 dark:via-gray-900/70 dark:to-gray-900/50 backdrop-blur-xl">
          <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-transparent border-b border-primary/10">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                {getFeatureTypeIcon(features[0]?.type || 'temporal')}
              </div>
              <span className="text-xl font-display font-bold capitalize">{category} Features</span>
              <Badge variant="outline" className="ml-auto">
                {features.length} features
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl border border-muted/20">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className={cn("text-xs", getFeatureTypeColor(feature.type))}>
                        {getFeatureTypeIcon(feature.type)}
                        {feature.type}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-primary">
                        {(feature.importance * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Importance</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">{feature.name}</h4>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                    <div className="text-xs text-muted-foreground italic">
                      Example: {feature.example}
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Feature Importance</span>
                      <span className="font-medium">{(feature.importance * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={feature.importance * 100} className="h-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Feature Engineering Process */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-gray-900/90 dark:via-gray-900/70 dark:to-gray-900/50 backdrop-blur-xl">
        <CardHeader className="bg-gradient-to-r from-green-500/5 via-green-500/10 to-transparent border-b border-green-500/10">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl">
              <BarChart3 className="h-5 w-5 text-green-500" />
            </div>
            <span className="text-xl font-display font-bold">Feature Engineering Process</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="h-6 w-6 text-blue-500" />
                </div>
                <h4 className="font-semibold mb-2">1. Temporal Features</h4>
                <p className="text-xs text-muted-foreground">
                  Extract time-based features like day of week, month, quarter
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-green-500" />
                </div>
                <h4 className="font-semibold mb-2">2. Lag Features</h4>
                <p className="text-xs text-muted-foreground">
                  Create lagged versions of target variables for time series patterns
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-purple-500" />
                </div>
                <h4 className="font-semibold mb-2">3. Rolling Features</h4>
                <p className="text-xs text-muted-foreground">
                  Calculate rolling statistics like means and standard deviations
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="h-6 w-6 text-orange-500" />
                </div>
                <h4 className="font-semibold mb-2">4. Derived Features</h4>
                <p className="text-xs text-muted-foreground">
                  Create business metrics like CTR, CPC, and ROAS
                </p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl border border-muted/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Feature Selection Process
              </h4>
              <p className="text-sm text-muted-foreground">
                Features are automatically selected based on their importance scores calculated using XGBoost's built-in feature importance. 
                Features with importance scores above 0.05 (5%) are included in the final model. 
                This ensures only the most predictive features are used, reducing overfitting and improving model performance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
