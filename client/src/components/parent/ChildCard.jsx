import React from 'react';
import { GraduationCap, School, BookOpen, Edit3, Trash2, Languages } from 'lucide-react';

export const ChildCard = ({ child, onEdit, onDelete, isDeleting = false }) => {
  const initials = child.fullName
    ? child.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'S';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-4 sm:p-5 flex flex-col justify-between gap-4 group">
      <div className="space-y-3">
        {/* Header with avatar & actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white font-black text-sm flex items-center justify-center uppercase shadow-sm shrink-0">
              {initials}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight group-hover:text-teal-700 transition-colors">
                {child.fullName}
              </h3>
              <span className="inline-block px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[10px] font-black uppercase tracking-wider border border-teal-200/60 mt-0.5">
                {child.classGrade}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(child)}
              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Edit Student Profile"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => onDelete(child._id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              title="Remove Student"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Child Details */}
        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
          <div className="p-2 bg-slate-50/80 rounded-xl border border-slate-200/60">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Board</span>
            <span className="font-bold text-slate-800">{child.board || 'CBSE'}</span>
          </div>
          <div className="p-2 bg-slate-50/80 rounded-xl border border-slate-200/60">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Medium</span>
            <span className="font-bold text-slate-800">{child.medium || child.preferredLanguage || 'English'}</span>
          </div>
        </div>

        {child.school && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium truncate pt-0.5">
            <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{child.school}</span>
          </div>
        )}
      </div>
    </div>
  );
};
