import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Music, 
  DollarSign, 
  AlertCircle,
  Crown,
  ShoppingCart,
  TrendingUp,
  Activity,
  FileAudio,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2,
  X
} from 'lucide-react';

import { apiService } from '@/services/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ProgressionChart } from '@/components/charts/ProgressionChart';
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
  totalPlatformFees?: number;
  totalSubscriptionRevenue?: number;
  totalSales?: number;
  monthlySales?: number;
  pendingBeats?: number;
  flaggedContent?: number;
  recentActivity?: RecentActivityItem[];
  activeSubscriptions?: number;
  progressionData?: Array<{
    date: string;
    users: number;
    subscriptions: number;
    beats: number;
    sales: number;
  }>;
  // optional future field used by the UI
  userGrowthRate?: number;
}

interface DashboardCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'emerald' | 'blue' | 'orange' | 'purple' | 'amber' | 'red';
  trend?: 'up' | 'down' | 'neutral';
  onClick?: () => void;
}

function DashboardCard({ title, value, subValue, icon: Icon, color, trend, onClick }: DashboardCardProps) {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md",
        onClick && "cursor-pointer hover:border-blue-300"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
        </div>
        <div className={cn("p-3 rounded-lg", colorClasses[color])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {subValue && (
        <div className="mt-4 flex items-center text-sm">
          <span className={cn("font-medium", trend === 'up' ? 'text-green-600' : 'text-gray-600')}>
            {subValue}
          </span>
        </div>
      )}
    </div>
  );
}

function ActivityItem({ item }: { item: RecentActivityItem }) {
  const isSale = !!item.amount;
  const buyerName = typeof item.buyerId === 'object' ? item.buyerId?.username : 'User';
  const beatTitle = typeof item.beatId === 'object' ? item.beatId?.title : 'a beat';
  
  return (
    <div className="p-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors">
      <div className={cn("mt-1 p-1.5 rounded-full", isSale ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600")}>
        {isSale ? <DollarSign className="h-3 w-3" /> : <Users className="h-3 w-3" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">
          {isSale ? (
            <>
              <span className="font-medium">{buyerName || 'Someone'}</span> purchased 
              <span className="font-medium"> {beatTitle || 'a beat'}</span>
            </>
          ) : (
            <>
              <span className="font-medium">{buyerName || 'User'}</span> joined the platform
            </>
          )}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
        </p>
      </div>
      {isSale && item.amount && (
        <div className="text-sm font-medium text-green-600">
          +${item.amount}
        </div>
      )}
    </div>
  );
}

function RevenueBreakdownModal({ onClose, stats }: { onClose: () => void, stats?: BackendDashboardStats }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Revenue Breakdown</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                <p className="text-sm text-emerald-800 font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-emerald-700">{formatCurrency(stats?.totalRevenue ?? 0)}</p>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Sources</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Platform Fees (from Sales)</span>
                    <span className="font-medium text-gray-900">{formatCurrency(stats?.totalPlatformFees ?? 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subscription Revenue</span>
                    <span className="font-medium text-gray-900">{formatCurrency(stats?.totalSubscriptionRevenue ?? 0)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Period</h4>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-medium text-green-600">+{formatCurrency(stats?.monthlyRevenue ?? 0)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FullLogsModal({ onClose }: { onClose: () => void }) {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => apiService.getAuditLogs({ limit: 50 }),
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">System Logs</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mt-2 max-h-[60vh] overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* @ts-ignore - logs type might be loose */}
                    {logs?.data?.map((log: any, idx: number) => (
                      <tr key={log._id || idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.action}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.adminId?.username || log.userId?.username || 'System'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{JSON.stringify(log.details || {})}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {(!logs?.data || logs.data.length === 0) && (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No logs found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
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
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1, // Only retry once to avoid long waits
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back, Admin. Here's what's happening on Kababeats today.
          </p>
        </div>
        <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-md border border-gray-200 self-start sm:self-auto">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
         {/* Users */}
         <DashboardCard 
            title="Total Users" 
            value={(stats?.totalUsers ?? 0).toLocaleString()}
            subValue={`${stats?.activeUsers ?? 0} active now`}
            icon={Users}
            color="blue"
         />
         {/* Sales */}
         <DashboardCard 
            title="Total Sales" 
            value={(stats?.totalSales ?? 0).toLocaleString()}
            subValue={`+${stats?.monthlySales ?? 0} this month`}
            icon={ShoppingCart}
            color="orange"
         />
         {/* Subscriptions */}
         <DashboardCard 
            title="Active Subs" 
            value={(stats?.activeSubscriptions ?? 0).toLocaleString()}
            subValue="Premium Members"
            icon={Crown}
            color="purple"
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Chart Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Platform Growth</h3>
              <select className="text-sm border-gray-200 rounded-md text-gray-500">
                <option>Last 30 Days</option>
                <option>Last 6 Months</option>
                <option>Year to Date</option>
              </select>
            </div>
            <ProgressionChart data={stats?.progressionData ?? []} loading={isLoading} />
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
           {/* Recent Activity */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                <Activity className="h-4 w-4 text-gray-400" />
              </div>
              <div className="divide-y divide-gray-50">
                {stats?.recentActivity?.map((item, i) => (
                  <ActivityItem key={i} item={item} />
                ))}
                {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                  <div className="p-6 text-center text-gray-500 text-sm">No recent activity</div>
                )}
              </div>
           </div>
        </div>
      </div>

      {/* Modals */}
    </div>
  );
}
