import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const getDefaultRouteForRole = (role?: string) => {
  switch (role) {
    case 'cashier': return '/booking';
    case 'warehouse': return '/dispatch';
    case 'accountant': return '/ledger';
    default: return '/dashboard';
  }
};

interface Props {
  allowedRoles?: ('admin' | 'cashier' | 'warehouse' | 'accountant')[];
}

export const ProtectedRoute: React.FC<Props> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role as any)) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return <Outlet />;
};
