import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Package, LogOut, User as UserIcon } from "lucide-react";

export default function UserData() {
    const [user, setUser] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    // Function to fetch user data from backend
    const fetchUserData = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(response.data);
            } catch (err) {
                setUser(null);
                console.error("Auth error:", err);
            }
        }
    }, []);

    useEffect(() => {
        // Initial fetch
        fetchUserData();

        // Listen for the custom "userProfileUpdated" event from the Edit Modal
        window.addEventListener("userProfileUpdated", fetchUserData);

        // Cleanup listener on unmount
        return () => {
            window.removeEventListener("userProfileUpdated", fetchUserData);
        };
    }, [fetchUserData]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    const handleOrders = () => {
        window.location.href = "/orders";
    };

    const handleProfile = () => {
        window.location.href = "/profile";
    };

    if (!user) return null;

    // Logic to determine the correct Profile Image URL
    const profileImg = user.image && (user.image.includes("googleusercontent") || user.image.startsWith("http"))
        ? user.image 
        : `${import.meta.env.VITE_BACKEND_URL}/${user.image || 'default.png'}`;

    return (
        <div className="relative font-poppins z-50">
            {/* User Profile Trigger Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-1.5 pr-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all border border-white/20 shadow-md group"
            >
                <div className="relative">
                    <img 
                        src={profileImg} 
                        referrerPolicy='no-referrer'
                        className='w-10 h-10 rounded-full object-cover border-2 border-cyan-400 shadow-sm'
                        alt="user"
                        // Fallback to UI Avatars if image fails to load
                        onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${user.firstName}`}
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>

                <div className="hidden md:flex flex-col text-left">
                    <span className="text-sm font-bold text-white leading-tight">
                        {user.firstName} {user.lastName}
                    </span>
                    <span className="text-[10px] text-cyan-300 uppercase tracking-tighter font-bold opacity-80">
                        {user.type || "Traveler"}
                    </span>
                </div>
                
                <ChevronDown 
                    size={16} 
                    className={`text-white/70 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Overlay to handle closing when clicking outside */}
                        <div className="fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)} />
                        
                        <motion.div
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 15, scale: 0.95 }}
                            className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                        >
                            <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-gray-100">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Active Profile</p>
                                <p className="text-sm font-bold text-gray-800 truncate">{user.email}</p>
                            </div>

                            <div className="p-2">
                                <button 
                                    onClick={handleOrders}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-cyan-50 hover:text-cyan-600 rounded-xl transition-all group"
                                >
                                    <Package size={18} className="group-hover:scale-110 transition-transform" />
                                    <span className="font-medium">My Orders</span>
                                </button>

                                <button 
                                    onClick={handleProfile}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-cyan-50 hover:text-cyan-600 rounded-xl transition-all group"
                                >
                                    <UserIcon size={18} className="group-hover:scale-110 transition-transform" />
                                    <span className="font-medium">Account Info</span>
                                </button>

                                <div className="h-px bg-gray-100 my-2 mx-2"></div>

                                <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-all group"
                                >
                                    <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                                    <span className="font-bold">Logout</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}