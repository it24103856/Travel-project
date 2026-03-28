import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import UserProfile from "./userProfile";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/packages", label: "Packages" },
    { to: "/drivers", label: "Drivers" },
    { to: "/hotel", label: "Hotels" },
    { to: "/vehicles", label: "Vehicles" },
    { to: "/destinations", label: "Destinations" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
    { to: "/feedback", label: "Feedback" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-xl border-b border-white/10 px-6 md:px-10 py-4 flex justify-between items-center transition-all duration-500">
      {/* Logo Section */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href="/"}>
        <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
        <span className="text-white font-bold text-2xl tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
          Travel<span className="text-[#00AEEF]">Ease</span>
        </span>
      </div>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex gap-8 text-white/90 font-medium text-sm">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="hover:text-[#00AEEF] transition-all duration-500 uppercase tracking-widest text-[11px] font-semibold"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Auth Section + Mobile Toggle */}
      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <UserProfile />
        ) : (
          <Link
            to="/login"
            className="bg-[#00AEEF] hover:bg-[#0096CE] text-white px-7 py-2.5 rounded-full font-bold transition-all duration-500 shadow-lg shadow-[#00AEEF]/20 uppercase text-[10px] tracking-widest"
          >
            Sign Up
          </Link>
        )}

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-black/80 backdrop-blur-xl border-b border-white/10 md:hidden flex flex-col items-center gap-4 py-6 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className="text-white/90 hover:text-[#00AEEF] transition-all duration-500 uppercase tracking-widest text-[11px] font-semibold"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}