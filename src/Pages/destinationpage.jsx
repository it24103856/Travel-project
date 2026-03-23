import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Footer from "../components/Footer";
import { MapPin, Star, Heart, Share2, Search, ArrowRight } from "lucide-react";

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
    dest.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dest.province?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden flex flex-col">
      {/* Hero Section – with background image */}
      <div className="relative h-screen md:h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
            alt="Mountain adventure"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" /> {/* Dark overlay for text readability */}
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 text-center text-white">
          <div className="max-w-4xl mx-auto animate-fade-up">
            <span className="inline-block text-sm font-bold tracking-wider text-blue-300 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full mb-6">
              ADVENTURE AWAITS
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
              Go <span className="text-blue-400">Together</span>
            </h1>
            <p className="text-2xl md:text-3xl font-bold mt-4">
              We Take You Places, <span className="text-blue-400">You Make the Memories</span>
            </p>
            <p className="text-lg max-w-2xl mx-auto mt-6 leading-relaxed">
              Your moment is yours to cherish. Explore new destinations and create lasting memories that will stay with you forever.
            </p>

            {/* Search Bar */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center max-w-2xl mx-auto">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search destinations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-full bg-white text-gray-800 placeholder-gray-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-full font-bold text-white shadow-lg transition transform hover:scale-105 flex items-center gap-2">
                Explore Now <ArrowRight size={18} />
              </button>
            </div>

            {/* Exclusive Trip section */}
            <div className="mt-16 pt-8 border-t border-white/30 max-w-xl mx-auto">
              <h3 className="text-2xl font-bold mb-2">Exclusive Trip</h3>
              <p className="text-sm text-white/80">
                There are many variations of passages of available but the majority have suffered alteration in some form.
              </p>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-white rounded-full mt-2 animate-scroll"></div>
          </div>
        </div>
      </div>

      {/* Destination Cards */}
      <div className="py-20 bg-white flex-grow">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter">
              Featured <span className="text-blue-600">Destinations</span>
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mt-4"></div>
            <p className="text-gray-500 max-w-2xl mx-auto mt-4">
              Handpicked locations that promise adventure, culture, and relaxation.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredDestinations.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No destinations found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDestinations.map((dest) => (
                <div
                  key={dest._id}
                  className="group relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
                  onClick={() => navigate(`/destination/${dest._id}`)}
                >
                  {/* Image Container */}
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={
                        (dest.image && dest.image[0]) ||
                        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop"
                      }
                      alt={dest.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Quick Action Buttons */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                      <button className="p-2 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-blue-600 hover:text-white transition-colors">
                        <Heart size={18} />
                      </button>
                      <button className="p-2 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-blue-600 hover:text-white transition-colors">
                        <Share2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={16} className="text-blue-500" />
                      <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">
                        {dest.city || dest.province || "Explore"}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {dest.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {dest.description || "Discover this amazing destination with breathtaking views and unforgettable experiences."}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-semibold text-gray-700">4.8</span>
                        <span className="text-xs text-gray-400">(120 reviews)</span>
                      </div>
                      <button className="text-blue-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        View Details
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-up {
          animation: fade-up 0.8s ease-out forwards;
        }
        @keyframes scroll {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(10px); }
        }
        .animate-scroll {
          animation: scroll 1.5s infinite;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default DestinationPage;