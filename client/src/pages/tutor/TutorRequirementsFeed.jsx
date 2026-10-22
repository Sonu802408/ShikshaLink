import React, { useState, useEffect } from 'react';
import { FileText, MapPin, Clock, DollarSign, Laptop, Sparkles } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const TutorRequirementsFeed = () => {
  const { showToast } = useToast();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await apiRequest('/requirements/feed');
        if (res.success) {
          setFeed(res.feed || []);
        }
      } catch (err) {
        showToast('Failed to load opportunities feed', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, [showToast]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Tuition Opportunities Feed</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Active parent tuition requirements in Mayur Vihar & Delhi NCR matching your subjects and teaching modes
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Scanning matching requirements...</div>
      ) : feed.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-sm">No new matching requirements</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When parents post requirements in your subjects and localities, they will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {feed.map((reqItem) => (
            <div
              key={reqItem._id}
              className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-2xs"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{reqItem.title}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                    <span>Student: {reqItem.childSummary?.displayName || 'Student'}</span>
                    <span className="capitalize">Mode: <strong>{reqItem.teachingMode?.replace('_', ' ')}</strong></span>
                    <span>Locality: <strong>{reqItem.location?.locality}</strong></span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-teal-700">
                    Up to ₹{reqItem.budget?.maxBudget} / {reqItem.budget?.budgetType}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Posted on {new Date(reqItem.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {reqItem.subjects?.map((sub) => (
                  <span key={sub} className="px-2.5 py-0.5 rounded-md bg-slate-100 text-xs font-medium text-slate-800">
                    {sub}
                  </span>
                ))}
              </div>

              {reqItem.schedule?.classesPerWeek && (
                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                  <strong>Expected Frequency:</strong> {reqItem.schedule.classesPerWeek} sessions/week ({reqItem.schedule.durationHours || 1.5} hrs/session)
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
