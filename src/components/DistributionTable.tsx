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
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
  Plus,
  Loader2
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDistributionLists as getPowerBIDistributionLists, deleteDistributionList as deletePowerBIDistributionList, PowerBIDistributionList } from "@/lib/powerbi";
import { getDistributionLists as getLookerStudioDistributionLists, deleteDistributionList as deleteLookerStudioDistributionList, LookerStudioDistributionList } from "@/lib/looker-studio";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { DistributionListModal } from "./DistributionListModal";

type BIProvider = 'powerbi' | 'lookerstudio';

interface GenericDistributionList {
  id: string;
  name: string;
  description: string;
  recipients: string[];
  status: 'active' | 'inactive';
  lastUsed: string;
  reports: string[];
}

interface DistributionTableProps {
  provider?: BIProvider;
}

export function DistributionTable({ provider = 'powerbi' }: DistributionTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<GenericDistributionList | null>(null);

  // Provider-specific functions
  const getDistributionListsFn = provider === 'powerbi' ? getPowerBIDistributionLists : getLookerStudioDistributionLists;
  const deleteDistributionListFn = provider === 'powerbi' ? deletePowerBIDistributionList : deleteLookerStudioDistributionList;

  const { data: lists, isLoading, error } = useQuery({
    queryKey: [`${provider}-lists`],
    queryFn: getDistributionListsFn,
    refetchInterval: 60000, // Refresh every minute
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDistributionListFn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${provider}-lists`] });
      toast({
        title: "List Deleted",
        description: "Distribution list has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete distribution list.",
        variant: "destructive",
      });
    },
  });

  const handleAddList = () => {
    setEditingList(null);
    setIsModalOpen(true);
  };

  const handleEdit = (list: GenericDistributionList) => {
    setEditingList(list);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this distribution list?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-900/80 dark:to-gray-900/60 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-success/5 to-transparent">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-xl animate-pulse">
              <Users className="h-6 w-6 text-success" />
            </div>
            <span className="text-xl font-display font-bold">Distribution Lists</span>
          </CardTitle>
          <Button size="sm" className="gap-2 opacity-50 cursor-not-allowed" disabled>
            <Plus className="h-4 w-4" />
            Add List
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gradient-to-r from-muted/50 to-muted/30 animate-pulse rounded-xl border border-muted/20"></div>
            ))}
          </div>
        </CardContent>
  
        <DistributionListModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          provider={provider}
          list={editingList as PowerBIDistributionList | LookerStudioDistributionList}
        />
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Distribution Lists
          </CardTitle>
          <Button size="sm" className="gap-2" onClick={handleAddList}>
            <Plus className="h-4 w-4" />
            Add List
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to load distribution lists</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="border-0 shadow-2xl bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-gray-900/90 dark:via-gray-900/70 dark:to-gray-900/50 backdrop-blur-xl hover:shadow-3xl transition-all duration-500 group">
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-success/5 via-success/10 to-transparent border-b border-success/10">
        <CardTitle className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-success/20 to-success/10 rounded-2xl shadow-lg shadow-success/20 group-hover:scale-110 transition-transform duration-300">
            <Users className="h-7 w-7 text-success" />
          </div>
          <div>
            <span className="text-2xl font-display font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Distribution Lists</span>
            <p className="text-sm text-muted-foreground font-medium">Manage email recipient groups</p>
          </div>
        </CardTitle>
        <Button
          size="lg"
          className="gap-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
          onClick={handleAddList}
        >
          <Plus className="h-5 w-5" />
          Add List
        </Button>
      </CardHeader>
      <CardContent className="p-8">
        <div className="rounded-2xl border border-muted/20 overflow-hidden bg-gradient-to-br from-muted/5 to-muted/10">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-muted/20 to-muted/10 hover:from-muted/30 hover:to-muted/20 transition-colors duration-300">
                <TableHead className="font-semibold text-foreground py-4">Name</TableHead>
                <TableHead className="font-semibold text-foreground">Description</TableHead>
                <TableHead className="font-semibold text-foreground">Recipients</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="font-semibold text-foreground">Last Used</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lists?.map((list, index) => (
                <TableRow
                  key={list.id}
                  className="hover:bg-gradient-to-r hover:from-success/5 hover:to-transparent transition-all duration-300 group/row animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <TableCell className="font-semibold text-foreground py-4 group-hover/row:text-success transition-colors duration-300">
                    {list.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-medium max-w-xs truncate">
                    {list.description}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{list.recipients.length}</span>
                      </div>
                      <span>recipients</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={list.status === "active" ? "default" : "secondary"}
                      className="font-semibold shadow-sm"
                    >
                      {list.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-medium">
                    {list.lastUsed}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-primary/10 hover:scale-110 transition-all duration-300 rounded-xl"
                        onClick={() => handleEdit(list)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-destructive/10 hover:scale-110 transition-all duration-300 rounded-xl text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(list.id)}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" className="hover:bg-muted hover:scale-110 transition-all duration-300 rounded-xl">
                        <MoreHorizontal className="h-4 w-4" />
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