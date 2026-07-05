import { Outlet } from 'react-router-dom';
// Auth pages (LoginPage) manage their own full-screen layout.
// This layout simply renders the outlet as a pass-through.
export const AuthLayout = () => <Outlet />;
