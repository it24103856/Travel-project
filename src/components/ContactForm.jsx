import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, User, Mail } from "lucide-react";

export default function ContactForm() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    subject: "",
    message: "",
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // LocalStorage එකෙන් User දත්ත පරීක්ෂා කිරීම (Auto-fill සඳහා පමණි)
  const getLoggedInUser = () => {
    const data = localStorage.getItem("user");
    if (!data || data === "undefined" || data === "null") return null;
    try {
      const parsed = JSON.parse(data);
      return parsed.user ? parsed.user : parsed;
    } catch (e) {
      return null;
    }
  };

  // Form එක open කරන විට විතරක් පවතින දත්ත තිබේ නම් fill කරයි
  useEffect(() => {
    const user = getLoggedInUser();
    if (user && isFormOpen) {
      setFormData((prev) => ({
        ...prev,
        customerName: prev.customerName || user.name || user.firstName || "",
        customerEmail: prev.customerEmail || user.email || "",
      }));
    }
  }, [isFormOpen]);

  // Input fields වල දත්ත වෙනස් කරන විට ක්‍රියාත්මක වේ
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setIsSending(true);
    const toastId = toast.loading("Sending message...");

    try {
      const user = getLoggedInUser();
      const userId = user ? (user._id || user.id) : null;

      const payload = {
        customerId: userId,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        subject: formData.subject,
        message: formData.message,
      };

      await axios.post(`${backendUrl}/contact/send-message`, payload);
      
      toast.success("Message Sent! ✨", { id: toastId });
      
      // Form එක reset කිරීම
      setFormData({
        customerName: user ? (user.name || user.firstName || "") : "",
        customerEmail: user ? (user.email || "") : "",
        subject: "",
        message: ""
      });
      setIsFormOpen(false);

    } catch (err) {
      toast.error("Failed to send message", { id: toastId });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[999]">
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsFormOpen(!isFormOpen)}
        className="w-16 h-16 bg-[#C8813A] text-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white transition-all"
      >
        {isFormOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </motion.button>

      {/* Floating Form Panel */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-[340px] md:w-[400px] bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden"
          >
            {/* Header Section */}
            <div className="bg-gray-900 p-6 text-white">
              <h3 className="font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
                Contact <span className="italic text-[#C8813A]">TravelEase</span>
              </h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mt-1">We are here to help you</p>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSend} className="p-6 space-y-4 bg-white">
              
              {/* Name - දැන් ඕනෑම වෙලාවක Edit කළ හැක */}
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="customerName"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:border-[#C8813A] focus:bg-white transition-all"
                  placeholder="Your Full Name"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email - දැන් ඕනෑම වෙලාවක Edit කළ හැක */}
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="customerEmail"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:border-[#C8813A] focus:bg-white transition-all"
                  placeholder="Email Address"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Subject */}
              <input
                type="text"
                name="subject"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:border-[#C8813A] focus:bg-white transition-all"
                placeholder="Subject of Inquiry"
                value={formData.subject}
                onChange={handleChange}
                required
              />

              {/* Message */}
              <textarea
                name="message"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:border-[#C8813A] focus:bg-white transition-all resize-none"
                placeholder="How can we assist you today?"
                rows="4"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isSending}
                className="w-full bg-[#C8813A] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 uppercase text-[11px] tracking-[0.2em] transition-all shadow-lg hover:bg-[#A66A28] disabled:opacity-70 active:scale-[0.98]"
              >
                {isSending ? "Sending..." : <><Send size={16} /> Send Message</>}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}