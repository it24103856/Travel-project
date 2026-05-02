import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCloudUploadAlt, FaChevronLeft, FaHashtag } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { uploadFile } from '../utils/meadiaUpload.js';

const BankTransferPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { amount, bookingId } = location.state || { amount: 0, bookingId: "N/A" };
    const today = new Date();
    const todayDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [preview,      setPreview]      = useState(null);
    const [receiptFile,  setReceiptFile]  = useState(null);
    const [isImageOpen,  setIsImageOpen]  = useState(false);

    // ── Verification Status States ──
    const [verificationStatus, setVerificationStatus] = useState(null); // 'verifying', 'success', 'duplicate', 'failed', null
    const [showStatusBox, setShowStatusBox] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [failedTransactionId, setFailedTransactionId] = useState('');

    // Hardcoded remark for verification
    const HARDCODED_REMARK = "bodima";

    const [formData, setFormData] = useState({
        customerName:  '',
        country:       '',
        bankName:      '',
        branch:        '',
        paymentDate:   '',
        paidAmount:    amount,
        transactionId: '',   
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size <= 2 * 1024 * 1024) {
            setReceiptFile(file);
            setPreview(URL.createObjectURL(file));
        } else {
            toast.error("File is too large! (Max 2MB)");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!receiptFile) return toast.error("Please upload the receipt!");
        if (!formData.bankName) {
            return toast.error("Please fill in all bank details!");
        }
        if (!formData.paymentDate) {
            return toast.error("Please select the transfer date!");
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading("Uploading your receipt...");

        try {
            const trimmedTxId = formData.transactionId.trim();
            if (!trimmedTxId) {
                return toast.error("Please enter your transaction ID!");
            }
            if (trimmedTxId.length < 5) {
                return toast.error("Transaction ID must be at least 5 characters long!");
            }

            const publicUrl = await uploadFile(receiptFile);
            
            // ── Show AI Verification Progress Box ──
            setVerificationStatus('verifying');
            setShowStatusBox(true);
            toast.dismiss(loadingToast);

            const finalTransactionId = formData.transactionId.trim();

            const submissionData = {
                bookingId,
                amount,
                paymentMethod: "bank_transfer",
                receiptUrl:    publicUrl,
                transactionId: finalTransactionId,
                expectedRemark: HARDCODED_REMARK,  // AI will scan receipt for this remark
                paymentDetails: {
                    customerName: formData.customerName,
                    bankName:     formData.bankName,
                    paymentDate:  formData.paymentDate,
                    paidAmount:   Number(formData.paidAmount) || amount,
                    currency:     "LKR",
                    remark:       HARDCODED_REMARK,
                },
            };

            const config = {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            };

            const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";
            const { data }   = await axios.post(`${backendUrl}/payments/create`, submissionData, config);

            // ── Handle Different Verification Responses ──
            if (data.isDuplicate) {
                setVerificationStatus('duplicate');
                setFailedTransactionId(finalTransactionId);
                setStatusMessage(data.message || "Duplicate Transaction ID detected!");
            } else if (data.verificationPassed) {
                // ✅ AI Verification PASSED - Show green success box
                setVerificationStatus('success');
                setStatusMessage(data.aiNote || "Payment Verified Successfully!");
                // Auto redirect after 3 seconds
                setTimeout(() => navigate('/my-payments'), 3000);
            } else if (data.success && !data.verificationPassed) {
                // ❌ AI Verification FAILED - Show red failed box
                setVerificationStatus('failed');
                setStatusMessage(data.aiNote || "Payment verification failed - Manual review required");
            } else {
                setVerificationStatus('failed');
                setStatusMessage(data.message || "Verification Error - Please contact support");
            }
        } catch (error) {
            console.error("Payment Error:", error.response?.data);
            const errorData = error.response?.data;
            
            // ── Handle Different Error Types ──
            if (errorData?.isDuplicate || errorData?.message?.includes('duplicate')) {
                setVerificationStatus('duplicate');
                setFailedTransactionId(formData.transactionId);
                setStatusMessage(errorData?.message || "This Transaction ID already exists!");
            } else if (errorData?.verificationPassed === false) {
                setVerificationStatus('failed');
                setStatusMessage(errorData?.aiNote || "AI Verification Failed - Manual Verification Required");
            } else {
                setVerificationStatus('failed');
                setStatusMessage(errorData?.message || "Internal Server Error (500)");
            }
            setShowStatusBox(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f1ebe3] py-30 px-4 flex items-center justify-center font-sans">
            <Toaster position="top-center" />

            {/* ── Status Box Modal ── */}
            {showStatusBox && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    {/* ── VERIFYING STATUS ── */}
                    {verificationStatus === 'verifying' && (
                        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center animate-pulse">
                            <div className="flex justify-center mb-6">
                                <svg className="animate-spin h-16 w-16 text-blue-600" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-2">AI Verification In Progress</h2>
                            <p className="text-slate-500 text-sm mb-6">Please wait while we verify your payment...</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                                This may take a few seconds
                            </p>
                        </div>
                    )}

                    {/* ── SUCCESS STATUS ── */}
                    {verificationStatus === 'success' && (
                        <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-3xl shadow-2xl max-w-md w-full p-8 text-center border-2 border-green-300">
                            <div className="flex justify-center mb-6">
                                <div className="bg-green-500 rounded-full p-4 animate-bounce">
                                    <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <h2 className="text-2xl font-black text-green-700 mb-2">Payment Verified!</h2>
                            <p className="text-slate-600 text-sm mb-2">{statusMessage}</p>
                            <div className="bg-white rounded-2xl p-4 mb-6 text-left space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Booking ID:</span>
                                    <span className="font-bold text-slate-700">{bookingId}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Amount:</span>
                                    <span className="font-bold text-green-600">{amount.toLocaleString()} LKR</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Status:</span>
                                    <span className="font-bold text-green-600">✓ Verified</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                                Redirecting to payment history...
                            </p>
                        </div>
                    )}

                    {/* ── DUPLICATE TRANSACTION ID ── */}
                    {verificationStatus === 'duplicate' && (
                        <div className="bg-linear-to-br from-orange-50 to-red-50 rounded-3xl shadow-2xl max-w-md w-full p-8 text-center border-2 border-orange-300">
                            <div className="flex justify-center mb-6">
                                <div className="bg-orange-500 rounded-full p-4">
                                    <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 0v2m0-4h2m0-2h2m0 2h-2" />
                                    </svg>
                                </div>
                            </div>
                            <h2 className="text-2xl font-black text-orange-700 mb-2">Duplicate Transaction ID</h2>
                            <p className="text-slate-600 text-sm mb-4">{statusMessage}</p>
                            <div className="bg-white rounded-2xl p-4 mb-6 border-2 border-orange-200">
                                <p className="text-xs text-slate-500 mb-2 uppercase font-bold">Transaction ID:</p>
                                <p className="text-lg font-black text-orange-600 break-all">{failedTransactionId}</p>
                            </div>
                            <p className="text-sm text-slate-600 mb-6">
                                This Transaction ID is already registered. Please use a different ID.
                            </p>
                            <button
                                onClick={() => {
                                    setShowStatusBox(false);
                                    setVerificationStatus(null);
                                    setFailedTransactionId('');
                                }}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-3 rounded-2xl uppercase tracking-wide transition-all"
                            >
                                Try Again with Different ID
                            </button>
                        </div>
                    )}

                    {/* ── VERIFICATION FAILED ── */}
                    {verificationStatus === 'failed' && (
                        <div className="bg-linear-to-br from-red-50 to-pink-50 rounded-3xl shadow-2xl max-w-md w-full p-8 text-center border-2 border-red-300">
                            <div className="flex justify-center mb-6">
                                <div className="bg-red-500 rounded-full p-4">
                                    <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            </div>
                            <h2 className="text-2xl font-black text-red-700 mb-2">Verification Failed</h2>
                            <p className="text-slate-600 text-sm mb-6">{statusMessage}</p>
                            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-4 mb-6">
                                <p className="text-sm text-yellow-800 font-semibold">
                                    🔍 Manual verification required. Our team will review your payment manually.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        setShowStatusBox(false);
                                        setVerificationStatus(null);
                                        navigate('/my-payments');
                                    }}
                                    className="w-full bg-slate-700 hover:bg-slate-800 text-white font-black py-3 rounded-2xl uppercase tracking-wide transition-all"
                                >
                                    Go to Payment History
                                </button>
                                <button
                                    onClick={() => {
                                        setShowStatusBox(false);
                                        setVerificationStatus(null);
                                    }}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-2xl uppercase tracking-wide transition-all"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="max-w-3xl w-full">

                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm mb-6 transition-colors"
                >
                    <FaChevronLeft /> Back
                </button>

                <div className="bg-[#f7f3f0] rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">

                    {/* ── Header ── */}
                    <div className="bg-blue-600 p-8 text-white flex justify-between items-center shadow-lg">
                        <div>
                            <h1 className="text-xl font-bold uppercase tracking-tight">Bank Transfer</h1>
                            <p className="text-xs opacity-80 italic">Booking Reference: {bookingId}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-black">{amount.toLocaleString()} LKR</span>
                            <p className="text-[10px] uppercase font-bold opacity-70">Total Payable</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">

                        {/* ── Personal + Bank fields ── */}
                        <div>
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-3">Personal Details</p>
                            <input name="customerName" placeholder="Full Name (match receipt name exactly, ignoring dots/spaces/case)" required
                                onChange={handleInputChange}
                                className="w-full p-4 bg-slate-50 rounded-2xl border outline-none focus:ring-2 focus:ring-blue-400 transition-all" />
                        </div>

                        <div>
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-3">Bank Details</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input name="bankName" placeholder="Bank Name" required
                                    onChange={handleInputChange}
                                    className="p-4 bg-slate-50 rounded-2xl border outline-none focus:ring-2 focus:ring-blue-400 transition-all" />

                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Transfer Date</label>
                                    <input name="paymentDate" type="date" required
                                        onChange={handleInputChange}
                                        className="p-4 bg-slate-50 rounded-2xl border outline-none focus:ring-2 focus:ring-blue-400 transition-all w-full" />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Paid Amount (LKR)</label>
                                    <input name="paidAmount" type="number" defaultValue={amount} required
                                        onChange={handleInputChange}
                                        className="p-4 bg-slate-50 rounded-2xl border outline-none focus:ring-2 focus:ring-blue-400 font-bold text-blue-600 transition-all" />
                                </div>
                            </div>
                        </div>

                        {/* ── Transaction ID field ── */}
                        <div>
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-3">
                                Transaction Reference
                            </p>
                            <div className="flex items-center gap-3 bg-blue-50 border-2 border-blue-200 rounded-2xl px-4 focus-within:border-blue-500 focus-within:bg-white transition-all">
                                <FaHashtag className="text-blue-400 text-lg shrink-0" />
                                <input
                                    name="transactionId"
                                    placeholder="Bank reference / transaction ID"
                                    value={formData.transactionId}
                                    onChange={handleInputChange}
                                    required
                                    className="flex-1 py-4 bg-transparent outline-none text-slate-700 font-semibold placeholder:text-slate-400 placeholder:font-normal uppercase"
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 ml-2 leading-relaxed">
                                Bank slip හෝ bank app  Reference / Transaction ID 
                            </p>
                        </div>

                        {/* ── Payment Details Section ── */}
                        <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-3xl p-6 border-2 border-blue-200 shadow-md">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">📋 Payment Details</p>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-white rounded-2xl p-4 shadow-sm">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Bank Name</span>
                                    <span className="text-sm font-black text-slate-800">BOC</span>
                                </div>
                                <div className="flex justify-between items-center bg-white rounded-2xl p-4 shadow-sm">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Bank Number</span>
                                    <span className="text-sm font-black text-blue-600 tracking-wider">92269156</span>
                                </div>
                                <div className="flex justify-between items-center bg-white rounded-2xl p-4 shadow-sm">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Account Holder</span>
                                    <span className="text-sm font-black text-slate-800">Abeykoon.KM</span>
                                </div>
                                <div className="flex justify-between items-center bg-white rounded-2xl p-4 shadow-sm">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Remark</span>
                                    <span className="text-sm font-black text-green-600">Cabs Guide</span>
                                </div>
                            </div>
                        </div>

                        {/* ── Receipt Upload ── */}
                        <div>
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-3">Payment Receipt</p>
                            <div className="flex flex-col items-center p-8 border-2 border-dashed border-blue-200 rounded-3xl bg-blue-50/30 hover:bg-blue-50 transition-colors">
                                {!preview ? (
                                    <label className="cursor-pointer text-center w-full">
                                        <FaCloudUploadAlt className="text-5xl text-blue-500 mx-auto animate-bounce" />
                                        <span className="text-sm font-black block mt-3 text-slate-600 uppercase tracking-wide">
                                            Upload Receipt Slip
                                        </span>
                                        <p className="text-[10px] text-slate-400 mt-1">PNG, JPG up to 2MB</p>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                ) : (
                                    <div className="text-center w-full">
                                        <div className="relative inline-block">
                                            <img
                                                src={preview}
                                                onClick={() => setIsImageOpen(true)}
                                                className="h-48 rounded-2xl mb-3 mx-auto shadow-2xl border-4 border-white cursor-pointer"
                                                alt="Preview"
                                            />
                                            <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">✅</div>
                                        </div>
                                        <div className="mt-2 flex items-center justify-center gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setIsImageOpen(true)}
                                                className="bg-slate-900 text-white px-4 py-2 rounded-2xl font-bold text-sm hover:opacity-90"
                                            >
                                                View Receipt
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setPreview(null); setReceiptFile(null); }}
                                                className="text-red-500 text-[10px] font-black uppercase hover:underline tracking-widest"
                                            >
                                                Remove & Replace
                                            </button>
                                        </div>

                                        {isImageOpen && (
                                            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                                                <div className="max-w-3xl w-full">
                                                    <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                                                        <div className="p-4 flex justify-end">
                                                            <button onClick={() => setIsImageOpen(false)} className="text-gray-600 font-bold text-2xl">×</button>
                                                        </div>
                                                        <div className="p-4">
                                                            <img src={preview} alt="Receipt full" className="w-full h-auto rounded-xl" />
                                                        </div>
                                                        <div className="p-4">
                                                            <a href={preview} target="_blank" rel="noreferrer" className="block w-full text-center bg-slate-900 text-white py-3 rounded-2xl font-bold">Open in new tab</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Submit ── */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-5 rounded-2xl font-black transition-all shadow-xl uppercase tracking-[0.2em] text-sm
                                ${isSubmitting
                                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                    : 'bg-slate-900 text-white hover:bg-blue-700 active:scale-95'
                                }`}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Verifying...
                                </span>
                            ) : 'Confirm & Submit Payment'}
                        </button>

                    </form>
                </div>

                <p className="text-center text-[10px] text-slate-400 mt-8 uppercase tracking-widest font-bold">
                    Secure AI Powered Verification System
                </p>
            </div>
        </div>
    );
};

export default BankTransferPage;