/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserFilters } from '@/types';

interface UserFiltersProps {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  onClearFilters: () => void;
}

export function UserFiltersComponent({ filters, onFiltersChange, onClearFilters }: UserFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search || '');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        handleFilterChange('search', searchInput || undefined);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Update local search state when filters change externally
  useEffect(() => {
    if (filters.search !== searchInput) {
      setSearchInput(filters.search || '');
    }
  }, [filters.search]);

  const handleFilterChange = useCallback((key: keyof UserFilters, value: any) => {
  const newFilters = { ...filters, page: 1 };

  if (value === undefined || value === null || value === '') {
    delete (newFilters as any)[key]; 
  } else {
    (newFilters as any)[key] = value; 
  }

  onFiltersChange(newFilters);
}, [filters, onFiltersChange]);

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'page' || key === 'limit') return false;
    return value !== undefined && value !== '' && value !== null;
  });

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' },
  ];

  const verifiedOptions = [
    { value: 'all', label: 'All Verification' },
    { value: 'true', label: 'Verified' },
    { value: 'false', label: 'Unverified' },
  ];

  const subscriptionOptions = [
    { value: 'all', label: 'All Subscriptions' },
    { value: 'BASIC', label: 'Basic Plan' },
    { value: 'PRO', label: 'Pro Plan' },
    { value: 'no_subscription', label: 'No Active Subscription' },
  ];

  return (
    <div className="space-y-4">
      {/* Basic Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by email, username, or name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select
            value={filters.role || 'all'}
            onValueChange={(value) => handleFilterChange('role', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value as any)}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.subscriptionType || 'all'}
            onValueChange={(value) => handleFilterChange('subscriptionType', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Subscription" />
            </SelectTrigger>
            <SelectContent>
              {subscriptionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Advanced
          </Button>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <label className="text-sm font-medium mb-2 block">Verification Status</label>
            <Select
              value={
                filters.verified === undefined 
                  ? 'all' 
                  : filters.verified 
                    ? 'true' 
                    : 'false'
              }
              onValueChange={(value) => {
                if (value === 'all') {
                  handleFilterChange('verified', undefined);
                } else {
                  handleFilterChange('verified', value === 'true');
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                {verifiedOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Subscription Plan</label>
            <Select
              value={filters.subscriptionType || 'all'}
              onValueChange={(value) => handleFilterChange('subscriptionType', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Subscription" />
              </SelectTrigger>
              <SelectContent>
                {subscriptionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Date From</label>
            <Input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Date To</label>
            <Input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value || undefined)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Results per page</label>
            <Select
              value={filters.limit?.toString() || '10'}
              onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
