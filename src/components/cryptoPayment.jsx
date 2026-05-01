import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Copy, Check, Bitcoin, Zap, ShieldCheck, TrendingUp, Send, AlertCircle, ScanLine, Sparkles, Clock3, ArrowRightLeft, BadgeCheck, TriangleAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const CryptoPayment = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Get data from location state
    const bookingId = location.state?.bookingId;
    const amount = location.state?.amount;
    const currency = location.state?.currency || 'LKR';

    const [copied, setCopied] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    const [transactionError, setTransactionError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('bitcoin');

    const bookingAmount = Number(amount);

    // Security check: If no data, redirect back
    if (!bookingId || !Number.isFinite(bookingAmount) || bookingAmount <= 0) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-linear-to-br from-amber-50 via-white to-sky-50">
                <div className="max-w-md w-full rounded-4xl border border-slate-200 bg-white p-8 text-center text-slate-900 shadow-2xl shadow-slate-200/60">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">
                        <TriangleAlert size={30} />
                    </div>
                    <h2 className="text-2xl font-black">Session expired</h2>
                    <p className="mt-3 text-sm text-slate-600">
                        The crypto payment session is missing booking details or the amount is invalid.
                    </p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 font-bold text-white transition hover:scale-[1.01]"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const cryptoWallets = {
        bitcoin: {
            address: '1A1z7agoat2YLZW51Uc8w6LFCHF7PhmQqe',
            name: 'Bitcoin',
            symbol: 'BTC',
            color: 'from-amber-500 via-orange-500 to-rose-500',
            icon: Bitcoin,
            txPattern: /^[A-Fa-f0-9]{64}$/,
            txHint: '64 hexadecimal characters',
            network: 'Bitcoin network'
        },
        ethereum: {
            address: '0x742d35Cc6634C0532925a3b844Bc9e7595f42e1',
            name: 'Ethereum',
            symbol: 'ETH',
            color: 'from-cyan-500 via-blue-500 to-indigo-600',
            icon: Zap,
            txPattern: /^0x[a-fA-F0-9]{64}$/,
            txHint: '0x followed by 64 hexadecimal characters',
            network: 'Ethereum network'
        }
    };

    const currentWallet = cryptoWallets[activeTab];
    const currentWalletLabel = `${currentWallet.name} (${currentWallet.symbol})`;
    const qrCodeUrl = useMemo(
        () => `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(currentWallet.address)}`,
        [currentWallet.address]
    );

    const validateTransaction = (value) => {
        const trimmed = value.trim();

        if (!trimmed) {
            return 'Transaction hash is required.';
        }

        if (!currentWallet.txPattern.test(trimmed)) {
            return `Enter a valid ${currentWallet.name} transaction hash. Expected format: ${currentWallet.txHint}.`;
        }

        return '';
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(currentWallet.address)
            .then(() => {
                setCopied(true);
                toast.success('Wallet address copied!');
                setTimeout(() => setCopied(false), 2000);
            })
            .catch(() => toast.error('Unable to copy wallet address.'));
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();

        const nextError = validateTransaction(transactionId);
        setTransactionError(nextError);

        if (nextError) {
            toast.error(nextError);
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading("Submitting payment...");

        try {
            const token = localStorage.getItem('token'); 
            
            const paymentData = {
                bookingId: bookingId, 
                amount: bookingAmount,
                paymentMethod: "crypto",
                transactionId: transactionId.trim(),
                paymentDetails: {
                    bankName: currentWallet.name, 
                    paymentDate: new Date(),
                    paidAmount: bookingAmount
                }
            };

            const response = await axios.post('http://localhost:3000/api/payments/create', paymentData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success("Payment details sent to Admin!", { id: loadingToast });
                setTransactionId('');
                setTransactionError('');
                // Redirect to a success page or my-payments
                setTimeout(() => navigate('/my-payments'), 2000);
            }
        } catch (error) {
            console.error("Submission Error:", error.response?.data);
            toast.error(error.response?.data?.message || "Something went wrong.", { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTransactionChange = (value) => {
        setTransactionId(value);
        if (transactionError) {
            setTransactionError(validateTransaction(value));
        }
    };

    const isTransactionValid = !validateTransaction(transactionId);
    const amountLabel = `${bookingAmount.toLocaleString()} ${currency}`;

    return (
        <div className="min-h-screen overflow-hidden bg-linear-to-br from-amber-50 via-white to-sky-50 px-4 pb-10 pt-28 text-slate-900 sm:px-6 sm:pt-32 lg:px-8">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(96,165,250,0.18),transparent_28%),linear-gradient(135deg,#fff7ed_0%,#ffffff_45%,#eff6ff_100%)]" />
            <div className="mx-auto w-full max-w-7xl">
                <div className="mb-6 grid gap-3 lg:grid-cols-[1.3fr_0.7fr]">
                    <div className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl sm:p-6">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-amber-700">
                            <Sparkles size={14} />
                            Crypto Checkout
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Amount to pay</p>
                                <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
                                    {amountLabel}
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                                    Send the exact amount to the selected wallet, then paste the wallet transaction hash below.
                                </p>
                            </div>
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
                                <div className="flex items-center gap-2 text-slate-900">
                                    <BadgeCheck size={18} className="text-emerald-600" />
                                    Secure verification
                                </div>
                                <p className="mt-2 text-xs leading-5 text-slate-500">
                                    Your TxID is checked before the payment request is sent to the admin team.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                        <div className="rounded-4xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/50 backdrop-blur-xl">
                            <div className="flex items-center gap-3 text-sm font-semibold text-slate-900">
                                <Clock3 size={18} className="text-amber-500" />
                                3-step flow
                            </div>
                            <div className="mt-3 space-y-2 text-sm text-slate-600">
                                <div className="flex items-start gap-3"><span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">1</span><p>Choose Bitcoin or Ethereum.</p></div>
                                <div className="flex items-start gap-3"><span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">2</span><p>Scan the wallet QR and pay the exact amount.</p></div>
                                <div className="flex items-start gap-3"><span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">3</span><p>Paste a valid TxID and confirm payment.</p></div>
                            </div>
                        </div>

                        <div className="rounded-4xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/50 backdrop-blur-xl">
                            <div className="flex items-center gap-3 text-sm font-semibold text-slate-900">
                                <ShieldCheck size={18} className="text-emerald-600" />
                                Validation rules
                            </div>
                            <p className="mt-2.5 text-sm leading-6 text-slate-600">
                                {activeTab === 'ethereum'
                                    ? 'Ethereum TxIDs must start with 0x and contain 64 hexadecimal characters.'
                                    : 'Bitcoin TxIDs must contain exactly 64 hexadecimal characters.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
                    <div className="rounded-[2.2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl sm:p-6">
                        <div className="flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-2">
                            {Object.entries(cryptoWallets).map(([key, wallet]) => {
                                const isSelected = activeTab === key;

                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setActiveTab(key)}
                                        className={`flex-1 rounded-xl px-4 py-3 text-left transition-all ${isSelected ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-600 hover:bg-white/60'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br ${wallet.color} text-white shadow-lg`}>
                                                <wallet.icon size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold">{wallet.name}</p>
                                                <p className={`text-xs ${isSelected ? 'text-slate-500' : 'text-slate-500'}`}>{wallet.network}</p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-4 grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
                            <div className="rounded-[1.7rem] border border-slate-200 bg-slate-50 p-4">
                                <div className={`rounded-3xl bg-linear-to-br ${currentWallet.color} p-1 shadow-2xl`}>
                                    <div className="rounded-[1.4rem] bg-white p-5 text-slate-900">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Wallet QR</p>
                                                <h3 className="mt-1 text-xl font-black">{currentWalletLabel}</h3>
                                            </div>
                                            <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
                                                {currentWallet.symbol}
                                            </div>
                                        </div>

                                        <div className="mt-4 flex justify-center">
                                            <img src={qrCodeUrl} alt={`${currentWallet.name} QR`} className="h-64 w-64 rounded-3xl border border-slate-100 object-cover shadow-sm" />
                                        </div>

                                        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                                                <ScanLine size={14} />
                                                Wallet address
                                            </div>
                                            <div className="mt-2 flex items-center gap-2 rounded-xl bg-white p-2.5 shadow-sm">
                                                <code className="flex-1 truncate text-[11px] font-mono text-slate-700 sm:text-xs">
                                                    {currentWallet.address}
                                                </code>
                                                <button
                                                    type="button"
                                                    onClick={handleCopy}
                                                    className="rounded-xl border border-slate-200 bg-white p-2 transition hover:bg-slate-50"
                                                >
                                                    {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} className="text-slate-500" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 rounded-[1.7rem] border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/50">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                                        <ArrowRightLeft size={16} className="text-cyan-600" />
                                        Before you confirm
                                    </div>
                                    <ul className="mt-2 space-y-1.5 text-sm leading-6 text-slate-600">
                                        <li>• Send only the amount shown on this screen.</li>
                                        <li>• Double-check the selected wallet network.</li>
                                        <li>• Paste the TxID exactly as it appears in your wallet.</li>
                                    </ul>
                                </div>

                                <form onSubmit={handlePaymentSubmit} className="space-y-3.5">
                                    <div>
                                        <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                                            <AlertCircle size={16} className="text-cyan-600" />
                                            Transaction Hash (TxID)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder={`Paste your ${currentWallet.name} transaction hash here`}
                                            autoComplete="off"
                                            spellCheck="false"
                                            className={`w-full rounded-2xl border bg-white p-4 font-mono text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 ${transactionError ? 'border-rose-400/60 focus:ring-rose-400/40' : 'border-slate-200 focus:ring-cyan-400/30'}`}
                                            value={transactionId}
                                            onChange={(e) => handleTransactionChange(e.target.value)}
                                            onBlur={() => setTransactionError(validateTransaction(transactionId))}
                                        />
                                        <div className="mt-2 flex items-start gap-2 text-xs leading-5 text-slate-500">
                                            <span className="mt-0.5">{transactionError ? <TriangleAlert size={14} className="text-rose-500" /> : <BadgeCheck size={14} className="text-emerald-500" />}</span>
                                            <span className={transactionError ? 'text-rose-600' : 'text-slate-500'}>
                                                {transactionError || `Expected format: ${currentWallet.txHint}.`}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !isTransactionValid}
                                        className={`w-full rounded-2xl px-5 py-4 font-black shadow-lg transition-all ${isSubmitting || !isTransactionValid ? 'cursor-not-allowed bg-slate-200 text-slate-500' : `bg-linear-to-r ${currentWallet.color} text-white hover:scale-[1.01]`}`}
                                    >
                                        <span className="flex items-center justify-center gap-3">
                                            <Send size={18} />
                                            {isSubmitting ? 'Processing...' : 'Confirm Payment'}
                                        </span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-[2.2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl">
                            <div className="flex items-center gap-3 text-sm font-semibold text-slate-900">
                                <TrendingUp size={18} className="text-emerald-600" />
                                Payment status
                            </div>
                            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700">
                                This page is ready for manual crypto verification. After submission, the payment request goes to the admin queue for review.
                            </div>
                        </div>

                        <div className="rounded-[2.2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl">
                            <div className="flex items-center gap-3 text-sm font-semibold text-slate-900">
                                <ShieldCheck size={18} className="text-cyan-600" />
                                Validation summary
                            </div>
                            <div className="mt-4 space-y-3 text-sm text-slate-600">
                                <p>• Required booking details and amount are checked before rendering.</p>
                                <p>• TxID format is validated for the selected wallet network.</p>
                                <p>• Empty or malformed hashes cannot be submitted.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CryptoPayment;