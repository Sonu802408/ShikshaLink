import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Clock,
  MapPin,
  Laptop,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  ExternalLink,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ReviewFormModal } from '../../components/reviews/ReviewFormModal';

export const ParentBookings = () => {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  // Review Modal State
  const [reviewBooking, setReviewBooking] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/bookings/my');
      if (data.success) {
        setBookings(data.bookings || []);
      }
    } catch (err) {
      showToast('Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleRespondAlternative = async (bookingId, accept) => {
    let reason = '';
    if (!accept) {
      reason = prompt('Reason for declining alternative schedule (optional):') || '';
    }

    try {
      const res = await apiRequest(`/bookings/${bookingId}/respond-alternative`, {
        method: 'PATCH',
        body: JSON.stringify({ accept, reason })
      });
      if (res.success) {
        showToast(res.message, 'success');
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? res.booking : b))
        );
      }
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const reason = prompt('Please enter a cancellation reason:');
    if (!reason) return;

    try {
      const res = await apiRequest(`/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ reason })
      });
      if (res.success) {
        showToast('Booking cancelled', 'info');
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? res.booking : b))
        );
      }
    } catch (err) {
      showToast(err.message || 'Failed to cancel booking', 'error');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeFilter === 'upcoming') {
      return ['pending', 'confirmed', 'accepted', 'alternative_proposed'].includes(b.status);
    }
    if (activeFilter === 'completed') {
      return ['completed', 'demo_completed'].includes(b.status);
    }
    if (activeFilter === 'cancelled') {
      return b.status === 'cancelled';
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Bookings & Demo Classes</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track confirmed sessions, manage schedule change proposals, and leave verified reviews
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
          {['all', 'upcoming', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                activeFilter === tab
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
        <div className="p-8 text-center text-xs text-slate-400">Loading your bookings...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <CalendarCheck className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-sm">No bookings in this category</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Book a trial demo session with any verified tutor from the search page.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const isConfirmed = b.status === 'confirmed';
            const isCompleted = ['completed', 'demo_completed'].includes(b.status);
            const isAlternative = b.status === 'alternative_proposed';

            return (
              <div
                key={b._id}
                className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xs"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center uppercase shrink-0">
                      {b.tutorUser?.name?.[0] || 'T'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {b.subject} ({b.classGrade}) with {b.tutorUser?.name}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase">
                          {b.bookingType}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-3 mt-1 flex-wrap">
                        <span>Student: <strong className="text-slate-700">{b.child?.displayName || 'Child'}</strong></span>
                        <span>Mode: <strong className="capitalize text-slate-700">{b.teachingMode?.replace('_', ' ')}</strong></span>
                        <span>Fee: {b.fee?.isDemoFree ? 'Free Trial' : `₹${b.fee?.agreedAmount}/hr`}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    isConfirmed
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : isAlternative
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : isCompleted
                      ? 'bg-teal-50 text-teal-800 border border-teal-200'
                      : b.status === 'cancelled'
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : 'bg-blue-50 text-blue-800 border border-blue-200'
                  }`}>
                    {b.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Session Schedule Box */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700">
                  <div className="flex items-center gap-2 font-semibold">
                    <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Scheduled Session:</span>
                    <span className="text-slate-900 font-bold">
                      {new Date(b.schedule?.sessionDate).toLocaleDateString()} at {b.schedule?.startTime} - {b.schedule?.endTime}
                    </span>
                  </div>

                  {/* Online link display */}
                  {b.teachingMode === 'online' && b.onlineDetails?.meetingLink && isConfirmed && (
                    <a
                      href={b.onlineDetails.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-xl bg-blue-600 text-white font-bold flex items-center gap-1.5 hover:bg-blue-700"
                    >
                      <span>Join Online Class</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {/* Centre Address unlocked */}
                  {b.teachingMode === 'tutor_centre' && isConfirmed && b.centreDetails?.centreAddress && (
                    <div className="text-xs text-purple-900">
                      <strong>Centre Address:</strong> {b.centreDetails.centreAddress}
                    </div>
                  )}
                </div>

                {/* Alternative Proposed Banner */}
                {isAlternative && b.proposedAlternative && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3 text-xs text-amber-950">
                    <div className="font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      Tutor Proposed a Different Schedule:
                    </div>
                    <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60 font-semibold space-y-1">
                      <div>
                        New Date & Time:{' '}
                        <strong>
                          {new Date(b.proposedAlternative.sessionDate).toLocaleDateString()} at {b.proposedAlternative.startTime} - {b.proposedAlternative.endTime}
                        </strong>
                      </div>
                      {b.proposedAlternative.notes && (
                        <div className="text-slate-600 font-normal italic">
                          Note: "{b.proposedAlternative.notes}"
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleRespondAlternative(b._id, true)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                      >
                        Accept Proposed Time
                      </button>
                      <button
                        onClick={() => handleRespondAlternative(b._id, false)}
                        className="px-4 py-2 border border-slate-300 bg-white font-bold text-slate-700 rounded-xl"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Row */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="text-slate-400">
                    Booking ID: #{b._id.slice(-6).toUpperCase()}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Review Button for completed sessions */}
                    {isCompleted && !b.hasReview && (
                      <button
                        onClick={() => setReviewBooking(b)}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                      >
                        <Star className="w-3.5 h-3.5 fill-white" />
                        Leave Review
                      </button>
                    )}

                    {/* Cancellation Button for active/pending */}
                    {!isCompleted && b.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancelBooking(b._id)}
                        className="px-3 py-1.5 border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl font-medium"
                      >
                        Cancel Session
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <ReviewFormModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onReviewSubmitted={() => {
            setReviewBooking(null);
            fetchBookings();
          }}
        />
      )}
    </div>
  );
};
