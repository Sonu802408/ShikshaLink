import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, Heart, Sparkles, Code2, Globe, Trash2 } from 'lucide-react';
import { VerificationBadge, TeachingModeBadge } from '../common/Badge';
import { getAvatarUrl, apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const TutorCard = ({
  tutor,
  onBook,
  onSave,
  isSaved = false,
  onToggleCompare,
  isComparing = false,
  onDelete
}) => {
  const { user: authUser } = useAuth();
  const { showToast } = useToast();
  const [deleted, setDeleted] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleAdminDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const tutorName = tutor.fullName || tutor.user?.name || 'this tutor';
    if (!window.confirm(`Admin Action: Permanently delete tutor card for "${tutorName}"? This action cannot be undone.`)) {
      return;
    }
    setDeleting(true);
    try {
      const res = await apiRequest(`/admin/tutors/${tutor._id}/permanent`, {
        method: 'DELETE',
        body: JSON.stringify({ confirmDelete: true })
      });
      if (res.success) {
        showToast(res.message || 'Tutor card deleted successfully', 'success');
        setDeleted(true);
        if (onDelete) onDelete(tutor._id);
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete tutor card', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (deleted) return null;
  const user = tutor.user || {};
  const fee = tutor.feeStructure?.hourlyRate || 500;
  const isFreeDemo = tutor.demoClassAvailable && tutor.demoClassFee === 0;

  // Professional title & qualification display
  const title = tutor.professionalTitle || tutor.headline || 'Dedicated Academic Tutor';
  const qualification = tutor.qualificationDisplay || (tutor.educationDetails?.degree ? `${tutor.educationDetails.degree} (${tutor.educationDetails.status || 'Pursuing'})` : null);
  const locality = tutor.serviceArea?.locality || tutor.primaryLocality || 'East Delhi';
  const languages = tutor.teachingLanguages && tutor.teachingLanguages.length > 0
    ? tutor.teachingLanguages.join(', ')
    : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
      <div className="p-4 sm:p-5 space-y-3">
        {/* Top Header: Avatar, Name, Title, Qualification, Save */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Link
              to={`/tutors/${tutor._id}`}
              className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-sky-700 to-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0 overflow-hidden ring-2 ring-slate-100 hover:opacity-95 transition-opacity"
            >
              <span className="uppercase select-none">{user.name?.[0] || tutor.fullName?.[0] || 'T'}</span>
              {(user.avatar || tutor.avatar) && (
                <img
                  src={getAvatarUrl(user.avatar || tutor.avatar)}
                  alt={user.name || tutor.fullName || 'Tutor photo'}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </Link>

            <div className="min-w-0">
              <Link
                to={`/tutors/${tutor._id}`}
                className="font-bold text-slate-900 text-base hover:text-teal-600 transition-colors line-clamp-1 block"
              >
                {user.name}
              </Link>
              <p className="text-xs font-medium text-slate-600 line-clamp-1">{title}</p>

              {qualification && (
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200/60 text-[11px] font-semibold">
                  {qualification}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {authUser?.role === 'admin' && (
              <button
                type="button"
                onClick={handleAdminDelete}
                disabled={deleting}
                className="p-2 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                title="Admin: Permanently delete this tutor card"
                aria-label="Delete tutor card"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onSave && onSave(tutor._id)}
              className={`p-2 rounded-xl border transition-colors ${
                isSaved
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-slate-50'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save tutor'}
              aria-label="Save tutor"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Short Introduction */}
        {tutor.shortIntro && (
          <p className="text-xs text-slate-600 bg-slate-50/80 px-2.5 py-1.5 rounded-lg border border-slate-100/90 italic line-clamp-2 leading-relaxed">
            "{tutor.shortIntro}"
          </p>
        )}

        {/* Locality & Languages */}
        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap pt-0.5">
          <span className="flex items-center gap-1 font-medium text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="line-clamp-1">{locality}</span>
          </span>
          {languages && (
            <>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-[11px] text-slate-600">
                <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                {languages}
              </span>
            </>
          )}
        </div>

        {/* Verification Badges (if any) */}
        {(tutor.verificationBadges?.qualificationVerified ||
          tutor.verificationBadges?.backgroundChecked ||
          tutor.verificationBadges?.idDocumentVerified) && (
          <div className="flex flex-wrap gap-1">
            {tutor.verificationBadges?.qualificationVerified && (
              <VerificationBadge type="qualification" />
            )}
            {tutor.verificationBadges?.backgroundChecked && (
              <VerificationBadge type="background" />
            )}
            {tutor.verificationBadges?.idDocumentVerified && (
              <VerificationBadge type="id" />
            )}
          </div>
        )}

        {/* Teaching Modes */}
        <div className="flex flex-wrap gap-1.5">
          {tutor.teachingModes?.map((mode) => (
            <TeachingModeBadge key={mode} mode={mode} />
          ))}
          {isFreeDemo && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Free Demo
            </span>
          )}
        </div>

        {/* Subjects & Classes */}
        <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100/80">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-700 shrink-0">Subjects:</span>
            {tutor.subjects?.slice(0, 3).map((sub) => (
              <span key={sub} className="px-1.5 py-0.5 rounded bg-slate-100 font-medium text-slate-700 text-[11px]">
                {sub}
              </span>
            ))}
            {tutor.subjects?.length > 3 && (
              <span className="text-slate-400 text-[11px]">+{tutor.subjects.length - 3} more</span>
            )}
          </div>

          {/* Programming skills tag line if tutor has programming skills */}
          {tutor.programmingSkills && tutor.programmingSkills.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-700 flex items-center gap-1 shrink-0">
                <Code2 className="w-3 h-3 text-teal-600" />
                Coding:
              </span>
              {tutor.programmingSkills.slice(0, 3).map((skill) => (
                <span key={skill} className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 font-medium text-[11px] border border-teal-100">
                  {skill}
                </span>
              ))}
              {tutor.programmingSkills.length > 3 && (
                <span className="text-slate-400 text-[11px]">+{tutor.programmingSkills.length - 3}</span>
              )}
            </div>
          )}

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-700 shrink-0">Classes:</span>
            <span className="text-slate-600 text-[11px] line-clamp-1">
              {tutor.classes?.slice(0, 4).join(', ') || 'Classes 1–12, College'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer bar: Rating, Pricing, View Full Profile, and Book Tutor */}
      <div className="px-4 sm:px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        <div className="shrink-0">
          {tutor.reviewCount > 0 ? (
            <div className="flex items-center gap-1">
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 border border-amber-200 rounded-md font-bold text-xs text-amber-800">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {tutor.averageRating?.toFixed(1) || '5.0'}
              </span>
              <span className="text-[11px] text-slate-400">({tutor.reviewCount})</span>
            </div>
          ) : (
            <span className="text-[11px] font-medium text-slate-500">No reviews yet</span>
          )}
          <div className="text-slate-900 font-bold text-sm">
            ₹{fee}<span className="text-xs font-normal text-slate-500">/hr</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onToggleCompare && (
            <label className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-slate-600 cursor-pointer select-none mr-1">
              <input
                type="checkbox"
                checked={isComparing}
                onChange={() => onToggleCompare(tutor)}
                className="w-3.5 h-3.5 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
              Compare
            </label>
          )}

          <Link
            to={`/tutors/${tutor._id}`}
            className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-teal-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all text-center whitespace-nowrap"
          >
            View Full Profile
          </Link>
          <button
            onClick={() => onBook && onBook(tutor)}
            className="px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all whitespace-nowrap"
          >
            Book Tutor
          </button>
        </div>
      </div>
    </div>
  );
};
