import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Shield, Users, Award } from 'lucide-react';
import Footer from '../components/Footer';

export default function About() {
  return (
    <main className="w-full min-h-screen bg-[#FDFDFD]">

      {/* 1. Hero Section with Background Image */}
      <section className="relative h-[60vh] flex items-center justify-center bg-fixed bg-center bg-cover"
               style={{ backgroundImage: "url('https://images.pexels.com/photos/2108845/pexels-photo-2108845.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')" }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center text-white px-4">
          <p className="uppercase text-[11px] tracking-[0.3em] font-semibold text-white/60 mb-4">Who We Are</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Our <span className="italic">Story</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl font-light max-w-2xl mx-auto text-white/80">
            Bringing the hidden gems of Sri Lanka closer to your heart since 2020.
          </p>
        </div>
      </section>

      {/* 2. Who We Are Section */}
      <section className="max-w-7xl mx-auto py-24 px-6 grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <p className="uppercase text-[11px] tracking-[0.3em] font-semibold text-[#C8813A]">About Us</p>
          <h2 className="text-4xl font-bold text-gray-900 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            We Are Your Ultimate <span className="italic text-[#C8813A]">Travel Mate</span>
          </h2>
          <p className="text-gray-500 leading-relaxed text-lg">
            At TravelEase, we believe that traveling is more than just visiting a destination; it's about creating memories that last a lifetime. Based in the heart of Sri Lanka, we specialize in curated experiences that showcase the true soul of our island.
          </p>
          <p className="text-gray-500 leading-relaxed text-lg">
            From the misty mountains of Ella to the golden shores of Mirissa, our mission is to provide authentic, sustainable, and luxury travel solutions for every wanderer.
          </p>
          <div className="pt-4">
             <Link to="/contact" className="inline-block bg-[#C8813A] hover:bg-[#A66A28] text-white px-10 py-4 rounded-full font-bold transition-all duration-500 shadow-lg shadow-[#C8813A]/20 uppercase text-[11px] tracking-widest hover:scale-105">
               Contact Our Team
             </Link>
          </div>
        </div>
        <div className="relative">
          <img
            src="https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt="Travel Group"
            className="rounded-[15rem] shadow-sm hover:shadow-2xl transition-all duration-500 z-10 relative"
          />
          <div className="absolute -bottom-6 -left-6 w-64 h-64 bg-[#C8813A]/10 rounded-full -z-0 opacity-70 blur-3xl"></div>
        </div>
      </section>

      {/* 3. Why Choose Us (Icon Cards) */}
      <section className="bg-[#FAFAFA] py-24 px-6">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <p className="uppercase text-[11px] tracking-[0.3em] font-semibold text-[#C8813A] mb-3">Our Promise</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            Why Travelers <span className="italic">Love Us</span>
          </h2>
          <div className="w-20 h-1 bg-[#C8813A] mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: <Globe size={28} />, title: "Expert Guides", desc: "Local experts who know every secret trail." },
            { icon: <Shield size={28} />, title: "Safe & Secure", desc: "Your safety is our top priority, always." },
            { icon: <Users size={28} />, title: "Happy Travelers", desc: "Over 5,000+ memories created so far." },
            { icon: <Award size={28} />, title: "Best Prices", desc: "Guaranteed value for every penny you spend." }
          ].map((item, index) => (
            <div key={index} className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-50 text-center group">
              <div className="text-[#C8813A] mb-5 flex justify-center group-hover:scale-110 transition-transform duration-500">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Statistics Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {[
            { num: "120+", label: "Destinations" },
            { num: "500+", label: "Tours Done" },
            { num: "15+", label: "Awards Won" },
            { num: "99%", label: "Satisfaction" },
          ].map((stat, i) => (
            <div key={i}>
              <h4 className="text-5xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>{stat.num}</h4>
              <p className="text-gray-500 uppercase tracking-widest text-xs mt-2 font-bold">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}