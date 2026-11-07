import React, { useState, useEffect } from 'react';
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
  Heart,
  Sparkles,
  ShoppingBag
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

  // Automatically close mobile menu and dropdowns whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
  }, [location.pathname, location.search]);

  const handleTutorNavigation = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login?redirect=/tutor/register&role=tutor');
      return;
    }
    if (role === 'tutor') {
      try {
        const res = await apiRequest('/tutors/profile/me');
        if (res.success && res.profile?.profileStatus === 'published') {
          navigate('/tutor');
        } else {
          navigate('/tutor/register');
        }
      } catch (err) {
        navigate('/tutor/register');
      }
    } else {
      navigate('/tutor/register');
    }
  };

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
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand with 3D Embossed Effect */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-teal-600 to-teal-500 flex items-center justify-center text-white shadow-[0_4px_12px_rgba(13,148,136,0.35)] group-hover:scale-105 group-hover:-translate-y-0.5 transition-all duration-200 border-t border-white/30">
              <GraduationCap className="w-6 h-6 drop-shadow-xs" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-sky-950 to-teal-900 bg-clip-text text-transparent">
                ShikshaLink
              </span>
              <span className="text-[10px] -mt-1 font-extrabold tracking-wider text-teal-600 uppercase flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Tutor Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links with Subtle Depth Pill */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/60 shadow-inner">
            <Link
              to="/find-tutors"
              className={`px-3 py-1.5 rounded-xl transition-all duration-200 ${
                location.pathname === '/find-tutors' && !location.search
                  ? 'bg-white text-teal-800 shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
                  : 'hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Find Tutors
            </Link>
            <Link
              to="/find-tutors?mode=online"
              className={`px-3 py-1.5 rounded-xl transition-all duration-200 ${
                location.search.includes('online')
                  ? 'bg-white text-teal-800 shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
                  : 'hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Online Tutors
            </Link>
            <Link
              to="/find-tutors?mode=student_home"
              className={`px-3 py-1.5 rounded-xl transition-all duration-200 ${
                location.search.includes('student_home')
                  ? 'bg-white text-teal-800 shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
                  : 'hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Home Tutors
            </Link>
            <Link
              to="/find-tutors?mode=tutor_centre"
              className={`px-3 py-1.5 rounded-xl transition-all duration-200 ${
                location.search.includes('tutor_centre')
                  ? 'bg-white text-teal-800 shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
                  : 'hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Tutors at Centres
            </Link>
            <Link
              to="/how-it-works"
              className={`px-3 py-1.5 rounded-xl transition-all duration-200 ${
                location.pathname === '/how-it-works'
                  ? 'bg-white text-teal-800 shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
                  : 'hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              How It Works
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {role !== 'tutor' && role !== 'admin' && (
              <button
                onClick={handleTutorNavigation}
                className="text-xs font-bold px-3 py-2 text-slate-700 hover:text-teal-700 transition-colors cursor-pointer"
              >
                I am a Tutor
              </button>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Tutor Cart Shortcut */}
                {role === 'tutor' && (
                  <Link
                    to="/tutor/cart"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs transition-all border border-teal-200/80 shadow-2xs"
                    title="My Application & Cart"
                  >
                    <ShoppingBag className="w-4 h-4 text-teal-600" />
                    <span>Cart</span>
                  </Link>
                )}

                {/* Notifications dropdown button */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setUserDropdownOpen(false);
                    }}
                    className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full relative transition-all duration-150 active:scale-95 shadow-2xs"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-xs animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-[0_20px_40px_-10px_rgba(15,23,42,0.18)] border border-slate-200/90 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-teal-600 hover:underline font-bold"
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
                                !n.isRead ? 'bg-sky-50/70 font-semibold' : ''
                              }`}
                            >
                              <div className="font-bold text-slate-800">{n.title}</div>
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

                {/* User menu dropdown with 3D profile pill */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(!userDropdownOpen);
                      setNotifDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border border-slate-200/80 bg-white hover:bg-slate-50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-sm active:translate-y-0.5 transition-all text-xs font-bold text-slate-800"
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black uppercase shadow-xs">
                      {user?.name?.[0] || 'U'}
                    </div>
                    <span className="max-w-[110px] truncate">{user?.name?.split(' ')[0]}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-3xl shadow-[0_20px_40px_-10px_rgba(15,23,42,0.18)] border border-slate-200/90 py-2.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <div className="font-bold text-slate-900 truncate">{user?.name}</div>
                        <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                        <span className="inline-block mt-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 uppercase tracking-wider border border-teal-200/60">
                          {user?.role}
                        </span>
                      </div>

                      <Link
                        to={getDashboardLink()}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 font-bold"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        Dashboard
                      </Link>

                      {role === 'parent' && (
                        <>
                          <Link
                            to="/parent/requirements"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 font-semibold"
                          >
                            <FileText className="w-4 h-4 text-slate-400" />
                            My Tuition Requests
                          </Link>
                          <Link
                            to="/parent/bookings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 font-semibold"
                          >
                            <CalendarCheck className="w-4 h-4 text-slate-400" />
                            Bookings & Demos
                          </Link>
                          <Link
                            to="/parent/saved-tutors"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 font-semibold"
                          >
                            <Heart className="w-4 h-4 text-slate-400" />
                            Saved Tutors
                          </Link>
                        </>
                      )}

                      {role === 'tutor' && (
                        <>
                          <Link
                            to="/tutor/cart"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 font-semibold"
                          >
                            <ShoppingBag className="w-4 h-4 text-slate-400" />
                            Application & Cart
                          </Link>
                          <Link
                            to="/tutor/bookings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 font-semibold"
                          >
                            <CalendarCheck className="w-4 h-4 text-slate-400" />
                            Session Requests
                          </Link>
                          <Link
                            to="/tutor/qualifications"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 font-semibold"
                          >
                            <Shield className="w-4 h-4 text-slate-400" />
                            Verification Proofs
                          </Link>
                        </>
                      )}

                      {role === 'admin' && (
                        <>
                          <Link
                            to="/admin/tutors"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 font-semibold"
                          >
                            <GraduationCap className="w-4 h-4 text-slate-400" />
                            Manage Tutors
                          </Link>
                        </>
                      )}

                      <div className="border-t border-slate-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 text-left font-bold"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-3d-navy px-4 py-2 rounded-xl text-xs"
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
              className="p-2 text-slate-600 hover:text-slate-900 rounded-xl bg-slate-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu as Floating Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-16 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute top-16 left-0 right-0 z-50 lg:hidden border-b border-slate-200 bg-white/98 backdrop-blur-md px-4 pt-3 pb-6 space-y-3 shadow-2xl max-h-[80vh] overflow-y-auto animate-in slide-in-from-top-2 duration-150">
            <div className="flex flex-col gap-1 font-bold text-slate-700 text-xs">
              <Link
                to="/find-tutors"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Find Tutors
              </Link>
              <Link
                to="/find-tutors?mode=online"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Online Tutors
              </Link>
              <Link
                to="/find-tutors?mode=student_home"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Home Tutors (Mayur Vihar & Delhi NCR)
              </Link>
              <Link
                to="/find-tutors?mode=tutor_centre"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Tutors at Teaching Centres
              </Link>
              <Link
                to="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                How It Works
              </Link>
              <Link
                to="/become-a-tutor"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-teal-700 font-extrabold hover:bg-teal-50 transition-colors"
              >
                Become a Tutor
              </Link>
            </div>

            <div className="pt-3 border-t border-slate-200">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3">
                    Signed in as {user?.name}
                  </div>
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-xl bg-teal-50 text-teal-800 font-bold text-xs"
                  >
                    Open Dashboard
                  </Link>
                  {role === 'tutor' && (
                    <Link
                      to="/tutor/cart"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold text-xs"
                    >
                      Application & Cart
                    </Link>
                  )}
                  {role === 'admin' && (
                    <Link
                      to="/admin/tutors"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold text-xs"
                    >
                      Manage Tutors
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-rose-600 font-bold text-xs hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-center text-xs font-bold rounded-xl border border-slate-300 text-slate-700"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-3d-navy w-full py-2.5 text-center text-xs"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
};
