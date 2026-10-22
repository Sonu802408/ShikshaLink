import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Mail, Phone, MapPin, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-white shadow-md">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">ShikshaLink</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              India's transparent tutor-parent marketplace. Connect with verified home tutors, interactive online teachers, and neighbourhood learning centres across Mayur Vihar, East Delhi, and Delhi NCR.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Strict document checks • Zero hidden commission • Child privacy first</span>
            </div>
          </div>

          {/* Teaching Modes */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Explore Tuition</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/find-tutors?mode=online" className="hover:text-white transition-colors">
                  Online Live Classes
                </Link>
              </li>
              <li>
                <Link to="/find-tutors?mode=student_home" className="hover:text-white transition-colors">
                  Home Tuition at Doorstep
                </Link>
              </li>
              <li>
                <Link to="/find-tutors?mode=tutor_centre" className="hover:text-white transition-colors">
                  Tutor Teaching Centres
                </Link>
              </li>
              <li>
                <Link to="/find-tutors?subject=Mathematics" className="hover:text-white transition-colors">
                  Maths Tutors (CBSE/ICSE)
                </Link>
              </li>
              <li>
                <Link to="/find-tutors?subject=Science" className="hover:text-white transition-colors">
                  Science & Physics Tutors
                </Link>
              </li>
            </ul>
          </div>

          {/* Localities (Mayur Vihar Focus) */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">East Delhi Focus</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/find-tutors?locality=Mayur+Vihar+Phase+1" className="hover:text-white transition-colors">
                  Mayur Vihar Phase 1
                </Link>
              </li>
              <li>
                <Link to="/find-tutors?locality=Mayur+Vihar+Phase+2" className="hover:text-white transition-colors">
                  Mayur Vihar Phase 2
                </Link>
              </li>
              <li>
                <Link to="/find-tutors?locality=Mayur+Vihar+Phase+3" className="hover:text-white transition-colors">
                  Mayur Vihar Phase 3
                </Link>
              </li>
              <li>
                <Link to="/find-tutors?locality=Patparganj" className="hover:text-white transition-colors">
                  Patparganj & IP Extension
                </Link>
              </li>
              <li>
                <Link to="/find-tutors?locality=Preet+Vihar" className="hover:text-white transition-colors">
                  Preet Vihar & Nirman Vihar
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Trust & Policies</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/pricing-safety" className="hover:text-white transition-colors">
                  Safety & Verification Rules
                </Link>
              </li>
              <li>
                <Link to="/pricing-safety#cancellation" className="hover:text-white transition-colors">
                  Rescheduling & Cancellation
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  How Bookings Work
                </Link>
              </li>
              <li className="pt-2 flex items-center gap-2 text-xs text-slate-400">
                <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>support@shikshalink.in</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-slate-400">
                <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>+91 98100 12345 (Delhi Support)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ShikshaLink Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/pricing-safety" className="hover:text-slate-400">Privacy Notice</Link>
            <Link to="/pricing-safety" className="hover:text-slate-400">Terms of Service</Link>
            <Link to="/pricing-safety" className="hover:text-slate-400">Child Safety Protocol</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
