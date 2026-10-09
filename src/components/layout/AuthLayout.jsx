import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';

/**
 * Auth layout — wraps public pages like /login.
 * If the user is already authenticated, redirect them to their dashboard
 * so they never see the login page again after a successful login.
 */
export const AuthLayout = () => {
  const { isAuthenticated, loading, user, isPending } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage message="Checking session…" />;
  }

  if (isAuthenticated && !isPending) {
    return <Navigate to={user?.role === 'manager' ? '/manager' : '/dashboard'} replace />;
  }

  if (isAuthenticated && isPending) {
    return <Navigate to="/pending" replace />;
  }

  return <Outlet />;
};
