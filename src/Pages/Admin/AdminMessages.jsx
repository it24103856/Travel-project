import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast"; 
import { Trash2, Mail, Clock, User } from "lucide-react"; 
import Swal from "sweetalert2"; 

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${backendUrl}/contact/messages`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setMessages(res.data.data);
      setLoading(false);
    } catch (err) { 
      console.error("Error fetching messages", err);
      toast.error("Failed to load messages!"); 
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, [backendUrl]);

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This message will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#00AEEF",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const deleteToast = toast.loading("Deleting message...");
        try {
          const token = localStorage.getItem('token'); 
          await axios.delete(`${backendUrl}/contact/delete-message/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
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
      
      <div className="max-w-[1400px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-[#00AEEF] rounded-2xl shadow-lg">
                  <Mail className="text-white w-5 h-5" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-[Playfair_Display] font-bold text-gray-900">
                  Customer <span className="text-[#00AEEF]">Inquiries</span>
                </h1>
              </div>
              <p className="text-gray-600 ml-16 font-[Inter]">Manage and respond to messages from your visitors</p>
            </div>
            
            <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-full shadow-sm border border-gray-100">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600 font-medium font-[Inter]">Total Messages:</span>
              <span className="text-2xl font-bold text-[#00AEEF]">{messages.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm hover:shadow-xl overflow-hidden border border-gray-100 transition-all duration-500">
          {loading ? (
            <div className="p-20 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#00AEEF] mb-4"></div>
              <p className="text-gray-500 font-medium font-[Inter]">Loading messages...</p>
            </div>
          ) : messages.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-[#00AEEF] to-[#0095cc] text-white">
                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-2"><Clock size={14} /> Date</div>
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-2"><User size={14} /> Customer</div>
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">Message</th>
                    <th className="px-6 py-5 text-center text-xs font-bold uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {messages.map((msg, index) => (
                    <tr key={msg._id} className={`transition-all duration-500 hover:bg-[#00AEEF]/5 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-10 bg-[#00AEEF] rounded-full"></div>
                          <span className="text-sm font-medium text-gray-600 font-[Inter]">
                            {new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#00AEEF] flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            {msg.customerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-sm font-[Inter]">{msg.customerName}</div>
                            <div className="text-xs text-[#00AEEF] font-medium flex items-center gap-1">
                              <Mail size={10} /> {msg.customerEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase border border-gray-200">{msg.subject || "General Inquiry"}</span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm text-gray-600 line-clamp-2 max-w-md leading-relaxed font-[Inter]">{msg.message}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                          <button onClick={() => handleDelete(msg._id)} className="group p-3 text-red-500 hover:text-white hover:bg-red-500 rounded-xl transition-all duration-500 active:scale-95 shadow-sm hover:shadow-lg border border-red-200 hover:border-red-500" title="Delete Message">
                            <Trash2 className="group-hover:scale-110 transition-transform" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-20 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Mail className="text-gray-400 w-8 h-8" />
              </div>
              <p className="text-gray-400 text-lg font-medium font-[Inter]">No messages found</p>
              <p className="text-gray-400 text-sm mt-1 font-[Inter]">Customer inquiries will appear here</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
