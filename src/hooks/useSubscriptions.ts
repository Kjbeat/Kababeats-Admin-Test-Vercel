import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionApiService } from '@/services/subscriptionApi';
import { SubscriptionPlan, CreateSubscriptionPlanRequest, UpdateSubscriptionPlanRequest } from '@/types/subscription';
import { useToast } from '@/components/ui/use-toast';

// Query keys
export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  lists: () => [...subscriptionKeys.all, 'list'] as const,
  list: (filters: string) => [...subscriptionKeys.lists(), { filters }] as const,
  details: () => [...subscriptionKeys.all, 'detail'] as const,
  detail: (id: string) => [...subscriptionKeys.details(), id] as const,
};

// Get all subscription plans
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: subscriptionKeys.lists(),
    queryFn: () => subscriptionApiService.getSubscriptionPlans(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get single subscription plan
export function useSubscriptionPlan(id: string) {
  return useQuery({
    queryKey: subscriptionKeys.detail(id),
    queryFn: () => subscriptionApiService.getSubscriptionPlan(id),
    enabled: !!id,
  });
}

// Create subscription plan
export function useCreateSubscriptionPlan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateSubscriptionPlanRequest) => 
      subscriptionApiService.createSubscriptionPlan(data),
    onSuccess: (newPlan) => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() });
      toast({
        title: 'Plan created',
        description: `${newPlan.name} has been created successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create plan: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

// Update subscription plan
export function useUpdateSubscriptionPlan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubscriptionPlanRequest }) => 
      subscriptionApiService.updateSubscriptionPlan(id, data),
    onSuccess: (updatedPlan) => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.detail(updatedPlan._id) });
      toast({
        title: 'Plan updated',
        description: `${updatedPlan.name} has been updated successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update plan: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

// Delete subscription plan
export function useDeleteSubscriptionPlan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => subscriptionApiService.deleteSubscriptionPlan(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() });
      toast({
        title: 'Plan deleted',
        description: 'Subscription plan has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete plan: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

// Toggle subscription plan active status
export function useToggleSubscriptionPlan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      subscriptionApiService.toggleSubscriptionPlan(id, isActive),
    onSuccess: (updatedPlan) => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.detail(updatedPlan._id) });
      toast({
        title: 'Plan updated',
        description: `${updatedPlan.name} has been ${updatedPlan.isActive ? 'activated' : 'deactivated'}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update plan status: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}
