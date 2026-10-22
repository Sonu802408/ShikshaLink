import React from 'react';
import { ShieldCheck, UserCheck, GraduationCap, MapPin, Laptop, Building2 } from 'lucide-react';

export const VerificationBadge = ({ type }) => {
  if (type === 'qualification') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200" title="Degree & Educational Documents Verified by ShikshaLink Team">
        <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
        Degree Verified
      </span>
    );
  }
  if (type === 'background') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200" title="Background Check Verified">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        Background Checked
      </span>
    );
  }
  if (type === 'id') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200" title="Government ID Document Verified">
        <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
        ID Verified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200" title="Contact Email & Phone Verified">
      <UserCheck className="w-3.5 h-3.5 text-sky-600" />
      Contact Verified
    </span>
  );
};

export const TeachingModeBadge = ({ mode }) => {
  if (mode === 'online') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
        <Laptop className="w-3 h-3 text-blue-600" />
        Online
      </span>
    );
  }
  if (mode === 'student_home') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
        <MapPin className="w-3 h-3 text-amber-600" />
        Student's Home
      </span>
    );
  }
  if (mode === 'tutor_centre') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
        <Building2 className="w-3 h-3 text-purple-600" />
        Tutor's Centre
      </span>
    );
  }
  return null;
};
