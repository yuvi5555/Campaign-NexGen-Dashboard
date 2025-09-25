import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  Users,
  Mail,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getMetrics } from "@/lib/powerbi";
import { REAL_DATASETS } from "@/lib/real-datasets";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  status?: "success" | "warning" | "error";
}

function MetricCard({ title, value, change, trend, icon: Icon, status }: MetricCardProps) {
  return (
    <Card className="relative group hover:shadow-2xl transition-all duration-700 hover:transform hover:scale-105 hover:-translate-y-2 border-0 bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-gray-900/80 dark:via-gray-900/60 dark:to-gray-900/40 backdrop-blur-xl overflow-hidden shadow-xl">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-success/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse"></div>

      {/* Floating particles effect */}
      <div className="absolute top-4 right-4 w-2 h-2 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-8 right-8 w-1 h-1 bg-success/40 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-warning/30 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
        <CardTitle className="text-sm font-semibold text-muted-foreground tracking-wide group-hover:text-foreground transition-colors duration-300">
          {title}
        </CardTitle>
        <div className={cn(
          "p-3 rounded-2xl transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 shadow-lg",
          status === "success" && "bg-gradient-to-br from-success/20 to-success/10 text-success shadow-success/20",
          status === "warning" && "bg-gradient-to-br from-warning/20 to-warning/10 text-warning shadow-warning/20",
          status === "error" && "bg-gradient-to-br from-destructive/20 to-destructive/10 text-destructive shadow-destructive/20",
          !status && "bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-primary/20"
        )}>
          <Icon className="h-6 w-6 drop-shadow-sm" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-4xl font-bold text-foreground font-display mb-3 group-hover:text-primary transition-colors duration-500 drop-shadow-sm">
          {value}
        </div>
        <p className={cn(
          "text-sm flex items-center gap-2 font-semibold transition-all duration-300",
          trend === "up" && "text-success group-hover:scale-105",
          trend === "down" && "text-destructive group-hover:scale-105",
          trend === "neutral" && "text-muted-foreground"
        )}>
          {trend === "up" && <TrendingUp className="h-4 w-4 animate-pulse" />}
          <span className="drop-shadow-sm">{change}</span>
        </p>
      </CardContent>

      {/* Bottom accent line */}
      <div className={cn(
        "absolute bottom-0 left-0 h-1 bg-gradient-to-r transition-all duration-500 group-hover:h-2",
        status === "success" && "from-success/50 to-success",
        status === "warning" && "from-warning/50 to-warning",
        status === "error" && "from-destructive/50 to-destructive",
        !status && "from-primary/50 to-primary"
      )} style={{ width: '100%' }}></div>
    </Card>
  );
}

export function DashboardCards() {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      // Use real datasets for current values
      return {
        activeReports: REAL_DATASETS.activeReports.current,
        distributionLists: REAL_DATASETS.distributionLists.current,
        emailsSentToday: REAL_DATASETS.emailsSentToday.current,
        failedDeliveries: REAL_DATASETS.failedDeliveries.current
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fade-in-up">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="relative group hover:shadow-large transition-all duration-500 hover:transform hover:scale-105 border-0 bg-gradient-subtle backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <div className="h-4 bg-muted animate-pulse rounded"></div>
              <div className="h-8 w-8 bg-muted animate-pulse rounded-xl"></div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="h-8 bg-muted animate-pulse rounded mb-2"></div>
              <div className="h-4 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fade-in-up">
        <Card className="col-span-full border-destructive/20 bg-destructive/5">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-destructive font-medium">Failed to load dashboard metrics</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fade-in-up">
      <MetricCard
        title="Active Reports"
        value={metrics?.activeReports.toString() || "0"}
        change="+12% from last month"
        trend="up"
        icon={CheckCircle}
        status="success"
      />
      <MetricCard
        title="Distribution Lists"
        value={metrics?.distributionLists.toString() || "0"}
        change="+2 new this week"
        trend="up"
        icon={Users}
      />
      <MetricCard
        title="Emails Sent Today"
        value={metrics?.emailsSentToday.toString() || "0"}
        change="+23% from yesterday"
        trend="up"
        icon={Mail}
        status="success"
      />
      <MetricCard
        title="Failed Deliveries"
        value={metrics?.failedDeliveries.toString() || "0"}
        change="2 pending retry"
        trend={metrics?.failedDeliveries === 0 ? "neutral" : "down"}
        icon={AlertCircle}
        status={metrics?.failedDeliveries === 0 ? undefined : "warning"}
      />
    </div>
  );
}