import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Beat, BeatFilters } from '@/types';
import { toast } from 'sonner';

export function useBeats(filters: BeatFilters = {}) {
  return useQuery({
    queryKey: ['beats', filters],
    queryFn: async () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Fetching beats with filters:', filters);
      }
      try {
        const result = await apiService.getBeats(filters);
        if (process.env.NODE_ENV === 'development') {
          console.log('Beats API response:', result);
        }
        return result;
      } catch (error) {
        console.error('Error fetching beats:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useBeat(id: string) {
  return useQuery({
    queryKey: ['beat', id],
    queryFn: async () => {
      try {
        const result = await apiService.getBeat(id);
        return result;
      } catch (error) {
        console.error('Error fetching beat:', error);
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useApproveBeat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      return await apiService.approveBeat(id, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beats'] });
      toast.success('Beat approved successfully');
    },
    onError: (error: any) => {
      console.error('Error approving beat:', error);
      toast.error(error.response?.data?.message || 'Failed to approve beat');
    },
  });
}

export function useRejectBeat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return await apiService.rejectBeat(id, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beats'] });
      toast.success('Beat rejected successfully');
    },
    onError: (error: any) => {
      console.error('Error rejecting beat:', error);
      toast.error(error.response?.data?.message || 'Failed to reject beat');
    },
  });
}

export function useDeleteBeat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return await apiService.deleteBeat(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beats'] });
      toast.success('Beat deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting beat:', error);
      toast.error(error.response?.data?.message || 'Failed to delete beat');
    },
  });
}
