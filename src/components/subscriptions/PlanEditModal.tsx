import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { SubscriptionPlan } from "@/types/subscription";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateSubscriptionPlan,
  useUpdateSubscriptionPlan,
} from "@/hooks/useSubscriptions";
import { useToast } from "@/components/ui/use-toast";

interface PlanEditModalProps {
  plan: SubscriptionPlan | null;
  onSave: (plan: SubscriptionPlan) => void;
  onClose: () => void;
}

export function PlanEditModal({ plan, onSave, onClose }: PlanEditModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    priceMonthly: 0,
    priceYearly: 0,
    priceIdMonthly: "",
    priceIdYearly: "",
    paypalPlanIdMonthly: "",
    paypalPlanIdYearly: "",
    paypalProductId: "",
    paystackPlanIdMonthly: "",
    paystackPlanIdYearly: "",
    currency: "USD",
    features: [""],
    isActive: true,
    sortOrder: 0,
    platformFee: 0.1,
    uploadLimit: 0,
    aiCreditsPerMonth: 0,
    storageLimitMB: 0,
    analyticsAccess: false,
    supportLevel: "basic",
  });

  const { toast } = useToast();
  const createPlanMutation = useCreateSubscriptionPlan();
  const updatePlanMutation = useUpdateSubscriptionPlan();
  const isEditing = !!plan?._id;
  const currencies = ["usd", "eur", "cfa", "ngn", "xof", "cad"];

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        code: plan.code,
        description: plan.description,
        priceMonthly: plan.priceMonthly,
        priceYearly: plan.priceYearly,
        priceIdMonthly: plan.priceIdMonthly || "",
        priceIdYearly: plan.priceIdYearly || "",
        paypalPlanIdMonthly: plan.paypalPlanIdMonthly || "",
        paypalPlanIdYearly: plan.paypalPlanIdYearly || "",
        paypalProductId: plan.paypalProductId || "",
        paystackPlanIdMonthly: plan.paystackPlanIdMonthly || "",
        paystackPlanIdYearly: plan.paystackPlanIdYearly || "",
        currency: plan.currency,
        features: plan.features.length > 0 ? plan.features : [""],
        isActive: plan.isActive,
        sortOrder: plan.sortOrder || 0,
        platformFee: plan.platformFee,
        uploadLimit: plan.uploadLimit || 0,
        aiCreditsPerMonth: plan.aiCreditsPerMonth || 0,
        storageLimitMB: plan.storageLimitMB || 0,
        analyticsAccess: plan.analyticsAccess,
        supportLevel: plan.supportLevel || "basic",
      });
    }
  }, [plan]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData((prev) => ({
      ...prev,
      features: newFeatures,
    }));
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  const removeFeature = (index: number) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        features: newFeatures,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const planData = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        priceMonthly: formData.priceMonthly,
        priceYearly: formData.priceYearly,
        priceIdMonthly: formData.priceIdMonthly || undefined,
        priceIdYearly: formData.priceIdYearly || undefined,
        paypalPlanIdMonthly: formData.paypalPlanIdMonthly || undefined,
        paypalPlanIdYearly: formData.paypalPlanIdYearly || undefined,
        paypalProductId: formData.paypalProductId || undefined,
        paystackPlanIdMonthly: formData.paystackPlanIdMonthly || undefined,
        paystackPlanIdYearly: formData.paystackPlanIdYearly || undefined,
        currency: formData.currency,
        features: formData.features.filter((f) => f.trim() !== ""),
        isActive: formData.isActive,
        sortOrder: formData.sortOrder,
        platformFee: formData.platformFee,
        uploadLimit: formData.uploadLimit,
        aiCreditsPerMonth: formData.aiCreditsPerMonth,
        storageLimitMB: formData.storageLimitMB,
        analyticsAccess: formData.analyticsAccess,
        supportLevel: formData.supportLevel,
      };

      if (isEditing && plan?._id) {
        await updatePlanMutation.mutateAsync({
          id: plan._id,
          data: planData,
        });
      } else {
        await createPlanMutation.mutateAsync(planData);
      }

      onSave(plan!); // This will close the modal
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {plan ? "Edit Subscription Plan" : "Create New Subscription Plan"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Pro Plan"
                required
              />
            </div>

            <div>
              <Label>Code</Label>
              <Input
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value)}
                placeholder="FREE, PRO, etc."
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Plan description..."
              rows={3}
            />
          </div>

          {/* Features List */}
          <div>
            <Label>Features</Label>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder="Feature description..."
                  />
                  {formData.features.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFeature(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFeature}
              >
                Add Feature
              </Button>
            </div>
          </div>

          {/* Price Monthly & Yearly */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priceMonthly">Monthly Price ($)</Label>
              <Input
                id="priceMonthly"
                type="number"
                value={formData.priceMonthly}
                onChange={(e) =>
                  handleInputChange(
                    "priceMonthly",
                    parseFloat(e.target.value) || 0
                  )
                }
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="priceYearly">Yearly Price ($)</Label>
              <Input
                id="priceYearly"
                type="number"
                value={formData.priceYearly}
                onChange={(e) =>
                  handleInputChange(
                    "priceYearly",
                    parseFloat(e.target.value) || 0
                  )
                }
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Currency & Sort Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleInputChange("currency", value)}
              >
                <SelectTrigger id="currency" className="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((cur) => (
                    <SelectItem key={cur} value={cur}>
                      {cur.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) =>
                  handleInputChange("sortOrder", parseInt(e.target.value) || 0)
                }
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Platform Fee */}
            <div>
              <Label htmlFor="platformFee">Platform Fee</Label>
              <Input
                id="platformFee"
                type="number"
                value={formData.platformFee}
                onChange={(e) =>
                  handleInputChange(
                    "platformFee",
                    parseFloat(e.target.value) || 0
                  )
                }
                min="0"
                max="1"
                step="0.01"
                placeholder="0.10"
              />
            </div>

            {/* Support Level */}
            <div>
              <Label htmlFor="supportLevel">Support Level</Label>
              <Select
                value={formData.supportLevel}
                onValueChange={(value) =>
                  handleInputChange(
                    "supportLevel",
                    value as "basic" | "priority" | "premium"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select support level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Upload Limit & AI Credits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="uploadLimit">Upload Limit</Label>
              <Input
                id="uploadLimit"
                type="number"
                value={formData.uploadLimit}
                onChange={(e) =>
                  handleInputChange(
                    "uploadLimit",
                    parseInt(e.target.value) || 0
                  )
                }
                min="-1"
              />
            </div>
            <div>
              <Label htmlFor="aiCreditsPerMonth">AI Credits/Month</Label>
              <Input
                id="aiCreditsPerMonth"
                type="number"
                value={formData.aiCreditsPerMonth}
                onChange={(e) =>
                  handleInputChange(
                    "aiCreditsPerMonth",
                    parseInt(e.target.value) || 0
                  )
                }
                min="-1"
              />
            </div>
          </div>

          {/* Storage Limit & Analytics Access */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="storageLimitMB">Storage Limit (MB)</Label>
              <Input
                id="storageLimitMB"
                type="number"
                value={formData.storageLimitMB}
                onChange={(e) =>
                  handleInputChange(
                    "storageLimitMB",
                    parseInt(e.target.value) || 0
                  )
                }
                min="0"
              />
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="analyticsAccess"
                checked={formData.analyticsAccess}
                onCheckedChange={(checked) =>
                  handleInputChange("analyticsAccess", checked)
                }
              />
              <Label htmlFor="analyticsAccess">Analytics Access</Label>
            </div>
          </div>

          {/* Stripe Price IDs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priceIdMonthly">Stripe Monthly Price ID</Label>
              <Input
                id="priceIdMonthly"
                value={formData.priceIdMonthly}
                onChange={(e) =>
                  handleInputChange("priceIdMonthly", e.target.value)
                }
                placeholder="price_xxx"
              />
            </div>
            <div>
              <Label htmlFor="priceIdYearly">Stripe Yearly Price ID</Label>
              <Input
                id="priceIdYearly"
                value={formData.priceIdYearly}
                onChange={(e) =>
                  handleInputChange("priceIdYearly", e.target.value)
                }
                placeholder="price_xxx"
              />
            </div>
          </div>

          {/* PayPal IDs */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="paypalPlanIdMonthly">
                PayPal Monthly Plan ID
              </Label>
              <Input
                id="paypalPlanIdMonthly"
                value={formData.paypalPlanIdMonthly}
                onChange={(e) =>
                  handleInputChange("paypalPlanIdMonthly", e.target.value)
                }
                placeholder="paypal_plan_monthly_xxx"
              />
            </div>
            <div>
              <Label htmlFor="paypalPlanIdYearly">PayPal Yearly Plan ID</Label>
              <Input
                id="paypalPlanIdYearly"
                value={formData.paypalPlanIdYearly}
                onChange={(e) =>
                  handleInputChange("paypalPlanIdYearly", e.target.value)
                }
                placeholder="paypal_plan_yearly_xxx"
              />
            </div>
            <div>
              <Label htmlFor="paypalProductId">PayPal Product ID</Label>
              <Input
                id="paypalProductId"
                value={formData.paypalProductId}
                onChange={(e) =>
                  handleInputChange("paypalProductId", e.target.value)
                }
                placeholder="paypal_product_xxx"
              />
            </div>
          </div>

          {/* Paystack IDs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paystackPlanIdMonthly">
                Paystack Monthly Plan ID
              </Label>
              <Input
                id="paystackPlanIdMonthly"
                value={formData.paystackPlanIdMonthly}
                onChange={(e) =>
                  handleInputChange("paystackPlanIdMonthly", e.target.value)
                }
                placeholder="paystack_plan_monthly_xxx"
              />
            </div>
            <div>
              <Label htmlFor="paystackPlanIdYearly">
                Paystack Yearly Plan ID
              </Label>
              <Input
                id="paystackPlanIdYearly"
                value={formData.paystackPlanIdYearly}
                onChange={(e) =>
                  handleInputChange("paystackPlanIdYearly", e.target.value)
                }
                placeholder="paystack_plan_yearly_xxx"
              />
            </div>
          </div>

          {/* Active Switch */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                handleInputChange("isActive", checked)
              }
            />
            <Label htmlFor="isActive">Active Plan</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={
                createPlanMutation.isPending || updatePlanMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                createPlanMutation.isPending || updatePlanMutation.isPending
              }
            >
              {createPlanMutation.isPending || updatePlanMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Update Plan"
              ) : (
                "Create Plan"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
