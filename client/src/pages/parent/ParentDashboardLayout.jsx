import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  CalendarCheck,
  Heart,
  Star,
  LifeBuoy,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAvatarUrl } from '../../services/api';

export const ParentDashboardLayout = () => {
  const { user } = useAuth();

  const navItems = [
    { to: '/parent', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/parent/children', label: 'My Children', icon: Users },
    { to: '/parent/requirements', label: 'Tuition Requests', icon: FileText },
    { to: '/parent/requirements/new', label: 'Post New Request', icon: PlusCircle, highlight: true },
    { to: '/parent/bookings', label: 'Bookings & Demos', icon: CalendarCheck },
    { to: '/parent/saved-tutors', label: 'Saved Tutors', icon: Heart },
    { to: '/parent/reviews', label: 'My Reviews', icon: Star },
    { to: '/parent/support', label: 'Help & Complaints', icon: LifeBuoy }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Mobile Parent Navigation Bar */}
        <div className="lg:hidden bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3 space-y-3 mb-4">
          <div className="flex items-center gap-3 px-1">
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-700 to-teal-600 text-white font-black text-sm flex items-center justify-center uppercase shadow-sm ring-1 ring-teal-500/20 overflow-hidden shrink-0">
              <span className="select-none">{user?.name?.[0] || 'P'}</span>
              {user?.avatar && (
                <img
                  src={getAvatarUrl(user.avatar)}
                  alt={user?.name || 'Parent'}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </div>
            <div className="truncate flex-1 min-w-0">
              <div className="font-bold text-slate-900 text-sm truncate">{user?.name}</div>
              <div className="text-[11px] text-teal-700 font-semibold">Verified Parent Account</div>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-2 border-t border-slate-100">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-xl text-xs whitespace-nowrap shrink-0 transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : item.highlight
                      ? 'bg-teal-50 text-teal-800 font-semibold border border-teal-200/60'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 font-medium border border-slate-200/60'
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
          {/* Parent Desktop Sidebar */}
          <aside className="hidden lg:block bg-white rounded-3xl border border-slate-200/90 shadow-md card-3d p-5 space-y-6 sticky top-24">
            <div className="flex items-center gap-3 px-2">
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-700 to-teal-600 text-white font-black text-lg flex items-center justify-center uppercase shadow-md ring-2 ring-teal-500/20 overflow-hidden shrink-0">
                <span className="select-none">{user?.name?.[0] || 'P'}</span>
                {user?.avatar && (
                  <img
                    src={getAvatarUrl(user.avatar)}
                    alt={user?.name || 'Parent'}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="truncate">
                <div className="font-bold text-slate-900 text-sm truncate">{user?.name}</div>
                <div className="text-xs text-slate-400 font-medium">Verified Parent Account</div>
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
                      item.highlight
                        ? 'bg-teal-50 text-teal-800 hover:bg-teal-100 font-bold border border-teal-200/60 shadow-2xs'
                        : isActive
                        ? 'bg-slate-900 text-white shadow-md font-bold'
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

          {/* Main Dashboard Workspace */}
          <main className="lg:col-span-3">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
