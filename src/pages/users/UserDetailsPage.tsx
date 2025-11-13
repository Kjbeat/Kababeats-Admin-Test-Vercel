/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  UserX,
  UserCheck,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserDetails } from '@/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { UserSuspendModal } from '@/components/users/UserSuspendModal';
import { useSuspendUser, useActivateUser } from '@/hooks/useUsers';

// Import the dashboard components
import { UserDashboardHome } from '@/components/users/UserDashboardHome';
import { UserDashboardAnalytics } from '@/components/users/UserDashboardAnalytics';
import { UserDashboardSales } from '@/components/users/UserDashboardSales';
import { UserProfile } from '@/components/users/UserProfile';
import { UserPayouts } from '@/components/users/UserPayouts';
import { UserSubscription } from '@/components/users/UserSubscription';

export function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');

  const { data: userDetails, isLoading, error, refetch } = useUserDetails(id || '');

  useEffect(() => {
    if (userDetails?.stats) {
      console.log('📊 stats depuis le backend:', userDetails.stats);
      console.log('💰 totalRevenue (doit être ~728.76):', userDetails.stats.totalRevenue);
    }
  }, [userDetails]);

  const suspendUserMutation = useSuspendUser();
  const activateUserMutation = useActivateUser();
  
  const user = userDetails?.user;
  const stats = userDetails?.stats || {};
  const allBeats = userDetails?.beats || [];
  const allSales = userDetails?.sales || [];
  const collaborationRequests = userDetails?.collaborationRequests || [];
  const topPerformingBeats = userDetails?.topPerformingBeats || [];
  const recentActivity = userDetails?.recentActivity || [];
  const payouts = userDetails?.payouts || []; 
  const allSubscriptions = userDetails?.subscriptions || [];
  const userSubscription = userDetails?.userSubscription || null;

  // Agréger les ventes par beat (utilisé uniquement pour le Overview)
  const salesAggregates = allSales.reduce((acc: any, sale: any) => {
    const beatId = sale.beat;
    const amount = sale.amount;
    if (!acc[beatId]) {
      acc[beatId] = { totalRevenue: 0, salesCount: 0 };
    }
    acc[beatId].totalRevenue += amount;
    acc[beatId].salesCount += 1;
    return acc;
  }, {});

  const handleRefresh = async () => {
    await refetch();
    setRefreshSuccess(true);
    setTimeout(() => setRefreshSuccess(false), 2000);
  };

  const combinedBeats = allBeats.map((beat: any) => ({
    ...beat,
    revenue: (salesAggregates[beat._id]?.totalRevenue) || 0,
    sales: (salesAggregates[beat._id]?.salesCount) || 0,
    rating: beat.rating || 0,
  }));

  const getStatusIcon = (user: any) => {
    if (!user?.isActive) return <UserX className="h-5 w-5 text-destructive" />;
    if (!user?.isVerified) return <AlertCircle className="h-5 w-5 text-warning" />;
    return <UserCheck className="h-5 w-5 text-green-600" />;
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

  const handleSuspendUser = () => setShowSuspendModal(true);

  const handleActivateUser = () => {
    if (user) activateUserMutation.mutate(user._id);
  };

  const handleSuspendUserConfirm = async (id: string, reason: string) => {
    await suspendUserMutation.mutateAsync({ id, reason });
  };

  // Gestion des erreurs
  if (error || (!isLoading && !user)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center py-12 max-w-md">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">User not found</h3>
          <p className="text-muted-foreground mb-4">
            The user you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/users')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  // Chargement initial
  if (isLoading && !userDetails) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading user details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Message de succès du refresh */}
      {refreshSuccess && (
        <div className="fixed top-4 right-4 bg-green-600 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
          Data refreshed!
        </div>
      )}

      <div className="space-y-6 p-6">
        {/* Clean Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/users')}
                className="text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Button>
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={`${user.firstName || user.username} avatar`} />
                  ) : (
                    <span className="text-lg font-medium">
                      {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                    </span>
                  )}
                </Avatar>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.username}
                  </h1>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(user)}
                    <Badge variant={getStatusVariant(user)} className="text-xs">
                      {getStatusText(user)}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
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
              {user?.isActive ? (
                hasPermission('users.suspend') && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleSuspendUser}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Suspend
                  </Button>
                )
              ) : (
                hasPermission('users.suspend') && (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={handleActivateUser}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Activate
                  </Button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-slate-200">
              <TabsList className="grid w-full grid-cols-6 bg-transparent h-auto p-0">
                <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="profile" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent">
                  Profile
                </TabsTrigger>
                <TabsTrigger value="analytics" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent">
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="sales" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent">
                  Sales
                </TabsTrigger>
                <TabsTrigger value="payouts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent">
                  Payouts
                </TabsTrigger>
                <TabsTrigger value="subscription" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent">
                  Subscription
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="p-6">
              <UserDashboardHome
                user={user}
                stats={stats}
                recentActivity={recentActivity}
                topPerformingBeats={topPerformingBeats}
              />
            </TabsContent>

            <TabsContent value="profile" className="p-6">
              <UserProfile
                user={user}
                userDetails={userDetails}
                stats={stats}
                onRefresh={refetch}
                isLoading={isLoading}
                onSaveUser={undefined}
              />
            </TabsContent>
 
            <TabsContent value="analytics" className="p-6">
              <UserDashboardAnalytics
                user={user}
                stats={stats}
                topPerformingBeats={topPerformingBeats}
                onRefresh={handleRefresh}
                isLoading={isLoading}
                timeRange={timeRange}
              />
            </TabsContent>

            <TabsContent value="sales" className="p-6">
              <UserDashboardSales
                sales={allSales}
                beats={allBeats}
                totalRevenue={stats?.totalRevenue || 0}
                totalSales={stats?.totalSales || 0}
                onRefresh={refetch}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="payouts" className="p-6">
              <UserPayouts
                user={user}
                stats={stats}
                sales={allSales}
                collaborationRequests={collaborationRequests}
                allBeats={allBeats}
                payouts={payouts}
                onRefresh={refetch}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="subscription" className="p-6">
              <UserSubscription
                user={user}
                userDetails={userDetails}
                stats={stats}
                subscriptions={allSubscriptions}
                userSubscription={userSubscription}
                subscriptionPayments={userDetails.subscriptionPayments}
                onRefresh={refetch}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Modals */}
        <UserSuspendModal
          user={user}
          open={showSuspendModal}
          onOpenChange={setShowSuspendModal}
          onSuspend={handleSuspendUserConfirm}
          loading={suspendUserMutation.isPending}
        />
      </div>
    </div>
  );
}