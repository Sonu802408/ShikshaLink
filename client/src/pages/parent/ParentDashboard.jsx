import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  CalendarCheck,
  Heart,
  PlusCircle,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const ParentDashboard = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [childrenRes, reqRes, bookingsRes] = await Promise.all([
          apiRequest('/parents/children').catch(() => ({ children: [] })),
          apiRequest('/requirements/my').catch(() => ({ requirements: [] })),
          apiRequest('/bookings/my').catch(() => ({ bookings: [] }))
        ]);

        if (childrenRes.children) setChildren(childrenRes.children);
        if (reqRes.requirements) setRequirements(reqRes.requirements);
        if (bookingsRes.bookings) setBookings(bookingsRes.bookings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const activeBookings = bookings.filter((b) => ['pending', 'accepted', 'confirmed', 'alternative_proposed'].includes(b.status));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-sky-950 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Parent Workspace</span>
          <h1 className="text-2xl font-black mt-1">Hello, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-xs text-slate-300 mt-1">
            Manage your child profiles, explore matched tutors, and monitor scheduled tuition sessions.
          </p>
        </div>
        <Link
          to="/parent/requirements/new"
          className="px-5 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all shrink-0 flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Post New Request
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Children Profiles</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{children.length}</div>
          <Link to="/parent/children" className="text-[11px] font-semibold text-teal-600 hover:underline inline-block pt-1">
            View profiles →
          </Link>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Tuition Requests</span>
            <FileText className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{requirements.length}</div>
          <Link to="/parent/requirements" className="text-[11px] font-semibold text-sky-600 hover:underline inline-block pt-1">
            Manage requirements →
          </Link>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Bookings</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{activeBookings.length}</div>
          <Link to="/parent/bookings" className="text-[11px] font-semibold text-emerald-600 hover:underline inline-block pt-1">
            View upcoming schedule →
          </Link>
        </div>
      </div>

      {/* Upcoming / Active Bookings List */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base">Recent Sessions & Booking Requests</h2>
          <Link to="/parent/bookings" className="text-xs font-bold text-teal-600 hover:underline">
            View All
          </Link>
        </div>

        {activeBookings.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No active session bookings. Discover tutors or submit a tuition requirement to get started!
          </div>
        ) : (
          <div className="space-y-3">
            {activeBookings.slice(0, 3).map((b) => (
              <div
                key={b._id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {b.subject} ({b.classGrade}) with {b.tutorUser?.name}
                  </div>
                  <div className="text-slate-500 mt-0.5 flex items-center gap-3">
                    <span>Date: {new Date(b.schedule?.sessionDate).toLocaleDateString()}</span>
                    <span>Time: {b.schedule?.startTime} - {b.schedule?.endTime}</span>
                    <span className="capitalize font-semibold text-slate-700">Mode: {b.teachingMode?.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    b.status === 'confirmed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : b.status === 'alternative_proposed'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {b.status.replace('_', ' ')}
                  </span>
                  <Link
                    to="/parent/bookings"
                    className="px-3 py-1.5 rounded-xl border border-slate-300 font-bold hover:bg-white text-slate-700"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
