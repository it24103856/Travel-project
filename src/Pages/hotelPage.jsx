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
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#C8813A]"></div>
          <Hotel className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#C8813A] animate-pulse" />
        </div>
        <p className="mt-6 font-bold text-gray-800 tracking-widest uppercase text-[10px]">Finding Luxury Stays...</p>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen pt-10 bg-[#FDFDFD]" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* SECTION 1: HERO SECTION */}
      <section className="relative h-[50vh] md:h-[55vh] flex items-center justify-center bg-fixed bg-center bg-cover"
               style={{ backgroundImage: "url('https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')" }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center text-white px-6">
          <p className="uppercase text-[11px] tracking-[0.3em] font-semibold text-white/60 mb-4">Premium Accommodations</p>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Stay in <span className="italic text-[#C8813A]">Style</span>
          </h1>
          <p className="mt-3 text-sm md:text-xl font-light max-w-2xl mx-auto text-white/80">
            Experience Sri Lankan hospitality at the finest hand-picked hotels.
          </p>

          <div className="mt-8 max-w-xl mx-auto relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C8813A] transition-colors" size={18} />
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

      {/* SECTION 3: HOTEL GRID — 4 cols desktop, 2 tablet, 1 mobile */}
      <section className="max-w-7xl mx-auto py-12 md:py-20 px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-10 md:mb-16 gap-4 text-center md:text-left">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
              Explore <span className="italic text-[#C8813A]">Hotels</span>
            </h2>
            <div className="w-16 h-1 bg-[#C8813A] mt-3 rounded-full mx-auto md:mx-0"></div>
          </div>
          <p className="text-gray-400 text-xs md:text-sm font-medium max-w-xs italic">
            Tap or hover on a card to view details.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
          {filteredHotels.length > 0 ? (
            filteredHotels.map((hotel) => (
              <div
                key={hotel._id}
                className="group bg-white rounded-t-[2.5rem] rounded-b-2xl border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.12)] hover:scale-[1.03] transition-all duration-500 overflow-hidden"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={hotel.images?.[0] || "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg"}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Circular Glassmorphism Rating Badge */}
                  <div className="absolute top-3.5 right-3.5 w-14 h-14 rounded-full bg-white/50 backdrop-blur-lg border border-white/30 shadow-lg flex flex-col items-center justify-center z-10">
                    <Star size={14} className="text-amber-500" fill="currentColor" />
                    <span className="text-[11px] font-bold text-gray-800 leading-tight mt-0.5">4.8</span>
                  </div>
                </div>

                {/* Content */}
                <div className="bg-white px-5 py-7 text-center">
                  <h3 className="text-[1.05rem] font-bold text-gray-800 mb-1.5 leading-snug capitalize">
                    {hotel.name}
                  </h3>
                  <p className="text-[11px] text-gray-400 mb-4 font-medium flex items-center justify-center gap-1">
                    <MapPin size={11} /> {hotel.city}
                  </p>
                  <Link
                    to={`/hotel-details/${hotel._id}`}
                    className="inline-flex items-center gap-1.5 text-[#C8813A] font-semibold text-sm hover:text-[#A66A28] hover:gap-3 transition-all duration-300"
                  >
                    Add to Cart <span className="text-base">→</span>
                  </Link>
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
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#C8813A]/20 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ready to <span className="italic">explore?</span>
          </h2>
          <p className="text-gray-400 text-sm md:text-base mb-10 max-w-xs md:max-w-lg mx-auto opacity-80 font-medium">Our travel experts are ready to plan your perfect Sri Lankan getaway.</p>
          <Link to="/contact" className="inline-block bg-[#C8813A] hover:bg-[#A66A28] text-white px-10 py-4 rounded-full font-bold text-[11px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-all duration-500">
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
    <div className="text-[#C8813A]">{icon}</div>
    <span className="font-bold text-gray-800 uppercase tracking-widest text-[10px] whitespace-nowrap">{text}</span>
  </div>
);

export default HotelPage;