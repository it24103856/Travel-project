import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaCar, FaArrowLeft, FaCheckCircle, FaUsers, 
  FaSuitcaseRolling, FaGasPump, FaSnowflake, FaMoneyBillWave,
  FaImages
} from "react-icons/fa";
import { Shield, Settings } from "lucide-react";

const VehicleOverview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        const response = await axios.get(`${backendUrl}/vehicles/${id}`);
        // Handle response mapping based on your backend output structure
        if (response.data && response.data.data) {
          setVehicle(response.data.data);
        } else {
          setVehicle(response.data);
        }
      } catch (error) {
        console.error("Error fetching vehicle:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicleDetails();
  }, [id, backendUrl]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFDFD]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#C8813A]"></div>
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-gray-400">Loading Vehicle...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFDFD]">
        <p className="text-gray-500 font-bold mb-4">Vehicle not found.</p>
        <button onClick={() => navigate(-1)} className="text-[#C8813A] font-bold underline px-6 py-2 bg-orange-50 rounded-full">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-[Inter]">
      {/* Mobile Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 bg-white/80 backdrop-blur-md border-b border-gray-100 md:hidden">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-full text-gray-800">
          <FaArrowLeft size={16} />
        </button>
        <h1 className="text-sm font-black uppercase tracking-widest text-[#C8813A]">Vehicle Details</h1>
        <div className="w-8"></div> {/* Spacer for alignment */}
      </div>

      <div className="max-w-6xl mx-auto pt-24 md:pt-32 pb-20 px-4 md:px-10">
        
        {/* Desktop Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="hidden md:flex items-center gap-2 text-gray-400 hover:text-[#C8813A] transition-colors font-bold mb-8 group uppercase tracking-widest text-xs"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Fleet
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* LEFT: Vehicle Image Gallery */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-gray-100 sticky top-28">
              {/* Main Image */}
              <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden mb-4 bg-gray-50 group">
                <img 
                  src={vehicle.images && vehicle.images.length > 0 ? vehicle.images[activeImage] : "/default-car.jpg"} 
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                   <div className="bg-white/95 backdrop-blur-md text-[#C8813A] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md flex items-center gap-2">
                     <FaCar /> {vehicle.type}
                   </div>
                </div>
              </div>

              {/* Thumbnails */}
              {vehicle.images && vehicle.images.length > 1 && (
                <div className="flex gap-2 p-2 overflow-x-auto no-scrollbar">
                  {vehicle.images.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative w-20 h-16 shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${
                        activeImage === idx ? "border-[#C8813A] opacity-100" : "border-transparent opacity-50 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Vehicle Details & Specs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header Section */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none text-9xl">
                 <FaCar />
              </div>

              <div className="text-center md:text-left relative z-10">
                <p className="text-[#C8813A] font-black text-xs uppercase tracking-[0.3em] mb-3">Premium {vehicle.type}</p>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 capitalize mb-4 leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {vehicle.make} <span className="italic">{vehicle.model}</span>
                </h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-6">
                  <div className="bg-[#C8813A]/10 text-[#C8813A] px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm shrink-0">
                    <FaMoneyBillWave /> <span className="text-sm">LKR {vehicle.pricePerKm} <span className="text-[10px] uppercase opacity-70">/ km</span></span>
                  </div>
                  {vehicle.driverId && (
                     <div className="bg-green-50 text-green-600 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm shrink-0 text-xs">
                        <FaCheckCircle /> Driver Available
                     </div>
                  )}
                </div>
              </div>
            </div>

            {/* Specifications Grid */}
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3 pt-4 px-2">
              <Settings className="text-[#C8813A]" size={20} /> Specifications
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
              <InfoCard icon={<FaUsers />} label="Seating" value={`${vehicle.seatingCapacity} Passengers`} />
              <InfoCard icon={<FaSuitcaseRolling />} label="Luggage" value={`${vehicle.luggageCapacity} Bags`} />
              <InfoCard icon={<FaGasPump />} label="Fuel Type" value={vehicle.fuelType} />
              <InfoCard 
                icon={<FaSnowflake />} 
                label="Air Conditioning" 
                value={vehicle.hasAC ? "AC Available" : "Non-AC"} 
                highlight={vehicle.hasAC}
              />
            </div>

            {/* Trust Badges */}
            <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 shadow-sm mt-8">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 text-center md:text-left">Guaranteed with every ride</p>
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <Tag icon={<Shield size={14} />} text="Fully Insured" />
                <Tag icon={<FaCheckCircle size={14} />} text="Regular Maintenance" />
                <Tag icon={<FaUsers size={14} />} text="Sanitized Interiors" />
              </div>
            </div>

            {/* Booking CTA */}
            <div className="pt-6">
                <button 
                  onClick={() => navigate("/booking")}
                  className="w-full md:w-auto bg-[#C8813A] hover:bg-[#A66A28] text-white px-12 py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-xl shadow-[#C8813A]/20 hover:shadow-2xl hover:-translate-y-1 active:scale-95 text-center"
                >
                  Book this Vehicle
                </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

// --- Sub-components ---

const InfoCard = ({ icon, label, value, highlight }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 hover:border-[#C8813A]/30 transition-all duration-300 group">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${highlight ? 'bg-[#C8813A] text-white' : 'bg-[#C8813A]/10 text-[#C8813A] group-hover:bg-[#C8813A] group-hover:text-white'}`}>
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <div className="pt-1">
      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">{label}</p>
      <p className="text-gray-900 font-black text-sm capitalize">{value}</p>
    </div>
  </div>
);

const Tag = ({ icon, text }) => (
  <span className="bg-white text-gray-700 px-5 py-3 rounded-2xl text-[10px] font-bold tracking-widest border border-gray-200 shadow-sm flex items-center gap-2 whitespace-nowrap">
    <span className="text-[#C8813A]">{icon}</span> {text}
  </span>
);

export default VehicleOverview;