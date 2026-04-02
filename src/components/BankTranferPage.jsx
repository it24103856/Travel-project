import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCloudUploadAlt, FaChevronLeft, FaHashtag } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { uploadFile } from '../utils/meadiaUpload.js';

// ─── Fallback unique ID (if user leaves field empty) ──────────────────────────
const generateFallbackId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random    = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BT-${timestamp}-${random}`;
};

const BankTransferPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { amount, bookingId } = location.state || { amount: 0, bookingId: "N/A" };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [preview,      setPreview]      = useState(null);
    const [receiptFile,  setReceiptFile]  = useState(null);

    const [formData, setFormData] = useState({
        customerName:  '',
        country:       '',
        bankName:      '',
        branch:        '',
        paymentDate:   '',
        paidAmount:    amount,
        transactionId: '',   // ← new field
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
        if (!formData.bankName || !formData.branch) {
            return toast.error("Please fill in all bank details!");
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading("Uploading your receipt...");

        try {
            const publicUrl = await uploadFile(receiptFile);
            toast.loading("AI is verifying your transaction...", { id: loadingToast });

            // User දුන්නොත් ඒක use කරනවා, නැත්නම් auto-generate
            const finalTransactionId = formData.transactionId.trim() || generateFallbackId();

            const submissionData = {
                bookingId,
                amount,
                paymentMethod: "bank_transfer",
                receiptUrl:    publicUrl,
                transactionId: finalTransactionId,
                paymentDetails: {
                    customerName: formData.customerName,
                    country:      formData.country,
                    bankName:     formData.bankName,
                    branch:       formData.branch,
                    paymentDate:  formData.paymentDate,
                    paidAmount:   Number(formData.paidAmount) || amount,
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

            if (data.success) {
                toast.success(data.aiNote || "Payment submitted successfully!", { id: loadingToast, duration: 5000 });
                setTimeout(() => navigate('/my-payments'), 2500);
            }
        } catch (error) {
            console.error("Payment Error:", error.response?.data);
            const errorMsg = error.response?.data?.message || "Internal Server Error (500)";
            toast.error(errorMsg, { id: loadingToast, duration: 6000 });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center font-sans">
            <Toaster position="top-center" />
            <div className="max-w-3xl w-full">

                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm mb-6 transition-colors"
                >
                    <FaChevronLeft /> Back
                </button>

                <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">

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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input name="customerName" placeholder="Full Name" required
                                    onChange={handleInputChange}
                                    className="p-4 bg-slate-50 rounded-2xl border outline-none focus:ring-2 focus:ring-blue-400 transition-all" />
                                <input name="country" placeholder="Country" required
                                    onChange={handleInputChange}
                                    className="p-4 bg-slate-50 rounded-2xl border outline-none focus:ring-2 focus:ring-blue-400 transition-all" />
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-3">Bank Details</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input name="bankName" placeholder="Bank Name" required
                                    onChange={handleInputChange}
                                    className="p-4 bg-slate-50 rounded-2xl border outline-none focus:ring-2 focus:ring-blue-400 transition-all" />
                                <input name="branch" placeholder="Branch Name" required
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
                                    placeholder="Bank reference / transaction ID (optional)"
                                    value={formData.transactionId}
                                    onChange={handleInputChange}
                                    className="flex-1 py-4 bg-transparent outline-none text-slate-700 font-semibold placeholder:text-slate-400 placeholder:font-normal uppercase"
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 ml-2 leading-relaxed">
                                Bank slip හෝ bank app එකේ ඇති Reference / Transaction ID ඇතුළු කරන්න. 
                                Empty ලෙස ගියොත් auto-generate වේ.
                            </p>
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
                                            <img src={preview} className="h-48 rounded-2xl mb-3 mx-auto shadow-2xl border-4 border-white" alt="Preview" />
                                            <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">✅</div>
                                        </div>
                                        <br />
                                        <button
                                            type="button"
                                            onClick={() => { setPreview(null); setReceiptFile(null); }}
                                            className="text-red-500 text-[10px] font-black uppercase hover:underline tracking-widest mt-2"
                                        >
                                            Remove & Replace
                                        </button>
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