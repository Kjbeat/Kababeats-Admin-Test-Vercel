import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Music, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  AlertCircle,
  Crown,
  Download,
  Upload,
  ShoppingCart,
  UserCheck,
  CreditCard,
  Star
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

      {/* Charts and Analytics Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Selling Beats */}
        <div className="bg-white shadow-lg rounded-lg border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Top Selling Beats</h3>
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          <div className="p-6">
            {stats?.topSellingBeats && stats.topSellingBeats.length > 0 ? (
              <div className="space-y-4">
                {stats.topSellingBeats.slice(0, 5).map((beat, index) => (
                  <div key={beat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">#{index + 1}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{beat.title}</p>
                        <p className="text-sm text-gray-500">by {beat.producer}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{beat.sales} sales</p>
                      <p className="text-sm text-green-600">{formatCurrency(beat.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No sales data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Producers */}
        <div className="bg-white shadow-lg rounded-lg border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Top Producers</h3>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <div className="p-6">
            {stats?.topProducers && stats.topProducers.length > 0 ? (
              <div className="space-y-4">
                {stats.topProducers.slice(0, 5).map((producer, index) => (
                  <div key={producer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">#{index + 1}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{producer.username}</p>
                        <p className="text-sm text-gray-500">{producer.totalBeats} beats</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{producer.totalSales} sales</p>
                      <p className="text-sm text-green-600">{formatCurrency(producer.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No producer data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Analytics */}
      <div className="bg-white shadow-lg rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Subscription Overview</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats?.totalSubscribers || 0}</div>
              <div className="text-sm text-gray-500">Total Subscribers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats?.activeSubscriptions || 0}</div>
              <div className="text-sm text-gray-500">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats?.trialSubscriptions || 0}</div>
              <div className="text-sm text-gray-500">Trials</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats?.cancelledSubscriptions || 0}</div>
              <div className="text-sm text-gray-500">Cancelled</div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats?.subscriptionRevenue || 0)}
              </div>
              <div className="text-sm text-gray-500">Monthly Subscription Revenue</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow-lg rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="p-6">
          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="flow-root">
              <ul className="-mb-8">
                {stats.recentActivity.slice(0, 8).map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== stats.recentActivity!.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white",
                            activity.type === 'user_registration' && "bg-blue-500",
                            activity.type === 'beat_upload' && "bg-purple-500",
                            activity.type === 'purchase' && "bg-green-500",
                            activity.type === 'subscription' && "bg-yellow-500",
                            activity.type === 'payout' && "bg-indigo-500"
                          )}>
                            {activity.type === 'user_registration' && <Users className="h-4 w-4 text-white" />}
                            {activity.type === 'beat_upload' && <Upload className="h-4 w-4 text-white" />}
                            {activity.type === 'purchase' && <ShoppingCart className="h-4 w-4 text-white" />}
                            {activity.type === 'subscription' && <Crown className="h-4 w-4 text-white" />}
                            {activity.type === 'payout' && <CreditCard className="h-4 w-4 text-white" />}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-600">{activity.description}</p>
                            {activity.amount && (
                              <p className="text-sm font-semibold text-green-600">
                                {formatCurrency(activity.amount)}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time dateTime={activity.timestamp}>
                              {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                              {new Date(activity.timestamp).toLocaleTimeString()}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white shadow-lg rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={cn(
                  "w-3 h-3 rounded-full mr-3",
                  stats?.systemStatus?.status === 'healthy' ? 'bg-green-400' :
                  stats?.systemStatus?.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                )}>
                </div>
                <span className="text-sm font-medium text-gray-900">System Status</span>
              </div>
              <span className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                stats?.systemStatus?.status === 'healthy' ? 'bg-green-100 text-green-800' :
                stats?.systemStatus?.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
              )}>
                {stats?.systemStatus?.status || 'healthy'}
              </span>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-900">Uptime</div>
              <div className="text-sm text-gray-600">{stats?.systemStatus?.uptime || 'N/A'}</div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-900">Error Rate</div>
              <div className="text-sm text-gray-600">{stats?.systemStatus?.errorRate || 0}%</div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-900">Response Time</div>
              <div className="text-sm text-gray-600">{stats?.systemStatus?.responseTime || 0}ms</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
