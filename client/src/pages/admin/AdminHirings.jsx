import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Search,
  Calendar,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  Clock,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Filter
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminHirings = () => {
  const { showToast } = useToast();
  const [hirings, setHirings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHirings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      params.append('page', page);
      params.append('limit', 15);

      const res = await apiRequest(`/admin/hirings?${params.toString()}`);
      if (res.success) {
        setHirings(res.hirings || []);
        setStats(res.stats || null);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      showToast('Failed to load hiring records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHirings();
  }, [search, statusFilter, page]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'completed':
      case 'demo_completed':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'in_progress':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'accepted':
      case 'awaiting_payment':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
            Tutor Hirings & Parent Bookings
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
            Live Audit
          </span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          Hired Tutors & Client Hirings Directory
        </h1>
        <p className="text-xs text-slate-500">
          Track every tutor hired by parents, student details, agreed fees, and lesson schedule across Delhi NCR.
        </p>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card-3d space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Hires / Bookings</span>
            <UserCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {stats?.totalHirings || 0}
          </div>
          <p className="text-[11px] text-slate-400">Confirmed or completed tutor contracts</p>
        </div>

        <div className="stat-card-3d space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Unique Tutors Hired</span>
            <GraduationCap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            {stats?.uniqueHiredTutorsCount || 0}
          </div>
          <p className="text-[11px] text-slate-400">Educators successfully placed with students</p>
        </div>

        <div className="stat-card-3d space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Parents Who Hired</span>
            <BookOpen className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-600">
            {stats?.uniqueParentsWhoHiredCount || 0}
          </div>
          <p className="text-[11px] text-slate-400">Unique parents actively hiring tutors</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by tutor, parent, student, or subject..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 w-full sm:w-auto focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            <option value="all">All Hired Statuses</option>
            <option value="confirmed">Confirmed Only</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed Sessions</option>
            <option value="accepted">Accepted / Pending Payment</option>
          </select>
        </div>
      </div>

      {/* Hirings List / Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center text-xs text-slate-400 border border-slate-200">
            Loading hiring details...
          </div>
        ) : hirings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-xs text-slate-400 border border-slate-200">
            No hiring records found matching your filters.
          </div>
        ) : (
          hirings.map((hire) => {
            const tutor = hire.tutorUser || {};
            const tutorProf = hire.tutorProfile || {};
            const parent = hire.parentUser || {};
            const parentProf = hire.parentProfile || {};
            const child = hire.child || hire.childSnapshot || {};
            const fee = hire.fee || {};
            const schedule = hire.schedule || {};

            return (
              <div
                key={hire._id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-5 sm:p-6 space-y-4"
              >
                {/* Top Badge & Date Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getStatusBadge(hire.status)}`}>
                      {hire.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Booking #{hire._id.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium capitalize">
                      {hire.bookingType || 'regular'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Hired on: {new Date(hire.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                {/* Main 3-Column Relationship View */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 1. Tutor Details (Who was hired) */}
                  <div className="bg-teal-50/40 rounded-2xl p-4 border border-teal-100/80 space-y-3">
                    <div className="text-[11px] font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
                      Hired Tutor
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center uppercase shrink-0 text-sm shadow-xs">
                        {tutor.name ? tutor.name[0] : 'T'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-black text-slate-900 text-sm truncate flex items-center gap-1.5">
                          {tutor.name || 'Tutor User'}
                          {tutorProf.verificationBadges?.accountVerified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" title="Verified Tutor" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {tutorProf.headline || 'Verified Educator'}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-teal-100/60">
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="truncate">{tutor.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>{tutor.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>{tutorProf.primaryLocality || 'Delhi NCR'}</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Parent & Student Details (Who hired them) */}
                  <div className="bg-purple-50/40 rounded-2xl p-4 border border-purple-100/80 space-y-3">
                    <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                      Hired By Parent
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center uppercase shrink-0 text-sm shadow-xs">
                        {parent.name ? parent.name[0] : 'P'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-black text-slate-900 text-sm truncate">
                          {parent.name || hire.parentSnapshot?.fullName || 'Parent User'}
                        </div>
                        <div className="text-[11px] text-purple-700 font-semibold">
                          Student: {child.fullName || child.displayName || 'Child'} ({child.classGrade || hire.classGrade})
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-purple-100/60">
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span className="truncate">{parent.email || hire.parentSnapshot?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>{parent.phone || hire.parentSnapshot?.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>{hire.homeTuitionDetails?.studentLocality || parentProf.locality || 'Delhi NCR'}</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Tuition Details & Fee (Subject, Mode, Rate) */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                    <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                      Class & Contract Details
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Subject:</span>
                        <span className="font-black text-slate-900">{hire.subject}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Class / Grade:</span>
                        <span className="font-bold text-slate-800">{hire.classGrade}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Teaching Mode:</span>
                        <span className="font-bold text-slate-800 capitalize">
                          {hire.teachingMode === 'student_home' ? 'Home Tuition' : hire.teachingMode}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Schedule:</span>
                        <span className="font-semibold text-slate-700">
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">Agreed Fee:</span>
                      <div className="flex items-center font-black text-slate-900 text-sm">
                        <IndianRupee className="w-3.5 h-3.5 text-teal-600" />
                        <span>{fee.agreedAmount || fee.totalAmount || 0}</span>
                        <span className="text-[10px] text-slate-500 font-normal ml-1">
                          /{fee.pricingUnit === 'free_demo' ? 'demo' : fee.pricingUnit || 'session'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white cursor-pointer"
          >
            Previous
          </button>
          <span className="text-xs font-semibold text-slate-600 px-3">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
