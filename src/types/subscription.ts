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
