/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  DollarSign,
  Music,
  Users,
  TrendingUp,
  Eye,
  Download,
  Star,
  Play,
  ShoppingCart,
  Award,
  Activity
} from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// L'interface des props est mise à jour pour recevoir les données dynamiques
interface UserDashboardHomeProps {
  user: any;
  stats: any;
  recentActivity: any[];
  topPerformingBeats: any[];
}

export function UserDashboardHome({ user, stats, recentActivity, topPerformingBeats }: UserDashboardHomeProps) {
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [showAllBeats, setShowAllBeats] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  // Tronquer les listes
  const displayedActivity = showAllActivity ? recentActivity : (recentActivity || []).slice(0, 3);
  const displayedBeats = showAllBeats ? topPerformingBeats : (topPerformingBeats || []).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Section de Bienvenue */}
      <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-border/60">
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent" />
          <CardHeader className="relative z-10 pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10">
                <Award className="h-5 w-5 text-blue-600" />
              </span>
              Welcome back, {user?.firstName || user?.username}!
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-muted-foreground">Here's what's happening with your account today.</p>
          </CardContent>
        </div>
      </Card>

      {/* Métriques Clés */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Beats</p>
              <p className="text-2xl font-bold">{formatNumber(stats.totalBeats)}</p>
            </div>
            <Music className="h-6 w-6 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Followers</p>
              <p className="text-2xl font-bold">{formatNumber(stats.totalFollowers)}</p>
            </div>
            <Users className="h-6 w-6 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Plays</p>
              <p className="text-2xl font-bold">{formatNumber(stats.totalPlays)}</p>
            </div>
            <Play className="h-6 w-6 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Sales</p>
              <p className="text-2xl font-bold">{formatNumber(stats.totalSales)}</p>
            </div>
            <ShoppingCart className="h-6 w-6 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* Activité Récente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity && recentActivity.length > 0 ? (
            <>
              <div className="space-y-3">
                {displayedActivity.map((notif) => {
                  let icon = <Activity className="h-4 w-4 text-muted-foreground" />;
                  switch (notif.type) {
                    case 'NEW_FOLLOWER':
                      icon = <Users className="h-4 w-4 text-blue-600" />;
                      break;
                    case 'BEAT_LIKED':
                      icon = <Star className="h-4 w-4 text-yellow-600" />;
                      break;
                    case 'BEAT_SOLD':
                      icon = <ShoppingCart className="h-4 w-4 text-green-600" />;
                      break;
                    case 'PURCHASE_CONFIRMATION':
                      icon = <DollarSign className="h-4 w-4 text-emerald-600" />;
                      break;
                    case 'SCHEDULED_BEAT_PUBLISHED':
                      icon = <Music className="h-4 w-4 text-purple-600" />;
                      break;
                    case 'MILESTONE_PLAYS':
                      icon = <TrendingUp className="h-4 w-4 text-orange-600" />;
                      break;
                    case 'BEAT_FEATURED_IN_PLAYLIST':
                      icon = <Award className="h-4 w-4 text-indigo-600" />;
                      break;
                    case 'COLLABORATION_SALE_PROFIT':
                      icon = <Users className="h-4 w-4 text-teal-600" />;
                      break;
                    default:
                      icon = <Activity className="h-4 w-4 text-muted-foreground" />;
                  }

                  return (
                    <div
                      key={notif._id?.$oid || notif._id || notif.createdAt}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="mt-0.5 flex-shrink-0">{icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{notif.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notif.createdAt?.$date || notif.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bouton "Voir plus / Voir moins" */}
              {recentActivity.length > 3 && (
                <button
                  onClick={() => setShowAllActivity(!showAllActivity)}
                  className="mt-4 text-sm font-medium text-primary hover:underline"
                >
                  {showAllActivity ? 'Show less' : 'Show more'}
                </button>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent activity to display.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Performing Beats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Performing Beats
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topPerformingBeats && topPerformingBeats.length > 0 ? (
            <>
              <div className="space-y-4">
                {displayedBeats.map((beat, index) => (
                  <div key={beat._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{beat.title || 'Untitled Beat'}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Play className="h-3 w-3" />{formatNumber(beat.plays)}
                          </span>
                          <span className="flex items-center gap-1">
                            <ShoppingCart className="h-3 w-3" />{formatNumber(beat.sales)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{formatCurrency(beat.revenue)}</p>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bouton "Voir plus / Voir moins" */}
              {topPerformingBeats.length > 3 && (
                <button
                  onClick={() => setShowAllBeats(!showAllBeats)}
                  className="mt-4 text-sm font-medium text-primary hover:underline"
                >
                  {showAllBeats ? 'Show less' : 'Show more'}
                </button>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Music className="mx-auto h-12 w-12 mb-4" />
              <p className="font-semibold">No Sales Data Yet</p>
              <p className="text-sm">Top performing beats will appear here once sales are made.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}