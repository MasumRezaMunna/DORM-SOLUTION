import { Outlet } from 'react-router-dom';
import DigitalClock from '../shared/DigitalClock';
import SoundToggle from './SoundToggle';

export const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F4EE] dark:bg-[#171C18] text-[#202720] dark:text-[#F0F1E9]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#DDE1D8] dark:border-[#394239] bg-[#F5F4EE]/80 dark:bg-[#171C18]/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <span className="text-xl font-extrabold tracking-tight text-[#526B52] dark:text-[#A3B18A]">Home</span>
          <div className="flex items-center gap-2">
            <DigitalClock />
            <SoundToggle />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#DDE1D8] dark:border-[#394239] py-6 text-center text-sm text-[#687168] dark:text-[#B1B8AC]">
        &copy; {new Date().getFullYear()} Home. All rights reserved.
      </footer>
    </div>
  );
};
