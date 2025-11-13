import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Music, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Crown,
  Download,
  ShoppingCart,
  UserCheck
} from 'lucide-react';

import { apiService } from '@/services/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

interface DashboardStats {
  // User Metrics
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  userGrowthRate: number;
  
  // Content Metrics
  totalBeats: number;
  newBeatsThisMonth: number;
  totalDownloads: number;
  totalUploads: number;
  
  // Financial Metrics
  totalRevenue: number;
  monthlyRevenue: number;
  dailyRevenue: number;
  averageOrderValue: number;
  
  // Sales Metrics
  totalSales: number;
  salesThisMonth: number;
  topSellingBeats: Array<{
    id: string;
    title: string;
    producer: string;
    sales: number;
    revenue: number;
  }>;
  
  // Subscription Metrics
  totalSubscribers: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  cancelledSubscriptions: number;
  subscriptionRevenue: number;
  
  // Engagement Metrics
  totalPlays: number;
  averageSessionTime: number;
  mostPlayedGenres: Array<{
    genre: string;
    plays: number;
  }>;
  
  // Producer Metrics
  topProducers: Array<{
    id: string;
    username: string;
    totalBeats: number;
    totalSales: number;
    revenue: number;
  }>;
  
  // Recent Activity
  recentActivity: Array<{
    id: string;
    type: 'user_registration' | 'beat_upload' | 'purchase' | 'subscription' | 'payout';
    description: string;
    timestamp: string;
    amount?: number;
  }>;
  
  // System Health
  systemStatus: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: string;
    lastBackup: string;
    errorRate: number;
    responseTime: number;
  };
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
}

function StatCard({ title, value, change, changeType = 'neutral', icon: Icon, color = 'blue' }: StatCardProps) {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={cn('p-3 rounded-md', `bg-${color}-500`)}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {change && (
                  <div className={cn('ml-2 flex items-baseline text-sm font-semibold', changeColors[changeType])}>
                    {change}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiService.getDashboardStats() as Promise<DashboardStats>,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
            <div className="mt-2 text-sm text-red-700">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatGrowthRate = (rate: number) => {
    return `${rate >= 0 ? '+' : ''}${rate.toFixed(1)}%`;
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Comprehensive overview of your platform's performance, users, and revenue
        </p>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers?.toLocaleString() || '0'}
          change={stats?.userGrowthRate ? formatGrowthRate(stats.userGrowthRate) : undefined}
          changeType={stats?.userGrowthRate && stats.userGrowthRate > 0 ? 'positive' : 'negative'}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Users"
          value={stats?.activeUsers?.toLocaleString() || '0'}
          change={`${stats?.newUsersThisMonth || 0} new this month`}
          changeType="positive"
          icon={UserCheck}
          color="green"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          change={`${formatCurrency(stats?.monthlyRevenue || 0)} this month`}
          changeType="positive"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Total Beats"
          value={stats?.totalBeats?.toLocaleString() || '0'}
          change={`${stats?.newBeatsThisMonth || 0} new this month`}
          changeType="positive"
          icon={Music}
          color="purple"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Sales"
          value={stats?.totalSales?.toLocaleString() || '0'}
          change={`${stats?.salesThisMonth || 0} this month`}
          changeType="positive"
          icon={ShoppingCart}
          color="orange"
        />
        <StatCard
          title="Subscriptions"
          value={stats?.totalSubscribers?.toLocaleString() || '0'}
          change={`${stats?.activeSubscriptions || 0} active`}
          changeType="positive"
          icon={Crown}
          color="yellow"
        />
        <StatCard
          title="Total Downloads"
          value={stats?.totalDownloads?.toLocaleString() || '0'}
          icon={Download}
          color="indigo"
        />
        <StatCard
          title="Avg Order Value"
          value={formatCurrency(stats?.averageOrderValue || 0)}
          icon={TrendingUp}
          color="pink"
        />
      </div>
    </div>
  );
}
