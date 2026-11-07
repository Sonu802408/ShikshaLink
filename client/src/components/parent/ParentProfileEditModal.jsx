import React, { useState, useEffect, useRef } from 'react';
import { X, User, Phone, Mail, MapPin, Home, Camera, Upload, Check, Lock, ShieldCheck } from 'lucide-react';
import { apiRequest, getAvatarUrl } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const ParentProfileEditModal = ({ isOpen, onClose, profile, onProfileUpdated }) => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [city, setCity] = useState('Delhi');
  const [locality, setLocality] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('110091');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile || user) {
      setFullName(profile?.fullName || user?.name || '');
      setPhone(profile?.phone || user?.phone || '');
      setWhatsappNumber(profile?.whatsappNumber || '');
      setCity(profile?.city || 'Delhi');
      setLocality(profile?.locality || 'Mayur Vihar Phase 1');
      setAddress(profile?.address || '');
      setPincode(profile?.pincode || '110091');
      setAvatarPreview(profile?.avatar || user?.avatar || '');
    }
  }, [profile, user, isOpen]);

  if (!isOpen) return null;

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp|jpg)$/i)) {
      showToast('Please upload an image file (JPG, PNG, or WebP).', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be under 5MB.', 'error');
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await apiRequest('/parents/avatar', {
        method: 'POST',
        body: formData
      });

      if (res.success && res.avatarUrl) {
        setAvatarPreview(res.avatarUrl);
        showToast('Profile photo uploaded successfully!', 'success');
        await refreshUser();
      }
    } catch (err) {
      showToast(err.message || 'Failed to upload photo', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      showToast('Full name is required.', 'error');
      return;
    }
    if (!phone.trim()) {
      showToast('Mobile number is required.', 'error');
      return;
    }
    if (!city.trim() || !locality.trim()) {
      showToast('City and Area / Locality are required.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        whatsappNumber: whatsappNumber.trim(),
        city: city.trim(),
        locality: locality.trim(),
        address: address.trim(),
        pincode: pincode.trim(),
        avatar: avatarPreview
      };

      const res = await apiRequest('/parents/profile', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (res.success) {
        showToast('Parent profile updated successfully!', 'success');
        await refreshUser();
        if (onProfileUpdated) onProfileUpdated(res.profile);
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 relative my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shadow-xs border border-teal-100">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Edit Parent Profile</h3>
              <p className="text-[11px] text-slate-500">Contact and locality details for quick booking</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Avatar Upload */}
          <div className="flex items-center gap-4 p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60">
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-700 to-teal-600 text-white font-black text-xl flex items-center justify-center uppercase shadow-sm overflow-hidden shrink-0">
              <span className="select-none">{fullName?.[0] || user?.name?.[0] || 'P'}</span>
              {avatarPreview && (
                <img
                  src={getAvatarUrl(avatarPreview)}
                  alt="Profile"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-800">Profile Photo</div>
              <p className="text-[11px] text-slate-400">JPG, PNG, or WebP up to 5MB</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoSelect}
                accept="image/jpeg,image/png,image/webp,image/jpg"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="mt-1.5 text-[11px] font-bold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{avatarPreview ? 'Change Photo' : 'Upload Photo'}</span>
              </button>
            </div>
          </div>

          {/* Full Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px] mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Parent Full Name"
                className="w-full px-3.5 py-2.5 rounded-xl input-3d text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px] mb-1">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl input-3d text-xs font-semibold"
              />
            </div>
          </div>

          {/* Email & WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px] mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs font-medium cursor-not-allowed"
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px] mb-1">
                WhatsApp Number (Optional)
              </label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="WhatsApp if different"
                className="w-full px-3.5 py-2.5 rounded-xl input-3d text-xs font-medium"
              />
            </div>
          </div>

          {/* City & Locality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px] mb-1">
                City <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Delhi, Noida"
                className="w-full px-3.5 py-2.5 rounded-xl input-3d text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px] mb-1">
                Area / Locality <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="e.g. Mayur Vihar Phase 1"
                className="w-full px-3.5 py-2.5 rounded-xl input-3d text-xs font-semibold"
              />
            </div>
          </div>

          {/* Full Address */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                Full Home Address (Optional, Private)
              </label>
              <span className="text-[10px] text-teal-700 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Never public
              </span>
            </div>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House/Flat No., Building/Apartment, Street (used for home tuition bookings)"
              className="w-full px-3.5 py-2 rounded-xl input-3d text-xs font-medium"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl btn-3d-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl btn-3d-primary text-xs font-bold disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
