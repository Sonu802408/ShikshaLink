import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const ReviewFormModal = ({ booking, onClose, onReviewSubmitted }) => {
  const { showToast } = useToast();
  const [overallRating, setOverallRating] = useState(5);
  const [teachingQualityRating, setTeachingQualityRating] = useState(5);
  const [punctualityRating, setPunctualityRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const renderStarSelector = (value, setter, label) => {
    return (
      <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
        <span className="text-xs font-semibold text-slate-700">{label}</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setter(star)}
              className="p-1 text-slate-300 hover:text-amber-400 transition-colors"
            >
              <Star
                className={`w-5 h-5 ${
                  star <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                }`}
              />
            </button>
          ))}
          <span className="text-xs font-bold text-slate-700 w-4 ml-1">{value}</span>
        </div>
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (feedbackText.trim().length < 10) {
      showToast('Please provide at least 10 characters of feedback.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiRequest('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          bookingId: booking._id,
          overallRating,
          teachingQualityRating,
          punctualityRating,
          communicationRating,
          feedbackText: feedbackText.trim()
        })
      });

      if (res.success) {
        showToast('Review submitted successfully! Thank you for supporting the tutor community.', 'success');
        if (onReviewSubmitted) onReviewSubmitted(res.review);
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200/90 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="font-bold text-slate-900 text-lg tracking-tight">Leave Tutor Review</h3>
            <p className="text-xs text-slate-500">{booking.subject} with {booking.tutorUser?.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 space-y-1 shadow-2xs">
            {renderStarSelector(overallRating, setOverallRating, 'Overall Experience')}
            {renderStarSelector(teachingQualityRating, setTeachingQualityRating, 'Teaching Quality')}
            {renderStarSelector(punctualityRating, setPunctualityRating, 'Punctuality & Timeliness')}
            {renderStarSelector(communicationRating, setCommunicationRating, 'Communication')}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Detailed Feedback (Genuine Experience)
            </label>
            <textarea
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Describe how the tutor explained concepts, engaged the student, and helped with homework or doubts..."
              className="w-full px-3.5 py-2.5 rounded-xl input-3d text-xs font-medium"
              required
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-xl btn-3d-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-1/2 py-2.5 rounded-xl btn-3d-primary text-xs uppercase tracking-wider font-bold"
            >
              {submitting ? 'Publishing...' : 'Publish Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
