export interface SubscriptionPlan {
  _id: string;
  name: string;
  code: string; 
  description: string;
  priceMonthly: number;
  priceYearly: number;
  priceIdMonthly?: string;
  priceIdYearly?: string;
  paypalPlanIdMonthly?: string;
  paypalPlanIdYearly?: string;
  paypalProductId?: string;
  paystackPlanIdMonthly?: string;
  paystackPlanIdYearly?: string;
  currency: string; 
  features: string[];
  isActive: boolean;
  sortOrder: number;
  platformFee: number;
  uploadLimit?: number;
  aiCreditsPerMonth?: number;
  storageLimitMB?: number;
  analyticsAccess: boolean;
  supportLevel: "basic" | "priority" | "premium";
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionPlanRequest {
  name: string;
  code: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  priceIdMonthly?: string;
  priceIdYearly?: string;
  paypalPlanIdMonthly?: string;
  paypalPlanIdYearly?: string;
  paypalProductId?: string;
  paystackPlanIdMonthly?: string;
  paystackPlanIdYearly?: string;
  currency: string;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  platformFee: number;
  uploadLimit?: number;
  aiCreditsPerMonth?: number;
  storageLimitMB?: number;
  analyticsAccess: boolean;
  supportLevel: "basic" | "priority" | "premium";
}

export interface UpdateSubscriptionPlanRequest extends Partial<CreateSubscriptionPlanRequest> {
  _id: string;
}

// User Subscription Management Types
export interface UserSubscription {
  _id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  subscription: {
    plan: {
      _id: string;
      name: string;
      code: string;
      priceMonthly: number;
      priceYearly: number;
    };
    status: 'active' | 'inactive' | 'cancelled' | 'trial' | 'past_due';
    startDate: string;
    endDate?: string;
    billingCycle: 'monthly' | 'yearly';
    autoRenew: boolean;
    trialEndsAt?: string;
    isTrialActive?: boolean;
    provider?: string;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
  } | null;
  paymentMethod?: {
    type: string;
    last4?: string;
    brand?: string;
  };
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionMetrics {
  totalSubscribers: number;
  activeSubscribers: number;
  trialSubscribers: number;
  cancelledSubscribers: number;
  inactiveSubscribers: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  averageRevenuePerUser: number;
  churnRate: number;
  conversionRate: number;
  planDistribution: Array<{
    planName: string;
    planCode: string;
    count: number;
    percentage: number;
  }>;
}

export interface SubscriptionManagementFiltersType {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'cancelled' | 'trial' | 'past_due';
  planId?: string;
  billingCycle?: 'monthly' | 'yearly';
  dateFrom?: string;
  dateTo?: string;
  provider?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SubscriptionManagementResponse {
  success: boolean;
  data: UserSubscription[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  metrics?: SubscriptionMetrics;
}
