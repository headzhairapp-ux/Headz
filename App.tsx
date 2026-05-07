import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import LandingPage from './components/LandingPage';
import HairstyleApp from './components/HairstyleApp';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import NotFound from './components/NotFound';
import SkipToContent from './components/SkipToContent';
import ErrorBoundary from './components/ErrorBoundary';
import Loader from './components/Loader';

const AdminLogin = lazy(() => import('./components/AdminLogin'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const AdminRoute = lazy(() => import('./components/AdminRoute'));
const SuperAdminLogin = lazy(() => import('./components/SuperAdminLogin'));
const SuperAdminDashboard = lazy(() => import('./components/SuperAdminDashboard'));
const SuperAdminRoute = lazy(() => import('./components/SuperAdminRoute'));

const RouteFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader />
  </div>
);

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
        <AuthProvider>
          <ToastProvider>
          <Router>
          <SkipToContent />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<HairstyleApp />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />

            {/* Admin Routes */}
            <Route
              path="/admin/login"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <AdminLogin />
                </Suspense>
              }
            />
            <Route
              path="/admin"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                </Suspense>
              }
            />

            {/* Super Admin Routes */}
            <Route
              path="/super-admin/login"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <SuperAdminLogin />
                </Suspense>
              }
            />
            <Route
              path="/super-admin"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <SuperAdminRoute>
                    <SuperAdminDashboard />
                  </SuperAdminRoute>
                </Suspense>
              }
            />

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Analytics />
          <SpeedInsights />
          </Router>
          </ToastProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  );
};

export default App;
