import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Edit,
  Trash2,
  Eye,
  Plus,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  DollarSign,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  X,
  FileCheck,
  Clock,
  LogOut,
  SlidersHorizontal
} from 'lucide-react';
import { apiRequest, getAvatarUrl } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { TutorDossierModal } from '../../components/admin/TutorDossierModal';

export const AdminManageTutors = () => {
  const { showToast } = useToast();

  const [tutors, setTutors] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [inCartFilter, setInCartFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Modals
  const [inspectTutor, setInspectTutor] = useState(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  const [statusModalTutor, setStatusModalTutor] = useState(null);
  const [targetStatus, setTargetStatus] = useState('approved');
  const [adminNotes, setAdminNotes] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const [editModalTutor, setEditModalTutor] = useState(null);
  const [editForm, setEditForm] = useState({
    headline: '',
    hourlyFee: 500,
    monthlyFee: 5000,
    primaryLocality: '',
    adminNotes: ''
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [addUserForm, setAddUserForm] = useState({
    headline: 'Senior Academic Tutor',
    subjects: ['Mathematics'],
    classes: ['Class 10'],
    hourlyFee: 600,
    primaryLocality: 'Mayur Vihar Phase 1',
    autoApprove: true
  });
  const [addUserSubmitting, setAddUserSubmitting] = useState(false);

  const [deleteModalTutor, setDeleteModalTutor] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Fetch Tutors from Backend API
  const fetchTutors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (classFilter) params.append('classGrade', classFilter);
      if (subjectFilter) params.append('subject', subjectFilter);
      if (modeFilter) params.append('teachingMode', modeFilter);
      if (inCartFilter) params.append('inCart', inCartFilter);
      params.append('sortBy', sortBy);
      params.append('page', page);
      params.append('limit', '15');

      const res = await apiRequest(`/admin/tutors?${params.toString()}`);
      if (res.success) {
        setTutors(res.tutors || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      showToast('Failed to load tutor applications', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, classFilter, subjectFilter, modeFilter, inCartFilter, sortBy, page, showToast]);

  useEffect(() => {
    fetchTutors();
  }, [fetchTutors]);

  // Open Full Application Inspection
  const handleInspect = async (tutorId) => {
    setInspectLoading(true);
    try {
      const res = await apiRequest(`/admin/tutors/${tutorId}/full`);
      if (res.success) {
        setInspectTutor(res.tutor);
      }
    } catch (err) {
      showToast('Failed to load application dossier', 'error');
    } finally {
      setInspectLoading(false);
    }
  };

  // Open Status Change Modal
  const handleOpenStatusModal = (tutor, defaultStatus) => {
    setStatusModalTutor(tutor);
    setTargetStatus(defaultStatus);
    setAdminNotes(defaultStatus === 'approved' ? 'Verified by administrator.' : '');
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setStatusSubmitting(true);
    try {
      const res = await apiRequest(`/admin/tutors/${statusModalTutor._id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: targetStatus,
          adminNotes
        })
      });
      if (res.success) {
        showToast(res.message, 'success');
        setStatusModalTutor(null);
        fetchTutors();
      }
    } catch (err) {
      showToast(err.message || 'Status update failed', 'error');
    } finally {
      setStatusSubmitting(false);
    }
  };

  // Toggle Cart status (Remove from / Restore to cart)
  const handleToggleCart = async (tutor) => {
    const newCartState = !tutor.isInCart;
    try {
      const res = await apiRequest(`/admin/tutors/${tutor._id}/cart-toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ isInCart: newCartState })
      });
      if (res.success) {
        showToast(res.message, 'success');
        fetchTutors();
      }
    } catch (err) {
      showToast('Failed to toggle cart status', 'error');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (tutor) => {
    setEditModalTutor(tutor);
    setEditForm({
      headline: tutor.headline || '',
      hourlyFee: tutor.hourlyFee || tutor.feeStructure?.hourlyRate || 500,
      monthlyFee: tutor.monthlyFee || tutor.feeStructure?.monthlyRate || 0,
      primaryLocality: tutor.primaryLocality || tutor.area || '',
      adminNotes: tutor.adminNotes || ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSubmitting(true);
    try {
      const res = await apiRequest(`/admin/tutors/${editModalTutor._id}/edit`, {
        method: 'PATCH',
        body: JSON.stringify(editForm)
      });
      if (res.success) {
        showToast('Tutor profile updated successfully.', 'success');
        setEditModalTutor(null);
        fetchTutors();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update tutor', 'error');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Add Registered User as Tutor
  const handleSearchUsers = async () => {
    if (!userSearchQuery.trim()) return;
    try {
      const res = await apiRequest(`/admin/users?search=${encodeURIComponent(userSearchQuery.trim())}`);
      if (res.success) {
        setUsersList(res.users || []);
      }
    } catch (err) {
      showToast('User search failed', 'error');
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      showToast('Please select a registered user first.', 'error');
      return;
    }
    setAddUserSubmitting(true);
    try {
      const res = await apiRequest('/admin/tutors/create-from-user', {
        method: 'POST',
        body: JSON.stringify({
          userId: selectedUser._id,
          ...addUserForm
        })
      });
      if (res.success) {
        showToast(res.message, 'success');
        setAddUserModalOpen(false);
        setSelectedUser(null);
        fetchTutors();
      }
    } catch (err) {
      showToast(err.message || 'Enrollment failed', 'error');
    } finally {
      setAddUserSubmitting(false);
    }
  };

  // Permanent Delete
  const handlePermanentDelete = async (e) => {
    e.preventDefault();
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      showToast('Please type "DELETE" to confirm permanent deletion.', 'error');
      return;
    }
    setDeleteSubmitting(true);
    try {
      const res = await apiRequest(`/admin/tutors/${deleteModalTutor._id}/permanent`, {
        method: 'DELETE',
        body: JSON.stringify({ confirmDelete: true })
      });
      if (res.success) {
        showToast(res.message, 'success');
        setDeleteModalTutor(null);
        setDeleteConfirmText('');
        fetchTutors();
      }
    } catch (err) {
      showToast(err.message || 'Permanent deletion failed', 'error');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-black uppercase tracking-wider border border-teal-500/30">
            <Users className="w-3.5 h-3.5" />
            <span>Tutor Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Manage Tutor Applications</h1>
          <p className="text-xs text-slate-300 max-w-lg">
            Inspect dossiers, approve/reject applications, manage cart status, and enroll registered users into tutor profiles.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setAddUserModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User as Tutor</span>
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, ID, subject..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-teal-600"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
            >
              <option value="all">All Application Statuses</option>
              <option value="active">Active & Discoverable</option>
              <option value="applied">Applied / Pending Review</option>
              <option value="approved">Approved</option>
              <option value="draft">Draft Applications</option>
              <option value="inactive">Inactive</option>
              <option value="withdrawn">Withdrawn (Exited)</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Cart Status Filter */}
          <div>
            <select
              value={inCartFilter}
              onChange={(e) => {
                setInCartFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
            >
              <option value="">All Cart Statuses</option>
              <option value="true">In Active Tutor Cart</option>
              <option value="false">Removed from Cart</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="experience">Highest Experience</option>
              <option value="fee_high">Highest Fee</option>
              <option value="fee_low">Lowest Fee</option>
            </select>
          </div>
        </div>
      </div>

      {/* APPLICATIONS LIST */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            Tutor Applications ({total} Found)
          </span>
          <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <span>Loading applications...</span>
          </div>
        ) : tutors.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-300" />
            <p>No tutor applications match the selected criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tutors.map((tutor) => {
              const u = tutor.user || {};
              const appStatus = tutor.applicationStatus || 'draft';
              const isInCart = tutor.isInCart !== false;

              return (
                <div key={tutor._id} className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Left: Avatar & Identity */}
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-700 to-teal-600 text-white font-black text-sm flex items-center justify-center uppercase shadow-sm overflow-hidden shrink-0">
                      <span className="select-none">{tutor.fullName?.[0] || u.name?.[0] || 'T'}</span>
                      {(u.avatar || tutor.avatar) && (
                        <img
                          src={getAvatarUrl(u.avatar || tutor.avatar)}
                          alt={tutor.fullName || u.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.fullName || u.name || 'Tutor')}&background=0D9488&color=fff&size=256&bold=true`;
                          }}
                        />
                      )}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">{tutor.fullName || u.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200">
                          {tutor.applicationId || 'NO-ID'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-md">
                        {u.email} • {u.phone}
                      </div>
                      <div className="text-xs text-slate-600 font-medium">
                        {tutor.headline || 'Dedicated Academic Tutor'}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap pt-0.5">
                        <span>{tutor.area || tutor.primaryLocality || 'Delhi NCR'}</span>
                        <span>•</span>
                        <span>Fee: ₹{tutor.hourlyFee || tutor.feeStructure?.hourlyRate || 500}/hr</span>
                        <span>•</span>
                        <span>Exp: {tutor.yearsOfExperience || 0} Yrs</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Badges & Action Menu */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-end lg:self-auto">
                    {/* Status badges */}
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          appStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            : appStatus === 'applied' || appStatus === 'pending_review'
                            ? 'bg-sky-100 text-sky-900 border border-sky-200'
                            : appStatus === 'withdrawn'
                            ? 'bg-slate-200 text-slate-800 border border-slate-300'
                            : appStatus === 'inactive' || appStatus === 'rejected'
                            ? 'bg-rose-100 text-rose-900 border border-rose-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                      >
                        {appStatus}
                      </span>
                      <span className={`text-[10px] font-bold ${isInCart ? 'text-teal-700' : 'text-slate-400'}`}>
                        {isInCart ? 'In Active Cart' : 'Removed from Cart'}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleInspect(tutor._id)}
                        className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs"
                        title="Inspect full application dossier"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {appStatus !== 'approved' ? (
                        <button
                          type="button"
                          onClick={() => handleOpenStatusModal(tutor, 'approved')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenStatusModal(tutor, 'inactive')}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs cursor-pointer"
                        >
                          Deactivate
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleToggleCart(tutor)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          isInCart
                            ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                            : 'border-teal-300 bg-teal-50 text-teal-800 hover:bg-teal-100'
                        }`}
                        title={isInCart ? 'Remove from active cart' : 'Restore to cart'}
                      >
                        {isInCart ? 'Hide Cart' : 'Restore Cart'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(tutor)}
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                        title="Edit profile fields"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDeleteModalTutor(tutor);
                          setDeleteConfirmText('');
                        }}
                        className="p-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 cursor-pointer"
                        title="Permanently delete application record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <span className="font-bold text-slate-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* MODAL 1: FULL APPLICATION DOSSIER INSPECTION */}
      {inspectTutor && (
        <TutorDossierModal
          tutor={inspectTutor}
          onClose={() => setInspectTutor(null)}
          onDelete={(tutorToDelete) => {
            setInspectTutor(null);
            setDeleteModalTutor(tutorToDelete);
          }}
          onApprove={async (tutorId) => {
            try {
              const res = await apiRequest(`/admin/tutors/${tutorId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'approved', adminNotes: 'Approved from dossier inspection' })
              });
              if (res.success) {
                showToast('🎉 Tutor application approved and published live!', 'success');
                setInspectTutor(null);
                fetchTutors();
              }
            } catch (err) {
              showToast(err.message || 'Approval failed', 'error');
            }
          }}
          onReject={async (tutorId, reason) => {
            try {
              const res = await apiRequest(`/admin/tutors/${tutorId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'rejected', adminNotes: reason || 'Rejected from dossier inspection' })
              });
              if (res.success) {
                showToast('Tutor application marked as rejected.', 'success');
                setInspectTutor(null);
                fetchTutors();
              }
            } catch (err) {
              showToast(err.message || 'Rejection failed', 'error');
            }
          }}
        />
      )}

      {/* MODAL 2: UPDATE STATUS (APPROVE, REJECT, DEACTIVATE) */}
      {statusModalTutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Update Application Status
            </h3>
            <p className="text-xs text-slate-500">
              Changing status for <strong>{statusModalTutor.fullName || statusModalTutor.user?.name}</strong> (ID: {statusModalTutor.applicationId})
            </p>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Status</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-bold"
                >
                  <option value="approved">Approved (Live on Marketplace)</option>
                  <option value="rejected">Rejected (Denied with feedback)</option>
                  <option value="inactive">Inactive (Deactivated listing)</option>
                  <option value="applied">Pending Review</option>
                  <option value="withdrawn">Withdrawn (Paused)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Administrator Notes / Feedback</label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Notes sent to the tutor and logged in immutable audit records."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalTutor(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusSubmitting}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  {statusSubmitting ? 'Updating...' : 'Save Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT TUTOR PROFILE */}
      {editModalTutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Edit Tutor Parameters</h3>
            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Headline</label>
                <input
                  type="text"
                  value={editForm.headline}
                  onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hourly Fee (₹)</label>
                  <input
                    type="number"
                    value={editForm.hourlyFee}
                    onChange={(e) => setEditForm({ ...editForm, hourlyFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Monthly Fee (₹)</label>
                  <input
                    type="number"
                    value={editForm.monthlyFee}
                    onChange={(e) => setEditForm({ ...editForm, monthlyFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Locality</label>
                <input
                  type="text"
                  value={editForm.primaryLocality}
                  onChange={(e) => setEditForm({ ...editForm, primaryLocality: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Admin Internal Notes</label>
                <textarea
                  rows={2}
                  value={editForm.adminNotes}
                  onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalTutor(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  {editSubmitting ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD EXISTING USER AS TUTOR */}
      {addUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Add Registered User as Tutor</h3>
              <button
                type="button"
                onClick={() => setAddUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            {/* User Search */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-700 block">Search Existing User (Parent or Client)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search user name or email..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                />
                <button
                  type="button"
                  onClick={handleSearchUsers}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer"
                >
                  Find
                </button>
              </div>

              {usersList.length > 0 && (
                <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl mt-2">
                  {usersList.map((u) => (
                    <div
                      key={u._id}
                      onClick={() => setSelectedUser(u)}
                      className={`p-2.5 cursor-pointer flex items-center justify-between text-xs transition-colors ${
                        selectedUser?._id === u._id ? 'bg-teal-50 font-bold text-teal-900' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <span>{u.name}</span>
                        <span className="text-[10px] text-slate-400 block">{u.email}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 uppercase">{u.role}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedUser && (
              <form onSubmit={handleAddUserSubmit} className="space-y-3.5 text-xs pt-2 border-t border-slate-100">
                <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200 text-teal-900">
                  <span className="font-bold">Selected User: </span> {selectedUser.name} ({selectedUser.email})
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Headline</label>
                  <input
                    type="text"
                    value={addUserForm.headline}
                    onChange={(e) => setAddUserForm({ ...addUserForm, headline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Hourly Fee (₹)</label>
                    <input
                      type="number"
                      value={addUserForm.hourlyFee}
                      onChange={(e) => setAddUserForm({ ...addUserForm, hourlyFee: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Locality</label>
                    <input
                      type="text"
                      value={addUserForm.primaryLocality}
                      onChange={(e) => setAddUserForm({ ...addUserForm, primaryLocality: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addUserForm.autoApprove}
                    onChange={(e) => setAddUserForm({ ...addUserForm, autoApprove: e.target.checked })}
                    className="rounded-sm text-teal-600 w-4 h-4"
                  />
                  <span className="font-bold text-slate-800">Auto-approve and immediately activate public listing</span>
                </label>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setAddUserModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addUserSubmitting}
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    {addUserSubmitting ? 'Enrolling...' : 'Enroll as Tutor'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 5: STRONG CONFIRMATION FOR PERMANENT DELETION */}
      {deleteModalTutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-rose-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-rose-600 tracking-tight">
                Permanently Delete Tutor Application?
              </h3>
              <p className="text-xs text-slate-600">
                You are about to permanently delete the tutor application record for{' '}
                <strong>{deleteModalTutor.fullName || deleteModalTutor.user?.name}</strong> (ID: {deleteModalTutor.applicationId}).
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
              <span className="font-bold block text-slate-900">Safety Guarantee:</span>
              <p className="text-[11px] leading-relaxed">
                The tutor application profile and uploaded qualifications will be removed. The base user account and existing booking history will <strong>NOT</strong> be deleted.
              </p>
            </div>

            <form onSubmit={handlePermanentDelete} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Type <span className="font-mono text-rose-600">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-rose-300 font-mono font-bold focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteModalTutor(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteConfirmText !== 'DELETE' || deleteSubmitting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  {deleteSubmitting ? 'Deleting...' : 'Permanently Delete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
