import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AdminPlaylistsProvider } from '@/contexts/AdminPlaylistsContext';
import { Layout } from '@/components/layout/Layout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { UsersPage } from '@/pages/users/UsersPage';
import { UserDetailsPage } from '@/pages/users/UserDetailsPage';
import { EnhancedBeatsPage } from '@/pages/beats/EnhancedBeatsPage';
import { ContentPage } from '@/pages/content/ContentPage';
import { PlaylistDetailPage } from '@/pages/content/PlaylistDetailPage';
import { SalesPage } from '@/pages/sales/SalesPage';
// import { TransactionsPage } from '@/pages/transactions/TransactionsPage';
// import { SubscriptionManagementPage } from '@/pages/subscription-management/SubscriptionManagementPage';
import { PayoutsPage } from '@/pages/payouts/PayoutsPage';
import { LicensesPage } from '@/pages/licenses/LicensesPage';
import { SubscriptionsPage } from '@/pages/subscriptions/SubscriptionsPage';
import { AdminUsersPage } from '@/pages/admin-users/AdminUsersPage';
// import { LogsPage } from '@/pages/logs/LogsPage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/users/:id" element={<UserDetailsPage />} />
                <Route path="/beats" element={<EnhancedBeatsPage />} />
                <Route path="/content" element={<ContentPage />} />
                <Route path="/content/:id" element={<PlaylistDetailPage />} />
                <Route path="/licenses" element={<LicensesPage />} />
                <Route path="/subscriptions" element={<SubscriptionsPage />} />
                {/* <Route path="/subscription-management" element={<SubscriptionManagementPage />} /> */}
                <Route path="/sales" element={<SalesPage />} />
                {/* <Route path="/transactions" element={<TransactionsPage />} /> */}
                <Route path="/payouts" element={<PayoutsPage />} />
                <Route path="/admin-users" element={<AdminUsersPage />} />
                {/* <Route path="/logs" element={<LogsPage />} /> */}
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminPlaylistsProvider>
          <Router>
            <AppRoutes />
            <Toaster position="top-right" richColors />
          </Router>
        </AdminPlaylistsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
