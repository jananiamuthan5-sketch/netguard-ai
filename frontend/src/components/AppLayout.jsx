import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 antialiased selection:bg-cyan-500 selection:text-black">
      {/* Top Header - Spanning width */}
      <Header onMenuToggle={() => setMobileOpen((prev) => !prev)} />

      {/* Main Body - Sidebar on left + Page Content on right */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        {/* Scrollable Page Content Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
