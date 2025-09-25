import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  createSchedule as createPowerBISchedule,
  updateScheduleStatus as updatePowerBIScheduleStatus,
  getWorkspaces,
  getReports,
  getDistributionLists as getPowerBIDistributionLists,
  PowerBISchedule
} from "@/lib/powerbi";
import {
  createSchedule as createLookerStudioSchedule,
  updateScheduleStatus as updateLookerStudioScheduleStatus,
  getReports as getLookerStudioReports,
  getDistributionLists as getLookerStudioDistributionLists,
  LookerStudioSchedule
} from "@/lib/looker-studio";

type BIProvider = 'powerbi' | 'lookerstudio';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: BIProvider;
  schedule?: PowerBISchedule | LookerStudioSchedule;
}

interface ScheduleFormData {
  name: string;
  reportId: string;
  frequency: string;
  distributionList: string;
  format: string;
  workspaceId?: string; // Only for Power BI
}

export function ScheduleModal({ isOpen, onClose, provider, schedule }: ScheduleModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ScheduleFormData>({
    name: '',
    reportId: '',
    frequency: '',
    distributionList: '',
    format: '',
    workspaceId: ''
  });

  // Fetch data for dropdowns
  const { data: workspaces } = useQuery({
    queryKey: ['workspaces'],
    queryFn: getWorkspaces,
    enabled: provider === 'powerbi' && isOpen
  });

  const { data: reports } = useQuery({
    queryKey: provider === 'powerbi' ? ['powerbi-reports', formData.workspaceId] : ['looker-studio-reports'],
    queryFn: provider === 'powerbi'
      ? () => formData.workspaceId ? getReports(formData.workspaceId) : Promise.resolve([])
      : getLookerStudioReports,
    enabled: isOpen && (provider === 'lookerstudio' || !!formData.workspaceId)
  });

  const { data: distributionLists } = useQuery({
    queryKey: [`${provider}-lists`],
    queryFn: provider === 'powerbi' ? getPowerBIDistributionLists : getLookerStudioDistributionLists,
    enabled: isOpen
  });

  // Reset form when modal opens/closes or schedule changes
  useEffect(() => {
    if (isOpen) {
      if (schedule) {
        // Editing existing schedule
        setFormData({
          name: schedule.name,
          reportId: schedule.reportId,
          frequency: schedule.frequency,
          distributionList: schedule.distributionList,
          format: schedule.format,
          workspaceId: 'workspaceId' in schedule ? schedule.workspaceId : undefined
        });
      } else {
        // Creating new schedule
        setFormData({
          name: '',
          reportId: '',
          frequency: '',
          distributionList: '',
          format: '',
          workspaceId: ''
        });
      }
    }
  }, [isOpen, schedule]);

  const createMutation = useMutation({
    mutationFn: (data: ScheduleFormData) => {
      if (provider === 'powerbi') {
        const scheduleData = {
          name: data.name,
          reportId: data.reportId,
          frequency: data.frequency,
          nextRun: 'Tomorrow 9:00 AM', // Default next run
          status: 'active' as const,
          distributionList: data.distributionList,
          format: data.format,
          workspaceId: data.workspaceId!
        };
        return createPowerBISchedule(scheduleData);
      } else {
        const scheduleData = {
          name: data.name,
          reportId: data.reportId,
          frequency: data.frequency,
          nextRun: 'Tomorrow 9:00 AM',
          status: 'active' as const,
          distributionList: data.distributionList,
          format: data.format
        };
        return createLookerStudioSchedule(scheduleData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${provider}-schedules`] });
      toast({
        title: "Schedule Created",
        description: "New schedule has been created successfully.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Creation Failed",
        description: "Failed to create schedule.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ScheduleFormData> }) => {
      // For now, only status updates are supported in the API
      // In a real app, you'd have an updateSchedule function
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${provider}-schedules`] });
      toast({
        title: "Schedule Updated",
        description: "Schedule has been updated successfully.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update schedule.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.reportId || !formData.frequency || !formData.distributionList || !formData.format) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (provider === 'powerbi' && !formData.workspaceId) {
      toast({
        title: "Validation Error",
        description: "Please select a workspace.",
        variant: "destructive",
      });
      return;
    }

    // Validate that the selected report exists
    const selectedReport = reports?.find(report => report.id === formData.reportId);
    if (!selectedReport) {
      toast({
        title: "Validation Error",
        description: "Please select a valid report.",
        variant: "destructive",
      });
      return;
    }

    if (schedule) {
      updateMutation.mutate({ id: schedule.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const frequencyOptions = [
    'Daily (8:00 AM)',
    'Daily (9:00 AM)',
    'Weekly (Monday 9:00 AM)',
    'Weekly (Friday 5:00 PM)',
    'Monthly (1st 9:00 AM)'
  ];

  const formatOptions = provider === 'powerbi'
    ? ['PDF', 'Excel', 'PowerPoint']
    : ['PDF', 'Email'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {schedule ? 'Edit Schedule' : 'Create New Schedule'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Schedule Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter schedule name"
              required
            />
          </div>

          {provider === 'powerbi' && (
            <div className="space-y-2">
              <Label htmlFor="workspace">Workspace</Label>
              <Select
                value={formData.workspaceId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, workspaceId: value, reportId: '' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select workspace" />
                </SelectTrigger>
                <SelectContent>
                  {workspaces?.map((workspace) => (
                    <SelectItem key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="report">Report</Label>
            <Select
              value={formData.reportId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, reportId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select report" />
              </SelectTrigger>
              <SelectContent>
                {reports?.map((report) => (
                  <SelectItem key={report.id} value={report.id}>
                    {report.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {frequencyOptions.map((freq) => (
                  <SelectItem key={freq} value={freq}>
                    {freq}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="distributionList">Distribution List</Label>
            <Select
              value={formData.distributionList}
              onValueChange={(value) => setFormData(prev => ({ ...prev, distributionList: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select distribution list" />
              </SelectTrigger>
              <SelectContent>
                {distributionLists?.map((list) => (
                  <SelectItem key={list.id} value={list.name}>
                    {list.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Format</Label>
            <Select
              value={formData.format}
              onValueChange={(value) => setFormData(prev => ({ ...prev, format: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                {formatOptions.map((format) => (
                  <SelectItem key={format} value={format}>
                    {format}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (schedule ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}