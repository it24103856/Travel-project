import React, { useState, useEffect } from "react";
import axios from "axios";
import { MessageSquare, Clock, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function MyInquiries() {
  const [messages, setMessages] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user?.email) {
      fetchUserMessages();
    }
  }, []);

  const fetchUserMessages = async () => {
    try {
      const res = await axios.get(`${backendUrl}/contact/my-messages/${user.email}`);
      setMessages(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching messages:", err);
      toast.error("Failed to load your inquiries.");
      setLoading(false);
    }
  };

  const toggleExpand = async (msg) => {
    if (expandedId === msg._id) {
      setExpandedId(null);
    } else {
      setExpandedId(msg._id);
      
      // If there is a reply and it's not viewed yet, mark it as viewed
      if (msg.adminReply && !msg.isViewedByCustomer) {
        try {
          await axios.put(`${backendUrl}/contact/mark-viewed/${msg._id}`);
          // Update local state to remove the "new" indicator
          setMessages(prev => 
            prev.map(m => m._id === msg._id ? { ...m, isViewedByCustomer: true } : m)
          );
        } catch (err) {
          console.error("Error marking as viewed:", err);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
      <Toaster />
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-[Playfair_Display] font-bold text-gray-900">
            My <span className="text-[#00AEEF]">Inquiries</span>
          </h1>
          <p className="text-gray-500 mt-2">Track your questions and our responses here.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00AEEF]"></div>
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg._id} 
                className={`bg-white rounded-2xl border transition-all duration-300 ${
                  expandedId === msg._id ? "shadow-md border-[#00AEEF]/30" : "border-gray-100 shadow-sm"
                }`}
              >
                {/* Header Section */}
                <div 
                  className="p-6 cursor-pointer flex items-center justify-between"
                  onClick={() => toggleExpand(msg)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${msg.adminReply ? "bg-green-50" : "bg-blue-50"}`}>
                      <MessageSquare size={20} className={msg.adminReply ? "text-green-500" : "text-[#00AEEF]"} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{msg.subject}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <Clock size={12} />
                        {new Date(msg.createdAt).toLocaleDateString()}
                        {msg.adminReply && !msg.isViewedByCustomer && (
                          <span className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] animate-pulse">
                            NEW REPLY
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {expandedId === msg._id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                </div>

                {/* Expanded Content */}
                {expandedId === msg._id && (
                  <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="pt-4 border-t border-gray-50">
                      <div className="mb-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Your Message</p>
                        <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl italic">
                          "{msg.message}"
                        </p>
                      </div>

                      {msg.adminReply ? (
                        <div className="mt-6">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle size={14} className="text-green-500" />
                            <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Admin Response</p>
                          </div>
                          <p className="text-gray-800 text-sm font-medium bg-green-50/50 p-4 rounded-xl border border-green-100">
                            {msg.adminReply}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-4 py-2 px-4 bg-amber-50 text-amber-600 text-xs rounded-lg inline-block font-medium">
                          Status: Waiting for a response...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 italic">You haven't sent any messages yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}