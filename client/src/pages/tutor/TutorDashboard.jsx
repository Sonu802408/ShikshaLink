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
  ToggleRight,
  ShoppingBag,
  FileEdit,
  RotateCcw
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
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutorData = async () => {
      try {
        const [profileRes, bookingsRes, earningsRes] = await Promise.all([
          apiRequest('/tutors/profile/me').catch(() => null),
          apiRequest('/bookings/my').catch(() => ({ bookings: [] })),
          apiRequest('/payments/tutor/earnings').catch(() => null)
        ]);

        if (profileRes?.success) {
          setProfile(profileRes.profile);
          setCompletion(profileRes.profileCompletion || 0);
        }
        if (bookingsRes?.bookings) {
          setBookings(bookingsRes.bookings);
        }
        if (earningsRes?.success) {
          setEarnings(earningsRes);
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
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl card-3d flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Teacher Dashboard</span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1 tracking-tight">Welcome, {user?.name}!</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-lg">
            Manage your schedule, respond to student session requests, and maintain your professional rate card.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/tutor/cart"
            className="px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-md bg-white/10 hover:bg-white/20 text-white border border-white/20"
          >
            <ShoppingBag className="w-4 h-4 text-teal-300" />
            <span>Tutor Cart</span>
          </Link>

          {/* Toggle Status */}
          {profile && (
            <button
              onClick={handleToggleAccepting}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer ${
                profile.isAcceptingStudents
                  ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 border-b-2 border-emerald-700'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border-b-2 border-slate-900'
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
      </div>

      {/* Application Status Alert Banner */}
      {profile && profile.applicationStatus === 'withdrawn' && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-amber-950 text-sm">Tutor Application Currently Withdrawn</h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Your profile is not listed in public searches or student recommendations. All your details, qualifications, and past bookings are securely preserved.
              </p>
            </div>
          </div>
          <Link
            to="/tutor/cart"
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shrink-0 shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reactivate in Cart
          </Link>
        </div>
      )}

      {profile && (profile.applicationStatus === 'draft' || profile.profileStatus === 'draft') && (
        <div className="bg-sky-50 border-2 border-sky-300 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
              <FileEdit className="w-5 h-5 text-sky-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-sky-950 text-sm">Application Incomplete (Step {profile.registrationStep || 1} of 9)</h3>
              <p className="text-xs text-sky-800 mt-0.5">
                Complete all 9 steps of the registration form to submit your profile for admin verification and start receiving students.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/tutor/cart"
              className="px-3.5 py-2 rounded-xl bg-white border border-sky-300 text-sky-800 hover:bg-sky-100 font-bold text-xs flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Tutor Cart
            </Link>
            <Link
              to="/tutor/register"
              className="px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              Continue Form →
            </Link>
          </div>
        </div>
      )}

      {profile && profile.applicationStatus === 'pending_review' && (
        <div className="bg-purple-50 border-2 border-purple-300 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-purple-950 text-sm">Application Under Admin Review ({profile.applicationId || 'Submitted'})</h3>
              <p className="text-xs text-purple-800 mt-0.5">
                Our verification team is reviewing your documents and qualification certificates. You can view or withdraw your application from the cart at any time.
              </p>
            </div>
          </div>
          <Link
            to="/tutor/cart"
            className="px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-2 shrink-0 shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            View in Tutor Cart
          </Link>
        </div>
      )}

      {/* Profile Completion & Verification Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Profile Completion Box */}
        <div className="stat-card-3d space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Profile Completeness
            </span>
            <span className="text-xs font-black text-teal-700">{completion}%</span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
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
        <div className="stat-card-3d space-y-3">
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
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
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
        <div className="stat-card-3d space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Requests</span>
            <CalendarCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{pendingRequests.length}</div>
          <Link to="/tutor/bookings" className="text-[11px] font-bold text-amber-600 hover:underline inline-block pt-1">
            Review requests →
          </Link>
        </div>

        <div className="stat-card-3d space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Confirmed Sessions</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{confirmedSessions.length}</div>
          <Link to="/tutor/bookings" className="text-[11px] font-bold text-emerald-600 hover:underline inline-block pt-1">
            View schedule →
          </Link>
        </div>

        <div className="stat-card-3d space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Rating & Reviews</span>
            <Star className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {profile?.averageRating?.toFixed(1) || '0.0'} ★
          </div>
          <Link to="/tutor/reviews" className="text-[11px] font-bold text-teal-600 hover:underline inline-block pt-1">
            {profile?.reviewCount || 0} reviews received →
          </Link>
        </div>
      </div>

      {/* Incoming Requests Feed Preview */}
      <div className="card-3d p-6 space-y-4">
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
                className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {b.subject} ({b.classGrade}) request from {b.parentUser?.name}
                  </div>
                  <div className="text-slate-500 mt-0.5 flex items-center gap-3 flex-wrap">
                    <span>Date: {new Date(b.schedule?.sessionDate).toLocaleDateString()}</span>
                    <span>Time: {b.schedule?.startTime} - {b.schedule?.endTime}</span>
                    <span className="capitalize font-semibold text-slate-700">Mode: {b.teachingMode?.replace('_', ' ')}</span>
                  </div>
                </div>

                <Link
                  to="/tutor/bookings"
                  className="px-4 py-2 rounded-xl btn-3d-primary text-xs uppercase tracking-wider font-bold"
                >
                  Respond Now
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tutor Earnings Ledger & Payout Status */}
      <div className="card-3d p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Earnings Ledger & Payout Status</h2>
            <p className="text-xs text-slate-500">Track gross booking amount, platform commission, and bank/UPI settlements.</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
            100% Guaranteed Payout
          </span>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-semibold">Gross Earned:</span>
            <div className="text-xl font-black text-slate-900 mt-0.5">₹{earnings?.summary?.totalGross || 0}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-semibold">Platform Fee (10%):</span>
            <div className="text-xl font-black text-slate-600 mt-0.5">-₹{earnings?.summary?.totalCommission || 0}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-emerald-800 font-semibold">Net Earned:</span>
            <div className="text-xl font-black text-emerald-700 mt-0.5">₹{earnings?.summary?.totalNetEarned || 0}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200">
            <span className="text-teal-800 font-semibold">Pending Settlement:</span>
            <div className="text-xl font-black text-teal-800 mt-0.5">₹{earnings?.summary?.totalPendingPayout || 0}</div>
          </div>
        </div>

        {/* Payout Records */}
        {earnings?.payouts?.length > 0 ? (
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Recent Payout Settlements</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-2xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Session</th>
                    <th className="p-3">Gross</th>
                    <th className="p-3">Commission</th>
                    <th className="p-3">Net Payout</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Transfer Ref / Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {earnings.payouts.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-semibold text-slate-800">
                        {p.booking?.subject || 'Tuition'} ({p.booking?.classGrade})
                      </td>
                      <td className="p-3">₹{p.grossAmount}</td>
                      <td className="p-3 text-slate-500">-₹{p.platformCommission}</td>
                      <td className="p-3 font-black text-emerald-700">₹{p.netPayableToTutor}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          p.status === 'transferred'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'processing'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">
                        {p.transferReference || (p.status === 'accrued' ? 'Awaiting session completion' : 'Processing')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50/60 rounded-2xl border border-slate-100">
            No paid sessions yet. As parents complete bookings, your earnings and payout status will appear here.
          </div>
        )}
      </div>
    </div>
  );
};
