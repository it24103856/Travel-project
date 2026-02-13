import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast"; 
import { FaTrashAlt, FaEnvelope, FaClock, FaUser } from "react-icons/fa"; 
import Swal from "sweetalert2"; 


export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);


  const backendUrl = import.meta.env.VITE_BACKEND_URL;


  // 1. මැසේජ් ටික Backend එකෙන් ගමු
  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${backendUrl}/contact/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      setMessages(res.data.data);
      setLoading(false);
    } catch (err) { 
      console.error("Error fetching messages", err);
      toast.error("Failed to load messages!"); 
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchMessages();
  }, [backendUrl]);


  // 2. මැසේජ් එකක් Delete කරන function එක (දැන් තියෙන්නේ එකයි)
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This message will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
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


          // Table එක refresh කරන්න (State update)
          setMessages(messages.filter((msg) => msg._id !== id));
          
          Swal.fire("Deleted!", "The message has been deleted.", "success");


        } catch (err) {
          toast.error("Could not delete message.", { id: deleteToast });
          Swal.fire("Error!", "Something went wrong. Check backend route.", "error");
        }
      }
    });
  };


  return (
    <main className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50">
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="max-w-[1400px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                  <FaEnvelope className="text-white text-xl" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Customer <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Inquiries</span>
                </h1>
              </div>
              <p className="text-gray-600 ml-16">Manage and respond to messages from your visitors</p>
            </div>
            
            <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl shadow-md border border-gray-100">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600 font-medium">Total Messages:</span>
              <span className="text-2xl font-bold text-orange-500">{messages.length}</span>
            </div>
          </div>
        </div>


        {/* Messages Container */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {loading ? (
            <div className="p-20 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-orange-500 mb-4"></div>
              <p className="text-gray-500 font-medium">Loading messages...</p>
            </div>
          ) : messages.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaClock className="text-orange-400" />
                        Date
                      </div>
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-orange-400" />
                        Customer
                      </div>
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-5 text-center text-xs font-bold uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {messages.map((msg, index) => (
                    <tr 
                      key={msg._id} 
                      className={`
                        transition-all duration-200 hover:bg-gradient-to-r hover:from-orange-50 hover:to-transparent
                        ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                      `}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-10 bg-orange-400 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-600">
                            {new Date(msg.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            {msg.customerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-sm">{msg.customerName}</div>
                            <div className="text-xs text-orange-600 font-medium flex items-center gap-1">
                              <FaEnvelope className="text-[10px]" />
                              {msg.customerEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-lg text-xs font-bold uppercase border border-gray-200 shadow-sm">
                          {msg.subject || "General Inquiry"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm text-gray-600 line-clamp-2 max-w-md leading-relaxed">
                          {msg.message}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                          <button 
                            onClick={() => handleDelete(msg._id)}
                            className="group p-3 text-red-500 hover:text-white hover:bg-red-500 rounded-xl transition-all duration-200 active:scale-95 shadow-sm hover:shadow-lg border border-red-200 hover:border-red-500"
                            title="Delete Message"
                          >
                            <FaTrashAlt className="group-hover:scale-110 transition-transform" />
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
                <FaEnvelope className="text-3xl text-gray-400" />
              </div>
              <p className="text-gray-400 text-lg font-medium">No messages found</p>
              <p className="text-gray-400 text-sm mt-1">Customer inquiries will appear here</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
