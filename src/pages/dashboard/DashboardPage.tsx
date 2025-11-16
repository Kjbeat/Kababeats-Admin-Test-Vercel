import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Music, 
  DollarSign, 
  AlertCircle,
  Crown,
  ShoppingCart
} from 'lucide-react';

import { apiService } from '@/services/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

// Backend returns a smaller, simpler shape for dashboard stats. Keep a focused
// interface here and map to UI needs with defensive defaults.
interface RecentActivityItem {
  _id?: string;
  beatId?: { title?: string } | string | null;
  buyerId?: { username?: string } | string | null;
  sellerId?: { username?: string } | string | null;
  amount?: number;
  createdAt?: string | Date;
  [key: string]: unknown;
}

interface BackendDashboardStats {
  totalUsers?: number;
  activeUsers?: number;
  totalBeats?: number;
  publishedBeats?: number;
  totalRevenue?: number;
  monthlyRevenue?: number;
  totalSales?: number;
  monthlySales?: number;
  pendingBeats?: number;
  flaggedContent?: number;
  recentActivity?: RecentActivityItem[];
  // optional future field used by the UI
  userGrowthRate?: number;
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
    // The backend currently returns BackendDashboardStats (see sales.service.getDashboardStats)
    queryFn: () => apiService.getDashboardStats() as Promise<BackendDashboardStats>,
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
          value={(stats?.totalUsers ?? 0).toLocaleString()}
          // Backend doesn't currently return a growth rate; only show if present
          change={typeof stats?.userGrowthRate === 'number' ? formatGrowthRate(stats.userGrowthRate as number) : undefined}
          changeType={typeof stats?.userGrowthRate === 'number' && (stats.userGrowthRate as number) > 0 ? 'positive' : 'neutral'}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          change={`${formatCurrency(stats?.monthlyRevenue ?? 0)} this month`}
          // Show positive when monthlyRevenue > 0 else neutral
          changeType={stats?.monthlyRevenue && stats.monthlyRevenue > 0 ? 'positive' : 'neutral'}
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Total Beats"
          value={(stats?.totalBeats ?? stats?.publishedBeats ?? 0).toLocaleString()}
          change={`${0} new this month`}
          changeType="neutral"
          icon={Music}
          color="purple"
        />
        <StatCard
          title="Total Sales"
          value={(stats?.totalSales ?? 0).toLocaleString()}
          change={`${stats?.monthlySales ?? 0} this month`}
          changeType={stats?.monthlySales && stats.monthlySales > 0 ? 'positive' : 'neutral'}
          icon={ShoppingCart}
          color="orange"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        <StatCard
          title="Active Subscriptions"
          // Backend does not return subscription metrics yet; show 0 and a small hint
          value={(0).toLocaleString()}
          change={`0 total subscribers`}
          changeType="neutral"
          icon={Crown}
          color="yellow"
        />
      </div>
    </div>
  );
}
