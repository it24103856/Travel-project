import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Trash2, Mail, Clock, User, Eye, X, Send } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null); 
  const [replyText, setReplyText] = useState(""); 
  const [isSending, setIsSending] = useState(false);
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${backendUrl}/contact/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // දත්ත Array එකක් බව තහවුරු කරගන්න
      setMessages(Array.isArray(res.data.data) ? res.data.data : []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching messages", err);
      toast.error("Failed to load messages!");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (backendUrl) fetchMessages();
  }, [backendUrl]);

  const handleReply = async () => {
    if (!replyText.trim()) return toast.error("Please enter a reply!");
    
    setIsSending(true);
    try {
      await axios.put(
        `${backendUrl}/contact/reply-message/${selectedMsg._id}`,
        { adminReply: replyText },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success("Reply sent successfully!");
      setReplyText("");
      setSelectedMsg(null);
      fetchMessages(); 
    } catch (err) {
      toast.error("Failed to send reply");
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This message will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6366F1",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const deleteToast = toast.loading("Deleting message...");
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`${backendUrl}/contact/delete-message/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toast.success("Message deleted successfully!", { id: deleteToast });
          setMessages(messages.filter((msg) => msg._id !== id));
          Swal.fire("Deleted!", "The message has been deleted.", "success");
        } catch (err) {
          toast.error("Could not delete message.", { id: deleteToast });
          Swal.fire("Error!", "Something went wrong.", "error");
        }
      }
    });
  };

  return (
    <main className="w-full min-h-screen bg-[#FDFDFD]">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="max-w-[1400px] mx-auto py-8 px-4 sm:px-6 lg:px-8 font-[Inter]">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-[#6366F1] rounded-2xl shadow-lg">
                  <Mail className="text-white w-5 h-5" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-[Playfair_Display] font-bold text-gray-900">
                  Customer <span className="text-[#6366F1]">Inquiries</span>
                </h1>
              </div>
              <p className="text-gray-600 ml-0 sm:ml-16">Manage and respond to messages from your visitors</p>
            </div>

            <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-full shadow-sm border border-gray-100">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600 font-medium">Total Messages:</span>
              <span className="text-2xl font-bold text-[#6366F1]">{messages.length}</span>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-3xl shadow-sm hover:shadow-md overflow-hidden border border-gray-100 transition-all duration-500">
          {loading ? (
            <div className="p-20 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#C8813A] mb-4"></div>
              <p className="text-gray-500 font-medium">Loading messages...</p>
            </div>
          ) : messages.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white">
                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">Date</th>
                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                    <th className="px-6 py-5 text-center text-xs font-bold uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {messages.map((msg, index) => (
                    <tr key={msg._id} className={`transition-all duration-300 hover:bg-[#6366F1]/5 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                      <td className="px-6 py-5 text-sm text-gray-600">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#6366F1] flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {/* charAt Error එක මෙතනින් නිවැරදි කර ඇත */}
                            {msg?.firstName ? msg.firstName.charAt(0).toUpperCase() : (msg?.customerName ? msg.customerName.charAt(0).toUpperCase() : "C")}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-sm">{msg?.firstName || msg?.customerName || "Unknown"}</div>
                            <div className="text-xs text-[#6366F1] font-medium">{msg?.customerEmail || "No Email"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-semibold text-gray-700">{msg?.subject || "No Subject"}</td>
                      <td className="px-6 py-5 text-xs">
                        {msg.adminReply ? (
                          <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full font-bold uppercase">Replied</span>
                        ) : (
                          <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full font-bold uppercase">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => setSelectedMsg(msg)} className="p-2 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg border border-blue-100 transition-all">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleDelete(msg._id)} className="p-2 text-red-500 hover:bg-red-500 hover:text-white rounded-lg border border-red-100 transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-20 text-center text-gray-400">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No messages found in your inbox</p>
            </div>
          )}
        </div>
      </div>

      {/* View & Reply Modal */}
      {selectedMsg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden transform transition-all duration-300 scale-100">
              <div className="bg-[#6366F1] p-8 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold font-[Playfair_Display]">Inquiry Details</h2>
                <p className="text-sm opacity-80 mt-1">From: {selectedMsg?.firstName || selectedMsg?.customerName}</p>
              </div>
              <button onClick={() => { setSelectedMsg(null); setReplyText(""); }} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 max-h-[65vh] overflow-y-auto">
              <div className="mb-6">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em]">Subject</label>
                <p className="text-xl font-bold text-gray-800 mt-1">{selectedMsg?.subject}</p>
              </div>

              <div className="mb-8 p-6 bg-gray-50 rounded-3xl border border-gray-100 relative">
                <label className="text-[10px] uppercase font-bold text-[#6366F1] tracking-[0.2em]">Message Body</label>
                <p className="text-gray-700 mt-3 leading-relaxed text-lg">{selectedMsg?.message}</p>
                <div className="mt-6 text-[11px] text-gray-400 flex items-center gap-2">
                    <Clock size={12}/> Received: {selectedMsg?.createdAt ? new Date(selectedMsg.createdAt).toLocaleString() : "Unknown date"}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em]">Response</label>
                {selectedMsg.adminReply ? (
                  <div className="p-6 bg-green-50 text-green-700 rounded-3xl border border-green-100 italic">
                    {selectedMsg.adminReply}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <textarea
                      className="w-full p-5 bg-gray-50 border border-gray-200 rounded-3xl focus:ring-4 focus:ring-[#6366F1]/10 focus:border-[#6366F1] outline-none transition-all min-h-[150px] resize-none"
                      placeholder="Write your response to the customer..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    ></textarea>
                    <button
                      onClick={handleReply}
                      disabled={isSending}
                      className="w-full bg-[#6366F1] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#4F46E5] shadow-lg shadow-[#6366F1]/20 transition-all active:scale-[0.98] disabled:opacity-50">
                    
                      {isSending ? "Sending Reply..." : <><Send size={20} /> Send Message</>}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}