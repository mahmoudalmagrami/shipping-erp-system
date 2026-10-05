import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useAppStore } from './store/appStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BookingPage } from './pages/BookingPage';
import { DispatchPage } from './pages/DispatchPage';
import { OrdersPage } from './pages/OrdersPage';
import { PricingPage } from './pages/PricingPage';
import { LedgerPage } from './pages/LedgerPage';

const App: React.FC = () => {
  const loadFromSession = useAuthStore(s => s.loadFromSession);
  const currentLang = useAppStore(s => s.currentLang);

  useEffect(() => {
    loadFromSession();
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [loadFromSession, currentLang]);

  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="booking" element={<BookingPage />} />
            <Route path="dispatch" element={<DispatchPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="ledger" element={<LedgerPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
};

export default App;
