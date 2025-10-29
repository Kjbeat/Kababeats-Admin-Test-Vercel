/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { 
  Shield, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Edit, 
  Trash2, 
  UserCheck,
  UserX,
  AlertCircle,
  Crown,
  User,
  Lock
} from 'lucide-react';
import { AdminUser, AdminRole, AdminPermission } from '@/types';
import { useAdminUsers, useCreateAdmin, useUpdateAdmin, useDeleteAdmin, useChangeAdminPassword } from '@/hooks/useAdminUsers';

interface AdminUserFilters {
  search: string;
  role: string;
  status: string;
  page: number;
  limit: number;
}

interface CreateAdminForm {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  permissions: AdminPermission[];
}

export function AdminUsersPage() {
  const [filters, setFilters] = useState<AdminUserFilters>({
    search: '',
    role: 'all',
    status: 'all',
    page: 1,
    limit: 10
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [searchTerm, setSearchTerm] = useState(filters.search);

  // React Query hooks
  const { data: adminUsersData, isLoading, refetch } = useAdminUsers(filters);
  const createAdminMutation = useCreateAdmin();
  const updateAdminMutation = useUpdateAdmin();
  const deleteAdminMutation = useDeleteAdmin();
  const changePasswordMutation = useChangeAdminPassword();

  const adminUsers = adminUsersData || []; // adminUsersData is already the array of users

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('AdminUsersPage - adminUsersData:', adminUsersData);
    console.log('AdminUsersPage - adminUsers:', adminUsers);
    console.log('AdminUsersPage - isLoading:', isLoading);
  }

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      handleFilterChange({ search: searchTerm });
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);   

  const handleFilterChange = (newFilters: Partial<any>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleCreateAdmin = async (formData: CreateAdminForm) => {
    try {
      await createAdminMutation.mutateAsync(formData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating admin user:', error);
    }
  };

  const handleUpdateAdmin = async (id: string, data: Partial<AdminUser>) => {
    try {
      await updateAdminMutation.mutateAsync({ id, data });
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating admin user:', error);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    try {
      await deleteAdminMutation.mutateAsync(id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting admin user:', error);
    }
  };

  const handleChangePassword = async (id: string, newPassword: string) => {
    try {
      await changePasswordMutation.mutateAsync({ id, newPassword });
      setShowPasswordModal(false);
    } catch (error) {
      console.error('Error changing password:', error);
    }
  };

  const getRoleIcon = (role: AdminRole) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadge = (role: AdminRole) => {
    const variants: Record<AdminRole, string> = {
      super_admin: 'bg-yellow-100 text-yellow-800',
      admin: 'bg-blue-100 text-blue-800',
      moderator: 'bg-green-100 text-green-800',
      content_manager: 'bg-purple-100 text-purple-800',
      sales_admin: 'bg-orange-100 text-orange-800',
      finance_admin: 'bg-red-100 text-red-800',
      support_admin: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${variants[role] || 'bg-gray-100 text-gray-800'}`}>
        {getRoleIcon(role)}
        <span className="ml-1 capitalize">{role.replace('_', ' ')}</span>
      </span>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
        <UserCheck className="h-3 w-3 mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
        <UserX className="h-3 w-3 mr-1" />
        Inactive
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading admin users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage admin users and their permissions
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Admin
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search admins..."
                //value={filters.search}
                //onChange={(e) => setFilters({...filters, search: e.target.value})}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({...filters, role: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({
                search: '',
                role: 'all',
                status: 'all',
                page: 1,
                limit: 10
              })}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Admin Users Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Admin Users</h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage admin users and their access permissions
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(adminUsers) && adminUsers.map((admin: AdminUser) => (
                <tr key={admin._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <Shield className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {admin.firstName} {admin.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{admin.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(admin.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(admin.isActive)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {admin.lastLogin ? formatDate(admin.lastLogin) : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(admin.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedAdmin(admin);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Admin"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedAdmin(admin);
                          setShowPasswordModal(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Change Password"
                      >
                        <Lock className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedAdmin(admin);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Admin"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <CreateAdminModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAdmin}
        />
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedAdmin && (
        <EditAdminModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={(data) => handleUpdateAdmin(selectedAdmin._id, data)}
          admin={selectedAdmin}
        />
      )}

      {/* Delete Admin Modal */}
      {showDeleteModal && selectedAdmin && (
        <DeleteAdminModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => handleDeleteAdmin(selectedAdmin._id)}
          admin={selectedAdmin}
        />
      )}

      {/* Change Password Modal */}
      {showPasswordModal && selectedAdmin && (
        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onSubmit={(newPassword) => handleChangePassword(selectedAdmin._id, newPassword)}
          admin={selectedAdmin}
        />
      )}
    </div>
  );
}

// Create Admin Modal Component
function CreateAdminModal({ isOpen, onClose, onSubmit }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAdminForm) => void;
}) {
  const [formData, setFormData] = useState<CreateAdminForm>({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'moderator',
    permissions: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getRolePermissions = (role: AdminRole): AdminPermission[] => {
    const rolePermissions: Record<AdminRole, AdminPermission[]> = {
      super_admin: [
        'users.view', 'users.create', 'users.edit', 'users.delete', 'users.suspend', 'users.impersonate',
        'beats.view', 'beats.moderate', 'beats.approve', 'beats.reject', 'beats.delete',
        'playlists.view', 'playlists.manage',
        'content.manage', 'content.homepage', 'content.categories',
        'sales.view', 'sales.manage',
        'analytics.view',
        'logs.view',
        'notifications.send',
        'settings.manage',
        'payouts.manage',
        'admin_users.manage',
        'system.settings'
      ],
      admin: [
        'users.view', 'users.create', 'users.edit', 'users.delete', 'users.suspend', 'users.impersonate',
        'beats.view', 'beats.moderate', 'beats.approve', 'beats.reject', 'beats.delete',
        'playlists.view', 'playlists.manage',
        'content.manage', 'content.homepage', 'content.categories',
        'sales.view', 'sales.manage',
        'analytics.view',
        'logs.view',
        'notifications.send',
        'settings.manage',
        'payouts.manage',
        'admin_users.manage',
        'system.settings'
      ],
      moderator: [
        'users.view', 'users.suspend',
        'beats.view', 'beats.moderate', 'beats.approve', 'beats.reject',
        'playlists.view',
        'content.manage', 'content.homepage', 'content.categories',
        'analytics.view',
        'logs.view'
      ],
      content_manager: [
        'beats.view',
        'content.manage', 'content.homepage', 'content.categories',
        'analytics.view'
      ],
      sales_admin: [
        'users.view',
        'beats.view',
        'sales.view', 'sales.manage',
        'analytics.view',
        'payouts.manage'
      ],
      finance_admin: [
        'sales.view', 'sales.manage',
        'analytics.view',
        'payouts.manage',
        'settings.manage'
      ],
      support_admin: [
        'users.view', 'users.impersonate',
        'beats.view',
        'logs.view',
        'notifications.send'
      ]
    };

    return rolePermissions[role] || [];
  };

  const handleRoleChange = (role: AdminRole) => {
    setFormData({
      ...formData,
      role,
      permissions: getRolePermissions(role)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Create Admin User</h3>
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Username</label>
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Password</label>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <select
                        value={formData.role}
                        onChange={(e) => handleRoleChange(e.target.value as AdminRole)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      >
                        <option value="moderator">Moderator (Limited Access)</option>
                        <option value="admin">Admin (Full Access)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Create Admin
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Edit Admin Modal Component
function EditAdminModal({ isOpen, onClose, onSubmit, admin }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<AdminUser>) => void;
  admin: AdminUser;
}) {
  const [formData, setFormData] = useState<Partial<AdminUser>>({
    firstName: admin.firstName,
    lastName: admin.lastName,
    email: admin.email,
    role: admin.role,
    isActive: admin.isActive
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <Edit className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Admin User</h3>
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value as AdminRole})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      >
                        <option value="moderator">Moderator (Limited Access)</option>
                        <option value="admin">Admin (Full Access)</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">Active</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Update Admin
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Delete Admin Modal Component
function DeleteAdminModal({ isOpen, onClose, onConfirm, admin }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  admin: AdminUser;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Admin User</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete <strong>{admin.firstName} {admin.lastName}</strong>? 
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={onConfirm}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Delete
            </button>
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Change Password Modal Component
function ChangePasswordModal({ isOpen, onClose, onSubmit, admin }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newPassword: string) => void;
  admin: AdminUser;
}) {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    onSubmit(formData.newPassword);
    setFormData({ newPassword: '', confirmPassword: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                  <Lock className="h-6 w-6 text-green-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Change Password</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Change password for <strong>{admin.firstName} {admin.lastName}</strong>
                    </p>
                  </div>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">New Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.newPassword}
                          onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                          className="mt-1 block w-full pr-10 border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                          className="mt-1 block w-full pr-10 border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    {error && (
                      <div className="rounded-md bg-red-50 p-3">
                        <div className="text-sm text-red-700">{error}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Change Password
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
