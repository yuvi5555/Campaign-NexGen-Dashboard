import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo, useState } from "react";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  Activity,
  Zap,
  BarChart3,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles,
  Shield,
  Loader2,
  Play,
  RefreshCw,
  Settings,
  LineChart,
  PieChart,
  Target as TargetIcon
} from "lucide-react";
import { performMLAnalytics, MLAnalyticsData, PredictiveMetrics, AnomalyAlert, TrendAnalysis, SmartRecommendation } from "@/lib/ml-analytics";
import { getMetrics } from "@/lib/powerbi";
import { REAL_DATASETS } from "@/lib/real-datasets";
import { cn } from "@/lib/utils";

function PredictiveCard({ metric, prediction }: { metric: string; prediction: PredictiveMetrics }) {
  const getTrendIcon = () => {
    switch (prediction.trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-success" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-destructive" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (prediction.trend) {
      case 'up': return 'text-success bg-success/10';
      case 'down': return 'text-destructive bg-destructive/10';
      default: return 'text-muted-foreground bg-muted/50';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">{metric}</span>
          </div>
          <Badge variant="outline" className={cn("text-xs", getTrendColor())}>
            {getTrendIcon()}
            {prediction.trend}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current:</span>
            <span className="font-semibold">{prediction.current.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Predicted (1h):</span>
            <span className="font-semibold text-primary">{prediction.nextHourPrediction.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Change:</span>
            <span className={cn(
              "font-semibold",
              prediction.changePercent > 0 ? "text-success" : prediction.changePercent < 0 ? "text-destructive" : "text-muted-foreground"
            )}>
              {prediction.changePercent > 0 ? '+' : ''}{prediction.changePercent.toFixed(1)}%
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Confidence:</span>
              <span className="font-medium">{(prediction.confidence * 100).toFixed(0)}%</span>
            </div>
            <Progress value={prediction.confidence * 100} className="h-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// New Campaign Prediction Interface
function CampaignPredictionForm() {
  const [formData, setFormData] = useState({
    company: "TechCorp",
    campaign_type: "Email",
    channel: "Social",
    target_audience: "Young Professionals",
    location: "Global",
    language: "English",
    customer_segment: "Premium",
    metric: "Clicks"
  });
  const [prediction, setPrediction] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const handlePredict = async () => {
    setIsPredicting(true);
    try {
      const response = await fetch('http://localhost:3001/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.statusText} - ${errorData.details || errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      setPrediction(data);
    } catch (error) {
      console.error('Prediction error:', error);
      setPrediction({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-gray-900/90 dark:via-gray-900/70 dark:to-gray-900/50 backdrop-blur-xl">
      <CardHeader className="bg-gradient-to-r from-purple-500/5 via-purple-500/10 to-transparent border-b border-purple-500/10">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-xl">
            <TargetIcon className="h-5 w-5 text-purple-500" />
          </div>
          <span className="text-xl font-display font-bold">Campaign Prediction</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Company</label>
            <Input
              value={formData.company}
              onChange={(e) => setFormData({...formData, company: e.target.value})}
              placeholder="Company name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Campaign Type</label>
            <Select value={formData.campaign_type} onValueChange={(value) => setFormData({...formData, campaign_type: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="Social">Social</SelectItem>
                <SelectItem value="Search">Search</SelectItem>
                <SelectItem value="Display">Display</SelectItem>
                <SelectItem value="Affiliate">Affiliate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Channel</label>
            <Input
              value={formData.channel}
              onChange={(e) => setFormData({...formData, channel: e.target.value})}
              placeholder="Marketing channel"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Audience</label>
            <Input
              value={formData.target_audience}
              onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
              placeholder="Target audience"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="Geographic location"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Language</label>
            <Input
              value={formData.language}
              onChange={(e) => setFormData({...formData, language: e.target.value})}
              placeholder="Language"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Customer Segment</label>
            <Input
              value={formData.customer_segment}
              onChange={(e) => setFormData({...formData, customer_segment: e.target.value})}
              placeholder="Customer segment"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Metric to Predict</label>
            <Select value={formData.metric} onValueChange={(value) => setFormData({...formData, metric: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Clicks">Clicks</SelectItem>
                <SelectItem value="Impressions">Impressions</SelectItem>
                <SelectItem value="ROI">ROI</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button onClick={handlePredict} disabled={isPredicting} className="w-full">
          {isPredicting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Predicting...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Generate Prediction
            </>
          )}
        </Button>

        {prediction && (
          <div className="mt-6 p-4 bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl border border-muted/20">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              {prediction.error ? 'Prediction Error' : 'Prediction Results'}
            </h4>
            
            {prediction.error ? (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Error occurred during prediction</span>
                </div>
                <p className="text-sm text-red-600 dark:text-red-300 mt-2">{prediction.error}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Please check that the backend server is running and try again.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Current Value:</span>
                    <span className="font-semibold">{prediction.current?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Predicted Value:</span>
                    <span className="font-semibold text-primary">{prediction.prediction?.toFixed(0) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Confidence:</span>
                    <span className="font-semibold">{(prediction.confidence * 100)?.toFixed(1) || 0}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">XGBoost Prediction:</span>
                    <span className="font-semibold">{prediction.xgb_prediction?.toFixed(0) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Prophet Prediction:</span>
                    <span className="font-semibold">{prediction.prophet_prediction?.toFixed(0) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Models Used:</span>
                    <span className="font-semibold">{prediction.models_used || 0}</span>
                  </div>
                </div>
              </div>
            )}
            
            {prediction.confidence && !prediction.error && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Model Confidence</span>
                  <span className="font-medium">{(prediction.confidence * 100).toFixed(1)}%</span>
                </div>
                <Progress value={prediction.confidence * 100} className="h-2" />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Model Comparison Component
function ModelComparison({ predictions }: { predictions: Record<string, PredictiveMetrics> }) {
  const [selectedMetric, setSelectedMetric] = useState<string>(Object.keys(predictions)[0] || '');

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-gray-900/90 dark:via-gray-900/70 dark:to-gray-900/50 backdrop-blur-xl">
      <CardHeader className="bg-gradient-to-r from-blue-500/5 via-blue-500/10 to-transparent border-b border-blue-500/10">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl">
            <PieChart className="h-5 w-5 text-blue-500" />
          </div>
          <span className="text-xl font-display font-bold">Model Comparison</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Select Metric:</label>
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(predictions).map(metric => (
                  <SelectItem key={metric} value={metric}>{metric}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedMetric && predictions[selectedMetric] && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl border border-green-500/20">
                <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">XGBoost Model</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prediction:</span>
                    <span className="font-semibold">{predictions[selectedMetric].predicted.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confidence:</span>
                    <span className="font-semibold">{(predictions[selectedMetric].confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl border border-purple-500/20">
                <h4 className="font-semibold text-purple-700 dark:text-purple-400 mb-2">Prophet Model</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prediction:</span>
                    <span className="font-semibold">{predictions[selectedMetric].nextDayPrediction.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trend:</span>
                    <span className="font-semibold capitalize">{predictions[selectedMetric].trend}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-xl border border-orange-500/20">
                <h4 className="font-semibold text-orange-700 dark:text-orange-400 mb-2">Ensemble</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Final Prediction:</span>
                    <span className="font-semibold">{predictions[selectedMetric].nextHourPrediction.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Change:</span>
                    <span className={cn(
                      "font-semibold",
                      predictions[selectedMetric].changePercent > 0 ? "text-green-600" : 
                      predictions[selectedMetric].changePercent < 0 ? "text-red-600" : "text-muted-foreground"
                    )}>
                      {predictions[selectedMetric].changePercent > 0 ? '+' : ''}{predictions[selectedMetric].changePercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AnomalyCard({ anomaly }: { anomaly: AnomalyAlert }) {
  const getSeverityColor = () => {
    switch (anomaly.severity) {
      case 'critical': return 'bg-destructive/10 border-destructive/20 text-destructive';
      case 'high': return 'bg-warning/10 border-warning/20 text-warning';
      case 'medium': return 'bg-orange-500/10 border-orange-500/20 text-orange-500';
      default: return 'bg-muted/50 border-muted text-muted-foreground';
    }
  };

  const getSeverityIcon = () => {
    switch (anomaly.severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Activity className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <Card className={cn("border-l-4", getSeverityColor())}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {getSeverityIcon()}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">{anomaly.metric}</h4>
              <Badge variant="outline" className="text-xs capitalize">
                {anomaly.severity}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{anomaly.description}</p>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Deviation: {anomaly.deviation.toFixed(1)}σ</span>
              <span>{new Date(anomaly.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TrendCard({ trend }: { trend: TrendAnalysis }) {
  const getTrendIcon = () => {
    switch (trend.trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-destructive" />;
      case 'volatile': return <Activity className="h-4 w-4 text-warning" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (trend.trend) {
      case 'increasing': return 'text-success bg-success/10';
      case 'decreasing': return 'text-destructive bg-destructive/10';
      case 'volatile': return 'text-warning bg-warning/10';
      default: return 'text-muted-foreground bg-muted/50';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">{trend.metric}</span>
          </div>
          <Badge variant="outline" className={cn("text-xs capitalize", getTrendColor())}>
            {getTrendIcon()}
            {trend.trend}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Strength:</span>
            <span className="font-semibold">{(trend.strength * 100).toFixed(0)}%</span>
          </div>
          <Progress value={trend.strength * 100} className="h-1" />

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">R²:</span>
            <span className="font-semibold">{trend.r2.toFixed(3)}</span>
          </div>

          {trend.seasonality && (
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Seasonal
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function RecommendationCard({ recommendation }: { recommendation: SmartRecommendation }) {
  const getPriorityColor = () => {
    switch (recommendation.priority) {
      case 'high': return 'bg-destructive/10 border-destructive/20 text-destructive';
      case 'medium': return 'bg-warning/10 border-warning/20 text-warning';
      default: return 'bg-muted/50 border-muted text-muted-foreground';
    }
  };

  const getImpactIcon = () => {
    switch (recommendation.impact) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'negative': return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTypeIcon = () => {
    switch (recommendation.type) {
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'insight': return <Lightbulb className="h-4 w-4" />;
      case 'optimization': return <Target className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  return (
    <Card className={cn("border-l-4", getPriorityColor())}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {getTypeIcon()}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">{recommendation.title}</h4>
              <div className="flex items-center gap-2">
                {getImpactIcon()}
                <Badge variant="outline" className="text-xs capitalize">
                  {recommendation.priority}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{recommendation.description}</p>

            {recommendation.actions.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Recommended Actions:</p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {recommendation.actions.slice(0, 2).map((action, index) => (
                    <li key={index} className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-current rounded-full"></div>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Confidence: {(recommendation.confidence * 100).toFixed(0)}%</span>
              <Progress value={recommendation.confidence * 100} className="w-16 h-1" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MLInsights() {
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  const handleQuery = async () => {
    if (!query.trim()) return;

    setIsQuerying(true);
    try {
      const response = await fetch('http://localhost:3001/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Query API Error: ${response.statusText} - ${errorData.details || errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      setQueryResult(data?.result ?? data ?? 'No result');
    } catch (error) {
      console.error('Query error:', error);
      setQueryResult({
        error: error instanceof Error ? error.message : 'Error executing query',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsQuerying(false);
    }
  };

  // Get current metrics for ML analysis
  const { data: currentMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['powerbi-metrics'],
    queryFn: getMetrics,
    refetchInterval: 30000,
  });

  // Generate historical data for analysis (simulated)
  const generateHistoricalData = (current: Record<string, number>) => {
    const historical: Record<string, number[]> = {};
    Object.keys(current).forEach(key => {
      // Generate 24 hours of historical data
      historical[key] = Array.from({ length: 24 }, () =>
        current[key] * (0.7 + Math.random() * 0.6) // ±30% variation
      );
    });
    return historical;
  };

  // Perform ML analytics using real datasets
  const { data: mlData, isLoading: mlLoading, error } = useQuery({
    queryKey: ['ml-analytics'],
    queryFn: async (): Promise<MLAnalyticsData> => {
      // Use real current values from datasets
      const metricsRecord: Record<string, number> = {
        activeReports: REAL_DATASETS.activeReports.current,
        distributionLists: REAL_DATASETS.distributionLists.current,
        emailsSentToday: REAL_DATASETS.emailsSentToday.current,
        failedDeliveries: REAL_DATASETS.failedDeliveries.current,
        userSessions: REAL_DATASETS.userSessions.current,
        apiResponseTime: REAL_DATASETS.apiResponseTime.current
      };

      return performMLAnalytics(metricsRecord);
    },
    refetchInterval: 60000, // Refresh every minute
  });

  if (metricsLoading || mlLoading) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-gray-900/90 dark:via-gray-900/70 dark:to-gray-900/50 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/5 via-primary/10 to-transparent border-b border-primary/10">
          <CardTitle className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl shadow-lg shadow-primary/20 animate-pulse">
              <Brain className="h-7 w-7 text-primary" />
            </div>
            <div>
              <span className="text-2xl font-display font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">AI Insights</span>
              <p className="text-sm text-muted-foreground font-medium">Machine Learning Analytics</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-muted-foreground">Analyzing data with AI...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !mlData) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-gray-900/90 dark:via-gray-900/70 dark:to-gray-900/50 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/5 via-primary/10 to-transparent border-b border-primary/10">
          <CardTitle className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl shadow-lg shadow-primary/20">
              <Brain className="h-7 w-7 text-primary" />
            </div>
            <span className="text-2xl font-display font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">AI Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Unable to load AI insights</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Campaign Prediction Form */}
      <CampaignPredictionForm />

      {/* AI Insights Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-gray-900/90 dark:via-gray-900/70 dark:to-gray-900/50 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/5 via-primary/10 to-transparent border-b border-primary/10">
          <CardTitle className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
              <Brain className="h-7 w-7 text-primary" />
            </div>
            <div>
              <span className="text-2xl font-display font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">AI Insights</span>
              <p className="text-sm text-muted-foreground font-medium">Machine Learning Analytics & Predictions</p>
            </div>
          </CardTitle>
          <Badge className="bg-gradient-to-r from-primary to-success text-white">
            <Sparkles className="h-3 w-3 mr-1" />
            Live Analysis
          </Badge>
        </CardHeader>
        <CardContent className="p-8">
          {/* AI Insights Summary */}
          <div className="grid gap-4 mb-8">
            {mlData.insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl border border-muted/20">
                <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Query */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-gray-900/90 dark:via-gray-900/70 dark:to-gray-900/50 backdrop-blur-xl">
        <CardHeader className="bg-gradient-to-r from-blue-500/5 via-blue-500/10 to-transparent border-b border-blue-500/10">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl">
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
            <span className="text-xl font-display font-bold">Data Query</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ask a question about the marketing data..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
                className="flex-1"
              />
              <Button onClick={handleQuery} disabled={isQuerying}>
                {isQuerying ? 'Querying...' : 'Query'}
              </Button>
            </div>
            {queryResult && (
              <div className="p-4 bg-muted rounded-lg">
                {queryResult.error ? (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Query Error</span>
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-2">{queryResult.error}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Please check your query syntax and try again.
                    </p>
                  </div>
                ) : Array.isArray(queryResult) ? (
                  <div className="overflow-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr>
                          {Object.keys(queryResult[0] ?? {}).map((col) => (
                            <th key={col} className="text-left px-2 py-1 font-medium text-muted-foreground">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResult.slice(0, 50).map((row: any, idx: number) => (
                          <tr key={idx} className="border-t border-border">
                            {Object.keys(queryResult[0] ?? {}).map((col) => (
                              <td key={col} className="px-2 py-1">{String(row[col])}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <pre className="text-sm whitespace-pre-wrap">{typeof queryResult === 'string' ? queryResult : JSON.stringify(queryResult, null, 2)}</pre>
                )}
              </div>
            )}
            <div className="flex justify-end">
              <Button variant="secondary" onClick={async () => {
                const sections: any[] = [];
                if (mlData) {
                  sections.push({
                    heading: 'Summary Insights',
                    items: mlData.insights.map((text) => ({ label: '-', value: text }))
                  });
                  if (Object.keys(mlData.predictions).length) {
                    const rows = Object.entries(mlData.predictions).map(([metric, p]) => ({
                      metric,
                      current: p.current,
                      nextHour: p.nextHourPrediction,
                      changePercent: p.changePercent,
                      confidence: p.confidence,
                    }));
                    sections.push({
                      heading: 'Predictions',
                      table: {
                        columns: [
                          { header: 'Metric', accessor: 'metric' },
                          { header: 'Current', accessor: 'current' },
                          { header: 'Next Hour', accessor: 'nextHour' },
                          { header: 'Change %', accessor: 'changePercent' },
                          { header: 'Confidence', accessor: 'confidence' },
                        ],
                        rows
                      }
                    });
                  }
                }
                if (Array.isArray(queryResult) && queryResult.length) {
                  sections.push({
                    heading: 'Query Result (Sample)',
                    table: {
                      columns: Object.keys(queryResult[0]).map((c) => ({ header: c, accessor: c })),
                      rows: queryResult.slice(0, 50)
                    }
                  });
                }

                const res = await fetch('http://localhost:3001/api/export/pdf', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ title: 'AI Insights Report', sections })
                });
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'ai-insights-report.pdf';
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              }}>Export PDF</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predictive Analytics */}
      {Object.keys(mlData.predictions).length > 0 && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-gray-900/90 dark:via-gray-900/70 dark:to-gray-900/50 backdrop-blur-xl">
          <CardHeader className="bg-gradient-to-r from-success/5 via-success/10 to-transparent border-b border-success/10">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-success/20 to-success/10 rounded-xl">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <span className="text-xl font-display font-bold">Predictive Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(mlData.predictions).map(([metric, prediction]) => (
                <PredictiveCard key={metric} metric={metric} prediction={prediction} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model Comparison */}
      {Object.keys(mlData.predictions).length > 0 && (
        <ModelComparison predictions={mlData.predictions} />
      )}

      {/* Anomalies */}
      {mlData.anomalies.length > 0 && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-gray-900/90 dark:via-gray-900/70 dark:to-gray-900/50 backdrop-blur-xl">
          <CardHeader className="bg-gradient-to-r from-warning/5 via-warning/10 to-transparent border-b border-warning/10">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-warning/20 to-warning/10 rounded-xl">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <span className="text-xl font-display font-bold">Anomaly Detection</span>
              <Badge variant="destructive" className="ml-auto">
                {mlData.anomalies.length} alerts
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {mlData.anomalies.map((anomaly) => (
                <AnomalyCard key={anomaly.id} anomaly={anomaly} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trend Analysis */}
      {mlData.trends.length > 0 && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-gray-900/90 dark:via-gray-900/70 dark:to-gray-900/50 backdrop-blur-xl">
          <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-transparent border-b border-primary/10">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-display font-bold">Trend Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mlData.trends.map((trend) => (
                <TrendCard key={trend.metric} trend={trend} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Smart Recommendations */}
      {mlData.recommendations.length > 0 && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-gray-900/90 dark:via-gray-900/70 dark:to-gray-900/50 backdrop-blur-xl">
          <CardHeader className="bg-gradient-to-r from-success/5 via-success/10 to-transparent border-b border-success/10">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-success/20 to-success/10 rounded-xl">
                <Lightbulb className="h-5 w-5 text-success" />
              </div>
              <span className="text-xl font-display font-bold">Smart Recommendations</span>
              <Badge className="ml-auto bg-gradient-to-r from-success to-success/80">
                {mlData.recommendations.length} insights
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {mlData.recommendations.slice(0, 5).map((recommendation) => (
                <RecommendationCard key={recommendation.id} recommendation={recommendation} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}