import React, { useState, useEffect } from "react";
import axios from "axios";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { Car, Star, User, Shield, IdCard, CheckCircle, Search } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFDFD]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#C8813A]"></div>
          <Car className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#C8813A] animate-pulse" />
        </div>
        <p className="mt-6 font-bold text-gray-800 tracking-widest uppercase text-[10px]">Loading Professional Fleet...</p>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen pt-10 bg-[#FDFDFD]" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* 1. Hero Section */}
      <section className="relative h-[45vh] md:h-[50vh] flex items-center justify-center bg-fixed bg-center bg-cover"
               style={{ backgroundImage: "url('https://images.pexels.com/photos/2108845/pexels-photo-2108845.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')" }}>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 text-center text-white px-6">
          <p className="uppercase text-[11px] tracking-[0.3em] font-semibold text-white/60 mb-4">Professional Chauffeurs</p>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Our <span className="italic text-[#C8813A]">Drivers</span>
          </h1>
          <p className="mt-3 text-sm md:text-xl font-light max-w-2xl mx-auto text-white/80">
            Your safety and comfort, driven by the most experienced hands in Sri Lanka.
          </p>

          <div className="mt-8 max-w-lg mx-auto relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C8813A] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search driver or vehicle..."
              className="w-full py-4 pl-12 pr-6 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white placeholder-white/70 outline-none focus:bg-white focus:text-black transition-all duration-500 text-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* 2. Trust Badges */}
      <section className="bg-[#FAFAFA] border-b border-gray-100 py-8 overflow-x-auto">
        <div className="flex md:grid md:grid-cols-3 gap-8 px-6 min-w-max md:min-w-0 md:max-w-7xl mx-auto">
          <Badge icon={<Shield size={20} />} text="Verified Identity" />
          <Badge icon={<IdCard size={20} />} text="Professional Licenses" />
          <Badge icon={<CheckCircle size={20} />} text="Safety Inspected" />
        </div>
      </section>

      {/* 3. Driver Grid Section — 4 cols desktop, 2 tablet, 1 mobile */}
      <section className="max-w-7xl mx-auto py-12 md:py-20 px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-10 md:mb-16 gap-4 text-center md:text-left">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
              Meet the <span className="italic text-[#C8813A]">Fleet</span>
            </h2>
            <div className="w-16 h-1 bg-[#C8813A] mt-3 rounded-full mx-auto md:mx-0"></div>
          </div>
          <p className="text-gray-400 text-[10px] md:text-sm font-medium max-w-xs italic uppercase tracking-widest leading-relaxed">
            Expert hands for your journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
          {filteredDrivers.length > 0 ? (
            filteredDrivers.map((driver) => (
              <div
                key={driver._id}
                className="group bg-white rounded-t-[2.5rem] rounded-b-2xl border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.12)] hover:scale-[1.03] transition-all duration-500 overflow-hidden"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={driver.profileImage || "/default-driver.jpg"}
                    alt={driver.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Circular Glassmorphism Rating Badge */}
                  <div className="absolute top-3.5 right-3.5 w-14 h-14 rounded-full bg-white/50 backdrop-blur-lg border border-white/30 shadow-lg flex flex-col items-center justify-center z-10">
                    <Star size={14} className="text-amber-500" fill="currentColor" />
                    <span className="text-[11px] font-bold text-gray-800 leading-tight mt-0.5">5.0</span>
                  </div>
                </div>

                {/* Content */}
                <div className="bg-white px-5 py-7 text-center">
                  <h3 className="text-[1.05rem] font-bold text-gray-800 mb-1.5 leading-snug capitalize">
                    {driver.name}
                  </h3>
                  <p className="text-[11px] text-gray-400 mb-4 font-medium flex items-center justify-center gap-1">
                    <Car size={11} /> {driver.vehicleType}
                  </p>
                  <Link
                    to={`/overview/${driver.email}`}
                    className="inline-flex items-center gap-1.5 text-[#C8813A] font-semibold text-sm hover:text-[#A66A28] hover:gap-3 transition-all duration-300"
                  >
                    View Profile <span className="text-base">→</span>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 mx-4">
              <User className="mx-auto text-4xl text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm font-bold italic" style={{ fontFamily: "'Playfair Display', serif" }}>No drivers available matching your search...</p>
            </div>
          )}
        </div>
      </section>

      {/* 4. Bottom CTA Section */}
      <section className="bg-gray-900 py-16 px-6 rounded-[3rem] md:rounded-[4rem] mx-4 md:mx-6 mb-16 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C8813A]/10 rounded-full -mr-40 -mt-40 blur-[100px]"></div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Need a custom <span className="italic">plan?</span>
          </h2>
          <p className="text-gray-400 text-sm md:text-base mb-10 max-w-xs md:max-w-lg mx-auto opacity-80">Our support team is online 24/7 to help you find the most suitable chauffeur for your journey.</p>
          <Link to="/contact" className="inline-block bg-[#C8813A] hover:bg-[#A66A28] text-white px-10 py-4 rounded-full font-bold text-[11px] uppercase tracking-widest transition-all duration-500 shadow-xl hover:scale-105">
            Contact Support
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
};

// Sub-component for Trust Badges
const Badge = ({ icon, text }) => (
  <div className="flex items-center gap-3 justify-center px-6 md:border-r border-gray-200 last:border-none">
    <div className="text-[#C8813A]">{icon}</div>
    <span className="font-bold text-gray-700 uppercase tracking-widest text-[10px] whitespace-nowrap">{text}</span>
  </div>
);

export default Drivers;