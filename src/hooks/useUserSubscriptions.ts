import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';

export interface UserSubscriptionInfo {
  userId: string;
  planName: string;
  planCode: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  billingCycle?: 'monthly' | 'yearly';
}

export function useUserSubscriptions(userIds: string[]) {
  return useQuery({
    queryKey: ['userSubscriptions', userIds],
    queryFn: async () => {
      if (userIds.length === 0) return {};
      
      try {
        // Use the new batch endpoint
        const subscriptionData = await apiService.getBatchUserSubscriptions(userIds);
        return subscriptionData || {};
      } catch (error) {
        console.error('Error fetching user subscriptions:', error);
        return {};
      }
    },
    enabled: userIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useUserSubscription(userId: string) {
  return useQuery({
    queryKey: ['userSubscription', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      try {
        const userDetails = await apiService.getUserDetails(userId);
        
        if (userDetails?.userSubscription && userDetails?.subscriptions) {
          const userSub = userDetails.userSubscription;
          const allPlans = userDetails.subscriptions;
          
          // Find the plan details
          const plan = allPlans.find((p: any) => 
            p._id.toString() === userSub.planId?.toString()
          );
          
          if (plan) {
            return {
              userId,
              planName: plan.name || 'Unknown Plan',
              planCode: plan.code || 'UNKNOWN',
              status: userSub.status === 'ACTIVE' ? 'active' : 'cancelled',
              billingCycle: userSub.billingCycle || 'monthly'
            } as UserSubscriptionInfo;
          }
        }
        
        return null;
      } catch (error) {
        console.warn(`Failed to fetch subscription for user ${userId}:`, error);
        return null;
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}