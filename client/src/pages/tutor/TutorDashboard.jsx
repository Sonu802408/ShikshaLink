import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  FileText,
  ShieldCheck,
  Star,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { VerificationBadge } from '../../components/common/Badge';

export const TutorDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [completion, setCompletion] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutorData = async () => {
      try {
        const [profileRes, bookingsRes] = await Promise.all([
          apiRequest('/tutors/profile/me').catch(() => null),
          apiRequest('/bookings/my').catch(() => ({ bookings: [] }))
        ]);

        if (profileRes?.success) {
          setProfile(profileRes.profile);
          setCompletion(profileRes.profileCompletion || 0);
        }
        if (bookingsRes?.bookings) {
          setBookings(bookingsRes.bookings);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTutorData();
  }, []);

  const handleToggleAccepting = async () => {
    const newState = !profile.isAcceptingStudents;
    try {
      const res = await apiRequest('/tutors/profile/me', {
        method: 'PUT',
        body: JSON.stringify({ isAcceptingStudents: newState })
      });
      if (res.success) {
        setProfile(res.profile);
        showToast(
          newState ? 'Profile is now active and visible to parents!' : 'Profile paused. New requests stopped.',
          'success'
        );
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const pendingRequests = bookings.filter((b) => b.status === 'pending');
  const confirmedSessions = bookings.filter((b) => b.status === 'confirmed');

  return (
    <div className="space-y-6">
      {/* Welcome & Status Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Teacher Dashboard</span>
          <h1 className="text-2xl font-black mt-1">Welcome, {user?.name}!</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-lg">
            Manage your schedule, respond to student session requests, and maintain your professional rate card.
          </p>
        </div>

        {/* Toggle Status */}
        {profile && (
          <button
            onClick={handleToggleAccepting}
            className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-md shrink-0 ${
              profile.isAcceptingStudents
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {profile.isAcceptingStudents ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                <span>Accepting Students</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Profile Paused</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Profile Completion & Verification Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Profile Completion Box */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Profile Completeness
            </span>
            <span className="text-xs font-black text-teal-700">{completion}%</span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-sky-600 rounded-full transition-all duration-500"
              style={{ width: `${completion}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500">
              {completion < 100 ? 'Add qualifications & bio to reach 100%' : 'Your profile is 100% complete!'}
            </span>
            <Link to="/tutor/profile" className="font-bold text-teal-600 hover:underline">
              Edit Settings →
            </Link>
          </div>
        </div>

        {/* Verification Status */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Credentials Verification
            </span>
            <Link to="/tutor/qualifications" className="text-xs font-bold text-teal-600 hover:underline">
              Manage Proofs →
            </Link>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {profile?.verificationBadges?.qualificationVerified ? (
              <VerificationBadge type="qualification" />
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Degree Pending Admin Verification
              </span>
            )}

            {profile?.verificationBadges?.backgroundChecked && (
              <VerificationBadge type="background" />
            )}
            <VerificationBadge type="contact" />
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Requests</span>
            <CalendarCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{pendingRequests.length}</div>
          <Link to="/tutor/bookings" className="text-[11px] font-semibold text-amber-600 hover:underline inline-block pt-1">
            Review requests →
          </Link>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Confirmed Sessions</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{confirmedSessions.length}</div>
          <Link to="/tutor/bookings" className="text-[11px] font-semibold text-emerald-600 hover:underline inline-block pt-1">
            View schedule →
          </Link>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Rating & Reviews</span>
            <Star className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {profile?.averageRating?.toFixed(1) || '0.0'} ★
          </div>
          <Link to="/tutor/reviews" className="text-[11px] font-semibold text-teal-600 hover:underline inline-block pt-1">
            {profile?.reviewCount || 0} reviews received →
          </Link>
        </div>
      </div>

      {/* Incoming Requests Feed Preview */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base">Incoming Session Requests</h2>
          <Link to="/tutor/bookings" className="text-xs font-bold text-teal-600 hover:underline">
            Manage All
          </Link>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No pending session requests at the moment.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((b) => (
              <div
                key={b._id}
                className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {b.subject} ({b.classGrade}) request from {b.parentUser?.name}
                  </div>
                  <div className="text-slate-500 mt-0.5 flex items-center gap-3">
                    <span>Date: {new Date(b.schedule?.sessionDate).toLocaleDateString()}</span>
                    <span>Time: {b.schedule?.startTime} - {b.schedule?.endTime}</span>
                    <span className="capitalize font-semibold text-slate-700">Mode: {b.teachingMode?.replace('_', ' ')}</span>
                  </div>
                </div>

                <Link
                  to="/tutor/bookings"
                  className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 transition-colors shadow-xs"
                >
                  Respond Now
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
