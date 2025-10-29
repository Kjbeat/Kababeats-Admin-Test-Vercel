/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { 
  CreditCard,
  FileText,
  Download,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  DollarSign,
  RefreshCw,
  Receipt,
  Banknote,
  Wallet,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/DropdownMenu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UserBillingProps {
  user: any;
  userDetails: any;
  stats: any;
  onRefresh: () => void;
  isLoading: boolean;
}

export function UserBilling({ stats }: UserBillingProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };


  // Mock billing data - in real implementation, this would come from API
  const billingData = {
    balance: {
      total: stats?.totalRevenue || 0,
      available: (stats?.totalRevenue || 0) * 0.8,
      pending: (stats?.totalRevenue || 0) * 0.2,
      onHold: 0
    },
    paymentMethods: [
      {
        id: '1',
        type: 'card',
        last4: '4242',
        brand: 'Visa',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true,
        status: 'active'
      },
      {
        id: '2',
        type: 'card',
        last4: '5555',
        brand: 'Mastercard',
        expiryMonth: 8,
        expiryYear: 2026,
        isDefault: false,
        status: 'active'
      },
      {
        id: '3',
        type: 'bank',
        bankName: 'First Bank',
        last4: '1234',
        accountType: 'Checking',
        isDefault: false,
        status: 'pending'
      }
    ],
    transactions: [
      {
        id: '1',
        type: 'purchase',
        amount: 25.50,
        currency: 'USD',
        status: 'completed',
        description: 'Beat Purchase - Midnight Vibes',
        date: '2025-01-12T16:00:00Z',
        paymentMethod: 'Visa •••• 4242',
        transactionId: 'TXN123456789'
      },
      {
        id: '2',
        type: 'sale',
        amount: 50.00,
        currency: 'USD',
        status: 'completed',
        description: 'Beat Sale - Urban Dreams',
        date: '2025-01-11T12:00:00Z',
        paymentMethod: 'PayPal',
        transactionId: 'TXN987654321'
      },
      {
        id: '3',
        type: 'refund',
        amount: -15.00,
        currency: 'USD',
        status: 'completed',
        description: 'Refund - Beat Purchase',
        date: '2025-01-10T10:00:00Z',
        paymentMethod: 'Visa •••• 4242',
        transactionId: 'TXN456789123'
      },
      {
        id: '4',
        type: 'subscription',
        amount: 29.99,
        currency: 'USD',
        status: 'pending',
        description: 'Pro Monthly Subscription',
        date: '2025-01-15T00:00:00Z',
        paymentMethod: 'Visa •••• 4242',
        transactionId: 'TXN789123456'
      }
    ],
    invoices: [
      {
        id: 'INV-001',
        number: 'INV-2025-001',
        date: '2025-01-01T00:00:00Z',
        dueDate: '2025-01-31T00:00:00Z',
        amount: 150.00,
        status: 'paid',
        description: 'Monthly Subscription - January 2025',
        items: [
          { description: 'Pro Monthly Plan', amount: 29.99, quantity: 1 },
          { description: 'Beat Sales', amount: 120.01, quantity: 1 }
        ]
      },
      {
        id: 'INV-002',
        number: 'INV-2024-012',
        date: '2024-12-01T00:00:00Z',
        dueDate: '2024-12-31T00:00:00Z',
        amount: 200.00,
        status: 'paid',
        description: 'Monthly Subscription - December 2024',
        items: [
          { description: 'Pro Monthly Plan', amount: 29.99, quantity: 1 },
          { description: 'Beat Sales', amount: 170.01, quantity: 1 }
        ]
      }
    ],
    spending: {
      thisMonth: 75.50,
      lastMonth: 120.00,
      thisYear: 850.00,
      categories: [
        { name: 'Beat Purchases', amount: 45.50, percentage: 60 },
        { name: 'Subscriptions', amount: 29.99, percentage: 40 },
        { name: 'Fees', amount: 0.01, percentage: 0 }
      ]
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      pending: "outline",
      failed: "destructive",
      cancelled: "destructive",
      paid: "default",
      overdue: "destructive",
      active: "default",
    };
    const labels: Record<string, string> = {
      completed: 'Completed',
      pending: 'Pending',
      failed: 'Failed',
      cancelled: 'Cancelled',
      paid: 'Paid',
      overdue: 'Overdue',
      active: 'Active',
    };
    return <Badge variant={variants[status] || "secondary"}>{labels[status] || status}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
      case 'cancelled':
      case 'overdue':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'sale':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'refund':
        return <RefreshCw className="h-4 w-4 text-orange-600" />;
      case 'subscription':
        return <Zap className="h-4 w-4 text-purple-600" />;
      default:
        return <Banknote className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleAddPaymentMethod = useCallback(() => {
    // TODO: Implement add payment method
    console.log('Adding payment method...');
  }, []);

  const handleUpdatePaymentMethod = useCallback((methodId: string) => {
    // TODO: Implement update payment method
    console.log('Updating payment method:', methodId);
  }, []);

  const handleDeletePaymentMethod = useCallback((methodId: string) => {
    // TODO: Implement delete payment method
    console.log('Deleting payment method:', methodId);
  }, []);

  const handleDownloadInvoice = useCallback((invoiceId: string) => {
    // TODO: Implement download invoice
    console.log('Downloading invoice:', invoiceId);
  }, []);

  const handleViewTransaction = useCallback((transactionId: string) => {
    // TODO: Implement view transaction details
    console.log('Viewing transaction:', transactionId);
  }, []);

  return (
    <div className="space-y-6">
      {/* Billing Overview */}
      <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-border/60">
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent" />
          <CardHeader className="relative z-10 pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10">
                <Wallet className="h-5 w-5 text-blue-600" />
              </span>
              Billing Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-1">
                <h3 className="text-2xl font-semibold tracking-tight text-blue-600">
                  {formatCurrency(billingData.balance.available)}
                </h3>
                <p className="text-sm text-muted-foreground">Available Balance</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-semibold tracking-tight text-orange-600">
                  {formatCurrency(billingData.balance.pending)}
                </h3>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-semibold tracking-tight text-green-600">
                  {formatCurrency(billingData.spending.thisMonth)}
                </h3>
                <p className="text-sm text-muted-foreground">This Month</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-semibold tracking-tight text-purple-600">
                  {formatCurrency(billingData.spending.thisYear)}
                </h3>
                <p className="text-sm text-muted-foreground">This Year</p>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Spending Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {billingData.spending.categories.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="text-sm font-semibold">{formatCurrency(category.amount)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {billingData.transactions.slice(0, 3).map((transaction) => (
                    <div key={transaction.id} className="flex items-center space-x-3">
                      {getTransactionIcon(transaction.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                        </p>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <p className="text-sm text-muted-foreground">View all your transactions</p>
            </CardHeader>
            <CardContent>
              {billingData.transactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingData.transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(transaction.type)}
                            <span className="capitalize">{transaction.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{transaction.description}</TableCell>
                        <TableCell>{transaction.paymentMethod}</TableCell>
                        <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(transaction.status)}
                            {getStatusBadge(transaction.status)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-semibold ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewTransaction(transaction.id)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="mx-auto h-12 w-12 mb-4" />
                  <p className="font-semibold">No Transactions</p>
                  <p className="text-sm">No transactions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <p className="text-sm text-muted-foreground">View and download your invoices</p>
            </CardHeader>
            <CardContent>
              {billingData.invoices.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingData.invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono">{invoice.number}</TableCell>
                        <TableCell>{invoice.description}</TableCell>
                        <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(invoice.status)}
                            {getStatusBadge(invoice.status)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(invoice.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadInvoice(invoice.id)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 mb-4" />
                  <p className="font-semibold">No Invoices</p>
                  <p className="text-sm">No invoices found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <p className="text-sm text-muted-foreground">Manage your payment methods</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {billingData.paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-6 bg-muted rounded flex items-center justify-center">
                        {method.type === 'card' ? (
                          <CreditCard className="h-4 w-4" />
                        ) : (
                          <Banknote className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {method.type === 'card' 
                            ? `${method.brand} •••• ${method.last4}`
                            : `${method.bankName} •••• ${method.last4}`
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {method.type === 'card' 
                            ? `Expires ${method.expiryMonth}/${method.expiryYear}`
                            : `${method.accountType} Account`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {method.isDefault && (
                        <Badge variant="default">Default</Badge>
                      )}
                      <div className="flex items-center gap-2">
                        {getStatusIcon(method.status)}
                        {getStatusBadge(method.status)}
                      </div>
                      <DropdownMenu
                        trigger={
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        }
                      >
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                          <DropdownMenuItem onClick={() => handleUpdatePaymentMethod(method.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Update
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeletePaymentMethod(method.id)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </div>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                <Button className="w-full" variant="outline" onClick={handleAddPaymentMethod}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}