import React, { useState, useEffect } from "react";
import axios from "axios";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { 
  FaCar, FaStar, FaUser, FaShieldAlt, 
  FaIdCard, FaCheckCircle, FaSearch 
} from "react-icons/fa";

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await axios.get(`${backendUrl}/driver/customer/get-all`);
        if (response.data && response.data.data) {
          setDrivers(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching drivers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, [backendUrl]);

  const filteredDrivers = drivers.filter((driver) =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.vehicleType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
          <FaCar className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500 animate-pulse" />
        </div>
        <p className="mt-6 font-bold text-gray-800 tracking-widest uppercase text-[10px]">Loading Professional Fleet...</p>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen pt-10 bg-white">
      
      {/* 1. Hero Section */}
      <section className="relative h-[45vh] md:h-[50vh] flex items-center justify-center bg-fixed bg-center bg-cover" 
               style={{ backgroundImage: "url('https://images.pexels.com/photos/2108845/pexels-photo-2108845.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')" }}>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight">Our <span className="text-orange-500">Drivers</span></h1>
          <p className="mt-3 text-sm md:text-xl font-light max-w-2xl mx-auto italic opacity-90">
            "Your safety and comfort, driven by the most experienced hands in Sri Lanka."
          </p>

          <div className="mt-8 max-w-lg mx-auto relative group">
            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search driver or vehicle..."
              className="w-full py-4 pl-12 pr-6 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white placeholder-white/70 outline-none focus:bg-white focus:text-black transition-all text-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* 2. Trust Badges */}
      <section className="bg-gray-50 border-b border-gray-100 py-8 overflow-x-auto no-scrollbar">
        <div className="flex md:grid md:grid-cols-3 gap-8 px-6 min-w-max md:min-w-0 md:max-w-7xl mx-auto">
          <Badge icon={<FaShieldAlt />} text="Verified Identity" />
          <Badge icon={<FaIdCard />} text="Professional Licenses" />
          <Badge icon={<FaCheckCircle />} text="Safety Inspected" />
        </div>
      </section>

      {/* 3. Driver Grid Section with Hover Effect */}
      <section className="max-w-7xl mx-auto py-12 md:py-20 px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-10 md:mb-16 gap-4 text-center md:text-left">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-none">Meet the <span className="text-orange-500">Fleet</span></h2>
            <div className="w-16 h-1 bg-orange-500 mt-3 rounded-full mx-auto md:mx-0"></div>
          </div>
          <p className="text-gray-400 text-[10px] md:text-sm font-medium max-w-xs italic uppercase tracking-widest leading-relaxed">
            Expert hands for your journey. Hover to see details.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
          {filteredDrivers.length > 0 ? (
            filteredDrivers.map((driver) => (
              <div 
                key={driver._id} 
                className="group relative bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden hover:translate-y-[-8px] transition-all duration-500"
              >
                {/* Image & Overlay Section */}
                <div className="relative h-72 overflow-hidden">
                  <img 
                    src={driver.profileImage || "/default-driver.jpg"} 
                    alt={driver.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* --- HOVER / TOUCH OVERLAY --- */}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-30">
                    <Link 
                      to={`/overview/${driver.email}`} 
                      className="bg-white text-gray-900 px-6 py-3 rounded-full font-black shadow-2xl hover:bg-orange-500 hover:text-white transition-all uppercase text-[10px] tracking-[0.2em]"
                    >
                      View Profile
                    </Link>
                  </div>
                  {/* ----------------------------- */}

                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-2 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 shadow-sm z-20">
                    <FaStar className="text-orange-500" /> 5.0
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-8 text-center">
                  <h3 className="text-xl font-black text-gray-900 mb-1 capitalize group-hover:text-orange-500 transition-colors">
                    {driver.name}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mb-4 opacity-60">
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Certified Driver</span>
                  </div>
                  
                  <div className="bg-orange-50 rounded-full py-2 px-5 inline-flex items-center gap-2 border border-orange-100">
                    <FaCar className="text-orange-600 text-[10px]" />
                    <span className="text-[10px] text-orange-700 font-black uppercase tracking-tighter">
                      {driver.vehicleType}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 mx-4">
              <FaUser className="mx-auto text-4xl text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm font-bold italic">No drivers available matching your search...</p>
            </div>
          )}
        </div>
      </section>

      {/* 4. Bottom CTA Section */}
      <section className="bg-gray-900 py-16 px-6 rounded-[3rem] md:rounded-[4rem] mx-4 md:mx-6 mb-16 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full -mr-40 -mt-40 blur-[100px]"></div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 italic">Need a custom plan?</h2>
          <p className="text-gray-400 text-sm md:text-base mb-10 max-w-xs md:max-w-lg mx-auto opacity-80">Our support team is online 24/7 to help you find the most suitable chauffeur for your journey.</p>
          <Link to="/contact" className="inline-block bg-orange-500 hover:bg-orange-600 hover:scale-105 text-white px-10 py-4 rounded-full font-black text-[11px] uppercase tracking-widest transition-all shadow-xl">
            Contact Support
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
};

// Sub-component for Trust Badges (Reusable)
const Badge = ({ icon, text }) => (
  <div className="flex items-center gap-3 justify-center px-6 md:border-r border-gray-200 last:border-none">
    <div className="text-orange-500 text-xl">{icon}</div>
    <span className="font-extrabold text-gray-700 uppercase tracking-tighter text-[10px] whitespace-nowrap">{text}</span>
  </div>
);

export default Drivers;