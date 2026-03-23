import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // This is needed to read the token
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowRight, FaArrowLeft, FaBed } from "react-icons/fa";

export default function TravelBookingUI() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
    selectedRoom: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";
        const response = await axios.get(`${backendUrl}/hotels/get/${id}`);

        if (response.data && response.data.success) {
          const hotelData = response.data.data;
          setDetails(hotelData);
          if (hotelData.roomTypes?.length > 0) {
            setFormData((prev) => ({ ...prev, selectedRoom: hotelData.roomTypes[0] }));
          }
        }
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const updateCount = (field, type) => {
    setFormData((prev) => ({
      ...prev,
      [field]: type === "inc" ? prev[field] + 1 : Math.max(0, prev[field] - 1),
    }));
  };

  const handleBookingSubmit = async () => {
    // 1. Validation - Check mandatory data
    if (!formData.firstName || !formData.email || !formData.checkIn || !formData.checkOut) {
      toast.error("Please fill in all essential details (Name, Email, Dates)!");
      setStep(1);
      return;
    }

    try {
      setIsSubmitting(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";
      
      const token = localStorage.getItem("token");

      // 2. Check token
      if (!token) {
        toast.error("You are not logged in! Please login first.");
        setIsSubmitting(false);
        return;
      }

      // 3. Get User ID (by decoding the token)
      let userId;
      try {
        const decoded = jwtDecode(token);
        userId = decoded.id; // Your token contains the "id" property
      } catch (decodeError) {
        console.error("Token Decode Error:", decodeError);
        toast.error("Session expired or invalid. Please login again.");
        return;
      }

      if (!userId) {
        toast.error("Could not verify User ID. Please log out and login again.");
        return;
      }

      // 4. Prepare payload to match the Backend Schema
      // 4. Match the required field names in the Backend Schema
      const payload = {
        hotelId: id,
        userId: userId, 
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        
        // වැදගත්: Backend එක 'checkIn' සහ 'roomType' බලාපොරොත්තු වන නිසා ඒවා එලෙසම ලබා දිය යුතුයි
        checkIn: formData.checkIn, 
        checkOut: formData.checkOut,
        roomType: formData.selectedRoom?.type || "Standard", 
        
        adults: formData.adults,
        children: formData.children,
        totalPrice: formData.selectedRoom?.finalPrice,
        status: "Pending" 
      };

      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        } 
      };
      
      // 5. Request එක යැවීම
      const response = await axios.post(`${backendUrl}/bookings/create`, payload, config);

      if (response.data.success && response.data.data) {
        toast.success("Booking Successful!");
        // Navigate to payment page with booking details
        setTimeout(() => navigate('/payment', { 
          state: { 
            bookingDetails: {
              bookingId: response.data.data._id,
              total: formData.selectedRoom?.finalPrice,
              currency: "LKR",
              discountPercentage: 0
            }
          } 
        }), 1500);
      }
    } catch (err) {
      console.error("Booking Error Full Detail:", err.response?.data || err);
      const errorMessage = err.response?.data?.message || "Server Error: Could not create booking.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  if (loading) return (
    <div className="h-screen bg-[#80cf9b] flex items-center justify-center text-white font-black italic animate-pulse text-2xl uppercase">
      Loading your journey...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#80cf9b] flex items-center justify-center p-4 font-sans text-white">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="w-full max-w-5xl bg-[#80cf9b] rounded-[3rem] border border-white/20 shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[700px]">
        
        {/* Left Sidebar */}
        <div className="w-full md:w-1/3 bg-[#1e3a4c] p-12 flex flex-col justify-between">
          <div>
            <h1 className="text-white text-5xl font-black italic uppercase leading-none mb-2 tracking-tighter">JOURNEY.</h1>
            <p className="text-[#facc15] font-bold text-[10px] uppercase tracking-[0.2em]">📍 {details?.city || "Destination"}</p>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 w-10 rounded-full transition-all duration-500 ${step >= s ? "bg-[#facc15]" : "bg-white/20"}`} />
            ))}
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 bg-[#a3d9b5] p-12 flex flex-col justify-center relative">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h2 className="text-white text-4xl font-black italic uppercase tracking-tighter">Person Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <input name="firstName" value={formData.firstName} onChange={handleInputChange} type="text" placeholder="First Name" className="bg-white/30 rounded-2xl p-4 text-white placeholder:text-white/60 outline-none focus:bg-white/40" />
                  <input name="lastName" value={formData.lastName} onChange={handleInputChange} type="text" placeholder="Last Name" className="bg-white/30 rounded-2xl p-4 text-white placeholder:text-white/60 outline-none focus:bg-white/40" />
                </div>
                <input name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="Email Address" className="w-full bg-white/30 rounded-2xl p-4 text-white placeholder:text-white/60 outline-none focus:bg-white/40" />
                <div className="grid grid-cols-2 gap-4">
                  <input name="phone" value={formData.phone} onChange={handleInputChange} type="tel" placeholder="Telephone No" className="bg-white/30 rounded-2xl p-4 text-white placeholder:text-white/60 outline-none focus:bg-white/40" />
                  <input name="country" value={formData.country} onChange={handleInputChange} type="text" placeholder="Country" className="bg-white/30 rounded-2xl p-4 text-white placeholder:text-white/60 outline-none focus:bg-white/40" />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h2 className="text-white text-4xl font-black italic uppercase tracking-tighter">Select Room</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                    <p className="text-[8px] text-white/50 font-bold uppercase ml-1">Check-in</p>
                    <input name="checkIn" value={formData.checkIn} onChange={handleInputChange} type="date" className="w-full bg-transparent text-white text-xs font-bold outline-none" />
                  </div>
                  <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                    <p className="text-[8px] text-white/50 font-bold uppercase ml-1">Check-out</p>
                    <input name="checkOut" value={formData.checkOut} onChange={handleInputChange} type="date" className="w-full bg-transparent text-white text-xs font-bold outline-none" />
                  </div>
                </div>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                  {details?.roomTypes?.map((room) => (
                    <div key={room._id} onClick={() => setFormData({ ...formData, selectedRoom: room })} className={`p-4 rounded-[2rem] cursor-pointer transition-all flex justify-between items-center border-2 ${formData.selectedRoom?._id === room._id ? "bg-[#facc15] border-[#facc15] text-black shadow-lg" : "bg-white/10 border-white/5 hover:border-white/20"}`}>
                      <div className="flex items-center gap-3">
                        <FaBed className={formData.selectedRoom?._id === room._id ? "text-black" : "text-[#facc15]"} />
                        <div>
                          <p className="font-black uppercase text-[10px] tracking-tight">{room.type}</p>
                          <p className="text-[8px] font-bold opacity-60 italic">Sleeps {room.maxGuests}</p>
                        </div>
                      </div>
                      <p className="font-black text-lg italic tracking-tighter">$ {room.finalPrice}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 bg-white/10 p-4 rounded-2xl flex justify-between items-center border border-white/10">
                    <span className="text-white/60 text-[10px] font-black uppercase">Adults</span>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => updateCount("adults", "dec")} className="text-[#facc15] font-black text-lg">-</button>
                      <span className="text-white font-black text-xs w-4 text-center">{formData.adults}</span>
                      <button type="button" onClick={() => updateCount("adults", "inc")} className="text-[#facc15] font-black text-lg">+</button>
                    </div>
                  </div>
                  <div className="flex-1 bg-white/10 p-4 rounded-2xl flex justify-between items-center border border-white/10">
                    <span className="text-white/60 text-[10px] font-black uppercase">Kids</span>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => updateCount("children", "dec")} className="text-[#facc15] font-black text-lg">-</button>
                      <span className="text-white font-black text-xs w-4 text-center">{formData.children}</span>
                      <button type="button" onClick={() => updateCount("children", "inc")} className="text-[#facc15] font-black text-lg">+</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h2 className="text-white text-4xl font-black italic uppercase tracking-tighter">Summary</h2>
                <div className="bg-white/20 p-8 rounded-[3rem] text-white shadow-inner space-y-4">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="opacity-60 uppercase text-[10px] font-black">Guest Name</span>
                    <span className="font-black italic">{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="opacity-60 uppercase text-[10px] font-black">Room Type</span>
                    <span className="font-black italic text-[#1e3a4c]">{formData.selectedRoom?.type}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <span className="font-black uppercase text-sm italic">Grand Total</span>
                    <span className="text-4xl font-black text-[#facc15] italic drop-shadow-md">$ {formData.selectedRoom?.finalPrice}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 flex justify-between items-center">
            {step > 1 ? (
              <button type="button" onClick={prevStep} className="text-white font-bold uppercase text-[10px] flex items-center gap-2 hover:text-black transition-colors">
                <FaArrowLeft /> BACK
              </button>
            ) : <div />}
            
            <button
              disabled={isSubmitting}
              type="button"
              onClick={step === 3 ? handleBookingSubmit : nextStep}
              className={`${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#facc15] hover:bg-white"} text-black px-12 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 shadow-xl transition-all active:scale-95`}
            >
              {isSubmitting ? "PROCESSING..." : step === 3 ? "CONFIRM BOOKING" : "NEXT STEP"} <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}