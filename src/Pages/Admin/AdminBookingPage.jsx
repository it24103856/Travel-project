import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { FaCalendarCheck, FaUser, FaSyncAlt, FaTrashAlt, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function AdminBookingPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // දත්ත ලබාගැනීමේ ශ්‍රිතය
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login as Admin");
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Backend Route එක '/booking/get-all' බව තහවුරු කරගන්න
      const response = await axios.get(`${backendUrl}/bookings/all`, config);

      if (response.data && response.data.success) {
        setBookings(response.data.data || []);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Could not load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (bookingId, newStatus) => {
    const loadingToastId = toast.loading(`Updating to ${newStatus}...`);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Backend එකේ router.patch නම් මෙතැන patch ලෙස භාවිතා කරන්න
      await axios.put(`${backendUrl}/bookings/update-status/${bookingId}`, { status: newStatus }, config);
      
      toast.success(`Booking status updated to ${newStatus}`, { id: loadingToastId });
      fetchBookings(); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update status.", { id: loadingToastId });
    }
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
    } catch (error) {
      toast.error("Could not delete booking.", { id: loadingToastId });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8 font-poppins">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <span className="p-3 bg-orange-500 text-white rounded-2xl shadow-lg">
                <FaCalendarCheck />
              </span>
              Booking Management
            </h1>
            <p className="text-slate-400 text-sm mt-2 font-medium">
              Monitor and manage customer travel reservations in real-time.
            </p>
          </div>
          <button 
            onClick={fetchBookings} 
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-white text-orange-600 font-bold rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} />
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5">Customer Details</th>
                  <th className="px-8 py-5">Date & Package</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-center">Action</th>
                  <th className="px-8 py-5 text-right">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-slate-50/50 transition-colors group">
                      
                      {/* Customer Info WITH IMAGE & FULL NAME */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 overflow-hidden border-2 border-slate-200">
                            {booking.userId?.image ? (
                                <img 
                                    src={booking.userId.image} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <FaUser size={18} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              {/* මෙතැනින් සම්පූර්ණ නම පෙන්වයි */}
                              {booking.userId 
                                ? `${booking.userId.firstName} ${booking.userId.lastName}` 
                                : "Unknown Guest"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                                {booking.userId?.email || "no contact info"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-6">
                        <p className="text-sm font-semibold text-slate-700">
                          {booking.date ? new Date(booking.date).toLocaleDateString() : "N/A"}
                        </p>
                        <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wider">
                          {booking.category || "GENERAL TOUR"}
                        </p>
                      </td>

                      <td className="px-8 py-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter inline-flex items-center gap-1 ${
                          booking.status === 'Confirmed' ? 'bg-green-100 text-green-600' :
                          booking.status === 'Cancelled' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {booking.status === 'Confirmed' && <FaCheckCircle />}
                          {booking.status === 'Cancelled' && <FaTimesCircle />}
                          {booking.status === 'Pending' && <FaClock />}
                          {booking.status}
                        </span>
                      </td>

                      <td className="px-8 py-6 text-center">
                        <select 
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-bold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => handleDeleteBooking(booking._id)}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <FaTrashAlt size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-medium">
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