import React, { useState, useEffect } from 'react';
import { Plus, User, ShieldCheck, Trash2, Edit3, X, AlertCircle } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const MyChildren = () => {
  const { showToast } = useToast();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [classGrade, setClassGrade] = useState('Class 10');
  const [board, setBoard] = useState('CBSE');
  const [school, setSchool] = useState('');
  const [subjectsStr, setSubjectsStr] = useState('Mathematics, Science');
  const [preferredLanguage, setPreferredLanguage] = useState('English & Hindi');
  const [learningGoals, setLearningGoals] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/parents/children');
      if (data.success) {
        setChildren(data.children || []);
      }
    } catch (err) {
      showToast('Failed to load child profiles', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleOpenAdd = () => {
    setEditingChild(null);
    setFullName('');
    setClassGrade('Class 10');
    setBoard('CBSE');
    setSchool('');
    setSubjectsStr('Mathematics, Science');
    setPreferredLanguage('English & Hindi');
    setLearningGoals('');
    setModalOpen(true);
  };

  const handleOpenEdit = (child) => {
    setEditingChild(child);
    setFullName(child.fullName);
    setClassGrade(child.classGrade);
    setBoard(child.board);
    setSchool(child.school || '');
    setSubjectsStr(child.subjects?.join(', ') || '');
    setPreferredLanguage(child.preferredLanguage || 'English');
    setLearningGoals(child.learningGoals || '');
    setModalOpen(true);
  };

  const handleDeleteChild = async (id) => {
    if (!window.confirm('Are you sure you want to remove this child profile?')) return;
    try {
      const res = await apiRequest(`/parents/children/${id}`, { method: 'DELETE' });
      if (res.success) {
        showToast('Child profile removed', 'success');
        setChildren((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err) {
      showToast('Failed to delete profile', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !classGrade || !board) {
      showToast('Name, Class, and School Board are required.', 'error');
      return;
    }

    setSubmitting(true);
    const subjects = subjectsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const payload = {
        fullName,
        classGrade,
        board,
        school,
        subjects,
        preferredLanguage,
        learningGoals
      };

      if (editingChild) {
        const res = await apiRequest(`/parents/children/${editingChild._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        if (res.success) {
          showToast('Child profile updated!', 'success');
          setChildren((prev) =>
            prev.map((c) => (c._id === editingChild._id ? res.child : c))
          );
          setModalOpen(false);
        }
      } else {
        const res = await apiRequest('/parents/children', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        if (res.success) {
          showToast('Child profile created!', 'success');
          setChildren((prev) => [res.child, ...prev]);
          setModalOpen(false);
        }
      }
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">My Children</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Add your children to customize tutor searches and tuition requirements
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Child
        </button>
      </div>

      {/* Child Privacy Guarantee Banner */}
      <div className="p-4 bg-sky-50/80 rounded-2xl border border-sky-200/80 flex items-start gap-3 text-xs text-sky-950 leading-relaxed">
        <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Child Privacy Protected:</span> Your child's full name, school, and exact address are never shown publicly. Only anonymized display names (e.g. "{children[0]?.displayName || 'Aarav S.'}") and academic details are shared with tutors.
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading child profiles...</div>
      ) : children.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <User className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">No child profiles added yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add a child to post specific tuition requirements and book demo classes tailored to their grade.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
          >
            Add First Child
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {children.map((c) => (
            <div
              key={c._id}
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3 relative group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-bold flex items-center justify-center uppercase">
                    {c.fullName[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{c.fullName}</h3>
                    <div className="text-xs text-slate-500 font-medium">
                      Public Handle: <span className="text-teal-700 font-semibold">{c.displayName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteChild(c._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl">
                <div>
                  <span className="text-slate-400 font-semibold">Grade:</span> {c.classGrade}
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">Board:</span> {c.board}
                </div>
                {c.school && (
                  <div className="col-span-2 truncate">
                    <span className="text-slate-400 font-semibold">School (Private):</span> {c.school}
                  </div>
                )}
              </div>

              {c.subjects?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {c.subjects.map((sub) => (
                    <span key={sub} className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-700">
                      {sub}
                    </span>
                  ))}
                </div>
              )}

              {c.learningGoals && (
                <div className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                  <span className="font-semibold text-slate-700 not-italic">Goals:</span> "{c.learningGoals}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingChild ? 'Edit Child Profile' : 'Add Child Profile'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name (Confidential)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Class / Grade
                  </label>
                  <select
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  >
                    {[
                      'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
                      'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
                      'Class 11', 'Class 12', 'Competitive: JEE', 'Competitive: NEET', 'Competitive: CUET'
                    ].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    School Board
                  </label>
                  <select
                    value={board}
                    onChange={(e) => setBoard(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  >
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="State Board">State Board</option>
                    <option value="NIOS">NIOS</option>
                    <option value="IB">IB</option>
                    <option value="Cambridge (IGCSE)">Cambridge (IGCSE)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  School Name (Private)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ahlcon International School"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Subjects Needing Tuition (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics, Science, Physics"
                  value={subjectsStr}
                  onChange={(e) => setSubjectsStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Learning Goals & Specific Doubts
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Needs help in understanding algebra formulas and improving speed for exam..."
                  value={learningGoals}
                  onChange={(e) => setLearningGoals(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2.5 rounded-xl bg-teal-600 text-white font-bold disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Child Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
