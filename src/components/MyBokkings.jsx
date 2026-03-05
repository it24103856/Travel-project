import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { 
  FaCalendarAlt, FaHotel, FaCreditCard, 
  FaTrashAlt, FaUserCircle, FaMapMarkerAlt, FaHistory 
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const { userId } = useParams(); 
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchBookings = async () => {
      const cleanId = userId?.startsWith(":") ? userId.substring(1) : userId;

      console.log("Fetching bookings for User ID:", cleanId);

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
       const response = await axios.get(`${backendUrl}/bookings/user/${cleanId}`, {
    headers: { Authorization: `Bearer ${token}` }
});
        
        console.log("Data from DB:", response.data.data);

        if (response.data && response.data.data) {
          setBookings(response.data.data);
        }
      } catch (error) {
        console.error("Fetch Error:", error.response || error);
        toast.error("Cannot get your booking data.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchBookings();
    }
  }, [userId, backendUrl]);

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await axios.delete(`${backendUrl}/bookings/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBookings(prev => prev.filter(b => b._id !== id));
      toast.success("වෙන්කිරීම සාර්ථකව අවලංගු කරන ලදී.");
    } catch (error) {
      toast.error("අවලංගු කිරීම අසාර්ථකයි.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-900 border-solid mb-4"></div>
        <p className="text-blue-900 font-black tracking-widest text-[10px] uppercase">Syncing your trips...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] pt-28 pb-20 px-4 md:px-12">
      <Toaster position="top-right" />
      
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-16 border-b border-slate-100 pb-10">
        <div className="flex items-center gap-4 mb-4">
            <div className="h-1 bg-blue-900 w-12"></div>
            <span className="text-blue-900 font-black text-[10px] uppercase tracking-widest text-center">Traveler History</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-slate-800 tracking-tighter uppercase leading-none">
          My Journey <br/><span className="text-blue-900 italic">Portfolio</span>
        </h1>
        <p className="text-slate-400 mt-6 font-bold flex items-center gap-2">
           <FaHistory /> Tracking ID: <span className="text-slate-800">{userId?.replace(':', '')}</span>
        </p>
      </div>

      {/* Bookings List */}
      <div className="max-w-6xl mx-auto space-y-12">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <div 
              key={booking._id} 
              className="group bg-white rounded-[3rem] shadow-2xl flex flex-col lg:flex-row overflow-hidden border border-slate-50 transition-all duration-500 hover:shadow-blue-100"
            >
              {/* Hotel Image / Visual */}
              <div className="lg:w-[450px] h-72 lg:h-auto relative overflow-hidden bg-slate-200">
                <img 
                  src={booking.hotelId?.images?.[0] || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800"} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                  alt="Destination" 
                />
                <div className={`absolute top-8 left-8 px-6 py-2 rounded-full text-[10px] font-black uppercase shadow-2xl ${
                  booking.status === 'Confirmed' ? 'bg-green-500 text-white' : 
                  booking.status === 'Cancelled' ? 'bg-red-500 text-white' : 'bg-amber-400 text-slate-900'
                }`}>
                  {booking.status}
                </div>
              </div>

              {/* Information Section */}
              <div className="flex-1 p-10 lg:p-14 flex flex-col justify-between">
                <div>
                  <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
                    <div>
                      <h2 className="text-4xl font-black text-slate-800 uppercase italic leading-none mb-3">
                        {booking.roomType} Suite
                      </h2>
                      <div className="flex items-center gap-2 text-blue-600 font-black text-[11px] tracking-[0.2em] uppercase">
                        <FaMapMarkerAlt /> {booking.country || "Luxury Destination"}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-right min-w-[200px]">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Grand Total</p>
                      <p className="text-4xl font-black text-blue-900 font-mono italic leading-none">
                        LKR {booking.totalPrice?.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-900 shadow-sm"><FaCalendarAlt size={22}/></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Check-In — Check-Out</p>
                        <p className="font-bold text-slate-700 text-lg">
                          {new Date(booking.checkIn).toLocaleDateString()} — {new Date(booking.checkOut).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm"><FaHotel size={22}/></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Room Category</p>
                        <p className="font-bold text-slate-700 text-lg">{booking.roomType} ({booking.adults} Adults)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-10 border-t border-slate-50 flex flex-wrap gap-6 items-center justify-between">
                  <div className="flex items-center gap-6">
                    {booking.status === "Pending" && (
                      <button 
                        onClick={() => navigate(`/payment/checkout/${booking._id}`, { state: { amount: booking.totalPrice } })}
                        className="bg-blue-900 text-white px-12 py-5 rounded-full font-black text-[11px] uppercase tracking-widest shadow-2xl hover:bg-slate-800 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3"
                      >
                        <FaCreditCard /> Complete Payment
                      </button>
                    )}
                    {booking.status !== "Cancelled" && (
                      <button 
                        onClick={() => handleCancelBooking(booking._id)}
                        className="text-red-500 font-black text-[11px] uppercase tracking-widest hover:text-red-700 transition-all"
                      >
                        Cancel Reservation
                      </button>
                    )}
                  </div>
                  <div className="text-[11px] font-bold text-slate-300 tracking-tighter uppercase italic">
                    Reference: {booking._id}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 shadow-inner">
            <FaHotel className="mx-auto text-8xl text-slate-50 mb-8" />
            <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">No Active Reservations</h3>
            <p className="text-slate-400 mt-4 font-medium max-w-sm mx-auto leading-relaxed italic">
            
            </p>
            <button onClick={() => navigate('/hotels')} className="mt-12 bg-blue-900 text-white px-14 py-5 rounded-full font-black text-[12px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">
              Discover Destinations
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;