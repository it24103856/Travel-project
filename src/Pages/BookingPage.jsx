import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Bed } from "lucide-react";

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
    if (!formData.firstName || !formData.email || !formData.checkIn || !formData.checkOut) {
      toast.error("Please fill in all essential details (Name, Email, Dates)!");
      setStep(1);
      return;
    }

    try {
      setIsSubmitting(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("You are not logged in! Please login first.");
        setIsSubmitting(false);
        return;
      }

      let userId;
      try {
        const decoded = jwtDecode(token);
        userId = decoded.id;
      } catch (decodeError) {
        console.error("Token Decode Error:", decodeError);
        toast.error("Session expired or invalid. Please login again.");
        return;
      }

      if (!userId) {
        toast.error("Could not verify User ID. Please log out and login again.");
        return;
      }

      const payload = {
        hotelId: id,
        userId: userId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
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

      const response = await axios.post(`${backendUrl}/bookings/create`, payload, config);

      if (response.data.success && response.data.data) {
        toast.success("Booking Successful!");
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
    <div className="h-screen bg-[#FDFDFD] flex items-center justify-center text-gray-900 font-bold italic animate-pulse text-2xl" style={{ fontFamily: "'Playfair Display', serif" }}>
      Loading your journey...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="w-full max-w-5xl bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[700px]">

        {/* Left Sidebar */}
        <div className="w-full md:w-1/3 bg-gray-900 p-12 flex flex-col justify-between">
          <div>
            <h1 className="text-white text-5xl font-bold italic leading-none mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>JOURNEY.</h1>
            <p className="text-[#00AEEF] font-bold text-[10px] uppercase tracking-[0.2em]">📍 {details?.city || "Destination"}</p>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 w-10 rounded-full transition-all duration-500 ${step >= s ? "bg-[#00AEEF]" : "bg-white/20"}`} />
            ))}
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 bg-[#FAFAFA] p-12 flex flex-col justify-center relative">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h2 className="text-gray-900 text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Personal <span className="italic text-[#00AEEF]">Details</span></h2>
                <div className="grid grid-cols-2 gap-4">
                  <input name="firstName" value={formData.firstName} onChange={handleInputChange} type="text" placeholder="First Name" className="bg-white rounded-2xl p-4 text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#00AEEF]/30 border border-gray-100 transition-all duration-500" />
                  <input name="lastName" value={formData.lastName} onChange={handleInputChange} type="text" placeholder="Last Name" className="bg-white rounded-2xl p-4 text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#00AEEF]/30 border border-gray-100 transition-all duration-500" />
                </div>
                <input name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="Email Address" className="w-full bg-white rounded-2xl p-4 text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#00AEEF]/30 border border-gray-100 transition-all duration-500" />
                <div className="grid grid-cols-2 gap-4">
                  <input name="phone" value={formData.phone} onChange={handleInputChange} type="tel" placeholder="Telephone No" className="bg-white rounded-2xl p-4 text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#00AEEF]/30 border border-gray-100 transition-all duration-500" />
                  <input name="country" value={formData.country} onChange={handleInputChange} type="text" placeholder="Country" className="bg-white rounded-2xl p-4 text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#00AEEF]/30 border border-gray-100 transition-all duration-500" />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h2 className="text-gray-900 text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Select <span className="italic text-[#00AEEF]">Room</span></h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-2xl border border-gray-100">
                    <p className="text-[8px] text-gray-400 font-bold uppercase ml-1">Check-in</p>
                    <input name="checkIn" value={formData.checkIn} onChange={handleInputChange} type="date" className="w-full bg-transparent text-gray-800 text-xs font-bold outline-none" />
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-gray-100">
                    <p className="text-[8px] text-gray-400 font-bold uppercase ml-1">Check-out</p>
                    <input name="checkOut" value={formData.checkOut} onChange={handleInputChange} type="date" className="w-full bg-transparent text-gray-800 text-xs font-bold outline-none" />
                  </div>
                </div>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 scrollbar-custom">
                  {details?.roomTypes?.map((room) => (
                    <div key={room._id} onClick={() => setFormData({ ...formData, selectedRoom: room })} className={`p-4 rounded-[2rem] cursor-pointer transition-all duration-500 flex justify-between items-center border-2 ${formData.selectedRoom?._id === room._id ? "bg-[#00AEEF] border-[#00AEEF] text-white shadow-lg" : "bg-white border-gray-100 hover:border-[#00AEEF]/30 text-gray-800"}`}>
                      <div className="flex items-center gap-3">
                        <Bed className={formData.selectedRoom?._id === room._id ? "text-white" : "text-[#00AEEF]"} size={18} />
                        <div>
                          <p className="font-bold uppercase text-[10px] tracking-tight">{room.type}</p>
                          <p className="text-[8px] font-bold opacity-60 italic">Sleeps {room.maxGuests}</p>
                        </div>
                      </div>
                      <p className="font-bold text-lg italic tracking-tighter">$ {room.finalPrice}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 bg-white p-4 rounded-2xl flex justify-between items-center border border-gray-100">
                    <span className="text-gray-400 text-[10px] font-bold uppercase">Adults</span>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => updateCount("adults", "dec")} className="text-[#00AEEF] font-bold text-lg">-</button>
                      <span className="text-gray-900 font-bold text-xs w-4 text-center">{formData.adults}</span>
                      <button type="button" onClick={() => updateCount("adults", "inc")} className="text-[#00AEEF] font-bold text-lg">+</button>
                    </div>
                  </div>
                  <div className="flex-1 bg-white p-4 rounded-2xl flex justify-between items-center border border-gray-100">
                    <span className="text-gray-400 text-[10px] font-bold uppercase">Kids</span>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => updateCount("children", "dec")} className="text-[#00AEEF] font-bold text-lg">-</button>
                      <span className="text-gray-900 font-bold text-xs w-4 text-center">{formData.children}</span>
                      <button type="button" onClick={() => updateCount("children", "inc")} className="text-[#00AEEF] font-bold text-lg">+</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h2 className="text-gray-900 text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Booking <span className="italic text-[#00AEEF]">Summary</span></h2>
                <div className="bg-white p-8 rounded-[3rem] text-gray-800 shadow-sm border border-gray-100 space-y-4">
                  <div className="flex justify-between border-b border-gray-100 pb-3">
                    <span className="opacity-50 uppercase text-[10px] font-bold">Guest Name</span>
                    <span className="font-bold italic">{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-3">
                    <span className="opacity-50 uppercase text-[10px] font-bold">Room Type</span>
                    <span className="font-bold italic text-[#00AEEF]">{formData.selectedRoom?.type}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <span className="font-bold uppercase text-sm italic">Grand Total</span>
                    <span className="text-4xl font-bold text-[#00AEEF] italic drop-shadow-md" style={{ fontFamily: "'Playfair Display', serif" }}>$ {formData.selectedRoom?.finalPrice}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 flex justify-between items-center">
            {step > 1 ? (
              <button type="button" onClick={prevStep} className="text-gray-900 font-bold uppercase text-[10px] flex items-center gap-2 hover:text-[#00AEEF] transition-colors duration-500 tracking-widest">
                <ArrowLeft size={14} /> BACK
              </button>
            ) : <div />}

            <button
              disabled={isSubmitting}
              type="button"
              onClick={step === 3 ? handleBookingSubmit : nextStep}
              className={`${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#00AEEF] hover:bg-[#0096CE]"} text-white px-12 py-4 rounded-full font-bold uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-xl transition-all duration-500 active:scale-95`}
            >
              {isSubmitting ? "PROCESSING..." : step === 3 ? "CONFIRM BOOKING" : "NEXT STEP"} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}