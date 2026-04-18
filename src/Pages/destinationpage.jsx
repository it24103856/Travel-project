import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Footer from "../components/Footer";
import { Search } from "lucide-react";

const DestinationPage = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/destinations/all`);
        if (res.data && Array.isArray(res.data.data)) {
          setDestinations(res.data.data);
        }
      } catch (error) {
        toast.error("Failed to load destinations");
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, []);

  const filteredDestinations = destinations.filter(dest =>
    dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dest.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="w-full min-h-screen bg-[#FDFDFD]" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* 1. Hero Section */}
      <section className="relative h-[45vh] md:h-[50vh] flex items-center justify-center bg-fixed bg-center bg-cover"
               style={{ backgroundImage: "url('https://images.pexels.com/photos/2108845/pexels-photo-2108845.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')" }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center text-white px-6">
          <p className="uppercase text-[11px] tracking-[0.3em] font-semibold text-white/60 mb-4">Explore Sri Lanka</p>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Discover <span className="italic text-[#C8813A]">Destinations</span>
          </h1>
          <p className="mt-3 text-sm md:text-xl font-light max-w-2xl mx-auto text-white/80">
            Sri Lanka's most exotic getaways await your exploration
          </p>

          <div className="mt-8 max-w-lg mx-auto relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C8813A] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search destination or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-4 pl-12 pr-6 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white placeholder-white/70 outline-none focus:bg-white focus:text-black transition-all duration-500 text-sm"
            />
          </div>
        </div>
      </section>

      {/* 2. About Section */}
      <section className="bg-[#FAFAFA] border-b border-gray-100 py-8 md:py-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-gray-600 text-sm md:text-base leading-relaxed font-light">
            Sri Lanka is one of the most exotic getaways in the world. Surrounded by the azure Indian Ocean,
            this island paradise has contrasting landscapes, stretches of golden sandy beaches and a wealth of
            wildlife and culture to discover. It is home to 8 UNESCO World Heritage Sites, 15 national parks
            showcasing spectacular wildlife and nearly 500,000 acres of lush tea estates.
          </p>
        </div>
      </section>

      {/* 3. Destination Grid Section — 4 cols desktop, 2 tablet, 1 mobile */}
      <section className="max-w-7xl mx-auto py-12 md:py-20 px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-10 md:mb-16 gap-4 text-center md:text-left">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
              Explore our <span className="italic text-[#C8813A]">Destinations</span>
            </h2>
            <div className="w-16 h-1 bg-[#C8813A] mt-3 rounded-full mx-auto md:mx-0"></div>
          </div>
          <p className="text-gray-400 text-[10px] md:text-sm font-medium max-w-xs italic uppercase tracking-widest leading-relaxed">
            {destinations.length} Amazing places to visit
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#C8813A]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
            {filteredDestinations.map((dest) => (
              <div
                key={dest._id}
                className="group bg-white rounded-t-[2.5rem] rounded-b-2xl border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.12)] hover:scale-[1.03] transition-all duration-500 overflow-hidden cursor-pointer"
                onClick={() => navigate(`/destination/${dest._id}`)}
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={dest.image?.[0] || "https://images.unsplash.com/photo-1546708973-b339540b5162?q=80&w=800"}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Glassmorphism City Badge */}
                  {dest.city && (
                    <div className="absolute top-3.5 right-3.5 w-14 h-14 rounded-full bg-white/50 backdrop-blur-lg border border-white/30 shadow-lg flex flex-col items-center justify-center z-10">
                      <span className="text-[10px] font-bold text-gray-700 leading-tight text-center truncate max-w-[2.8rem]">{dest.city}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="bg-white px-5 py-7 text-center">
                  <h3 className="text-[1.05rem] font-bold text-gray-800 mb-4 leading-snug">
                    {dest.name}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 text-[#C8813A] font-semibold text-sm group-hover:text-[#A66A28] group-hover:gap-3 transition-all duration-300">
                    Explore <span className="text-base">→</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredDestinations.length === 0 && (
          <div className="col-span-full text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 mx-4">
            <Search className="mx-auto text-4xl text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm font-bold italic" style={{ fontFamily: "'Playfair Display', serif" }}>No destinations matching your search were found...</p>
          </div>
        )}
      </section>

      {/* 4. Bottom CTA Section */}
      <section className="bg-gray-900 py-16 px-6 rounded-[3rem] md:rounded-[4rem] mx-4 md:mx-6 mb-16 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C8813A]/10 rounded-full -mr-40 -mt-40 blur-[100px]"></div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ready to <span className="italic">adventure?</span>
          </h2>
          <p className="text-gray-400 text-sm md:text-base mb-10 max-w-xs md:max-w-lg mx-auto opacity-80">Start your journey today and explore the most beautiful destinations in Sri Lanka.</p>
          <button onClick={() => navigate('/packages')} className="inline-block bg-[#C8813A] hover:bg-[#A66A28] text-white px-10 py-4 rounded-full font-bold text-[11px] uppercase tracking-widest transition-all duration-500 shadow-xl hover:scale-105">
            Book Your Trip
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default DestinationPage;