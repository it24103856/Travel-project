import React, { useState, useEffect } from "react";
import axios from "axios";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { Car, Settings, Shield, CheckCircle, Search, Users } from "lucide-react";

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get(`${backendUrl}/vehicles`);
        // Handle different possible response structures depending on your exact backend
        if (response.data && response.data.data) {
          setVehicles(response.data.data);
        } else if (Array.isArray(response.data)) {
          setVehicles(response.data);
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, [backendUrl]);

  const filteredVehicles = vehicles.filter((vehicle) =>
    (vehicle.make?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (vehicle.model?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (vehicle.type?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFDFD]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#00AEEF]"></div>
          <Car className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#00AEEF] animate-pulse" />
        </div>
        <p className="mt-6 font-bold text-gray-800 tracking-widest uppercase text-[10px]">Loading Premium Fleet...</p>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen pt-10 bg-[#FDFDFD]">
      {/* 1. Hero Section */}
      <section className="relative h-[45vh] md:h-[50vh] flex items-center justify-center bg-fixed bg-center bg-cover"
               style={{ backgroundImage: "url('https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')" }}>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 text-center text-white px-6">
          <p className="uppercase text-[11px] tracking-[0.3em] font-semibold text-white/60 mb-4">Premium Vehicles</p>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Our <span className="italic text-[#00AEEF]">Fleet</span>
          </h1>
          <p className="mt-3 text-sm md:text-xl font-light max-w-2xl mx-auto text-white/80">
            Travel in style with our well-maintained, comfortable, and luxury vehicles.
          </p>

          <div className="mt-8 max-w-lg mx-auto relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00AEEF] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search make, model or type..."
              className="w-full py-4 pl-12 pr-6 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white placeholder-white/70 outline-none focus:bg-white focus:text-black transition-all duration-500 text-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* 2. Trust Badges */}
      <section className="bg-[#FAFAFA] border-b border-gray-100 py-8 overflow-x-auto">
        <div className="flex md:grid md:grid-cols-3 gap-8 px-6 min-w-max md:min-w-0 md:max-w-7xl mx-auto">
          <Badge icon={<Settings size={20} />} text="Well Maintained" />
          <Badge icon={<Shield size={20} />} text="Fully Insured" />
          <Badge icon={<CheckCircle size={20} />} text="Sanitized Daily" />
        </div>
      </section>

      {/* 3. Vehicle Grid Section */}
      <section className="max-w-7xl mx-auto py-12 md:py-20 px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-10 md:mb-16 gap-4 text-center md:text-left">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
              Choose your <span className="italic text-[#00AEEF]">Ride</span>
            </h2>
            <div className="w-16 h-1 bg-[#00AEEF] mt-3 rounded-full mx-auto md:mx-0"></div>
          </div>
          <p className="text-gray-400 text-[10px] md:text-sm font-medium max-w-xs italic uppercase tracking-widest leading-relaxed">
            The perfect vehicle for every journey. Hover to see details.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {filteredVehicles.length > 0 ? (
            filteredVehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                className="group relative bg-white rounded-[3rem] md:rounded-[4rem] px-4 pb-4 pt-4 shadow-sm border border-gray-50 overflow-hidden hover:shadow-2xl hover:translate-y-[-8px] transition-all duration-500"
              >
                {/* Image & Overlay Section */}
                <div className="relative h-64 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden">
                  <img
                    src={vehicle.images?.[0] || "/default-car.jpg"}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* HOVER OVERLAY */}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-30">
                    <Link
                      to={`/vehicle/${vehicle._id}`}
                      className="bg-white text-gray-900 px-6 py-3 rounded-full font-bold shadow-2xl hover:bg-[#00AEEF] hover:text-white transition-all duration-500 uppercase text-[10px] tracking-widest"
                    >
                      View Details
                    </Link>
                  </div>

                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-2 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 shadow-sm z-20">
                    LKR {vehicle.pricePerKm} / KM
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 capitalize group-hover:text-[#00AEEF] transition-colors duration-500" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {vehicle.make} {vehicle.model}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mb-4 opacity-60">
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{vehicle.type} • {vehicle.fuelType}</span>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <div className="bg-gray-50 rounded-full py-2 px-4 inline-flex items-center gap-2 border border-gray-100">
                      <Users size={12} className="text-gray-500" />
                      <span className="text-[10px] text-gray-600 font-bold tracking-widest">
                        {vehicle.seatingCapacity}
                      </span>
                    </div>
                    {vehicle.hasAC && (
                      <div className="bg-blue-50 rounded-full py-2 px-4 inline-flex items-center gap-2 border border-blue-100">
                        <Settings size={12} className="text-[#00AEEF]" />
                        <span className="text-[10px] text-[#00AEEF] font-bold tracking-widest">A/C</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 mx-4">
              <Car className="mx-auto text-4xl text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm font-bold italic" style={{ fontFamily: "'Playfair Display', serif" }}>No vehicles available matching your search...</p>
            </div>
          )}
        </div>
      </section>

      {/* 4. Bottom CTA Section */}
      <section className="bg-gray-900 py-16 px-6 rounded-[3rem] md:rounded-[4rem] mx-4 md:mx-6 mb-16 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00AEEF]/10 rounded-full -mr-40 -mt-40 blur-[100px]"></div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ready to <span className="italic">explore?</span>
          </h2>
          <p className="text-gray-400 text-sm md:text-base mb-10 max-w-xs md:max-w-lg mx-auto opacity-80">Book your perfect ride today and experience comfort and safety like never before.</p>
          <Link to="/booking" className="inline-block bg-[#00AEEF] hover:bg-[#0096CE] text-white px-10 py-4 rounded-full font-bold text-[11px] uppercase tracking-widest transition-all duration-500 shadow-xl hover:scale-105">
            Book Now
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
    <div className="text-[#00AEEF]">{icon}</div>
    <span className="font-bold text-gray-700 uppercase tracking-widest text-[10px] whitespace-nowrap">{text}</span>
  </div>
);

export default Vehicles;
