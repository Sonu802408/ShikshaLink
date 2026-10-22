import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Award,
  AlertCircle,
  UserCheck
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminVerificationQueue = () => {
  const { showToast } = useToast();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');

  // Decision Modal
  const [decidingItem, setDecidingItem] = useState(null);
  const [decision, setDecision] = useState('verified');
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Badge Modal
  const [badgeTutor, setBadgeTutor] = useState(null);
  const [idVerified, setIdVerified] = useState(false);
  const [bgChecked, setBgChecked] = useState(false);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await apiRequest(`/admin/verification-queue?status=${statusFilter}`);
      if (res.success) {
        setQueue(res.queue || []);
      }
    } catch (err) {
      showToast('Failed to load verification queue', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [statusFilter]);

  const handleOpenDecision = (item, dec) => {
    setDecidingItem(item);
    setDecision(dec);
    setAdminNotes(dec === 'verified' ? 'Verified against university records.' : 'Incomplete documentation or unreadable scan.');
  };

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiRequest(`/admin/qualifications/${decidingItem._id}/decide`, {
        method: 'PATCH',
        body: JSON.stringify({ status: decision, adminNotes })
      });
      if (res.success) {
        showToast(`Document marked as ${decision}`, 'success');
        setQueue((prev) => prev.filter((item) => item._id !== decidingItem._id));
        setDecidingItem(null);
      }
    } catch (err) {
      showToast(err.message || 'Decision failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenBadges = (item) => {
    setBadgeTutor(item.tutor);
    setIdVerified(item.tutor?.verificationBadges?.idDocumentVerified || false);
    setBgChecked(item.tutor?.verificationBadges?.backgroundChecked || false);
  };

  const handleSaveBadges = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest(`/admin/tutors/${badgeTutor._id}/badges`, {
        method: 'PATCH',
        body: JSON.stringify({
          idDocumentVerified: idVerified,
          backgroundChecked: bgChecked,
          auditNotes: 'Updated by administrator'
        })
      });
      if (res.success) {
        showToast('Tutor verification badges updated', 'success');
        setBadgeTutor(null);
        fetchQueue();
      }
    } catch (err) {
      showToast('Failed to update badges', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Tutor Verification Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review qualification documents, mark sheets, and audit verification badges
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
          {['pending', 'verified', 'rejected', 'all'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                statusFilter === tab
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading queue...</div>
      ) : queue.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <ShieldCheck className="w-10 h-10 text-teal-600 mx-auto" />
          <h3 className="font-bold text-slate-900 text-sm">No items in queue</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All submitted tutor qualification documents have been audited.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((item) => (
            <div
              key={item._id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{item.degree}</span>
                    <span className="text-xs text-slate-500 font-medium">({item.passingYear})</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.verificationStatus === 'verified'
                        ? 'bg-teal-50 text-teal-800 border border-teal-200'
                        : item.verificationStatus === 'rejected'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {item.verificationStatus}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Institution: <strong>{item.institution}</strong> • Field: {item.fieldOfStudy || 'General'}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-slate-900 text-xs">{item.tutorUser?.name}</div>
                  <div className="text-[11px] text-slate-400">{item.tutorUser?.email} • {item.tutorUser?.phone}</div>
                </div>
              </div>

              {/* Secure Document Access */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Proof File: <strong>{item.documentOriginalName || 'document.pdf'}</strong></span>
                </div>
                <a
                  href={`/api/tutors/qualifications/${item._id}/document`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold flex items-center gap-1.5 hover:bg-slate-800 shadow-xs"
                >
                  <span>Inspect Document</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {item.adminNotes && (
                <div className="text-xs text-slate-600 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <strong>Admin Note:</strong> {item.adminNotes}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  onClick={() => handleOpenBadges(item)}
                  className="font-bold text-teal-700 hover:underline"
                >
                  Manage Badges (ID & Background)
                </button>

                {item.verificationStatus === 'pending' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenDecision(item, 'verified')}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve & Verify
                    </button>
                    <button
                      onClick={() => handleOpenDecision(item, 'rejected')}
                      className="px-3.5 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold"
                    >
                      Reject Proof
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenDecision(item, item.verificationStatus === 'verified' ? 'rejected' : 'verified')}
                      className="text-slate-500 hover:text-slate-900 font-semibold"
                    >
                      Change Decision
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Decision Modal */}
      {decidingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">
              Confirm Verification Decision: {decision.toUpperCase()}
            </h3>

            <form onSubmit={handleDecisionSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Administrator Audit Note
                </label>
                <textarea
                  rows={3}
                  required
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDecidingItem(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-1/2 py-2.5 rounded-xl font-bold text-white ${
                    decision === 'verified' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {submitting ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Badges Modal */}
      {badgeTutor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">
              Update Tutor Trust Badges
            </h3>

            <form onSubmit={handleSaveBadges} className="space-y-3.5 text-xs">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={idVerified}
                  onChange={(e) => setIdVerified(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <div>
                  <span className="font-bold text-slate-900">Government ID Verified</span>
                  <p className="text-slate-500 text-[11px]">Aadhaar / Voter ID / PAN verified</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bgChecked}
                  onChange={(e) => setBgChecked(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <div>
                  <span className="font-bold text-slate-900">Background Checked</span>
                  <p className="text-slate-500 text-[11px]">Verified criminal/police or professional reference check</p>
                </div>
              </label>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBadgeTutor(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold"
                >
                  Save Badges
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
