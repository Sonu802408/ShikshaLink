import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  QrCode,
  Copy,
  Check,
  Upload,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  Lock,
  FileText,
  CheckCircle2,
  RotateCcw,
  Building2,
  Laptop,
  MapPin,
  Calendar,
  X,
  CreditCard,
  Ban,
  ChevronRight,
  Info
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const CheckoutPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [order, setOrder] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('online_upi'); // 'online_upi' or 'cash'
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submittedPayment, setSubmittedPayment] = useState(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  // Load checkout summary
  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const res = await apiRequest(`/payments/checkout/${bookingId}`);
        if (res.success && res.summary) {
          setData(res.summary);

          // If already paid
          if (res.summary.booking.paymentStatus === 'paid') {
            setSubmissionSuccess(true);
            setSubmittedPayment(res.summary.existingPayment);
          } else if (res.summary.existingPayment?.status === 'pending_verification') {
            setSubmissionSuccess(true);
            setSubmittedPayment(res.summary.existingPayment);
          } else {
            // Initialize payment order
            initOrder();
          }
        }
      } catch (err) {
        showToast(err.message || 'Failed to load checkout details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [bookingId, showToast]);

  const initOrder = async () => {
    try {
      const res = await apiRequest('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({
          bookingId,
          paymentMethod: selectedMethod
        })
      });
      if (res.success && res.order) {
        setOrder(res.order);
      }
    } catch (err) {
      showToast(err.message || 'Error generating order', 'error');
    }
  };

  const handleCopyVpa = () => {
    const vpa = data?.upiDetails?.vpa || 'singhsonu883661@ybl';
    navigator.clipboard.writeText(vpa);
    setCopiedVpa(true);
    showToast('UPI ID copied to clipboard!', 'success');
    setTimeout(() => setCopiedVpa(false), 2500);
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

  const handleSubmitUpi = async (e) => {
    e.preventDefault();

    if (!utrNumber.trim()) {
      showToast('Please enter your 12-digit UPI Reference Number / UTR.', 'error');
      return;
    }

    if (utrNumber.trim().length < 4) {
      showToast('Please enter a valid reference number.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('orderId', order?.orderId || '');
      formData.append('bookingId', bookingId);
      formData.append('transactionReference', utrNumber.trim());
      formData.append('parentSubmissionNotes', `Submitted via Checkout for ${data?.booking?.subject}`);
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
        showToast('Payment submitted successfully! Awaiting admin verification.', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit payment reference.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Loading Checkout Summary...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-xl border border-slate-200">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-black text-slate-900">Checkout Not Available</h2>
          <p className="text-xs text-slate-500">The requested booking does not exist or you do not have permission to access it.</p>
          <Link to="/parent/bookings" className="inline-block px-5 py-2.5 rounded-xl btn-3d-primary font-bold text-xs">
            Return to Bookings
          </Link>
        </div>
      </div>
    );
  }

  const { tutor, child, booking, breakdown, paymentMethods, upiDetails, policies } = data;

  // Resolve QR code display source
  const qrDisplayUrl = upiDetails.qrCodeUrl || '/uploads/public/payments/phonepe-qr.png';

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Breadcrumb & Back */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <Link to="/parent/bookings" className="flex items-center gap-1 hover:text-slate-900">
            ← Back to My Bookings
          </Link>
          <div className="flex items-center gap-1.5 text-teal-700 font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>256-bit Secure Checkout</span>
          </div>
        </div>

        {/* Success Confirmation State */}
        {submissionSuccess ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl card-3d p-6 sm:p-10 text-center space-y-6 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner ring-4 ring-amber-50">
              {submittedPayment?.status === 'paid' ? (
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              ) : (
                <Clock className="w-9 h-9 text-amber-600 animate-pulse" />
              )}
            </div>

            <div className="space-y-1">
              <span className="text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                {submittedPayment?.status === 'paid' ? 'Payment Verified & Confirmed' : 'Pending Admin Verification'}
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">
                {submittedPayment?.status === 'paid' ? 'Booking Confirmed!' : 'Payment Submitted Successfully'}
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {submittedPayment?.status === 'paid'
                  ? 'Your payment has been reconciled. Your session is fully confirmed.'
                  : `Your reference number has been recorded. Our admin team will verify the transfer against platform records and confirm your booking.`}
              </p>
            </div>

            {/* Receipt Summary */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-xs text-left space-y-2.5">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Order ID:</span>
                <span className="font-mono font-bold text-slate-800">{submittedPayment?.orderId || order?.orderId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Submitted UTR / Reference:</span>
                <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {submittedPayment?.transactionReference || utrNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tutor:</span>
                <span className="font-bold text-slate-900">{tutor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subject:</span>
                <span className="font-semibold text-slate-800">{booking.subject} ({booking.classGrade})</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
                <span>Total Amount:</span>
                <span className="text-teal-700">₹{breakdown.finalAmount}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center pt-2">
              <Link
                to="/parent/bookings"
                className="w-full sm:w-auto px-6 py-3 rounded-xl btn-3d-primary font-bold text-xs uppercase tracking-wider"
              >
                Go to My Bookings
              </Link>
              <button
                type="button"
                onClick={() => setSubmissionSuccess(false)}
                className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs"
              >
                Submit Updated Reference
              </button>
            </div>
          </div>
        ) : (
          /* Main 2-Column Checkout Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Payment Methods & UPI Scanner (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Payment Method Selector */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md card-3d p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                    1. Select Payment Method
                  </h3>
                  <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                    Online Only Active
                  </span>
                </div>

                <div className="space-y-3">
                  {/* OPTION 1: ONLINE PAYMENT (ENABLED) */}
                  <label
                    className={`block p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedMethod === 'online_upi'
                        ? 'border-teal-600 bg-teal-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="online_upi"
                          checked={selectedMethod === 'online_upi'}
                          onChange={() => setSelectedMethod('online_upi')}
                          className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                        />
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                            <span>Online Payment (UPI / QR Code)</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                              INSTANT SCAN
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Pay securely using PhonePe, Google Pay, Paytm, BHIM, or any UPI app.
                          </p>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <QrCode className="w-4 h-4" />
                      </div>
                    </div>
                  </label>

                  {/* OPTION 2: CASH PAYMENT (DISABLED / COMING SOON) */}
                  <div className="p-4 rounded-2xl border-2 border-slate-200/60 bg-slate-50/80 opacity-75 cursor-not-allowed select-none">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cash"
                          disabled
                          checked={false}
                          className="w-4 h-4 text-slate-400 cursor-not-allowed"
                        />
                        <div>
                          <div className="font-bold text-slate-500 text-sm flex items-center gap-2">
                            <span>Cash Payment (In-Person)</span>
                            <span className="text-[10px] bg-slate-200 text-slate-600 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Ban className="w-3 h-3 text-slate-500" />
                              Currently Unavailable
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Cash payment is not accepted for this booking. All sessions require online confirmation.
                          </p>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                        <CreditCard className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* UPI QR Code & UTR Submission Form */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md card-3d p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                    2. Scan QR & Enter Reference (UTR)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {upiDetails.paymentInstructions || 'Scan the UPI QR code below and transfer the exact total amount.'}
                  </p>
                </div>

                {/* QR Code Presentation Box */}
                <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white rounded-2xl p-5 text-center space-y-4 shadow-md">
                  <div className="inline-block bg-white p-3 rounded-2xl shadow-lg border-2 border-white/20">
                    <img
                      src={qrDisplayUrl}
                      alt="Merchant UPI QR Code"
                      className="w-56 h-56 object-contain mx-auto rounded-lg"
                      onError={(e) => {
                        // Fallback to dynamic QR generator if image fails to load
                        e.target.onerror = null;
                        const vpa = upiDetails.vpa || 'singhsonu883661@ybl';
                        e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=${vpa}&pn=${encodeURIComponent(upiDetails.payeeName || 'ShikshaLink Education')}&am=${breakdown.finalAmount}&cu=INR`;
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-teal-400 font-bold uppercase tracking-wider">
                      Payee: {upiDetails.payeeName || 'ShikshaLink Education'}
                    </div>
                    <div className="text-lg font-black text-white">
                      Pay Exact Amount: ₹{breakdown.finalAmount}
                    </div>
                  </div>

                  {/* UPI VPA Copy Bar */}
                  <div className="flex items-center justify-between bg-slate-950/70 border border-slate-700/80 rounded-xl p-2.5 max-w-sm mx-auto">
                    <span className="font-mono text-xs text-slate-200 font-bold truncate pl-1">
                      {upiDetails.vpa || 'singhsonu883661@ybl'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyVpa}
                      className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shrink-0"
                    >
                      {copiedVpa ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedVpa ? 'Copied' : 'Copy UPI ID'}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Compatible with PhonePe • Google Pay • Paytm • BHIM • CRED • All Banks
                  </p>
                </div>

                {/* Form to Enter UTR and Upload Receipt */}
                <form onSubmit={handleSubmitUpi} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                      UPI Reference Number / UTR <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.trim())}
                      placeholder="e.g. 430129847192 (12-digit transaction ID)"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Found in your UPI app under payment transaction details (usually labeled UTR, UPI Ref ID, or Txn ID).
                    </p>
                  </div>

                  {/* Optional Screenshot Upload */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                      Payment Screenshot (Optional)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="px-4 py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-teal-500 bg-slate-50 hover:bg-teal-50/30 text-slate-700 text-xs font-bold cursor-pointer flex items-center gap-2 transition-colors">
                        <Upload className="w-4 h-4 text-slate-400" />
                        <span>{receiptFile ? 'Change Screenshot' : 'Upload Receipt Screenshot'}</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      {receiptFile && (
                        <span className="text-xs text-slate-600 truncate max-w-xs font-medium">
                          {receiptFile.name}
                        </span>
                      )}
                    </div>
                    {receiptPreview && (
                      <div className="mt-2 w-28 h-28 rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                        <img src={receiptPreview} alt="Receipt preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 rounded-xl btn-3d-primary font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Submitting for Verification...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Submit Payment for Verification</span>
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
                      <Info className="w-3.5 h-3.5 text-slate-400" />
                      Payment is held securely in platform escrow until admin confirms transaction.
                    </p>
                  </div>
                </form>
              </div>
            </div>

            {/* RIGHT COLUMN: Order Summary & Itemized Breakdown (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Tutor & Session Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md card-3d p-6 space-y-4">
                <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider">
                  Tuition Session Overview
                </span>

                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white font-black text-xl flex items-center justify-center uppercase shadow-md overflow-hidden shrink-0">
                    {tutor.avatar ? (
                      <img src={tutor.avatar} alt={tutor.name} className="w-full h-full object-cover" />
                    ) : (
                      tutor.name[0]
                    )}
                  </div>
                  <div className="truncate">
                    <h4 className="font-extrabold text-slate-900 text-base truncate">{tutor.name}</h4>
                    <p className="text-xs text-slate-500 truncate">{tutor.headline}</p>
                    <p className="text-[11px] text-teal-700 font-bold mt-0.5">{tutor.city} • {tutor.primaryLocality}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Subject & Class:</span>
                    <strong className="text-slate-900 font-bold">{booking.subject} ({booking.classGrade})</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Teaching Mode:</span>
                    <span className="font-semibold text-slate-800 capitalize">{booking.teachingMode.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Scheduled Date:</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(booking.schedule.sessionDate).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Time Slot:</span>
                    <span className="font-semibold text-slate-800">{booking.schedule.startTime} – {booking.schedule.endTime}</span>
                  </div>
                  {child && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Student:</span>
                      <span className="font-semibold text-slate-800">{child.fullName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Itemized Fee Breakdown Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md card-3d p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Transparent Charge Breakdown
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
                    INR (₹)
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-slate-700">
                    <span>Tutor Tuition Fee ({booking.schedule.durationHours || 1} hr):</span>
                    <span className="font-bold">₹{breakdown.baseTutorFee}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <span>Platform Convenience Fee</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({breakdown.platformFeeType === 'fixed' ? `₹${breakdown.platformFeeValue} flat` : `${breakdown.platformFeeValue}%`})
                      </span>
                    </span>
                    <span className="font-semibold">₹{breakdown.platformFee}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500">
                    <span>Applicable Taxes (18% GST on Fee):</span>
                    <span>₹{breakdown.taxes}</span>
                  </div>

                  {breakdown.travelCharge > 0 && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Home Tuition Travel Allowance:</span>
                      <span className="font-semibold">₹{breakdown.travelCharge}</span>
                    </div>
                  )}

                  {breakdown.discount > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 font-bold">
                      <span>Promotional Discount:</span>
                      <span>-₹{breakdown.discount}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-black text-slate-900">Total Payable Amount</div>
                      <div className="text-[10px] text-slate-400">All fees & taxes included</div>
                    </div>
                    <div className="text-2xl font-black text-teal-700">
                      ₹{breakdown.finalAmount}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                  <button
                    type="button"
                    onClick={() => setShowPolicyModal(true)}
                    className="text-teal-600 hover:underline font-bold"
                  >
                    View Cancellation & Refund Policy →
                  </button>
                  <p className="text-[10px] text-slate-400">
                    100% money-back guarantee if the tutor does not attend the scheduled session.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancellation Policy Modal */}
        {showPolicyModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-sm">Cancellation & Refund Policy</h3>
                <button
                  type="button"
                  onClick={() => setShowPolicyModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-slate-600 leading-relaxed max-h-80 overflow-y-auto">
                <p>
                  <strong>Session Rescheduling:</strong> Sessions can be rescheduled up to 4 hours before the agreed start time without any cancellation fees.
                </p>
                <p>
                  <strong>Parent Cancellations:</strong> If you cancel more than 4 hours in advance, a full refund of the tutor fee is credited back to your original source. Platform fees cover matchmaking and verification services.
                </p>
                <p>
                  <strong>Tutor Non-Attendance:</strong> If the tutor fails to show up or cancels the session, you receive an immediate 100% full refund including all fees.
                </p>
                <p>
                  <strong>Escrow Security:</strong> All parent funds remain held securely in platform escrow and are disbursed to tutors only after successful class completion.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPolicyModal(false)}
                className="w-full py-2.5 rounded-xl btn-3d-primary font-bold text-xs"
              >
                Understood & Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
