import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner } from '@heroui/react';

/**
 * Auth layout — wraps public pages like /login.
 * If the user is already authenticated, redirect them to their dashboard
 * so they never see the login page again after a successful login.
 */
export const AuthLayout = () => {
  const { isAuthenticated, loading, user, isPending } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (isAuthenticated && !isPending) {
    return <Navigate to={user?.role === 'manager' ? '/manager' : '/dashboard'} replace />;
  }

  if (isAuthenticated && isPending) {
    return <Navigate to="/pending" replace />;
  }

  return <Outlet />;
};
