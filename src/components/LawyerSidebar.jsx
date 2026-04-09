import React, { useState } from 'react';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Landmark,
  BookOpen,
  User,
  LogOut,
  Gavel,
  MessageCircle,
  CheckSquare,
  X
} from 'lucide-react';
import { getCurrentUser, logout } from '../api/authApi.js';

const LawyerSidebar = ({ mobileOpen = false, onClose = () => {} }) => {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      setLogoutLoading(true);
      try {
        logout();
        navigate('/login', { replace: true });
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        setLogoutLoading(false);
      }
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/lawyer-dashboard' },
    { icon: FileText, label: 'Cases', path: '/lawyer-dashboard/cases' },
    { icon: Calendar, label: 'Bookings', path: '/lawyer-dashboard/bookings' },
    { icon: MessageCircle, label: 'Chat', path: '/lawyer-dashboard/chat' },
    { icon: Calendar, label: 'Calendar', path: '/lawyer-dashboard/calendar' },
    { icon: CheckSquare, label: 'Tasks', path: '/lawyer-dashboard/tasks' },

    { icon: Gavel, label: "Judge's Corner", path: '/lawyer-dashboard/judges' },
    { icon: Landmark, label: 'Landmark Cases', path: '/lawyer-dashboard/landmark' },
    { icon: BookOpen, label: 'Case Notes', path: '/lawyer-dashboard/notes' },
    { icon: User, label: 'Profile', path: '/lawyer-dashboard/profile' },
  ];

  if (!user || user.role !== 'lawyer') {
    return null;
  }

  const handleNavClick = () => {
    onClose();
  };

  const sidebarContent = (
    <>
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center justify-between gap-3 lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-sm font-bold text-white shadow-glow">
              LV
            </div>
            <div>
              <h1 className="text-xl font-bold">VERDICTA</h1>
              <p className="text-sm text-slate-300">Legal Services</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 p-2 text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <li key={item.path} className="mb-1">
                <NavLink
                  to={item.path}
                  onClick={handleNavClick}
                  className={`group flex items-center gap-3 rounded-xl p-3 transition-all duration-200 ${
                    isActive ? 'bg-white text-primary shadow-glow' : 'text-slate-100 hover:bg-white/10'
                  }`}
                >
                  <Icon size={20} />
                  <span className="transition-transform group-hover:translate-x-1">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-bold text-primary">
            {user.name?.charAt(0)?.toUpperCase() || 'L'}
          </div>
          <div>
            <p className="font-semibold">{user.name || 'Lawyer'}</p>
            <p className="text-sm text-slate-300">Role: Lawyer</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={logoutLoading}
          className="btn-ghost w-full justify-start bg-white text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut size={20} />
          {logoutLoading ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className="fixed left-0 top-0 z-40 hidden h-screen w-72 border-r border-white/10 bg-primary text-white shadow-2xl lg:flex lg:flex-col">
        {sidebarContent}
      </div>

      <div className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black/45 transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={onClose}
        />
        <div
          className={`absolute left-0 top-0 flex h-screen w-72 max-w-[85vw] flex-col border-r border-white/10 bg-primary text-white shadow-2xl transition-transform duration-300 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  );
};

export default LawyerSidebar;
