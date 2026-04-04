import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Footer from './Footer';
import { ArrowRight, MapPin, Globe, Clock } from 'lucide-react';

const DestinationOverview = () => {
  const { id } = useParams();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/destinations/${id}`);
        if (res.data) {
          setDestination(res.data.data);
        }
      } catch (error) {
        toast.error('Failed to load destination details');
      } finally {
        setLoading(false);
      }
    };
    fetchDestination();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#C8813A]"></div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="text-center py-20 font-serif italic text-gray-400 uppercase tracking-widest">
        Destination not found.
      </div>
    );
  }

  // No-API Map URL Logic (Standard Colors)
  const mapSearchQuery = encodeURIComponent(`${destination.name} ${destination.city || ''}`);
  const mapSrc = `https://maps.google.com/maps?q=${mapSearchQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans">
      
      {/* ── 1. HERO SECTION ── */}
      <section className="relative w-full min-h-[90vh] flex flex-col md:flex-row items-center overflow-hidden pt-20">
        <div className="w-full md:w-1/2 h-[50vh] md:h-screen relative overflow-hidden">
          <div className="absolute inset-0 bg-gray-100">
            <img
              src={destination.image?.[0] || 'https://images.unsplash.com/photo-1546708973-b339540b5162?q=80&w=1200'}
              alt={destination.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 bottom-0 right-[-2px] hidden md:block w-32 bg-[#FDFDFD] rounded-l-full shadow-[-20px_0_40px_rgba(0,0,0,0.02)]"></div>
        </div>

        <div className="w-full md:w-1/2 px-8 md:px-20 py-16 flex flex-col justify-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C8813A]/5 text-[#C8813A] rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-8 w-fit">
            <MapPin size={14} /> {destination.city || 'Sri Lanka'}
          </div>

          <h1
            className="text-5xl md:text-8xl font-black text-gray-900 mb-8 tracking-tighter italic uppercase"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {destination.name}
          </h1>

          <div className="space-y-6 max-w-xl">
            <p className="text-gray-500 text-lg leading-relaxed font-light italic">
              {destination.description ||
                'Experience the breathtaking views and unique culture of this legendary Sri Lankan destination.'}
            </p>

            <div className="grid grid-cols-2 gap-8 py-8 border-y border-gray-100">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Region</p>
                <p className="text-gray-900 font-bold flex items-center gap-2 uppercase text-xs italic">
                  <Globe size={14} /> {destination.region || 'South'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Stay Duration</p>
                <p className="text-gray-900 font-bold flex items-center gap-2 uppercase text-xs italic">
                  <Clock size={14} /> {destination.duration || '2-3 Days'}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/packages')}
              className="bg-gray-900 text-white px-12 py-5 rounded-full text-[11px] font-bold uppercase tracking-[3px] hover:bg-[#C8813A] transition-all transform active:scale-95 flex items-center gap-4 w-fit shadow-xl mt-4"
            >
              View Packages <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. MAP SECTION WITH PILL FRAME ── */}
      <section className="max-w-7xl mx-auto py-32 px-6 w-full">
        <div className="flex flex-col md:flex-row gap-20 items-center">
          
          {/* Map Rounded Frame */}
          <div className="w-full md:w-1/2 aspect-[4/5] overflow-hidden rounded-[15rem] shadow-2xl relative group border border-[#e8d5b7]/30">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ 
                border: 0, 
                borderRadius: '15rem' 
              }}
              src={mapSrc}
              allowFullScreen
              className="transition-all duration-1000 scale-105"
              title={`Map of ${destination.name}`}
            ></iframe>
            {/* Subtle Overlay removed for better clarity */}
            <div className="absolute inset-0 pointer-events-none border-[15px] border-white/5 rounded-[15rem]"></div>
          </div>

          {/* Text Side */}
          <div className="w-full md:w-1/2">
            <span className="text-[#C8813A] font-black uppercase text-[10px] tracking-[0.4em]">
              Location Guide
            </span>
            <h2
              className="text-4xl md:text-5xl font-black text-gray-900 uppercase italic tracking-tighter mt-4 leading-none"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Explore the <br /> <span className="text-gray-300">Heart of</span>{' '}
              {destination.city || 'Weligama'}
            </h2>
            <p className="mt-8 text-gray-500 font-light text-lg leading-relaxed italic">
              Navigate through the scenic routes of {destination.name}. Our curated location guide
              ensures you don't miss any hidden gems during your luxury stay.
            </p>

            {/* CTA Card */}
            <div className="mt-12 p-10 bg-white rounded-[3rem] border border-gray-100 shadow-xl flex items-center justify-between group/card hover:border-[#C8813A]/30 transition-all">
              <div>
                <p className="text-gray-900 font-black text-xl italic uppercase tracking-tighter">
                  Ready to Visit?
                </p>
                <p className="text-gray-400 text-[10px] font-bold mt-1 uppercase tracking-widest">
                  Book your Favourite Package Now
                </p>
              </div>
              <div
                onClick={() => navigate('/packages')}
                className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center text-white cursor-pointer group-hover/card:bg-[#C8813A] transition-all transform group-hover/card:scale-110"
              >
                <ArrowRight size={24} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in {
          animation: fade-in 1.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default DestinationOverview;