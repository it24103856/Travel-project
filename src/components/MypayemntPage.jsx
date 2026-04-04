import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  FaClock, FaCheckCircle, FaTimesCircle, FaInfoCircle,
  FaEye, FaTimes, FaReceipt, FaUniversity, FaCalendarAlt,
  FaFingerprint, FaUndoAlt
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

const MyPayments = () => {
  const [payments, setPayments]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTarget, setCancelTarget]       = useState(null);
  const [cancelReason, setCancelReason]       = useState("");
  const [cancelLoading, setCancelLoading]     = useState(false);

  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchMyPayments = async () => {
    try {
      const { data } = await axios.get(`${API}/payments/my-payments`, { headers });
      if (data.success) setPayments(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "ගෙවීම් දත්ත ලබා ගැනීමට නොහැකි විය.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyPayments(); }, []);

  // ── Cancel request submit ────────────────────────────────────────────────
  const handleCancelRequest = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      const { data } = await axios.post(
        `${API}/payments/request-cancel`,
        { paymentId: cancelTarget._id, reason: cancelReason || "Customer requested cancellation." },
        { headers }
      );
      if (data.success) {
        toast.success("Cancel request submitted!");
        setShowCancelModal(false);
        setCancelReason("");
        setCancelTarget(null);
        fetchMyPayments(); // refresh list
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Request failed.");
    } finally {
      setCancelLoading(false);
    }
  };

  // ── Status styles ────────────────────────────────────────────────────────
  const getStatusDetails = (status) => {
    switch (status) {
      case "completed":
        return { color: "text-emerald-700", bg: "bg-emerald-100/50", border: "border-emerald-200", icon: <FaCheckCircle />, label: "Completed" };
      case "processing":
        return { color: "text-blue-700",    bg: "bg-blue-100/50",    border: "border-blue-200",    icon: <FaClock />,        label: "Processing" };
      case "cancel_requested":
        return { color: "text-orange-700",  bg: "bg-orange-100/50",  border: "border-orange-200",  icon: <FaInfoCircle />,   label: "Pending Cancel" };
      case "refunded":
        return { color: "text-purple-700",  bg: "bg-purple-100/50",  border: "border-purple-200",  icon: <FaUndoAlt />,      label: "Refunded" };
      case "failed":
        return { color: "text-rose-700",    bg: "bg-rose-100/50",    border: "border-rose-200",    icon: <FaTimesCircle />,  label: "Failed" };
      default:
        return { color: "text-slate-700",   bg: "bg-slate-100/50",   border: "border-slate-200",   icon: <FaClock />,        label: "Pending" };
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Syncing transactions...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto mt-28 mb-20 px-4 md:px-8 font-poppins min-h-screen">
      <Toaster />

      {/* Header */}
      <div className="relative mb-14">
        <div className="absolute -left-4 top-0 w-1 h-full bg-cyan-500 rounded-full" />
        <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-none">Transactions</h2>
        <p className="text-slate-500 text-sm mt-3 font-medium flex items-center gap-2">
          <span className="w-8 h-[1px] bg-slate-200" />
          Keep track of your bookings and payment status
        </p>
      </div>

      {payments.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-100 shadow-sm"
        >
          <FaReceipt className="text-5xl text-slate-200 mx-auto mb-6" />
          <p className="text-slate-400 font-bold text-lg italic">No financial history available.</p>
        </motion.div>
      ) : (
        <div className="grid gap-6">
          {payments.map((payment, index) => {
            const statusStyle = getStatusDetails(payment.paymentStatus);
            const canRequestCancel = payment.paymentStatus === "completed";

            return (
              <motion.div
                key={payment._id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                className="group relative bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-cyan-50/50 transition-all duration-500"
              >
                {/* Status bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${statusStyle.bg.replace('/50', '')}`} />

                <div className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center gap-8">

                  {/* Amount */}
                  <div className="flex-shrink-0 min-w-[180px]">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Amount Paid</span>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-4xl font-black text-slate-900 tracking-tighter">
                        {payment.amount.toLocaleString()}
                      </h3>
                      <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded uppercase">
                        {payment.currency}
                      </span>
                    </div>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 flex-grow">
                    <div className="space-y-1">
                      <p className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <FaFingerprint className="text-cyan-500" /> Booking Ref
                      </p>
                      <p className="text-sm font-mono font-bold text-slate-700 truncate max-w-[120px]">
                        #{payment.bookingId?.toString().slice(-8)}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <FaCalendarAlt className="text-cyan-500" /> Date
                      </p>
                      <p className="text-sm font-bold text-slate-700">
                        {new Date(payment.createdAt).toLocaleDateString("en-GB")}
                      </p>
                    </div>

                    <div className="space-y-1 col-span-2 md:col-span-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Status</p>
                      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-[10px] border tracking-widest uppercase ${statusStyle.color} ${statusStyle.bg} ${statusStyle.border}`}>
                        <span className="animate-pulse">{statusStyle.icon}</span>
                        {statusStyle.label}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="lg:ml-auto flex flex-col sm:flex-row gap-3 w-full lg:w-auto">

                    {/* ── Refund Request Button — completed payments ONLY ── */}
                    {canRequestCancel && (
                      <button
                        onClick={() => { setCancelTarget(payment); setShowCancelModal(true); }}
                        className="flex items-center justify-center gap-2 bg-rose-50 text-rose-600 border border-rose-200 px-6 py-4 rounded-2xl hover:bg-rose-600 hover:text-white transition-all duration-300 text-xs font-bold active:scale-95"
                      >
                        <FaUndoAlt /> REQUEST REFUND
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedPayment(payment)}
                      className="flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl hover:bg-cyan-600 transition-all duration-300 shadow-lg shadow-slate-200 text-xs font-bold active:scale-95 group-hover:-translate-y-1"
                    >
                      <FaEye className="text-sm" /> VIEW SUMMARY
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Cancel/Refund Request Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showCancelModal && cancelTarget && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white"
            >
              <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">Request Refund</h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Amount: <span className="text-rose-600 font-black">{cancelTarget.amount.toLocaleString()} {cancelTarget.currency}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => { setShowCancelModal(false); setCancelReason(""); }}
                    className="p-3 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-colors"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>

                {/* Warning box */}
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6 flex gap-3">
                  <FaInfoCircle className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-800 leading-relaxed font-medium">
                    Refund request එකක් submit කළාම admin verify කරලා approve කරනවා. Approved වුනාම booking cancel වෙයි.
                  </p>
                </div>

                {/* Reason input */}
                <div className="mb-6">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                    Reason (Optional)
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Why are you requesting a refund?"
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-200 resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowCancelModal(false); setCancelReason(""); }}
                    className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCancelRequest}
                    disabled={cancelLoading}
                    className="flex-1 py-4 rounded-2xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {cancelLoading ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <><FaUndoAlt /> Submit Request</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Payment Summary Modal ───────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedPayment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-white"
            >
              {/* Header */}
              <div className="p-8 pb-0 flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black text-slate-800">Payment Receipt</h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">Transaction ID: {selectedPayment._id}</p>
                </div>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="p-3 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-colors"
                >
                  <FaTimes size={16} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {/* Amount highlight */}
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Net Payment</p>
                  <p className="text-5xl font-black text-slate-900 tracking-tighter">
                    {selectedPayment.amount.toLocaleString()}{" "}
                    <span className="text-lg font-bold text-slate-400">{selectedPayment.currency}</span>
                  </p>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 gap-4">
                  {selectedPayment.paymentDetails && (
                    <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl">
                      <div className="w-10 h-10 bg-cyan-50 rounded-full flex items-center justify-center text-cyan-500">
                        <FaUniversity />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Bank/Branch</p>
                        <p className="text-sm font-bold text-slate-700">
                          {selectedPayment.paymentDetails.bankName}
                          {selectedPayment.paymentDetails.branch ? ` - ${selectedPayment.paymentDetails.branch}` : ""}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                      <FaReceipt />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Payment Method</p>
                      <p className="text-sm font-bold text-slate-700 capitalize">
                        {selectedPayment.paymentMethod?.replace("_", " ")}
                      </p>
                    </div>
                  </div>

                  {/* Status in modal */}
                  <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusDetails(selectedPayment.paymentStatus).bg}`}>
                      <span className={getStatusDetails(selectedPayment.paymentStatus).color}>
                        {getStatusDetails(selectedPayment.paymentStatus).icon}
                      </span>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Status</p>
                      <p className={`text-sm font-bold ${getStatusDetails(selectedPayment.paymentStatus).color}`}>
                        {getStatusDetails(selectedPayment.paymentStatus).label}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Receipt link */}
                {selectedPayment.receiptUrl ? (
                  <a
                    href={selectedPayment.receiptUrl} target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-3 w-full py-5 bg-cyan-600 text-white rounded-[1.5rem] font-bold shadow-lg shadow-cyan-200 hover:bg-cyan-700 transition-all text-sm"
                  >
                    <FaEye /> View Digital Document
                  </a>
                ) : (
                  <p className="text-center text-xs text-slate-400 italic">Proof of payment not uploaded.</p>
                )}

                {/* Admin notes */}
                {selectedPayment.metadata?.adminNotes && (
                  <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                    <FaInfoCircle className="text-amber-500 mt-1 flex-shrink-0" />
                    <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                      "{selectedPayment.metadata.adminNotes}"
                    </p>
                  </div>
                )}

                {/* Cancel reason (if requested) */}
                {selectedPayment.metadata?.cancelReason && (
                  <div className="p-5 bg-rose-50 rounded-2xl border border-rose-100 flex gap-3">
                    <FaUndoAlt className="text-rose-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-[9px] font-bold text-rose-400 uppercase mb-1">Refund Reason</p>
                      <p className="text-[11px] text-rose-900 leading-relaxed font-medium">
                        {selectedPayment.metadata.cancelReason}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyPayments;