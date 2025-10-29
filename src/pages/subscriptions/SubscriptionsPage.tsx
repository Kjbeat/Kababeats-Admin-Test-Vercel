import React, { useState } from "react";
import { Plus, Edit, Copy, Trash2, RefreshCw } from "lucide-react";
import { SubscriptionPlan } from "@/types/subscription";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { PlanEditModal } from "@/components/subscriptions/PlanEditModal";
import { PlanDeleteModal } from "@/components/subscriptions/PlanDeleteModal";
import {
  useSubscriptionPlans,
  useDeleteSubscriptionPlan,
  useToggleSubscriptionPlan,
} from "@/hooks/useSubscriptions";

export function SubscriptionsPage() {
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();

  // API hooks
  const {
    data: plans = [],
    isLoading,
    error,
    refetch,
  } = useSubscriptionPlans();
  const deletePlanMutation = useDeleteSubscriptionPlan();
  const togglePlanMutation = useToggleSubscriptionPlan();

  // Handle API errors
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">
            Error Loading Plans
          </h3>
          <p className="text-gray-600 mb-4">
            Failed to load subscription plans
          </p>
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const handleToggleActive = async (plan: SubscriptionPlan) => {
    try {
      await togglePlanMutation.mutateAsync({
        id: plan._id,
        isActive: !plan.isActive,
      });
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
  };

  const handleDelete = (plan: SubscriptionPlan) => {
    setDeletingPlan(plan);
  };

  const handleCopy = (plan: SubscriptionPlan) => {
    const newPlan = {
      ...plan,
      _id: "",
      name: `${plan.name} (Copy)`,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingPlan(newPlan);
  };

  const handleSave = (updatedPlan: SubscriptionPlan) => {
    setEditingPlan(null);
    setIsCreateModalOpen(false);
    // The actual save is handled in the PlanEditModal component
  };

  const handleDeleteConfirm = async (plan: SubscriptionPlan) => {
    try {
      await deletePlanMutation.mutateAsync(plan._id);
      setDeletingPlan(null);
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Subscription Plans
          </h1>
          <p className="text-gray-600">
            Manage your subscription plans and pricing
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Plan
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {Array.isArray(plans) ? (
          plans.map((plan) => (
            <Card key={plan._id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      Code:{" "}
                      <span className="uppercase font-mono">{plan.code}</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={plan.isActive ? "default" : "secondary"}>
                      {plan.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(plan)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(plan)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(plan)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Visibility</span>
                  <Switch
                    checked={plan.isActive}
                    onCheckedChange={() => handleToggleActive(plan)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Monthly Price:</span>
                    <span className="font-medium">${plan.priceMonthly}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Yearly Price:</span>
                    <span className="font-medium">${plan.priceYearly}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Platform Fee:</span>
                    <span className="font-medium">
                      {(plan.platformFee * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Currency:</span>
                    <span className="font-medium">
                      {plan.currency.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sort Order:</span>
                    <span className="font-medium">{plan.sortOrder}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Storage Limit:</span>{" "}
                    <span className="font-medium">
                      {plan.storageLimitMB !== undefined
                        ? `${plan.storageLimitMB} MB`
                        : "Unlimited"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Analytics Access:</span>{" "}
                    <span className="font-medium">
                      {plan.analyticsAccess ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Support Level:</span>
                    <span className="font-medium">{plan.supportLevel}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Upload Limit:</span>
                    <span className="font-medium">
                      {plan.uploadLimit} files
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">AI Credits:</span>
                    <span className="font-medium">
                      {plan.aiCreditsPerMonth}/month
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Features:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Payment IDs:</h4>
                  <ul className="text-sm text-gray-500 space-y-1">
                    {plan.priceIdMonthly && (
                      <li>
                        <span className="text-purple-500 mr-2">•</span>Stripe
                        Monthly Price ID: {plan.priceIdMonthly}
                      </li>
                    )}
                    {plan.priceIdYearly && (
                      <li>
                        <span className="text-purple-500 mr-2">•</span>Stripe
                        Yearly Price ID: {plan.priceIdYearly}
                      </li>
                    )}
                    {plan.paypalPlanIdMonthly && (
                      <li>
                        <span className="text-purple-500 mr-2">•</span>PayPal
                        Monthly Plan ID: {plan.paypalPlanIdMonthly}
                      </li>
                    )}
                    {plan.paypalPlanIdYearly && (
                      <li>
                        <span className="text-purple-500 mr-2">•</span>PayPal
                        Yearly Plan ID: {plan.paypalPlanIdYearly}
                      </li>
                    )}
                    {plan.paypalProductId && (
                      <li>
                        <span className="text-purple-500 mr-2">•</span>PayPal
                        Product ID: {plan.paypalProductId}
                      </li>
                    )}
                    {plan.paystackPlanIdMonthly && (
                      <li>
                        <span className="text-purple-500 mr-2">•</span>Paystack
                        Monthly Plan ID: {plan.paystackPlanIdMonthly}
                      </li>
                    )}
                    {plan.paystackPlanIdYearly && (
                      <li>
                        <span className="text-purple-500 mr-2">•</span>Paystack
                        Yearly Plan ID: {plan.paystackPlanIdYearly}
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-red-600">No valid plans found</p>
        )}
      </div>

      {/* Modals */}
      {editingPlan && (
        <PlanEditModal
          plan={editingPlan}
          onSave={handleSave}
          onClose={() => setEditingPlan(null)}
        />
      )}

      {deletingPlan && (
        <PlanDeleteModal
          plan={deletingPlan}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeletingPlan(null)}
        />
      )}

      {isCreateModalOpen && (
        <PlanEditModal
          plan={null}
          onSave={handleSave}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </div>
  );
}
