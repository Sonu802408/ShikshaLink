import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Sparkles,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Gift,
  Clock,
  Star
} from 'lucide-react';

export const SpecialOfferModal = ({ autoOpenDelay = 600 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [minimized, setMinimized] = useState(false);

  const cardRef = useRef(null);
  const navigate = useNavigate();

  // Auto-open on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, autoOpenDelay);

    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsTouchDevice(hasTouch || reducedMotion);

    // Listen for custom trigger to re-open
    const handleReopen = () => {
      setIsOpen(true);
      setMinimized(false);
    };
    window.addEventListener('open-special-offer', handleReopen);

    // Close on Escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('open-special-offer', handleReopen);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [autoOpenDelay]);

  // Handle 3D Tilt calculation
  const handleMouseMove = (e) => {
    if (isTouchDevice || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Normalised position from center (-0.5 to 0.5)
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;

    // Max tilt angles: subtle and realistic
    const maxTilt = 8;
    const rotateX = -mouseY * maxTilt * 2;
    const rotateY = mouseX * maxTilt * 2;

    setTilt({ x: rotateX, y: rotateY });
    setGlarePos({
      x: ((e.clientX - rect.left) / width) * 100,
      y: ((e.clientY - rect.top) / height) * 100,
      opacity: 0.18
    });
  };

  const handleMouseEnter = () => {
    if (!isTouchDevice) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setGlarePos({ x: 50, y: 50, opacity: 0 });
  };

  const handleClose = () => {
    setIsOpen(false);
    setMinimized(true);
  };

  const handleSelectRole = (role) => {
    handleClose();
    if (role === 'parent') {
      navigate('/register?role=parent');
    } else {
      navigate('/register?role=tutor');
    }
  };

  return (
    <>
      {/* Minimized Floating Floating Launcher (when closed, allowing users to re-open anytime) */}
      {!isOpen && minimized && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-medium shadow-xl shadow-teal-700/30 border border-teal-400/40 hover:scale-105 active:scale-95 transition-all duration-300 animate-bounce"
          title="Click to view special offer"
        >
          <Gift className="w-5 h-5 text-amber-300 animate-pulse" />
          <span className="text-sm font-semibold tracking-wide">3 Days Free Trial!</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300"></span>
          </span>
        </button>
      )}

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          {/* Animated Ambient Light Orbs behind the frosted glass for realistic glassmorphism glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
            <div className="absolute -top-10 -left-10 w-96 h-96 bg-teal-400/25 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-indigo-500/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl" />
          </div>

          {/* 3D Perspective Stage */}
          <div
            style={{ perspective: '1200px' }}
            className="w-full max-w-xl relative"
          >
            {/* The 3D Glass Card Container */}
            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: isHovered && !isTouchDevice
                  ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02) translateY(-6px)`
                  : 'rotateX(0deg) rotateY(0deg) scale(1) translateY(0px)',
                transition: isHovered
                  ? 'transform 0.1s ease-out'
                  : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                transformStyle: 'preserve-3d',
                boxShadow: isHovered
                  ? '0 35px 70px -15px rgba(15, 23, 42, 0.45), 0 20px 40px -10px rgba(13, 148, 136, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.9)'
                  : '0 25px 60px -12px rgba(15, 23, 42, 0.35), 0 12px 28px -8px rgba(13, 148, 136, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.85)'
              }}
              className="relative w-full rounded-3xl p-6 sm:p-8 overflow-hidden transition-all duration-300 border border-white/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl"
            >
              {/* Dynamic Specular Light Glare Layer */}
              {!isTouchDevice && (
                <div
                  className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 60%)`,
                    opacity: isHovered ? glarePos.opacity : 0,
                    zIndex: 40
                  }}
                />
              )}

              {/* Decorative Subtle Diagonal Sheen line across the glass */}
              <div className="pointer-events-none absolute -top-32 -left-32 w-72 h-72 bg-gradient-to-br from-white/40 via-white/10 to-transparent rotate-45 rounded-3xl" />

              {/* Close (X) Button (Layered in 3D Space) */}
              <button
                onClick={handleClose}
                aria-label="Close special offer modal"
                style={{ transform: 'translateZ(55px)' }}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 z-30 p-2 rounded-full bg-slate-900/5 hover:bg-slate-900/15 dark:bg-white/10 dark:hover:bg-white/20 text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white transition-all duration-200 hover:rotate-90 hover:scale-110 active:scale-95 shadow-sm border border-slate-200/50 dark:border-white/20"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Card Header: Special Offer Badge (Elevated in 3D) */}
              <div
                style={{ transform: 'translateZ(45px)' }}
                className="flex items-center justify-center mb-3"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-teal-500/15 border border-amber-400/40 text-amber-700 dark:text-amber-300 shadow-sm backdrop-blur-md">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-black tracking-wider uppercase">
                    SPECIAL OFFER
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white ml-1">
                    LIMITED TIME
                  </span>
                </div>
              </div>

              {/* Hero Headline & Value Proposition (Elevated in 3D) */}
              <div
                style={{ transform: 'translateZ(40px)' }}
                className="text-center mb-6"
              >
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  Get{' '}
                  <span className="bg-gradient-to-r from-teal-600 via-emerald-500 to-cyan-600 bg-clip-text text-transparent drop-shadow-sm">
                    3 Days Free Trial!
                  </span>
                </h2>
                <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  Join India's verified tutor-parent network today. Enjoy zero platform fees and priority matchmaking for your first 3 days.
                </p>
              </div>

              {/* Role Selection Interactive Cards (Elevated in 3D) */}
              <div
                style={{ transform: 'translateZ(50px)' }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6"
              >
                {/* Option 1: I'm a Parent */}
                <div
                  onClick={() => handleSelectRole('parent')}
                  className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-teal-500/30 hover:border-teal-500 hover:bg-teal-50/60 dark:hover:bg-slate-800/90 transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1.5"
                >
                  <div className="absolute top-3 right-3 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>

                  <div>
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-teal-600/30 mb-3 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">
                      I'm a Parent
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                      Find verified home & online tutors for your child's academic growth.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                      <span>3 Days Free Trial</span>
                    </div>
                    <button
                      type="button"
                      className="mt-3 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-teal-700/20 group-hover:shadow-teal-700/40 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <span>I'm a Parent</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Option 2: I'm a Tutor */}
                <div
                  onClick={() => handleSelectRole('tutor')}
                  className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-indigo-500/30 hover:border-indigo-500 hover:bg-indigo-50/60 dark:hover:bg-slate-800/90 transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1.5"
                >
                  <div className="absolute top-3 right-3 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>

                  <div>
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-slate-800 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 mb-3 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                      <Briefcase className="w-6 h-6 text-amber-300" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                      I'm a Tutor
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                      Teach verified students nearby or online with 0% platform commission.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                      <span>0% Platform Commission</span>
                    </div>
                    <button
                      type="button"
                      className="mt-3 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-900 hover:from-slate-800 hover:to-indigo-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-900/20 group-hover:shadow-indigo-900/40 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <span>I'm a Tutor</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Guarantee & Dismiss Subtext (Elevated in 3D) */}
              <div
                style={{ transform: 'translateZ(30px)' }}
                className="pt-2 text-center"
              >
                <div className="flex items-center justify-center gap-3 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    100% Background-Verified
                  </span>
                  <span>•</span>
                  <span>No Credit Card Required</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" />
                    Instant Access
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline underline-offset-2 transition-colors cursor-pointer"
                >
                  No thanks, maybe later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
