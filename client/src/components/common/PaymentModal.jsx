import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Upload,
  Clock,
  ArrowRight,
  Info,
  CreditCard,
  Ban,
  Smartphone,
  Zap
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const PaymentModal = ({ booking, onClose, onPaymentSuccess }) => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [order, setOrder] = useState(null);
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submittedPayment, setSubmittedPayment] = useState(null);
  const [selectedQrTab, setSelectedQrTab] = useState('dynamic'); // 'dynamic' or 'paytm'
  const [hasTriggeredAppPay, setHasTriggeredAppPay] = useState(false);

  useEffect(() => {
    const fetchCheckout = async () => {
      setLoading(true);
      try {
        const res = await apiRequest(`/payments/checkout/${booking._id}`);
        if (res.success && res.summary) {
          setData(res.summary);

          // If already paid or pending verification
          if (res.summary.booking.paymentStatus === 'paid') {
            setSubmissionSuccess(true);
            setSubmittedPayment(res.summary.existingPayment);
          } else if (res.summary.existingPayment?.status === 'pending_verification') {
            setSubmissionSuccess(true);
            setSubmittedPayment(res.summary.existingPayment);
          } else {
            // Generate order
            const orderRes = await apiRequest('/payments/create-order', {
              method: 'POST',
              body: JSON.stringify({
                bookingId: booking._id,
                paymentMethod: 'online_upi'
              })
            });
            if (orderRes.success && orderRes.order) {
              setOrder(orderRes.order);
            }
          }
        }
      } catch (err) {
        showToast(err.message || 'Failed to initialize payment', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (booking?._id) {
      fetchCheckout();
    }
  }, [booking, showToast]);

  const handleCopyVpa = () => {
    const vpa = data?.upiDetails?.vpa || '8130550381@pthdfc';
    navigator.clipboard.writeText(vpa);
    setCopiedVpa(true);
    showToast('Paytm UPI ID copied to clipboard!', 'success');
    setTimeout(() => setCopiedVpa(false), 2500);
  };

  const handleTriggerAppPay = (appName) => {
    setHasTriggeredAppPay(true);
    showToast(`Opening ${appName}... Complete payment and tap Confirm.`, 'info');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Receipt file size must be under 5MB.', 'error');
      return;
    }

    setReceiptFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setReceiptPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview('');
    }
  };

  const handleSubmitUpi = async (e, directUtr) => {
    if (e && e.preventDefault) e.preventDefault();

    const finalUtr = (directUtr || utrNumber || `UPI-PAYTM-${Date.now().toString().slice(-8)}`).trim();

    if (!finalUtr || finalUtr.length < 4) {
      showToast('Please enter a valid reference number or click Direct Pay.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('orderId', order?.orderId || '');
      formData.append('bookingId', booking._id);
      formData.append('transactionReference', finalUtr);
      formData.append('parentSubmissionNotes', `Submitted via 1-Click Modal for ${booking.subject}`);
      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      const res = await apiRequest('/payments/submit-manual-upi', {
        method: 'POST',
        body: formData
      });

      if (res.success) {
        setSubmissionSuccess(true);
        setSubmittedPayment(res.payment);
        showToast('Payment submitted! Awaiting admin verification.', 'success');
        if (onPaymentSuccess) {
          onPaymentSuccess(res.booking, res.payment);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit payment reference.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!booking) return null;

  const breakdown = data?.breakdown || {
    baseTutorFee: booking.fee?.agreedAmount || 500,
    platformFee: 50,
    taxes: 9,
    travelCharge: 0,
    finalAmount: (booking.fee?.agreedAmount || 500) + 59
  };

  const upiDetails = data?.upiDetails || {
    vpa: '8130550381@pthdfc',
    payeeName: 'ShikshaLink Education (Sonu Kumar)',
    qrCodeUrl: '/uploads/public/payments/paytm-qr.png'
  };

  const vpa = upiDetails?.vpa || '8130550381@pthdfc';
  const payeeName = upiDetails?.payeeName || 'ShikshaLink Education (Sonu Kumar)';
  const amount = breakdown.finalAmount;
  const orderRef = order?.orderId || booking?._id || 'ORD';

  const standardUpiUri = `upi://pay?pa=${vpa}&pn=${encodeURIComponent('ShikshaLink Education')}&am=${amount}&tr=${orderRef}&tn=${encodeURIComponent('Tuition ' + (booking.subject || 'ShikshaLink'))}&cu=INR`;
  const paytmUri = `paytmmp://pay?pa=${vpa}&pn=${encodeURIComponent('ShikshaLink Education')}&am=${amount}&tr=${orderRef}&tn=${encodeURIComponent('Tuition ' + (booking.subject || 'ShikshaLink'))}&cu=INR`;
  const gpayUri = `gpay://upi/pay?pa=${vpa}&pn=${encodeURIComponent('ShikshaLink Education')}&am=${amount}&tr=${orderRef}&tn=${encodeURIComponent('Tuition ' + (booking.subject || 'ShikshaLink'))}&cu=INR`;
  const phonepeUri = `phonepe://pay?pa=${vpa}&pn=${encodeURIComponent('ShikshaLink Education')}&am=${amount}&tr=${orderRef}&tn=${encodeURIComponent('Tuition ' + (booking.subject || 'ShikshaLink'))}&cu=INR`;

  const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=6&data=${encodeURIComponent(standardUpiUri)}`;
  const staticQrUrl = upiDetails?.qrCodeUrl || '/uploads/public/payments/paytm-qr.png';
  const activeQrSrc = selectedQrTab === 'dynamic' ? dynamicQrUrl : staticQrUrl;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-slate-950/70 backdrop-blur-md">
      <div className="min-h-full flex items-center justify-center p-3 sm:p-4 text-center">
        <div className="bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border border-slate-200/90 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative my-auto text-left">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 text-teal-300 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-400">
                Online UPI Checkout
              </span>
              <h3 className="text-base font-bold">
                {submissionSuccess ? 'Payment Verification Pending' : 'Complete Tuition Payment'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 font-semibold">Generating secure order details...</p>
          </div>
        ) : submissionSuccess ? (
          /* SUBMITTED CONFIRMATION STATE */
          <div className="p-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner ring-4 ring-amber-50">
              {submittedPayment?.status === 'paid' ? (
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              ) : (
                <Clock className="w-9 h-9 text-amber-600 animate-pulse" />
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-amber-100 text-amber-800">
                {submittedPayment?.status === 'paid' ? 'Verified & Confirmed' : 'Pending Admin Verification'}
              </span>
              <h4 className="text-xl font-black text-slate-900 mt-1">
                {submittedPayment?.status === 'paid' ? 'Payment Verified!' : 'Payment Submitted'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {submittedPayment?.status === 'paid'
                  ? 'Your session is confirmed with the tutor.'
                  : `Your UPI reference has been recorded. Admin will reconcile the transaction and notify you upon confirmation.`}
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-left space-y-2">
              <div className="flex justify-between text-slate-500 pb-2 border-b border-slate-200">
                <span>Order Ref:</span>
                <span className="font-mono font-bold text-slate-800">{submittedPayment?.orderId || order?.orderId}</span>
              </div>
              <div className="flex justify-between text-slate-500 pb-2 border-b border-slate-200">
                <span>UTR Reference:</span>
                <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {submittedPayment?.transactionReference || utrNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tuition Subject:</span>
                <strong className="text-slate-900">{booking.subject} ({booking.classGrade})</strong>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 font-black text-sm text-slate-900">
                <span>Total Amount:</span>
                <span className="text-teal-700">₹{breakdown.finalAmount}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl btn-3d-primary font-bold text-xs uppercase tracking-wider shadow-lg cursor-pointer"
            >
              Done & Return to Bookings
            </button>
          </div>
        ) : (
          /* PAYMENT CHECKOUT BODY */
          <div className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
            {/* Payment Method Option Display */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Payment Method
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl border-2 border-teal-600 bg-teal-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-teal-600" />
                    <span className="font-bold text-slate-900">Online UPI</span>
                  </div>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded">
                    ACTIVE
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 opacity-60 flex items-center justify-between cursor-not-allowed">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-400">Cash</span>
                  </div>
                  <span className="text-[9px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                    Unavailable
                  </span>
                </div>
              </div>
            </div>

            {/* Fee Breakdown Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
              <div className="flex items-center justify-between text-slate-700 font-semibold">
                <span>Tutor Tuition Fee ({booking.schedule?.durationHours || 1} hr):</span>
                <span>₹{breakdown.baseTutorFee}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Platform Matchmaking Fee:</span>
                <span>₹{breakdown.platformFee}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Applicable Taxes (18% GST):</span>
                <span>₹{breakdown.taxes}</span>
              </div>
              {breakdown.travelCharge > 0 && (
                <div className="flex items-center justify-between text-slate-500">
                  <span>Home Tuition Travel Allowance:</span>
                  <span>₹{breakdown.travelCharge}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-black text-slate-900">
                <span>Total Payable Amount:</span>
                <span className="text-teal-700 text-base">₹{breakdown.finalAmount}</span>
              </div>
            </div>

            {/* 1-Click Mobile Pay Buttons */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-4 space-y-3 shadow-md border border-slate-700/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                    <Smartphone className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-white">
                    1-Click Mobile Pay
                  </span>
                </div>
                <span className="text-[9px] bg-teal-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                  NO UTR NEEDED
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Paytm */}
                <a
                  href={paytmUri}
                  onClick={() => handleTriggerAppPay('Paytm')}
                  className="p-2.5 rounded-xl bg-[#002e6e] hover:bg-[#002255] text-white flex flex-col items-center justify-center gap-0.5 text-center font-bold text-xs shadow-sm transition-all hover:scale-[1.02] cursor-pointer border border-cyan-400/30"
                >
                  <span className="text-xs font-black">Paytm</span>
                  <span className="text-[9px] text-cyan-200">1-Tap Pay</span>
                </a>

                {/* Google Pay */}
                <a
                  href={gpayUri}
                  onClick={() => handleTriggerAppPay('Google Pay')}
                  className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 flex flex-col items-center justify-center gap-0.5 text-center font-bold text-xs shadow-sm transition-all hover:scale-[1.02] cursor-pointer border border-slate-300"
                >
                  <span className="text-xs font-black">GPay</span>
                  <span className="text-[9px] text-slate-600">Google Pay</span>
                </a>

                {/* PhonePe */}
                <a
                  href={phonepeUri}
                  onClick={() => handleTriggerAppPay('PhonePe')}
                  className="p-2.5 rounded-xl bg-[#5f259f] hover:bg-[#4d1d82] text-white flex flex-col items-center justify-center gap-0.5 text-center font-bold text-xs shadow-sm transition-all hover:scale-[1.02] cursor-pointer border border-purple-400/30"
                >
                  <span className="text-xs font-black">PhonePe</span>
                  <span className="text-[9px] text-purple-200">1-Tap Pay</span>
                </a>

                {/* Any UPI App */}
                <a
                  href={standardUpiUri}
                  onClick={() => handleTriggerAppPay('UPI App')}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white flex flex-col items-center justify-center gap-0.5 text-center font-bold text-xs shadow-sm transition-all hover:scale-[1.02] cursor-pointer border border-emerald-400/40"
                >
                  <span className="text-xs font-black flex items-center gap-1">Any UPI <Zap className="w-3 h-3 text-amber-300 fill-amber-300" /></span>
                  <span className="text-[9px] text-teal-100">BHIM/Cred</span>
                </a>
              </div>

              {hasTriggeredAppPay && (
                <button
                  type="button"
                  onClick={() => handleSubmitUpi(null, `UPI-APP-${Date.now().toString().slice(-8)}`)}
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.01]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>I Have Completed Payment — Confirm Booking</span>
                </button>
              )}
            </div>

            {/* UPI QR Presentation with Tab Switcher */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl text-center space-y-3">
              {/* Tab Selector */}
              <div className="flex items-center justify-center gap-1.5 bg-slate-950/70 p-1 rounded-xl max-w-xs mx-auto border border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setSelectedQrTab('dynamic')}
                  className={`flex-1 py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    selectedQrTab === 'dynamic'
                      ? 'bg-teal-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⚡ Locked QR (₹{breakdown.finalAmount})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedQrTab('paytm')}
                  className={`flex-1 py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    selectedQrTab === 'paytm'
                      ? 'bg-teal-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🔵 Paytm QR
                </button>
              </div>

              <div className="w-48 h-48 mx-auto p-2 bg-white rounded-xl shadow-md flex items-center justify-center">
                <img
                  src={activeQrSrc}
                  alt="UPI Payment QR Code"
                  className="w-full h-full object-contain rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = dynamicQrUrl;
                  }}
                />
              </div>

              <div className="space-y-1">
                <p className="font-bold text-slate-100 text-xs">
                  Payee: {payeeName}
                </p>
                <p className="text-[11px] text-teal-400 font-extrabold">
                  Exact Amount: ₹{breakdown.finalAmount}
                </p>
                <div className="flex items-center justify-between bg-slate-950/80 border border-slate-700 rounded-lg p-2 max-w-xs mx-auto">
                  <span className="font-mono text-[11px] text-slate-300 truncate pl-1">
                    {vpa}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyVpa}
                    className="px-2.5 py-1 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-[10px] flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {copiedVpa ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedVpa ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Submission Form */}
            <form onSubmit={handleSubmitUpi} className="space-y-3 pt-1">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    UPI Reference / UTR Number
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">(Optional if paid via 1-Click)</span>
                </div>
                <input
                  type="text"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.trim())}
                  placeholder="e.g. 430129847192 (or leave empty if paid via app)"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Payment Screenshot (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <label className="px-3 py-2 rounded-xl border border-dashed border-slate-300 hover:border-teal-500 bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-slate-400" />
                    <span>{receiptFile ? 'Change File' : 'Upload Receipt'}</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {receiptFile && (
                    <span className="text-[11px] text-slate-600 truncate max-w-[180px]">
                      {receiptFile.name}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl btn-3d-primary font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting UTR...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit Payment for Verification</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  </div>
);
};
