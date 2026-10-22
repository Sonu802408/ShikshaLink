import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  CalendarCheck,
  FileText,
  LifeBuoy,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminDashboard = () => {
  const { showToast } = useToast();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await apiRequest('/admin/metrics');
        if (res.success && res.metrics) {
          setMetrics(res.metrics);
        }
      } catch (err) {
        showToast('Failed to load admin metrics', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [showToast]);

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading metrics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-1">
        <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
          System Control Panel
        </span>
        <h1 className="text-2xl font-black text-slate-900">Platform Analytics & Metrics</h1>
        <p className="text-xs text-slate-500">
          Real-time metrics, tutor document reviews, and dispute resolutions across Delhi NCR
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Verifications */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Verifications</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {metrics?.pendingVerifications || 0}
          </div>
          <Link to="/admin/verification" className="text-[11px] font-bold text-amber-700 hover:underline inline-block pt-1">
            Review Queue →
          </Link>
        </div>

        {/* Total Users */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {metrics?.totalUsers || 0}
          </div>
          <div className="text-[11px] text-slate-400 pt-1">
            {metrics?.totalParents || 0} Parents • {metrics?.totalTutors || 0} Tutors
          </div>
        </div>

        {/* Confirmed Bookings */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Confirmed Bookings</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {metrics?.confirmedBookings || 0}
          </div>
          <div className="text-[11px] text-slate-400 pt-1">
            {metrics?.completedBookings || 0} completed sessions
          </div>
        </div>

        {/* Open Complaints */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Open Complaints</span>
            <LifeBuoy className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">
            {metrics?.openComplaints || 0}
          </div>
          <Link to="/admin/complaints" className="text-[11px] font-bold text-rose-700 hover:underline inline-block pt-1">
            Resolve issues →
          </Link>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            Tutor Document Verification Queue
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Review uploaded university degrees, marksheets, and government IDs. Approve or reject with recorded audit reasons.
          </p>
          <Link
            to="/admin/verification"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
          >
            Open Verification Queue <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
            <LifeBuoy className="w-5 h-5 text-sky-600" />
            Complaints, Disputes & Replacements
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Handle parent and tutor support tickets, review cancellation issues, and assign suitable replacement tutors.
          </p>
          <Link
            to="/admin/complaints"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
          >
            Manage Support Tickets <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
