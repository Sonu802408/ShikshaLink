import React, { useState, useEffect } from 'react';
import { LifeBuoy, CheckCircle2, Clock, MessageSquare, AlertCircle } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminComplaints = () => {
  const { showToast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('open');

  // Resolve Modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketStatus, setTicketStatus] = useState('resolved');
  const [resolution, setResolution] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await apiRequest(`/admin/tickets?status=${statusFilter}`);
      if (res.success) {
        setTickets(res.tickets || []);
      }
    } catch (err) {
      showToast('Failed to load tickets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const handleOpenResolve = (ticket) => {
    setSelectedTicket(ticket);
    setTicketStatus('resolved');
    setResolution(ticket.resolution || 'Issue reviewed and resolved by platform administrator.');
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiRequest(`/admin/tickets/${selectedTicket._id}/resolve`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: ticketStatus,
          resolution,
          adminNotes: 'Resolution recorded'
        })
      });
      if (res.success) {
        showToast('Ticket updated successfully', 'success');
        setTickets((prev) =>
          prev.map((t) => (t._id === selectedTicket._id ? res.ticket : t))
        );
        setSelectedTicket(null);
      }
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Complaints & Support Tickets</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Resolve parent complaints, replacement tutor requests, and disputes
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
          {['open', 'in_progress', 'resolved', 'closed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                statusFilter === tab
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-slate-900 text-sm">No tickets in this status</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All complaints and support requests in this queue have been addressed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((t) => (
            <div key={t._id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3 text-xs">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{t.subject}</span>
                    <span className="px-2 py-0.5 rounded-md font-bold uppercase text-[10px] bg-slate-100 text-slate-700">
                      {t.ticketType?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    User: <strong>{t.user?.name}</strong> ({t.user?.email}) • Role: <strong className="capitalize">{t.user?.role}</strong>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  t.status === 'resolved'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : t.status === 'in_progress'
                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {t.status.replace('_', ' ')}
                </span>
              </div>

              <p className="text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3.5 rounded-2xl">
                {t.description}
              </p>

              {t.resolution && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950">
                  <span className="font-bold">Resolution Recorded:</span> {t.resolution}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-400">Created: {new Date(t.createdAt).toLocaleDateString()}</span>
                <button
                  onClick={() => handleOpenResolve(t)}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Update & Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolve Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">
              Update Support Ticket: #{selectedTicket._id.slice(-6)}
            </h3>

            <form onSubmit={handleResolveSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                >
                  <option value="in_progress">In Progress / Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Resolution / Response to User
                </label>
                <textarea
                  rows={4}
                  required
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
