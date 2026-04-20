import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Bed, Car, User, Package } from "lucide-react";
import { logBooking } from "../api/interactions";

export default function TravelBookingUI() {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isPackageBooking =  type === "package";

  const [step, setStep] = useState(1);
  const [details, setDetails]     = useState(null);
  const [drivers, setDrivers]     = useState([]);
  const [vehicles, setVehicles]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName:    "",
    lastName:     "",
    email:        "",
    phone:        "",
    country:      "",
    checkIn:      "",
    checkOut:     "",
    adults:       1,
    children:     0,
    selectedRoom: null,
    selectedHotel: null,
    selectedDriver:  null,
    selectedVehicle: null,
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const base = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

        const endpoint = isPackageBooking
          ? `${base}/packages/get/${id}`
          : `${base}/hotels/get/${id}`;

        const mainRes = await axios.get(endpoint);
        if (mainRes.data?.success) {
          const data = mainRes.data.data;
          setDetails(data);
          if (!isPackageBooking && data.roomTypes?.length > 0) {
            setFormData(prev => ({ ...prev, selectedRoom: data.roomTypes[0] }));
          }
        }

        const [driversRes, vehiclesRes] = await Promise.allSettled([
                axios.get(`${base}/driver/customer/get-all`), // 👈 This matches your router.get('/customer/get-all')
                 axios.get(`${base}/vehicles`),
                      ]);

        if (driversRes.status === "fulfilled") {
          const d = driversRes.value.data;
          setDrivers(d?.data || d || []);
        } else {
          console.warn("Drivers endpoint failed:", driversRes.reason?.message);
        }

        if (vehiclesRes.status === "fulfilled") {
          const v = vehiclesRes.value.data;
          setVehicles(v?.data || v || []);
        } else {
          console.warn("Vehicles endpoint failed:", vehiclesRes.reason?.message);
        }

      } catch (err) {
        console.error("Fetch Error:", err);
        toast.error("Failed to load booking details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAll();
  }, [id, isPackageBooking]);

  const handleHotelSelect = (hotel) => {
    setFormData(prev => ({
      ...prev,
      selectedHotel: hotel,
      selectedRoom: hotel.roomTypes?.[0] || null,
    }));
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const updateCount = (field, type) =>
    setFormData(prev => ({
      ...prev,
      [field]: type === "inc" ? prev[field] + 1 : Math.max(0, prev[field] - 1),
    }));

  const activeHotel = isPackageBooking ? formData.selectedHotel : details;

  // 💡 INSTRUCTOR NOTE: Changed totalSteps to always be 4 for both Packages and Hotels
  const totalSteps = 4;

  const handleBookingSubmit = async () => {
    if (!formData.firstName || !formData.email || !formData.checkIn || !formData.checkOut) {
      toast.error("Please fill in all essential details (Name, Email, Dates)!");
      setStep(1);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You are not logged in! Please login first.");
      return;
    }

    let userId;
    try {
      userId = jwtDecode(token).id;
    } catch {
      toast.error("Session expired. Please login again.");
      return;
    }

    try {
      setIsSubmitting(true);
      const base = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

      const hotelId = isPackageBooking
        ? formData.selectedHotel?._id
        : id;

      const payload = {
        hotelId,
        userId,
        packageId:  isPackageBooking ? id : undefined,
        driverId:   formData.selectedDriver?._id  || undefined,
        vehicleId:  formData.selectedVehicle?._id || undefined,
        firstName:  formData.firstName,
        lastName:   formData.lastName,
        email:      formData.email,
        phone:      formData.phone,
        country:    formData.country,
        checkIn:    formData.checkIn,
        checkOut:   formData.checkOut,
        roomType:   formData.selectedRoom?.type || "Standard",
        adults:     formData.adults,
        children:   formData.children,
        totalPrice: formData.selectedRoom?.finalPrice,
        status:     "Pending",
      };

      const res = await axios.post(`${base}/bookings/create`, payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      if (res.data.success && res.data.data) {
        toast.success("Booking Successful!");
        if (isPackageBooking) logBooking(id);
        console.log("Attempting to log booking for package:", id);
        console.log("isPackageBooking:", isPackageBooking);
    
        setTimeout(() => navigate("/payment", {
          state: {
            bookingDetails: {
              bookingId:          res.data.data._id,
              total:              formData.selectedRoom?.finalPrice,
              currency:           "LKR",
              discountPercentage: 0,
            },
          },
        }), 1500);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Server Error: Could not create booking.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  if (loading) return (
    <div className="h-screen bg-[#FDFDFD] flex items-center justify-center text-gray-900 font-bold italic animate-pulse text-2xl"
         style={{ fontFamily: "'Playfair Display', serif" }}>
      Loading your journey...
    </div>
  );

  const cardBase   = "p-4 rounded-[2rem] cursor-pointer transition-all duration-500 flex justify-between items-center border-2";
  const cardActive = "bg-[#C8813A] border-[#C8813A] text-white shadow-lg";
  const cardIdle   = "bg-white border-gray-100 hover:border-[#C8813A]/30 text-gray-800";

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="w-full max-w-5xl bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[700px]">

        {/* ── Left Sidebar ── */}
        <div className="w-full md:w-1/3 bg-gray-900 p-12 flex flex-col justify-between">
          <div>
            <h1 className="text-white text-5xl font-bold italic leading-none mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}>JOURNEY.</h1>
            <p className="text-[#C8813A] font-bold text-[10px] uppercase tracking-[0.2em]">
              {isPackageBooking ? "📦 " + (details?.title || "Package") : "📍 " + (details?.city || "Destination")}
            </p>

            {/* Step labels */}
            <div className="mt-10 space-y-3">
              {/* 💡 INSTRUCTOR NOTE: Removed the 'isPackageBooking' condition from Transport label */}
              {["Personal Details", "Select Room", "Transport", "Summary"]
                .map((label, i) => (
                  <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${step === i + 1 ? "opacity-100" : "opacity-30"}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step === i + 1 ? "bg-[#C8813A] text-white" : "bg-white/20 text-white"}`}>
                      {i + 1}
                    </div>
                    <span className="text-white text-[11px] font-bold uppercase tracking-widest">{label}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`h-1.5 w-10 rounded-full transition-all duration-500 ${step >= i + 1 ? "bg-[#C8813A]" : "bg-white/20"}`} />
            ))}
          </div>
        </div>

        {/* ── Right Content ── */}
        <div className="flex-1 bg-[#FAFAFA] p-12 flex flex-col justify-center relative">
          <AnimatePresence mode="wait">

            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h2 className="text-gray-900 text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Personal <span className="italic text-[#C8813A]">Details</span>
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <input name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First Name"
                    className="bg-white rounded-2xl p-4 text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#C8813A]/30 border border-gray-100 transition-all duration-500" />
                  <input name="lastName"  value={formData.lastName}  onChange={handleInputChange} placeholder="Last Name"
                    className="bg-white rounded-2xl p-4 text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#C8813A]/30 border border-gray-100 transition-all duration-500" />
                </div>
                <input name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="Email Address"
                  className="w-full bg-white rounded-2xl p-4 text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#C8813A]/30 border border-gray-100 transition-all duration-500" />
                <div className="grid grid-cols-2 gap-4">
                  <input name="phone" value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    type="tel" placeholder="Telephone No" maxLength="10"
                    className="bg-white rounded-2xl p-4 text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#C8813A]/30 border border-gray-100 transition-all duration-500" />
                  <input name="country" value={formData.country} onChange={handleInputChange} placeholder="Country"
                    className="bg-white rounded-2xl p-4 text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#C8813A]/30 border border-gray-100 transition-all duration-500" />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="text-gray-900 text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Select <span className="italic text-[#C8813A]">Room</span>
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-2xl border border-gray-100">
                    <p className="text-[8px] text-gray-400 font-bold uppercase ml-1">Check-in</p>
                    <input name="checkIn" value={formData.checkIn} onChange={handleInputChange} type="date"
                      className="w-full bg-transparent text-gray-800 text-xs font-bold outline-none" />
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-gray-100">
                    <p className="text-[8px] text-gray-400 font-bold uppercase ml-1">Check-out</p>
                    <input name="checkOut" value={formData.checkOut} onChange={handleInputChange} type="date"
                      className="w-full bg-transparent text-gray-800 text-xs font-bold outline-none" />
                  </div>
                </div>

                {isPackageBooking && (
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Choose Hotel from Package</p>
                    <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                      {details?.included_hotels?.map(hotel => (
                        <div key={hotel._id}
                          onClick={() => handleHotelSelect(hotel)}
                          className={`${cardBase} ${formData.selectedHotel?._id === hotel._id ? cardActive : cardIdle}`}>
                          <div className="flex items-center gap-3">
                            <Package size={16} className={formData.selectedHotel?._id === hotel._id ? "text-white" : "text-[#C8813A]"} />
                            <div>
                              <p className="font-bold text-[11px] uppercase">{hotel.name}</p>
                              <p className="text-[9px] opacity-60">{hotel.city} — ⭐ {hotel.rating}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold opacity-70">{hotel.district}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeHotel && (
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">
                      {isPackageBooking && formData.selectedHotel ? `Rooms at ${formData.selectedHotel.name}` : "Available Rooms"}
                    </p>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                      {activeHotel.roomTypes?.map(room => (
                        <div key={room._id}
                          onClick={() => setFormData({ ...formData, selectedRoom: room })}
                          className={`${cardBase} ${formData.selectedRoom?._id === room._id ? cardActive : cardIdle}`}>
                          <div className="flex items-center gap-3">
                            <Bed size={16} className={formData.selectedRoom?._id === room._id ? "text-white" : "text-[#C8813A]"} />
                            <div>
                              <p className="font-bold uppercase text-[10px] tracking-tight">{room.type}</p>
                              <p className="text-[8px] opacity-60 italic">Sleeps {room.maxGuests}</p>
                            </div>
                          </div>
                          <p className="font-bold text-lg italic tracking-tighter">LKR {room.finalPrice?.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  {["adults", "children"].map(field => (
                    <div key={field} className="flex-1 bg-white p-4 rounded-2xl flex justify-between items-center border border-gray-100">
                      <span className="text-gray-400 text-[10px] font-bold uppercase">{field === "adults" ? "Adults" : "Kids"}</span>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => updateCount(field, "dec")} className="text-[#C8813A] font-bold text-lg">-</button>
                        <span className="text-gray-900 font-bold text-xs w-4 text-center">{formData[field]}</span>
                        <button type="button" onClick={() => updateCount(field, "inc")} className="text-[#C8813A] font-bold text-lg">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 💡 INSTRUCTOR NOTE: Removed the 'isPackageBooking' condition from Step 3 so it works for Hotels too */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="text-gray-900 text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Select <span className="italic text-[#C8813A]">Transport</span>
                </h2>

                <div>
                  <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Choose Driver <span className="text-gray-300">(Optional)</span></p>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    <div onClick={() => setFormData(prev => ({ ...prev, selectedDriver: null, selectedVehicle: null }))}
                      className={`${cardBase} ${!formData.selectedDriver ? cardActive : cardIdle}`}>
                      <div className="flex items-center gap-3">
                        <User size={16} className={!formData.selectedDriver ? "text-white" : "text-gray-400"} />
                        <p className="font-bold text-[11px] uppercase">No Driver Needed</p>
                      </div>
                    </div>
                    {drivers.map(driver => (
                      <div key={driver._id}
                        onClick={() => setFormData(prev => ({ ...prev, selectedDriver: driver, selectedVehicle: null }))}
                        className={`${cardBase} ${formData.selectedDriver?._id === driver._id ? cardActive : cardIdle}`}>
                        <div className="flex items-center gap-3">
                          {driver.profileImage
                            ? <img src={driver.profileImage} alt={driver.name} className="w-8 h-8 rounded-full object-cover" />
                            : <User size={16} className={formData.selectedDriver?._id === driver._id ? "text-white" : "text-[#C8813A]"} />}  
                          <div>
                            <p className="font-bold text-[11px] uppercase">{driver.name}</p>
                            <p className="text-[9px] opacity-60">{driver.vehicleType} — 📞 {driver.phone}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Choose Vehicle <span className="text-gray-300">(Optional)</span></p>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    <div onClick={() => setFormData(prev => ({ ...prev, selectedVehicle: null }))}
                      className={`${cardBase} ${!formData.selectedVehicle ? cardActive : cardIdle}`}>
                      <div className="flex items-center gap-3">
                        <Car size={16} className={!formData.selectedVehicle ? "text-white" : "text-gray-400"} />
                        <p className="font-bold text-[11px] uppercase">No Vehicle Needed</p>
                      </div>
                    </div>
                    {vehicles.filter(v => v.isAvailable).map(vehicle => (
                      <div key={vehicle._id}
                        onClick={() => setFormData(prev => ({ ...prev, selectedVehicle: vehicle }))}
                        className={`${cardBase} ${formData.selectedVehicle?._id === vehicle._id ? cardActive : cardIdle}`}>
                        <div className="flex items-center gap-3">
                          <Car size={16} className={formData.selectedVehicle?._id === vehicle._id ? "text-white" : "text-[#C8813A]"} />
                          <div>
                            <p className="font-bold text-[11px] uppercase">{vehicle.make} {vehicle.model}</p>
                            <p className="text-[9px] opacity-60">{vehicle.type} · {vehicle.seatingCapacity} seats · LKR {vehicle.pricePerKm}/km</p>
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold ${vehicle.isAvailable ? "text-green-400" : "text-red-400"}`}>
                          {vehicle.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 💡 INSTRUCTOR NOTE: Summary is now always Step 4 */}
            {step === 4 && (
              <motion.div key="summary" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h2 className="text-gray-900 text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Booking <span className="italic text-[#C8813A]">Summary</span>
                </h2>
                <div className="bg-white p-8 rounded-[3rem] text-gray-800 shadow-sm border border-gray-100 space-y-4">

                  <Row label="Guest Name"  value={`${formData.firstName} ${formData.lastName}`} />
                  <Row label="Email"       value={formData.email} />
                  <Row label="Check-in"   value={formData.checkIn} />
                  <Row label="Check-out"  value={formData.checkOut} />

                  {isPackageBooking && formData.selectedHotel && (
                    <Row label="Hotel" value={formData.selectedHotel.name} highlight />
                  )}

                  <Row label="Room Type" value={formData.selectedRoom?.type || "—"} highlight />

                  {formData.selectedDriver && (
                    <Row label="Driver"  value={formData.selectedDriver.name} />
                  )}
                  {formData.selectedVehicle && (
                    <Row label="Vehicle" value={`${formData.selectedVehicle.make} ${formData.selectedVehicle.model}`} />
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <span className="font-bold uppercase text-sm italic">Grand Total</span>
                    <span className="text-4xl font-bold text-[#C8813A] italic drop-shadow-md"
                          style={{ fontFamily: "'Playfair Display', serif" }}>
                      LKR {formData.selectedRoom?.finalPrice?.toLocaleString() || "—"}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 flex justify-between items-center">
            {step > 1
              ? <button type="button" onClick={prevStep}
                  className="text-gray-900 font-bold uppercase text-[10px] flex items-center gap-2 hover:text-[#C8813A] transition-colors duration-500 tracking-widest">
                  <ArrowLeft size={14} /> BACK
                </button>
              : <div />}

            <button
              disabled={isSubmitting}
              type="button"
              onClick={step === totalSteps ? handleBookingSubmit : nextStep}
              className={`${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#C8813A] hover:bg-[#A66A28]"} text-white px-12 py-4 rounded-full font-bold uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-xl transition-all duration-500 active:scale-95`}>
              {isSubmitting ? "PROCESSING..." : step === totalSteps ? "CONFIRM BOOKING" : "NEXT STEP"} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-3">
      <span className="opacity-50 uppercase text-[10px] font-bold">{label}</span>
      <span className={`font-bold italic ${highlight ? "text-[#C8813A]" : ""}`}>{value}</span>
    </div>
  );
}