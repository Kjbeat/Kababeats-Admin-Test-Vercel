/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { 
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Download,
  RefreshCw,
  Play,
  DollarSign,
  Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface UserAnalyticsProps {
  user: any;
  userDetails: any;
  stats: any;
  onRefresh: () => void;
  isLoading: boolean;
}

export function UserAnalytics({ user, stats, onRefresh, isLoading }: UserAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('30d');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const handleExport = useCallback(() => {
    // TODO: Implement analytics export
    console.log('Exporting analytics data...');
  }, []);

  // Mock analytics data - in real implementation, this would come from API
  const analyticsData = {
    monthlyRevenue: [
      { month: 'Jan', revenue: 1200, sales: 15 },
      { month: 'Feb', revenue: 1800, sales: 22 },
      { month: 'Mar', revenue: 1500, sales: 18 },
      { month: 'Apr', revenue: 2200, sales: 28 },
      { month: 'May', revenue: 1900, sales: 24 },
      { month: 'Jun', revenue: 2500, sales: 32 },
    ],
    genreDistribution: [
      { genre: 'Hip Hop', count: 45, percentage: 35 },
      { genre: 'Trap', count: 30, percentage: 23 },
      { genre: 'R&B', count: 25, percentage: 19 },
      { genre: 'Pop', count: 20, percentage: 15 },
      { genre: 'EDM', count: 10, percentage: 8 },
    ],
    topBeats: [
      { title: 'Midnight Vibes', plays: 15420, revenue: 850, genre: 'Hip Hop' },
      { title: 'Urban Dreams', plays: 12800, revenue: 720, genre: 'Trap' },
      { title: 'Soulful Nights', plays: 11200, revenue: 680, genre: 'R&B' },
      { title: 'City Lights', plays: 9800, revenue: 590, genre: 'Pop' },
      { title: 'Electric Pulse', plays: 8500, revenue: 520, genre: 'EDM' },
    ],
    performanceMetrics: {
      totalPlays: stats?.totalPlays || 0,
      totalRevenue: stats?.totalRevenue || 0,
      averageRating: stats?.averageRating || 0,
      conversionRate: 2.4,
      growthRate: 15.2,
    }
  };

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive performance insights for {user?.username}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(analyticsData.performanceMetrics.totalRevenue)}</p>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{analyticsData.performanceMetrics.growthRate}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Plays</p>
                <p className="text-2xl font-bold">{formatNumber(analyticsData.performanceMetrics.totalPlays)}</p>
                <div className="flex items-center text-sm text-blue-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Rating</p>
                <p className="text-2xl font-bold">{analyticsData.performanceMetrics.averageRating.toFixed(1)}</p>
                <div className="flex items-center text-sm text-yellow-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +0.3
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{analyticsData.performanceMetrics.conversionRate}%</p>
                <div className="flex items-center text-sm text-purple-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +0.4%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Revenue Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Revenue chart would be displayed here</p>
              <p className="text-sm text-muted-foreground mt-2">
                Integration with charting library needed for visual representation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genre Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Genre Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.genreDistribution.map((genre, index) => (
                <div key={genre.genre} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ 
                        backgroundColor: `hsl(${index * 60}, 70%, 50%)` 
                      }} 
                    />
                    <span className="text-sm font-medium">{genre.genre}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{genre.count} beats</span>
                    <Badge variant="outline">{genre.percentage}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Beats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Top Performing Beats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topBeats.map((beat, index) => (
                <div key={beat.title} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{beat.title}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Play className="h-3 w-3 mr-1" />
                          {formatNumber(beat.plays)} plays
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {formatCurrency(beat.revenue)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">{beat.genre}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatCurrency(analyticsData.performanceMetrics.totalRevenue)}
              </div>
              <p className="text-sm text-muted-foreground">Total Revenue Generated</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {formatNumber(analyticsData.performanceMetrics.totalPlays)}
              </div>
              <p className="text-sm text-muted-foreground">Total Track Plays</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {analyticsData.performanceMetrics.conversionRate}%
              </div>
              <p className="text-sm text-muted-foreground">Play-to-Purchase Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
