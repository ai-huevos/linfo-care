import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-sky-50/30 font-sans text-stone-900">
      <div className="max-w-[1600px] mx-auto flex">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="flex-1 min-w-0 flex flex-col">
          <TopBar onMenuToggle={() => setMobileOpen(!mobileOpen)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-full overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
