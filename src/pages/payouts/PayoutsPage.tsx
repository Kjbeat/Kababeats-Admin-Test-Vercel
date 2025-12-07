import { useState, useEffect, useCallback, useMemo } from "react";
import {
  DollarSign,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
  TrendingUp,
  Search,
  Upload,
  History,
  Timer,
  Eye,
  RotateCcw,
  FileSpreadsheet,
  Check,
  CreditCard,
  Landmark,
  Smartphone,
  Wallet,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { apiService } from "@/services/api";
import { PayoutStatus } from "@/types";

interface PayoutRequest {
  _id: string;
  userId?: {
    _id: string;
    email: string;
    username: string;
    avatar?: string;
    defaultPaymentProvider?: string;
  } | null;
  totalAmount: number;
  soloAmount?: number;
  collabAmount?: number;
  payoutDetails?: {
    email?: string;
    phone?: string;
    country?: string;
    provider?: string;
    stripeAccountId?: string;
  };
  _userDefaultPaymentMethod?: {
    type: string;
    email?: string;
    iban?: string;
    paystackRecipientCode?: string;
    bankName?: string;
    last4?: string;
    accountNumberLast4?: string;
    bankAccountToken?: string;
    bankHolderName?: string;
    country?: string;
  } | null;
  status: PayoutStatus;
  createdAt: string;
  updatedAt?: string;
  month: number;
  year: number;
}

interface PayoutStats {
  totalPending: number;
  totalApproved: number;
  totalProcessing: number;
  totalPaid: number;
  totalFailed: number;
  totalRejected: number;
  totalAmount: number;
  averagePayout: number;
  monthlyGrowth: number;
}

interface PayoutFilters {
  status: string;
  month: string;
  year: string;
  payoutMethod: string;
  search: string;
}

export function PayoutsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [stats, setStats] = useState<PayoutStats | null>(null);
  
  // Workflow State
  const [activeStage, setActiveStage] = useState<"review" | "approved" | "processing" | "history">("review");
  
  const [filters, setFilters] = useState<PayoutFilters>({
    status: "all",
    month: new Date().getMonth().toString(),
    year: new Date().getFullYear().toString(),
    payoutMethod: "all",
    search: "",
  });
  const [selectedPayouts, setSelectedPayouts] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  // Aggregated Payouts for Review Stage
  const displayPayouts = useMemo(() => {
    if (activeStage !== 'review') return payouts;

    const groups: Record<string, PayoutRequest & { allIds: string[], periods: {month: number, year: number}[] }> = {};

    for (const p of payouts) {
      if (!p.userId || !p.userId._id) continue;
      const uid = p.userId._id;
      
      if (!groups[uid]) {
        groups[uid] = { 
          ...p, 
          allIds: [p._id],
          periods: [{ month: p.month, year: p.year }],
          totalAmount: p.totalAmount || 0,
          soloAmount: p.soloAmount || 0,
          collabAmount: p.collabAmount || 0
        } as any;
      } else {
        groups[uid].allIds.push(p._id);
        const exists = groups[uid].periods.some(per => per.month === p.month && per.year === p.year);
        if (!exists) {
            groups[uid].periods.push({ month: p.month, year: p.year });
        }
        groups[uid].totalAmount += (p.totalAmount || 0);
        groups[uid].soloAmount = (groups[uid].soloAmount || 0) + (p.soloAmount || 0);
        groups[uid].collabAmount = (groups[uid].collabAmount || 0) + (p.collabAmount || 0);
      }
    }
    return Object.values(groups);
  }, [payouts, activeStage]);
  const [nextPayoutDate, setNextPayoutDate] = useState<Date | null>(null);
  const [timeUntilPayout, setTimeUntilPayout] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // User details modal state
  const [selectedUser, setSelectedUser] = useState<PayoutRequest | null>(null);
  const [userSales, setUserSales] = useState<Record<string, unknown>[]>([]);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const [loadingUserSales, setLoadingUserSales] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      handleFilterChange({ search: searchTerm });
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const calculateNextPayoutDate = useCallback(() => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setNextPayoutDate(nextMonth);
  }, []);

  // Build filter parameters
  function buildFilterParams(
    filters: PayoutFilters
  ): Record<string, string | number | boolean> {
    const params: Record<string, string | number | boolean> = { ...filters };
    
    // Override based on stage
    if (activeStage === "review") {
      params.status = "pending";
      delete params.month; // Show all pending (carry over)
      delete params.year;
    } else if (activeStage === "approved") {
      params.status = "approved";
      delete params.month;
      delete params.year;
    } else if (activeStage === "processing") {
      params.status = "processing";
      delete params.month;
      delete params.year;
    } else if (activeStage === "history") {
      params.status = "paid"; // Only show paid
      // Do NOT set historical=true, as it overrides specific month/year filters in backend
    }

    // Clean up
    Object.keys(params).forEach((key) => {
      if (
        params[key] === "all" ||
        params[key] === undefined ||
        params[key] === null
      ) {
        delete params[key];
      }
    });
    return params;
  }

  const fetchPayoutsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = buildFilterParams(filters);
      const response = await apiService.getPayouts(params);

      if (response && Array.isArray(response)) {
        setPayouts(response);
        calculateStats(response);
      } else {
        setPayouts([]);
      }
    } catch (error: unknown) {
      console.error("PayoutsPage - Error fetching payouts data:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(`Failed to load payouts data: ${errorMessage}`);
      setPayouts([]);
    } finally {
      setLoading(false);
    }
  }, [filters, activeStage]);

  useEffect(() => {
    fetchPayoutsData();
    calculateNextPayoutDate();
  }, [fetchPayoutsData, calculateNextPayoutDate]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!nextPayoutDate) return;
      const now = new Date();
      const diff = nextPayoutDate.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeUntilPayout("Payout is due!");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeUntilPayout(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, [nextPayoutDate]);

  const calculateStats = async (payoutsData: PayoutRequest[]) => {
    const totalPending = payoutsData.filter((p) => p.status === "pending").length;
    const totalApproved = payoutsData.filter((p) => p.status === "approved").length;
    const totalProcessing = payoutsData.filter((p) => p.status === "processing").length;
    const totalPaid = payoutsData.filter((p) => p.status === "paid").length;
    const totalFailed = payoutsData.filter((p) => p.status === "failed").length;
    const totalRejected = payoutsData.filter((p) => p.status === "rejected").length;

    const totalAmount = payoutsData.reduce((sum, payout) => sum + payout.totalAmount, 0);
    const averagePayout = payoutsData.length > 0 ? totalAmount / payoutsData.length : 0;

    setStats({
      totalPending,
      totalApproved,
      totalProcessing,
      totalPaid,
      totalFailed,
      totalRejected,
      totalAmount,
      averagePayout,
      monthlyGrowth: 0, // Simplified for now
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleBulkAction = async (action: "approve" | "reject" | "process") => {
    if (selectedPayouts.length === 0) return;
    try {
      await apiService.bulkUpdatePayouts({ action, ids: selectedPayouts });
      await fetchPayoutsData();
      setSelectedPayouts([]);
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
    }
  };

  const handleStatusChange = async (payoutId: string, newStatus: PayoutStatus) => {
    try {
      await apiService.updatePayoutStatus(payoutId, newStatus);
      await fetchPayoutsData();
    } catch (error) {
      console.error("Error updating payout status:", error);
    }
  };

  const handleExportExcel = async () => {
    try {
      const params = buildFilterParams(filters);
      const blob = await apiService.exportPayoutsToExcel(params);
      const filename = `payouts_${activeStage}_${new Date().toISOString().split('T')[0]}.xlsx`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      alert("Failed to export payouts.");
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setIsImporting(true);
    try {
      await apiService.importPayoutsExcel(file);
      await fetchPayoutsData();
      alert("Payouts imported successfully");
    } catch (error) {
      console.error("Import failed:", error);
      alert("Failed to import payouts");
    } finally {
      setIsImporting(false);
      e.target.value = "";
    }
  };

  const handleViewUserSales = async (payout: PayoutRequest) => {
    try {
      setLoadingUserSales(true);
      setSelectedUser(payout);
      const userId = payout.userId?._id;
      if (!userId) return;

      let salesData: any[] = [];
      const aggregatedPayout = payout as any;

      if (aggregatedPayout.periods && aggregatedPayout.periods.length > 0) {
          // Fetch sales for all aggregated periods
          const promises = aggregatedPayout.periods.map((period: {month: number, year: number}) => 
              apiService.getUserSalesByMonth(userId, period.month, period.year)
          );
          const results = await Promise.all(promises);
          // Flatten results and remove duplicates if any (though unlikely across months)
          salesData = results.flat();
      } else {
          salesData = await apiService.getUserSalesByMonth(userId, payout.month, payout.year);
      }

      setUserSales(Array.isArray(salesData) ? salesData : []);
      setShowUserDetails(true);
    } catch (error) {
      console.error("Error fetching user sales:", error);
      setUserSales([]);
      setShowUserDetails(true);
    } finally {
      setLoadingUserSales(false);
    }
  };

  const handleProcessPayouts = async () => {
    setIsProcessing(true);
    try {
      await apiService.processPayouts();
      await fetchPayoutsData();
    } catch (error) {
      console.error("Error processing payouts:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);

  // Pagination
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return displayPayouts.slice(startIndex, startIndex + itemsPerPage);
  };
  const getTotalPages = () => Math.ceil(displayPayouts.length / itemsPerPage);
  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleFilterChange = (newFilters: Partial<PayoutFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  // Helper for stage colors
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'review': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'history': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100';
    }
  };

  // Helper for payout method display
  function getPayoutMethodIcon(method?: PayoutRequest["_userDefaultPaymentMethod"]) {
    if (!method) return <AlertCircle className="h-5 w-5 text-red-500" />;
    switch (method.type) {
      case 'bank_transfer': return <Landmark className="h-5 w-5 text-gray-600" />;
      case 'paypal': return <Wallet className="h-5 w-5 text-blue-600" />;
      case 'pawapay': return <Smartphone className="h-5 w-5 text-purple-600" />;
      case 'mobile_money': return <Smartphone className="h-5 w-5 text-purple-600" />;
      default: return <CreditCard className="h-5 w-5 text-gray-600" />;
    }
  }

  function getFormattedPayoutMethodLabel(method?: PayoutRequest["_userDefaultPaymentMethod"]): string {
    if (!method) return "N/A";
    if (method.type === "paypal") return `PayPal - ${method.email || "No email"}`;
    if (method.type === "pawapay") {
      const phone = (method as any).phone || "No phone";
      const country = (method as any).countryName || (method as any).country || "Unknown";
      return `Mobile Money - ${country} ${phone}`;
    }
    const bank = method.bankName || "Bank";
    const last4 = method.accountNumberLast4 || method.last4 || "XXXX";
    return `${bank} ****${last4}`;
  }

  // Define payout status colors
  function getStatusBgClass(status: string): string {
    switch (status) {
      case "pending":
        return "bg-amber-500";
      case "approved":
        return "bg-blue-500";
      case "processing":
        return "bg-purple-500";
      case "paid":
        return "bg-emerald-600";
      case "failed":
        return "bg-red-500";
      case "rejected":
        return "bg-rose-400";
      case "payment_method_not_found":
        return "bg-orange-600";
      default:
        return "bg-gray-400";
    }
  }

  if (loading && !payouts.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading payouts data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Pipeline */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payout Management</h1>
              <p className="mt-1 text-sm text-gray-500">Manage monthly payouts workflow</p>
            </div>
            <div className="flex items-center space-x-3">
               {/* Next Payout Timer - Compact */}
               <div className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100 flex items-center">
                  <Timer className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-xs font-medium text-blue-800">Due in: {timeUntilPayout}</span>
               </div>
            </div>
          </div>

          {/* Pipeline Tabs */}
          <div className="flex space-x-1 bg-gray-50 p-1 rounded-lg">
            {(['review', 'approved', 'processing', 'history'] as const).map((stage) => (
              <button
                key={stage}
                onClick={() => { setActiveStage(stage); setCurrentPage(1); }}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center
                  ${activeStage === stage 
                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black ring-opacity-5' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
              >
                {stage === 'review' && <AlertCircle className="h-4 w-4 mr-2" />}
                {stage === 'approved' && <CheckCircle className="h-4 w-4 mr-2" />}
                {stage === 'processing' && <RefreshCw className="h-4 w-4 mr-2" />}
                {stage === 'history' && <History className="h-4 w-4 mr-2" />}
                {stage.charAt(0).toUpperCase() + stage.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Stage Specific Stats */}
            <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
              <span className="font-medium">Total: {formatCurrency(stats?.totalAmount || 0)}</span>
              <span>({displayPayouts.length} items)</span>
            </div>
          </div>

          <div className="flex space-x-3">
            {activeStage === 'review' && (
              <>
                <button
                  onClick={() => handleBulkAction('approve')}
                  disabled={selectedPayouts.length === 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  Approve Selected ({selectedPayouts.length})
                </button>
              </>
            )}
            
            {activeStage === 'approved' && (
              <>
                <button
                  onClick={handleExportExcel}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </button>
                <button
                  onClick={() => handleBulkAction('process')}
                  disabled={selectedPayouts.length === 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                >
                  Mark as Processing ({selectedPayouts.length})
                </button>
              </>
            )}

            {activeStage === 'processing' && (
              <>
                <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  {isImporting ? 'Importing...' : 'Import Status'}
                  <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleImportExcel} disabled={isImporting} />
                </label>
                <button
                  onClick={handleProcessPayouts}
                  disabled={isProcessing}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? 'Sending...' : 'Notify Users'}
                </button>
              </>
            )}
            
            {activeStage === 'history' && (
               <div className="flex space-x-2">
                 <select
                    value={filters.month}
                    onChange={(e) => handleFilterChange({ month: e.target.value })}
                    className="border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Months</option>
                    {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                  <select
                    value={filters.year}
                    onChange={(e) => handleFilterChange({ year: e.target.value })}
                    className="border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Years</option>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
               </div>
            )}
            
            <button onClick={fetchPayoutsData} className="p-2 text-gray-400 hover:text-gray-600">
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    onChange={(e) => {
                      if (e.target.checked) {
                        if (activeStage === 'review') {
                           const allIds = (displayPayouts as any[]).flatMap(p => p.allIds);
                           setSelectedPayouts(allIds);
                        } else {
                           setSelectedPayouts(displayPayouts.map((p) => p._id));
                        }
                      } else {
                        setSelectedPayouts([]);
                      }
                    }}
                    checked={displayPayouts.length > 0 && selectedPayouts.length === (activeStage === 'review' ? (displayPayouts as any[]).reduce((acc, p) => acc + p.allIds.length, 0) : displayPayouts.length)}
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getCurrentPageData().map((payout) => (
                <tr key={payout._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      checked={activeStage === 'review' 
                        ? (payout as any).allIds.every((id: string) => selectedPayouts.includes(id))
                        : selectedPayouts.includes(payout._id)
                      }
                      onChange={(e) => {
                        if (activeStage === 'review') {
                           const ids = (payout as any).allIds;
                           if (e.target.checked) {
                             const newIds = ids.filter((id: string) => !selectedPayouts.includes(id));
                             setSelectedPayouts([...selectedPayouts, ...newIds]);
                           } else {
                             setSelectedPayouts(selectedPayouts.filter((id) => !ids.includes(id)));
                           }
                        } else {
                          if (e.target.checked) {
                            setSelectedPayouts([...selectedPayouts, payout._id]);
                          } else {
                            setSelectedPayouts(selectedPayouts.filter((id) => id !== payout._id));
                          }
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-3">
                        <div className="bg-blue-100 text-blue-600 w-full h-full flex items-center justify-center font-bold">
                          {payout.userId?.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{payout.userId?.username || "Unknown"}</div>
                        <div className="text-sm text-gray-500">{payout.userId?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{formatCurrency(payout.totalAmount)}</div>
                    <div className="text-xs text-gray-500">
                      Solo: {formatCurrency(payout.soloAmount || 0)} | Collab: {formatCurrency(payout.collabAmount || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button 
                      onClick={() => {
                        setSelectedUser(payout);
                        setShowPaymentMethod(true);
                      }}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      title="View Payment Method"
                    >
                      {getPayoutMethodIcon(payout._userDefaultPaymentMethod)}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBgClass(payout.status)} text-white`}>
                      {payout.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewUserSales(payout)}
                        className="text-gray-400 hover:text-blue-600"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      
                      {activeStage === 'review' && (
                        <button
                          onClick={() => {
                             const ids = (payout as any).allIds;
                             apiService.bulkUpdatePayouts({ action: 'approve', payoutIds: ids }).then(() => {
                                fetchPayoutsData();
                                setSelectedPayouts([]);
                             });
                          }}
                          className="text-gray-400 hover:text-green-600"
                          title="Approve"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                      )}

                      {activeStage === 'processing' && (
                        <button
                          onClick={() => handleStatusChange(payout._id, 'pending')}
                          className="text-gray-400 hover:text-amber-600"
                          title="Revert to Review"
                        >
                          <RotateCcw className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === getTotalPages()}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, displayPayouts.length)}</span> of <span className="font-medium">{displayPayouts.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  Previous
                </button>
                {/* Simple pagination for now */}
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Page {currentPage} of {getTotalPages() || 1}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === getTotalPages()}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowUserDetails(false)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Payout Details
                      </h3>
                      <button onClick={() => setShowUserDetails(false)} className="text-gray-400 hover:text-gray-500">
                        <XCircle className="h-6 w-6" />
                      </button>
                    </div>

                    {/* User Info */}
                    <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-lg">
                      <Avatar className="h-12 w-12 mr-4">
                        <div className="bg-blue-100 text-blue-600 w-full h-full flex items-center justify-center font-bold text-xl">
                          {selectedUser.userId?.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                      </Avatar>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{selectedUser.userId?.username}</h4>
                        <p className="text-sm text-gray-500">{selectedUser.userId?.email}</p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(selectedUser.totalAmount)}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          <span>Solo: {formatCurrency(selectedUser.soloAmount || 0)}</span>
                          <span className="mx-1">|</span>
                          <span>Collab: {formatCurrency(selectedUser.collabAmount || 0)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method Details */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Payment Method</h4>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        {selectedUser._userDefaultPaymentMethod ? (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Type</p>
                              <p className="font-medium capitalize">{selectedUser._userDefaultPaymentMethod.type}</p>
                            </div>
                            {selectedUser._userDefaultPaymentMethod.type === 'bank_transfer' && (
                              <>
                                <div>
                                  <p className="text-xs text-gray-500">Bank Name</p>
                                  <p className="font-medium">{selectedUser._userDefaultPaymentMethod.bankName}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Account Holder</p>
                                  <p className="font-medium">{selectedUser._userDefaultPaymentMethod.bankHolderName}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Account Number</p>
                                  <p className="font-medium">**** {selectedUser._userDefaultPaymentMethod.last4 || selectedUser._userDefaultPaymentMethod.accountNumberLast4}</p>
                                </div>
                                {selectedUser._userDefaultPaymentMethod.iban && (
                                  <div className="col-span-2">
                                    <p className="text-xs text-gray-500">IBAN</p>
                                    <p className="font-medium">{selectedUser._userDefaultPaymentMethod.iban}</p>
                                  </div>
                                )}
                              </>
                            )}
                            {selectedUser._userDefaultPaymentMethod.type === 'paypal' && (
                              <div className="col-span-2">
                                <p className="text-xs text-gray-500">PayPal Email</p>
                                <p className="font-medium">{selectedUser._userDefaultPaymentMethod.email}</p>
                              </div>
                            )}
                            {selectedUser._userDefaultPaymentMethod.type === 'mobile_money' && (
                              <div className="col-span-2">
                                <p className="text-xs text-gray-500">Phone Number</p>
                                <p className="font-medium">{selectedUser.payoutDetails?.phone || 'N/A'}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-red-500">No payment method linked.</p>
                        )}
                      </div>
                    </div>

                    {/* Sales Breakdown */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Sales Breakdown</h4>
                      {loadingUserSales ? (
                        <div className="flex justify-center py-8">
                          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                      ) : (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Beat</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Date</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {userSales.map((sale: any, idx) => (
                                <tr key={idx}>
                                  <td className="px-4 py-2 text-sm text-gray-900">{sale.beatId?.title || 'Unknown'}</td>
                                  <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(sale.amount || 0)}</td>
                                  <td className="px-4 py-2 text-sm text-gray-500 text-right">{new Date(sale.createdAt).toLocaleDateString()}</td>
                                </tr>
                              ))}
                              {userSales.length === 0 && (
                                <tr>
                                  <td colSpan={3} className="px-4 py-4 text-center text-sm text-gray-500">No sales found for this period.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowUserDetails(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Payment Method Modal */}
      {showPaymentMethod && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowPaymentMethod(false)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Payment Method Details
                      </h3>
                      <button onClick={() => setShowPaymentMethod(false)} className="text-gray-400 hover:text-gray-500">
                        <XCircle className="h-6 w-6" />
                      </button>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        {selectedUser._userDefaultPaymentMethod ? (
                          <div className="space-y-3">
                            <div className="flex items-center mb-4">
                                {getPayoutMethodIcon(selectedUser._userDefaultPaymentMethod)}
                                <span className="ml-2 font-bold capitalize text-lg">{selectedUser._userDefaultPaymentMethod.type.replace('_', ' ')}</span>
                            </div>
                            
                            {selectedUser._userDefaultPaymentMethod.type === 'bank_transfer' && (
                              <div className="grid grid-cols-1 gap-2">
                                <div>
                                  <p className="text-xs text-gray-500 uppercase">Bank Name</p>
                                  <p className="font-medium text-gray-900">{selectedUser._userDefaultPaymentMethod.bankName}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase">Account Holder</p>
                                  <p className="font-medium text-gray-900">{selectedUser._userDefaultPaymentMethod.bankHolderName}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase">Account Number</p>
                                  <p className="font-medium text-gray-900">**** {selectedUser._userDefaultPaymentMethod.last4 || selectedUser._userDefaultPaymentMethod.accountNumberLast4}</p>
                                </div>
                                {selectedUser._userDefaultPaymentMethod.iban && (
                                  <div>
                                    <p className="text-xs text-gray-500 uppercase">IBAN</p>
                                    <p className="font-medium text-gray-900">{selectedUser._userDefaultPaymentMethod.iban}</p>
                                  </div>
                                )}
                              </div>
                            )}
                            {selectedUser._userDefaultPaymentMethod.type === 'paypal' && (
                              <div>
                                <p className="text-xs text-gray-500 uppercase">PayPal Email</p>
                                <p className="font-medium text-gray-900">{selectedUser._userDefaultPaymentMethod.email}</p>
                              </div>
                            )}
                            {(selectedUser._userDefaultPaymentMethod.type === 'mobile_money' || selectedUser._userDefaultPaymentMethod.type === 'pawapay') && (
                              <div>
                                <p className="text-xs text-gray-500 uppercase">Phone Number</p>
                                <p className="font-medium text-gray-900">{selectedUser.payoutDetails?.phone || (selectedUser._userDefaultPaymentMethod as any).phone || 'N/A'}</p>
                                <p className="text-xs text-gray-500 uppercase mt-2">Provider</p>
                                <p className="font-medium text-gray-900">{(selectedUser._userDefaultPaymentMethod as any).provider || 'Mobile Money'}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                             <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                             <p className="text-red-600 font-medium">No payment method linked.</p>
                          </div>
                        )}
                      </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowPaymentMethod(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
