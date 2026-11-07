import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  GraduationCap,
  KeyRound,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { useToast } from '../context/ToastContext';

export const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const initialIdentifier = searchParams.get('identifier') || '';

  const { showToast } = useToast();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim()) {
      const msg = 'Please enter your registered email address or phone number.';
      setErrorMessage(msg);
      showToast(msg, 'error');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      const msg = 'New password must be at least 6 characters long.';
      setErrorMessage(msg);
      showToast(msg, 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      const msg = 'Passwords do not match. Please re-enter identical passwords.';
      setErrorMessage(msg);
      showToast(msg, 'error');
      return;
    }

    setLoading(true);
    try {
      const isEmail = identifier.includes('@');
      const payload = {
        newPassword,
        ...(isEmail ? { email: identifier.trim() } : { phone: identifier.trim() })
      };

      const res = await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.success) {
        setSuccess(true);
        setSuccessMessage(res.message || 'Password reset successfully! You can now log in.');
        showToast('Password updated! You can now log in.', 'success');
      } else {
        setErrorMessage(res.message || 'Failed to reset password. Please check your credentials.');
        showToast(res.message || 'Reset failed', 'error');
      }
    } catch (err) {
      const msg = err.message || 'No account found with this email or phone number.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-extrabold uppercase tracking-wider">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Forgot Password Recovery</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 pt-1 tracking-tight">
            Reset Your Password
          </h2>
          <p className="text-xs text-slate-500">
            Enter your registered Email or Phone number to create a new password and recover instant access.
          </p>
        </div>

        {/* Error message alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div>
              <p className="font-bold">Password Reset Error</p>
              <p className="text-[11px] text-rose-700 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Success State */}
        {success ? (
          <div className="space-y-5 text-center py-2 animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">Password Reset Successful!</h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                {successMessage}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-3.5 rounded-xl btn-3d-primary text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleReset} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Registered Email or Phone Number
              </label>
              <div className="relative">
                {identifier.includes('@') ? (
                  <Mail className="w-4 h-4 text-teal-600 absolute left-3.5 top-3" />
                ) : (
                  <Phone className="w-4 h-4 text-teal-600 absolute left-3.5 top-3" />
                )}
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. name@example.com or 9822211001"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl input-3d text-xs font-medium"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Enter either the email address or 10-digit mobile number used when creating your account.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-teal-600 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl input-3d text-xs font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-teal-600 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter identical password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl input-3d text-xs font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl btn-3d-navy text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 font-bold text-slate-700 hover:text-teal-600"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
          <Link to="/register" className="font-bold text-teal-600 hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};
