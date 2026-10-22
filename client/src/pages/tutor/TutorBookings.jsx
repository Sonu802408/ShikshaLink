import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Clock,
  MapPin,
  Laptop,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Link as LinkIcon,
  Phone,
  ShieldCheck,
  Send
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const TutorBookings = () => {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Alternative Proposal Modal
  const [alternativeModalBooking, setAlternativeModalBooking] = useState(null);
  const [altDate, setAltDate] = useState('');
  const [altStartTime, setAltStartTime] = useState('17:00');
  const [altEndTime, setAltEndTime] = useState('18:00');
  const [altNotes, setAltNotes] = useState('');

  // Meeting Link Modal
  const [meetingModalBooking, setMeetingModalBooking] = useState(null);
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingInstructions, setMeetingInstructions] = useState('');

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

  const handleAccept = async (id) => {
    try {
      const res = await apiRequest(`/bookings/${id}/accept`, { method: 'PATCH' });
      if (res.success) {
        showToast('Booking accepted and confirmed! Student contact details unlocked.', 'success');
        setBookings((prev) => prev.map((b) => (b._id === id ? res.booking : b)));
      }
    } catch (err) {
      showToast(err.message || 'Failed to accept booking', 'error');
    }
  };

  const handleOpenAlternative = (booking) => {
    setAlternativeModalBooking(booking);
    const d = new Date(booking.schedule?.sessionDate);
    setAltDate(d.toISOString().split('T')[0]);
    setAltStartTime(booking.schedule?.startTime || '17:00');
    setAltEndTime(booking.schedule?.endTime || '18:00');
    setAltNotes('');
  };

  const handleSubmitAlternative = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest(`/bookings/${alternativeModalBooking._id}/propose-alternative`, {
        method: 'PATCH',
        body: JSON.stringify({
          sessionDate: altDate,
          startTime: altStartTime,
          endTime: altEndTime,
          notes: altNotes
        })
      });
      if (res.success) {
        showToast('Alternative schedule proposed to parent.', 'success');
        setBookings((prev) =>
          prev.map((b) => (b._id === alternativeModalBooking._id ? res.booking : b))
        );
        setAlternativeModalBooking(null);
      }
    } catch (err) {
      showToast(err.message || 'Failed to propose alternative', 'error');
    }
  };

  const handleOpenMeeting = (booking) => {
    setMeetingModalBooking(booking);
    setMeetingLink(booking.onlineDetails?.meetingLink || '');
    setMeetingInstructions(booking.onlineDetails?.instructions || '');
  };

  const handleSubmitMeeting = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest(`/bookings/${meetingModalBooking._id}/meeting-link`, {
        method: 'PATCH',
        body: JSON.stringify({
          meetingLink,
          instructions: meetingInstructions
        })
      });
      if (res.success) {
        showToast('Meeting link saved and shared with student!', 'success');
        setBookings((prev) =>
          prev.map((b) =>
            b._id === meetingModalBooking._id
              ? { ...b, onlineDetails: res.onlineDetails }
              : b
          )
        );
        setMeetingModalBooking(null);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update meeting link', 'error');
    }
  };

  const handleMarkCompleted = async (id) => {
    if (!window.confirm('Confirm that this tuition session has concluded?')) return;
    try {
      const res = await apiRequest(`/bookings/${id}/complete`, { method: 'PATCH' });
      if (res.success) {
        showToast('Session marked as completed.', 'success');
        setBookings((prev) => prev.map((b) => (b._id === id ? res.booking : b)));
      }
    } catch (err) {
      showToast(err.message || 'Failed to mark completed', 'error');
    }
  };

  const handleCancelBooking = async (id) => {
    const reason = prompt('Please specify cancellation reason:');
    if (!reason) return;
    try {
      const res = await apiRequest(`/bookings/${id}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ reason })
      });
      if (res.success) {
        showToast('Booking cancelled.', 'info');
        setBookings((prev) => prev.map((b) => (b._id === id ? res.booking : b)));
      }
    } catch (err) {
      showToast(err.message || 'Failed to cancel', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Session & Demo Requests</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review incoming requests, accept confirmed slots, or suggest alternative timings
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading requests...</div>
      ) : bookings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <CalendarCheck className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-sm">No session requests yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Ensure your profile is complete with verified qualifications to start receiving student requests.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const isPending = b.status === 'pending';
            const isConfirmed = b.status === 'confirmed';
            const isCompleted = ['completed', 'demo_completed'].includes(b.status);

            return (
              <div
                key={b._id}
                className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xs"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {b.subject} ({b.classGrade}) with {b.child?.displayName || 'Student'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase">
                        {b.bookingType}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      <span>Parent: <strong>{b.parentUser?.name}</strong></span>
                      <span>Mode: <strong className="capitalize text-slate-700">{b.teachingMode?.replace('_', ' ')}</strong></span>
                      <span>Fee: {b.fee?.isDemoFree ? 'Free Trial' : `₹${b.fee?.agreedAmount}/hr`}</span>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    isConfirmed
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : isPending
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : isCompleted
                      ? 'bg-teal-50 text-teal-800 border border-teal-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {b.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Schedule & Address Details */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2 font-semibold">
                    <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Session Schedule:</span>
                    <strong className="text-slate-900">
                      {new Date(b.schedule?.sessionDate).toLocaleDateString()} at {b.schedule?.startTime} - {b.schedule?.endTime}
                    </strong>
                  </div>

                  {/* Student's Home Address (Only revealed when confirmed/accepted) */}
                  {b.teachingMode === 'student_home' && (
                    <div className="flex items-start gap-2 pt-1 border-t border-slate-200/60">
                      <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Address: </strong>
                        <span>{b.homeTuitionDetails?.studentExactAddress}</span>
                        {isConfirmed && b.homeTuitionDetails?.parentContactPhone && (
                          <span className="ml-3 font-semibold text-slate-900">
                            Parent Phone: {b.homeTuitionDetails.parentContactPhone}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Online Class Meeting Link */}
                  {b.teachingMode === 'online' && isConfirmed && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Meeting Link: <strong>{b.onlineDetails?.meetingLink || 'Not set yet'}</strong></span>
                      </div>
                      <button
                        onClick={() => handleOpenMeeting(b)}
                        className="text-teal-700 font-bold hover:underline"
                      >
                        {b.onlineDetails?.meetingLink ? 'Edit Link' : '+ Add Meeting Link'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="text-slate-400">ID: #{b._id.slice(-6).toUpperCase()}</div>

                  <div className="flex items-center gap-2">
                    {/* Pending Actions */}
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleAccept(b._id)}
                          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs"
                        >
                          Accept & Confirm
                        </button>
                        <button
                          onClick={() => handleOpenAlternative(b)}
                          className="px-3.5 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50"
                        >
                          Propose Other Time
                        </button>
                        <button
                          onClick={() => handleCancelBooking(b._id)}
                          className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-medium"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {/* Confirmed Actions */}
                    {isConfirmed && (
                      <>
                        <button
                          onClick={() => handleMarkCompleted(b._id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                        >
                          Mark Completed
                        </button>
                        <button
                          onClick={() => handleCancelBooking(b._id)}
                          className="px-3 py-2 text-slate-500 hover:text-rose-600 font-medium"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Alternative Time Modal */}
      {alternativeModalBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">
              Propose Alternative Schedule
            </h3>
            <form onSubmit={handleSubmitAlternative} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Proposed Date
                </label>
                <input
                  type="date"
                  required
                  value={altDate}
                  onChange={(e) => setAltDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={altStartTime}
                    onChange={(e) => setAltStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={altEndTime}
                    onChange={(e) => setAltEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Note to Parent (Reason for schedule proposal)
                </label>
                <textarea
                  rows={2}
                  value={altNotes}
                  onChange={(e) => setAltNotes(e.target.value)}
                  placeholder="e.g. I have a batch clash on the requested slot; would this alternative time work for your child?"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAlternativeModalBooking(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-teal-600 text-white font-bold"
                >
                  Send Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Online Meeting Link Modal */}
      {meetingModalBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">
              Online Class Meeting Link
            </h3>
            <form onSubmit={handleSubmitMeeting} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Meeting URL (Google Meet / Zoom)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://meet.google.com/..."
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Instructions for Student
                </label>
                <textarea
                  rows={2}
                  value={meetingInstructions}
                  onChange={(e) => setMeetingInstructions(e.target.value)}
                  placeholder="e.g. Please join 5 minutes early with your textbook and notebook ready..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMeetingModalBooking(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-teal-600 text-white font-bold"
                >
                  Save Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
