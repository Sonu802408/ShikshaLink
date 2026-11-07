import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  RotateCcw,
  Search,
  Filter,
  Check,
  Zap,
  Building2,
  QrCode,
  Upload,
  Eye,
  X,
  AlertCircle,
  Copy,
  ExternalLink,
  Settings,
  Ban
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminPayments = () => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ analytics: {}, payments: [], payouts: [] });
  const [activeTab, setActiveTab] = useState('verifications'); // 'verifications', 'settings', 'payments', 'payouts'
  
  // Payout Settlement Modal
  const [settlingPayout, setSettlingPayout] = useState(null);
  const [transferRef, setTransferRef] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [processingSettle, setProcessingSettle] = useState(false);

  // Manual Verification Modal
  const [verifyingPayment, setVerifyingPayment] = useState(null);
  const [verifyAction, setVerifyAction] = useState('approve'); // 'approve' or 'reject'
  const [verifyNotes, setVerifyNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingVerify, setProcessingVerify] = useState(false);
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState('');

  // Payment Settings State
  const [paymentSettings, setPaymentSettings] = useState({
    businessDisplayName: 'ShikshaLink Education',
    upiId: '8130550381@pthdfc',
    upiPayeeName: 'ShikshaLink Education (Sonu Kumar)',
    upiQrCodeUrl: '/uploads/public/payments/paytm-qr.png',
    isOnlinePaymentEnabled: true,
    isCashPaymentEnabled: false,
    platformFeeType: 'percentage',
    platformFeeValue: 10,
    paymentInstructions: '1. Scan the UPI QR Code using PhonePe, Google Pay, Paytm, or BHIM.\n2. Complete payment for the exact total amount.\n3. Enter the 12-digit UTR/UPI Reference Number below.\n4. Admin will review and verify your payment to confirm the booking.',
    paymentVerificationMethod: 'manual_upi'
  });
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [showQrLivePreview, setShowQrLivePreview] = useState(false);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const [ledgerRes, settingsRes] = await Promise.all([
        apiRequest('/payments/admin/ledger'),
        apiRequest('/payments/admin/settings').catch(() => null)
      ]);

      if (ledgerRes.success) {
        setData(ledgerRes);
      }

      if (settingsRes?.success && settingsRes.paymentSettings) {
        setPaymentSettings(settingsRes.paymentSettings);
        if (settingsRes.paymentSettings.upiQrCodeUrl) {
          setQrPreview(settingsRes.paymentSettings.upiQrCodeUrl);
        }
      }
    } catch (err) {
      showToast('Failed to load financial records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const handleSettleSubmit = async (e) => {
    e.preventDefault();
    if (!transferRef.trim()) {
      showToast('Please enter a transfer reference / UTR.', 'error');
      return;
    }

    setProcessingSettle(true);
    try {
      const res = await apiRequest(`/payments/admin/payout/${settlingPayout._id}/settle`, {
        method: 'POST',
        body: JSON.stringify({
          transferReference: transferRef.trim(),
          adminNotes: adminNotes.trim()
        })
      });

      if (res.success) {
        showToast('Payout settled successfully!', 'success');
        setSettlingPayout(null);
        setTransferRef('');
        setAdminNotes('');
        fetchLedger();
      }
    } catch (err) {
      showToast(err.message || 'Settlement failed', 'error');
    } finally {
      setProcessingSettle(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setProcessingVerify(true);
    try {
      const res = await apiRequest(`/payments/admin/verify-manual/${verifyingPayment._id}`, {
        method: 'POST',
        body: JSON.stringify({
          action: verifyAction,
          adminNotes: verifyNotes.trim(),
          rejectionReason: rejectionReason.trim()
        })
      });

      if (res.success) {
        showToast(
          verifyAction === 'approve'
            ? 'Payment approved & booking confirmed!'
            : 'Payment rejected. Parent notified.',
          'success'
        );
        setVerifyingPayment(null);
        setVerifyNotes('');
        setRejectionReason('');
        fetchLedger();
      }
    } catch (err) {
      showToast(err.message || 'Verification update failed', 'error');
    } finally {
      setProcessingVerify(false);
    }
  };

  const handleQrFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG/JPG/WEBP).', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file size must be under 5MB.', 'error');
      return;
    }

    setQrFile(file);
    const reader = new FileReader();
    reader.onload = () => setQrPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSavePaymentSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      // 1. If new QR code file selected, upload it first
      let updatedQrUrl = paymentSettings.upiQrCodeUrl;
      if (qrFile) {
        const formData = new FormData();
        formData.append('qrCode', qrFile);
        const uploadRes = await apiRequest('/payments/admin/upload-qr', {
          method: 'POST',
          body: formData
        });
        if (uploadRes.success && uploadRes.qrCodeUrl) {
          updatedQrUrl = uploadRes.qrCodeUrl;
        }
      }

      // 2. Save settings payload
      const res = await apiRequest('/payments/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({
          ...paymentSettings,
          upiQrCodeUrl: updatedQrUrl
        })
      });

      if (res.success) {
        showToast('Payment settings saved and updated across checkout!', 'success');
        setPaymentSettings(res.paymentSettings);
        setQrFile(null);
      }
    } catch (err) {
      showToast(err.message || 'Failed to save payment settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const pendingPayments = (data.payments || []).filter(
    (p) => p.status === 'pending_verification'
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-1">
        <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
          Financial Governance & Payment Settings
        </span>
        <h1 className="text-2xl font-black text-slate-900">
          Payment Reconciliation, UPI Settings & Verification Queue
        </h1>
        <p className="text-xs text-slate-500">
          Admin-controlled escrow, manual UPI verification against UTRs, platform fee rules, and tutor payout settlements.
        </p>
      </div>

      {/* Analytics KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card-3d space-y-1">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
            Pending UPI Reviews
          </span>
          <div className="text-2xl font-black text-amber-700">
            {pendingPayments.length}
          </div>
          <div className="text-[11px] text-slate-500">Requires UTR verification</div>
        </div>

        <div className="stat-card-3d space-y-1">
          <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider">
            Gross Bookings
          </span>
          <div className="text-2xl font-black text-slate-900">
            ₹{data.analytics?.totalGrossRevenue || 0}
          </div>
          <div className="text-[11px] text-slate-500">{data.analytics?.paymentCount || 0} orders processed</div>
        </div>

        <div className="stat-card-3d space-y-1">
          <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider">Platform Revenue</span>
          <div className="text-2xl font-black text-teal-700">
            ₹{data.analytics?.totalPlatformFees || 0}
          </div>
          <div className="text-[11px] text-slate-500">Platform commissions</div>
        </div>

        <div className="stat-card-3d space-y-1">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Settled to Tutors</span>
          <div className="text-2xl font-black text-emerald-700">
            ₹{data.analytics?.totalSettledToTutors || 0}
          </div>
          <div className="text-[11px] text-slate-500">Transferred via UPI/NEFT</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'verifications'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Manual UPI Verification Queue</span>
          {pendingPayments.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-black animate-pulse">
              {pendingPayments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'settings'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Payment & QR Code Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'payments'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>All Payment Transactions ({data.payments?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'payouts'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Tutor Payout Ledger ({data.payouts?.length || 0})</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center space-y-2">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-xs text-slate-400 font-semibold">Loading financial data...</div>
        </div>
      ) : activeTab === 'verifications' ? (
        /* TAB 1: MANUAL UPI VERIFICATION QUEUE */
        <div className="card-3d p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Pending Manual UPI Payments Awaiting Admin Approval
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Check the parent's submitted UTR against your PhonePe/bank statement. Approve to confirm booking or reject with a reason.
              </p>
            </div>
            <button
              onClick={fetchLedger}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {pendingPayments.length === 0 ? (
            <div className="p-12 text-center space-y-3 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <div className="font-bold text-slate-800 text-sm">All Caught Up!</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                There are no manual UPI transactions pending verification. All submitted payments have been processed.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-2xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Order Ref</th>
                    <th className="p-3">Parent / User</th>
                    <th className="p-3">Tutor / Class</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Submitted UTR (Ref ID)</th>
                    <th className="p-3">Receipt Screenshot</th>
                    <th className="p-3">Submission Time</th>
                    <th className="p-3 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {pendingPayments.map((pmt) => (
                    <tr key={pmt._id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {pmt.orderId}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{pmt.parentUser?.name}</div>
                        <div className="text-[11px] text-slate-400">{pmt.parentUser?.phone}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">{pmt.tutorUser?.name}</div>
                        <div className="text-[11px] text-slate-500">{pmt.booking?.subject} ({pmt.booking?.classGrade})</div>
                      </td>
                      <td className="p-3 font-black text-slate-900 text-sm">
                        ₹{pmt.amount}
                      </td>
                      <td className="p-3">
                        <div className="font-mono font-black text-teal-800 bg-teal-50 px-2 py-1 rounded-lg border border-teal-200 inline-block">
                          {pmt.transactionReference || 'Not Provided'}
                        </div>
                      </td>
                      <td className="p-3">
                        {pmt.receiptScreenshotUrl ? (
                          <button
                            type="button"
                            onClick={() => setViewingReceiptUrl(pmt.receiptScreenshotUrl)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold border border-sky-200"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Proof</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 italic">No file attached</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-500 text-[11px]">
                        {pmt.submittedAt ? new Date(pmt.submittedAt).toLocaleString() : new Date(pmt.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setVerifyingPayment(pmt);
                              setVerifyAction('approve');
                              setVerifyNotes('Verified against UPI statement');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setVerifyingPayment(pmt);
                              setVerifyAction('reject');
                              setRejectionReason('UTR not reflected in merchant bank records');
                            }}
                            className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : activeTab === 'settings' ? (
        /* TAB 2: PAYMENT & QR CODE SETTINGS */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Settings Form (8 cols) */}
          <div className="lg:col-span-8 card-3d p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-base font-black text-slate-900">
                Payment Settings & UPI Configuration
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure your business display name, UPI ID, payee details, and platform convenience fee rules.
              </p>
            </div>

            <form onSubmit={handleSavePaymentSettings} className="space-y-6 text-xs">
              {/* Business Name & Payee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Business / Platform Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentSettings.businessDisplayName || ''}
                    onChange={(e) =>
                      setPaymentSettings({ ...paymentSettings, businessDisplayName: e.target.value })
                    }
                    placeholder="e.g. ShikshaLink Education"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    UPI Payee Name
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentSettings.upiPayeeName || ''}
                    onChange={(e) =>
                      setPaymentSettings({ ...paymentSettings, upiPayeeName: e.target.value })
                    }
                    placeholder="e.g. Sonu Kumar"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900"
                  />
                </div>
              </div>

              {/* UPI ID / VPA */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Merchant UPI ID / VPA <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={paymentSettings.upiId || ''}
                  onChange={(e) =>
                    setPaymentSettings({ ...paymentSettings, upiId: e.target.value })
                  }
                  placeholder="e.g. singhsonu883661@ybl"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  This UPI ID is copied by parents and embedded into all dynamically generated payment links.
                </p>
              </div>

              {/* UPI QR Code Upload & Preview */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <label className="block font-bold text-slate-800 uppercase tracking-wider">
                  UPI QR Code Image
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-28 h-28 rounded-2xl bg-white border border-slate-300 p-1 flex items-center justify-center overflow-hidden shadow-xs shrink-0">
                    {qrPreview || paymentSettings.upiQrCodeUrl ? (
                      <img
                        src={qrPreview || paymentSettings.upiQrCodeUrl}
                        alt="QR Code Preview"
                        className="w-full h-full object-contain rounded-xl"
                      />
                    ) : (
                      <QrCode className="w-10 h-10 text-slate-300" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-bold text-slate-700 text-xs cursor-pointer shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>{qrFile ? 'Select Different Image' : 'Upload New QR Code Image'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleQrFileSelect}
                        className="hidden"
                      />
                    </label>
                    {qrFile && (
                      <div className="text-[11px] text-teal-700 font-semibold">
                        Selected: {qrFile.name} ({(qrFile.size / 1024).toFixed(1)} KB)
                      </div>
                    )}
                    <p className="text-[11px] text-slate-400">
                      Upload your high-resolution PhonePe, Google Pay, or Paytm merchant QR code. Saved securely in persistent storage.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Methods Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Online Payments</span>
                    <input
                      type="checkbox"
                      checked={paymentSettings.isOnlinePaymentEnabled !== false}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, isOnlinePaymentEnabled: e.target.checked })
                      }
                      className="w-4 h-4 text-teal-600 rounded"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Enables online UPI payments for all tuition sessions.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">Cash Payment</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                        {paymentSettings.isCashPaymentEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={paymentSettings.isCashPaymentEnabled === true}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, isCashPaymentEnabled: e.target.checked })
                      }
                      className="w-4 h-4 text-teal-600 rounded"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Keep disabled to mark Cash as "Currently Unavailable" on checkout.
                  </p>
                </div>
              </div>

              {/* Platform Fee Configuration */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <span className="font-bold text-slate-900 uppercase tracking-wider block">
                  Platform Convenience Fee Configuration
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Fee Type</label>
                    <select
                      value={paymentSettings.platformFeeType || 'percentage'}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, platformFeeType: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-white"
                    >
                      <option value="percentage">Percentage (%) of Base Fee</option>
                      <option value="fixed">Fixed Flat Amount (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Fee Value {paymentSettings.platformFeeType === 'percentage' ? '(%)' : '(₹)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={paymentSettings.platformFeeValue ?? 10}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, platformFeeValue: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Payment Instructions for Parents
                </label>
                <textarea
                  rows={3}
                  value={paymentSettings.paymentInstructions || ''}
                  onChange={(e) =>
                    setPaymentSettings({ ...paymentSettings, paymentInstructions: e.target.value })
                  }
                  placeholder="Clear step-by-step instructions displayed on the checkout page..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs"
                />
              </div>

              {/* Actions Bar */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-3 rounded-xl btn-3d-primary font-bold text-xs uppercase tracking-wider shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {savingSettings ? 'Saving Settings...' : 'Save Payment Settings'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowQrLivePreview(!showQrLivePreview)}
                  className="px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 font-bold text-slate-700 text-xs flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{showQrLivePreview ? 'Hide Live Preview' : 'Live Checkout Preview'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: Live Checkout Card Preview (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-4 shadow-xl border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-400">
                  Live Checkout Card Preview
                </span>
                <span className="text-[9px] bg-teal-900/60 text-teal-300 px-2 py-0.5 rounded-full font-bold">
                  {paymentSettings.platformFeeType === 'percentage' ? `${paymentSettings.platformFeeValue}% Fee` : `₹${paymentSettings.platformFeeValue} Flat`}
                </span>
              </div>

              <div className="w-48 h-48 mx-auto p-2 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                <img
                  src={qrPreview || paymentSettings.upiQrCodeUrl || '/uploads/public/payments/phonepe-qr.png'}
                  alt="Live QR Preview"
                  className="w-full h-full object-contain rounded-xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${paymentSettings.upiId}&pn=${encodeURIComponent(paymentSettings.upiPayeeName)}&am=559&cu=INR`;
                  }}
                />
              </div>

              <div className="text-center space-y-1">
                <div className="text-xs font-bold text-slate-200">
                  {paymentSettings.businessDisplayName}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Payee: {paymentSettings.upiPayeeName}
                </div>
                <div className="font-mono text-xs text-teal-300 font-bold mt-1 bg-slate-950 p-2 rounded-xl border border-slate-800">
                  {paymentSettings.upiId}
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-400 space-y-1.5">
                <div className="flex justify-between">
                  <span>Online Payments:</span>
                  <strong className={paymentSettings.isOnlinePaymentEnabled ? 'text-emerald-400' : 'text-rose-400'}>
                    {paymentSettings.isOnlinePaymentEnabled ? 'Active' : 'Disabled'}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Cash on Session:</span>
                  <strong className={paymentSettings.isCashPaymentEnabled ? 'text-emerald-400' : 'text-slate-400'}>
                    {paymentSettings.isCashPaymentEnabled ? 'Enabled' : 'Currently Unavailable'}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'payments' ? (
        /* TAB 3: ALL PARENT PAYMENT TRANSACTIONS */
        <div className="card-3d p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Parent Transactions & Escrow Reconciliation</h2>
            <button
              onClick={fetchLedger}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {data.payments?.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No payment records logged.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-2xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Order Ref</th>
                    <th className="p-3">Parent</th>
                    <th className="p-3">Tutor</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">UTR Reference</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {data.payments.map((pmt) => (
                    <tr key={pmt._id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {pmt.orderId}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">{pmt.parentUser?.name}</div>
                        <div className="text-[11px] text-slate-400">{pmt.parentUser?.phone}</div>
                      </td>
                      <td className="p-3 text-slate-700 font-medium">
                        {pmt.tutorUser?.name}
                      </td>
                      <td className="p-3 font-black text-slate-900">₹{pmt.amount}</td>
                      <td className="p-3 uppercase font-semibold text-slate-600">{pmt.paymentMethod}</td>
                      <td className="p-3 font-mono text-[11px] text-slate-700">
                        {pmt.transactionReference || pmt.paymentId || '—'}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          pmt.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : pmt.status === 'pending_verification'
                            ? 'bg-amber-100 text-amber-800'
                            : pmt.status === 'refunded'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {pmt.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 text-[11px]">
                        {new Date(pmt.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* TAB 4: TUTOR PAYOUT LEDGER */
        <div className="card-3d p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Accrued & Settled Tutor Payouts</h2>
            <button
              onClick={fetchLedger}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {data.payouts?.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No payout records in ledger.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-2xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Tutor Educator</th>
                    <th className="p-3">Tuition Class</th>
                    <th className="p-3">Gross Booking</th>
                    <th className="p-3">Platform Cut</th>
                    <th className="p-3">Net Payable</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Transfer UTR / Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {data.payouts.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/80">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{p.tutorUser?.name}</div>
                        <div className="text-[11px] text-slate-400">{p.tutorUser?.email}</div>
                      </td>
                      <td className="p-3 font-medium text-slate-700">
                        {p.booking?.subject} ({p.booking?.classGrade})
                      </td>
                      <td className="p-3 font-semibold text-slate-900">₹{p.grossAmount}</td>
                      <td className="p-3 text-slate-500">-₹{p.platformCommission} ({p.commissionRatePercent}%)</td>
                      <td className="p-3 font-black text-emerald-700 text-sm">₹{p.netPayableToTutor}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          p.status === 'transferred'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'processing'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {p.status === 'transferred' ? (
                          <div className="font-mono text-[11px] text-slate-700">
                            <strong>UTR:</strong> {p.transferReference}
                          </div>
                        ) : (
                          <button
                            onClick={() => setSettlingPayout(p)}
                            className="px-3 py-1 rounded-xl bg-teal-600 text-white font-bold text-[11px] hover:bg-teal-700 shadow-2xs"
                          >
                            Record Settlement
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Manual Verification Modal */}
      {verifyingPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-sm">
                  {verifyAction === 'approve' ? 'Approve UPI Payment' : 'Reject UPI Payment'}
                </h3>
                <p className="text-[11px] text-slate-400">Order #{verifyingPayment.orderId}</p>
              </div>
              <button
                type="button"
                onClick={() => setVerifyingPayment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Parent:</span>
                <span className="font-bold text-slate-900">{verifyingPayment.parentUser?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payable Amount:</span>
                <span className="font-black text-teal-700">₹{verifyingPayment.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Submitted UTR:</span>
                <span className="font-mono font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {verifyingPayment.transactionReference}
                </span>
              </div>
            </div>

            <form onSubmit={handleVerificationSubmit} className="space-y-4">
              {verifyAction === 'approve' ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Admin Verification Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={verifyNotes}
                    onChange={(e) => setVerifyNotes(e.target.value)}
                    placeholder="e.g. Verified in PhonePe merchant dashboard"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-rose-700 mb-1">
                    Rejection Reason (Parent will be notified)
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Reference number not found in merchant bank records"
                    className="w-full px-3 py-2 rounded-xl border border-rose-300 text-xs"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={processingVerify}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-md disabled:opacity-50 ${
                    verifyAction === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {processingVerify
                    ? 'Processing...'
                    : verifyAction === 'approve'
                    ? 'Confirm & Approve Payment'
                    : 'Confirm Rejection'}
                </button>
                <button
                  type="button"
                  onClick={() => setVerifyingPayment(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settle Payout Modal */}
      {settlingPayout && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Record Payout Settlement</h3>
                <p className="text-[11px] text-slate-400">Transfer ID #{settlingPayout._id.slice(-6)}</p>
              </div>
              <button
                type="button"
                onClick={() => setSettlingPayout(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Tutor:</span>
                <span className="font-bold text-slate-900">{settlingPayout.tutorUser?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Net Payable:</span>
                <span className="font-black text-emerald-700 text-sm">₹{settlingPayout.netPayableToTutor}</span>
              </div>
            </div>

            <form onSubmit={handleSettleSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Bank / UPI Transfer Reference (UTR) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={transferRef}
                  onChange={(e) => setTransferRef(e.target.value)}
                  placeholder="e.g. 430198273612"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Admin Settlement Notes</label>
                <input
                  type="text"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Paid via ICICI IMPS to registered UPI ID"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={processingSettle}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold uppercase tracking-wider text-xs shadow-md disabled:opacity-50"
                >
                  {processingSettle ? 'Recording...' : 'Confirm Settlement'}
                </button>
                <button
                  type="button"
                  onClick={() => setSettlingPayout(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Screenshot Viewer Modal */}
      {viewingReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Parent Payment Receipt Proof</h3>
              <button
                type="button"
                onClick={() => setViewingReceiptUrl('')}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto flex items-center justify-center bg-slate-50 rounded-2xl p-2 border border-slate-200">
              <img
                src={viewingReceiptUrl}
                alt="Receipt screenshot"
                className="max-w-full max-h-[60vh] object-contain rounded-xl"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setViewingReceiptUrl('')}
                className="px-4 py-2 rounded-xl btn-3d-secondary font-bold text-xs"
              >
                Close Proof
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
