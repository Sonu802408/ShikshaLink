import React, { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const ParentReviews = () => {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
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
    fetchReviews();
  }, [showToast]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">My Reviews & Feedback</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Reviews you have submitted for completed tuition sessions
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Star className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-sm">No reviews submitted yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once you complete a trial demo or regular class, you can rate the teacher and help the community.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {r.booking?.subject} with {r.tutorUser?.name}
                  </h3>
                  <div className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</div>
                </div>

                <div className="flex items-center gap-1 font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 text-xs">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{r.overallRating}.0 / 5.0</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl text-center">
                <div>Quality: <strong>{r.teachingQualityRating}/5</strong></div>
                <div>Punctuality: <strong>{r.punctualityRating}/5</strong></div>
                <div>Communication: <strong>{r.communicationRating}/5</strong></div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed italic">
                "{r.feedbackText}"
              </p>

              {r.tutorReply?.text && (
                <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-100 text-xs text-teal-950">
                  <span className="font-bold">Tutor Reply:</span> {r.tutorReply.text}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
