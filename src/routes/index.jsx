import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { ROLES } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

/**
 * Smart root redirect: waits for auth to resolve, then sends authenticated
 * users straight to their dashboard instead of bouncing through /login.
 */
const RootRedirect = () => {
  const { isAuthenticated, loading, user, isPending } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage message="Connecting to Home…" />;
  }

  if (isAuthenticated && isPending) return <Navigate to="/pending" replace />;
  if (isAuthenticated && user?.role === 'manager') return <Navigate to="/manager" replace />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

// Layouts
import { AuthLayout } from '../components/layout/AuthLayout';
import DashboardLayout from '../components/layout/DashboardLayout';

// Public
import LoginPage from '../pages/public/LoginPage';
import PendingPage from '../pages/public/PendingPage';

// Manager pages
import ManagerDashboard from '../pages/manager/ManagerDashboard';
import MembersPage from '../pages/manager/MembersPage';
import RoomsPage from '../pages/manager/RoomsPage';
import PaymentsPage from '../pages/manager/PaymentsPage';
import ExpensesPage from '../pages/manager/ExpensesPage';
import MealsPage from '../pages/manager/MealsPage';
import NoticesPage from '../pages/manager/NoticesPage';
import ComplaintsPage from '../pages/manager/ComplaintsPage';
import VisitorsPage from '../pages/manager/VisitorsPage';
import SettingsPage from '../pages/manager/SettingsPage';
import MarketTeamPage from '../pages/manager/MarketTeamPage';

// Member pages
import MemberDashboard from '../pages/member/MemberDashboard';
import MyComplaintsPage from '../pages/member/MyComplaintsPage';
import MyRoomPage from '../pages/member/MyRoomPage';
import MyMealsPage from '../pages/member/MyMealsPage';
import MarketSchedulePage from '../pages/member/MarketSchedulePage';
import MemberExpensesPage from '../pages/member/MemberExpensesPage';

// Shared pages
import ProfilePage from '../pages/shared/ProfilePage';
import CommunityPage from '../pages/member/CommunityPage';
import NotificationsPage from '../pages/shared/NotificationsPage';

// Not Found & Unauthorized
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F5F4EE] dark:bg-[#171C18]">
    <div className="text-center">
      <p className="text-9xl font-black text-[#526B52]/10 dark:text-[#A3B18A]/10 select-none">404</p>
      <h1 className="text-2xl font-extrabold tracking-tight text-[#202720] dark:text-[#F0F1E9] -mt-8">Page Not Found</h1>
      <p className="text-[#687168] dark:text-[#B1B8AC] mt-2 font-medium">The page you are looking for does not exist.</p>
      <a href="/" className="mt-6 inline-block px-6 py-2.5 rounded-xl bg-[#526B52] hover:bg-[#405640] dark:bg-[#A3B18A] dark:hover:bg-[#BAC7A8] text-white dark:text-[#171C18] text-sm font-bold shadow-sm transition-all">Go Home</a>
    </div>
  </div>
);

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F5F4EE] dark:bg-[#171C18]">
    <div className="text-center">
      <p className="text-9xl font-black text-[#DC2626]/10 dark:text-[#EF4444]/10 select-none">403</p>
      <h1 className="text-2xl font-extrabold tracking-tight text-[#202720] dark:text-[#F0F1E9] -mt-8">Access Denied</h1>
      <p className="text-[#687168] dark:text-[#B1B8AC] mt-2 font-medium">You don't have permission to view this page.</p>
      <a href="/login" className="mt-6 inline-block px-6 py-2.5 rounded-xl bg-[#526B52] hover:bg-[#405640] dark:bg-[#A3B18A] dark:hover:bg-[#BAC7A8] text-white dark:text-[#171C18] text-sm font-bold shadow-sm transition-all">Go to Login</a>
    </div>
  </div>
);

const router = createBrowserRouter([
  // Root redirect — waits for auth state then routes to the correct destination
  { path: '/', element: <RootRedirect /> },

  // Auth routes — AuthLayout redirects authenticated users to their dashboard
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
    ],
  },
  {
    path: '/pending',
    element: <PendingPage />,
  },

  // Error routes
  { path: '/unauthorized', element: <Unauthorized /> },
  { path: '*', element: <NotFound /> },

  // ── MANAGER ROUTES ─────────────────────────────────────────
  {
    path: '/manager',
    element: <ProtectedRoute allowedRoles={[ROLES.MANAGER]} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <ManagerDashboard /> },
          { path: 'members', element: <MembersPage /> },
          { path: 'rooms', element: <RoomsPage /> },
          { path: 'payments', element: <PaymentsPage /> },
          { path: 'expenses', element: <ExpensesPage /> },
          { path: 'meals', element: <MealsPage /> },
          { path: 'notices', element: <NoticesPage /> },
          { path: 'complaints', element: <ComplaintsPage /> },
          { path: 'market', element: <MarketTeamPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'notifications', element: <NotificationsPage /> },
        ],
      },
    ],
  },

  // ── MEMBER ROUTES ───────────────────────────────────────────
  {
    path: '/dashboard',
    element: <ProtectedRoute allowedRoles={[ROLES.MEMBER, ROLES.MANAGER]} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MemberDashboard /> },
          { path: 'expenses', element: <MemberExpensesPage /> },
          { path: 'room', element: <MyRoomPage /> },
          { path: 'meals', element: <MyMealsPage /> },
          { path: 'notices', element: <NoticesPage /> },
          { path: 'market', element: <MarketSchedulePage /> },
          { path: 'complaints', element: <MyComplaintsPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
          { path: 'community', element: <CommunityPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'profile', element: <ProfilePage /> },
        ],
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
