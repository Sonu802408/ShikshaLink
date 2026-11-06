import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  BookOpen,
  MapPin,
  Clock,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  Phone,
  Mail,
  Home,
  Laptop,
  Award,
  Layers,
  ExternalLink,
  X,
  AlertCircle
} from 'lucide-react';

export const TutorDossierModal = ({
  tutor,
  onClose,
  onApprove,
  onReject,
  approving = false
}) => {
  if (!tutor) return null;

  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const u = tutor.user || {};
  const fee = tutor.feeStructure || {};
  const docs = tutor.verificationDocuments || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="min-h-full flex items-center justify-center p-3 sm:p-5 text-center">
        <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto my-auto text-left">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-700 to-teal-600 text-white font-black text-xl flex items-center justify-center uppercase shadow-md overflow-hidden shrink-0">
              {u.avatar ? (
                <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
              ) : (
                tutor.fullName?.[0] || u.name?.[0] || 'T'
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-900">
                  {tutor.fullName || u.name}
                </h2>
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {tutor.applicationId || 'SL-TUT-NEW'}
                </span>
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    tutor.applicationStatus === 'approved' || tutor.profileStatus === 'published'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : tutor.applicationStatus === 'rejected'
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                  }`}
                >
                  {tutor.applicationStatus === 'approved' || tutor.profileStatus === 'published'
                    ? 'Verified & Live'
                    : tutor.applicationStatus === 'rejected'
                    ? 'Rejected'
                    : 'Pending Admin Verification'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {tutor.headline || 'Academic Tutor'} • Submitted {new Date(tutor.submittedAt || tutor.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-5 text-xs">
          {/* SECTION 1: Personal & Contact */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-2.5">
            <div className="flex items-center gap-1.5 font-black text-amber-950 uppercase tracking-wider text-[11px]">
              <User className="w-4 h-4 text-amber-700" />
              <span>1. Personal & Confidential Contact Details</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-800">
              <div>
                <span className="text-slate-500 block text-[10px]">Mobile Phone</span>
                <span className="font-bold">{u.phone || tutor.whatsappNumber || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">WhatsApp</span>
                <span className="font-bold">{tutor.whatsappNumber || u.phone || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Email</span>
                <span className="font-bold">{u.email || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Gender / DOB</span>
                <span className="font-bold">
                  {tutor.gender || '—'} {tutor.dateOfBirth ? `(${tutor.dateOfBirth})` : ''}
                </span>
              </div>
            </div>
            <div className="pt-1 border-t border-amber-200/60 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <span className="text-slate-500 block text-[10px]">Exact Residential Address</span>
                <span className="font-bold text-slate-900">
                  {tutor.fullAddressPrivate || tutor.centreDetails?.fullAddress || 'Address provided at registration'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Locality & Pincode</span>
                <span className="font-bold text-slate-900">
                  {tutor.area || tutor.primaryLocality || 'Delhi NCR'} {tutor.pincode ? `(${tutor.pincode})` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: Academic & Education */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center gap-1.5 font-black text-slate-900 uppercase tracking-wider text-[11px]">
              <GraduationCap className="w-4 h-4 text-teal-600" />
              <span>2. Education & Qualifications</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px]">Highest Qualification</span>
                <span className="font-bold text-slate-800">{tutor.highestQualification || 'Graduate'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Degree / Course</span>
                <span className="font-bold text-slate-800">{tutor.degreeCourseName || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">College / University</span>
                <span className="font-bold text-slate-800">{tutor.collegeUniversity || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Passing Year</span>
                <span className="font-bold text-slate-800">{tutor.passingYear || '—'}</span>
              </div>
            </div>
            {tutor.additionalCertifications && (
              <div className="text-[11px] text-slate-600 pt-1">
                <span className="font-bold text-slate-700">Certifications: </span>
                {tutor.additionalCertifications}
              </div>
            )}
          </div>

          {/* SECTION 3: Experience */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center gap-1.5 font-black text-slate-900 uppercase tracking-wider text-[11px]">
              <BookOpen className="w-4 h-4 text-teal-600" />
              <span>3. Teaching Experience</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px]">Total Teaching Experience</span>
                <span className="font-bold text-slate-900 text-sm">
                  {tutor.experienceYears ?? tutor.yearsOfExperience ?? 0} Years {tutor.experienceMonths ? `${tutor.experienceMonths} Months` : ''}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block text-[10px]">Coaching / Institutions Taught At</span>
                <span className="font-bold text-slate-800">{tutor.teachingInstitutions || tutor.previousExperience || 'Private Tutoring'}</span>
              </div>
            </div>
            {tutor.experienceDescription && (
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-[11px] text-slate-600">
                <span className="font-bold text-slate-800 block mb-0.5">Experience Summary:</span>
                {tutor.experienceDescription}
              </div>
            )}
          </div>

          {/* SECTION 4: Classes, Subjects & Boards */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-1.5 font-black text-slate-900 uppercase tracking-wider text-[11px]">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>4. Classes, Subjects & Boards Offered</span>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-slate-400 block text-[10px] mb-1">Subjects Taught:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(tutor.subjects || []).length > 0 ? (
                    tutor.subjects.map((sub, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 font-bold text-[11px] border border-teal-200">
                        {sub}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">No specific subjects selected</span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px] mb-1">Class Grades:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(tutor.classes || tutor.schoolClassGroups || []).map((cls, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 font-bold text-[10px]">
                        {cls}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] mb-1">Boards & Languages:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(tutor.boards || ['CBSE']).map((b, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 font-bold text-[10px] border border-sky-200">
                        {b}
                      </span>
                    ))}
                    {(tutor.teachingLanguages || ['English', 'Hindi']).map((lang, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 font-bold text-[10px] border border-indigo-200">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: Modes & Areas */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center gap-1.5 font-black text-slate-900 uppercase tracking-wider text-[11px]">
              <MapPin className="w-4 h-4 text-teal-600" />
              <span>5. Teaching Modes & Localities</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px] mb-1">Teaching Modes:</span>
                <div className="flex flex-wrap gap-1">
                  {(tutor.teachingModes || tutor.teachingModePreferences || []).map((m, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 font-bold capitalize text-[10px]">
                      {m.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Batch Size Preference</span>
                <span className="font-bold text-slate-800">{tutor.preferredBatchSize || 'One-to-One'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Preferred Areas</span>
                <span className="font-bold text-slate-800">
                  {(tutor.preferredTeachingAreas || [tutor.primaryLocality]).join(', ') || 'Local Radius'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 6: Fees & Schedule */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2.5">
            <div className="flex items-center gap-1.5 font-black text-emerald-950 uppercase tracking-wider text-[11px]">
              <DollarSign className="w-4 h-4 text-emerald-700" />
              <span>6. Fee Structure & Weekly Availability</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-800">
              <div>
                <span className="text-slate-500 block text-[10px]">Hourly Rate</span>
                <span className="font-black text-emerald-900 text-sm">₹{tutor.hourlyFee || fee.hourlyRate || 500} / hr</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Monthly Rate</span>
                <span className="font-black text-emerald-900 text-sm">
                  {tutor.monthlyFee || fee.monthlyRate ? `₹${tutor.monthlyFee || fee.monthlyRate} / mo` : 'Flexible'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Trial / Demo Class</span>
                <span className="font-bold text-slate-900">
                  {tutor.trialClassAvailable !== false ? 'Free Demo Available' : 'Paid Demo'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Weekly Hours</span>
                <span className="font-bold text-slate-900">{tutor.weeklyAvailability || '10-20 hrs/week'}</span>
              </div>
            </div>
            <div className="pt-1 border-t border-emerald-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 block text-[10px]">Available Days</span>
                <span className="font-bold text-slate-900">
                  {(tutor.availableDays || []).join(', ') || 'All Days'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Time Slots</span>
                <span className="font-bold text-slate-900">
                  {(tutor.availableTimeSlots || []).join(', ') || 'Evening'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 7: Bio & Strengths */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 font-black text-slate-900 uppercase tracking-wider text-[11px]">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>7. Bio & Teaching Pedagogy</span>
            </div>
            <div className="space-y-2">
              {tutor.bio && (
                <div>
                  <span className="text-slate-400 block text-[10px]">Tutor Bio:</span>
                  <p className="text-slate-700 leading-relaxed font-medium">{tutor.bio}</p>
                </div>
              )}
              {tutor.teachingMethodology && (
                <div>
                  <span className="text-slate-400 block text-[10px]">Teaching Methodology:</span>
                  <p className="text-slate-700 leading-relaxed font-medium">{tutor.teachingMethodology}</p>
                </div>
              )}
              {tutor.strengthsAndSpecializations && (
                <div>
                  <span className="text-slate-400 block text-[10px]">Strengths & Specializations:</span>
                  <p className="text-slate-700 leading-relaxed font-medium">{tutor.strengthsAndSpecializations}</p>
                </div>
              )}
              {tutor.achievements && (
                <div>
                  <span className="text-slate-400 block text-[10px]">Achievements:</span>
                  <p className="text-slate-700 leading-relaxed font-medium">{tutor.achievements}</p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 8: Confidential Uploaded Documents */}
          {docs.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-1.5 font-black text-slate-900 uppercase tracking-wider text-[11px]">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>8. Confidential Uploaded Documents ({docs.length})</span>
              </div>
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {docs.map((doc, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-800">{doc.title || doc.originalName || 'Document'}</div>
                      <span className="text-slate-400 capitalize text-[10px]">
                        Type: <strong>{doc.docType}</strong> • Status: {doc.status} • Uploaded: {new Date(doc.uploadedAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    <a
                      href={`/api/tutors/qualifications/${doc._id}/document`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer text-[11px]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Inspect Document</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 9: Decision & Actions Footer */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Review all credentials carefully before making this profile live.
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {showRejectInput ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs w-full sm:w-60"
                />
                <button
                  onClick={() => onReject(tutor._id, rejectReason)}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0"
                >
                  Confirm Reject
                </button>
                <button
                  onClick={() => setShowRejectInput(false)}
                  className="px-2.5 py-2 text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShowRejectInput(true)}
                  className="px-4 py-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs cursor-pointer transition-colors"
                >
                  Reject Application
                </button>

                <button
                  type="button"
                  disabled={approving}
                  onClick={() => onApprove(tutor._id)}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{approving ? 'Verifying...' : 'Approve & Verify (Make Live)'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
};
