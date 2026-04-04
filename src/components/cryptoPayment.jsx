import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Copy, Check, Bitcoin, Zap, Shield, TrendingUp, Send, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const CryptoPayment = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Get data from location state
    const bookingId = location.state?.bookingId;
    const amount = location.state?.amount;

    const [copied, setCopied] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('bitcoin');

    // Security check: If no data, redirect back
    if (!bookingId || !amount) {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col gap-4">
                <h2 className="text-xl font-bold text-red-600">Session Expired or Invalid Access</h2>
                <button onClick={() => navigate(-1)} className="px-6 py-2 bg-gray-900 text-white rounded-xl">Go Back</button>
            </div>
        );
    }

    const cryptoWallets = {
        bitcoin: {
            address: '1A1z7agoat2YLZW51Uc8w6LFCHF7PhmQqe',
            name: 'Bitcoin',
            symbol: 'BTC',
            color: 'from-orange-500 to-orange-600',
            icon: Bitcoin
        },
        ethereum: {
            address: '0x742d35Cc6634C0532925a3b844Bc9e7595f42e1',
            name: 'Ethereum',
            symbol: 'ETH',
            color: 'from-purple-500 to-purple-600',
            icon: Zap
        }
    };

    const currentWallet = cryptoWallets[activeTab];

    const handleCopy = () => {
        navigator.clipboard.writeText(currentWallet.address);
        setCopied(true);
        toast.success('Wallet address copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        
        if (!transactionId.trim()) {
            return toast.error("Please enter Transaction Hash.");
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading("Submitting payment...");

        try {
            const token = localStorage.getItem('token'); 
            
            const paymentData = {
                bookingId: bookingId, 
                amount: Number(amount),
                paymentMethod: "crypto",
                transactionId: transactionId,
                paymentDetails: {
                    bankName: currentWallet.name, 
                    paymentDate: new Date(),
                    paidAmount: Number(amount)
                }
            };

            const response = await axios.post('http://localhost:3000/api/payments/create', paymentData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success("Payment details sent to Admin!", { id: loadingToast });
                setTransactionId('');
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

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentWallet.address)}`;

    return (
        <div className="min-h-screen bg-[#f1ebe3] py-30 px-4 flex justify-center items-center">
            <div className="max-w-xl w-full">
                <div className="bg-[#eceae7] rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100">
                    
                    <div className="flex p-2 bg-gray-100/50 m-4 rounded-2xl">
                        {Object.entries(cryptoWallets).map(([key, wallet]) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
                                    activeTab === key ? `bg-white text-gray-900 shadow-sm` : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <wallet.icon size={18} className={activeTab === key ? 'text-orange-500' : ''} />
                                {wallet.name}
                            </button>
                        ))}
                    </div>

                    <div className="p-8 pt-4">
                        <div className="text-center mb-6">
                            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Amount to Pay</p>
                            <h2 className="text-4xl font-black text-gray-900">LKR {amount?.toLocaleString()}</h2>
                        </div>

                        <div className={`bg-gradient-to-br ${currentWallet.color} p-1 rounded-[1.5rem] mb-8`}>
                            <div className="bg-white rounded-[1.4rem] p-6 text-center">
                                <img src={qrCodeUrl} alt="QR" className="w-48 h-48 mx-auto mb-4 border-4 border-gray-50 rounded-lg" />
                                <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                                    <code className="flex-1 text-[10px] sm:text-xs font-mono text-gray-600 truncate text-left">
                                        {currentWallet.address}
                                    </code>
                                    <button onClick={handleCopy} className="p-2 bg-white shadow-sm border rounded-lg">
                                        {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-gray-400" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handlePaymentSubmit} className="space-y-5">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                    <AlertCircle size={16} className="text-blue-500" />
                                    Transaction Hash (TxID)
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Paste your transaction hash here"
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-mono text-xs"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-4 rounded-2xl font-black text-white shadow-lg flex items-center justify-center gap-3 transition-all ${
                                    isSubmitting ? 'bg-gray-300' : 'bg-gray-900 hover:bg-black'
                                }`}
                            >
                                <Send size={20} />
                                {isSubmitting ? "Processing..." : "Confirm Payment"}
                            </button>
                        </form>

                        <div className="mt-8 flex justify-center gap-6 opacity-50">
                            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"><Shield size={14}/> Secure</div>
                            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"><TrendingUp size={14}/> Verified</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CryptoPayment;