import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaUniversity, 
  FaBitcoin, 
  FaChevronRight, 
  FaTicketAlt, 
  FaShieldAlt, 
  FaLock 
} from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

const PaymentMainPage = () => {
    const [selectedMethod, setSelectedMethod] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const bookingData = location.state?.bookingDetails;

    if (!bookingData || !bookingData.bookingId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F6F3] py-12">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-red-600 mb-6">Invalid booking session!</h2>
                    <button 
                        onClick={() => navigate('/')}
                        className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-medium hover:bg-slate-800 transition-colors"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    const originalPrice = Number(bookingData.total) || 0;
    const discountPercent = Number(bookingData.discountPercentage) || 0;
    const discountAmount = originalPrice * (discountPercent / 100);
    const finalTotal = originalPrice - discountAmount;
    const hasDiscount = discountPercent > 0;

    const paymentMethods = [
        { 
            id: 'bank', 
            name: 'Bank Transfer', 
            subtitle: 'Direct bank payment via online or branch', 
            tag: 'Upload Receipt', 
            icon: <FaUniversity className="text-4xl text-amber-700" /> 
        },
        { 
            id: 'crypto', 
            name: 'Cryptocurrency', 
            subtitle: 'BTC • ETH • USDT', 
            tag: 'Instant QR Payment', 
            icon: <FaBitcoin className="text-4xl text-orange-600" /> 
        },
    ];

    const handlePayNow = () => {
        if (!selectedMethod) {
            toast.error("Please select a payment method");
            return;
        }

        const paths = { 
            bank: '/payment/bank-transfer', 
            crypto: '/payment/crypto' 
        };

        navigate(paths[selectedMethod], { 
            state: { 
                bookingId: bookingData.bookingId, 
                amount: finalTotal,
                currency: bookingData.currency || 'LKR'
            } 
        });
    };

    return (
        <div className="min-h-screen bg-[#fdf8f1] py-16 px-4 sm:px-6 lg:px-8">
            <Toaster position="top-center" />

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-white px-5 py-2 rounded-3xl shadow-sm mb-6">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                        <span className="text-amber-700 text-sm font-semibold tracking-widest">SECURE CHECKOUT</span>
                    </div>

                    <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 leading-tight mb-4">
                        Complete Your Payment
                    </h1>
                    <p className="text-lg text-slate-600 max-w-md mx-auto">
                        Choose a secure payment method to finalize your booking
                    </p>
                </div>

                {/* Booking Summary */}
                <div className="bg-white rounded-3xl shadow-xl p-10 mb-12 border border-slate-100">
                    <div className="flex items-start justify-between pb-8 border-b border-slate-100">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                <FaTicketAlt className="text-3xl" />
                            </div>
                            <div>
                                <p className="text-amber-600 text-sm font-medium tracking-widest">BOOKING REFERENCE</p>
                                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                                    #{bookingData.bookingId.slice(0, 8).toUpperCase()}
                                </h2>
                            </div>
                        </div>

                        {hasDiscount && (
                            <div className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl text-sm font-semibold shadow-sm">
                                {discountPercent}% OFF APPLIED
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
                        <div>
                            <p className="text-slate-500 text-sm font-medium mb-1">Original Price</p>
                            <p className="text-2xl font-medium text-slate-400 line-through">
                                {originalPrice.toLocaleString()} {bookingData.currency || 'LKR'}
                            </p>
                        </div>

                        {hasDiscount && (
                            <div>
                                <p className="text-slate-500 text-sm font-medium mb-1">Discount</p>
                                <p className="text-2xl font-medium text-emerald-600">
                                    -{discountAmount.toLocaleString()} {bookingData.currency || 'LKR'}
                                </p>
                            </div>
                        )}

                        <div className="md:text-right">
                            <p className="text-slate-500 text-sm font-medium mb-1">Amount to Pay</p>
                            <p className="text-5xl font-bold text-slate-900 tracking-tighter">
                                {finalTotal.toLocaleString()}
                                <span className="text-2xl font-normal text-slate-500 ml-1">
                                    {bookingData.currency || 'LKR'}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment Methods Section */}
                <div className="mb-12">
                    <h3 className="text-slate-700 text-xl font-semibold mb-6 px-1">Choose Payment Method</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {paymentMethods.map((method) => {
                            const isSelected = selectedMethod === method.id;
                            return (
                                <label
                                    key={method.id}
                                    className={`group relative bg-white border-2 rounded-3xl p-8 cursor-pointer transition-all duration-300 hover:shadow-xl
                                        ${isSelected 
                                            ? 'border-amber-500 shadow-xl shadow-amber-100 scale-[1.02]' 
                                            : 'border-transparent hover:border-slate-200'}`}
                                >
                                    <input
                                        type="radio"
                                        name="payment"
                                        checked={isSelected}
                                        onChange={() => setSelectedMethod(method.id)}
                                        className="sr-only"
                                    />

                                    <div className="flex justify-between items-start mb-8">
                                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300
                                            ${isSelected 
                                                ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg' 
                                                : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                                            {method.icon}
                                        </div>

                                        {isSelected && (
                                            <div className="w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center">
                                                <div className="w-3 h-3 bg-white rounded-full"></div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className={`text-2xl font-semibold mb-2 transition-colors
                                            ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                                            {method.name}
                                        </h4>
                                        <p className="text-slate-500 mb-6">{method.subtitle}</p>
                                        
                                        <span className={`inline-block px-6 py-2.5 text-xs font-bold rounded-2xl tracking-widest
                                            ${isSelected 
                                                ? 'bg-amber-100 text-amber-700' 
                                                : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'}`}>
                                            {method.tag}
                                        </span>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Secure Payment Button */}
                <div className="space-y-6">
                    <button
                        onClick={handlePayNow}
                        disabled={!selectedMethod}
                        className={`w-full py-7 rounded-3xl font-semibold text-lg tracking-widest flex items-center justify-center gap-3 transition-all duration-300 shadow-lg
                            ${selectedMethod 
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white active:scale-[0.985]' 
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                        <FaLock className="text-xl" />
                        PROCEED TO SECURE PAYMENT
                        <FaChevronRight className={`transition-transform ${selectedMethod ? 'group-hover:translate-x-1' : ''}`} />
                    </button>

                    <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                        <FaShieldAlt className="text-amber-500" />
                        <span>256-Bit SSL Encrypted • PCI DSS Compliant • Secure Checkout</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentMainPage;