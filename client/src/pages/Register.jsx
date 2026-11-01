import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GraduationCap, Lock, Mail, Phone, User, MapPin, ArrowRight, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Register = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'tutor' ? 'tutor' : 'parent';

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [locality, setLocality] = useState('Mayur Vihar Phase 1');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await register({
        name,
        email,
        phone,
        password,
        role,
        locality
      });

      showToast(`Account created! Welcome to ShikshaLink, ${data.user.name}.`, 'success');
      const redirect = searchParams.get('redirect');
      if (redirect) {
        navigate(redirect);
      } else if (role === 'tutor') {
        navigate('/tutor/register');
      } else {
        navigate('/parent/children');
      }
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl card-3d max-w-lg w-full p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">ShikshaLink</span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 pt-1 tracking-tight">Create your account</h2>
          <p className="text-xs text-slate-500">Join the transparent education marketplace</p>
        </div>

        {/* Role Toggle Switch */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl shadow-inner">
          <button
            type="button"
            onClick={() => setRole('parent')}
            className={`py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              role === 'parent'
                ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            I am a Parent
          </button>
          <button
            type="button"
            onClick={() => setRole('tutor')}
            className={`py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              role === 'tutor'
                ? 'bg-white text-teal-800 shadow-md ring-1 ring-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            I am a Tutor / Teacher
          </button>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-teal-600 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'parent' ? 'e.g. Rajesh Sharma' : 'e.g. Dr. Vikram Malhotra'}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl input-3d text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-teal-600 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98100 12345"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl input-3d text-xs font-medium"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Primary Locality
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-teal-600 absolute left-3.5 top-3" />
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl input-3d text-xs font-medium bg-white"
                >
                  <option value="Mayur Vihar Phase 1">Mayur Vihar Phase 1</option>
                  <option value="Mayur Vihar Phase 2">Mayur Vihar Phase 2</option>
                  <option value="Mayur Vihar Phase 3">Mayur Vihar Phase 3</option>
                  <option value="Patparganj (IP Extension)">Patparganj (IP Extension)</option>
                  <option value="Preet Vihar">Preet Vihar</option>
                  <option value="Laxmi Nagar">Laxmi Nagar</option>
                  <option value="Vasundhara Enclave">Vasundhara Enclave</option>
                  <option value="Pandav Nagar">Pandav Nagar</option>
                  <option value="Delhi NCR - Other">Delhi NCR - Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-teal-600 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 chars"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl input-3d text-xs font-medium"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl btn-3d-primary text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : `Register as ${role === 'parent' ? 'Parent' : 'Tutor'}`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-teal-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
