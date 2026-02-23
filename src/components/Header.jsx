import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import UserProfile from "./userProfile";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // LocalStorage එකේ ටෝකන් එකක් තිබේදැයි පරීක්ෂා කරන්න
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token); // ටෝකන් එක තිබේ නම් true, නැතිනම් false
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-white/10 px-6 md:px-10 py-4 flex justify-between items-center">
      {/* Logo Section */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href="/"}>
        <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
        <span className="text-white font-bold text-2xl tracking-wide">
          Travel<span className="text-cyan-400">Ease</span>
        </span>
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex gap-8 text-white font-medium">
        <Link to="/" className="hover:text-cyan-400 transition">Home</Link>
        <Link to="/packages" className="hover:text-cyan-400 transition">Packages</Link>
        <Link to="/driverse" className="hover:text-cyan-400 transition">Driverse</Link>
        <Link to="/hotel" className="hover:text-cyan-400 transition">Hotels</Link>
        <Link to="/destinations" className="hover:text-cyan-400 transition">Destinations</Link>
        <Link to="/about" className="hover:text-cyan-400 transition">About</Link>
        <Link to="/contact" className="hover:text-cyan-400 transition">Contact</Link>
      </div>

      {/* Auth Section: ලොග් වී ඇත්නම් Profile ද, නැතිනම් Login පෙන්වන්න */}
      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <UserProfile />
        ) : (
          <Link 
            to="/login" 
            className="bg-cyan-500 hover:bg-cyan-400 text-white px-6 py-2 rounded-full font-bold transition shadow-lg shadow-cyan-500/20"
          >
            Sign Up
          </Link>
        )}
      </div>
    </nav>
  );
}