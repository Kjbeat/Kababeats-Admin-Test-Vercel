import { useState } from 'react';
import { Download, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SubscriptionManagementFilters } from '@/components/subscriptions/SubscriptionManagementFilters';
import { SubscriptionManagementTable } from '@/components/subscriptions/SubscriptionManagementTable';
import { SubscriptionStats } from '@/components/subscriptions/SubscriptionStats';
import { useSubscriptionManagement } from '@/hooks/useSubscriptions';
import { SubscriptionManagementFiltersType } from '@/types/subscription';
import { useAuth } from '@/contexts/AuthContext';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';

export function SubscriptionManagementPage() {
  const { hasPermission } = useAuth();
  const [filters, setFilters] = useState<SubscriptionManagementFiltersType>({
    page: 1,
    limit: 20,
  });

  // API hooks
  const { data: subscriptionData, isLoading, error, refetch } = useSubscriptionManagement(filters);

  const subscriptions = subscriptionData?.data || [];
  const pagination = subscriptionData?.pagination;
  const metrics = subscriptionData?.metrics;

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('SubscriptionManagementPage - subscriptionData:', subscriptionData);
    console.log('SubscriptionManagementPage - subscriptions:', subscriptions);
    console.log('SubscriptionManagementPage - pagination:', pagination);
    console.log('SubscriptionManagementPage - metrics:', metrics);
  }

  const handleFiltersChange = (newFilters: SubscriptionManagementFiltersType) => {
    console.log('🔄 Filter changed from:', filters, 'to:', newFilters);
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
    });
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export subscriptions');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">User Subscriptions</h1>
              <p className="text-slate-600 mt-1">
                Monitor and manage all user subscriptions
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="border-slate-300 hover:bg-slate-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {hasPermission('users.view') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="border-slate-300 hover:bg-slate-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Metrics/Stats */}
        {metrics && <SubscriptionStats metrics={metrics} />}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-medium text-slate-900">Search & Filters</h3>
          </div>
          <div className="p-6">
            <SubscriptionManagementFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading subscriptions
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {error.message || 'An error occurred while loading subscriptions.'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="mt-3 text-red-700 border-red-300 hover:bg-red-50"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Subscriptions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-slate-900">User Subscriptions</h3>
                <p className="text-sm text-slate-600">
                  {pagination?.total || 0} total users • Page {pagination?.page || 1} of {pagination?.pages || 1}
                </p>
              </div>
              <div className="text-sm text-slate-500">
                Showing {subscriptions.length} of {pagination?.total || 0} users
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <SubscriptionManagementTable
              subscriptions={subscriptions}
              loading={isLoading}
            />
          </div>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.page > 1) {
                          handlePageChange(pagination.page - 1);
                        }
                      }}
                      className={pagination.page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const startPage = Math.max(1, pagination.page - 2);
                    const pageNum = startPage + i;

                    if (pageNum > pagination.pages) return null;

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(pageNum);
                          }}
                          isActive={pageNum === pagination.page}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  {pagination.pages > 5 && pagination.page < pagination.pages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {pagination.pages > 5 && pagination.page < pagination.pages - 1 && (
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(pagination.pages);
                        }}
                        className="cursor-pointer"
                      >
                        {pagination.pages}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.page < pagination.pages) {
                          handlePageChange(pagination.page + 1);
                        }
                      }}
                      className={pagination.page >= pagination.pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
