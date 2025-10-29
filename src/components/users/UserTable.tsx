/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { MoreHorizontal, Eye, Edit, UserX, UserCheck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type TableColumn<T> = {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
};
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/DropdownMenu';
import { User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface UserTableProps {
  users: User[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  onSort?: (key: keyof User, direction: 'asc' | 'desc') => void;
  onViewUser?: (user: User) => void;
  onEditUser?: (user: User) => void;
  onSuspendUser?: (user: User) => void;
  onActivateUser?: (user: User) => void;
  sortKey?: keyof User;
  sortDirection?: 'asc' | 'desc';
}

export function UserTable({
  users,
  loading,
  pagination,
  onSort,
  onViewUser,
  onEditUser,
  onSuspendUser,
  onActivateUser,
  sortKey,
  sortDirection,
}: UserTableProps) {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  
  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('UserTable - users:', users);
    console.log('UserTable - loading:', loading);
    console.log('UserTable - users.length:', users?.length);
  }

  const getStatusBadge = (user: User) => {
    if (!user.isActive) {
      return <Badge variant="destructive">Suspended</Badge>;
    }
    if (!user.isVerified) {
      return <Badge variant="secondary">Unverified</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: 'destructive',
      user: 'secondary',
    } as const;

    return (
      <Badge variant={variants[role as keyof typeof variants] || 'secondary'}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const columns: TableColumn<User>[] = [
    {
      key: 'avatar',
      label: '',
      render: (_, user) => (
        <Avatar className="h-8 w-8">
          {user.avatar ? (
            <img src={user.avatar} alt={`${user.firstName || user.username} avatar`} />
          ) : (
            <span>{user.firstName?.[0] || user.username[0] || 'U'}</span>
          )}
        </Avatar>
      ),
      className: 'w-12',
    },
    {
      key: 'username',
      label: 'User',
      sortable: true,
      render: (_, user) => (
        <div className="space-y-1">
          <div className="font-medium">{user.username}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
          {user.firstName && user.lastName && (
            <div className="text-sm text-muted-foreground">
              {user.firstName} {user.lastName}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (role) => getRoleBadge(role as string),
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (_, user) => getStatusBadge(user),
    },
    {
      key: 'isVerified',
      label: 'Verified',
      sortable: true,
      render: (isVerified) => (
        <Badge variant={isVerified ? 'default' : 'secondary'}>
          {isVerified ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      sortable: true,
      render: (lastLogin) => (
        <div className="text-sm">
          {lastLogin ? format(new Date(lastLogin), 'MMM dd, yyyy') : 'Never'}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Joined',
      sortable: true,
      render: (createdAt) => (
        <div className="text-sm">
          {createdAt ? format(new Date(createdAt), 'MMM dd, yyyy') : 'Unknown'}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, user) => (
        <DropdownMenu
          trigger={
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          }
          className="w-48"
        >
          {hasPermission('users.view') && (
            <DropdownMenuItem onClick={() => navigate(`/users/${user._id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
          )}
         {/*  {hasPermission('users.edit') && (
            <DropdownMenuItem onClick={() => onEditUser?.(user)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </DropdownMenuItem>
          )} */}
          <DropdownMenuSeparator />
          {hasPermission('users.suspend') && (
            <>
              {user.isActive ? (
                <DropdownMenuItem 
                  onClick={() => onSuspendUser?.(user)}
                  className="text-destructive focus:text-destructive"
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Suspend User
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem 
                  onClick={() => onActivateUser?.(user)}
                  className="text-green-600 focus:text-green-600"
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Activate User
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenu>
      ),
      className: 'w-12',
    },
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key} className={column.className}>
              {column.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center py-8">
              Loading...
            </TableCell>
          </TableRow>
        ) : users && users.length > 0 ? (
          users.map((user) => (
            <TableRow key={user._id}>
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.render ? column.render(user[column.key as keyof User], user) : user[column.key as keyof User]}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center py-8">
              No users found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
