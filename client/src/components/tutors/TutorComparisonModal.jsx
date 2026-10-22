import React from 'react';
import { X, Check, Star, ShieldCheck, GraduationCap, Clock, MapPin, Building2, Laptop } from 'lucide-react';
import { VerificationBadge, TeachingModeBadge } from '../common/Badge';

export const TutorComparisonModal = ({ tutors = [], onClose, onBookTutor }) => {
  if (!tutors || tutors.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Side-by-Side Tutor Comparison</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare qualifications, rates, and teaching modes of up to 3 tutors
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Grid Table */}
        <div className="overflow-x-auto p-6">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-4 px-4 w-44 font-semibold text-slate-500 text-xs uppercase tracking-wider">
                  Criteria
                </th>
                {tutors.map((t) => (
                  <th key={t._id} className="py-4 px-4 min-w-[240px] align-top">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center uppercase shrink-0">
                        {t.user?.name?.[0] || 'T'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-base">{t.user?.name}</div>
                        <div className="text-xs text-slate-500 line-clamp-1">{t.headline}</div>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {/* Fee Rate */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-600 bg-slate-50/60 text-xs">
                  Hourly Fee
                </td>
                {tutors.map((t) => (
                  <td key={t._id} className="py-3.5 px-4 font-bold text-slate-900 text-base">
                    ₹{t.feeStructure?.hourlyRate || 500}
                    <span className="text-xs font-normal text-slate-500">/hr</span>
                  </td>
                ))}
              </tr>

              {/* Rating & Reviews */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-600 bg-slate-50/60 text-xs">
                  Reviews & Rating
                </td>
                {tutors.map((t) => (
                  <td key={t._id} className="py-3.5 px-4">
                    {t.reviewCount > 0 ? (
                      <div className="flex items-center gap-1.5 font-bold text-amber-700">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>{t.averageRating?.toFixed(1)}</span>
                        <span className="text-xs font-normal text-slate-400">({t.reviewCount} reviews)</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">No reviews yet</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Teaching Modes */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-600 bg-slate-50/60 text-xs">
                  Teaching Modes
                </td>
                {tutors.map((t) => (
                  <td key={t._id} className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {t.teachingModes?.map((m) => (
                        <TeachingModeBadge key={m} mode={m} />
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Experience */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-600 bg-slate-50/60 text-xs">
                  Teaching Experience
                </td>
                {tutors.map((t) => (
                  <td key={t._id} className="py-3.5 px-4 font-medium">
                    {t.yearsOfExperience || 1}+ Years
                  </td>
                ))}
              </tr>

              {/* Locality */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-600 bg-slate-50/60 text-xs">
                  Locality / Base
                </td>
                {tutors.map((t) => (
                  <td key={t._id} className="py-3.5 px-4 font-medium text-slate-800">
                    <div className="flex items-center gap-1 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {t.primaryLocality || 'Delhi'}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Verification Badges */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-600 bg-slate-50/60 text-xs">
                  Verifications
                </td>
                {tutors.map((t) => (
                  <td key={t._id} className="py-3.5 px-4">
                    <div className="flex flex-col gap-1">
                      {t.verificationBadges?.qualificationVerified && (
                        <VerificationBadge type="qualification" />
                      )}
                      {t.verificationBadges?.backgroundChecked && (
                        <VerificationBadge type="background" />
                      )}
                      {t.verificationBadges?.idDocumentVerified && (
                        <VerificationBadge type="id" />
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Demo Availability */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-600 bg-slate-50/60 text-xs">
                  Demo Class
                </td>
                {tutors.map((t) => (
                  <td key={t._id} className="py-3.5 px-4">
                    {t.demoClassAvailable ? (
                      <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                        <Check className="w-4 h-4 text-emerald-600" />
                        {t.demoClassFee === 0 ? 'Free Demo Class' : `Paid Demo (₹${t.demoClassFee})`}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">Direct Booking</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Booking CTA row */}
              <tr>
                <td className="py-4 px-4 bg-slate-50/60"></td>
                {tutors.map((t) => (
                  <td key={t._id} className="py-4 px-4">
                    <button
                      onClick={() => {
                        onClose();
                        onBookTutor(t);
                      }}
                      className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-sm"
                    >
                      Book with {t.user?.name?.split(' ')[0]}
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
