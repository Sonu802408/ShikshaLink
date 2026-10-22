import React, { useState, useEffect } from 'react';
import { Star, ShieldAlert, CheckCircle2, EyeOff, Eye } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminReviews = () => {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/admin/reviews');
      if (res.success) {
        setReviews(res.reviews || []);
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

  const handleModerate = async (id, status, isPublished) => {
    try {
      const res = await apiRequest(`/admin/reviews/${id}/moderate`, {
        method: 'PATCH',
        body: JSON.stringify({
          moderationStatus: status,
          isPublished
        })
      });
      if (res.success) {
        showToast('Review moderation updated', 'success');
        setReviews((prev) =>
          prev.map((r) => (r._id === id ? res.review : r))
        );
      }
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Review Moderation</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Audit ratings and comments submitted by parents for completed bookings
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-400">
          No reviews submitted on platform yet.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    Parent: {r.parentUser?.name} → Tutor: {r.tutorUser?.name}
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {r.overallRating}.0
                  </span>
                  <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                    r.moderationStatus === 'approved'
                      ? 'bg-teal-50 text-teal-800'
                      : 'bg-rose-50 text-rose-800'
                  }`}>
                    {r.moderationStatus}
                  </span>
                </div>
              </div>

              <p className="text-slate-700 italic bg-slate-50 p-3 rounded-xl">
                "{r.feedbackText}"
              </p>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">Status: {r.isPublished ? 'Published' : 'Hidden'}</span>
                <div className="flex items-center gap-2">
                  {r.isPublished ? (
                    <button
                      onClick={() => handleModerate(r._id, 'hidden', false)}
                      className="px-3 py-1.5 border border-rose-200 text-rose-600 rounded-xl font-bold hover:bg-rose-50 flex items-center gap-1"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      Hide Review
                    </button>
                  ) : (
                    <button
                      onClick={() => handleModerate(r._id, 'approved', true)}
                      className="px-3 py-1.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Publish Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
