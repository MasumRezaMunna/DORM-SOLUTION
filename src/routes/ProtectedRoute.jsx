import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, loading, user, isPending } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage message="Verifying session…" />;
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
