import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  CalendarCheck,
  Heart,
  Plus,
  PlusCircle,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  DollarSign,
  ShoppingBag,
  ExternalLink,
  CreditCard,
  History,
  AlertCircle
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ParentProfileCard } from '../../components/parent/ParentProfileCard';
import { ParentProfileEditModal } from '../../components/parent/ParentProfileEditModal';
import { ChildCard } from '../../components/parent/ChildCard';
import { ChildModal } from '../../components/parent/ChildModal';
import { TutorCard } from '../../components/tutors/TutorCard';
import { BookingModal } from '../../components/bookings/BookingModal';

export const ParentDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [parentProfile, setParentProfile] = useState(null);
  const [children, setChildren] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [cartTutors, setCartTutors] = useState([]);
  const [selectedTutorForBooking, setSelectedTutorForBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active Tab for Bookings & Cart
  const [activeTab, setActiveTab] = useState('cart'); // 'cart' | 'active' | 'history' | 'payments'

  // Modal States
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [childModalOpen, setChildModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState(null);
  const [savingChild, setSavingChild] = useState(false);
  const [deletingChildId, setDeletingChildId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, bookingsRes, cartRes] = await Promise.all([
        apiRequest('/parents/profile').catch(() => ({ profile: null, children: [] })),
        apiRequest('/bookings/my').catch(() => ({ bookings: [] })),
        apiRequest('/parents/cart').catch(() => ({ tutors: [] }))
      ]);

      if (profileRes.profile) setParentProfile(profileRes.profile);
      if (profileRes.children) setChildren(profileRes.children);
      if (bookingsRes.bookings) setBookings(bookingsRes.bookings);
      if (cartRes.tutors) setCartTutors(cartRes.tutors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Child Actions
  const handleOpenAddChild = () => {
    setEditingChild(null);
    setChildModalOpen(true);
  };

  const handleOpenEditChild = (child) => {
    setEditingChild(child);
    setChildModalOpen(true);
  };

  const handleSaveChild = async (childData) => {
    setSavingChild(true);
    try {
      if (editingChild) {
        const res = await apiRequest(`/parents/children/${editingChild._id}`, {
          method: 'PUT',
          body: JSON.stringify(childData)
        });
        if (res.success) {
          showToast('Student profile updated!', 'success');
          setChildren((prev) => prev.map((c) => (c._id === editingChild._id ? res.child : c)));
          setChildModalOpen(false);
        }
      } else {
        const res = await apiRequest('/parents/children', {
          method: 'POST',
          body: JSON.stringify(childData)
        });
        if (res.success) {
          showToast('Student profile added!', 'success');
          setChildren((prev) => [res.child, ...prev]);
          setChildModalOpen(false);
        }
      }
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSavingChild(false);
    }
  };

  const handleDeleteChild = async (childId) => {
    if (!window.confirm('Are you sure you want to remove this student profile?')) return;
    setDeletingChildId(childId);
    try {
      const res = await apiRequest(`/parents/children/${childId}`, {
        method: 'DELETE'
      });
      if (res.success) {
        showToast('Student profile removed', 'success');
        setChildren((prev) => prev.filter((c) => c._id !== childId));
      }
    } catch (err) {
      showToast(err.message || 'Failed to remove student', 'error');
    } finally {
      setDeletingChildId(null);
    }
  };

  // Group Bookings
  const activeBookings = bookings.filter((b) =>
    ['pending', 'accepted', 'confirmed', 'alternative_proposed'].includes(b.status)
  );

  const cartBookings = bookings.filter((b) =>
    b.bookingType === 'regular' &&
    ['pending', 'awaiting_payment'].includes(b.fee?.paymentStatus) &&
    b.status !== 'cancelled' &&
    b.status !== 'rejected'
  );

  const historyBookings = bookings.filter((b) =>
    ['completed', 'cancelled', 'rejected', 'disputed'].includes(b.status)
  );

  const paymentRecords = bookings.filter((b) =>
    b.fee?.paymentStatus === 'paid' || b.fee?.paymentStatus === 'recorded_direct_to_tutor'
  );

  return (
    <div className="space-y-6">
      {/* 1. Parent Profile Card */}
      <ParentProfileCard
        profile={parentProfile}
        user={user}
        childrenCount={children.length}
        onEdit={() => setProfileModalOpen(true)}
      />

      {/* 2. My Children Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              <span>My Children ({children.length})</span>
            </h2>
            <p className="text-xs text-slate-500">
              Saved student profiles auto-fill booking requests so you never re-enter information.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddChild}
            className="px-4 py-2.5 rounded-xl btn-3d-primary text-xs font-bold flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Child</span>
          </button>
        </div>

        {children.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">No children profiles registered yet</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Add your child once to instantly match with vetted home and online tutors in Mayur Vihar & Delhi NCR.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddChild}
              className="px-4 py-2 rounded-xl btn-3d-primary text-xs font-bold"
            >
              Add First Child
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {children.map((child) => (
              <ChildCard
                key={child._id}
                child={child}
                onEdit={handleOpenEditChild}
                onDelete={handleDeleteChild}
                isDeleting={deletingChildId === child._id}
              />
            ))}
          </div>
        )}
      </div>

      {/* 3. Parent Cart, Active Bookings & History Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 space-y-5">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 flex-wrap">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              My Bookings & Tuition Schedule
            </h2>
            <p className="text-xs text-slate-500">
              Manage your trial classes, confirmed batches, and payment history
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'active'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({activeBookings.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cart')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'cart'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Cart ({cartBookings.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              History ({historyBookings.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('payments')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'payments'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Payments ({paymentRecords.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Active Bookings */}
        {activeTab === 'active' && (
          <div className="space-y-3">
            {activeBookings.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 space-y-2">
                <div>No active tuition bookings currently in progress.</div>
                <Link
                  to="/find-tutors"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:underline pt-1"
                >
                  <span>Explore Verified Tutors</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              activeBookings.map((b) => (
                <div
                  key={b._id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2 flex-wrap">
                      <span>{b.subject} ({b.classGrade})</span>
                      <span className="text-slate-400 font-normal">with</span>
                      <span className="text-teal-800 font-bold">{b.tutorUser?.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                        Student: {b.childSnapshot?.fullName || b.child?.fullName || 'Child'}
                      </span>
                    </div>

                    <div className="text-slate-500 flex items-center gap-3 flex-wrap pt-0.5">
                      <span className="flex items-center gap-1">
                        <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Date: {new Date(b.schedule?.sessionDate).toLocaleDateString()}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{b.schedule?.startTime} - {b.schedule?.endTime}</span>
                      </span>
                      <span>•</span>
                      <span className="capitalize font-bold text-slate-700">
                        Mode: {b.teachingMode?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : b.status === 'alternative_proposed'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-sky-100 text-sky-800 border border-sky-200'
                      }`}
                    >
                      {b.status.replace('_', ' ')}
                    </span>
                    <Link
                      to="/parent/bookings"
                      className="px-3.5 py-2 rounded-xl btn-3d-secondary text-xs font-bold"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Tutor Cart & Pending Checkout */}
        {activeTab === 'cart' && (
          <div className="space-y-6">
            {/* Shortlisted Tutors in Cart */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-teal-600" />
                  <span>Shortlisted Tutors in Cart ({cartTutors.length})</span>
                </span>
                <Link
                  to="/parent/cart"
                  className="text-xs font-bold text-teal-700 hover:underline"
                >
                  View Full Cart & Recommendations →
                </Link>
              </div>

              {cartTutors.length === 0 ? (
                <div className="p-8 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-300 space-y-2">
                  <div className="font-bold text-slate-800 text-xs">No tutors currently in your cart</div>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Explore verified academic teachers and add them to your cart to book 1-on-1 home or online classes.
                  </p>
                  <Link
                    to="/find-tutors"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl btn-3d-primary text-xs font-bold mt-1"
                  >
                    <span>Browse Tutors</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cartTutors.map((tutor) => (
                    <TutorCard
                      key={tutor._id}
                      tutor={tutor}
                      isSaved={true}
                      onSave={async (id) => {
                        await apiRequest('/parents/cart/toggle', {
                          method: 'POST',
                          body: JSON.stringify({ tutorProfileId: id })
                        });
                        setCartTutors((prev) => prev.filter((t) => t._id !== id));
                        showToast('Tutor removed from cart', 'info');
                      }}
                      onBook={(t) => setSelectedTutorForBooking(t)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Pending Invoices */}
            {cartBookings.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block">
                  Pending Session Checkouts ({cartBookings.length})
                </span>
                {cartBookings.map((b) => (
                  <div
                    key={b._id}
                    className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-extrabold text-slate-900 text-sm">
                        Tuition Session: {b.subject} ({b.classGrade}) with {b.tutorUser?.name}
                      </div>
                      <div className="text-slate-600 flex items-center gap-2">
                        <span>Total Payable:</span>
                        <span className="font-black text-slate-900 text-sm">
                          ₹{b.fee?.totalAmount || b.fee?.agreedAmount || 500}
                        </span>
                        <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
                          Pending Payment
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/checkout/${b._id}`}
                      className="px-4 py-2 rounded-xl btn-3d-primary text-xs font-bold flex items-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Pay Now</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: History */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {historyBookings.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                No past session history recorded yet.
              </div>
            ) : (
              historyBookings.map((b) => (
                <div
                  key={b._id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-800">
                      {b.subject} ({b.classGrade}) with {b.tutorUser?.name}
                    </div>
                    <div className="text-slate-400 text-[11px] pt-0.5">
                      Session Date: {new Date(b.schedule?.sessionDate).toLocaleDateString()} • Student:{' '}
                      {b.childSnapshot?.fullName || b.child?.fullName || 'Student'}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-700">
                    {b.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Payments */}
        {activeTab === 'payments' && (
          <div className="space-y-3">
            {paymentRecords.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                No verified payment transactions found yet.
              </div>
            ) : (
              paymentRecords.map((b) => (
                <div
                  key={b._id}
                  className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">
                      Payment for {b.subject} with {b.tutorUser?.name}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Status: Verified & Confirmed • Mode: Online Payment
                    </div>
                  </div>
                  <div className="font-black text-emerald-800 text-sm">
                    ₹{b.fee?.totalAmount || b.fee?.agreedAmount || 500}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Edit Parent Profile Modal */}
      <ParentProfileEditModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        profile={parentProfile}
        onProfileUpdated={(updated) => setParentProfile(updated)}
      />

      {/* Add / Edit Child Modal */}
      <ChildModal
        isOpen={childModalOpen}
        onClose={() => setChildModalOpen(false)}
        child={editingChild}
        isSaving={savingChild}
        onSave={handleSaveChild}
      />

      {/* Booking Modal */}
      {selectedTutorForBooking && (
        <BookingModal
          tutor={selectedTutorForBooking}
          onClose={() => setSelectedTutorForBooking(null)}
          onBookingSuccess={() => {
            setSelectedTutorForBooking(null);
            showToast('Session request sent successfully!', 'success');
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
};
