import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, Award, Heart, Check, Sparkles, Building2, Laptop } from 'lucide-react';
import { VerificationBadge, TeachingModeBadge } from '../common/Badge';

export const TutorCard = ({
  tutor,
  onBook,
  onSave,
  isSaved = false,
  onToggleCompare,
  isComparing = false
}) => {
  const user = tutor.user || {};
  const fee = tutor.feeStructure?.hourlyRate || 500;
  const isFreeDemo = tutor.demoClassAvailable && tutor.demoClassFee === 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
      <div className="p-5 sm:p-6 space-y-4">
        {/* Top Header: Avatar, Name, Headline, Save button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-700 to-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0 uppercase overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name?.[0] || 'T'
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/tutors/${tutor._id}`}
                  className="font-bold text-slate-900 text-base hover:text-teal-600 transition-colors"
                >
                  {user.name}
                </Link>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{tutor.headline || 'Dedicated Academic Tutor'}</p>

              {/* Locality & Experience */}
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 font-medium text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {tutor.primaryLocality || 'Mayur Vihar'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {tutor.yearsOfExperience || 1}+ yrs exp
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSave && onSave(tutor._id)}
            className={`p-2 rounded-xl border transition-colors ${
              isSaved
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-slate-50'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save tutor'}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500' : ''}`} />
          </button>
        </div>

        {/* Verification Badges */}
        <div className="flex flex-wrap gap-1.5">
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

        {/* Teaching Modes Supported */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {tutor.teachingModes?.map((mode) => (
            <TeachingModeBadge key={mode} mode={mode} />
          ))}
          {isFreeDemo && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Free Demo
            </span>
          )}
        </div>

        {/* Subjects & Classes Tag Badges */}
        <div className="space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-700">Subjects:</span>
            {tutor.subjects?.slice(0, 3).map((sub) => (
              <span key={sub} className="px-2 py-0.5 rounded-md bg-slate-100 font-medium text-slate-700">
                {sub}
              </span>
            ))}
            {tutor.subjects?.length > 3 && (
              <span className="text-slate-400">+{tutor.subjects.length - 3} more</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-700">Classes:</span>
            <span className="text-slate-600">{tutor.classes?.slice(0, 4).join(', ') || 'Classes 6-12'}</span>
          </div>
        </div>
      </div>

      {/* Footer bar: Rating, Pricing, Compare toggle, and Book CTA */}
      <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          {tutor.reviewCount > 0 ? (
            <div className="flex items-center gap-1">
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 border border-amber-200 rounded-md font-bold text-xs text-amber-800">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {tutor.averageRating?.toFixed(1) || '5.0'}
              </span>
              <span className="text-[11px] text-slate-400">({tutor.reviewCount})</span>
            </div>
          ) : (
            <span className="text-xs font-medium text-slate-400">New Tutor</span>
          )}
          <div className="text-slate-900 font-bold text-sm mt-0.5">
            ₹{fee}<span className="text-xs font-normal text-slate-500">/hr</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onToggleCompare && (
            <label className="flex items-center gap-1 text-[11px] font-medium text-slate-600 cursor-pointer select-none">
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
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-white rounded-xl transition-all"
          >
            Profile
          </Link>
          <button
            onClick={() => onBook && onBook(tutor)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all"
          >
            {isFreeDemo ? 'Book Demo' : 'Book Session'}
          </button>
        </div>
      </div>
    </div>
  );
};
