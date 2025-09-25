import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Brain,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Settings,
  Play,
  CheckCircle,
  AlertCircle,
  Loader2,
  Target,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ModelPerformance {
  xgboost: Record<string, { mae: number; rmse: number; r2: number }>;
  prophet: Record<string, { mae: number; rmse: number; r2: number }>;
  ensemble: Record<string, { mae: number; rmse: number; r2: number }>;
}

interface FeatureImportance {
  feature: string;
  importance: number;
}

export function ModelTraining() {
  const [selectedMetric, setSelectedMetric] = useState<string>("clicks");
  const [performance, setPerformance] = useState<ModelPerformance | null>(null);
  const [featureImportance, setFeatureImportance] = useState<FeatureImportance[]>([]);
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainStatus, setRetrainStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();
    loadFeatureImportance();
  }, []);

  useEffect(() => {
    if (selectedMetric) {
      loadFeatureImportance();
    }
  }, [selectedMetric]);

  const loadPerformanceData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/models/performance');
      const data = await response.json();
      setPerformance(data);
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFeatureImportance = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/models/features/${selectedMetric}`);
      const data = await response.json();
      setFeatureImportance(data);
    } catch (error) {
      console.error('Failed to load feature importance:', error);
    }
  };

  const handleRetrain = async () => {
    setIsRetraining(true);
    setRetrainStatus("Starting retraining...");
    
    try {
      const response = await fetch('http://localhost:3001/api/models/retrain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metric: selectedMetric }),
      });
      
      const data = await response.json();
      setRetrainStatus(data.message);
      
      // Simulate retraining progress
      setTimeout(() => {
        setRetrainStatus("Retraining completed successfully!");
        setIsRetraining(false);
        loadPerformanceData(); // Refresh performance data
      }, 3000);
    } catch (error) {
      setRetrainStatus("Retraining failed. Please try again.");
      setIsRetraining(false);
    }
  };

  const getPerformanceColor = (value: number, type: 'r2' | 'mae' | 'rmse') => {
    if (type === 'r2') {
      return value >= 0.8 ? 'text-green-600' : value >= 0.6 ? 'text-yellow-600' : 'text-red-600';
    } else {
      return value <= 0.1 ? 'text-green-600' : value <= 0.2 ? 'text-yellow-600' : 'text-red-600';
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-gray-900/90 dark:via-gray-900/70 dark:to-gray-900/50 backdrop-blur-xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-muted-foreground">Loading model data...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Model Performance */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-gray-900/90 dark:via-gray-900/70 dark:to-gray-900/50 backdrop-blur-xl">
        <CardHeader className="bg-gradient-to-r from-blue-500/5 via-blue-500/10 to-transparent border-b border-blue-500/10">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl">
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
            <span className="text-xl font-display font-bold">Model Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {performance && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* XGBoost Performance */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    XGBoost Model
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(performance.xgboost).map(([metric, metrics]) => (
                      <div key={metric} className="p-3 bg-gradient-to-r from-green-500/5 to-green-500/10 rounded-lg border border-green-500/20">
                        <div className="font-medium capitalize mb-2">{metric}</div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">R²:</span>
                            <span className={cn("font-semibold", getPerformanceColor(metrics.r2, 'r2'))}>
                              {metrics.r2.toFixed(3)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">MAE:</span>
                            <span className={cn("font-semibold", getPerformanceColor(metrics.mae, 'mae'))}>
                              {metrics.mae.toFixed(3)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">RMSE:</span>
                            <span className={cn("font-semibold", getPerformanceColor(metrics.rmse, 'rmse'))}>
                              {metrics.rmse.toFixed(3)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prophet Performance */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    Prophet Model
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(performance.prophet).map(([metric, metrics]) => (
                      <div key={metric} className="p-3 bg-gradient-to-r from-purple-500/5 to-purple-500/10 rounded-lg border border-purple-500/20">
                        <div className="font-medium capitalize mb-2">{metric}</div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">R²:</span>
                            <span className={cn("font-semibold", getPerformanceColor(metrics.r2, 'r2'))}>
                              {metrics.r2.toFixed(3)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">MAE:</span>
                            <span className={cn("font-semibold", getPerformanceColor(metrics.mae, 'mae'))}>
                              {metrics.mae.toFixed(3)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">RMSE:</span>
                            <span className={cn("font-semibold", getPerformanceColor(metrics.rmse, 'rmse'))}>
                              {metrics.rmse.toFixed(3)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ensemble Performance */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-orange-700 dark:text-orange-400 flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    Ensemble Model
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(performance.ensemble).map(([metric, metrics]) => (
                      <div key={metric} className="p-3 bg-gradient-to-r from-orange-500/5 to-orange-500/10 rounded-lg border border-orange-500/20">
                        <div className="font-medium capitalize mb-2">{metric}</div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">R²:</span>
                            <span className={cn("font-semibold", getPerformanceColor(metrics.r2, 'r2'))}>
                              {metrics.r2.toFixed(3)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">MAE:</span>
                            <span className={cn("font-semibold", getPerformanceColor(metrics.mae, 'mae'))}>
                              {metrics.mae.toFixed(3)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">RMSE:</span>
                            <span className={cn("font-semibold", getPerformanceColor(metrics.rmse, 'rmse'))}>
                              {metrics.rmse.toFixed(3)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Importance */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-gray-900/90 dark:via-gray-900/70 dark:to-gray-900/50 backdrop-blur-xl">
        <CardHeader className="bg-gradient-to-r from-green-500/5 via-green-500/10 to-transparent border-b border-green-500/10">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl">
              <Target className="h-5 w-5 text-green-500" />
            </div>
            <span className="text-xl font-display font-bold">Feature Importance</span>
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

            <div className="space-y-3">
              {featureImportance.map((feature, index) => (
                <div key={feature.feature} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{feature.feature}</span>
                    <span className="text-sm text-muted-foreground">{(feature.importance * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={feature.importance * 100} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Retraining */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-gray-900/90 dark:via-gray-900/70 dark:to-gray-900/50 backdrop-blur-xl">
        <CardHeader className="bg-gradient-to-r from-purple-500/5 via-purple-500/10 to-transparent border-b border-purple-500/10">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-xl">
              <RefreshCw className="h-5 w-5 text-purple-500" />
            </div>
            <span className="text-xl font-display font-bold">Model Retraining</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Retrain Model for:</label>
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

            <Button 
              onClick={handleRetrain} 
              disabled={isRetraining}
              className="w-full"
            >
              {isRetraining ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Retraining...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retrain Model
                </>
              )}
            </Button>

            {retrainStatus && (
              <div className={cn(
                "p-4 rounded-lg border",
                retrainStatus.includes("completed") ? "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400" :
                retrainStatus.includes("failed") ? "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400" :
                "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400"
              )}>
                <div className="flex items-center gap-2">
                  {retrainStatus.includes("completed") ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : retrainStatus.includes("failed") ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  <span className="text-sm font-medium">{retrainStatus}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
