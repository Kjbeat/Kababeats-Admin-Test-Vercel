import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { User, UserFilters, UserDetails } from '@/types';
import { toast } from 'sonner';

export function useUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Fetching users with filters:', filters);
      }
      try {
        const result = await apiService.getUsers(filters);
        if (process.env.NODE_ENV === 'development') {
          console.log('Users API response:', result);
        }
        return result;
      } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => apiService.getUser(id),
    enabled: !!id,
  });
}

export function useUserDetails(id: string) {
  return useQuery({
    queryKey: ['userDetails', id],
    queryFn: () => apiService.getUserDetails(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      apiService.updateUser(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      toast.success('User updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update user');
    },
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      apiService.suspendUser(id, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      toast.success('User suspended successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to suspend user');
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiService.activateUser(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables] });
      toast.success('User activated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to activate user');
    },
  });
}

export function useImpersonateUser() {
  return useMutation({
    mutationFn: (id: string) => apiService.impersonateUser(id),
    onSuccess: (data) => {
      toast.success('Impersonation token generated');
      // Handle impersonation token (e.g., redirect to main app)
      console.log('Impersonation token:', data.impersonationToken);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to generate impersonation token');
    },
  });
}
