import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { 
  FaCalendarAlt, FaHotel, FaCreditCard, 
  FaTrashAlt, FaHistory, FaStar, FaCommentDots, FaTimes, FaMapMarkerAlt
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Review Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { userId } = useParams(); 
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // --- Functions ---
  const fetchBookings = async () => {
    const cleanId = userId?.startsWith(":") ? userId.substring(1) : userId;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendUrl}/bookings/user/${cleanId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.data) {
        setBookings(response.data.data);
      }
    } catch (error) {
      toast.error("Cannot get your booking data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchBookings();
  }, [userId, backendUrl]);

  // Review එක Submit කරන Logic එක
  const handleSubmitReview = async () => {
    if (!comment) return toast.error("Please write a comment.");
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${backendUrl}/reviews`, {
        bookingId: selectedBooking._id,
        rating,
        comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Thank you for your review!");
      setIsModalOpen(false);
      setComment("");
      setRating(5);
      
      // Redirect to appropriate overview page
      if (response.data?.redirect) {
        const { page, id } = response.data.redirect;
        setTimeout(() => {
          if (page === 'package_overview') {
            navigate(`/package-details/${id}`);
          } else if (page === 'hotel_overview') {
            navigate(`/hotel-details/${id}`);
          }
        }, 1500);
      } else {
        // Fallback: refresh bookings
        fetchBookings();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  // Checkout වුණාද කියා බලන Logic එක
  const canReview = (booking) => {
    const today = new Date();
    const checkOutDate = new Date(booking.checkOut);
    return booking.status === "Confirmed" && today > checkOutDate;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-900 border-solid mb-4"></div>
      <p className="text-blue-900 font-black tracking-widest text-[10px] uppercase">Syncing your trips...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfcfc] pt-28 pb-20 px-4 md:px-12">
      <Toaster position="top-right" />
      
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-16 border-b border-slate-100 pb-10 text-left">
        <div className="flex items-center gap-4 mb-4">
            <div className="h-1 bg-blue-900 w-12"></div>
            <span className="text-blue-900 font-black text-[10px] uppercase tracking-widest">Traveler History</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-slate-800 tracking-tighter uppercase leading-none">
          My Journey <br/><span className="text-blue-900 italic">Portfolio</span>
        </h1>
      </div>

      {/* Bookings List */}
      <div className="max-w-6xl mx-auto space-y-12">
        {bookings.map((booking) => (
          <div key={booking._id} className="group bg-white rounded-[3rem] shadow-2xl flex flex-col lg:flex-row overflow-hidden border border-slate-50 transition-all duration-500 hover:shadow-blue-100">
            {/* Visual Section */}
            <div className="lg:w-[450px] h-72 lg:h-auto relative overflow-hidden bg-slate-200">
              <img src={booking.hotelId?.images?.[0] || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Hotel" />
              <div className={`absolute top-8 left-8 px-6 py-2 rounded-full text-[10px] font-black uppercase shadow-2xl ${booking.status === 'Confirmed' ? 'bg-green-500 text-white' : 'bg-amber-400 text-slate-900'}`}>{booking.status}</div>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-10 lg:p-14 flex flex-col justify-between">
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
                  <div>
                    <h2 className="text-4xl font-black text-slate-800 uppercase italic leading-none mb-3">{booking.roomType} Suite</h2>
                    <div className="flex items-center gap-2 text-blue-600 font-black text-[11px] tracking-[0.2em] uppercase"><FaMapMarkerAlt /> {booking.country}</div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-right min-w-[200px]">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Grand Total</p>
                    <p className="text-4xl font-black text-blue-900 font-mono italic leading-none">LKR {booking.totalPrice?.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="flex items-center gap-5 text-left">
                    <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-900 shadow-sm"><FaCalendarAlt size={22}/></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Check-In — Check-Out</p>
                      <p className="font-bold text-slate-700 text-lg">{new Date(booking.checkIn).toLocaleDateString()} — {new Date(booking.checkOut).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-10 border-t border-slate-50 flex flex-wrap gap-6 items-center justify-between">
                <div className="flex items-center gap-6">
                  {/* REVIEW BUTTON - මෙතන තමයි වැදගත්ම කොටස */}
                  {canReview(booking) && (
                    <button 
                      onClick={() => { setSelectedBooking(booking); setIsModalOpen(true); }}
                      className="bg-amber-400 text-slate-900 px-10 py-4 rounded-full font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-slate-900 hover:text-white transition-all flex items-center gap-3 active:scale-95"
                    >
                      <FaCommentDots /> Review Trip
                    </button>
                  )}
                  
                  {booking.status === "Pending" && (
                    <button onClick={() => navigate('/payment')} className="bg-blue-900 text-white px-10 py-4 rounded-full font-black text-[11px] uppercase tracking-widest shadow-xl">Complete Payment</button>
                  )}
                </div>
                <div className="text-[11px] font-bold text-slate-300 uppercase italic">Ref: {booking._id}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- REVIEW MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800 transition-colors"><FaTimes size={20}/></button>
            
            <div className="p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 bg-amber-400 w-8"></div>
                <span className="text-amber-500 font-black text-[10px] uppercase tracking-widest">Feedback</span>
              </div>
              <h2 className="text-4xl font-black text-slate-800 uppercase italic leading-none mb-4">Rate Your <br/>Experience</h2>
              <p className="text-slate-400 font-medium mb-10 italic">How was your stay at the suite?</p>

              {/* Star Rating */}
              <div className="flex gap-3 mb-10 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} className="transition-transform active:scale-90">
                    <FaStar size={36} className={star <= rating ? "text-amber-400" : "text-slate-100"} />
                  </button>
                ))}
              </div>

              {/* Comment Field */}
              <textarea 
                rows="4" 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts with other travelers..."
                className="w-full bg-slate-50 border-none rounded-3xl p-6 text-slate-700 font-medium focus:ring-2 focus:ring-blue-100 transition-all outline-none mb-8 placeholder:italic"
              />

              <button 
                onClick={handleSubmitReview}
                disabled={submitting}
                className="w-full bg-blue-900 text-white py-6 rounded-full font-black text-[11px] uppercase tracking-widest shadow-2xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
              >
                {submitting ? "Submitting Portfolio..." : "Post My Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;