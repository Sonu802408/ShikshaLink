import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  CalendarCheck,
  LifeBuoy,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  GraduationCap,
  Activity,
  IndianRupee,
  Clock,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  BookOpen
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminDashboard = () => {
  const { showToast } = useToast();
  const [metrics, setMetrics] = useState(null);
  const [recentHirings, setRecentHirings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, hiringsRes] = await Promise.all([
          apiRequest('/admin/metrics'),
          apiRequest('/admin/hirings?limit=5')
        ]);

        if (metricsRes.success && metricsRes.metrics) {
          setMetrics(metricsRes.metrics);
        }
        if (hiringsRes.success && hiringsRes.hirings) {
          setRecentHirings(hiringsRes.hirings);
        }
      } catch (err) {
        showToast('Failed to load admin metrics', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showToast]);

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading metrics & live activity...</div>;
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'completed':
      case 'demo_completed':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'in_progress':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
            System Control Panel
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Real-Time Monitor
          </span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">Platform Analytics & User Tracking</h1>
        <p className="text-xs text-slate-500">
          Live presence, parent logins, tutor hirings, and verified tuition contracts across Delhi NCR
        </p>
      </div>

      {/* Real-Time Live Presence & Login Tracking Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Live Parents & Tutors Right Now */}
        <div className="stat-card-3d space-y-1 bg-gradient-to-br from-emerald-50/60 to-white border-emerald-200/80">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Users Now
            </span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            {metrics?.totalLiveUsers || 0}
          </div>
          <div className="text-[11px] font-medium text-emerald-800 pt-1 flex items-center gap-2">
            <span>🟢 {metrics?.liveParents || 0} Parents live</span>
            <span>•</span>
            <span>🎓 {metrics?.liveTutors || 0} Tutors live</span>
          </div>
        </div>

        {/* 2. Parents Logged In */}
        <div className="stat-card-3d space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Parents Logged In</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {metrics?.parentsLoggedIn || 0}
            <span className="text-sm font-semibold text-slate-400 ml-1.5">
              / {metrics?.totalParents || 0}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1">
            Active parent accounts with login history
          </div>
        </div>

        {/* 3. Tutors Logged In */}
        <div className="stat-card-3d space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Tutors Logged In</span>
            <GraduationCap className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {metrics?.tutorsLoggedIn || 0}
            <span className="text-sm font-semibold text-slate-400 ml-1.5">
              / {metrics?.totalTutors || 0}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1">
            Verified teachers active on platform
          </div>
        </div>

        {/* 4. Parents Who Made Bookings */}
        <div className="stat-card-3d space-y-1 bg-gradient-to-br from-purple-50/50 to-white border-purple-200/80">
          <div className="flex items-center justify-between text-purple-700">
            <span className="text-xs font-bold uppercase tracking-wider">Parents Who Booked</span>
            <BookOpen className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-700">
            {metrics?.parentsWhoBooked || 0}
          </div>
          <div className="text-[11px] text-purple-800 font-medium pt-1">
            Across {metrics?.totalBookings || 0} total booking sessions
          </div>
        </div>
      </div>

      {/* Secondary KPI Grid (Hirings, Verifications, Complaints) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tutors Hired */}
        <div className="stat-card-3d space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Tutors Hired</span>
            <UserCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-600">
            {metrics?.hiredTutorsCount || 0}
          </div>
          <Link to="/admin/hirings" className="text-[11px] font-bold text-teal-700 hover:underline inline-block pt-1">
            View All Hired Tutors ({metrics?.totalHires || 0} hires) →
          </Link>
        </div>

        {/* Confirmed Bookings */}
        <div className="stat-card-3d space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Confirmed Bookings</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {metrics?.confirmedBookings || 0}
          </div>
          <div className="text-[11px] text-slate-400 pt-1">
            {metrics?.completedBookings || 0} completed sessions
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="stat-card-3d space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Verifications</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            {metrics?.pendingVerifications || 0}
          </div>
          <Link to="/admin/verification" className="text-[11px] font-bold text-amber-700 hover:underline inline-block pt-1">
            Review Queue →
          </Link>
        </div>

        {/* Open Complaints */}
        <div className="stat-card-3d space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Open Complaints</span>
            <LifeBuoy className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600">
            {metrics?.openComplaints || 0}
          </div>
          <Link to="/admin/complaints" className="text-[11px] font-bold text-rose-700 hover:underline inline-block pt-1">
            Resolve issues →
          </Link>
        </div>
      </div>

      {/* Featured Section: Hired Tutors & Parent Hiring Relationships */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                Hiring Contracts & Matches
              </span>
              <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold border border-teal-200">
                Recent Hirings
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">
              Hired Tutors & Parent Hirings
            </h2>
          </div>
          <Link
            to="/admin/hirings"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl btn-3d-navy text-xs uppercase tracking-wider shrink-0"
          >
            <span>View All Hirings</span> <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentHirings.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No recent tutor hiring records found.
            </div>
          ) : (
            recentHirings.map((hire) => {
              const tutor = hire.tutorUser || {};
              const parent = hire.parentUser || {};
              const child = hire.child || hire.childSnapshot || {};
              const fee = hire.fee || {};

              return (
                <div key={hire._id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    {/* Tutor Box */}
                    <div className="flex items-center gap-3 min-w-[240px]">
                      <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center uppercase shrink-0 text-sm shadow-xs">
                        {tutor.name ? tutor.name[0] : 'T'}
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-teal-600 tracking-wider">Hired Tutor</div>
                        <div className="font-bold text-slate-900 text-sm">{tutor.name || 'Tutor User'}</div>
                        <div className="text-[11px] text-slate-500">{hire.subject} • {hire.classGrade}</div>
                      </div>
                    </div>

                    {/* Arrow / Connection */}
                    <div className="hidden lg:flex items-center text-slate-300">
                      <div className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Hired By
                      </div>
                      <ArrowRight className="w-4 h-4 ml-1 text-slate-400" />
                    </div>

                    {/* Parent & Child Box */}
                    <div className="flex items-center gap-3 min-w-[240px]">
                      <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center uppercase shrink-0 text-sm shadow-xs">
                        {parent.name ? parent.name[0] : 'P'}
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-purple-600 tracking-wider">Hired By Parent</div>
                        <div className="font-bold text-slate-900 text-sm">
                          {parent.name || hire.parentSnapshot?.fullName || 'Parent'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          For: {child.fullName || child.displayName || 'Student'} ({child.classGrade || hire.classGrade})
                        </div>
                      </div>
                    </div>

                    {/* Fee & Status */}
                    <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100">
                      <div className="text-right">
                        <div className="text-xs font-black text-slate-900 flex items-center justify-end">
                          <IndianRupee className="w-3.5 h-3.5 text-teal-600" />
                          <span>{fee.agreedAmount || fee.totalAmount || 0}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 capitalize">
                          {hire.teachingMode === 'student_home' ? 'Home Tuition' : hire.teachingMode}
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(hire.status)}`}>
                        {hire.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-3d p-6 sm:p-7 space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
            <UserCheck className="w-5 h-5 text-teal-600" />
            Full Hirings & Contract Directory
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Audit which parents have hired tutors, student details, contact numbers, session schedules, and agreed fees.
          </p>
          <Link
            to="/admin/hirings"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-3d-navy text-xs uppercase tracking-wider"
          >
            <span>Open Hirings Directory</span> <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="card-3d p-6 sm:p-7 space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
            <Users className="w-5 h-5 text-sky-600" />
            User Management & Login Audit
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            See all parent and tutor accounts, check who is currently online live, verify login history, or suspend accounts.
          </p>
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-3d-navy text-xs uppercase tracking-wider"
          >
            <span>Manage Users & Live Status</span> <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
