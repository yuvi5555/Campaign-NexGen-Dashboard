import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Clock,
  Play,
  Pause,
  Settings,
  Loader2
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSchedules as getPowerBISchedules, updateScheduleStatus as updatePowerBIScheduleStatus, deleteSchedule as deletePowerBISchedule, PowerBISchedule } from "@/lib/powerbi";
import { getSchedules as getLookerStudioSchedules, updateScheduleStatus as updateLookerStudioScheduleStatus, deleteSchedule as deleteLookerStudioSchedule, LookerStudioSchedule } from "@/lib/looker-studio";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ScheduleModal } from "./ScheduleModal";

type BIProvider = 'powerbi' | 'lookerstudio';

interface GenericSchedule {
  id: string;
  name: string;
  frequency: string;
  nextRun: string;
  status: 'active' | 'paused' | 'error';
  distributionList: string;
  format: string;
  reportId: string;
}

interface ReportScheduleProps {
  provider?: BIProvider;
}

export function ReportSchedule({ provider = 'powerbi' }: ReportScheduleProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<GenericSchedule | null>(null);

  // Provider-specific functions
  const getSchedulesFn = provider === 'powerbi' ? getPowerBISchedules : getLookerStudioSchedules;
  const updateScheduleStatusFn = provider === 'powerbi' ? updatePowerBIScheduleStatus : updateLookerStudioScheduleStatus;
  const deleteScheduleFn = provider === 'powerbi' ? deletePowerBISchedule : deleteLookerStudioSchedule;

  const { data: schedules, isLoading, error } = useQuery({
    queryKey: [`${provider}-schedules`],
    queryFn: getSchedulesFn,
    refetchInterval: 60000, // Refresh every minute
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'paused' }) =>
      updateScheduleStatusFn(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${provider}-schedules`] });
      toast({
        title: "Schedule Updated",
        description: "Schedule status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update schedule status.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setUpdatingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteScheduleFn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${provider}-schedules`] });
      toast({
        title: "Schedule Deleted",
        description: "Schedule has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete schedule.",
        variant: "destructive",
      });
    },
  });

  const handleStatusToggle = (schedule: GenericSchedule) => {
    const newStatus = schedule.status === 'active' ? 'paused' : 'active';
    setUpdatingId(schedule.id);
    updateStatusMutation.mutate({ id: schedule.id, status: newStatus });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleNewSchedule = () => {
    setEditingSchedule(null);
    setIsModalOpen(true);
  };

  const handleEdit = (schedule: GenericSchedule) => {
    setEditingSchedule(schedule);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-900/80 dark:to-gray-900/60 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl animate-pulse">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-display font-bold">Scheduled Reports</span>
          </CardTitle>
          <Button size="sm" className="gap-2 opacity-50 cursor-not-allowed" disabled>
            <Clock className="h-4 w-4" />
            New Schedule
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gradient-to-r from-muted/50 to-muted/30 animate-pulse rounded-xl border border-muted/20"></div>
            ))}
          </div>
        </CardContent>
  
        <ScheduleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          provider={provider}
          schedule={editingSchedule as PowerBISchedule | LookerStudioSchedule}
        />
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Scheduled Reports
          </CardTitle>
          <Button size="sm" className="gap-2" onClick={handleNewSchedule}>
            <Clock className="h-4 w-4" />
            New Schedule
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to load schedules</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="border-0 shadow-2xl bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-gray-900/90 dark:via-gray-900/70 dark:to-gray-900/50 backdrop-blur-xl hover:shadow-3xl transition-all duration-500 group">
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/5 via-primary/10 to-transparent border-b border-primary/10">
        <CardTitle className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
            <Calendar className="h-7 w-7 text-primary" />
          </div>
          <div>
            <span className="text-2xl font-display font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Scheduled Reports</span>
            <p className="text-sm text-muted-foreground font-medium">Automated report delivery schedules</p>
          </div>
        </CardTitle>
        <Button
          size="lg"
          className="gap-3 bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success hover:shadow-xl hover:shadow-success/30 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
          onClick={handleNewSchedule}
        >
          <Clock className="h-5 w-5" />
          New Schedule
        </Button>
      </CardHeader>
      <CardContent className="p-8">
        <div className="rounded-2xl border border-muted/20 overflow-hidden bg-gradient-to-br from-muted/5 to-muted/10">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-muted/20 to-muted/10 hover:from-muted/30 hover:to-muted/20 transition-colors duration-300">
                <TableHead className="font-semibold text-foreground py-4">Report Name</TableHead>
                <TableHead className="font-semibold text-foreground">Frequency</TableHead>
                <TableHead className="font-semibold text-foreground">Next Run</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="font-semibold text-foreground">Distribution</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules?.map((schedule, index) => (
                <TableRow
                  key={schedule.id}
                  className="hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-300 group/row animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <TableCell className="font-semibold text-foreground py-4 group-hover/row:text-primary transition-colors duration-300">
                    {schedule.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-medium">
                    {schedule.frequency}
                  </TableCell>
                  <TableCell className="font-medium">{schedule.nextRun}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        schedule.status === "active" ? "default" :
                        schedule.status === "paused" ? "secondary" :
                        "destructive"
                      }
                      className="font-semibold shadow-sm"
                    >
                      {schedule.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-medium">
                    {schedule.distributionList}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-primary/10 hover:scale-110 transition-all duration-300 rounded-xl"
                        onClick={() => handleStatusToggle(schedule)}
                        disabled={updatingId === schedule.id}
                      >
                        {updatingId === schedule.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : schedule.status === "active" ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-destructive/10 hover:scale-110 transition-all duration-300 rounded-xl text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(schedule.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}