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
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* 1. Static Header Section */}
      <div className="pt-32 pb-16 px-6 text-center max-w-5xl mx-auto animate-fade-in">
        <p className="uppercase text-[11px] tracking-[0.3em] font-semibold text-[#00AEEF] mb-4">Explore Sri Lanka</p>
        <h1
          className="text-5xl md:text-7xl font-light text-gray-900 mb-8 tracking-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          <span className="italic">Destinations</span>
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed font-light max-w-4xl mx-auto">
          Sri Lanka is one of the most exotic getaways in the world. Surrounded by the azure Indian Ocean,
          this island paradise has contrasting landscapes, stretches of golden sandy beaches and a wealth of
          wildlife and culture to discover. It is home to 8 UNESCO World Heritage Sites, 15 national parks
          showcasing spectacular wildlife and nearly 500,000 acres of lush tea estates.
        </p>

        {/* Search Bar */}
        <div className="mt-12 max-w-md mx-auto relative group">
          <input
            type="text"
            placeholder="Search your destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-4 bg-white border border-gray-200 rounded-full shadow-sm focus:shadow-lg focus:border-[#00AEEF] outline-none transition-all duration-500 text-center text-sm"
          />
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
        </div>
      </div>

      {/* 2. Destination Grid — 4 cols desktop, 2 tablet, 1 mobile */}
      <div className="pb-24 px-6 flex-grow">
        <div className="container mx-auto max-w-7xl">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#00AEEF]"></div>
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
            <div className="text-center py-20 italic text-gray-400" style={{ fontFamily: "'Playfair Display', serif" }}>
              No destinations matching your search were found.
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DestinationPage;