import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  createDistributionList as createPowerBIDistributionList,
  updateDistributionList as updatePowerBIDistributionList,
  PowerBIDistributionList
} from "@/lib/powerbi";
import {
  createDistributionList as createLookerStudioDistributionList,
  updateDistributionList as updateLookerStudioDistributionList,
  LookerStudioDistributionList
} from "@/lib/looker-studio";
import { X } from "lucide-react";

type BIProvider = 'powerbi' | 'lookerstudio';

interface DistributionListModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: BIProvider;
  list?: PowerBIDistributionList | LookerStudioDistributionList;
}

interface DistributionListFormData {
  name: string;
  description: string;
  recipients: string[];
  status: 'active' | 'inactive';
}

export function DistributionListModal({ isOpen, onClose, provider, list }: DistributionListModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<DistributionListFormData>({
    name: '',
    description: '',
    recipients: [],
    status: 'active'
  });
  const [newRecipient, setNewRecipient] = useState('');

  // Reset form when modal opens/closes or list changes
  useEffect(() => {
    if (isOpen) {
      if (list) {
        // Editing existing list
        setFormData({
          name: list.name,
          description: list.description,
          recipients: [...list.recipients],
          status: list.status
        });
      } else {
        // Creating new list
        setFormData({
          name: '',
          description: '',
          recipients: [],
          status: 'active'
        });
      }
      setNewRecipient('');
    }
  }, [isOpen, list]);

  const createMutation = useMutation({
    mutationFn: (data: DistributionListFormData) => {
      const listData = {
        name: data.name,
        description: data.description,
        recipients: data.recipients,
        status: data.status,
        lastUsed: 'Never',
        reports: [] // Will be populated when schedules are created
      };

      return provider === 'powerbi'
        ? createPowerBIDistributionList(listData)
        : createLookerStudioDistributionList(listData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${provider}-lists`] });
      toast({
        title: "List Created",
        description: "Distribution list has been created successfully.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Creation Failed",
        description: "Failed to create distribution list.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DistributionListFormData> }) => {
      return provider === 'powerbi'
        ? updatePowerBIDistributionList(id, data)
        : updateLookerStudioDistributionList(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${provider}-lists`] });
      toast({
        title: "List Updated",
        description: "Distribution list has been updated successfully.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update distribution list.",
        variant: "destructive",
      });
    },
  });

  const handleAddRecipient = () => {
    if (newRecipient && !formData.recipients.includes(newRecipient)) {
      setFormData(prev => ({
        ...prev,
        recipients: [...prev.recipients, newRecipient]
      }));
      setNewRecipient('');
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== email)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.recipients.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please provide a name and at least one recipient.",
        variant: "destructive",
      });
      return;
    }

    if (list) {
      updateMutation.mutate({ id: list.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddRecipient();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {list ? 'Edit Distribution List' : 'Create New Distribution List'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">List Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter list name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter description (optional)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Recipients</Label>
            <div className="flex gap-2">
              <Input
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter email address"
                type="email"
              />
              <Button type="button" onClick={handleAddRecipient} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.recipients.map((email) => (
                <Badge key={email} variant="secondary" className="flex items-center gap-1">
                  {email}
                  <button
                    type="button"
                    onClick={() => handleRemoveRecipient(email)}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    aria-label={`Remove ${email}`}
                    title={`Remove ${email}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (list ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}