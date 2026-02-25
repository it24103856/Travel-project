import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaIdCard, 
  FaCar, FaArrowLeft, FaStar, FaQuoteLeft, FaFileAlt, FaCheckCircle
} from "react-icons/fa";

const DriverOverview = () => {
  const { email } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchDriverDetails = async () => {
      try {
        const response = await axios.get(`${backendUrl}/driver/get/${email}`);
        if (response.data && response.data.data) {
          setDriver(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching driver:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDriverDetails();
  }, [email, backendUrl]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-500"></div>
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-gray-400">Loading Profile...</p>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 font-bold">Driver not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-orange-600 font-bold underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 bg-white/80 backdrop-blur-md border-b border-gray-100 md:hidden">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-full text-gray-800">
          <FaArrowLeft size={16} />
        </button>
        <h1 className="text-sm font-black uppercase tracking-widest">Driver Profile</h1>
        <div className="w-8"></div> {/* Spacer for alignment */}
      </div>

      <div className="max-w-6xl mx-auto pt-24 md:pt-32 pb-20 px-4 md:px-10">
        
        {/* Desktop Back Button (Hidden on Mobile) */}
        <button 
          onClick={() => navigate(-1)}
          className="hidden md:flex items-center gap-2 text-gray-500 hover:text-orange-600 transition-colors font-bold mb-8 group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Fleet
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* LEFT: Profile Info Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-2xl shadow-gray-200/50 border border-white sticky top-28">
              {/* Profile Image with Status Tag */}
              <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden mb-8 group">
                <img 
                  src={driver.profileImage || "/default-driver.jpg"} 
                  alt={driver.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                   <div className="bg-green-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-lg">
                     <FaCheckCircle /> Verified
                   </div>
                   <div className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1 shadow-md">
                     <FaStar className="text-orange-500" /> 5.0
                   </div>
                </div>
              </div>

              {/* Driver Identity */}
              <div className="text-center md:text-left mb-8">
                <h2 className="text-3xl font-black text-gray-900 capitalize mb-2 leading-none">{driver.name}</h2>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <div className="bg-orange-100 p-1.5 rounded-lg">
                    <FaCar className="text-orange-600 text-xs" />
                  </div>
                  <p className="text-orange-600 font-black text-xs uppercase tracking-widest">{driver.vehicleType}</p>
                </div>
              </div>

              {/* Quick Contact Buttons */}
              <div className="grid grid-cols-1 gap-3">
                <a 
                  href={`tel:${driver.phone}`}
                  className="w-full bg-gray-900 text-white flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl active:scale-95"
                >
                  <FaPhoneAlt size={14} /> Call Driver
                </a>
                <a 
                  href={`mailto:${driver.email}`}
                  className="w-full bg-white text-gray-900 border-2 border-gray-100 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
                >
                  <FaEnvelope size={14} /> Send Message
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT: Biography & Details */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard 
                icon={<FaMapMarkerAlt />} 
                label="Primary Location" 
                value={driver.address} 
              />
              <InfoCard 
                icon={<FaIdCard />} 
                label="License Number" 
                value={driver.licenseNumber} 
              />
            </div>

            {/* Biography Section */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-gray-200/50 border border-white relative overflow-hidden">
              <FaQuoteLeft className="absolute -top-4 -right-4 text-gray-50 text-9xl pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-1 bg-orange-500 rounded-full"></div>
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                    <FaFileAlt className="text-orange-500 text-sm" /> Biography
                  </h3>
                </div>
                
                <p className="text-gray-600 leading-relaxed text-lg md:text-xl font-medium italic whitespace-pre-line">
                  {driver.description || "This professional driver is highly experienced and dedicated to providing a safe, comfortable journey across Sri Lanka."}
                </p>
              </div>
            </div>

            {/* Badges / Experience Tags */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Service Excellence</p>
               <div className="flex flex-wrap gap-15">
                <Tag text="English Speaking" />
                <Tag text="Tourist Specialist" />
                
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- Sub-components for better organization ---

const InfoCard = ({ icon, label, value }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 hover:border-orange-200 transition-colors group">
    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div>
      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{label}</p>
      <p className="text-gray-900 font-bold text-sm leading-tight">{value}</p>
    </div>
  </div>
);

const Tag = ({ text }) => (
  <span className="bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-gray-100 shadow-sm">
    {text}
  </span>
);

export default DriverOverview;