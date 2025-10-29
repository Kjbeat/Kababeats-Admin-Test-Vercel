/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useCallback } from 'react';
import { 
  ShoppingCart,
  DollarSign,
  BarChart,
  Download,
  RefreshCw,
  Eye,
  Music,
  CreditCard
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// --- Fonction utilitaire pour extraire une chaîne d'ID à partir de n'importe quel format ---
const normalizeId = (id: any): string | null => {
  if (!id) return null;
  if (typeof id === 'string') return id;
  if (typeof id === 'object') {
    // Gère les objets MongoDB comme { "$oid": "..." }
    if (id.$oid) return id.$oid;
    // Gère les objets Mongoose comme { _id: "..." }
    if (id._id) return id._id.toString();
    // Fallback : convertir en chaîne
    return id.toString();
  }
  return String(id);
};

// --- Interfaces ---
interface Beat {
  _id: any; // Peut être string ou objet
  title: string;
}

interface Sale {
  _id: any;
  beatId: any; // Peut être string ou objet
  amount: number;
  createdAt: string;
  status?: 'completed' | 'pending' | 'failed';
  buyer?: { email: string };
  paymentMethod?: string;
  provider?: string;
}

interface UserDashboardSalesProps {
  sales: Sale[];
  beats: Beat[];
  totalRevenue: number;
  totalSales: number;
  onRefresh: () => void;
  isLoading: boolean;
}

export function UserDashboardSales({ 
  sales, 
  beats, 
  totalRevenue, 
  totalSales,
  onRefresh, 
  isLoading 
}: UserDashboardSalesProps) {
  const [activeTab, setActiveTab] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllSales, setShowAllSales] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };
  
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const avgSalePrice = totalSales > 0 ? totalRevenue / totalSales : 0;

  const salesData = useMemo(() => {
    // Crée une Map avec les IDs normalisés
    const beatMap = new Map(
      beats.map(beat => [normalizeId(beat._id), beat])
    );

    const salesWithBeatInfo = sales
      .map(sale => {
        const normalizedBeatId = normalizeId(sale.beatId);
        const beat = normalizedBeatId ? beatMap.get(normalizedBeatId) : undefined;
        return {
          ...sale,
          beat,
        };
      })
      .filter(sale => sale.beat) // Garde uniquement les ventes avec un beat trouvé
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Calcule les stats pour "Top Selling Beats"
    const topSellingBeats = beats
      .map(beat => {
        const normalizedBeatId = normalizeId(beat._id);
        const beatSales = salesWithBeatInfo.filter(sale => 
          normalizeId(sale.beatId) === normalizedBeatId
        );
        const revenue = beatSales.reduce((sum, sale) => sum + sale.amount, 0);
        return {
          ...beat,
          sales: beatSales.length,
          revenue: revenue,
          avgPrice: beatSales.length > 0 ? revenue / beatSales.length : 0,
        };
      })
      .filter(beat => beat.sales > 0)
      .sort((a, b) => b.revenue - a.revenue);

    return {
      recentSales: salesWithBeatInfo,
      topSellingBeats,
    };
  }, [sales, beats]);

  const filteredSales = useMemo(() => {
    if (!searchTerm) return salesData.recentSales;
    return salesData.recentSales.filter(sale =>
      sale.beat?.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [salesData.recentSales, searchTerm]);

  const displayedSales = showAllSales ? filteredSales : filteredSales.slice(0, 5);

  const handleExportSales = useCallback(() => {
    if (salesData.recentSales.length === 0) {
      alert('No sales data to export.');
      return;
    }

    const csvData = salesData.recentSales.map(sale => ({
      'Beat Title': sale.beat?.title || 'Unknown Beat',
      'Date': new Date(sale.createdAt).toISOString().split('T')[0],
      'Amount': `$${sale.amount.toFixed(2)}`,
      'Status': sale.status || 'Completed',
      'Buyer': sale.buyer?.email || 'N/A',
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row =>
        headers
          .map(header => {
            const value = row[header as keyof typeof row];
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
    link.setAttribute('download', `sales-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [salesData.recentSales]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Sales Dashboard</h2>
          <p className="text-muted-foreground">Track sales performance and revenue</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportSales}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Your net earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalSales)}</div>
            <p className="text-xs text-muted-foreground">Total number of transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Sale Price</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgSalePrice)}</div>
            <p className="text-xs text-muted-foreground">Average net earning per sale</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recent">Sales History</TabsTrigger>
          <TabsTrigger value="beats">Top Selling Beats</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
            <CardContent>
              {filteredSales.length > 0 ? (
                <>
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Search by beat title..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Beat</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Gross Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayedSales.map((sale) => (
                        <TableRow key={normalizeId(sale._id) || sale.createdAt}>
                          <TableCell className="font-medium">{sale.beat?.title || 'Unknown Beat'}</TableCell>
                          <TableCell>{new Date(sale.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="font-semibold text-green-600">{formatCurrency(sale.amount)}</TableCell>
                          <TableCell>
                            <Badge variant={sale.status === 'completed' ? 'default' : 'secondary'}>
                              {sale.status || 'Completed'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {sale.paymentMethod && (
                                  <DropdownMenuItem disabled>
                                    {sale.provider === 'stripe' ? (
                                      <>
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Paid with: Stripe
                                      </>
                                    ) : sale.provider === 'paystack' ? (
                                      <>
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Paid with: Paystack
                                      </>
                                    ) : (
                                      <>
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Paid with: {sale.paymentMethod.charAt(0).toUpperCase() + sale.paymentMethod.slice(1)}
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {filteredSales.length > 5 && (
                    <div className="mt-4 text-center">
                      <Button variant="ghost" size="sm" onClick={() => setShowAllSales(!showAllSales)}>
                        {showAllSales ? 'Show less' : 'Show all'}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="mx-auto h-12 w-12 mb-4" />
                  <p className="font-semibold">No Sales Found</p>
                  <p className="text-sm">When you make a sale, it will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="beats" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Top Selling Beats</CardTitle></CardHeader>
            <CardContent>
              {salesData.topSellingBeats.length > 0 ? (
                <div className="space-y-4">
                  {salesData.topSellingBeats.map((beat, index) => (
                    <div key={normalizeId(beat._id) || index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <span className="font-semibold text-lg">#{index + 1}</span>
                        <div>
                          <p className="font-medium">{beat.title}</p>
                          <span className="text-sm text-muted-foreground">{beat.sales} sales</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{formatCurrency(beat.revenue)}</p>
                        <p className="text-sm text-muted-foreground">Gross avg: {formatCurrency(beat.avgPrice)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Music className="mx-auto h-12 w-12 mb-4" />
                  <p className="font-semibold">No Sales Data Yet</p>
                  <p className="text-sm">Your top performing beats will be ranked here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}