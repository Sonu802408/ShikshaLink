import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileCheck,
  User,
  GraduationCap,
  BookOpen,
  Layers,
  MapPin,
  Clock,
  DollarSign,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Edit3,
  ExternalLink,
  RotateCcw,
  LogOut,
  Info,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Eye,
  Calendar
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const TutorCartPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [cartData, setCartData] = useState(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/tutors/cart');
      if (res.success) {
        setCartData(res);
      }
    } catch (err) {
      showToast('Failed to load your tutor cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Handle Tutor Exit / Withdraw Application
  const handleConfirmWithdraw = async () => {
    setWithdrawing(true);
    try {
      const res = await apiRequest('/tutors/cart/withdraw', {
        method: 'POST',
        body: JSON.stringify({ reason: withdrawReason })
      });
      if (res.success) {
        showToast('Your application has been safely withdrawn. Your details are saved.', 'success');
        setShowWithdrawModal(false);
        fetchCart();
      }
    } catch (err) {
      showToast(err.message || 'Failed to withdraw application', 'error');
    } finally {
      setWithdrawing(false);
    }
  };

  // Handle Tutor Reactivation
  const handleReactivate = async () => {
    setReactivating(true);
    try {
      const res = await apiRequest('/tutors/cart/reactivate', {
        method: 'POST'
      });
      if (res.success) {
        showToast('Application reactivated! Added back to your Tutor Cart.', 'success');
        fetchCart();
      }
    } catch (err) {
      showToast(err.message || 'Failed to reactivate application', 'error');
    } finally {
      setReactivating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-600">Loading your Tutor Application Cart...</p>
      </div>
    );
  }

  const app = cartData?.application;
  const status = app?.applicationStatus || 'draft';
  const isInCart = cartData?.isInCart;

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-extrabold uppercase tracking-wider">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Tutor Application Cart</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            My Tutor Application
          </h1>
          <p className="text-xs text-slate-500">
            Track your registration progress, review your submitted details, or manage your application status.
          </p>
        </div>

        {app && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/tutor/register')}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Application</span>
            </button>
          </div>
        )}
      </div>

      {/* NO APPLICATION FOUND (EMPTY STATE) */}
      {!app ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-300 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-black text-slate-900">Your Tutor Cart is Empty</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              You haven't started a tutor application yet. Join 100+ verified teachers across Mayur Vihar and Delhi NCR.
            </p>
          </div>
          <button
            onClick={() => navigate('/tutor/register')}
            className="px-6 py-3 rounded-2xl btn-3d-primary font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer shadow-md"
          >
            <span>Start Tutor Application</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* APPLICATION CARD */
        <div className="space-y-6">
          {/* Status Alert Banner */}
          {status === 'withdrawn' ? (
            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-slate-500 shrink-0" />
                <div className="text-xs text-slate-700">
                  <span className="font-bold">Application Withdrawn:</span> Your public listing is currently paused and removed from search results. Your data is preserved.
                </div>
              </div>
              <button
                onClick={handleReactivate}
                disabled={reactivating}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{reactivating ? 'Restoring...' : 'Reactivate Application'}</span>
              </button>
            </div>
          ) : status === 'inactive' ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <div className="text-xs text-rose-900">
                  <span className="font-bold">Listing Inactive:</span> Your tutor profile has been deactivated by administration.
                  {app.adminNotes && <span className="block mt-0.5 text-rose-700 italic">Note: {app.adminNotes}</span>}
                </div>
              </div>
            </div>
          ) : status === 'approved' ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs text-emerald-900">
                <span className="font-bold">Application Approved & Live!</span> Your profile is actively discoverable on the marketplace for parent inquiries.
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-center gap-3">
              <Info className="w-5 h-5 text-sky-700 shrink-0" />
              <div className="text-xs text-sky-900">
                <span className="font-bold">Application In Progress ({cartData?.profileCompletion || 0}% Complete):</span> Finish any missing sections and submit to be published.
              </div>
            </div>
          )}

          {/* MAIN APPLICATION CARD */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 space-y-6">
            {/* Top Profile Summary Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-700 to-teal-600 text-white font-black text-xl flex items-center justify-center uppercase shadow-md ring-2 ring-slate-100 overflow-hidden shrink-0">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    app.fullName?.[0] || user?.name?.[0] || 'T'
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">
                      {app.fullName || user?.name}
                    </h2>
                    <span className="text-[11px] font-black font-mono px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      ID: {app.applicationId || 'SL-TUT-PENDING'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium line-clamp-1">
                    {app.headline || 'Academic Tutor'}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{app.area || app.primaryLocality || 'Delhi NCR'}</span>
                    </span>
                    <span>•</span>
                    <span>Updated {new Date(app.updatedAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="self-end sm:self-auto text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    status === 'approved'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      : status === 'applied' || status === 'pending_review'
                      ? 'bg-sky-100 text-sky-900 border border-sky-200'
                      : status === 'withdrawn'
                      ? 'bg-slate-200 text-slate-800 border border-slate-300'
                      : status === 'inactive' || status === 'rejected'
                      ? 'bg-rose-100 text-rose-900 border border-rose-200'
                      : 'bg-amber-100 text-amber-900 border border-amber-200'
                  }`}
                >
                  {status === 'pending_review' ? 'Under Review' : status}
                </span>
                <div className="text-[11px] text-slate-400 mt-1 font-semibold">
                  Cart Status: {isInCart ? 'Active in Cart' : 'Removed / Inactive'}
                </div>
              </div>
            </div>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* 1. Education */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  <GraduationCap className="w-4 h-4 text-teal-600" />
                  <span>Qualification</span>
                </div>
                <div className="font-bold text-slate-800">
                  {app.highestQualification || app.degreeCourseName || 'Not specified'}
                </div>
                {app.collegeUniversity && (
                  <div className="text-[11px] text-slate-500 truncate">{app.collegeUniversity}</div>
                )}
              </div>

              {/* 2. Teaching Experience */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  <BookOpen className="w-4 h-4 text-teal-600" />
                  <span>Experience</span>
                </div>
                <div className="font-bold text-slate-800">
                  {app.experienceYears !== undefined ? `${app.experienceYears} Yrs` : `${app.yearsOfExperience || 0} Yrs`}
                  {app.experienceMonths ? ` ${app.experienceMonths} Mos` : ''} Total Experience
                </div>
                {app.teachingInstitutions && (
                  <div className="text-[11px] text-slate-500 truncate">{app.teachingInstitutions}</div>
                )}
              </div>

              {/* 3. Hourly & Monthly Fees */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  <DollarSign className="w-4 h-4 text-teal-600" />
                  <span>Fee Structure</span>
                </div>
                <div className="font-black text-teal-800 text-sm">
                  ₹{app.hourlyFee || app.feeStructure?.hourlyRate || 500} / hour
                </div>
                {app.monthlyFee ? (
                  <div className="text-[11px] text-slate-500 font-semibold">
                    Monthly Pack: ₹{app.monthlyFee}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400">Custom monthly pricing</div>
                )}
              </div>

              {/* 4. Classes Taught */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  <Layers className="w-4 h-4 text-teal-600" />
                  <span>Classes</span>
                </div>
                <div className="font-semibold text-slate-800 flex flex-wrap gap-1">
                  {(app.schoolClassGroups?.length ? app.schoolClassGroups : app.classes || []).map((c) => (
                    <span key={c} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px]">
                      {c}
                    </span>
                  ))}
                  {!app.classes?.length && !app.schoolClassGroups?.length && <span className="text-slate-400">Not specified</span>}
                </div>
              </div>

              {/* 5. Subjects */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>Subjects</span>
                </div>
                <div className="font-semibold text-slate-800 flex flex-wrap gap-1">
                  {(app.subjects || []).slice(0, 4).map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[11px]">
                      {s}
                    </span>
                  ))}
                  {(app.subjects || []).length > 4 && (
                    <span className="text-[10px] text-slate-400 font-bold self-center">
                      +{app.subjects.length - 4} more
                    </span>
                  )}
                  {!app.subjects?.length && <span className="text-slate-400">Not specified</span>}
                </div>
              </div>

              {/* 6. Teaching Modes */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>Teaching Modes</span>
                </div>
                <div className="font-semibold text-slate-800 flex flex-wrap gap-1">
                  {(app.teachingModePreferences?.length ? app.teachingModePreferences : app.teachingModes || []).map((m) => (
                    <span key={m} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] capitalize">
                      {m.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS (VIEW DETAILS, EDIT, EXIT) */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(true)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>View Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/tutor/register')}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Application</span>
                </button>
              </div>

              {/* Exit / Withdraw Button */}
              {status !== 'withdrawn' ? (
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit / Withdraw Application</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleReactivate}
                  disabled={reactivating}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{reactivating ? 'Reactivating...' : 'Reactivate in Cart'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: TUTOR EXIT / WITHDRAW APPLICATION */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Withdraw Tutor Application?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Withdrawing your application will remove your listing from the active Tutor Cart, public search results, and new student inquiries.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold block">Important Notice:</span>
              <p className="text-[11px] leading-relaxed">
                Your user account, verified qualifications, and historical bookings will <strong>NOT</strong> be deleted. You can return anytime and reactivate your saved profile with 1 click.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for Withdrawing <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
                placeholder="e.g. Relocating, taking temporary pause, schedule full"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                disabled={withdrawing}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel (Keep Active)
              </button>
              <button
                type="button"
                onClick={handleConfirmWithdraw}
                disabled={withdrawing}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                {withdrawing ? 'Withdrawing...' : 'Yes, Withdraw Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL APPLICATION INSPECTION MODAL */}
      {showDetailsModal && app && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-teal-600 tracking-wider">Application Dossier</span>
                <h3 className="text-lg font-black text-slate-900">{app.fullName || user?.name}</h3>
                <div className="text-xs text-slate-400 font-mono">ID: {app.applicationId}</div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-extrabold text-slate-900 uppercase tracking-wider block text-[11px] mb-1">About Me</span>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                  {app.bio || 'No bio entered yet.'}
                </p>
              </div>

              <div>
                <span className="font-extrabold text-slate-900 uppercase tracking-wider block text-[11px] mb-1">Pedagogy & Methodology</span>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                  {app.teachingMethodology || 'Standard concept-first methodology.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Languages</span>
                  <span className="font-bold text-slate-800">{app.teachingLanguages?.join(', ') || 'English, Hindi'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Weekly Hours</span>
                  <span className="font-bold text-slate-800">{app.weeklyAvailability || 'Flexible'}</span>
                </div>
              </div>

              {app.statusHistory?.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="font-extrabold text-slate-900 uppercase tracking-wider block text-[11px]">
                    Status History & Audits
                  </span>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {app.statusHistory.map((h, i) => (
                      <div key={i} className="p-2.5 bg-slate-50 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="font-bold text-slate-900 capitalize">{h.status}</span>
                          {h.reason && <span className="text-slate-500"> — {h.reason}</span>}
                        </div>
                        <span className="text-slate-400 text-[10px]">
                          {new Date(h.changedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
