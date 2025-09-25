import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail,
  FileText,
  Users,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "success" | "error" | "pending" | "info";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  timestamp: string;
}

const activities: ActivityItem[] = [
  {
    id: "1",
    type: "success",
    icon: CheckCircle,
    title: "Weekly Campaign Report Sent",
    description: "Delivered to Marketing Team (12 recipients)",
    timestamp: "2 minutes ago"
  },
  {
    id: "2",
    type: "info",
    icon: FileText,
    title: "Monthly Performance Dashboard Generated",
    description: "PDF export completed successfully",
    timestamp: "15 minutes ago"
  },
  {
    id: "3",
    type: "error",
    icon: XCircle,
    title: "Distribution Failed",
    description: "Sales Report - Email server timeout",
    timestamp: "1 hour ago"
  },
  {
    id: "4",
    type: "pending",
    icon: Clock,
    title: "Scheduled Report Queued",
    description: "Executive Summary - Due in 30 minutes",
    timestamp: "1 hour ago"
  },
  {
    id: "5",
    type: "info",
    icon: Users,
    title: "New Distribution List Created",
    description: "Product Team (8 members added)",
    timestamp: "3 hours ago"
  }
];

export function RecentActivity() {
  return (
    <Card className="h-fit hover:shadow-large transition-all duration-500 border-0 bg-gradient-subtle backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-display font-bold text-foreground flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div 
                key={activity.id} 
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-background/50 transition-all duration-300 group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={cn(
                  "rounded-xl p-2 transition-all duration-300 group-hover:scale-110",
                  activity.type === "success" && "bg-gradient-success text-success-foreground",
                  activity.type === "error" && "bg-destructive/10 text-destructive",
                  activity.type === "pending" && "bg-gradient-warning text-warning-foreground",
                  activity.type === "info" && "bg-primary/10 text-primary"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-2 font-medium">
                    {activity.timestamp}
                  </p>
                </div>
                <Badge 
                  variant={
                    activity.type === "success" ? "default" :
                    activity.type === "error" ? "destructive" :
                    "secondary"
                  }
                  className="transition-all duration-300 group-hover:scale-105"
                >
                  {activity.type}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}