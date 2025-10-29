import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Music, DollarSign, TrendingUp, Activity, BarChart3, AlertCircle } from 'lucide-react';

import { apiService } from '@/services/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

interface DashboardStats {
  totalUsers?: number;
  totalBeats?: number;
  totalRevenue?: number;
  monthlySales?: number;
  revenueMetrics?: {
    today: number;
    thisMonth: number;
    last7Days: number;
  };
  systemStatus?: {
    pm2: 'online' | 'offline' | 'error';
    server: 'online' | 'offline' | 'error';
    nginx: 'online' | 'offline' | 'error';
    ssl: 'valid' | 'expired' | 'error';
    agenda: 'running' | 'stopped' | 'error';
    database: 'connected' | 'disconnected' | 'error';
    redis: 'connected' | 'disconnected' | 'error';
    mongodb: 'connected' | 'disconnected' | 'error';
    diskSpace: {
      used: number;
      total: number;
      percentage: number;
    };
  };
  recentActivity?: Array<{
    id: string;
    description: string;
    timestamp: string;
  }>;
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

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your platform's performance and activity
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={(stats as DashboardStats)?.totalUsers || 0}
          change="+12%"
          changeType="positive"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Beats"
          value={(stats as DashboardStats)?.totalBeats || 0}
          change="+8%"
          changeType="positive"
          icon={Music}
          color="green"
        />
        <StatCard
          title="Total Revenue"
          value={`$${(stats as DashboardStats)?.totalRevenue?.toLocaleString() || 0}`}
          change="+23%"
          changeType="positive"
          icon={DollarSign}
          color="yellow"
        />
        <StatCard
          title="Monthly Sales"
          value={(stats as DashboardStats)?.monthlySales || 0}
          change="+15%"
          changeType="positive"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          title="Today's Revenue"
          value={`$${(stats as DashboardStats)?.revenueMetrics?.today?.toLocaleString() || 0}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="This Month"
          value={`$${(stats as DashboardStats)?.revenueMetrics?.thisMonth?.toLocaleString() || 0}`}
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Last 7 Days"
          value={`$${(stats as DashboardStats)?.revenueMetrics?.last7Days?.toLocaleString() || 0}`}
          icon={BarChart3}
          color="purple"
        />
      </div>


      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Revenue Overview
              </h3>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Chart visualization coming soon</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Activity */}
      {(stats as DashboardStats)?.recentActivity && (stats as DashboardStats).recentActivity!.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {(stats as DashboardStats).recentActivity!.slice(0, 5).map((activity: { id: string; description: string; timestamp: string }, activityIdx: number) => (
                  <li key={activity.id || `activity-${activityIdx}`}>
                    <div className="relative pb-8">
                      {activityIdx !== (stats as DashboardStats).recentActivity!.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                            <Activity className="h-4 w-4 text-white" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">{activity.description}</p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time dateTime={activity.timestamp}>
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* System Status */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            System Status
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* PM2 Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-900">PM2</span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                (stats as DashboardStats)?.systemStatus?.pm2 === 'online' 
                  ? 'bg-green-100 text-green-800' 
                  : (stats as DashboardStats)?.systemStatus?.pm2 === 'offline'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {(stats as DashboardStats)?.systemStatus?.pm2 || 'online'}
              </span>
            </div>

            {/* Server Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-900">Server</span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                (stats as DashboardStats)?.systemStatus?.server === 'online' 
                  ? 'bg-green-100 text-green-800' 
                  : (stats as DashboardStats)?.systemStatus?.server === 'offline'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {(stats as DashboardStats)?.systemStatus?.server || 'online'}
              </span>
            </div>

            {/* Nginx Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-900">Nginx</span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                (stats as DashboardStats)?.systemStatus?.nginx === 'online' 
                  ? 'bg-green-100 text-green-800' 
                  : (stats as DashboardStats)?.systemStatus?.nginx === 'offline'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {(stats as DashboardStats)?.systemStatus?.nginx || 'online'}
              </span>
            </div>

            {/* SSL Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-900">SSL</span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                (stats as DashboardStats)?.systemStatus?.ssl === 'valid' 
                  ? 'bg-green-100 text-green-800' 
                  : (stats as DashboardStats)?.systemStatus?.ssl === 'expired'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {(stats as DashboardStats)?.systemStatus?.ssl || 'valid'}
              </span>
            </div>

            {/* Agenda Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-900">Agenda</span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                (stats as DashboardStats)?.systemStatus?.agenda === 'running' 
                  ? 'bg-green-100 text-green-800' 
                  : (stats as DashboardStats)?.systemStatus?.agenda === 'stopped'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {(stats as DashboardStats)?.systemStatus?.agenda || 'running'}
              </span>
            </div>

            {/* Database Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-900">Database</span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                (stats as DashboardStats)?.systemStatus?.database === 'connected' 
                  ? 'bg-green-100 text-green-800' 
                  : (stats as DashboardStats)?.systemStatus?.database === 'disconnected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {(stats as DashboardStats)?.systemStatus?.database || 'connected'}
              </span>
            </div>

            {/* Redis Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-900">Redis</span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                (stats as DashboardStats)?.systemStatus?.redis === 'connected' 
                  ? 'bg-green-100 text-green-800' 
                  : (stats as DashboardStats)?.systemStatus?.redis === 'disconnected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {(stats as DashboardStats)?.systemStatus?.redis || 'connected'}
              </span>
            </div>

            {/* MongoDB Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-900">MongoDB</span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                (stats as DashboardStats)?.systemStatus?.mongodb === 'connected' 
                  ? 'bg-green-100 text-green-800' 
                  : (stats as DashboardStats)?.systemStatus?.mongodb === 'disconnected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {(stats as DashboardStats)?.systemStatus?.mongodb || 'connected'}
              </span>
            </div>

            {/* Disk Space Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full ${
                    ((stats as DashboardStats)?.systemStatus?.diskSpace?.percentage || 0) > 90 
                      ? 'bg-red-400' 
                      : ((stats as DashboardStats)?.systemStatus?.diskSpace?.percentage || 0) > 80
                      ? 'bg-yellow-400'
                      : 'bg-green-400'
                  }`}></div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-900">Disk Space</span>
              </div>
              <div className="flex flex-col items-end">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  ((stats as DashboardStats)?.systemStatus?.diskSpace?.percentage || 0) > 90 
                    ? 'bg-red-100 text-red-800' 
                    : ((stats as DashboardStats)?.systemStatus?.diskSpace?.percentage || 0) > 80
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {(stats as DashboardStats)?.systemStatus?.diskSpace?.percentage || 0}%
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {((stats as DashboardStats)?.systemStatus?.diskSpace?.used || 0).toFixed(1)}GB / {((stats as DashboardStats)?.systemStatus?.diskSpace?.total || 0).toFixed(1)}GB
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
