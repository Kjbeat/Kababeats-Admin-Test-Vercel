import { useState } from 'react';
import { Download, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserFiltersComponent } from '@/components/users/UserFilters';
import { UserTable } from '@/components/users/UserTable';
// import { UserDetailsModal } from '@/components/users/UserDetailsModal';
import { UserEditModal } from '@/components/users/UserEditModal';
import { UserSuspendModal } from '@/components/users/UserSuspendModal';
import { useUsers, useUpdateUser, useSuspendUser, useActivateUser } from '@/hooks/useUsers';
import { User, UserFilters } from '@/types';
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

export function UsersPage() {
  const { hasPermission } = useAuth();
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 10,
  });
  const [sortKey, setSortKey] = useState<keyof User>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  // API hooks
  const { data: usersData, isLoading, error, refetch } = useUsers(filters);
  const updateUserMutation = useUpdateUser();
  const suspendUserMutation = useSuspendUser();
  const activateUserMutation = useActivateUser();

  const users = usersData?.data || [];
  const pagination = usersData?.pagination;
  
  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('UsersPage - usersData:', usersData);
    console.log('UsersPage - users:', users);
    console.log('UsersPage - pagination:', pagination);
    console.log('UsersPage - isLoading:', isLoading);
    console.log('UsersPage - error:', error);
  }

  const handleFiltersChange = (newFilters: UserFilters) => {
    console.log('🔄 Filter changed from:', filters, 'to:', newFilters);
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
    });
  };

  const handleSort = (key: keyof User, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
    // Note: In a real implementation, you'd pass sort parameters to the API
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    // Navigate to user details page instead of modal
    // This would typically use React Router navigation
    console.log('View user:', user);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleSuspendUser = (user: User) => {
    setSelectedUser(user);
    setShowSuspendModal(true);
  };

  const handleActivateUser = (user: User) => {
    setSelectedUser(user);
    activateUserMutation.mutate(user._id);
  };


  const handleSaveUser = async (id: string, data: Partial<User>) => {
    await updateUserMutation.mutateAsync({ id, data });
  };

  const handleSuspendUserConfirm = async (id: string, reason: string) => {
    await suspendUserMutation.mutateAsync({ id, reason });
  };


  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export users');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="space-y-6 p-6">
        {/* Clean Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
              <p className="text-slate-600 mt-1">
                Manage user accounts and permissions
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


        {/* Clean Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-medium text-slate-900">Search & Filters</h3>
          </div>
          <div className="p-6">
            <UserFiltersComponent
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
          </div>
        </div>

        {/* Simple Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading users
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {error.message || 'An error occurred while loading users.'}
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

        {/* Clean Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-slate-900">Users</h3>
                <p className="text-sm text-slate-600">
                  {pagination?.total || 0} total users • Page {pagination?.page || 1} of {pagination?.pages || 1}
                </p>
              </div>
              <div className="text-sm text-slate-500">
                Showing {users.length} of {pagination?.total || 0} users
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <UserTable
              users={users}
              loading={isLoading}
              pagination={pagination ? {
                page: pagination.page,
                limit: pagination.limit,
                total: pagination.total,
                onPageChange: handlePageChange,
              } : undefined}
              onSort={handleSort}
              onViewUser={hasPermission('users.view') ? handleViewUser : undefined}
              onEditUser={hasPermission('users.edit') ? handleEditUser : undefined}
              onSuspendUser={hasPermission('users.suspend') ? handleSuspendUser : undefined}
              onActivateUser={hasPermission('users.suspend') ? handleActivateUser : undefined}
              sortKey={sortKey}
              sortDirection={sortDirection}
            />
          </div>
        </div>

        {/* Simple Pagination */}
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

      {/* Modals */}
      {/* UserDetailsModal removed - using UserDetailsPage instead */}

      <UserEditModal
        user={selectedUser}
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onSave={handleSaveUser}
        loading={updateUserMutation.isPending}
      />

      <UserSuspendModal
        user={selectedUser}
        open={showSuspendModal}
        onOpenChange={setShowSuspendModal}
        onSuspend={handleSuspendUserConfirm}
        loading={suspendUserMutation.isPending}
      />

      </div>
    </div>
  );
}
