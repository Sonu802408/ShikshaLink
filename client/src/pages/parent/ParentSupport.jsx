import React, { useState, useEffect } from 'react';
import { LifeBuoy, PlusCircle, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const ParentSupport = () => {
  const { showToast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [ticketType, setTicketType] = useState('replacement_request');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/support/tickets');
      if (data.success) {
        setTickets(data.tickets || []);
      }
    } catch (err) {
      showToast('Failed to load support tickets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      showToast('Please provide subject and description.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiRequest('/support/tickets', {
        method: 'POST',
        body: JSON.stringify({ ticketType, subject, description })
      });
      if (res.success) {
        showToast('Ticket submitted. Administrator team notified.', 'success');
        setTickets((prev) => [res.ticket, ...prev]);
        setModalOpen(false);
        setSubject('');
        setDescription('');
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit ticket', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Support & Complaints</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit replacement tutor requests, report schedule issues, or reach platform admins
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          New Ticket
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <LifeBuoy className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-sm">No open support tickets</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Everything is running smoothly! If you ever need a tutor replacement or have a query, open a ticket here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((t) => (
            <div key={t._id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{t.subject}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 uppercase">
                      {t.ticketType?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Filed on: {new Date(t.createdAt).toLocaleDateString()}
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

              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {t.description}
              </p>

              {t.resolution && (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4" />
                    Admin Resolution Note:
                  </div>
                  <p>{t.resolution}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Ticket Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">
              Submit Support Ticket
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Ticket Category
                </label>
                <select
                  value={ticketType}
                  onChange={(e) => setTicketType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                >
                  <option value="replacement_request">Request Replacement Tutor</option>
                  <option value="complaint">Report Tutor Issue / Complaint</option>
                  <option value="cancellation_issue">Cancellation & Rescheduling Help</option>
                  <option value="billing_query">Billing & Fee Question</option>
                  <option value="general">General Support</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Need replacement tutor for Class 10 Maths"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Detailed Description & Context
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the issue, session date, or the specific requirements you need assistance with..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
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
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
