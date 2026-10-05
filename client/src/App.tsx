import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useAppStore } from './store/appStore';
import { ProtectedRoute, getDefaultRouteForRole } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BookingPage } from './pages/BookingPage';
import { DispatchPage } from './pages/DispatchPage';
import { OrdersPage } from './pages/OrdersPage';
import { PricingPage } from './pages/PricingPage';
import { LedgerPage } from './pages/LedgerPage';

const RootRedirect: React.FC = () => {
  const user = useAuthStore(s => s.user);
  return <Navigate to={getDefaultRouteForRole(user?.role)} replace />;
};

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
            <Route index element={<RootRedirect />} />
            
            {/* لوحة التحكم: للإدارة والمحاسب */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'accountant']} />}>
              <Route path="dashboard" element={<DashboardPage />} />
            </Route>

            {/* حجز الشحنة: للإدارة والكاشير */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'cashier']} />}>
              <Route path="booking" element={<BookingPage />} />
            </Route>

            {/* الترحيل والمستودع: للإدارة ومسؤول المستودع */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'warehouse']} />}>
              <Route path="dispatch" element={<DispatchPage />} />
            </Route>

            {/* الطلبات: متاح للجميع */}
            <Route path="orders" element={<OrdersPage />} />

            {/* التسعير: للإدارة والكاشير */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'cashier']} />}>
              <Route path="pricing" element={<PricingPage />} />
            </Route>

            {/* دفتر الأستاذ: للإدارة والمحاسب */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'accountant']} />}>
              <Route path="ledger" element={<LedgerPage />} />
            </Route>
          </Route>
        </Route>

        {/* أي مسار غير معروف يحوّل إلى الصفحة الافتراضية المناسبة للدور */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </>
  );
};

export default App;
