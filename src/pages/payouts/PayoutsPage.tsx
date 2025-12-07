import { useState, useEffect, useCallback } from "react";
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
  const [historyPayouts, setHistoryPayouts] = useState<PayoutRequest[]>([]);
  const [stats, setStats] = useState<PayoutStats | null>(null);
  const [activeTab, setActiveTab] = useState<"current" | "history">("current");
  const [filters, setFilters] = useState<PayoutFilters>({
    status: "all",
    month: new Date().getMonth().toString(),
    year: new Date().getFullYear().toString(),
    payoutMethod: "all",
    search: "",
  });
  const [selectedPayouts, setSelectedPayouts] = useState<string[]>([]);
  const [nextPayoutDate, setNextPayoutDate] = useState<Date | null>(null);
  const [timeUntilPayout, setTimeUntilPayout] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // User details modal state
  const [selectedUser, setSelectedUser] = useState<PayoutRequest | null>(null);
  const [userSales, setUserSales] = useState<Record<string, unknown>[]>([]);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [loadingUserSales, setLoadingUserSales] = useState(false);

  // Debug modal state changes
  useEffect(() => {
    console.log("PayoutsPage - Modal state changed:", {
      showUserDetails,
      selectedUser: selectedUser ? selectedUser.userId?.username : null,
      userSalesCount: userSales.length,
    });
  }, [showUserDetails, selectedUser, userSales]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      handleFilterChange({ search: searchTerm });
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const calculateNextPayoutDate = useCallback(() => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setNextPayoutDate(nextMonth);
  }, []);

  // Fetching payouts data with filters
  const fetchPayoutsData = useCallback(async () => {
    console.log("PayoutsPage - fetchPayoutsData called");
    try {
      setLoading(true);
      setError(null);

      // Fetch payouts from the backend with filters
      const response = await apiService.getPayouts({
        ...buildFilterParams(filters),
        historical: activeTab === "history" ? true : undefined,
      });
      console.log("Payouts API response:", response);

      if (response && Array.isArray(response)) {
        if (activeTab === "current") {
          console.log("PayoutsPage - Données courantes reçues :", response);
          setPayouts(response);
          calculateStats(response);
        } else {
          console.log("PayoutsPage - Données historiques reçues :", response);
          setHistoryPayouts(response);
        }
      } else {
        if (activeTab === "current") {
          setPayouts([]);
        } else {
          setHistoryPayouts([]);
        }
      }
    } catch (error: unknown) {
      console.error("PayoutsPage - Error fetching payouts data:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorDetails =
        (error as { response?: { data?: string } })?.response?.data ||
        errorMessage;
      const errorStatus = (error as { response?: { status?: number } })
        ?.response?.status;

      console.error("PayoutsPage - Error details:", errorDetails);
      console.error("PayoutsPage - Error status:", errorStatus);

      // Set error state
      setError(`Failed to load payouts data: ${errorDetails}`);

      // Set fallback data when API calls fail
      console.log("PayoutsPage - Setting fallback data due to API failure");
      setPayouts([]);
      setHistoryPayouts([]);
      setStats({
        totalPending: 0,
        totalApproved: 0,
        totalProcessing: 0,
        totalPaid: 0,
        totalFailed: 0,
        totalRejected: 0,
        totalAmount: 0,
        averagePayout: 0,
        monthlyGrowth: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [filters, activeTab]);

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
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeUntilPayout(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [nextPayoutDate]);

  const calculateStats = async (payoutsData: PayoutRequest[]) => {
    // Classic stats calculation
    const totalPending = payoutsData.filter(
      (p) => p.status === "pending"
    ).length;
    const totalApproved = payoutsData.filter(
      (p) => p.status === "approved"
    ).length;
    const totalProcessing = payoutsData.filter(
      (p) => p.status === "processing"
    ).length;
    const totalPaid = payoutsData.filter((p) => p.status === "paid").length;
    const totalFailed = payoutsData.filter((p) => p.status === "failed").length;
    const totalRejected = payoutsData.filter(
      (p) => p.status === "rejected"
    ).length;

    const totalAmountCurrent = payoutsData.reduce(
      (sum, payout) => sum + payout.totalAmount,
      0
    );

    const averagePayout =
      payoutsData.length > 0 ? totalAmountCurrent / payoutsData.length : 0;

    // Calculate monthly growth - retrieve previous month's history
    try {
      const now = new Date();
      let prevMonth = now.getMonth(); // JS: 0-based months
      let prevYear = now.getFullYear();

      if (prevMonth === 0) {
        // If January, return to December previous year
        prevMonth = 11;
        prevYear -= 1;
      } else {
        prevMonth -= 1;
      }

      const historicalPayouts = await apiService.getPayouts({
        month: prevMonth,
        year: prevYear,
        status: "all",
        payoutMethod: "all",
      });

      const totalAmountPrevious = Array.isArray(historicalPayouts)
        ? historicalPayouts.reduce((sum, payout) => sum + payout.totalAmount, 0)
        : 0;

      // Avoid division by zero
      const monthlyGrowth =
        totalAmountPrevious > 0
          ? ((totalAmountCurrent - totalAmountPrevious) / totalAmountPrevious) *
            100
          : 0;

      setStats({
        totalPending,
        totalApproved,
        totalProcessing,
        totalPaid,
        totalFailed,
        totalRejected,
        totalAmount: totalAmountCurrent,
        averagePayout,
        monthlyGrowth: parseFloat(monthlyGrowth.toFixed(2)),
      });
    } catch (error) {
      console.error("Error calculating monthly growth:", error);

      // Otherwise, update with the value without growth
      setStats({
        totalPending,
        totalApproved,
        totalProcessing,
        totalPaid,
        totalFailed,
        totalRejected,
        totalAmount: totalAmountCurrent,
        averagePayout,
        monthlyGrowth: 0,
      });
    }
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
      console.log(`Bulk ${action} for payouts:`, selectedPayouts);

      await apiService.bulkUpdatePayouts({
        action,
        ids: selectedPayouts,
      });

      await fetchPayoutsData();
      setSelectedPayouts([]);
      // toast.success(`${action} completed successfully`);
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      // toast.error("An error occurred while performing the bulk action");
    }
  };

  const handleStatusChange = async (
    payoutId: string,
    newStatus: PayoutStatus
  ) => {
    try {
      await apiService.updatePayoutStatus(payoutId, newStatus);
      await fetchPayoutsData();
    } catch (error) {
      console.error("Error updating payout status:", error);
    }
  };

  const handleExportExcel = async () => {
  try {
    const params = buildFilterParams(filters); // déjà définie dans ton composant
    const blob = await apiService.exportPayoutsToExcel(params);

    // Générer un nom de fichier lisible
    const monthLabel = filters.month !== "all" ? months[parseInt(filters.month)] : "all";
    const yearLabel = filters.year !== "all" ? filters.year : "all";
    const statusLabel = filters.status !== "all" ? filters.status : "all";
    const methodLabel = filters.payoutMethod !== "all" ? filters.payoutMethod : "all";
    const filename = `payouts_${monthLabel}_${yearLabel}_${statusLabel}_${methodLabel}.xlsx`;

    // Télécharger
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
    alert("Failed to export payouts. Please try again.");
  }
};

  const handleImportExcel = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await apiService.importPayoutsExcel(file);
      fetchPayoutsData(); // Refresh list
    } catch (error) {
      console.error("Error importing Excel:", error);
    }
  };

  const handleViewUserSales = async (payout: PayoutRequest) => {
    try {
      console.log(
        "PayoutsPage - handleViewUserSales called with payout:",
        payout
      );
      setLoadingUserSales(true);
      setSelectedUser(payout);

      const userId = payout.userId?._id;
      if (!userId) return;

      const salesData = await apiService.getUserSalesByMonth(
        userId,
        payout.month,
        payout.year
      );

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
      //toast.success("Payout confirmation emails sent successfully!");
    } catch (error) {
      console.error("Error processing payouts:", error);
      //toast.error("An error occurred while processing payouts.");
    } finally {
      setIsProcessing(false);
    }
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Pagination logic
  const getCurrentPageData = () => {
    const data = activeTab === "current" ? payouts : historyPayouts;
    const currentPageNum =
      activeTab === "current" ? currentPage : historyCurrentPage;
    const startIndex = (currentPageNum - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    const data = activeTab === "current" ? payouts : historyPayouts;
    return Math.ceil(data.length / itemsPerPage);
  };

  const handlePageChange = (page: number) => {
    if (activeTab === "current") {
      setCurrentPage(page);
    } else {
      setHistoryCurrentPage(page);
    }
  };

  const handleTabChange = (tab: "current" | "history") => {
    setActiveTab(tab);
    // Reset pagination when switching tabs
    setCurrentPage(1);
    setHistoryCurrentPage(1);
  };

  const handleFilterChange = (newFilters: Partial<PayoutFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    // Reset pagination when filters change
    setCurrentPage(1);
    setHistoryCurrentPage(1);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);

  // Build filter parameters
  function buildFilterParams(
    filters: PayoutFilters
  ): Record<string, string | number> {
    const params: Record<string, string | number> = { ...filters };
    Object.keys(params).forEach((key) => {
      // Remove useless values to avoid sending unnecessary parameters
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

  // Format payout method label
  function getFormattedPayoutMethodLabel(method?: PayoutRequest["_userDefaultPaymentMethod"]): string {
    if (!method) return "N/A";

    switch (method.type) {
      case "paypal":
        return `PayPal - ${method.email || "No email"}`;
      case "paystack":
      case "bank_account": {
        const holder = method.bankHolderName || "No name";
        const bank = method.bankName || "Unknown bank";
        const last4 = method.accountNumberLast4 || method.last4 || "XXXX";
        const recipient = method.paystackRecipientCode ? ` (Recipient: ${method.paystackRecipientCode})` : "";
        const iban = method.iban ? ` - IBAN: ${method.iban}` : "";
        return `${holder} (${bank}) ****${last4}${recipient}${iban}`;
      }
      case "pawapay": {
        const phone = (method as any).phone || "No phone";
        const phoneLast4 = (method as any).phoneLast4 || phone.slice(-4);
        const country = (method as any).countryName || (method as any).country || "Unknown";
        return `Mobile Money - ${country} ****${phoneLast4}`;
      }
      default:
        return method.type;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading payouts data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error Loading Payouts Data
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={fetchPayoutsData}
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Payout Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage monthly payouts and producer earnings distribution
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchPayoutsData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          {activeTab === "current" && (
            <>
              <button
                onClick={handleExportExcel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </button>
              <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Import Excel
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportExcel}
                  className="hidden"
                />
              </label>
            </>
          )}
          <button
            onClick={handleProcessPayouts}
            disabled={isProcessing}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
    ${
      isProcessing
        ? "bg-green-400 cursor-not-allowed"
        : "bg-green-600 hover:bg-green-700"
    }`}
          >
            {isProcessing ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Notify Users
              </>
            )}
          </button>
        </div>
      </div>

      {/* Next Payout Timer */}
      {activeTab === "current" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Timer className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">
                Next payout due: {nextPayoutDate?.toLocaleDateString()}
              </span>
            </div>
            <div className="text-lg font-bold text-blue-900">
              {timeUntilPayout}
            </div>
          </div>
        </div>
      )}

      {/* Payout Stats */}
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-yellow-500">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Payouts
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalPending}
                    </dd>
                    <dd className="text-sm text-gray-500">Awaiting approval</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-blue-500">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Approved
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalApproved}
                    </dd>
                    <dd className="text-sm text-gray-500">
                      Ready for processing
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-green-500">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Amount
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(stats.totalAmount)}
                    </dd>
                    <dd className="text-sm text-gray-500">This month</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-purple-500">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Avg Payout
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(stats.averagePayout)}
                    </dd>
                    <dd className="text-sm text-green-600">
                      +{stats.monthlyGrowth}% growth
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Payout Statistics
            </h3>
            <p className="text-gray-500">
              No payout data available for the selected period. Statistics will
              appear once payout requests are made.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => handleTabChange("current")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "current"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Calendar className="h-4 w-4 mr-2 inline" />
              Current Month Payouts
            </button>
            <button
              onClick={() => handleTabChange("history")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "history"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <History className="h-4 w-4 mr-2 inline" />
              History Payouts
            </button>
          </nav>
        </div>
      </div>

      {/* Monthly Payout Summary - Only for History Tab */}
      {activeTab === "history" && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Monthly Payout Summary
          </h3>
          {historyPayouts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.totalAmount || 0)}
                </div>
                <div className="text-sm text-gray-500">Total Payout Amount</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {historyPayouts.length}
                </div>
                <div className="text-sm text-gray-500">Total Requests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.averagePayout || 0)}
                </div>
                <div className="text-sm text-gray-500">Average Payout</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="h-6 w-6 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No Historical Data
              </h4>
              <p className="text-gray-500">
                No payout data available for {months[parseInt(filters.month)]}{" "}
                {filters.year}. Try selecting a different month or year to view
                historical payouts.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange({ status: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="processing">Processing</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
            <select
              value={filters.month}
              onChange={(e) => handleFilterChange({ month: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange({ year: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payout Method
            </label>
            <select
              value={filters.payoutMethod}
              onChange={(e) =>
                handleFilterChange({ payoutMethod: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Methods</option>
              <option value="paypal">PayPal</option>
              <option value="paystack">Paystack</option>
              <option value="pawapay">Mobile Money (PawaPay)</option>
              <option value="bank_account">Bank Account</option>
              <option value="stripe">Stripe</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                //value={filters.search}
                //onChange={(e) => handleFilterChange({ search: e.target.value })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {activeTab === "current" && selectedPayouts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">
                {selectedPayouts.length} payout(s) selected
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction("approve")}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </button>
              <button
                onClick={() => handleBulkAction("reject")}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </button>
              <button
                onClick={() => handleBulkAction("process")}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
              >
                <DollarSign className="h-4 w-4 mr-1" />
                Process
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payouts Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {activeTab === "current" ? "Monthly Payouts" : "History Payouts"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === "current"
              ? `Manage producer payouts for ${
                  months[parseInt(filters.month)]
                } ${filters.year}`
              : `View historical payouts for ${
                  months[parseInt(filters.month)]
                } ${filters.year}`}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {activeTab === "current" && (
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPayouts(payouts.map((p) => p._id));
                        } else {
                          setSelectedPayouts([]);
                        }
                      }}
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payout Method
                </th>
                {activeTab === "current" && (
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                )}
                {activeTab === "history" && (
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getCurrentPageData().length > 0 ? (
                getCurrentPageData().map((payout) => (
                  <tr
                    key={payout._id}
                    className="hover:bg-blue-50 cursor-pointer transition-colors duration-200"
                    onClick={() => handleViewUserSales(payout)}
                    title="Click to view sales details"
                  >
                    {activeTab === "current" && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedPayouts.includes(payout._id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (e.target.checked) {
                              setSelectedPayouts([
                                ...selectedPayouts,
                                payout._id,
                              ]);
                            } else {
                              setSelectedPayouts(
                                selectedPayouts.filter(
                                  (id) => id !== payout._id
                                )
                              );
                            }
                          }}
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            {payout?.userId?.avatar ? (
                              <Avatar className="h-12 w-12">
                                <img
                                  src={payout.userId.avatar}
                                  alt={`${
                                    payout.userId?.username || "User"
                                  } avatar`}
                                />
                              </Avatar>
                            ) : (
                              <Users className="h-5 w-5 text-gray-600" />
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {payout.userId?.username || "Unknown user"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payout.userId?.email || "No email"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(payout.totalAmount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Total payout balance
                      </div>
                      <div className="text-xs text-gray-400">
                        Combined from all sales
                      </div>
                      {payout.totalAmount > 0 && (
                        <div className="mt-1 text-xs text-gray-400">
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Solo: {formatCurrency(payout.soloAmount || 0)}
                            </span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Collab: {formatCurrency(payout.collabAmount || 0)}
                            </span>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-[220px] whitespace-normal break-words">
                      <div className="text-sm text-gray-900 capitalize">
                        {payout._userDefaultPaymentMethod?.type || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getFormattedPayoutMethodLabel(payout._userDefaultPaymentMethod)}
                      </div>
                    </td>
                    {activeTab === "current" && (
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          <select
                            value={payout.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleStatusChange(
                                payout._id,
                                e.target.value as PayoutStatus
                              );
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className={`text-xs font-medium px-2 py-1 rounded-full border-0 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 text-white ${getStatusBgClass(
                              payout.status
                            )}`}
                          >
                            <option
                              value="pending"
                              className="bg-amber-500 text-white"
                            >
                              Pending
                            </option>
                            <option
                              value="approved"
                              className="bg-blue-500 text-white"
                            >
                              Approved
                            </option>
                            <option
                              value="processing"
                              className="bg-purple-500 text-white"
                            >
                              Processing
                            </option>
                            <option
                              value="paid"
                              className="bg-emerald-600 text-white"
                            >
                              Paid
                            </option>
                            <option
                              value="failed"
                              className="bg-red-500 text-white"
                            >
                              Failed
                            </option>
                            <option
                              value="rejected"
                              className="bg-rose-400 text-white"
                            >
                              Rejected
                            </option>
                            <option
                              value="payment_method_not_found"
                              className="bg-orange-600 text-white"
                            >
                              Payment Method Not Found
                            </option>
                          </select>
                        </div>
                      </td>
                    )}

                    {activeTab === "history" && (
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            <Clock className="h-3 w-3 mr-1" />
                            View Details
                          </span>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={activeTab === "current" ? 6 : 5}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        {activeTab === "current" ? (
                          <Calendar className="h-8 w-8 text-gray-400" />
                        ) : (
                          <History className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {activeTab === "current"
                          ? "No Current Payouts"
                          : "No Historical Payouts"}
                      </h3>
                      <p className="text-gray-500 max-w-sm">
                        {activeTab === "current"
                          ? `No payout requests found for ${
                              months[parseInt(filters.month)]
                            } ${
                              filters.year
                            }. Producers haven't requested payouts yet.`
                          : `No historical payouts found for ${
                              months[parseInt(filters.month)]
                            } ${
                              filters.year
                            }. Try selecting a different month or year.`}
                      </p>
                      {activeTab === "current" && (
                        <div className="mt-4">
                          <button
                            onClick={fetchPayoutsData}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh Data
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {getTotalPages() > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() =>
                  handlePageChange(
                    (activeTab === "current"
                      ? currentPage
                      : historyCurrentPage) - 1
                  )
                }
                disabled={
                  (activeTab === "current"
                    ? currentPage
                    : historyCurrentPage) === 1
                }
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  handlePageChange(
                    (activeTab === "current"
                      ? currentPage
                      : historyCurrentPage) + 1
                  )
                }
                disabled={
                  (activeTab === "current"
                    ? currentPage
                    : historyCurrentPage) === getTotalPages()
                }
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {((activeTab === "current"
                      ? currentPage
                      : historyCurrentPage) -
                      1) *
                      itemsPerPage +
                      1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      (activeTab === "current"
                        ? currentPage
                        : historyCurrentPage) * itemsPerPage,
                      activeTab === "current"
                        ? payouts.length
                        : historyPayouts.length
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {activeTab === "current"
                      ? payouts.length
                      : historyPayouts.length}
                  </span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() =>
                      handlePageChange(
                        (activeTab === "current"
                          ? currentPage
                          : historyCurrentPage) - 1
                      )
                    }
                    disabled={
                      (activeTab === "current"
                        ? currentPage
                        : historyCurrentPage) === 1
                    }
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {/* Page numbers */}
                  {Array.from(
                    { length: Math.min(5, getTotalPages()) },
                    (_, i) => {
                      const currentPageNum =
                        activeTab === "current"
                          ? currentPage
                          : historyCurrentPage;
                      const totalPages = getTotalPages();
                      const pageNum =
                        Math.max(
                          1,
                          Math.min(totalPages - 4, currentPageNum - 2)
                        ) + i;
                      if (pageNum > totalPages) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === currentPageNum
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}

                  <button
                    onClick={() =>
                      handlePageChange(
                        (activeTab === "current"
                          ? currentPage
                          : historyCurrentPage) + 1
                      )
                    }
                    disabled={
                      (activeTab === "current"
                        ? currentPage
                        : historyCurrentPage) === getTotalPages()
                    }
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Sales Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Sales Details for{" "}
                    {selectedUser?.userId?.username || "Unknown User"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedUser.month} {selectedUser.year} • Total Payout:{" "}
                    {formatCurrency(selectedUser.totalAmount)}
                  </p>
                </div>
                <button
                  onClick={() => setShowUserDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {/* Commission Summary */}
              {userSales.length > 0 && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(
                          userSales.reduce((total, sale) => {
                            const saleData = sale as Record<string, unknown>;
                            return total + ((saleData.amount as number) || 0);
                          }, 0)
                        )}
                      </div>
                      <div className="text-sm text-gray-500">Total Sales</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(
                          userSales.reduce((total, sale) => {
                            const saleData = sale as Record<string, unknown>;
                            return (
                              total + ((saleData.platformFee as number) || 0)
                            );
                          }, 0)
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Total Commission
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(
                          userSales.reduce((total, sale) => {
                            const saleData = sale as Record<string, unknown>;
                            return (
                              total + ((saleData.sellerProfit as number) || 0)
                            );
                          }, 0)
                        )}
                      </div>
                      <div className="text-sm text-gray-500">Solo Earnings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(
                          userSales.reduce((total, sale) => {
                            const saleData = sale as Record<string, unknown>;
                            const earningsSplits =
                              (saleData.earningsSplits as Record<
                                string,
                                unknown
                              >[]) || [];
                            return (
                              total +
                              earningsSplits.reduce((splitTotal, split) => {
                                return (
                                  splitTotal + ((split.amount as number) || 0)
                                );
                              }, 0)
                            );
                          }, 0)
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Collaboration Earnings
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sales Table */}
              <div className="mt-4">
                {loadingUserSales ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">
                      Loading sales data...
                    </span>
                  </div>
                ) : userSales.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sale ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Beat Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Commission Taken
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Solo Earnings
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Collaboration Earnings
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            License Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {userSales.map((sale, index) => {
                          const saleData = sale as Record<string, unknown>;
                          const soloAmount =
                            (saleData.sellerProfit as number) || 0;
                          const earningsSplits =
                            (saleData.earningsSplits as Record<
                              string,
                              unknown
                            >[]) || [];
                          const collabAmount = earningsSplits.reduce(
                            (total, split) => {
                              return total + ((split.amount as number) || 0);
                            },
                            0
                          );
                          const totalAmount = (saleData.amount as number) || 0;
                          const platformFee =
                            (saleData.platformFee as number) || 0;
                          const commissionRate =
                            totalAmount > 0
                              ? (platformFee / totalAmount) * 100
                              : 0;
                          const beatId =
                            (saleData.beatId as Record<string, unknown>) || {};
                          const saleId =
                            (saleData._id as string) || `sale_${index}`;
                          const createdAt =
                            (saleData.createdAt as string) ||
                            new Date().toISOString();
                          const licenseName =
                            (saleData.licenseName as string) || "Unknown";

                          return (
                            <tr key={saleId} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                {saleId.slice(-8)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {(beatId.title as string) || "Unknown Beat"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {(beatId.genre as string) || "Unknown Genre"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                {formatCurrency(totalAmount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-red-600">
                                  {formatCurrency(platformFee)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {commissionRate.toFixed(1)}% commission
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                                {formatCurrency(soloAmount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                {formatCurrency(collabAmount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {licenseName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="flex flex-col items-center">
                      <div className="flex-shrink-0">
                        <DollarSign className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Sales Found
                      </h3>
                      {selectedUser?.userId?.username &&
                      selectedUser?.month != null &&
                      selectedUser?.year ? (
                        <p className="text-gray-500">
                          No sales data found for {selectedUser.userId.username}{" "}
                          in {selectedUser.month + 1} {selectedUser.year}.
                        </p>
                      ) : (
                        <p className="text-gray-500">
                          No sales data available.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end pt-4 border-t mt-4">
                <button
                  onClick={() => setShowUserDetails(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
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
