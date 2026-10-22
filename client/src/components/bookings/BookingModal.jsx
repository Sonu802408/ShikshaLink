import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Laptop, Building2, ShieldCheck, AlertCircle } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const BookingModal = ({ tutor, onClose, onBookingSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [bookingType, setBookingType] = useState('demo');
  const [teachingMode, setTeachingMode] = useState(tutor?.teachingModes?.[0] || 'online');
  const [subject, setSubject] = useState(tutor?.subjects?.[0] || 'Mathematics');
  const [classGrade, setClassGrade] = useState(tutor?.classes?.[0] || 'Class 10');
  const [sessionDate, setSessionDate] = useState('');
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('18:00');
  const [studentExactAddress, setStudentExactAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingChildren, setFetchingChildren] = useState(true);

  // Set minimum date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];

  useEffect(() => {
    if (!sessionDate) {
      setSessionDate(minDateStr);
    }
  }, [minDateStr, sessionDate]);

  useEffect(() => {
    const fetchChildren = async () => {
      if (!isAuthenticated || user?.role !== 'parent') {
        setFetchingChildren(false);
        return;
      }
      try {
        const data = await apiRequest('/parents/children');
        if (data.success && data.children) {
          setChildren(data.children);
          if (data.children.length > 0) {
            setSelectedChildId(data.children[0]._id);
            if (data.children[0].classGrade) {
              setClassGrade(data.children[0].classGrade);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetchingChildren(false);
      }
    };
    fetchChildren();
  }, [isAuthenticated, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedChildId) {
      showToast('Please select or add a child profile first.', 'error');
      return;
    }

    if (!sessionDate || !startTime || !endTime) {
      showToast('Please select session date and time slot.', 'error');
      return;
    }

    if (startTime >= endTime) {
      showToast('End time must be after start time.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        tutorProfileId: tutor._id,
        childId: selectedChildId,
        teachingMode,
        bookingType,
        subject,
        classGrade,
        sessionDate,
        startTime,
        endTime,
        studentExactAddress,
        notes
      };

      const res = await apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.success) {
        showToast('Booking request submitted! The tutor will review and respond.', 'success');
        if (onBookingSuccess) onBookingSuccess(res.booking);
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit booking request', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isFreeDemo = bookingType === 'demo' && tutor?.demoClassFee === 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
              {bookingType === 'demo' ? 'Trial Class Request' : 'Tuition Booking'}
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
              Book with {tutor?.user?.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Booking Type Switcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Session Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBookingType('demo')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-center transition-all ${
                  bookingType === 'demo'
                    ? 'bg-teal-50 border-teal-500 text-teal-800 shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Trial / Demo Class {tutor?.demoClassFee === 0 ? '(Free)' : `(₹${tutor?.demoClassFee})`}
              </button>
              <button
                type="button"
                onClick={() => setBookingType('regular')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-center transition-all ${
                  bookingType === 'regular'
                    ? 'bg-teal-50 border-teal-500 text-teal-800 shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Regular Tuition Session (₹{tutor?.feeStructure?.hourlyRate || 500}/hr)
              </button>
            </div>
          </div>

          {/* Child Profile Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Child / Student
            </label>
            {children.length > 0 ? (
              <select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 font-medium text-slate-800"
                required
              >
                {children.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.displayName || c.fullName} ({c.classGrade}, {c.board})
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  No child profile added yet. Please add a child in your parent dashboard before booking.
                </div>
              </div>
            )}
          </div>

          {/* Teaching Mode (Restricted to tutor's supported modes) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Teaching Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['online', 'student_home', 'tutor_centre'].map((mode) => {
                const isSupported = tutor?.teachingModes?.includes(mode);
                return (
                  <button
                    key={mode}
                    type="button"
                    disabled={!isSupported}
                    onClick={() => setTeachingMode(mode)}
                    className={`py-2 px-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                      teachingMode === mode
                        ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold'
                        : isSupported
                        ? 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                    }`}
                  >
                    {mode === 'online' && <Laptop className="w-4 h-4" />}
                    {mode === 'student_home' && <MapPin className="w-4 h-4" />}
                    {mode === 'tutor_centre' && <Building2 className="w-4 h-4" />}
                    <span>{mode === 'online' ? 'Online' : mode === 'student_home' ? "Student's Home" : "Tutor's Centre"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject & Class */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-teal-500 text-xs font-medium"
                required
              >
                {tutor?.subjects?.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Class / Grade
              </label>
              <select
                value={classGrade}
                onChange={(e) => setClassGrade(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-teal-500 text-xs font-medium"
                required
              >
                {tutor?.classes?.map((cl) => (
                  <option key={cl} value={cl}>{cl}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Schedule: Date & Times */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Preferred Session Date & Time
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <input
                  type="date"
                  min={minDateStr}
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  required
                />
              </div>
              <div>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  required
                />
              </div>
              <div>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  required
                />
              </div>
            </div>
          </div>

          {/* Home Address if Student's Home mode */}
          {teachingMode === 'student_home' && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Home Address (Protected)
              </div>
              <input
                type="text"
                placeholder="Flat / House number, Society / Pocket (e.g. Pocket 1, Mayur Vihar Phase 1)"
                value={studentExactAddress}
                onChange={(e) => setStudentExactAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                required
              />
              <p className="text-[11px] text-slate-500 leading-tight">
                Privacy guarantee: Your exact address and phone number are revealed to the tutor only after booking confirmation.
              </p>
            </div>
          )}

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Learning Focus or Notes for Tutor (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Needs help with trigonometry and quadratic equations..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-teal-500"
            />
          </div>

          {/* Pricing summary */}
          <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-2xl flex items-center justify-between text-xs text-teal-950 font-medium">
            <span>Session Fee:</span>
            <span className="font-bold text-sm">
              {isFreeDemo ? 'Free Trial Class' : `₹${tutor?.feeStructure?.hourlyRate || 500} / hr`}
            </span>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || children.length === 0}
              className="w-1/2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
