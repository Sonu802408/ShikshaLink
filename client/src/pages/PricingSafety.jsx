import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, FileText, Lock, UserCheck } from 'lucide-react';

export const PricingSafety = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
            Trust, Safety & Transparency
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Pricing, Safety & Policies
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Our commitment to child protection, transparent fee structures, and genuine educational verification.
          </p>
        </div>

        {/* 1. Transparent Pricing */}
        <div className="bg-white rounded-3xl border border-slate-200/90 card-3d p-8 space-y-4">
          <div className="flex items-center gap-3 text-slate-900 font-bold text-lg">
            <CheckCircle2 className="w-6 h-6 text-teal-600" />
            <h2>Transparent Pricing Model</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            ShikshaLink charges zero registration fees to parents. Finding tutors, browsing credential proofs, and requesting initial demo classes is free.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-5 rounded-2xl stat-card-3d">
              <div className="font-bold text-slate-900 text-sm">Parent Registration</div>
              <div className="text-xs font-black text-teal-700 mt-1">100% Free</div>
              <p className="text-[11px] text-slate-500 mt-1">Search, compare, and connect with zero hidden charges.</p>
            </div>
            <div className="p-5 rounded-2xl stat-card-3d">
              <div className="font-bold text-slate-900 text-sm">Trial / Demo Classes</div>
              <div className="text-xs font-black text-teal-700 mt-1">Free or At-Cost</div>
              <p className="text-[11px] text-slate-500 mt-1">Most teachers offer a complimentary 45-minute first session.</p>
            </div>
            <div className="p-5 rounded-2xl stat-card-3d">
              <div className="font-bold text-slate-900 text-sm">Tutor Fee Freedom</div>
              <div className="text-xs font-black text-teal-700 mt-1">Published Rates</div>
              <p className="text-[11px] text-slate-500 mt-1">Tutors set their own acceptable minimum fees. No forced paycuts.</p>
            </div>
          </div>
        </div>

        {/* 2. Child Safety & Data Privacy */}
        <div className="bg-white rounded-3xl border border-slate-200/90 card-3d p-8 space-y-4">
          <div className="flex items-center gap-3 text-slate-900 font-bold text-lg">
            <Lock className="w-6 h-6 text-sky-600" />
            <h2>Child Protection & Privacy Protocols</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            In compliance with Indian data privacy best practices and child safety obligations, sensitive information about children is strictly protected:
          </p>
          <ul className="space-y-2.5 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span><strong>Anonymized Child Profiles:</strong> A child's full name, school, and photo are never shown on public pages or unauthenticated listings. Display names such as "Aarav S." or "Class 10 Student" are used.</span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span><strong>Address Protection:</strong> For student's home tuition, your exact residential address and parent contact phone number remain hidden from the tutor until both parties agree and the booking is explicitly confirmed.</span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span><strong>Parent Supervision:</strong> For home visits, we recommend that a parent or adult guardian is present in the household during the session.</span>
            </li>
          </ul>
        </div>

        {/* 3. Verification Standards */}
        <div className="bg-white rounded-3xl border border-slate-200/90 card-3d p-8 space-y-4">
          <div className="flex items-center gap-3 text-slate-900 font-bold text-lg">
            <UserCheck className="w-6 h-6 text-emerald-600" />
            <h2>Verification Standards & Badges</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            We never make fabricated claims or label a tutor "background checked" unless that specific verification check has been completed and recorded:
          </p>
          <div className="space-y-2 text-xs text-slate-700">
            <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-100 shadow-2xs">
              <span className="font-bold text-teal-900">Degree Verified:</span> Administrator has reviewed the tutor's university degree or marksheet.
            </div>
            <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 shadow-2xs">
              <span className="font-bold text-indigo-900">ID Document Verified:</span> Government issued Aadhaar/PAN/Voter ID verified.
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 shadow-2xs">
              <span className="font-bold text-emerald-900">Background Checked:</span> Recorded police clearance or reference check confirmed.
            </div>
          </div>
        </div>

        {/* 4. Cancellation & Rescheduling Policy */}
        <div id="cancellation" className="bg-white rounded-3xl border border-slate-200/90 card-3d p-8 space-y-4">
          <div className="flex items-center gap-3 text-slate-900 font-bold text-lg">
            <FileText className="w-6 h-6 text-amber-600" />
            <h2>Cancellation & Rescheduling Policy</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            We understand that family and teaching schedules occasionally shift. The following guidelines apply:
          </p>
          <ul className="space-y-2 text-xs text-slate-600">
            <li>• <strong>Rescheduling:</strong> Either the parent or tutor can propose an alternative date/time slot directly from their dashboard. Sessions become confirmed once both parties agree.</li>
            <li>• <strong>Notice Period:</strong> Please provide at least 4 hours advance notice if you need to reschedule or cancel a session.</li>
            <li>• <strong>No-Shows & Disputes:</strong> In the rare event of an unnotified no-show, either party can file a report through the support center for administrator assistance or tutor replacement.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
