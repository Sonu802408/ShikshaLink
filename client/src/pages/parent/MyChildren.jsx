import React, { useState, useEffect } from 'react';
import { Plus, Users, ShieldCheck, AlertCircle } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ChildCard } from '../../components/parent/ChildCard';
import { ChildModal } from '../../components/parent/ChildModal';

export const MyChildren = () => {
  const { showToast } = useToast();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState(null);
  const [savingChild, setSavingChild] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

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
    setModalOpen(true);
  };

  const handleOpenEdit = (child) => {
    setEditingChild(child);
    setModalOpen(true);
  };

  const handleSaveChild = async (childData) => {
    setSavingChild(true);
    try {
      if (editingChild) {
        const res = await apiRequest(`/parents/children/${editingChild._id}`, {
          method: 'PUT',
          body: JSON.stringify(childData)
        });
        if (res.success) {
          showToast('Student profile updated!', 'success');
          setChildren((prev) => prev.map((c) => (c._id === editingChild._id ? res.child : c)));
          setModalOpen(false);
        }
      } else {
        const res = await apiRequest('/parents/children', {
          method: 'POST',
          body: JSON.stringify(childData)
        });
        if (res.success) {
          showToast('Student profile created!', 'success');
          setChildren((prev) => [res.child, ...prev]);
          setModalOpen(false);
        }
      }
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSavingChild(false);
    }
  };

  const handleDeleteChild = async (id) => {
    if (!window.confirm('Are you sure you want to remove this student profile?')) return;
    setDeletingId(id);
    try {
      const res = await apiRequest(`/parents/children/${id}`, { method: 'DELETE' });
      if (res.success) {
        showToast('Student profile removed', 'success');
        setChildren((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete profile', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" />
            <span>My Children ({children.length})</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered students are automatically pre-selected when booking tutors to eliminate repetitive form filling.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl btn-3d-primary text-xs font-bold flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Student</span>
        </button>
      </div>

      {/* Privacy Guarantee Note */}
      <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/70 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div className="text-xs text-teal-900 leading-relaxed">
          <span className="font-bold">Student Privacy Shield:</span> Student full names, school information, and home addresses are never published in public tutor directories. Details are securely shared only with tutors you explicitly choose to book.
        </div>
      </div>

      {/* Children Cards List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading student profiles...</div>
      ) : children.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-900 text-base">No students added yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your child's grade, board, and school to make one-click tutor bookings anytime.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl btn-3d-primary text-xs font-bold"
          >
            Add Student Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {children.map((child) => (
            <ChildCard
              key={child._id}
              child={child}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteChild}
              isDeleting={deletingId === child._id}
            />
          ))}
        </div>
      )}

      {/* Child Add/Edit Modal */}
      <ChildModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        child={editingChild}
        isSaving={savingChild}
        onSave={handleSaveChild}
      />
    </div>
  );
};
