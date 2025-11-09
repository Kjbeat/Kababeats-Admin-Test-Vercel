/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { 
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Crown,
  Music,
  Headphones
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiService } from '@/services/api';

interface UserSubscriptionProps {
  user: any;
  userDetails: any;
  stats: any;
  subscriptions: any[];
  userSubscription: any;
  subscriptionPayments: any[]; // ← Ajouté ici
  onRefresh: () => void;
  isLoading: boolean;
}

export function UserSubscription({
  user,
  userDetails,
  stats,
  subscriptions,
  userSubscription,
  subscriptionPayments, // ← Ajouté ici
  onRefresh,
  isLoading
}: UserSubscriptionProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const formatDate = (dateValue: any) => {
    if (!dateValue) return 'N/A';
    
    try {
      // Handle different date formats
      let date: Date;
      
      if (typeof dateValue === 'string') {
        date = new Date(dateValue);
      } else if (typeof dateValue === 'number') {
        date = new Date(dateValue);
      } else if (dateValue.$date) {
        date = new Date(dateValue.$date);
      } else {
        date = new Date(dateValue);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateValue);
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error, dateValue);
      return 'Error';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  // Trouver le plan actuel de l'utilisateur
  const currentPlanData = userSubscription 
    ? subscriptions.find(sub => 
        sub._id.toString() === (userSubscription.subscriptionId?.$oid || userSubscription.subscriptionId?.toString())
      )
    : null;

  // Construire l'objet currentPlan dynamique
  const currentPlan = currentPlanData ? {
    id: currentPlanData._id.toString(),
    name: currentPlanData.name,
    type: userSubscription.billingCycle || 'monthly',
    amount: userSubscription.billingCycle === 'yearly' 
      ? currentPlanData.priceYearly 
      : currentPlanData.priceMonthly,
    status: (userSubscription.status || 'active').toLowerCase(),
    startDate: userSubscription.currentPeriodStart?.$date || userSubscription.currentPeriodStart || userSubscription.createdAt?.$date || userSubscription.createdAt,
    endDate: userSubscription.currentPeriodEnd?.$date || userSubscription.currentPeriodEnd || userSubscription.endDate?.$date || userSubscription.endDate,
    autoRenew: !userSubscription.cancelAtPeriodEnd,
    features: currentPlanData.features || []
  } : null;

  // Debug logging to understand the data structure
  if (process.env.NODE_ENV === 'development' && userSubscription) {
    console.log('UserSubscription data:', userSubscription);
    console.log('Current plan endDate:', currentPlan?.endDate);
    console.log('Raw currentPeriodEnd:', userSubscription.currentPeriodEnd);
    console.log('Raw endDate:', userSubscription.endDate);
  }

  // Plans disponibles
  const availablePlans = subscriptions
    .filter(sub => sub.isActive)
    .map(sub => ({
      id: sub._id.toString(),
      name: sub.name,
      type: 'monthly',
      amount: sub.priceMonthly,
      features: sub.features || [],
      popular: sub.code === 'PRO'
    }))
    .sort((a, b) => (a.amount || 0) - (b.amount || 0));

  const getStatusBadge = (status: string) => {
    const lowerStatus = status?.toLowerCase();
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      cancelled: "destructive",
      inactive: "outline",
      expired: "outline",
      pending: "outline",
      paid: "default",
      failed: "destructive",
    };
    const labels: Record<string, string> = {
      active: 'Active',
      cancelled: 'Cancelled',
      inactive: 'Inactive',
      expired: 'Expired',
      pending: 'Pending',
      paid: 'Paid',
      failed: 'Failed',
    };
    return <Badge variant={variants[lowerStatus] || "secondary"}>{labels[lowerStatus] || status}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    const lowerStatus = status?.toLowerCase();
    switch (lowerStatus) {
      case 'active':
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
      case 'failed':
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPlanIcon = (code: string) => {
    switch (code) {
      case 'FREE':
        return <Music className="h-5 w-5" />;
      case 'BASIC':
        return <Headphones className="h-5 w-5" />;
      case 'PRO':
      case 'ENTERPRISE':
        return <Crown className="h-5 w-5" />;
      default:
        return <Music className="h-5 w-5" />;
    }
  };

  const handleUpgradePlan = useCallback(async (planId: string) => {
    if (!user?._id) return;
    
    try {
      setIsActionLoading(true);
      await apiService.changeUserPlan(user._id, planId);
      onRefresh();
    } catch (error) {
      console.error('Failed to change plan:', error);
    } finally {
      setIsActionLoading(false);
    }
  }, [user?._id, onRefresh]);

  const handleCancelSubscription = useCallback(() => {
    setShowCancelModal(true);
  }, []);

  const handleConfirmCancel = useCallback(async () => {
    if (!user?._id) {
      setShowCancelModal(false);
      return;
    }

    try {
      setIsActionLoading(true);
      await apiService.cancelUserSubscription(user._id);
      onRefresh();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    } finally {
      setIsActionLoading(false);
      setShowCancelModal(false);
    }
  }, [user?._id, onRefresh]);

  const handleCancelModal = useCallback(() => {
    setShowCancelModal(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      {currentPlan ? (
        <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-border/60">
          <div className="relative">
            <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent" />
            <CardHeader className="relative z-10 pb-2">
              <CardTitle className="flex items-center gap-2 text-xl">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-purple-500/10">
                  {getPlanIcon(currentPlanData?.code)}
                </span>
                Current Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl font-semibold tracking-tight text-purple-600">
                    {currentPlan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {currentPlan.type === 'yearly' ? 'Yearly' : 'Monthly'} plan
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-lg font-semibold text-purple-600">
                    {formatCurrency(currentPlan.amount)}
                    <span className="text-sm text-muted-foreground">
                      /{currentPlan.type === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>
                  {/* <div className="text-xs text-muted-foreground">
                    {currentPlan.autoRenew ? 'Auto-renewal enabled' : 'Auto-renewal disabled'}
                  </div> */}
                </div>
              </div>

              <div className="mt-6 border-t border-purple-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Plan Features</h4>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(currentPlan.status)}
                    {getStatusBadge(currentPlan.status)}
                  </div>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {currentPlan.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No active subscription</p>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentPlan ? (
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Plan</span>
                    <span className="text-sm">{currentPlan.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Billing Cycle</span>
                    <span className="text-sm capitalize">{currentPlan.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Next Billing</span>
                    <span className="text-sm">
                      {formatDate(currentPlan.endDate)}
                    </span>
                  </div>
                  {/* <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Auto Renewal</span>
                    <Badge variant={currentPlan.autoRenew ? "default" : "outline"}>
                      {currentPlan.autoRenew ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div> */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(currentPlan.status)}
                      {getStatusBadge(currentPlan.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Card>
              <CardHeader>
                <CardTitle>Subscription Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentPlan ? (
                  <Button 
                    className="w-full justify-start" 
                    variant="destructive"
                    onClick={handleCancelSubscription}
                    disabled={isActionLoading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Subscription
                  </Button>
                ) : (
                  <Button 
                    className="w-full justify-start" 
                    variant="default"
                    disabled
                  >
                    No active subscription
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">
                  {currentPlan
                    ? 'Canceling will stop auto-renewal and the subscription will end at the current billing period.'
                    : 'Subscribe to a plan to unlock premium features.'}
                </p>
              </CardContent>
            </Card>
          </div>

        {/* Available Plans */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Available Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {availablePlans.map((plan) => {
                  const planData = subscriptions.find(s => s._id.toString() === plan.id);
                  return (
                    <div 
                      key={plan.id} 
                      className={`p-4 rounded-lg border ${
                        currentPlan?.id === plan.id 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getPlanIcon(planData?.code)}
                          <h4 className="font-semibold">{plan.name}</h4>
                        </div>
                        {plan.popular && (
                          <Badge variant="default" className="text-xs">Popular</Badge>
                        )}
                      </div>
                      <div className="mb-4">
                        <span className="text-2xl font-bold">{formatCurrency(plan.amount)}</span>
                        <span className="text-sm text-muted-foreground">/month</span>
                      </div>
                      <ul className="space-y-2 mb-4">
                        {plan.features.slice(0, 3).map((feat, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-1">
                            <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                            {feat}
                          </li>
                        ))}
                        {plan.features.length > 3 && (
                          <li className="text-xs text-muted-foreground">
                            +{plan.features.length - 3} more features
                          </li>
                        )}
                      </ul>
                      <Button
                        size="sm"
                        className="w-full"
                        variant={currentPlan?.id === plan.id ? "outline" : "default"}
                        disabled={currentPlan?.id === plan.id || isActionLoading}
                        onClick={() => handleUpgradePlan(plan.id)}
                      >
                        {isActionLoading ? 'Processing...' : currentPlan?.id === plan.id ? 'Current Plan' : 'Select'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card> */}
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <p className="text-sm text-muted-foreground">View your subscription payments</p>
            </CardHeader>
            <CardContent>
              {subscriptionPayments && subscriptionPayments.length > 0 ? (
                <div className="space-y-4">
                  {subscriptionPayments.map((payment) => {
                    const plan = subscriptions.find(
                      s => s._id.toString() === payment.referenceId?.toString()
                    );
                    return (
                      <div 
                        key={payment._id?.$oid || payment._id} 
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {plan?.name || payment.metadata?.planCode || 'Subscription'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(payment.createdAt.$date || payment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatCurrency(payment.amount)}
                          </p>
                          <Badge variant={payment.status === 'succeeded' ? 'default' : 'outline'}>
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="mx-auto h-12 w-12 mb-4" />
                  <p className="font-semibold">No billing history</p>
                  <p className="text-sm">No subscription payments found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cancel Subscription Modal */}
      {showCancelModal && currentPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Cancel Subscription</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to cancel <strong>{currentPlan.name}</strong>? This will:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Stop auto-renewal immediately</li>
                <li>• End access at the current billing period</li>
                <li>• Remove premium features access</li>
              </ul>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={handleCancelModal}
                  className="flex-1"
                  disabled={isActionLoading}
                >
                  Keep Subscription
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleConfirmCancel}
                  className="flex-1"
                  disabled={isActionLoading}
                >
                  {isActionLoading ? 'Processing...' : 'Cancel Subscription'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}