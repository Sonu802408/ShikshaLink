import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Award,
  AlertCircle,
  UserCheck,
  Users,
  Eye,
  Clock,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  DollarSign,
  Layers,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { apiRequest, getAvatarUrl, getDocumentUrl } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { TutorDossierModal } from '../../components/admin/TutorDossierModal';

export const AdminVerificationQueue = () => {
  const { showToast } = useToast();
  const [pendingTutors, setPendingTutors] = useState([]);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [activeTab, setActiveTab] = useState('tutors'); // 'tutors' | 'documents'

  // Full Dossier Inspection Modal
  const [inspectTutor, setInspectTutor] = useState(null);
  const [approvingId, setApprovingId] = useState(null);

  // Document Decision Modal (Legacy Qualifications)
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
        setPendingTutors(res.pendingTutors || []);
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

  // Handle Tutor Approval
  const handleApproveTutor = async (tutorId) => {
    setApprovingId(tutorId);
    try {
      const res = await apiRequest(`/admin/tutors/${tutorId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'approved',
          adminNotes: 'Verified and approved by administrator'
        })
      });
      if (res.success) {
        showToast('🎉 Tutor successfully verified and published live to marketplace!', 'success');
        setInspectTutor(null);
        fetchQueue();
      }
    } catch (err) {
      showToast(err.message || 'Failed to approve tutor', 'error');
    } finally {
      setApprovingId(null);
    }
  };

  // Handle Tutor Rejection
  const handleRejectTutor = async (tutorId, reason) => {
    try {
      const res = await apiRequest(`/admin/tutors/${tutorId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'rejected',
          adminNotes: reason || 'Application rejected during administrative verification'
        })
      });
      if (res.success) {
        showToast('Tutor application marked as rejected.', 'success');
        setInspectTutor(null);
        fetchQueue();
      }
    } catch (err) {
      showToast(err.message || 'Failed to reject tutor', 'error');
    }
  };

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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-black uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Verification Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Tutor Verification Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review submitted tutor applications, verify qualifications & ID proofs, and approve profiles to go live.
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold self-end sm:self-auto flex-wrap">
          {['pending', 'drafts', 'verified', 'rejected', 'all'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-white text-slate-900 shadow-2xs font-black'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab === 'drafts' ? 'Drafts / In-Progress' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs: Tutor Applications vs Qualification Docs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('tutors')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'tutors'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Tutor Applications ({pendingTutors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'documents'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Document Files ({queue.length})</span>
        </button>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="p-12 text-center text-xs font-bold text-slate-400 space-y-3">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p>Loading verification applications...</p>
        </div>
      ) : activeTab === 'tutors' ? (
        /* TAB 1: TUTOR APPLICATIONS */
        pendingTutors.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto" />
            <h3 className="font-black text-slate-900 text-base">No Pending Tutor Applications</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All submitted tutor profiles have been reviewed and approved!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingTutors.map((tutor) => {
              const u = tutor.user || {};
              const isApproved = tutor.applicationStatus === 'approved' || tutor.profileStatus === 'published';

              return (
                <div
                  key={tutor._id}
                  className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 hover:border-slate-300 transition-all"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-700 to-teal-600 text-white font-black text-lg flex items-center justify-center uppercase shadow-md overflow-hidden shrink-0">
                        <span className="select-none">{tutor.fullName?.[0] || u.name?.[0] || 'T'}</span>
                        {(u.avatar || tutor.avatar) && (
                          <img
                            src={getAvatarUrl(u.avatar || tutor.avatar)}
                            alt={tutor.fullName || u.name}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-slate-900 text-base">
                            {tutor.fullName || u.name}
                          </h3>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            {tutor.applicationId || 'SL-TUT-NEW'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isApproved
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : tutor.applicationStatus === 'rejected'
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : tutor.applicationStatus === 'draft'
                                ? 'bg-slate-100 text-slate-800 border border-slate-300'
                                : 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                            }`}
                          >
                            {isApproved
                              ? 'Verified & Live'
                              : tutor.applicationStatus === 'rejected'
                              ? 'Rejected'
                              : tutor.applicationStatus === 'draft'
                              ? 'Draft (In-Progress)'
                              : 'Pending Verification'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          {tutor.headline || 'Academic Tutor'} • Applied {new Date(tutor.submittedAt || tutor.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5 sm:justify-end">
                        <Phone className="w-3.5 h-3.5 text-teal-600" />
                        <span>{u.phone || tutor.whatsappNumber || 'No phone'}</span>
                      </div>
                      <div className="text-slate-400 text-[11px] flex items-center gap-1.5 sm:justify-end mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{u.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Education</span>
                      <span className="font-bold text-slate-800">
                        {tutor.highestQualification || 'Graduate'} {tutor.degreeCourseName ? `(${tutor.degreeCourseName})` : ''}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Experience</span>
                      <span className="font-bold text-slate-800">
                        {tutor.experienceYears ?? tutor.yearsOfExperience ?? 0} Years
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Hourly / Monthly Fee</span>
                      <span className="font-black text-emerald-800">
                        ₹{tutor.hourlyFee || tutor.feeStructure?.hourlyRate || 500} / hr
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Locality & Address</span>
                      <span className="font-bold text-slate-800 line-clamp-1">
                        {tutor.fullAddressPrivate || tutor.area || tutor.primaryLocality || 'Delhi NCR'}
                      </span>
                    </div>
                  </div>

                  {/* Subjects */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-400 mr-1">Subjects:</span>
                    {(tutor.subjects || []).slice(0, 7).map((sub, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-bold text-[10px] border border-teal-200">
                        {sub}
                      </span>
                    ))}
                    {(tutor.subjects || []).length > 7 && (
                      <span className="text-[10px] text-slate-400 font-bold">
                        +{tutor.subjects.length - 7} more
                      </span>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <button
                      onClick={() => setInspectTutor(tutor)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Full Dossier</span>
                    </button>

                    {!isApproved && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRejectTutor(tutor._id)}
                          className="px-3.5 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold cursor-pointer transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          disabled={approvingId === tutor._id}
                          onClick={() => handleApproveTutor(tutor._id)}
                          className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{approvingId === tutor._id ? 'Verifying...' : 'Approve & Verify (Make Live)'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* TAB 2: DOCUMENT FILES */
        queue.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <ShieldCheck className="w-10 h-10 text-teal-600 mx-auto" />
            <h3 className="font-bold text-slate-900 text-sm">No Document Proofs in Queue</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All submitted degree documents have been processed.
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

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>Proof File: <strong>{item.documentOriginalName || 'document.pdf'}</strong></span>
                  </div>
                  <a
                    href={getDocumentUrl(item._id || item.documentPath)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold flex items-center gap-1.5 hover:bg-slate-800 shadow-xs cursor-pointer"
                  >
                    <span>Inspect Document</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    onClick={() => handleOpenBadges(item)}
                    className="font-bold text-teal-700 hover:underline cursor-pointer"
                  >
                    Manage Badges (ID & Background)
                  </button>

                  {item.verificationStatus === 'pending' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenDecision(item, 'verified')}
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve Document
                      </button>
                      <button
                        onClick={() => handleOpenDecision(item, 'needs_reupload')}
                        className="px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold flex items-center gap-1.5 cursor-pointer"
                        title="Ask tutor to re-upload clear document"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Ask Re-upload
                      </button>
                      <button
                        onClick={() => handleOpenDecision(item, 'rejected')}
                        className="px-3.5 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenDecision(item, item.verificationStatus === 'verified' ? 'rejected' : 'verified')}
                      className="text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
                    >
                      Change Decision
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* FULL APPLICATION DOSSIER MODAL */}
      {inspectTutor && (
        <TutorDossierModal
          tutor={inspectTutor}
          onClose={() => setInspectTutor(null)}
          onApprove={handleApproveTutor}
          onReject={handleRejectTutor}
          onDelete={async (tutorToDelete) => {
            if (!window.confirm(`Permanently delete tutor application ${tutorToDelete.applicationId || ''}?`)) return;
            try {
              const res = await apiRequest(`/admin/tutors/${tutorToDelete._id}/permanent`, {
                method: 'DELETE',
                body: JSON.stringify({ confirmDelete: true })
              });
              if (res.success) {
                showToast(res.message || 'Tutor application permanently deleted', 'success');
                setInspectTutor(null);
                fetchQueue();
              }
            } catch (err) {
              showToast(err.message || 'Failed to delete tutor application', 'error');
            }
          }}
          approving={approvingId === inspectTutor._id}
        />
      )}

      {/* Document Decision Modal */}
      {decidingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
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
