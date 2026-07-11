import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { ROLES } from '../utils/constants';

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
import BillsPage from '../pages/manager/BillsPage';
import PaymentsPage from '../pages/manager/PaymentsPage';
import ExpensesPage from '../pages/manager/ExpensesPage';
import MealsPage from '../pages/manager/MealsPage';
import NoticesPage from '../pages/manager/NoticesPage';
import ComplaintsPage from '../pages/manager/ComplaintsPage';
import VisitorsPage from '../pages/manager/VisitorsPage';
import SettingsPage from '../pages/manager/SettingsPage';

// Member pages
import MemberDashboard from '../pages/member/MemberDashboard';
import MyBillsPage from '../pages/member/MyBillsPage';
import MyComplaintsPage from '../pages/member/MyComplaintsPage';
import MyRoomPage from '../pages/member/MyRoomPage';
import MyMealsPage from '../pages/member/MyMealsPage';

// Shared pages
import ProfilePage from '../pages/shared/ProfilePage';
import CommunityPage from '../pages/member/CommunityPage';
import NotificationsPage from '../pages/shared/NotificationsPage';

// Not Found & Unauthorized
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-950">
    <div className="text-center">
      <p className="text-9xl font-black text-white/5 select-none">404</p>
      <h1 className="text-2xl font-bold text-white -mt-8">Page Not Found</h1>
      <p className="text-slate-400 mt-2">The page you are looking for does not exist.</p>
      <a href="/" className="mt-6 inline-block px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold">Go Home</a>
    </div>
  </div>
);

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-950">
    <div className="text-center">
      <p className="text-9xl font-black text-white/5 select-none">403</p>
      <h1 className="text-2xl font-bold text-white -mt-8">Access Denied</h1>
      <p className="text-slate-400 mt-2">You don't have permission to view this page.</p>
      <a href="/login" className="mt-6 inline-block px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold">Go to Login</a>
    </div>
  </div>
);

const router = createBrowserRouter([
  // Root redirect
  { path: '/', element: <Navigate to="/login" replace /> },

  // Auth routes
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
          { path: 'bills', element: <BillsPage /> },
          { path: 'payments', element: <PaymentsPage /> },
          { path: 'expenses', element: <ExpensesPage /> },
          { path: 'meals', element: <MealsPage /> },
          { path: 'notices', element: <NoticesPage /> },
          { path: 'complaints', element: <ComplaintsPage /> },
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
          { path: 'room', element: <MyRoomPage /> },
          { path: 'bills', element: <MyBillsPage /> },
          { path: 'meals', element: <MyMealsPage /> },
          { path: 'notices', element: <NoticesPage /> },
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
