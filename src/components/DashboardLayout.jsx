import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import LawyerSidebar from './LawyerSidebar';
import { getCurrentUser } from '../api/authApi.js';

const DashboardLayout = () => {
  const user = getCurrentUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user || user.role !== 'lawyer') {
    return <div className="app-shell-dark flex items-center justify-center p-8">Not authorized for Lawyer Dashboard</div>;
  }

  return (
    <div className="app-shell-dark">
      <LawyerSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-primary/90 px-4 py-4 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="btn-secondary px-4 py-2"
        >
          <Menu size={18} />
          Menu
        </button>
        <div className="text-sm font-semibold text-white">Lawyer Dashboard</div>
      </div>
      <div className="ml-0 min-w-0 p-4 transition-all duration-300 sm:p-6 lg:ml-72 lg:p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
