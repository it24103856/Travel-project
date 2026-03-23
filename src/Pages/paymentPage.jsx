import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCreditCard, FaUniversity, FaBitcoin, FaChevronRight, FaTicketAlt, FaShieldAlt } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

const PaymentMainPage = () => {
    const [selectedMethod, setSelectedMethod] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // Booking details ලබා ගැනීම
    const bookingData = location.state?.bookingDetails;

    // වලංගු booking දත්ත නොමැති නම් මුල් පිටුවට යොමු කිරීම
    if (!bookingData || !bookingData.bookingId) {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col gap-4">
                <h2 className="text-xl font-bold text-red-600">Invalid booking session!</h2>
                <button 
                  onClick={() => navigate('/')}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg"
                >
                  Return Home
                </button>
            </div>
        );
    }

    // ගණනය කිරීම්
    const originalPrice = Number(bookingData.total) || 0;
    const discountPercent = Number(bookingData.discountPercentage) || 0;
    const discountAmount = originalPrice * (discountPercent / 100);
    const finalTotal = originalPrice - discountAmount;
    const hasDiscount = discountPercent > 0;

    const paymentMethods = [
        { id: 'bank', name: 'Bank Transfer', subtitle: 'Direct bank payment', tag: 'Receipt upload', icon: <FaUniversity className="text-blue-600" /> },
        { id: 'card', name: 'Credit Card', subtitle: 'Visa, Mastercard, Amex', tag: 'Secure Card', icon: <FaCreditCard className="text-emerald-600" /> },
        { id: 'crypto', name: 'Cryptocurrency', subtitle: 'BTC, ETH, USDT', tag: 'QR or Wallet', icon: <FaBitcoin className="text-orange-500" /> },
    ];

    const handlePayNow = () => {
        if (!selectedMethod) {
            toast.error("Please select a payment method!");
            return;
        }

        const paths = { 
            card: '/payment/card', 
            bank: '/payment/bank-transfer', 
            crypto: '/payment/crypto' 
        };

        // වැදගත්: මෙහිදී bookingId සහ amount එක මීළඟ පිටුවට state එක ලෙස යවයි
        navigate(paths[selectedMethod], { 
            state: { 
                bookingId: bookingData.bookingId, 
                amount: finalTotal 
            } 
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center font-sans">
            <Toaster position="top-center" />

            <div className="max-w-4xl w-full mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                        Choose <span className="text-orange-500">Payment Method</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium italic">
                        Select your preferred payment option to complete the booking
                    </p>
                </div>

                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 md:p-8 mb-8 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 shadow-sm">
                                <FaTicketAlt className="text-xl" />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest block mb-1">Booking Summary</span>
                                <h2 className="text-lg md:text-xl font-bold text-slate-800">
                                    Reference ID: <span className="text-slate-500 font-medium">#{bookingData.bookingId.slice(0, 8).toUpperCase()}</span>
                                </h2>
                            </div>
                        </div>
                        {hasDiscount && (
                            <div className="mt-3 md:mt-0 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                                <span className="text-emerald-600 text-xs font-bold uppercase tracking-tighter">Discount Applied: {discountPercent}% OFF</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <span className="text-slate-800 font-extrabold text-lg">Total Amount</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
                                {finalTotal.toLocaleString()}
                            </span>
                            <span className="text-sm font-bold text-slate-400 uppercase">{bookingData.currency || 'LKR'}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {paymentMethods.map((method) => {
                        const isSelected = selectedMethod === method.id;
                        return (
                            <label
                                key={method.id}
                                className={`cursor-pointer group relative flex flex-col items-center p-8 rounded-[2.5rem] border-2 transition-all duration-300
                                    ${isSelected 
                                        ? 'border-blue-500 bg-white shadow-[0_20px_50px_rgba(59,130,246,0.12)] scale-[1.03]' 
                                        : 'border-white bg-white/60 hover:border-blue-100 hover:bg-white'}`}
                            >
                                <input
                                    type="radio"
                                    name="payment_method"
                                    value={method.id}
                                    checked={isSelected}
                                    onChange={() => setSelectedMethod(method.id)}
                                    className="sr-only"
                                />

                                <div className={`h-16 w-16 rounded-full flex items-center justify-center text-3xl mb-6 transition-all duration-500
                                    ${isSelected ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-50' : 'bg-slate-50 text-slate-400'}`}>
                                    {method.icon}
                                </div>

                                <div className="text-center">
                                    <h3 className={`font-bold text-lg mb-1 transition-colors ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                                        {method.name}
                                    </h3>
                                    <p className="text-slate-400 text-xs font-medium mb-5">
                                        {method.subtitle}
                                    </p>
                                    <span className={`inline-block px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all
                                        ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50'}`}>
                                        {method.tag}
                                    </span>
                                </div>

                                <div className={`absolute top-5 right-5 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all
                                    ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-200'}`}>
                                    {isSelected && <div className="h-2 w-2 bg-white rounded-full" />}
                                </div>
                            </label>
                        );
                    })}
                </div>

                <div className="max-w-md mx-auto space-y-6">
                    <button
                        onClick={handlePayNow}
                        className="w-full relative overflow-hidden group bg-slate-900 text-white py-6 rounded-[2rem] font-bold uppercase tracking-[0.25em] text-sm flex items-center justify-center gap-3 transition-all duration-300 shadow-2xl hover:shadow-blue-500/20 active:scale-95"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative z-10">Proceed to Pay</span>
                        <FaChevronRight className="relative z-10 text-xs group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <div className="flex items-center justify-center gap-3 text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em]">
                        <FaShieldAlt className="text-emerald-500 text-sm" />
                        <span>100% Secure & Encrypted Transaction</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentMainPage;