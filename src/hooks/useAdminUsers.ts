import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { AdminUser, AdminRole, AdminPermission } from '@/types';
import { toast } from 'sonner';

interface AdminUserFilters {
  search: string;
  role: string;
  status: string;
  page: number;
  limit: number;
}

export function useAdminUsers(filters: AdminUserFilters = {
  search: '',
  role: 'all',
  status: 'all',
  page: 1,
  limit: 10
}) {
  return useQuery({
    queryKey: ['adminUsers', filters],
    queryFn: async () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Fetching admin users with filters:', filters);
      }
      try {
        // Map frontend parameters to backend parameters
        const backendParams = {
          search: filters.search,
          role: filters.role === 'all' ? undefined : filters.role,
          isActive: filters.status === 'all' ? undefined : (filters.status === 'active'),
          page: filters.page,
          limit: filters.limit
        };
        
        console.log('Backend parameters:', backendParams);
        
        const result = await apiService.getAdmins(backendParams);
        if (process.env.NODE_ENV === 'development') {
          console.log('Admin users API response:', result);
          console.log('Admin users data:', result?.data);
          console.log('Admin users data length:', result?.data?.length);
        }
        return result;
      } catch (error) {
        console.error('Error fetching admin users:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: ['adminUser', id],
    queryFn: () => apiService.getAdmin(id),
    enabled: !!id,
  });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiService.createAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('Admin user created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create admin user');
    },
  });
}

export function useUpdateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminUser> }) =>
      apiService.updateAdmin(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('Admin user updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update admin user');
    },
  });
}

export function useDeleteAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiService.deleteAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('Admin user deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete admin user');
    },
  });
}

export function useChangeAdminPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      apiService.changeAdminPassword(id, newPassword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('Password changed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to change password');
    },
  });
}
