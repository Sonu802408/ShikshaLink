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
              <li className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <a href="tel:+918130550381" className="hover:text-white transition-colors">
                    +91 81305 50381
                  </a>
                </div>
                <a
                  href="https://wa.me/918130550381"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 font-medium transition-colors"
                  title="Chat with us on WhatsApp"
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.4-1.76-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.77-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29" />
                  </svg>
                  <span>WhatsApp</span>
                </a>
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
