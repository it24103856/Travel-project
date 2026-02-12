import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false); // Loading state එකක් එකතු කළා design එකට
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/users/send-otp/${email}`);
      toast.success(res.data.message);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP එක යවන්න බැරි වුණා");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match!");
    }
    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/users/validate-otp`, {
        email,
        otp,
        newPassword
      });
      toast.success(res.data.message);
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Password reset failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[url('/travel-bg.jpg')] bg-center bg-cover bg-no-repeat flex items-center justify-center relative px-6 font-poppins">
      
      {/* Dark Overlay for better readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-6xl gap-12">
        
        {/* Glassmorphism Container */}
        <div className="w-full max-w-[420px] bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-10 flex flex-col items-center">
          
          <img src="/logo.png" alt="Logo" className="w-24 mb-6 drop-shadow-2xl" />
          
          <h2 className="text-3xl font-bold text-white mb-2 text-center">
            {step === 1 ? "Forgot Password?" : "Set New Password"}
          </h2>
          <p className="text-white/60 text-sm mb-8 text-center">
            {step === 1 
              ? "Enter your email to receive a 6-digit verification code." 
              : "Verify OTP and secure your account with a new password."}
          </p>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="w-full space-y-5">
              <input
                type="email"
                placeholder="Email Address"
                className="w-full p-4 rounded-xl bg-white/90 border-none focus:ring-4 focus:ring-cyan-400/50 transition-all outline-none text-gray-800 shadow-inner"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button 
                disabled={isLoading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/40 active:scale-[0.98] transition-all duration-300"
              >
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="w-full space-y-4">
              {/* 💡 Browser එක රවට්ටන්න දාන පේන්නේ නැති (Hidden) inputs */}
    {/* Browser එක Autofill කරන විස්තර මේවට වැටෙයි */}
    <input type="text" name="fake-email" style={{ display: 'none' }} />
    <input type="password" name="fake-password" style={{ display: 'none' }} />
              <input
                type="text"
                name='otp-code'
                autoComplete='one-time-code'
                placeholder="Enter 6-digit OTP"
                className="w-full p-4 rounded-xl bg-white/90 border-none focus:ring-4 focus:ring-cyan-400/50 transition-all outline-none text-gray-800 shadow-inner"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              
              <input
                type="password"
                placeholder="New Password"
                className="w-full p-4 rounded-xl bg-white/90 border-none focus:ring-4 focus:ring-cyan-400/50 transition-all outline-none text-gray-800 shadow-inner"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Confirm New Password"
                className={`w-full p-4 rounded-xl bg-white/90 border-none focus:ring-4 transition-all outline-none text-gray-800 shadow-inner ${
                  confirmPassword && newPassword !== confirmPassword ? "focus:ring-red-500 ring-2 ring-red-500" : "focus:ring-cyan-400/50"
                }`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-400 text-center font-bold">* Passwords do not match</p>
              )}

              <button 
                disabled={isLoading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/40 active:scale-[0.98] transition-all duration-300"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          <div className="mt-8">
            <Link to="/login" className="text-cyan-400 font-bold hover:underline text-sm">
              Back to Sign In
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}