/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { MoreHorizontal, Eye, UserX, UserCheck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/DropdownMenu';
import { User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useUserSubscriptions } from '@/hooks/useUserSubscriptions';

type TableColumn<T> = {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
};

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
}: UserTableProps) {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  
  // Extract user IDs for subscription data fetching
  const userIds = users.map(user => user._id);
  const { data: subscriptionsData, isLoading: subscriptionsLoading } = useUserSubscriptions(userIds);
  
  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('UserTable - users:', users);
    console.log('UserTable - loading:', loading);
    console.log('UserTable - userIds:', userIds);
    console.log('UserTable - subscriptionsData:', subscriptionsData);
    console.log('UserTable - subscriptionsLoading:', subscriptionsLoading);
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
      key: 'subscription',
      label: 'Subscription',
      render: (_, user: User) => {
        // First check if subscription data came directly with the user
        const userSub = (user as any)?.subscription;
        const batchUserSubscription = subscriptionsData?.[user._id];
        
        if (subscriptionsLoading) {
          return (
            <div className="text-sm">
              <Badge variant="outline" className="text-xs">
                Loading...
              </Badge>
            </div>
          );
        }
        
        // Use batch subscription data if available, otherwise use inline data
        const subscriptionInfo = batchUserSubscription || userSub;
        
        if (!subscriptionInfo) {
          return (
            <div className="text-sm">
              <Badge variant="secondary" className="text-xs">
                Free
              </Badge>
            </div>
          );
        }
        
        const getSubscriptionVariant = (code: string) => {
          switch (code.toUpperCase()) {
            case 'PRO': return 'default';
            case 'BASIC': return 'secondary'; 
            case 'PREMIUM': return 'default';
            case 'FREE': return 'secondary';
            default: return 'outline';
          }
        };
        
        return (
          <div className="text-sm">
            <Badge variant={getSubscriptionVariant(subscriptionInfo.planCode)} className="text-xs font-medium">
              {subscriptionInfo.planCode}
            </Badge>
            <div className="text-xs text-muted-foreground mt-1">
              {subscriptionInfo.status?.toLowerCase()} • {subscriptionInfo.billingCycle}
            </div>
          </div>
        );
      },
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
                  onClick={() => console.log('Suspend user:', user._id)}
                  className="text-destructive focus:text-destructive"
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Suspend User
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem 
                  onClick={() => console.log('Activate user:', user._id)}
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
