import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Bell,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  CalendarCheck,
  FileText,
  Shield,
  Heart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export const Navbar = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (role === 'admin') return '/admin';
    if (role === 'tutor') return '/tutor';
    return '/parent';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-sky-950 to-teal-900 bg-clip-text text-transparent">
                ShikshaLink
              </span>
              <span className="text-[10px] -mt-1 font-semibold tracking-wider text-teal-600 uppercase">
                Tutor Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link
              to="/find-tutors"
              className={`hover:text-teal-600 transition-colors ${location.pathname === '/find-tutors' && !location.search ? 'text-teal-600 font-semibold' : ''}`}
            >
              Find Tutors
            </Link>
            <Link
              to="/find-tutors?mode=online"
              className={`hover:text-teal-600 transition-colors ${location.search.includes('online') ? 'text-teal-600 font-semibold' : ''}`}
            >
              Online Tutors
            </Link>
            <Link
              to="/find-tutors?mode=student_home"
              className={`hover:text-teal-600 transition-colors ${location.search.includes('student_home') ? 'text-teal-600 font-semibold' : ''}`}
            >
              Home Tutors
            </Link>
            <Link
              to="/find-tutors?mode=tutor_centre"
              className={`hover:text-teal-600 transition-colors ${location.search.includes('tutor_centre') ? 'text-teal-600 font-semibold' : ''}`}
            >
              Tutors at Centres
            </Link>
            <Link
              to="/how-it-works"
              className={`hover:text-teal-600 transition-colors ${location.pathname === '/how-it-works' ? 'text-teal-600 font-semibold' : ''}`}
            >
              How It Works
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {role !== 'tutor' && role !== 'admin' && (
              <Link
                to="/become-a-tutor"
                className="text-xs font-semibold px-3 py-2 text-slate-700 hover:text-teal-600 transition-colors"
              >
                Become a Tutor
              </Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Notifications dropdown button */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setUserDropdownOpen(false);
                    }}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full relative transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="font-semibold text-slate-900 text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-teal-600 hover:underline font-medium"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-500">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 6).map((n) => (
                            <div
                              key={n._id}
                              onClick={() => {
                                markAsRead(n._id);
                                if (n.link) {
                                  navigate(n.link);
                                  setNotifDropdownOpen(false);
                                }
                              }}
                              className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                                !n.isRead ? 'bg-sky-50/60 font-medium' : ''
                              }`}
                            >
                              <div className="font-semibold text-slate-800">{n.title}</div>
                              <div className="text-slate-600 mt-0.5 line-clamp-2">{n.message}</div>
                              <div className="text-[10px] text-slate-400 mt-1">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User menu dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(!userDropdownOpen);
                      setNotifDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-sm font-medium text-slate-700"
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold uppercase">
                      {user?.name?.[0] || 'U'}
                    </div>
                    <span className="max-w-[100px] truncate">{user?.name?.split(' ')[0]}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-sm">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <div className="font-semibold text-slate-900 truncate">{user?.name}</div>
                        <div className="text-xs text-slate-500 truncate">{user?.email}</div>
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 uppercase">
                          {user?.role}
                        </span>
                      </div>

                      <Link
                        to={getDashboardLink()}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-500" />
                        Dashboard
                      </Link>

                      {role === 'parent' && (
                        <>
                          <Link
                            to="/parent/requirements"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50"
                          >
                            <FileText className="w-4 h-4 text-slate-500" />
                            My Tuition Requests
                          </Link>
                          <Link
                            to="/parent/bookings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50"
                          >
                            <CalendarCheck className="w-4 h-4 text-slate-500" />
                            Bookings & Demos
                          </Link>
                          <Link
                            to="/parent/saved-tutors"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50"
                          >
                            <Heart className="w-4 h-4 text-slate-500" />
                            Saved Tutors
                          </Link>
                        </>
                      )}

                      {role === 'tutor' && (
                        <>
                          <Link
                            to="/tutor/bookings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50"
                          >
                            <CalendarCheck className="w-4 h-4 text-slate-500" />
                            Session Requests
                          </Link>
                          <Link
                            to="/tutor/qualifications"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50"
                          >
                            <Shield className="w-4 h-4 text-slate-500" />
                            Verification Proofs
                          </Link>
                        </>
                      )}

                      <div className="border-t border-slate-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 text-left font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col gap-2 font-medium text-slate-700 text-sm">
            <Link
              to="/find-tutors"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              Find Tutors
            </Link>
            <Link
              to="/find-tutors?mode=online"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              Online Tutors
            </Link>
            <Link
              to="/find-tutors?mode=student_home"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              Home Tutors (Mayur Vihar & Delhi NCR)
            </Link>
            <Link
              to="/find-tutors?mode=tutor_centre"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              Tutors at Teaching Centres
            </Link>
            <Link
              to="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              How It Works
            </Link>
            <Link
              to="/become-a-tutor"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-teal-600 font-semibold hover:bg-teal-50"
            >
              Become a Tutor
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-200">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3">
                  Signed in as {user?.name}
                </div>
                <Link
                  to={getDashboardLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg bg-teal-50 text-teal-800 font-semibold text-sm"
                >
                  Open Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-rose-600 font-medium text-sm"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-semibold rounded-xl border border-slate-300 text-slate-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-semibold rounded-xl bg-slate-900 text-white"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
