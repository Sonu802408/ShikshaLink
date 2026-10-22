import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  Calendar,
  CalendarCheck,
  FileText,
  ShieldCheck,
  Star,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const TutorDashboardLayout = () => {
  const { user } = useAuth();

  const navItems = [
    { to: '/tutor', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/tutor/bookings', label: 'Session & Demo Requests', icon: CalendarCheck },
    { to: '/tutor/requirements', label: 'Tuition Opportunities', icon: FileText },
    { to: '/tutor/profile', label: 'Profile & Fee Settings', icon: Settings },
    { to: '/tutor/availability', label: 'Weekly Schedule', icon: Calendar },
    { to: '/tutor/qualifications', label: 'Degrees & Verification', icon: ShieldCheck },
    { to: '/tutor/reviews', label: 'Student Reviews', icon: Star }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Tutor Sidebar */}
          <aside className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-bold text-lg flex items-center justify-center uppercase shadow-sm">
                {user?.name?.[0] || 'T'}
              </div>
              <div className="truncate">
                <div className="font-bold text-slate-900 text-sm truncate">{user?.name}</div>
                <div className="text-xs text-slate-400 font-medium">Verified Tutor Account</div>
              </div>
            </div>

            <nav className="space-y-1 text-xs font-semibold">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* Main Tutor Workspace */}
          <main className="lg:col-span-3">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
