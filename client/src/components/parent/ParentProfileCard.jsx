import React from 'react';
import { User, Phone, Mail, MapPin, Edit3, ShieldCheck, MessageSquare, Users, Home } from 'lucide-react';
import { getAvatarUrl } from '../../services/api';

export const ParentProfileCard = ({ profile, user, childrenCount = 0, onEdit }) => {
  const displayName = profile?.fullName || user?.name || 'Parent';
  const displayPhone = profile?.phone || user?.phone || 'Not provided';
  const displayEmail = user?.email || 'Not provided';
  const displayCity = profile?.city || 'Delhi';
  const displayLocality = profile?.locality || 'Delhi NCR';
  const avatarUrl = profile?.avatar || user?.avatar;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-5 sm:p-7 space-y-5 relative overflow-hidden card-3d">
      {/* Background Accent Pill */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-teal-500/10 to-sky-500/5 rounded-full blur-2xl pointer-events-none -mr-12 -mt-12" />

      {/* Top Header: Avatar, Name, Children Badge & Edit Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 relative">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-700 to-teal-600 text-white font-black text-2xl flex items-center justify-center uppercase shadow-md ring-4 ring-slate-100 overflow-hidden shrink-0">
            <span className="select-none">{displayName[0]}</span>
            {avatarUrl && (
              <img
                src={getAvatarUrl(avatarUrl)}
                alt={displayName}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {displayName}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[11px] font-bold border border-teal-200/60">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                Verified Parent Account
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{displayLocality}, {displayCity}</span>
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="px-4 py-2 rounded-xl btn-3d-secondary text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Contact & Profile Info Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white text-teal-600 flex items-center justify-center shadow-2xs border border-slate-200/80 shrink-0">
            <Phone className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Mobile Phone</span>
            <span className="font-bold text-slate-900 truncate block">{displayPhone}</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white text-teal-600 flex items-center justify-center shadow-2xs border border-slate-200/80 shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Email Address</span>
            <span className="font-bold text-slate-900 truncate block">{displayEmail}</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-2xs border border-slate-200/80 shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">WhatsApp</span>
            <span className="font-bold text-slate-900 truncate block">
              {profile?.whatsappNumber || displayPhone}
            </span>
          </div>
        </div>

        <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white text-sky-600 flex items-center justify-center shadow-2xs border border-slate-200/80 shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Registered Children</span>
            <span className="font-black text-slate-900 text-sm">
              {childrenCount} {childrenCount === 1 ? 'Student' : 'Students'}
            </span>
          </div>
        </div>
      </div>

      {profile?.address && (
        <div className="px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center gap-2 text-xs text-slate-600">
          <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-700">Saved Address:</span>
          <span className="truncate">{profile.address}</span>
          <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full ml-auto border border-teal-200/60">
            Private
          </span>
        </div>
      )}
    </div>
  );
};
