import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import ProtectedRoute from './ProtectedRoute';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Lazy load pages
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Login = lazy(() => import('@/pages/auth/Login'));
const FundList = lazy(() => import('@/pages/funds/FundList'));
const FundDetail = lazy(() => import('@/pages/funds/FundDetail'));
const InvestorList = lazy(() => import('@/pages/investors/InvestorList'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Fund Routes */}
          <Route path="/funds">
            <Route index element={<FundList />} />
            <Route path=":fundId" element={<FundDetail />} />
          </Route>

          {/* Investor Routes */}
          <Route path="/investors">
            <Route index element={<InvestorList />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
