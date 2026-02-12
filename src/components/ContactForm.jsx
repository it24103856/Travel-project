import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";

export default function ContactForm() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    subject: "",
    message: "",
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSend = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Sending...");
    try {
      await axios.post(`${backendUrl}/contact/send-message`, formData);
      toast.success("Sent! ✨", { id: toastId });
      setFormData({ customerName: "", customerEmail: "", subject: "", message: "" });
      setIsFormOpen(false);
    } catch (err) {
      toast.error("Error!", { id: toastId });
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[999]">
      <button
        onClick={() => setIsFormOpen(!isFormOpen)}
        className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-xl border-4 border-white"
      >
        {isFormOpen ? <X size={30} /> : <MessageCircle size={30} />}
      </button>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-20 right-0 w-[320px] md:w-[380px] bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            <div className="bg-gray-900 p-5 text-white">
              <h3 className="font-bold">Send a Message</h3>
            </div>
            <form onSubmit={handleSend} className="p-5 space-y-3">
              <input 
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Name"
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                required
              />
              <input 
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Email"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                required
              />
              <input
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Subject"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                required
              />
              <textarea 
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Message"
                rows="3"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                required
              ></textarea>
              <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                <Send size={18} /> Send
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}