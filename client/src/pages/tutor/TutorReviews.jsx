import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, CornerDownRight, Send } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const TutorReviews = () => {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/reviews/my');
      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch (err) {
      showToast('Failed to load reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSendReply = async (reviewId) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await apiRequest(`/reviews/${reviewId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ replyText: replyText.trim() })
      });
      if (res.success) {
        showToast('Reply published!', 'success');
        setReviews((prev) =>
          prev.map((r) => (r._id === reviewId ? res.review : r))
        );
        setReplyingId(null);
        setReplyText('');
      }
    } catch (err) {
      showToast('Failed to post reply', 'error');
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Student Reviews & Ratings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Feedback submitted by parents from completed tuition sessions
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Star className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-sm">No student reviews yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Reviews will appear here as you conduct and complete demo or regular classes.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {r.parentUser?.name || 'Verified Parent'}
                  </div>
                  <div className="text-xs text-slate-400">
                    {r.booking?.subject} ({r.booking?.classGrade}) • {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-1 font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 text-xs">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{r.overallRating}.0 / 5.0</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl text-center">
                <div>Teaching Quality: <strong>{r.teachingQualityRating}/5</strong></div>
                <div>Punctuality: <strong>{r.punctualityRating}/5</strong></div>
                <div>Communication: <strong>{r.communicationRating}/5</strong></div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed italic">
                "{r.feedbackText}"
              </p>

              {/* Existing Tutor Reply */}
              {r.tutorReply?.text ? (
                <div className="p-3 bg-teal-50/70 rounded-2xl border border-teal-100 text-xs text-teal-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-teal-900">
                    <CornerDownRight className="w-3.5 h-3.5" />
                    Your Response:
                  </div>
                  <p>{r.tutorReply.text}</p>
                </div>
              ) : replyingId === r._id ? (
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your professional response to this parent..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-teal-500"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSendReply(r._id)}
                      disabled={submittingReply}
                      className="px-4 py-1.5 bg-teal-600 text-white rounded-xl font-bold flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Publish Reply
                    </button>
                    <button
                      onClick={() => setReplyingId(null)}
                      className="px-3 py-1.5 border border-slate-300 rounded-xl font-medium text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setReplyingId(r._id);
                    setReplyText('');
                  }}
                  className="text-xs font-bold text-teal-700 hover:underline pt-1 inline-block"
                >
                  + Reply to this review
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
