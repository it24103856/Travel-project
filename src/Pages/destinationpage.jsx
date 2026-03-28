import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Footer from "../components/Footer";
import { Search, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col">

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

        {/* Search Bar - Minimalist style */}
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

      {/* 2. Destination Grid */}
      <div className="pb-24 px-6 flex-grow">
        <div className="container mx-auto max-w-7xl">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#00AEEF]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {filteredDestinations.map((dest) => (
                <div
                  key={dest._id}
                  className="bg-white rounded-[15rem] shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col group border border-gray-50"
                >
                  {/* Image Section */}
                  <div className="relative h-[300px] overflow-hidden rounded-t-[15rem]">
                    <img
                      src={dest.image?.[0] || "https://images.unsplash.com/photo-1546708973-b339540b5162?q=80&w=800"}
                      alt={dest.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Content Section */}
                  <div className="p-10 flex flex-col items-center text-center">
                    <h3
                      className="text-2xl font-medium text-gray-800 mb-4 tracking-tight"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {dest.name}
                    </h3>

                    <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-3 font-light italic">
                      {dest.description || "Experience the breathtaking views and unique culture of this legendary Sri Lankan destination."}
                    </p>

                    <button
                      onClick={() => navigate(`/destination/${dest._id}`)}
                      className="bg-[#00AEEF] text-white px-10 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-[#0096CE] transition-all duration-500 hover:scale-105 flex items-center gap-2 shadow-lg shadow-[#00AEEF]/20"
                    >
                      Read More <ArrowRight size={14} strokeWidth={3} />
                    </button>
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