/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  BarChart3,
  Download,
  RefreshCw,
} from 'lucide-react';
import { apiService } from '@/services/api';
import { Sale, RevenueAnalytics } from '@/types';

interface SalesMetrics {
  totalRevenue: number;
  totalCommission: number;
  totalSales: number;
  averageOrderValue: number;
  commissionRate: number;
  monthlyGrowth: number;
}

interface ProducerStats {
  producerId: string;
  producerName: string;
  totalSales: number;
  totalRevenue: number;
  commissionEarned: number;
  beatsSold: number;
  averageRating: number;
  joinDate: string;
}

interface SalesFilters {
  dateFrom: string;
  dateTo: string;
  status: string;
  producer: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PaginatedSalesResponse {
  success: boolean;
  data: Sale[]; 
  pagination: PaginationInfo; 
}

interface MetricsResponse {
  success: boolean;
  data: SalesMetrics;
}

interface ProducerStatsResponse {
  success: boolean;
  data: ProducerStats[];
}

interface RevenueAnalyticsResponse {
  success: boolean;
  data: RevenueAnalytics;
}

export function SalesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null);
  const [producerStats, setProducerStats] = useState<ProducerStats[]>([]);
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null);
  const [pagination, setPagination] = useState({ totalPages: 1, totalRecords: 0 });
  const [filters, setFilters] = useState<SalesFilters>({
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    status: 'all',
    producer: 'all'
  });
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  const exportToCSV = () => {
    if (sales.length === 0) {
      alert('No sales data to export.');
      return;
    }

    const headers = [
      'Transaction ID',
      'Date',
      'Status',
      'Total Amount',
      'Commission Earned',
      'Producer Earnings',
      'Payment Method',
      'Buyer Username',
      'Producer Username'
    ];

    const rows = sales.map(sale => {
      const transactionId = sale.paymentProviderTransactionId || sale._id || '';
      const date = sale.createdAt ? new Date(sale.createdAt).toISOString().split('T')[0] : '';
      const status = sale.status || '';
      const totalAmount = sale.amount != null ? Number(sale.amount).toFixed(2) : '';
      const commissionEarned = sale.platformFee != null ? Number(sale.platformFee).toFixed(2) : '';

      let producerEarnings = '';
      if (sale.status === 'completed') {
        if (sale.sellerProfit != null) {
          producerEarnings = Number(sale.sellerProfit).toFixed(2);
        } else if (sale.earningsSplits?.length > 0) {
          const total = sale.earningsSplits.reduce((sum: number, split: any) => sum + (split.amount || 0), 0);
          producerEarnings = Number(total).toFixed(2);
        }
      }

      const paymentMethod = sale.paymentMethod || 'card';
      const buyerUsername = sale.buyerId?.username || '';
      const producerUsername = sale.sellerId?.username || '';

      const escape = (value: string): string => {
        if (!value) return '';
        return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
      };

      return [
        escape(transactionId),
        escape(date),
        escape(status),
        totalAmount,
        commissionEarned,
        producerEarnings,
        escape(paymentMethod),
        escape(buyerUsername),
        escape(producerUsername)
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fetchSalesData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filterParams: any = {
        ...filters,
        timeRange: selectedTimeRange,
        page: currentPage, 
        limit: transactionsPerPage 
      };
      
      Object.keys(filterParams).forEach(key => {
        if (filterParams[key] === 'all') delete filterParams[key];
      });
      
      if (filterParams.dateFrom) {
        filterParams.dateFrom = `${filterParams.dateFrom}T00:00:00.000Z`;
      }
      if (filterParams.dateTo) {
        filterParams.dateTo = `${filterParams.dateTo}T23:59:59.999Z`;
      }

      const salesResponse = await apiService.api.get('/sales', { params: filterParams });
      const metricsResponse = await apiService.api.get('/sales/metrics', { params: filterParams });
      const producerResponse = await apiService.api.get('/sales/producers', { params: filterParams });
      const revenueResponse = await apiService.api.get('/analytics/revenue', { params: filterParams });

      if (salesResponse.data.success) {
        setSales(salesResponse.data.data);
        setPagination({
          totalPages: salesResponse.data.pagination.totalPages,
          totalRecords: salesResponse.data.pagination.total
        });
      } else {
        setSales([]);
        setPagination({ totalPages: 1, totalRecords: 0 });
      }

      if (metricsResponse.data.success) {
        setMetrics(metricsResponse.data.data);
      } else {
        setMetrics(null);
      }

      if (producerResponse.data.success) {
        setProducerStats(Array.isArray(producerResponse.data.data) ? producerResponse.data.data : []);
      } else {
        setProducerStats([]);
      }

      if (revenueResponse.data.success) {
        setRevenueAnalytics(revenueResponse.data.data);
      } else {
        setRevenueAnalytics(null);
      }

    } catch (error: any) {
      console.error('SalesPage - Error fetching data:', error);
      setError(`Failed to load data: ${error.response?.data?.message || error.message}`);
      setSales([]);
      setMetrics(null);
      setProducerStats([]);
      setRevenueAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, [filters, selectedTimeRange, currentPage]);

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
    { value: 'all', label: 'All time' }
  ];

  const totalPages = pagination.totalPages;
  const startIndex = (currentPage - 1) * transactionsPerPage;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (newFilters: Partial<SalesFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
    if (newFilters.dateFrom !== undefined || newFilters.dateTo !== undefined) {
      setSelectedTimeRange('custom');
    }
  };

  const handleTimeRangeChange = (timeRange: string) => {
    setSelectedTimeRange(timeRange);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dateTo: new Date().toISOString().split('T')[0],
      status: 'all',
      producer: 'all'
    });
    setSelectedTimeRange('30d');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading sales data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Sales Data</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={fetchSalesData}
                  className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commission Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor platform commission earnings, producer performance, and revenue analytics
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchSalesData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
            <select
              value={selectedTimeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange({dateFrom: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange({dateTo: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange({status: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Commission-Focused Key Metrics — CORRIGÉ : 3 colonnes */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Platform Commission */}
          <div className="bg-blue-600 overflow-hidden shadow-lg rounded-xl">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-blue-100 truncate">Platform Commission</dt>
                    <dd className="text-2xl font-bold text-white">{formatCurrency(metrics?.totalCommission || 0)}</dd>
                    <dd className="text-sm text-blue-200">{(metrics?.commissionRate || 0).toFixed(1)}% commission rate</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Avg Commission/Sale */}
          <div className="bg-white overflow-hidden shadow-lg rounded-xl border-l-4 border-purple-500">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Commission/Sale</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(
                        (metrics?.totalSales || 0) > 0 ? (metrics.totalCommission || 0) / (metrics.totalSales || 0) : 0
                      )}
                    </dd>
                    <dd className="text-sm text-gray-500">Per transaction</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Total Sales */}
          <div className="bg-white overflow-hidden shadow-lg rounded-xl border-l-4 border-orange-500">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShoppingCart className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Sales</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {(metrics?.totalSales || 0).toLocaleString()}
                    </dd>
                    <dd className="text-sm text-gray-500">Commission opportunities</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Producers */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Top Commission-Generating Producers</h3>
              <p className="mt-1 text-sm text-gray-500">Producers ranked by commission generated for the platform</p>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Commission Leaders</span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission Generated</th>
               {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission Rate</th>*/}                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Commission/Sale</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {producerStats.slice(0, 5).map((producer) => {
                const commissionRate = producer.totalRevenue > 0 ? (producer.commissionEarned / producer.totalRevenue) * 100 : 0;
                const avgCommissionPerSale = producer.totalSales > 0 ? producer.commissionEarned / producer.totalSales : 0;
                
                return (
                  <tr key={producer.producerId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{producer.producerName}</div>
                          <div className="text-sm text-gray-500">ID: {producer.producerId.slice(-8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        {formatCurrency(producer.commissionEarned)}
                      </div>
                      <div className="text-xs text-gray-500">Platform earnings</div>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {commissionRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">Commission rate</div>
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {producer.totalSales.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(avgCommissionPerSale)}
                      </div>
                      <div className="text-xs text-gray-500">Per sale</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commission Transactions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Commission Transactions</h3>
              <p className="mt-1 text-sm text-gray-500">Recent sales showing commission earned by the platform</p>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Commission Tracking</span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission Earned</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producer Earnings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.map((sale) => {
                const amount = sale.amount || 0;
                const platformFee = sale.platformFee || 0;
                const commissionRate = amount > 0 ? (platformFee / amount) * 100 : 0;
                
                return (
                  <tr key={sale._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {sale.paymentProviderTransactionId.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        {formatCurrency(platformFee)}
                      </div>
                      <div className="text-xs text-gray-500">Platform earnings</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {isNaN(commissionRate) ? '0.0' : commissionRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">Commission rate</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sale.sellerProfit ? (
                        <div className="text-sm font-medium text-blue-600">
                          {formatCurrency(sale.sellerProfit)}
                        </div>
                      ) : sale.earningsSplits && sale.earningsSplits.length > 0 ? (
                        <div className="text-sm font-medium text-blue-600">
                          {formatCurrency(sale.earningsSplits.reduce((total: number, split: any) => total + (split.amount || 0), 0))}
                        </div>
                      ) : (
                        <div className="text-sm font-medium text-gray-400">
                          {formatCurrency(0)}
                        </div>
                      )}
                      
                      {sale.earningsSplits && sale.earningsSplits.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-500 mb-1 font-medium">Split earnings:</div>
                          <div className="space-y-1">
                            {sale.earningsSplits.map((split: any, index: number) => (
                              <div key={index} className="flex items-center justify-between text-xs bg-gray-50 px-2 py-1 rounded">
                                <span className="text-gray-600 font-medium">
                                  {split.userId?.username || split.userName || `User ${split.userId?._id?.slice(-4) || 'N/A'}`}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-500">{split.percent}%</span>
                                  <span className="text-gray-700 font-semibold">{formatCurrency(split.amount)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {(!sale.earningsSplits || sale.earningsSplits.length === 0) && !sale.sellerProfit && (
                        <div className="text-xs text-gray-400 mt-1">No earnings</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        sale.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : sale.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(sale.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(startIndex + sales.length, pagination.totalRecords)}</span> of{' '}
                  <span className="font-medium">{pagination.totalRecords}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    if (pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNum === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}