import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminSettings = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [platformName, setPlatformName] = useState('ShikshaLink');
  const [supportEmail, setSupportEmail] = useState('support@shikshalink.in');
  const [supportPhone, setSupportPhone] = useState('+91 98100 12345');
  const [localitiesStr, setLocalitiesStr] = useState('');
  const [subjectsStr, setSubjectsStr] = useState('');
  const [classesStr, setClassesStr] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiRequest('/admin/settings');
        if (res.success && res.settings) {
          const s = res.settings;
          setPlatformName(s.platformName || 'ShikshaLink');
          setSupportEmail(s.supportEmail || 'support@shikshalink.in');
          setSupportPhone(s.supportPhone || '+91 98100 12345');
          setLocalitiesStr(s.supportedLocalities?.join(', ') || '');
          setSubjectsStr(s.supportedSubjects?.join(', ') || '');
          setClassesStr(s.supportedClasses?.join(', ') || '');
          setCancellationPolicy(s.cancellationPolicyText || '');
        }
      } catch (err) {
        showToast('Failed to load settings', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [showToast]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const supportedLocalities = localitiesStr.split(',').map((s) => s.trim()).filter(Boolean);
    const supportedSubjects = subjectsStr.split(',').map((s) => s.trim()).filter(Boolean);
    const supportedClasses = classesStr.split(',').map((s) => s.trim()).filter(Boolean);

    try {
      const res = await apiRequest('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({
          platformName,
          supportEmail,
          supportPhone,
          supportedLocalities,
          supportedSubjects,
          supportedClasses,
          cancellationPolicyText: cancellationPolicy
        })
      });

      if (res.success) {
        showToast('Platform settings saved successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading settings...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Platform Settings & Categories</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure coverage areas, supported subjects, contact channels, and system policies
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          General Platform Identity
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Platform Name
            </label>
            <input
              type="text"
              required
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Support Email
            </label>
            <input
              type="email"
              required
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Support Phone (Delhi Helpline)
            </label>
            <input
              type="text"
              required
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          Localities & Coverage Areas (Mayur Vihar & East Delhi)
        </h2>

        <div>
          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
            Supported Localities (comma separated)
          </label>
          <textarea
            rows={3}
            value={localitiesStr}
            onChange={(e) => setLocalitiesStr(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
            Academic Subjects (comma separated)
          </label>
          <textarea
            rows={3}
            value={subjectsStr}
            onChange={(e) => setSubjectsStr(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
            Classes & Exam Levels (comma separated)
          </label>
          <textarea
            rows={2}
            value={classesStr}
            onChange={(e) => setClassesStr(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          Policy Text Reference
        </h2>

        <div>
          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
            Cancellation & Rescheduling Policy Text
          </label>
          <textarea
            rows={3}
            value={cancellationPolicy}
            onChange={(e) => setCancellationPolicy(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300"
          />
        </div>
      </div>
    </form>
  );
};
