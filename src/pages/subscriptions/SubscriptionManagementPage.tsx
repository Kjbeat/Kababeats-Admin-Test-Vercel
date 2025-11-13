/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { 
  Users,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { useNavigate } from 'react-router-dom';

interface Filters {
  search: string;
  status: string;
  planId: string;
  billingCycle: string;
  provider: string;
}

export function SubscriptionManagementPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: 'all',
    planId: 'all',
    billingCycle: 'all',
    provider: 'all'
  });

  // Fetch subscription data using the same pattern as UserDetails
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['subscription-management', page, limit, filters],
    queryFn: async () => {
      const params: any = {
        page,
        limit,
        ...filters
      };
      
      // Clean up "all" values
      Object.keys(params).forEach(key => {
        if (params[key] === 'all' || params[key] === '') {
          delete params[key];
        }
      });

      const response = await apiService.getSubscriptionManagement(params);
      return response.data;
    }
  });

  const users = data?.data || [];
  const pagination = data?.pagination || { page: 1, total: 0, totalPages: 1 };
  const metrics = data?.metrics || {
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    cancelledSubscriptions: 0,
    trialSubscriptions: 0,
    inactiveSubscriptions: 0
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const handleRowClick = (userId: string) => {
    navigate(`/users/${userId}`);
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase();
    const variants: Record<string, any> = {
      active: 'default',
      trial: 'secondary',
      cancelled: 'destructive',
      inactive: 'outline',
      past_due: 'destructive'
    };
    
    return (
      <Badge variant={variants[statusLower] || 'outline'}>
        {status?.toUpperCase() || 'UNKNOWN'}
      </Badge>
    );
  };

  const formatDate = (dateValue: any) => {
    if (!dateValue) return 'N/A';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString();
    } catch {
      return 'Error';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const getPlanFromUser = (user: any) => {
    const subscription = user.userSubscription;
    const allPlans = user.subscriptions || [];
    
    if (!subscription) return null;

    const planId = subscription.subscriptionId || subscription.planId;
    const plan = allPlans.find((p: any) => 
      p._id?.toString() === planId?.$oid || p._id?.toString() === planId?.toString()
    );

    return plan;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage user subscriptions
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSubscriptions}</div>
            <p className="text-xs text-muted-foreground">All subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <div className="h-2 w-2 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial</CardTitle>
            <div className="h-2 w-2 rounded-full bg-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.trialSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Trial users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <div className="h-2 w-2 rounded-full bg-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cancelledSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Cancelled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <div className="h-2 w-2 rounded-full bg-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.inactiveSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Inactive</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <Input
              placeholder="Search by email, username..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="TRIAL">Trial</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="PAST_DUE">Past Due</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.planId} onValueChange={(value) => handleFilterChange('planId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="FREE">Free</SelectItem>
                <SelectItem value="BASIC">Basic</SelectItem>
                <SelectItem value="PRO">Pro</SelectItem>
                <SelectItem value="no_subscription">No Subscription</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.billingCycle} onValueChange={(value) => handleFilterChange('billingCycle', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Billing Cycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cycles</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.provider} onValueChange={(value) => handleFilterChange('provider', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="paystack">Paystack</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Subscriptions ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              Error loading subscriptions
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No subscriptions found
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Billing</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Next Billing</TableHead>
                    <TableHead>Payments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((userData: any) => {
                    const user = userData.user;
                    const subscription = userData.userSubscription;
                    const plan = getPlanFromUser(userData);
                    const payments = userData.subscriptionPayments || [];
                    const stats = userData.stats || {};

                    return (
                      <TableRow 
                        key={user._id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(user._id)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>
                                {user.username?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.username || 'Unknown'}</div>
                              <div className="text-sm text-muted-foreground">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{plan?.name || 'Free'}</div>
                          <div className="text-sm text-muted-foreground">
                            {plan?.code || 'FREE'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(subscription?.status || 'INACTIVE')}
                        </TableCell>
                        <TableCell className="capitalize">
                          {subscription?.billingCycle || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {plan && subscription?.billingCycle === 'yearly' 
                            ? formatCurrency(plan.priceYearly) 
                            : formatCurrency(plan?.priceMonthly || 0)}
                        </TableCell>
                        <TableCell>
                          {formatDate(subscription?.currentPeriodEnd)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{payments.length} payments</div>
                            <div className="text-muted-foreground">
                              {formatCurrency(stats.totalSpent || 0)} total
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} subscriptions
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm">
                    Page {page} of {pagination.totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= pagination.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(pagination.totalPages)}
                    disabled={page >= pagination.totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
