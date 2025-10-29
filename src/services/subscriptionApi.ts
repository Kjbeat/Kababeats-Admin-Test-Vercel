import {
  SubscriptionPlan,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
} from "@/types/subscription";
import { apiService } from "./api";

class SubscriptionApiService {
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return apiService.get<SubscriptionPlan[]>("/subscription-plans");
  }

  async getSubscriptionPlan(id: string): Promise<SubscriptionPlan> {
    return apiService.get<SubscriptionPlan>(`/subscription-plan/${id}`);
  }

  async createSubscriptionPlan(data: CreateSubscriptionPlanRequest): Promise<SubscriptionPlan> {
    return apiService.post<SubscriptionPlan>("/subscription-plan", data);
  }

  async updateSubscriptionPlan(id: string, data: UpdateSubscriptionPlanRequest): Promise<SubscriptionPlan> {
    return apiService.put<SubscriptionPlan>(`/subscription-plan/${id}`, data);
  }

  async deleteSubscriptionPlan(id: string): Promise<void> {
    return apiService.delete(`/subscription-plan/${id}`);
  }

  async toggleSubscriptionPlan(id: string, isActive: boolean): Promise<SubscriptionPlan> {
    return apiService.patch<SubscriptionPlan>(`/subscription-plan/${id}/toggle`, { isActive });
  }
}

export const subscriptionApiService = new SubscriptionApiService();
