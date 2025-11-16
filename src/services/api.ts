import axios, { AxiosInstance } from "axios";
import { ApiResponse, AuthResponse, LoginCredentials } from "@/types";

class ApiService {
  private api: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;

  constructor() {
    // In dev we want the client to call the Vite dev server (same-origin)
    // so the Vite proxy can forward requests to the backend and avoid CORS.
    // In production use the explicit VITE_API_URL if provided.
    const devBase = "/api/admin"; // matches the proxy rule in vite.config.ts
    const prodBase = import.meta.env.VITE_API_URL || "http://localhost:3003/api/admin";
    const baseURL = import.meta.env.DEV ? devBase : prodBase;

    this.api = axios.create({
      baseURL,
      timeout: 30000, // Increased from 10000 to 30000 (30 seconds) for dashboard stats
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("admin_access_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            this.clearAuth();
            window.location.href = "/login";
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = this.performTokenRefresh();

    try {
      const token = await this.refreshTokenPromise;
      return token;
    } finally {
      this.refreshTokenPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    const refreshToken = localStorage.getItem("admin_refresh_token");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await axios.post(
        `${this.api.defaults.baseURL}/auth/refresh`,
        {
          refreshToken,
        }
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data.data;

      localStorage.setItem("admin_access_token", accessToken);
      localStorage.setItem("admin_refresh_token", newRefreshToken);

      return accessToken;
    } catch (error) {
      this.clearAuth();
      throw error;
    }
  }

  private clearAuth() {
    localStorage.removeItem("admin_access_token");
    localStorage.removeItem("admin_refresh_token");
    localStorage.removeItem("admin_user");
  }

  // Auth methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      credentials
    );
    const { data } = response.data;

    if (data) {
      localStorage.setItem("admin_access_token", data.accessToken);
      localStorage.setItem("admin_refresh_token", data.refreshToken);
      localStorage.setItem("admin_user", JSON.stringify(data.admin));
      return data;
    }

    throw new Error("Login response did not contain authentication data.");
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem("admin_refresh_token");
    if (refreshToken) {
      try {
        await this.api.post("/auth/logout", { refreshToken });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    this.clearAuth();
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    await this.api.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
  }

  async requestPasswordReset(email: string): Promise<void> {
    await this.api.post("/auth/request-password-reset", { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.api.post("/auth/reset-password", { token, newPassword });
  }

  // Generic CRUD methods

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const response = await this.api.get<ApiResponse<T>>(endpoint, { params });
    console.log(`API GET ${endpoint}:`, response.data);
    return response.data.data || (response.data as T);
    //return (response.data as T);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.api.post<ApiResponse<T>>(endpoint, data);
    return response.data.data || (response.data as T);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.api.put<ApiResponse<T>>(endpoint, data);
    return response.data.data || (response.data as T);
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.api.patch<ApiResponse<T>>(endpoint, data);
    return response.data.data || (response.data as T);
  }

  async delete<T>(endpoint: string, config?: any): Promise<T> {
    const response = await this.api.delete<ApiResponse<T>>(endpoint, config);
    return response.data.data || (response.data as T);
  }

  // Admin management
  async getAdmins(params?: Record<string, any>) {
    return this.get("/admins", params);
  }

  async getAdmin(id: string) {
    return this.get(`/admins/${id}`);
  }

  async createAdmin(data: any) {
    return this.post("/admins", data);
  }

  async updateAdmin(id: string, data: any) {
    return this.put(`/admins/${id}`, data);
  }

  async deleteAdmin(id: string) {
    return this.delete(`/admins/${id}`);
  }

  async changeAdminPassword(id: string, newPassword: string) {
    return this.post(`/admins/${id}/change-password`, { newPassword });
  }

  // User management
  async getUsers(params?: Record<string, any>) {
    // Clean params - remove undefined values
    const cleanParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(
            ([_, value]) =>
              value !== undefined && value !== null && value !== ""
          )
        )
      : {};

    const response = await this.api.get("/test/users", { params: cleanParams });
    if (process.env.NODE_ENV === "development") {
      console.log("getUsers API request params:", cleanParams);
      console.log("getUsers API response:", response.data);
    }
    // Backend returns { success, data, pagination }
    // Return the full response structure that the frontend expects
    return response.data;
  }

  async getUser(id: string) {
    const response = await this.api.get(`/test/users/${id}`);
    if (process.env.NODE_ENV === "development") {
      console.log("getUser API response:", response.data);
    }
    // Extract just the data property
    return response.data.data || response.data;
  }

  async getUserDetails(id: string) {
    const response = await this.api.get(`/test/users/${id}/details`);
    if (process.env.NODE_ENV === "development") {
      console.log("getUserDetails API response:", response.data);
    }
    // Backend returns { success: true, data: userDetails }
    // Extract just the userDetails from data property
    return response.data.data || response.data;
  }

  async getBatchUserSubscriptions(userIds: string[]) {
    console.log('🚀 API: Calling batch subscriptions with userIds:', userIds);
    try {
      const response = await this.api.post('/test/users/batch-subscriptions', { userIds });
      console.log('✅ API: Batch subscriptions response:', response.data);
      return response.data.data || {};
    } catch (error) {
      console.error('❌ API: Batch subscriptions error:', error);
      throw error;
    }
  }

  async updateUser(id: string, data: any) {
    return this.put(`/users/${id}`, data);
  }

  async suspendUser(id: string, reason?: string) {
    return this.post(`/users/${id}/suspend`, { reason });
  }

  async activateUser(id: string) {
    return this.post(`/users/${id}/activate`);
  }

  async impersonateUser(id: string) {
    return this.post(`/users/${id}/impersonate`);
  }

  async cancelUserSubscription(id: string): Promise<void> {
  return this.post(`/users/${id}/cancel-subscription`, {});
}

async changeUserPlan(id: string, newPlanId: string): Promise<void> {
  return this.post(`/users/${id}/change-plan`, { newPlanId });
}

  // Beat management
  async getBeats(params?: Record<string, any>) {
    return this.get("/beats", params);
  }

  async getBeat(id: string) {
    return this.get(`/beats/${id}`);
  }

  async approveBeat(id: string, notes?: string) {
    return this.post(`/beats/${id}/approve`, { notes });
  }

  async rejectBeat(id: string, reason: string) {
    return this.post(`/beats/${id}/reject`, { reason });
  }

  async deleteBeat(id: string) {
    return this.delete(`/beats/${id}`);
  }

  // Content management
  async getHomepageContent() {
    return this.get("/content/homepage");
  }

  async createHomepageContent(data: any) {
    return this.post("/content/homepage", data);
  }

  async updateHomepageContent(id: string, data: any) {
    return this.put(`/content/homepage/${id}`, data);
  }

  async deleteHomepageContent(id: string) {
    return this.delete(`/content/homepage/${id}`);
  }

  async getCategories() {
    return this.get("/content/categories");
  }

  async createCategory(data: any) {
    return this.post("/content/categories", data);
  }

  async updateCategory(id: string, data: any) {
    return this.put(`/content/categories/${id}`, data);
  }

  async deleteCategory(id: string) {
    return this.delete(`/content/categories/${id}`);
  }

  // Sales and analytics
  async getSales(params?: Record<string, any>) {
    return this.get("/sales", params);
  }

  async getDashboardStats() {
    return this.get("/analytics/dashboard");
  }

  async getRevenueAnalytics(params?: Record<string, any>) {
    return this.get("/analytics/revenue", params);
  }

  async getUserSalesByMonth(userId: string, month: number, year: number) {
    return this.get(`/sales/user/${userId}`, { month, year });
  }

  // Logs
  async getAuditLogs(params?: Record<string, any>) {
    return this.get("/logs", params);
  }

  async getActivityLogs(params?: Record<string, any>) {
    return this.get("/logs/activity", params);
  }

  // Notifications
  async getNotifications(params?: Record<string, any>) {
    return this.get("/notifications", params);
  }

  async createNotification(data: any) {
    return this.post("/notifications", data);
  }

  async sendNotification(id: string) {
    return this.post(`/notifications/send`, { id });
  }

  // Settings
  async getSettings() {
    return this.get("/settings");
  }

  async updateSettings(data: any) {
    return this.put("/settings", data);
  }

  async getPublicSettings() {
    return this.get("/settings/public");
  }

  // Payouts
  async getPayouts(params?: Record<string, any>) {
    return this.get("/payouts", params);
  }

  async updatePayoutStatus(payoutId: string, status: string) {
    return this.patch(`/payouts/${payoutId}/status`, { status });
  }

  async bulkUpdatePayouts(data: {
    action: "approve" | "reject" | "process";
    ids: string[];
  }) {
    return this.post("/payouts/bulk-update", data);
  }


async exportPayoutsToExcel(params?: Record<string, any>): Promise<Blob> {
  // Nettoyer les paramètres comme dans getUsers
  const cleanParams = params
    ? Object.fromEntries(
        Object.entries(params).filter(
          ([_, value]) => value !== undefined && value !== null && value !== "" && value !== "all"
        )
      )
    : {};

  const response = await this.api.get<Blob>("/payouts/export", {
    params: cleanParams,
    responseType: "blob", // ⚠️ Très important pour les fichiers
  });

  return response.data;
}
  async importPayoutsExcel(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await this.api.post("/payouts/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  async processPayouts() {
    return this.post("/payouts/process");
  }

  // Transactions
  async getTransactions(params?: Record<string, any>) {
    return this.get("/transactions", params);
  }

  async getTransactionMetrics(params?: Record<string, any>) {
    return this.get("/transactions/metrics", params);
  }

  async getTransaction(id: string) {
    return this.get(`/transactions/${id}`);
  }

  // Subscription Management
  async getSubscriptionManagement(params?: Record<string, any>) {
    return this.get("/subscriptions/management", params);
  }

  async getSubscriptionMetrics(params?: Record<string, any>) {
    return this.get("/subscriptions/metrics", params);
  }

  async getSubscription(id: string) {
    return this.get(`/subscriptions/${id}`);
  }

  async bulkSubscriptionAction(data: {
    action: "cancel" | "suspend" | "activate" | "change_plan";
    subscriptionIds: string[];
    planId?: string;
  }) {
    return this.post("/subscriptions/bulk-action", data);
  }

  async updateSubscriptionStatus(subscriptionId: string, status: string) {
    return this.patch(`/subscriptions/${subscriptionId}/status`, { status });
  }

  async cancelSubscription(subscriptionId: string) {
    return this.post(`/subscriptions/${subscriptionId}/cancel`);
  }

  async reactivateSubscription(subscriptionId: string) {
    return this.post(`/subscriptions/${subscriptionId}/reactivate`);
  }

}

export const apiService = new ApiService();
