import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import UserProfile from "./userProfile";
import { Menu, X, Bell } from "lucide-react";
import axios from "axios";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    setIsLoggedIn(!!token);

    if (token && storedUser && storedUser !== "undefined") {
      try {
        const user = JSON.parse(storedUser);
        if (user?.email) {
          fetchNotifications(user.email);

          const interval = setInterval(() => {
            fetchNotifications(user.email);
          }, 30000);
          return () => clearInterval(interval);
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
  }, []);

  const fetchNotifications = async (email) => {
    try {
      const res = await axios.get(`${backendUrl}/contact/my-messages/${email}`);
      
      // වැදගත්: මෙහිදී check කරන්නේ adminReply එකක් තිබේද යන්න පමණි. 
      // එවිට පරණ messages වුවද reply ලැබී ඇත්නම් මෙහි දිස්වේ.
      const replies = res.data.data.filter(
        (msg) => msg.adminReply && msg.adminReply.trim() !== "" && msg.isViewedByCustomer !== true
      );
      setNotifications(replies);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const handleNotificationClick = (id) => {
    setShowDropdown(false);
    navigate(`/my-inquiries`); 
  };

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
    <nav className="fixed top-0 w-full z-[100] bg-black/20 backdrop-blur-xl border-b border-white/10 px-6 md:px-10 py-4 flex justify-between items-center transition-all duration-500">
      {/* Logo Section */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
        <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
        <span className="text-white font-bold text-2xl tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
          Travel<span className="text-[#C8813A]">Ease</span>
        </span>
      </div>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex gap-8 text-white/90 font-medium text-sm">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="hover:text-[#C8813A] transition-all duration-500 uppercase tracking-widest text-[11px] font-semibold"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Auth Section + Notifications */}
      <div className="flex items-center gap-4">
        
        {/* Notification Bell Container */}
        {isLoggedIn && (
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className={`transition-all p-2 relative rounded-full ${showDropdown ? 'bg-white/10 text-[#C8813A]' : 'text-white/80 hover:text-[#C8813A]'}`}
            >
              <Bell size={22} />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown - Z-INDEX UPDATE */}
            {showDropdown && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden z-[110] animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-gray-50 bg-gray-50/80 text-gray-800 font-bold text-sm flex justify-between items-center">
                  <span>Notifications</span>
                  {notifications.length > 0 && <span className="text-[10px] bg-[#C8813A]/10 text-[#C8813A] px-2 py-0.5 rounded-full">{notifications.length} New</span>}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div 
                        key={notif._id}
                        onClick={() => handleNotificationClick(notif._id)}
                        className="p-4 border-b border-gray-50 hover:bg-blue-50/50 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 mt-1.5 rounded-full bg-[#C8813A] shrink-0" />
                          <div>
                            <p className="text-[11px] font-bold text-[#C8813A] uppercase tracking-tighter">New Admin Reply</p>
                            <p className="text-sm text-gray-700 line-clamp-1 font-semibold">Re: {notif.subject}</p>
                            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 italic">"{notif.adminReply}"</p>
                            <p className="text-[9px] text-gray-400 mt-2 font-medium group-hover:text-[#C8813A]">Click to open conversation →</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center">
                      <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bell size={20} className="text-gray-300" />
                      </div>
                      <p className="text-gray-400 text-xs font-medium">No new messages yet.</p>
                    </div>
                  )}
                </div>
                {notifications.length > 0 && (
                  <div 
                    onClick={() => { setShowDropdown(false); navigate('/my-inquiries'); }}
                    className="p-3 text-center bg-gray-50 text-[10px] font-bold text-gray-500 hover:text-[#C8813A] cursor-pointer transition-colors border-t border-gray-100"
                  >
                    VIEW ALL INQUIRIES
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* User Profile */}
        {isLoggedIn ? (
          <div className="relative z-[105]">
            <UserProfile />
          </div>
        ) : (
          <Link
            to="/login"
            className="bg-[#C8813A] hover:bg-[#A66A28] text-white px-7 py-2.5 rounded-full font-bold transition-all duration-500 shadow-lg shadow-[#C8813A]/20 uppercase text-[10px] tracking-widest"
          >
            Sign In
          </Link>
        )}

        {/* Mobile Menu */}
        <button
          className="md:hidden text-white ml-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu View */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-black/95 backdrop-blur-2xl border-b border-white/10 md:hidden flex flex-col items-center gap-4 py-8 shadow-2xl animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className="text-white/90 hover:text-[#C8813A] transition-all duration-500 uppercase tracking-widest text-[11px] font-semibold"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}