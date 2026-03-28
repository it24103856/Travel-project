import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { CalendarCheck, User, RefreshCw, Trash2, Clock, CheckCircle, XCircle } from "lucide-react";

export default function AdminBookingPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) { toast.error("Please login as Admin"); return; }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${backendUrl}/bookings/all`, config);
      if (response.data && response.data.success) { setBookings(response.data.data || []); } else { setBookings([]); }
    } catch (error) { toast.error("Could not load bookings."); } finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleStatusChange = async (bookingId, newStatus) => {
    const loadingToastId = toast.loading(`Updating to ${newStatus}...`);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${backendUrl}/bookings/update-status/${bookingId}`, { status: newStatus }, config);
      toast.success(`Booking status updated to ${newStatus}`, { id: loadingToastId });
      fetchBookings(); 
    } catch (error) { toast.error(error.response?.data?.message || "Could not update status.", { id: loadingToastId }); }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    const loadingToastId = toast.loading("Deleting booking...");
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${backendUrl}/bookings/delete/${bookingId}`, config);
      toast.success("Booking deleted!", { id: loadingToastId });
      fetchBookings();
    } catch (error) { toast.error("Could not delete booking.", { id: loadingToastId }); }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-8 font-[Inter]">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-[Playfair_Display] font-bold text-gray-900 flex items-center gap-3">
              <span className="p-3 bg-[#00AEEF] text-white rounded-2xl shadow-lg"><CalendarCheck size={20} /></span>
              Booking Management
            </h1>
            <p className="text-gray-400 text-sm mt-2 font-medium">Monitor and manage customer travel reservations in real-time.</p>
          </div>
          <button onClick={fetchBookings} disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-white text-[#00AEEF] font-bold rounded-full shadow-sm hover:shadow-md transition-all duration-500 active:scale-95 disabled:opacity-50 uppercase tracking-widest text-xs border border-gray-100">
            <RefreshCw className={loading ? "animate-spin" : ""} size={16} />
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl overflow-hidden transition-all duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gradient-to-r from-[#00AEEF] to-[#0095cc] text-white text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5">Customer Details</th>
                  <th className="px-8 py-5">Date & Package</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-center">Action</th>
                  <th className="px-8 py-5 text-right">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-[#00AEEF]/5 transition-all duration-500 group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#00AEEF]/5 rounded-full flex items-center justify-center text-[#00AEEF] overflow-hidden border-2 border-[#00AEEF]/10">
                            {booking.userId?.image ? (
                              <img src={booking.userId.image} alt="Profile" className="w-full h-full object-cover" />
                            ) : (<User size={18} />)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">
                              {booking.userId ? `${booking.userId.firstName} ${booking.userId.lastName}` : "Unknown Guest"}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium">{booking.userId?.email || "no contact info"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-semibold text-gray-700">{booking.date ? new Date(booking.date).toLocaleDateString() : "N/A"}</p>
                        <p className="text-[10px] text-[#00AEEF] font-bold uppercase tracking-wider">{booking.category || "GENERAL TOUR"}</p>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter inline-flex items-center gap-1 ${
                          booking.status === 'Confirmed' ? 'bg-green-100 text-green-600' :
                          booking.status === 'Cancelled' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {booking.status === 'Confirmed' && <CheckCircle size={12} />}
                          {booking.status === 'Cancelled' && <XCircle size={12} />}
                          {booking.status === 'Pending' && <Clock size={12} />}
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <select value={booking.status} onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                          className="bg-gray-50 border border-gray-200 text-gray-600 text-[11px] font-bold rounded-full px-3 py-2 outline-none focus:ring-2 focus:ring-[#00AEEF]/20 focus:border-[#00AEEF] transition-all duration-500 cursor-pointer">
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button onClick={() => handleDeleteBooking(booking._id)} className="p-2 text-gray-300 hover:text-red-500 transition-all duration-500">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center text-gray-400 font-medium">
                      {loading ? "Loading bookings..." : "No bookings found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}