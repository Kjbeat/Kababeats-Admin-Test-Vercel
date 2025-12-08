import React from 'react';
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
  CheckCircle2
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
}

function DashboardCard({ title, value, subValue, icon: Icon, color, trend }: DashboardCardProps) {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
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

interface ActionCardProps {
  title: string;
  count: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'amber' | 'red';
  link: string;
  actionLabel: string;
}

function ActionCard({ title, count, description, icon: Icon, color, link, actionLabel }: ActionCardProps) {
   const colorClasses = {
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };

  return (
    <div className={cn("p-6 rounded-xl border transition-all hover:shadow-md", colorClasses[color] || 'bg-white border-gray-100')}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white rounded-lg bg-opacity-60">
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <span className="text-2xl font-bold text-gray-900">{count}</span>
      </div>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <Link to={link} className="inline-flex items-center text-sm font-medium hover:underline">
        {actionLabel} <ArrowRight className="ml-1 h-4 w-4" />
      </Link>
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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
         {/* Revenue */}
         <DashboardCard 
            title="Total Revenue" 
            value={formatCurrency(stats?.totalRevenue ?? 0)}
            subValue={`+${formatCurrency(stats?.monthlyRevenue ?? 0)} this month`}
            icon={DollarSign}
            color="emerald"
            trend="up"
         />
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
          
          {/* Action Required Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ActionCard 
              title="Pending Beats" 
              count={stats?.pendingBeats ?? 0} 
              description="Beats waiting for approval"
              icon={FileAudio}
              color="amber"
              link="/beats?status=pending"
              actionLabel="Review Queue"
            />
            <ActionCard 
              title="Flagged Content" 
              count={stats?.flaggedContent ?? 0} 
              description="Reports needing attention"
              icon={AlertTriangle}
              color="red"
              link="/content/flagged"
              actionLabel="View Reports"
            />
          </div>

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
              <div className="p-3 bg-gray-50 text-center">
                <Link to="/logs" className="text-xs font-medium text-blue-600 hover:text-blue-800">View Full Log</Link>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
