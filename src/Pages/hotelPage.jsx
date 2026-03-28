import React, { useState, useEffect } from "react";
import axios from "axios";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { Hotel, MapPin, Star, Shield, Bell, CheckCircle, Search } from "lucide-react";

const HotelPage = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await axios.get(`${backendUrl}/hotels/all`);
        if (response.data && response.data.data) {
          setHotels(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching hotels:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, [backendUrl]);

  const filteredHotels = hotels.filter((hotel) =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center pt-50 justify-center min-h-screen bg-[#FDFDFD]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#00AEEF]"></div>
          <Hotel className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#00AEEF] animate-pulse" />
        </div>
        <p className="mt-6 font-bold text-gray-800 tracking-widest uppercase text-[10px]">Finding Luxury Stays...</p>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen pt-10 bg-[#FDFDFD]">

      {/* SECTION 1: HERO SECTION */}
      <section className="relative h-[50vh] md:h-[55vh] flex items-center justify-center bg-fixed bg-center bg-cover"
               style={{ backgroundImage: "url('https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')" }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center text-white px-6">
          <p className="uppercase text-[11px] tracking-[0.3em] font-semibold text-white/60 mb-4">Premium Accommodations</p>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Stay in <span className="italic text-[#00AEEF]">Style</span>
          </h1>
          <p className="mt-3 text-sm md:text-xl font-light max-w-2xl mx-auto text-white/80">
            Experience Sri Lankan hospitality at the finest hand-picked hotels.
          </p>

          <div className="mt-8 max-w-xl mx-auto relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00AEEF] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search city or hotel..."
              className="w-full py-4 md:py-5 pl-12 pr-6 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 text-white placeholder-white/70 outline-none focus:bg-white focus:text-black transition-all duration-500 shadow-2xl text-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: TRUST BADGES */}
      <section className="bg-[#FAFAFA] border-b border-gray-100 py-8 overflow-x-auto">
        <div className="flex md:grid md:grid-cols-3 gap-8 px-6 min-w-max md:min-w-0 md:max-w-7xl mx-auto">
          <Badge icon={<Shield size={20} />} text="Verified Properties" />
          <Badge icon={<Bell size={20} />} text="Best Service" />
          <Badge icon={<CheckCircle size={20} />} text="Instant Confirm" />
        </div>
      </section>

      {/* SECTION 3: HOTEL GRID */}
      <section className="max-w-7xl mx-auto py-12 md:py-20 px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-10 md:mb-16 gap-4 text-center md:text-left">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
              Explore <span className="italic text-[#00AEEF]">Hotels</span>
            </h2>
            <div className="w-16 h-1 bg-[#00AEEF] mt-3 rounded-full mx-auto md:mx-0"></div>
          </div>
          <p className="text-gray-400 text-xs md:text-sm font-medium max-w-xs italic">
            Tap or hover on a card to view details.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
          {filteredHotels.length > 0 ? (
            filteredHotels.map((hotel) => (
              <div
                key={hotel._id}
                className="group relative bg-white rounded-[15rem] shadow-sm border border-gray-50 overflow-hidden hover:shadow-2xl hover:translate-y-[-8px] transition-all duration-500"
              >
                {/* Image Section */}
                <div className="relative h-64 md:h-72 overflow-hidden">
                  <img
                    src={hotel.images?.[0] || "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg"}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* HOVER OVERLAY */}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-30">
                    <Link
                      to={`/hotel-details/${hotel._id}`}
                      className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold shadow-2xl hover:bg-[#00AEEF] hover:text-white transition-all duration-500 uppercase text-[10px] tracking-widest"
                    >
                      View Details
                    </Link>
                  </div>

                  {/* Floating Tags */}
                  <div className="absolute top-5 left-5 bg-[#00AEEF]/90 text-white px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest z-20">
                    {hotel.category || "Luxury"}
                  </div>
                  <div className="absolute top-5 right-5 bg-white/90 backdrop-blur-md px-2 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 shadow-sm z-20">
                    <Star size={12} className="text-amber-500" fill="currentColor" /> 4.8
                  </div>
                </div>

                {/* Info Content */}
                <div className="p-8 text-center">
                  <div className="flex items-center justify-center gap-2 text-[#00AEEF] mb-3">
                    <MapPin size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{hotel.city}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 capitalize group-hover:text-[#00AEEF] transition-colors duration-500" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {hotel.name}
                  </h3>
                  <div className="w-10 h-1 bg-gray-100 mx-auto mt-4 rounded-full group-hover:w-20 group-hover:bg-[#00AEEF]/30 transition-all duration-500"></div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 mx-4">
              <Hotel className="mx-auto text-4xl text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm font-bold italic" style={{ fontFamily: "'Playfair Display', serif" }}>No hotels found matching your search...</p>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 4: BOTTOM CTA */}
      <section className="bg-gray-900 py-16 px-6 rounded-[3rem] md:rounded-[4rem] mx-4 md:mx-6 mb-16 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#00AEEF]/20 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ready to <span className="italic">explore?</span>
          </h2>
          <p className="text-gray-400 text-sm md:text-base mb-10 max-w-xs md:max-w-lg mx-auto opacity-80 font-medium">Our travel experts are ready to plan your perfect Sri Lankan getaway.</p>
          <Link to="/contact" className="inline-block bg-[#00AEEF] hover:bg-[#0096CE] text-white px-10 py-4 rounded-full font-bold text-[11px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-all duration-500">
            Get in Touch
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
};

// Sub-component for Trust Badges
const Badge = ({ icon, text }) => (
  <div className="flex items-center gap-3 justify-center px-6">
    <div className="text-[#00AEEF]">{icon}</div>
    <span className="font-bold text-gray-800 uppercase tracking-widest text-[10px] whitespace-nowrap">{text}</span>
  </div>
);

export default HotelPage;