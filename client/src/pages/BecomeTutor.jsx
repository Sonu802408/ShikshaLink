import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Award,
  DollarSign,
  Laptop,
  MapPin,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

export const BecomeTutor = () => {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const handleStartRegistration = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/tutor/register&role=tutor');
      return;
    }
    navigate('/tutor/register');
  };
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Join 100+ Teachers in Mayur Vihar & Delhi NCR</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Teach on Your Terms. Earn Respect & Fair Income.
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            ShikshaLink gives educators complete freedom over fee pricing, teaching modes, and weekly availability.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-3xl bg-white border border-slate-200/90 stat-card-3d space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/30">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">You Set Your Own Fee</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We never force a tutor to accept a parent's budget. Set your exact rate per hour, per class, or per monthly batch.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-slate-200/90 stat-card-3d space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/30">
              <Laptop className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">All 3 Teaching Modes</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Teach online via live video, travel locally to student homes, or run batches at your own study centre. Pick any combination.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-slate-200/90 stat-card-3d space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Verified Badges & Trust</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Get your degrees officially verified with the "Degree Verified" badge to stand out and attract serious parents.
            </p>
          </div>
        </div>

        {/* Call to action card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-teal-950 text-white shadow-xl card-3d flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Ready to create your tutor profile?</h2>
            <p className="text-xs text-slate-300 max-w-md">
              Registration takes only 2 minutes. Start receiving tuition requests from parents in your neighbourhood immediately.
            </p>
          </div>
          <button
            onClick={handleStartRegistration}
            className="px-8 py-3.5 rounded-2xl btn-3d-primary text-xs uppercase tracking-wider font-bold shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <span>Register as a Tutor Now</span> <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
