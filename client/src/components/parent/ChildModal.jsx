import React, { useState, useEffect } from 'react';
import { X, GraduationCap, BookOpen, School, Languages, Sparkles } from 'lucide-react';

const CLASS_OPTIONS = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12', 'College / University'
];

const BOARD_OPTIONS = [
  'CBSE', 'ICSE', 'State Board', 'IB / Cambridge (IGCSE)', 'Other'
];

const MEDIUM_OPTIONS = [
  'English', 'Hindi', 'Other (Bilingual)'
];

export const ChildModal = ({ isOpen, onClose, onSave, child = null, isSaving = false }) => {
  const [fullName, setFullName] = useState('');
  const [classGrade, setClassGrade] = useState('Class 10');
  const [board, setBoard] = useState('CBSE');
  const [medium, setMedium] = useState('English');
  const [school, setSchool] = useState('');

  useEffect(() => {
    if (child) {
      setFullName(child.fullName || '');
      setClassGrade(child.classGrade || 'Class 10');
      setBoard(child.board || 'CBSE');
      setMedium(child.medium || child.preferredLanguage || 'English');
      setSchool(child.school || '');
    } else {
      setFullName('');
      setClassGrade('Class 10');
      setBoard('CBSE');
      setMedium('English');
      setSchool('');
    }
  }, [child, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    onSave({
      fullName: fullName.trim(),
      classGrade,
      board,
      medium,
      school: school.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 relative my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shadow-xs border border-teal-100">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {child ? 'Edit Student Profile' : 'Add New Student'}
              </h3>
              <p className="text-[11px] text-slate-500">Student information for matching tutors</p>
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
          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px] mb-1">
              Student Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              className="w-full px-3.5 py-2.5 rounded-xl input-3d text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px] mb-1">
                Class / Grade <span className="text-rose-500">*</span>
              </label>
              <select
                value={classGrade}
                onChange={(e) => setClassGrade(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl input-3d text-xs font-semibold"
              >
                {CLASS_OPTIONS.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px] mb-1">
                School Board <span className="text-rose-500">*</span>
              </label>
              <select
                value={board}
                onChange={(e) => setBoard(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl input-3d text-xs font-semibold"
              >
                {BOARD_OPTIONS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px] mb-1">
                Medium <span className="text-rose-500">*</span>
              </label>
              <select
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl input-3d text-xs font-semibold"
              >
                {MEDIUM_OPTIONS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px] mb-1">
                School / College (Optional)
              </label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="e.g. DPS Mayur Vihar"
                className="w-full px-3 py-2.5 rounded-xl input-3d text-xs font-medium"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl btn-3d-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !fullName.trim()}
              className="px-5 py-2.5 rounded-xl btn-3d-primary text-xs font-bold disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : child ? 'Update Student' : 'Save Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
