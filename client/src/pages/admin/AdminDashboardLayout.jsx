import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  LifeBuoy,
  Star,
  Settings,
  Activity,
  DollarSign,
  GraduationCap,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboardLayout = () => {
  const { user } = useAuth();

  const navItems = [
    { to: '/admin', label: 'Platform Metrics', icon: LayoutDashboard, end: true },
    { to: '/admin/hirings', label: 'Hired Tutors & Hirings', icon: UserCheck },
    { to: '/admin/tutors', label: 'Manage Tutors', icon: GraduationCap },
    { to: '/admin/payments', label: 'Payments & Payouts', icon: DollarSign },
    { to: '/admin/verification', label: 'Verification Queue', icon: ShieldCheck, badge: true },
    { to: '/admin/users', label: 'User Accounts', icon: Users },
    { to: '/admin/complaints', label: 'Complaints & Disputes', icon: LifeBuoy },
    { to: '/admin/reviews', label: 'Reviews Moderation', icon: Star },
    { to: '/admin/settings', label: 'Platform Settings', icon: Settings },
    { to: '/admin/audit-logs', label: 'Audit & Security Logs', icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Mobile Admin Navigation Bar */}
        <div className="lg:hidden bg-slate-900 text-white rounded-2xl p-3 space-y-3 mb-4 shadow-lg border border-slate-800">
          <div className="flex items-center gap-3 px-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-400 to-emerald-400 text-slate-950 font-black text-base flex items-center justify-center uppercase shadow-sm shrink-0">
              A
            </div>
            <div className="truncate flex-1 min-w-0">
              <div className="font-bold text-white text-sm truncate">{user?.name}</div>
              <div className="text-[11px] text-teal-400 font-bold uppercase tracking-wider">Super Administrator</div>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-2 border-t border-slate-800">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-xl text-xs whitespace-nowrap shrink-0 transition-all ${
                    isActive
                      ? 'bg-teal-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:text-white font-medium'
                  }`
                }
              >
                <item.icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Admin Desktop Sidebar */}
          <aside className="hidden lg:block bg-slate-900 text-white rounded-3xl p-5 space-y-6 shadow-xl card-3d border border-slate-800 sticky top-24">
            <div className="flex items-center gap-3 px-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-400 to-emerald-400 text-slate-950 font-black text-lg flex items-center justify-center uppercase shadow-md ring-2 ring-teal-400/30">
                A
              </div>
              <div className="truncate">
                <div className="font-bold text-white text-sm truncate">{user?.name}</div>
                <div className="text-xs text-teal-400 font-bold uppercase tracking-wider">Super Administrator</div>
              </div>
            </div>

            <nav className="space-y-1 text-xs font-semibold">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-teal-500 text-slate-950 font-bold shadow-md'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* Admin Workspace */}
          <main className="lg:col-span-3">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
