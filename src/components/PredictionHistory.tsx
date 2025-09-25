import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  History,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PredictionRecord {
  id: string;
  timestamp: string;
  metric: string;
  predicted: number;
  actual: number;
  confidence: number;
  model: string;
  accuracy: number;
  error: number;
}

interface AccuracyMetrics {
  overall: number;
  byModel: Record<string, number>;
  byMetric: Record<string, number>;
  trend: 'up' | 'down' | 'stable';
}

export function PredictionHistory() {
  const [selectedMetric, setSelectedMetric] = useState<string>("all");
  const [selectedModel, setSelectedModel] = useState<string>("all");
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);
  const [accuracyMetrics, setAccuracyMetrics] = useState<AccuracyMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPredictionHistory();
  }, []);

  const loadPredictionHistory = async () => {
    setIsLoading(true);
    try {
      // Mock data - in a real app, this would come from an API
      const mockPredictions: PredictionRecord[] = [
        {
          id: "1",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          metric: "Clicks",
          predicted: 1250,
          actual: 1180,
          confidence: 0.85,
          model: "XGBoost",
          accuracy: 0.94,
          error: 0.06
        },
        {
          id: "2",
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          metric: "Impressions",
          predicted: 45000,
          actual: 43200,
          confidence: 0.78,
          model: "Prophet",
          accuracy: 0.96,
          error: 0.04
        },
        {
          id: "3",
          timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
          metric: "ROI",
          predicted: 2.4,
          actual: 2.1,
          confidence: 0.92,
          model: "Ensemble",
          accuracy: 0.88,
          error: 0.12
        },
        {
          id: "4",
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          metric: "Clicks",
          predicted: 980,
          actual: 1050,
          confidence: 0.73,
          model: "XGBoost",
          accuracy: 0.93,
          error: 0.07
        },
        {
          id: "5",
          timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
          metric: "Impressions",
          predicted: 38000,
          actual: 39500,
          confidence: 0.81,
          model: "Prophet",
          accuracy: 0.96,
          error: 0.04
        }
      ];

      setPredictions(mockPredictions);

      // Calculate accuracy metrics
      const overallAccuracy = mockPredictions.reduce((sum, p) => sum + p.accuracy, 0) / mockPredictions.length;
      
      const byModel: Record<string, number> = {};
      const byMetric: Record<string, number> = {};
      
      mockPredictions.forEach(p => {
        byModel[p.model] = (byModel[p.model] || 0) + p.accuracy;
        byMetric[p.metric] = (byMetric[p.metric] || 0) + p.accuracy;
      });

      Object.keys(byModel).forEach(model => {
        byModel[model] /= mockPredictions.filter(p => p.model === model).length;
      });

      Object.keys(byMetric).forEach(metric => {
        byMetric[metric] /= mockPredictions.filter(p => p.metric === metric).length;
      });

      setAccuracyMetrics({
        overall: overallAccuracy,
        byModel,
        byMetric,
        trend: 'up'
      });
    } catch (error) {
      console.error('Failed to load prediction history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPredictions = predictions.filter(p => {
    const metricMatch = selectedMetric === "all" || p.metric.toLowerCase() === selectedMetric.toLowerCase();
    const modelMatch = selectedModel === "all" || p.model === selectedModel;
    return metricMatch && modelMatch;
  });

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.9) return 'text-green-600';
    if (accuracy >= 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getErrorColor = (error: number) => {
    if (error <= 0.05) return 'text-green-600';
    if (error <= 0.1) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-gray-900/90 dark:via-gray-900/70 dark:to-gray-900/50 backdrop-blur-xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span className="text-muted-foreground">Loading prediction history...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Accuracy Overview */}
      {accuracyMetrics && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-gray-900/90 dark:via-gray-900/70 dark:to-gray-900/50 backdrop-blur-xl">
          <CardHeader className="bg-gradient-to-r from-green-500/5 via-green-500/10 to-transparent border-b border-green-500/10">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <span className="text-xl font-display font-bold">Prediction Accuracy</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {(accuracyMetrics.overall * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Overall Accuracy</div>
                <div className="mt-2">
                  <Progress value={accuracyMetrics.overall * 100} className="h-2" />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">By Model</h4>
                {Object.entries(accuracyMetrics.byModel).map(([model, accuracy]) => (
                  <div key={model} className="flex justify-between items-center">
                    <span className="text-sm">{model}</span>
                    <span className={cn("text-sm font-semibold", getAccuracyColor(accuracy))}>
                      {(accuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">By Metric</h4>
                {Object.entries(accuracyMetrics.byMetric).map(([metric, accuracy]) => (
                  <div key={metric} className="flex justify-between items-center">
                    <span className="text-sm">{metric}</span>
                    <span className={cn("text-sm font-semibold", getAccuracyColor(accuracy))}>
                      {(accuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {accuracyMetrics.trend === 'up' ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : accuracyMetrics.trend === 'down' ? (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  ) : (
                    <BarChart3 className="h-5 w-5 text-gray-600" />
                  )}
                  <span className="text-sm font-semibold capitalize">{accuracyMetrics.trend}</span>
                </div>
                <div className="text-sm text-muted-foreground">Trend</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prediction History */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-gray-900/90 dark:via-gray-900/70 dark:to-gray-900/50 backdrop-blur-xl">
        <CardHeader className="bg-gradient-to-r from-blue-500/5 via-blue-500/10 to-transparent border-b border-blue-500/10">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl">
              <History className="h-5 w-5 text-blue-500" />
            </div>
            <span className="text-xl font-display font-bold">Prediction History</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Metrics</SelectItem>
                  <SelectItem value="clicks">Clicks</SelectItem>
                  <SelectItem value="impressions">Impressions</SelectItem>
                  <SelectItem value="roi">ROI</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Models</SelectItem>
                  <SelectItem value="XGBoost">XGBoost</SelectItem>
                  <SelectItem value="Prophet">Prophet</SelectItem>
                  <SelectItem value="Ensemble">Ensemble</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {filteredPredictions.map((prediction) => (
                <div key={prediction.id} className="p-4 bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl border border-muted/20">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {new Date(prediction.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-center">
                      <Badge variant="outline" className="text-xs">
                        {prediction.metric}
                      </Badge>
                    </div>

                    <div className="text-center">
                      <Badge variant="secondary" className="text-xs">
                        {prediction.model}
                      </Badge>
                    </div>

                    <div className="text-center">
                      <div className="text-sm font-semibold">{prediction.predicted.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Predicted</div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm font-semibold">{prediction.actual.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Actual</div>
                    </div>

                    <div className="text-center">
                      <div className={cn("text-sm font-semibold", getAccuracyColor(prediction.accuracy))}>
                        {(prediction.accuracy * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Accuracy</div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Confidence</span>
                        <span className="font-medium">{(prediction.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={prediction.confidence * 100} className="h-1" />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Error Rate</span>
                        <span className={cn("font-medium", getErrorColor(prediction.error))}>
                          {(prediction.error * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={prediction.error * 100} className="h-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredPredictions.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No predictions found for the selected filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
