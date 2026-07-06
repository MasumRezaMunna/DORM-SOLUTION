import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from '@heroui/react';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, loading, user, isPending } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Redirect pending members to the pending page (unless this route IS the pending page itself, handled in router)
  if (isPending) {
    return <Navigate to="/pending" replace />;
  }

  return <Outlet />;
};
