import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative w-full h-[90vh] flex items-center justify-center overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/home.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="absolute top-0 left-0 w-full h-full bg-black/40 z-10"></div>

      <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto">
        <p className="uppercase text-[11px] tracking-[0.3em] font-semibold text-white/70 mb-4">
          Luxury Travel Experiences
        </p>
        <h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[1.05]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Discover <span className="italic">Sri Lanka</span>
        </h1>
        <p className="text-lg md:text-xl font-light text-white/80 max-w-2xl mx-auto leading-relaxed">
          The ultimate travel experience awaits you — from misty mountains to golden shores.
        </p>
        <Link
          to="/destinations"
          className="mt-10 inline-flex items-center gap-2 px-10 py-4 bg-[#00AEEF] hover:bg-[#0096CE] rounded-full font-bold transition-all duration-500 shadow-lg shadow-[#00AEEF]/30 uppercase text-[11px] tracking-widest hover:scale-105"
        >
          Explore Now <ArrowRight size={16} strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  );
};

export default Hero;