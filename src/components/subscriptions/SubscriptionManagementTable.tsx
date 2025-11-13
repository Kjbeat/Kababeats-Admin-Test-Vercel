import { UserSubscription } from '@/types/subscription';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { CreditCard, Calendar, DollarSign } from 'lucide-react';

interface SubscriptionManagementTableProps {
  subscriptions: UserSubscription[];
  loading?: boolean;
}

export function SubscriptionManagementTable({ subscriptions, loading }: SubscriptionManagementTableProps) {
  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-slate-500">No subscriptions found</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      trial: 'bg-blue-100 text-blue-800 border-blue-200',
      past_due: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };

    return (
      <Badge className={`${statusColors[status] || statusColors.inactive} border`}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Plan
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Billing
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Period
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Spent
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Joined
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {subscriptions.map((user) => (
            <tr key={user._id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.firstName} alt={user.username} />
                    <AvatarFallback>
                      {user.username?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : user.username}
                    </div>
                    <div className="text-sm text-slate-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {user.subscription ? (
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {user.subscription.plan.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {user.subscription.plan.code}
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-slate-500">No active plan</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {user.subscription ? (
                  <div className="flex flex-col gap-1">
                    {getStatusBadge(user.subscription.status)}
                    {user.subscription.isTrialActive && (
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200 border text-xs">
                        Trial
                      </Badge>
                    )}
                  </div>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800 border-gray-200 border">
                    NO SUBSCRIPTION
                  </Badge>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {user.subscription ? (
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-slate-400" />
                    <span className="capitalize">{user.subscription.billingCycle}</span>
                    {user.subscription.autoRenew ? (
                      <span className="text-xs text-green-600">(Auto)</span>
                    ) : (
                      <span className="text-xs text-orange-600">(Manual)</span>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-slate-400">—</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {user.subscription?.currentPeriodStart && user.subscription?.currentPeriodEnd ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-600">
                        {format(new Date(user.subscription.currentPeriodStart), 'MMM dd, yyyy')}
                      </span>
                      <span className="text-xs text-slate-400">
                        to {format(new Date(user.subscription.currentPeriodEnd), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-slate-400">—</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  {formatCurrency(user.totalSpent || 0)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                {format(new Date(user.createdAt), 'MMM dd, yyyy')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
