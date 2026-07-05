import { Outlet } from 'react-router-dom';

export const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Navbar Placeholder */}
      <header className="sticky top-0 z-50 w-full border-b border-divider bg-background/70 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <span className="text-xl font-bold text-primary">4/67 Home</span>
          {/* Navigation Links Placeholder */}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer Placeholder */}
      <footer className="border-t border-divider py-6 text-center text-sm text-default-500">
        &copy; {new Date().getFullYear()} 4/67 Home. All rights reserved.
      </footer>
    </div>
  );
};
