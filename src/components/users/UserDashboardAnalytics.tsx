import { useState } from 'react';
import { 
  Download as DownloadIcon,
  RefreshCw,
  Play,
  ShoppingCart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UserDashboardAnalyticsProps {
  stats: any;
  topPerformingBeats: any[];
  onRefresh: (timeRange: string) => void;
  isLoading: boolean;
  timeRange?: string;
}

export function UserDashboardAnalytics({ 
  stats,
  topPerformingBeats,
  onRefresh,
  isLoading,
  timeRange = '30d',
}: UserDashboardAnalyticsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAllTopBeats, setShowAllTopBeats] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const downloadCSV = (data: Record<string, any>[], filename: string) => {
    if (!data.length) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers
          .map(header => {
            const value = row[header];
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return `"${value}"`;
          })
          .join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    if (!topPerformingBeats || topPerformingBeats.length === 0) {
      alert('No data to export.');
      return;
    }

    // Tri par plays pour l'export aussi
    const beatsByPlays = [...topPerformingBeats]
      .filter((beat: any) => (beat.plays || 0) > 0)
      .sort((a: any, b: any) => (b.plays || 0) - (a.plays || 0));

    const csvData = beatsByPlays.map((beat: any, index: number) => ({
      Rank: `#${index + 1}`,
      Title: beat.title || 'Untitled Beat',
      Plays: beat.plays || 0,
      Downloads: beat.downloads || 0,
      Sales: beat.sales || 0,
      Revenue: beat.revenue ? `$${beat.revenue.toFixed(2)}` : '$0.00',
    }));

    const filename = `top-beats-by-plays-${timeRange}-${new Date().toISOString().split('T')[0]}`;
    downloadCSV(csvData, filename);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const totalPlays = stats?.totalPlays || 0;
  const totalSales = stats?.totalSales || 0;
  const totalRevenue = stats?.totalRevenue || 0;

  // Tri des beats par "plays" pour l'affichage
  const beatsByPlays = [...topPerformingBeats]
    .filter((beat: any) => (beat.plays || 0) > 0)
    .sort((a: any, b: any) => (b.plays || 0) - (a.plays || 0));

  const displayedBeats = showAllTopBeats 
    ? beatsByPlays
    : beatsByPlays.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Track your performance and growth</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onRefresh(timeRange)} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Plays</p>
              <p className="text-2xl font-bold">{formatNumber(totalPlays)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sales</p>
              <p className="text-2xl font-bold">{formatNumber(totalSales)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Net Earnings</p>
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab — trié par PLAYS */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Beats (by Plays)</CardTitle>
            </CardHeader>
            <CardContent>
              {displayedBeats.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {displayedBeats.map((beat: any, index: number) => (
                      <div key={beat._id || index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{beat.title || 'Untitled Beat'}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatNumber(beat.plays || 0)} plays
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-600">
                            {formatCurrency(beat.revenue || 0)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {beat.sales || 0} sales
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {beatsByPlays.length > 4 && (
                    <button
                      onClick={() => setShowAllTopBeats(!showAllTopBeats)}
                      className="mt-4 text-sm font-medium text-primary hover:underline"
                    >
                      {showAllTopBeats ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No beats with plays yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Plays</span>
                  </div>
                  <p className="text-2xl font-bold">{formatNumber(totalPlays)}</p>
                  <p className="text-xs text-muted-foreground">Total plays across all beats</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Sales</span>
                  </div>
                  <p className="text-2xl font-bold">{formatNumber(totalSales)}</p>
                  <p className="text-xs text-muted-foreground">Total sales</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Net Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Net Earnings</span>
                  <span className="text-lg font-semibold">{formatCurrency(totalRevenue)}</span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  After platform fees and collaboration splits
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}