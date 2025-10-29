import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { apiService } from '@/services/api';

interface BulkOperationResult {
  success: string[];
  failed: string[];
  errors: Record<string, string>;
}

export function useBulkBeatOperations() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedBeats, setSelectedBeats] = useState<string[]>([]);
  const { toast } = useToast();

  // Select/deselect beats
  const toggleBeatSelection = useCallback((beatId: string) => {
    setSelectedBeats(prev => 
      prev.includes(beatId) 
        ? prev.filter(id => id !== beatId)
        : [...prev, beatId]
    );
  }, []);

  const selectAllBeats = useCallback((beatIds: string[]) => {
    setSelectedBeats(beatIds);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedBeats([]);
  }, []);

  // Bulk approve beats
  const bulkApprove = useCallback(async (notes?: string): Promise<BulkOperationResult> => {
    if (selectedBeats.length === 0) return { success: [], failed: [], errors: {} };

    setIsProcessing(true);
    const result: BulkOperationResult = { success: [], failed: [], errors: {} };

    try {
      const promises = selectedBeats.map(async (beatId) => {
        try {
          await apiService.post(`/beats/${beatId}/approve`, { notes });
          result.success.push(beatId);
        } catch (error) {
          result.failed.push(beatId);
          result.errors[beatId] = error instanceof Error ? error.message : 'Unknown error';
        }
      });

      await Promise.allSettled(promises);

      toast({
        title: "Bulk Approval Complete",
        description: `${result.success.length} beats approved, ${result.failed.length} failed`,
        variant: result.failed.length > 0 ? "destructive" : "default"
      });

      return result;
    } finally {
      setIsProcessing(false);
    }
  }, [selectedBeats, toast]);

  // Bulk reject beats
  const bulkReject = useCallback(async (reason: string): Promise<BulkOperationResult> => {
    if (selectedBeats.length === 0) return { success: [], failed: [], errors: {} };

    setIsProcessing(true);
    const result: BulkOperationResult = { success: [], failed: [], errors: {} };

    try {
      const promises = selectedBeats.map(async (beatId) => {
        try {
          await apiService.post(`/beats/${beatId}/reject`, { reason });
          result.success.push(beatId);
        } catch (error) {
          result.failed.push(beatId);
          result.errors[beatId] = error instanceof Error ? error.message : 'Unknown error';
        }
      });

      await Promise.allSettled(promises);

      toast({
        title: "Bulk Rejection Complete",
        description: `${result.success.length} beats rejected, ${result.failed.length} failed`,
        variant: result.failed.length > 0 ? "destructive" : "default"
      });

      return result;
    } finally {
      setIsProcessing(false);
    }
  }, [selectedBeats, toast]);

  // Bulk delete beats
  const bulkDelete = useCallback(async (): Promise<BulkOperationResult> => {
    if (selectedBeats.length === 0) return { success: [], failed: [], errors: {} };

    setIsProcessing(true);
    const result: BulkOperationResult = { success: [], failed: [], errors: {} };

    try {
      const promises = selectedBeats.map(async (beatId) => {
        try {
          await apiService.delete(`/beats/${beatId}`);
          result.success.push(beatId);
        } catch (error) {
          result.failed.push(beatId);
          result.errors[beatId] = error instanceof Error ? error.message : 'Unknown error';
        }
      });

      await Promise.allSettled(promises);

      toast({
        title: "Bulk Deletion Complete",
        description: `${result.success.length} beats deleted, ${result.failed.length} failed`,
        variant: result.failed.length > 0 ? "destructive" : "default"
      });

      return result;
    } finally {
      setIsProcessing(false);
    }
  }, [selectedBeats, toast]);

  // Bulk status update
  const bulkUpdateStatus = useCallback(async (status: 'draft' | 'published' | 'scheduled' | 'archived'): Promise<BulkOperationResult> => {
    if (selectedBeats.length === 0) return { success: [], failed: [], errors: {} };

    setIsProcessing(true);
    const result: BulkOperationResult = { success: [], failed: [], errors: {} };

    try {
      const promises = selectedBeats.map(async (beatId) => {
        try {
          await apiService.put(`/beats/${beatId}/status`, { status });
          result.success.push(beatId);
        } catch (error) {
          result.failed.push(beatId);
          result.errors[beatId] = error instanceof Error ? error.message : 'Unknown error';
        }
      });

      await Promise.allSettled(promises);

      toast({
        title: "Bulk Status Update Complete",
        description: `${result.success.length} beats updated, ${result.failed.length} failed`,
        variant: result.failed.length > 0 ? "destructive" : "default"
      });

      return result;
    } finally {
      setIsProcessing(false);
    }
  }, [selectedBeats, toast]);

  return {
    // State
    isProcessing,
    selectedBeats,
    
    // Selection actions
    toggleBeatSelection,
    selectAllBeats,
    clearSelection,
    
    // Bulk operations
    bulkApprove,
    bulkReject,
    bulkDelete,
    bulkUpdateStatus
  };
}
