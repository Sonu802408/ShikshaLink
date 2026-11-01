import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Search,
  Calendar,
  Laptop,
  MapPin,
  Building2,
  ShieldCheck,
  Star,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
            Platform Walkthrough
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How ShikshaLink Works
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Transparent connections, verified credentials, and flexible teaching arrangements designed for Indian parents and committed teachers.
          </p>
        </div>

        {/* Section for Parents */}
        <div className="bg-white rounded-3xl border border-slate-200 card-3d p-8 sm:p-10 space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-bold flex items-center justify-center shadow-md shadow-teal-600/30">
              P
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">For Parents & Students</h2>
              <p className="text-xs text-slate-500">Find, evaluate, and book the ideal tutor</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3 p-5 rounded-2xl stat-card-3d">
              <div className="text-teal-600 font-black text-xl">01</div>
              <h3 className="font-bold text-slate-900 text-sm">Post Requirement or Discover</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter by your child's class, school board (CBSE/ICSE), subject, and preferred teaching mode (Online, Home Tuition, or Tutor's Centre). Alternatively, post your requirement and get notified when matching tutors apply.
              </p>
            </div>

            <div className="space-y-3 p-5 rounded-2xl stat-card-3d">
              <div className="text-teal-600 font-black text-xl">02</div>
              <h3 className="font-bold text-slate-900 text-sm">Compare & Request a Demo</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Compare up to 3 tutors side by side. Inspect their verified degrees, experience, and parent reviews. Request a free trial demo session at a mutually convenient time.
              </p>
            </div>

            <div className="space-y-3 p-5 rounded-2xl stat-card-3d">
              <div className="text-teal-600 font-black text-xl">03</div>
              <h3 className="font-bold text-slate-900 text-sm">Confirm & Learn</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Once the tutor accepts, session schedules are confirmed. You receive class reminders, direct contact details, or meeting links. After completion, leave genuine feedback to assist other parents.
              </p>
            </div>
          </div>

          <div className="pt-2 text-center">
            <Link
              to="/find-tutors"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl btn-3d-navy text-xs uppercase tracking-wider"
            >
              <span>Browse Verified Tutors</span> <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Section for Tutors */}
        <div className="bg-white rounded-3xl border border-slate-200 card-3d p-8 sm:p-10 space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white font-bold flex items-center justify-center shadow-md shadow-sky-600/30">
              T
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">For Professional Educators</h2>
              <p className="text-xs text-slate-500">Build your local reputation and earn independently</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3 p-5 rounded-2xl stat-card-3d">
              <div className="text-sky-600 font-black text-xl">01</div>
              <h3 className="font-bold text-slate-900 text-sm">Create Profile & Set Rates</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Define your own fee structure (hourly, per class, or monthly). Choose the teaching modes you support—whether traveling to students in Mayur Vihar, teaching online, or hosting batches at your centre.
              </p>
            </div>

            <div className="space-y-3 p-5 rounded-2xl stat-card-3d">
              <div className="text-sky-600 font-black text-xl">02</div>
              <h3 className="font-bold text-slate-900 text-sm">Verify Credentials</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload your degree certificates and identity proofs. Once verified by our administration team, your profile receives the "Degree Verified" badge, giving parents confidence in your competence.
              </p>
            </div>

            <div className="space-y-3 p-5 rounded-2xl stat-card-3d">
              <div className="text-sky-600 font-black text-xl">03</div>
              <h3 className="font-bold text-slate-900 text-sm">Manage Bookings Seamlessly</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive tuition requests directly to your dashboard. Accept or propose alternative times. Manage active students, track weekly calendar slots, and collect genuine ratings from parents.
              </p>
            </div>
          </div>

          <div className="pt-2 text-center">
            <Link
              to="/become-a-tutor"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl btn-3d-primary text-xs uppercase tracking-wider"
            >
              <span>Join as a Tutor</span> <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
