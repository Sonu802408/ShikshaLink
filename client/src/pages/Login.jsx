import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GraduationCap, Lock, Mail, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Login = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password.', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password);
      showToast(`Welcome back, ${data.user.name}!`, 'success');

      const redirect = searchParams.get('redirect');
      if (redirect) {
        navigate(redirect);
      } else if (data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.user.role === 'tutor') {
        if (data.profile?.profileStatus === 'draft') {
          navigate('/tutor/register');
        } else {
          navigate('/tutor');
        }
      } else {
        navigate('/parent');
      }
    } catch (err) {
      showToast(err.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl card-3d max-w-md w-full p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">ShikshaLink</span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 pt-2 tracking-tight">Sign in to your account</h2>
          <p className="text-xs text-slate-500">Access your tuition requirements, bookings, or teacher profile</p>
        </div>

        {/* Demo Login Fast-Pills */}
        <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
            Quick Demo Logins (Click to autofill)
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleQuickDemo('rajesh.parent@example.com', 'Parent@123')}
              className="py-1.5 px-2 rounded-xl btn-3d-secondary text-[11px]"
            >
              Parent Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('vikram.tutor@example.com', 'Tutor@123')}
              className="py-1.5 px-2 rounded-xl btn-3d-secondary text-[11px]"
            >
              Tutor Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@shikshalink.in', 'Admin@12345')}
              className="py-1.5 px-2 rounded-xl btn-3d-secondary text-[11px]"
            >
              Admin Demo
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-teal-600 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl input-3d text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-teal-600 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl input-3d text-xs font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl btn-3d-navy text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-teal-600 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
