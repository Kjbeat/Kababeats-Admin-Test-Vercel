/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  Users, 
  BarChart3,
  Download,
  RefreshCw,
  Search,
  Filter,
  User,
  Calendar,
  DollarSign,
  ExternalLink,
  Eye,
  Crown,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  ChevronDown,
  Mail
} from 'lucide-react';
import { apiService } from '@/services/api';
import { SubscriptionUser, SubscriptionManagementFilters } from '@/types';

interface SubscriptionMetrics {
  totalSubscribers: number;
  activeSubscribers: number;
  cancelledSubscribers: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  averageRevenuePerUser: number;
  churnRate: number;
  newSubscriptionsThisMonth: number;
  freeUsers: number;
  paidUsers: number;
  trialUsers: number;
  downgradingUsers: number;
}

export function SubscriptionManagementPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionUser[]>([]);
  const [metrics, setMetrics] = useState<SubscriptionMetrics | null>(null);
  const [pagination, setPagination] = useState({ totalPages: 1, totalRecords: 0 });
  const [filters, setFilters] = useState<SubscriptionManagementFilters>({
    status: 'all',
    planId: '',
    billingCycle: 'all',
    provider: 'all',
    autoRenew: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>([]);
  const subscriptionsPerPage = 20;

  const exportToCSV = () => {
    if (subscriptions.length === 0) {
      alert('No subscription data to export.');
      return;
    }

    const headers = [
      'User ID',
      'Username',
      'Email',
      'Plan Name',
      'Type',
      'Status',
      'Amount',
      'Currency',
      'Next Billing',
      'Auto Renew',
      'Trial Ends',
      'Payment Provider',
      'Created Date'
    ];

    const rows = subscriptions.map(subscription => {
      const nextBilling = subscription.subscription.endDate ? new Date(subscription.subscription.endDate).toISOString().split('T')[0] : '';
      const trialEnds = subscription.subscription.trialEndsAt ? new Date(subscription.subscription.trialEndsAt).toISOString().split('T')[0] : '';
      const createdDate = new Date(subscription.createdAt).toISOString().split('T')[0];

      const escape = (value: string): string => {
        if (!value) return '';
        return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
      };

      return [
        escape(subscription._id),
        escape(subscription.username),
        escape(subscription.email),
        escape(subscription.subscription.plan.name),
        escape(subscription.subscription.billingCycle),
        escape(subscription.subscription.status),
        subscription.totalSpent.toFixed(2),
        'USD', // Default currency since it's not in the new structure
        escape(nextBilling),
        subscription.subscription.autoRenew ? 'Yes' : 'No',
        escape(trialEnds),
        escape(subscription.paymentMethod?.type || ''),
        escape(createdDate)
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subscriptions_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fetchSubscriptionData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filterParams: any = {
        ...filters,
        timeRange: selectedTimeRange,
        page: currentPage, 
        limit: subscriptionsPerPage 
      };
      
      Object.keys(filterParams).forEach(key => {
        if (filterParams[key] === 'all' || filterParams[key] === '') delete filterParams[key];
      });
      
      if (filterParams.dateFrom) {
        filterParams.dateFrom = `${filterParams.dateFrom}T00:00:00.000Z`;
      }
      if (filterParams.dateTo) {
        filterParams.dateTo = `${filterParams.dateTo}T23:59:59.999Z`;
      }

      const [subscriptionsResponse, metricsResponse] = await Promise.all([
        apiService.get('/subscriptions/management', filterParams),
        apiService.get('/subscriptions/metrics', filterParams)
      ]);

      if (subscriptionsResponse && Array.isArray((subscriptionsResponse as any).data)) {
        setSubscriptions((subscriptionsResponse as any).data);
        setPagination({
          totalPages: (subscriptionsResponse as any).pagination?.totalPages || 1,
          totalRecords: (subscriptionsResponse as any).pagination?.total || 0
        });
      } else if (Array.isArray(subscriptionsResponse)) {
        setSubscriptions(subscriptionsResponse as SubscriptionUser[]);
        setPagination({ totalPages: 1, totalRecords: (subscriptionsResponse as SubscriptionUser[]).length });
      } else {
        setSubscriptions([]);
        setPagination({ totalPages: 1, totalRecords: 0 });
      }

      if (metricsResponse && typeof metricsResponse === 'object') {
        setMetrics(metricsResponse as SubscriptionMetrics);
      } else {
        setMetrics(null);
      }

    } catch (error: any) {
      console.error('SubscriptionManagementPage - Error fetching data:', error);
      setError(`Failed to load data: ${error.response?.data?.message || error.message}`);
      setSubscriptions([]);
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, [filters, selectedTimeRange, currentPage]);

  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
    { value: 'all', label: 'All time' }
  ];

  const totalPages = pagination.totalPages;
  const startIndex = (currentPage - 1) * subscriptionsPerPage;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (newFilters: Partial<SubscriptionManagementFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
    if (newFilters.dateFrom !== undefined || newFilters.dateTo !== undefined) {
      setSelectedTimeRange('custom');
    }
  };

  const handleTimeRangeChange = (timeRange: string) => {
    setSelectedTimeRange(timeRange);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      planId: '',
      billingCycle: 'all',
      provider: 'all',
      autoRenew: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSelectedTimeRange('30d');
    setCurrentPage(1);
    setShowAdvancedFilters(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-purple-100 text-purple-800';
      case 'downgrading':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'suspended':
        return <Pause className="h-4 w-4 text-purple-500" />;
      case 'downgrading':
        return <ChevronDown className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedSubscriptions.length === 0) {
      alert('Please select subscriptions to perform bulk action.');
      return;
    }

    try {
      await apiService.post('/subscriptions/bulk-action', {
        action,
        subscriptionIds: selectedSubscriptions
      });
      fetchSubscriptionData();
      setSelectedSubscriptions([]);
    } catch (error) {
      console.error('Bulk action error:', error);
      alert('Failed to perform bulk action.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading subscriptions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Subscription Data</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={fetchSubscriptionData}
                  className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage user subscriptions, billing, and subscription analytics
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchSubscriptionData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-600 overflow-hidden shadow-lg rounded-xl">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-blue-100 truncate">Total Subscribers</dt>
                    <dd className="text-2xl font-bold text-white">{metrics.totalSubscribers.toLocaleString()}</dd>
                    <dd className="text-sm text-blue-200">{metrics.activeSubscribers} active</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-xl border-l-4 border-green-500">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Monthly Revenue</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(metrics.monthlyRevenue)}</dd>
                    <dd className="text-sm text-gray-500">Recurring revenue</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-xl border-l-4 border-purple-500">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">ARPU</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(metrics.averageRevenuePerUser)}</dd>
                    <dd className="text-sm text-gray-500">Average revenue per user</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-xl border-l-4 border-orange-500">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Churn Rate</dt>
                    <dd className="text-lg font-medium text-gray-900">{metrics.churnRate.toFixed(1)}%</dd>
                    <dd className="text-sm text-gray-500">Monthly churn</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Free Users</p>
                <p className="text-lg font-semibold">{metrics.freeUsers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-blue-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Paid Users</p>
                <p className="text-lg font-semibold">{metrics.paidUsers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-yellow-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Trial Users</p>
                <p className="text-lg font-semibold">{metrics.trialUsers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <ChevronDown className="h-5 w-5 text-orange-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Downgrading</p>
                <p className="text-lg font-semibold">{metrics.downgradingUsers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">New This Month</p>
                <p className="text-lg font-semibold">{metrics.newSubscriptionsThisMonth}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filter Subscriptions</h3>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showAdvancedFilters ? 'Hide Advanced' : 'Show Advanced'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
            <select
              value={selectedTimeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
            <select
              value={filters.billingCycle}
              onChange={(e) => handleFilterChange({billingCycle: e.target.value as any})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Cycles</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange({status: e.target.value as any})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="downgrading">Downgrading</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Username, email, plan..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange({search: e.target.value})}
                className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Provider</label>
                <select
                  value={filters.provider}
                  onChange={(e) => handleFilterChange({provider: e.target.value as any})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Providers</option>
                  <option value="stripe">Stripe</option>
                  <option value="paypal">PayPal</option>
                  <option value="paystack">Paystack</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Auto Renewal</label>
                <select
                  value={filters.autoRenew !== undefined ? (filters.autoRenew ? 'true' : 'false') : 'all'}
                  onChange={(e) => handleFilterChange({
                    autoRenew: e.target.value === 'all' ? undefined : e.target.value === 'true'
                  })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="true">Auto Renew On</option>
                  <option value="false">Auto Renew Off</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Filter</label>
                <input
                  type="text"
                  placeholder="Filter by plan..."
                  value={filters.planId || ''}
                  onChange={(e) => handleFilterChange({planId: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    handleFilterChange({sortBy: sortBy as any, sortOrder: sortOrder as any});
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="nextBillingDate-asc">Next Billing (Soon)</option>
                  <option value="nextBillingDate-desc">Next Billing (Later)</option>
                  <option value="amount-desc">Highest Value</option>
                  <option value="amount-asc">Lowest Value</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center">
          <div className="flex space-x-2">
            {selectedSubscriptions.length > 0 && (
              <>
                <button
                  onClick={() => handleBulkAction('cancel')}
                  className="px-3 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200"
                >
                  Cancel Selected ({selectedSubscriptions.length})
                </button>
                <button
                  onClick={() => handleBulkAction('suspend')}
                  className="px-3 py-2 text-sm font-medium text-orange-700 bg-orange-100 border border-orange-300 rounded-md hover:bg-orange-200"
                >
                  Suspend Selected
                </button>
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-md hover:bg-green-200"
                >
                  Activate Selected
                </button>
              </>
            )}
          </div>
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">User Subscriptions</h3>
              <p className="mt-1 text-sm text-gray-500">Manage all user subscriptions and billing</p>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Subscription Management</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={selectedSubscriptions.length === subscriptions.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSubscriptions(subscriptions.map(s => s._id));
                      } else {
                        setSelectedSubscriptions([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Billing</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auto Renew</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscriptions.map((subscription) => (
                <tr key={subscription._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedSubscriptions.includes(subscription._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSubscriptions([...selectedSubscriptions, subscription._id]);
                        } else {
                          setSelectedSubscriptions(selectedSubscriptions.filter(id => id !== subscription._id));
                        }
                      }}
                    />
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {subscription.username}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {subscription.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {subscription.subscription.plan.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {subscription.subscription.plan.code}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                        {subscription.subscription.billingCycle}
                      </span>
                    </div>
                    {subscription.subscription.isTrialActive && (
                      <div className="text-xs text-orange-500 mt-1">
                        Trial ends: {formatDate(subscription.subscription.trialEndsAt)}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(subscription.subscription.status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(subscription.subscription.status)}`}>
                        {subscription.subscription.status}
                      </span>
                    </div>
                    {subscription.subscription.isTrialActive && (
                      <div className="text-xs text-blue-500 mt-1">
                        Trial ends: {formatDate(subscription.subscription.trialEndsAt)}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(subscription.totalSpent)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {subscription.subscription.plan.name}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {subscription.subscription.endDate ? formatDate(subscription.subscription.endDate) : 'N/A'}
                    </div>
                    {subscription.paymentMethod && (
                      <div className="text-xs text-gray-500 mt-1 capitalize">
                        {subscription.paymentMethod.type}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      subscription.subscription.autoRenew 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {subscription.subscription.autoRenew ? 'Yes' : 'No'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-gray-500">
                      {subscription.subscription.usage ? (
                        <>
                          <div>Downloads: {subscription.subscription.usage.downloadsThisMonth}</div>
                          <div>Uploads: {subscription.subscription.usage.uploadsThisMonth}</div>
                          <div>Storage: {(subscription.subscription.usage.storageUsedMB / 1024).toFixed(1)}GB</div>
                        </>
                      ) : (
                        <div>No usage data</div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="text-gray-600 hover:text-gray-900"
                      title="Manage Subscription"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(startIndex + subscriptions.length, pagination.totalRecords)}</span> of{' '}
                  <span className="font-medium">{pagination.totalRecords}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    if (pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNum === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}