import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast"; // 1. Toast import karanna
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { FaTrashAlt } from "react-icons/fa"; // Delete icon eka panna
import Swal from "sweetalert2"; // SweetAlert2 import karanna

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // 2. Data fetch kireema
  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${backendUrl}/contact/messages`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      setMessages(res.data.data);
      setLoading(false);
    } catch (err) { 
      console.error("Error fetching messages", err);
      toast.error("Failed to load messages!"); // Error toast
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [backendUrl]);

  // 3. Message ekak delete kireeme function eka
 const handleDelete = async (id) => {
  // ලස්සන Confirmation Box එකක් පෙන්වනවා
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33", // Delete button එක රතු පාටින්
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
    background: "#fff",
    borderRadius: "15px"
  }).then(async (result) => {
    
    // පාරිභෝගිකයා "Yes" click කළොත් විතරක් ඇතුළට යනවා
    if (result.isConfirmed) {
      const deleteToast = toast.loading("Deleting message...");
      try {
        const token = localStorage.getItem('token'); 
        
        await axios.delete(`${backendUrl}/contact/delete-message/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        toast.success("Message deleted successfully!", { id: deleteToast });

        // Table එක refresh කරන්න
        setMessages(messages.filter((msg) => msg._id !== id));
        
        // සාර්ථක වුණා කියලා තව පොඩි popup එකක් (Optional)
        Swal.fire("Deleted!", "The message has been deleted.", "success");

      } catch (err) {
        toast.error("Could not delete message.", { id: deleteToast });
        Swal.fire("Error!", "Something went wrong.", "error");
      }
    }
  });
};

  return (
    <main className="w-full min-h-screen bg-gray-50">
      {/* Toast notifications penna toaster eka danna */}
      <Toaster position="top-center" reverseOrder={false} />
      
      <Header />

      <div className="max-w-7xl mx-auto py-20 px-6">
        <div className="mb-10 text-center md:text-left flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-bold text-gray-900">Customer <span className="text-orange-500">Inquiries</span></h2>
            <p className="text-gray-500 mt-2">Manage and respond to messages from your visitors.</p>
            <div className="w-20 h-1.5 bg-orange-500 mt-4 rounded-full"></div>
          </div>
          <div className="text-gray-400 font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
            Total: {messages.length}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
          {loading ? (
            <div className="p-20 text-center font-bold text-gray-500">Loading messages...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="p-6 font-semibold uppercase text-sm tracking-wider">Date</th>
                    <th className="p-6 font-semibold uppercase text-sm tracking-wider">Customer</th>
                    <th className="p-6 font-semibold uppercase text-sm tracking-wider">Subject</th>
                    <th className="p-6 font-semibold uppercase text-sm tracking-wider">Message</th>
                    <th className="p-6 font-semibold uppercase text-sm tracking-wider text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {messages.length > 0 ? (
                    messages.map((msg) => (
                      <tr key={msg._id} className="hover:bg-orange-50/30 transition-colors">
                        <td className="p-6 text-sm text-gray-500">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-6">
                          <div className="font-bold text-gray-900">{msg.customerName}</div>
                          <div className="text-xs text-orange-500 font-medium">{msg.customerEmail}</div>
                        </td>
                        <td className="p-6">
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase border border-gray-200">
                            {msg.subject || "Inquiry"}
                          </span>
                        </td>
                        <td className="p-6 text-gray-600 text-sm max-w-xs">
                           <p className="line-clamp-2">{msg.message}</p>
                        </td>
                        <td className="p-6 text-center">
                          <button 
                            onClick={() => handleDelete(msg._id)}
                            className="p-3 text-red-500 hover:bg-red-50 rounded-full transition-all active:scale-90"
                            title="Delete Message"
                          >
                            <FaTrashAlt />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-20 text-center text-gray-400 italic">
                        No messages found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}