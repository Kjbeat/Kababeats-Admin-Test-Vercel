import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Music,
  FileText,
  DollarSign,
  FileSearch,
  Shield,
  BarChart3,
  X,
  List,
  CreditCard,
  Lock,
  ScrollText,
  CreditCard as SubscriptionIcon,
  UserCog,
  // Receipt,
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface SidebarProps {
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: 'analytics.view' },
  { name: 'Users', href: '/users', icon: Users, permission: 'users.view' },
  { name: 'Beats', href: '/beats', icon: Music, permission: 'beats.view' },
  { name: 'Licenses', href: '/licenses', icon: ScrollText, permission: 'licenses.manage' },
  { name: 'Subscriptions', href: '/subscriptions', icon: SubscriptionIcon, permission: 'subscriptions.manage' },
  { name: 'User Subscriptions', href: '/subscription-management', icon: UserCog, permission: 'users.view' },
  { name: 'Curated Playlist', href: '/content', icon: FileText, permission: 'content.manage' },
  { name: 'Sales', href: '/sales', icon: DollarSign, permission: 'sales.view' },
  // { name: 'Transactions', href: '/transactions', icon: Receipt, permission: 'transactions.view' },
  { name: 'Payouts', href: '/payouts', icon: CreditCard, permission: 'payouts.manage' },
  // { name: 'Logs', href: '/logs', icon: FileSearch, permission: 'logs.view' },
];

const adminNavigation = [
  { name: 'Admin Users', href: '/admin-users', icon: Shield, permission: 'admin_users.manage' },
];

export function Sidebar({ onClose }: SidebarProps) {
  const { admin, hasPermission } = useAuth();

  // Show all navigation items, but mark locked ones for users without permission
  const navigationWithLockStatus = navigation.map(item => ({
    ...item,
    isLocked: admin ? !hasPermission(item.permission) : false
  }));

  const adminNavigationWithLockStatus = adminNavigation.map(item => ({
    ...item,
    isLocked: admin ? !hasPermission(item.permission) : false
  }));

  return (
    <div className="flex flex-col h-screen">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">KB</span>
            </div>
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-gray-900">KabaBeats</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto bg-white">
        {/* Main Navigation */}
        <div className="space-y-1">
          {navigationWithLockStatus.map((item) => (
            <div key={item.name} className="relative">
              {item.isLocked ? (
                <div 
                  className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-400 cursor-not-allowed opacity-60"
                  title="You don't have permission to access this page"
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="flex-1">{item.name}</span>
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
              ) : (
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200',
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    )
                  }
                  onClick={onClose}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                      'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </NavLink>
              )}
            </div>
          ))}
        </div>

        {/* Admin Navigation */}
        <div className="pt-4">
          <div className="px-3 mb-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Administration
            </h3>
          </div>
          <div className="space-y-1">
            {adminNavigationWithLockStatus.map((item) => (
              <div key={item.name} className="relative">
                {item.isLocked ? (
                  <div 
                    className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-400 cursor-not-allowed opacity-60"
                    title="You don't have permission to access this page"
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="flex-1">{item.name}</span>
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                ) : (
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200',
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      )
                    }
                    onClick={onClose}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                        'text-gray-400 group-hover:text-gray-500'
                      )}
                    />
                    {item.name}
                  </NavLink>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* User Info */}
      <div className="border-t border-gray-200 p-4 bg-white">
        {admin ? (
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-sm font-medium text-white">
                  {admin.firstName.charAt(0)}{admin.lastName.charAt(0)}
                </span>
              </div>
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {admin.firstName} {admin.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {admin.role.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-sm font-medium text-gray-600">...</span>
              </div>
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate animate-pulse">
                Loading...
              </p>
              <p className="text-xs text-gray-500 truncate">
                Admin User
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
