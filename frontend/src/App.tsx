import { Routes, Route, Navigate } from "react-router";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { getProfile } from "./features/auth/authSlice";

// Pages
import LoginPage from "./features/auth/LoginPage";
import FundsListPage from "./features/funds/FundsListPage";
import FundCreatePage from "./features/funds/FundCreatePage";
import InvestmentsListPage from "./features/investments/InvestmentsListPage";
import InvestmentCreatePage from "./features/investments/InvestmentCreatePage";
import ValuationsPage from "./features/investments/ValuationsPage";
import InvestorsListPage from "./features/investors/InvestorsListPage";
import InvestorCreatePage from "./features/investors/InvestorCreatePage";
import CapitalCallsPage from "./features/investors/CapitalCallsPage";
import DistributionsPage from "./features/investors/DistributionsPage";
import TransactionsPage from "./features/transactions/TransactionsPage";
import PerformanceReportPage from "./features/reports/PerformanceReportPage";
import InvestorReportPage from "./features/reports/InvestorReportPage";
import DocumentsPage from "./pages/Documents/DocumentsPage";
import CalendarPage from "./pages/Calendar/CalendarPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Dashboard/Home";

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getProfile());
    }
  }, [isAuthenticated, dispatch]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Home />} />

        {/* Funds Management */}
        <Route path="/funds" element={<FundsListPage />} />
        <Route path="/funds/create" element={<FundCreatePage />} />

        {/* Investment Management */}
        <Route path="/investments" element={<InvestmentsListPage />} />
        <Route path="/investments/create" element={<InvestmentCreatePage />} />
        <Route path="/valuations" element={<ValuationsPage />} />

        {/* Investor Management */}
        <Route path="/investors" element={<InvestorsListPage />} />
        <Route path="/investors/create" element={<InvestorCreatePage />} />
        <Route path="/capital-calls" element={<CapitalCallsPage />} />
        <Route path="/distributions" element={<DistributionsPage />} />

        {/* Transactions */}
        <Route path="/transactions" element={<TransactionsPage />} />

        {/* Reports */}
        <Route path="/reports/performance" element={<PerformanceReportPage />} />
        <Route path="/reports/investors" element={<InvestorReportPage />} />

        {/* Others */}
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
