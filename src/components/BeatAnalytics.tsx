import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Music, 
  BarChart3,
  Activity
} from 'lucide-react';
import { apiService } from '@/services/api';

interface BeatStats {
  totalBeats: number;
  publishedBeats: number;
  draftBeats: number;
  archivedBeats: number;
  totalPlays: number;
  totalDownloads: number;
  totalSales: number;
  averagePrice: number;
  topGenres: Array<{ genre: string; count: number }>;
  recentBeats: Array<{
    id: string;
    title: string;
    owner: string;
    createdAt: string;
    status: string;
  }>;
}

export function BeatAnalytics() {
  const [stats, setStats] = useState<BeatStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.get('/beats/stats/overview');
      console.log('BeatAnalytics: API response:', response);
      console.log('BeatAnalytics: Response data:', response.data);
      // The API service returns the data directly, not nested under 'data'
      setStats(response.data || response);
    } catch (err) {
      console.error('BeatAnalytics: Error fetching stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-destructive mb-2">Failed to load analytics</p>
            <button 
              onClick={fetchStats}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendValue, 
    description 
  }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    description?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && trendValue && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            ) : trend === 'down' ? (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            ) : (
              <Activity className="h-3 w-3 text-blue-500 mr-1" />
            )}
            {trendValue}
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Beats"
          value={stats.totalBeats}
          icon={Music}
          description="All beats in system"
        />
        <StatCard
          title="Published"
          value={stats.publishedBeats}
          icon={BarChart3}
          description={`${Math.round((stats.publishedBeats / stats.totalBeats) * 100)}% of total`}
        />
        <StatCard
          title="Total Plays"
          value={stats.totalPlays.toLocaleString()}
          icon={TrendingUp}
          description={`${(stats.totalPlays / stats.totalBeats).toFixed(1)} avg per beat`}
        />
      </div>

      <Tabs defaultValue="genres" className="space-y-4">
        <TabsList>
          <TabsTrigger value="genres">Top Genres</TabsTrigger>
          <TabsTrigger value="status">Status Distribution</TabsTrigger>
          <TabsTrigger value="recent">Recent Beats</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="genres" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Genres</CardTitle>
              <CardDescription>Most popular genres by beat count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topGenres.map((genre, index) => (
                  <div key={genre.genre} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="font-medium">{genre.genre}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{genre.count} beats</span>
                      <Progress 
                        value={(genre.count / stats.topGenres[0]?.count) * 100} 
                        className="w-20 h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Beat Status Distribution</CardTitle>
              <CardDescription>Current status of all beats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">Published</Badge>
                    <span className="font-medium">Published</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{stats.publishedBeats} beats</span>
                    <Progress 
                      value={(stats.publishedBeats / stats.totalBeats) * 100} 
                      className="w-20 h-2"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Beats Performance</CardTitle>
              <CardDescription>Latest beats and their metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentBeats.map((beat) => (
                  <div key={beat.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{beat.title}</h4>
                      <p className="text-sm text-muted-foreground">by {beat.owner}</p>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <Badge 
                        variant={
                          beat.status === 'published' ? 'default' :
                          beat.status === 'draft' ? 'secondary' :
                          beat.status === 'archived' ? 'destructive' : 'outline'
                        }
                      >
                        {beat.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(beat.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Monthly revenue breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Total Plays</span>
                  <span className="text-sm text-muted-foreground">{stats.totalPlays.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Published Beats</span>
                  <span className="text-sm text-muted-foreground">{stats.publishedBeats}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
