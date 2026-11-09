import React, { useState, useEffect } from 'react';
import { Users, Search, UserX, UserCheck, ShieldAlert, ArrowUpDown, Trash2 } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminUsers = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page);

      const res = await apiRequest(`/admin/users?${params.toString()}`);
      if (res.success) {
        setUsers(res.users || []);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter, page]);

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    let reason = '';
    if (newStatus === 'suspended') {
      reason = prompt('Reason for account suspension:');
      if (!reason) return;
    }

    try {
      const res = await apiRequest(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, reason })
      });
      if (res.success) {
        showToast(res.message, 'success');
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, status: newStatus } : u))
        );
      }
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to PERMANENTLY delete user "${user.name}" (${user.email})? This will delete all their tutor profiles, applications, bookings, and data.`)) {
      return;
    }
    try {
      const res = await apiRequest(`/admin/users/${user._id}`, {
        method: 'DELETE'
      });
      if (res.success) {
        showToast(res.message, 'success');
        setUsers((prev) => prev.filter((u) => u._id !== user._id));
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">User Management</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Audit parent and tutor user accounts, verify status, and enforce account policies
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 w-full sm:w-auto"
        >
          <option value="">All Roles</option>
          <option value="parent">Parents</option>
          <option value="tutor">Tutors</option>
          <option value="admin">Administrators</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 w-full sm:w-auto"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">No users found.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u._id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div>{u.email}</div>
                      <div className="text-[11px] text-slate-400">{u.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                        u.role === 'admin'
                          ? 'bg-purple-50 text-purple-800 border border-purple-200'
                          : u.role === 'tutor'
                          ? 'bg-teal-50 text-teal-800 border border-teal-200'
                          : 'bg-sky-50 text-sky-800 border border-sky-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        u.status === 'active'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleStatus(u._id, u.status)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              u.status === 'active'
                                ? 'border border-rose-200 text-rose-600 hover:bg-rose-50'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title={`Permanently delete user ${u.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
