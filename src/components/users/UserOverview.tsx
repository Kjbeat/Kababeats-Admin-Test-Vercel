/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { format } from 'date-fns';
import { 
  Mail, 
  Calendar, 
  Shield, 
  User as UserIcon, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  DollarSign,
  Music,
  Play,
  Download,
  Users,
  Star,
  ShoppingCart,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface UserOverviewProps {
  user: any;
  userDetails: any;
  stats: any;
  onRefresh: () => void;
  isLoading: boolean;
}

export function UserOverview({ user, userDetails, stats, onRefresh, isLoading }: UserOverviewProps) {
  const getStatusIcon = (user: any) => {
    if (!user?.isActive) {
      return <XCircle className="h-5 w-5 text-destructive" />;
    }
    if (!user?.isVerified) {
      return <AlertCircle className="h-5 w-5 text-warning" />;
    }
    return <CheckCircle className="h-5 w-5 text-green-600" />;
  };

  const getStatusText = (user: any) => {
    if (!user?.isActive) return 'Suspended';
    if (!user?.isVerified) return 'Unverified';
    return 'Active';
  };

  const getStatusVariant = (user: any) => {
    if (!user?.isActive) return 'destructive';
    if (!user?.isVerified) return 'secondary';
    return 'default';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="space-y-6">
      {/* User Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={`${user?.firstName || user?.username} avatar`}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center rounded-full bg-muted text-lg font-medium text-muted-foreground">
                    {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                  </span>
                )}
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user?.username
                  }
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(user)}
                  <Badge variant={getStatusVariant(user)}>
                    {getStatusText(user)}
                  </Badge>
                  <Badge variant="secondary">
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Username</p>
                  <p className="text-sm text-muted-foreground">{user?.username}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Role</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Account Status</span>
                <Badge variant={getStatusVariant(user)}>
                  {getStatusText(user)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email Verified</span>
                <Badge variant={user?.isVerified ? 'default' : 'secondary'}>
                  {user?.isVerified ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Account Active</span>
                <Badge variant={user?.isActive ? 'default' : 'destructive'}>
                  {user?.isActive ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold">{formatNumber(stats?.totalSales || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Music className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Beats</p>
                <p className="text-2xl font-bold">{formatNumber(stats?.totalBeats || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Followers</p>
                <p className="text-2xl font-bold">{formatNumber(stats?.totalFollowers || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Information */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Login</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.lastLogin 
                      ? format(new Date(user.lastLogin), 'MMM dd, yyyy HH:mm')
                      : 'Never'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Account Created</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy HH:mm') : 'Unknown'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.updatedAt ? format(new Date(user.updatedAt), 'MMM dd, yyyy HH:mm') : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Total Plays</p>
                  <p className="text-sm text-muted-foreground">{formatNumber(stats?.totalPlays || 0)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Download className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Total Downloads</p>
                  <p className="text-sm text-muted-foreground">{formatNumber(stats?.totalDownloads || 0)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Star className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Average Rating</p>
                  <p className="text-sm text-muted-foreground">{(stats?.averageRating || 0).toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
