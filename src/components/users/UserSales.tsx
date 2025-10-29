/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { 
  DollarSign,
  Music,
  ShoppingCart,
  TrendingUp,
  Award,
  Download,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/DropdownMenu';

interface UserSalesProps {
  user: any;
  userDetails: any;
  stats: any;
  onRefresh: () => void;
  isLoading: boolean;
}

export function UserSales({ userDetails, stats }: UserSalesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [licenseFilter, setLicenseFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
      refunded: "outline",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getLicenseBadge = (license: string) => {
    const colors: Record<string, string> = { 
      "MP3": "bg-blue-100 text-blue-800", 
      "WAV": "bg-green-100 text-green-800", 
      "Stems": "bg-purple-100 text-purple-800", 
      "Unlimited": "bg-yellow-100 text-yellow-800", 
      "Exclusive": "bg-red-100 text-red-800" 
    };
    return <Badge variant="secondary" className={colors[license] || ""}>{license}</Badge>;
  };

  const filteredSales = (userDetails?.sales || []).filter((sale: any) => {
    const matchesSearch = sale.beatTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.buyerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
    const matchesLicense = licenseFilter === 'all' || sale.licenseType === licenseFilter;
    return matchesSearch && matchesStatus && matchesLicense;
  });

  const sortedSales = [...filteredSales].sort((a: any, b: any) => {
    let aValue, bValue;
    switch (sortBy) {
      case 'amount':
        aValue = a.amount;
        bValue = b.amount;
        break;
      case 'date':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'beat':
        aValue = a.beatTitle?.toLowerCase() || '';
        bValue = b.beatTitle?.toLowerCase() || '';
        break;
      default:
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleExport = useCallback(() => {
    // TODO: Implement CSV export
    console.log('Exporting sales data...');
  }, []);

  return (
    <div className="space-y-6">
      {/* Sales Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Sale Price</p>
                <p className="text-2xl font-bold">
                  {stats?.totalSales > 0 ? formatCurrency(stats.totalRevenue / stats.totalSales) : '$0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Best Month</p>
                <p className="text-2xl font-bold">
                  {userDetails?.sales?.length ? 
                    format(new Date(userDetails.sales[0]?.createdAt), 'MMM yyyy') : 
                    'N/A'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search sales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={licenseFilter} onValueChange={setLicenseFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="License" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Licenses</SelectItem>
                <SelectItem value="MP3">MP3</SelectItem>
                <SelectItem value="WAV">WAV</SelectItem>
                <SelectItem value="Stems">Stems</SelectItem>
                <SelectItem value="Exclusive">Exclusive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="beat">Beat Title</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales History ({filteredSales.length} sales)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {sortedSales.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Track</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead className="text-right">Sale Amount</TableHead>
                    <TableHead className="text-right">Platform Fee</TableHead>
                    <TableHead className="text-right">Net Earnings</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSales.map((sale: any) => (
                    <TableRow key={sale._id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                            <Music className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{sale.beatTitle}</p>
                            <p className="text-sm text-muted-foreground">Beat ID: {sale.beatId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getLicenseBadge(sale.licenseType || 'Standard')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{sale.buyerName || 'Unknown Buyer'}</p>
                          <p className="text-sm text-muted-foreground">{sale.buyerEmail || ''}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="font-medium text-foreground">{formatCurrency(sale.amount)}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="text-destructive">-{formatCurrency(sale.platformFee || 0)}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="font-bold text-green-600">+{formatCurrency(sale.producerAmount || sale.amount - (sale.platformFee || 0))}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        {getStatusBadge(sale.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(sale.createdAt), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(sale.createdAt), 'HH:mm')}
                        </p>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu
                          trigger={
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          }
                          align="right"
                        >
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              Download Receipt
                            </DropdownMenuItem>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Sales Found</h3>
              <p className="text-muted-foreground">This user hasn't made any sales yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
