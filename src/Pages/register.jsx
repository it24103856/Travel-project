import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

export default function RegisterPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    async function HandleRegister(e) {
        if (e) e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            toast.error("All fields are required");
            return;
        }

        setIsLoading(true);
        try {
            const res = await axios.post(import.meta.env.VITE_BACKEND_URL + "/users/create", {
                firstName,
                lastName,
                email,
                password,
            });
            toast.success("Registration successful! Please login.");
            navigate("/login");
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        
        <div className="w-full min-h-screen bg-[url('/travel-bg.jpg')] bg-center bg-cover bg-no-repeat flex items-center justify-center relative px-6 py-10">
            
            {/* Dark Overlay for better readability */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full max-w-6xl gap-12">
                
                {/* Left Side: Brand Identity */}
                <div className="text-center md:text-left max-w-[550px]">
                    <img src="/logo.png" alt="Travel Logo" className="w-40 mb-8 mx-auto md:mx-0 drop-shadow-2xl" />
                    <h1 className="text-white font-extrabold text-5xl md:text-6xl leading-[1.1] drop-shadow-2xl">
                        Start Your <br />
                        <span className="text-cyan-400">Adventure</span> Today.
                    </h1>
                    <p className="mt-6 text-gray-100 text-xl font-light tracking-wide italic drop-shadow-md">
                        "Join our community of world travelers and discover hidden gems."
                    </p>
                </div>

                {/* Right Side: Glassmorphism Register Form */}
                <form onSubmit={HandleRegister} className="w-full max-w-[480px] bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-10 flex flex-col items-center">
                    <h2 className="text-3xl font-bold text-white mb-2 self-start">Create Account</h2>
                    <p className="text-white/60 text-sm mb-8 self-start">Sign up to get started on your journey.</p>

                    <div className="w-full space-y-4">
                        <div className="flex gap-4">
                            <input
                                required
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                type="text"
                                placeholder="First Name"
                                className="w-1/2 p-4 rounded-xl bg-white/90 border-none focus:ring-4 focus:ring-cyan-400/50 transition-all outline-none text-gray-800 shadow-inner placeholder:text-gray-400"
                            />
                            <input
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                type="text"
                                placeholder="Last Name"
                                className="w-1/2 p-4 rounded-xl bg-white/90 border-none focus:ring-4 focus:ring-cyan-400/50 transition-all outline-none text-gray-800 shadow-inner placeholder:text-gray-400"
                            />
                        </div>

                        <input
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            placeholder="Email Address"
                            className="w-full p-4 rounded-xl bg-white/90 border-none focus:ring-4 focus:ring-cyan-400/50 transition-all outline-none text-gray-800 shadow-inner placeholder:text-gray-400"
                        />

                        <input
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            placeholder="Password"
                            className="w-full p-4 rounded-xl bg-white/90 border-none focus:ring-4 focus:ring-cyan-400/50 transition-all outline-none text-gray-800 shadow-inner placeholder:text-gray-400"
                        />

                        <input
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            type="password"
                            placeholder="Confirm Password"
                            className="w-full p-4 rounded-xl bg-white/90 border-none focus:ring-4 focus:ring-cyan-400/50 transition-all outline-none text-gray-800 shadow-inner placeholder:text-gray-400"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/40 active:scale-[0.98] transition-all duration-300 mt-8"
                    >
                        {isLoading ? "Creating Account..." : "Join Now"}
                    </button>

                    <p className="text-white/70 mt-8 text-sm">
                        Already have an account? {" "}
                        <Link to="/login" className="text-cyan-400 font-bold hover:underline">
                            Login
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}