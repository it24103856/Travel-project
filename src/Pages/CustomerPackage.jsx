import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaClock, FaMapMarkerAlt, FaBus, FaHotel, FaArrowRight, FaSpinner, FaTag } from "react-icons/fa";
import Footer from '../components/Footer';

const CustomerPackage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";
        // Fetching from the endpoint you mentioned in your logic
        const response = await axios.get(`${backendUrl}/packages/all`);
        const data = response.data.data || response.data || [];
        setPackages(data);
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <FaSpinner className="animate-spin text-orange-500 text-4xl" />
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen bg-white font-sans">
      
      {/* 1. Hero Section - Matching the "Our Story" style */}
      <section className="relative h-[50vh] flex items-center justify-center bg-fixed bg-center bg-cover" 
               style={{ backgroundImage: "url('https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')" }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">Our Packages</h1>
          <p className="mt-4 text-lg md:text-xl font-light max-w-2xl mx-auto italic">
            "Tailor-made experiences for your dream Sri Lankan getaway."
          </p>
        </div>
      </section>

      {/* 2. Intro Section */}
      <section className="max-w-7xl mx-auto py-16 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Choose Your <span className="text-orange-500">Adventure</span>
        </h2>
        <div className="w-20 h-1.5 bg-orange-500 mx-auto mt-4 rounded-full"></div>
        <p className="text-gray-500 mt-6 max-w-2xl mx-auto leading-relaxed">
          Discover the beauty of Sri Lanka through our specially curated travel packages designed for every type of traveler.
        </p>
      </section>

      {/* 3. Packages Grid */}
      <section className="max-w-7xl mx-auto pb-24 px-6">
        {packages.length === 0 ? (
          <div className="text-center text-gray-400 py-20 bg-gray-50 rounded-[2rem]">
            No packages available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {packages.map((pkg) => (
              <div 
                key={pkg._id} 
                className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col relative"
              >
                {/* Image Container */}
                <div className="relative h-72 overflow-hidden">
                  <img 
                    src={pkg.mainImage || "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1000"} 
                    alt={pkg.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Floating Duration Tag */}
                  <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-orange-600 font-bold text-xs shadow-sm flex items-center gap-2">
                    <FaClock className="text-[10px]" /> {pkg.duration} Days
                  </div>
                </div>

                {/* Content Container */}
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 text-orange-500 font-bold text-[10px] uppercase tracking-widest mb-2">
                     <FaTag /> Travel Experience
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-500 transition-colors uppercase tracking-tight">
                    {pkg.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                    <FaMapMarkerAlt className="text-orange-500" />
                    <span className="truncate font-medium italic">{pkg.destinations || "Sri Lanka"}</span>
                  </div>

                  <p className="text-gray-500 text-sm line-clamp-2 mb-6 leading-relaxed">
                    {pkg.itinerary}
                  </p>

                  {/* Features Badge Area */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {pkg.hotels?.length > 0 && (
                      <span className="flex items-center gap-1.5 bg-orange-50 text-orange-600 text-[10px] font-bold uppercase px-3 py-1.5 rounded-xl border border-orange-100">
                        <FaHotel /> Hotels Included
                      </span>
                    )}
                    {pkg.driver && (
                      <span className="flex items-center gap-1.5 bg-gray-50 text-gray-600 text-[10px] font-bold uppercase px-3 py-1.5 rounded-xl border border-gray-100">
                        <FaBus /> Private Driver
                      </span>
                    )}
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-auto">
                    <Link 
                      to={`/package/${pkg._id}`} 
                      className="text-gray-900 font-bold hover:text-orange-500 flex items-center gap-2 transition-all text-sm group/link"
                    >
                      View Details 
                      <FaArrowRight className="text-xs group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                    <Link 
                      to={`/booking/${pkg._id}`} 
                      className="bg-orange-500 text-white px-7 py-3 rounded-full font-bold shadow-lg shadow-orange-100 hover:bg-orange-600 hover:shadow-orange-200 active:scale-95 transition-all text-xs"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
};

export default CustomerPackage;