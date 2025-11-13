import {
  SubscriptionPlan,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
  SubscriptionManagementFiltersType,
  SubscriptionManagementResponse,
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

  async getSubscriptionManagement(filters: SubscriptionManagementFiltersType): Promise<SubscriptionManagementResponse> {
    // Clean params - remove undefined values, similar to how getUsers does it
    const cleanParams = filters
      ? Object.fromEntries(
          Object.entries(filters).filter(
            ([_, value]) =>
              value !== undefined && value !== null && value !== "" && value !== "all"
          )
        )
      : {};

    if (process.env.NODE_ENV === "development") {
      console.log("getSubscriptionManagement API request params:", cleanParams);
    }

    const response = await apiService.get<SubscriptionManagementResponse>("/subscriptions/management", cleanParams);
    
    if (process.env.NODE_ENV === "development") {
      console.log("getSubscriptionManagement API response:", response);
    }

    // Backend returns { success, data, pagination, metrics }
    // Return the full response structure
    return response as SubscriptionManagementResponse;
  }
}

export const subscriptionApiService = new SubscriptionApiService();
