import React from 'react';
import { Link } from 'react-router-dom';
import { FaGlobe, FaShieldAlt, FaUsers, FaAward } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function About() {
  return (
    <main className="w-full min-h-screen bg-white">
      <Header />

      {/* 1. Hero Section with Background Image */}
      <section className="relative h-[60vh] flex items-center justify-center bg-fixed bg-center bg-cover" 
               style={{ backgroundImage: "url('https://images.pexels.com/photos/2108845/pexels-photo-2108845.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')" }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">Our Story</h1>
          <p className="mt-4 text-lg md:text-xl font-light max-w-2xl mx-auto italic">
            "Bringing the hidden gems of Sri Lanka closer to your heart since 2020."
          </p>
        </div>
      </section>

      {/* 2. Who We Are Section */}
      <section className="max-w-7xl mx-auto py-20 px-6 grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-gray-900 leading-tight">
            We Are Your Ultimate <span className="text-orange-500">Travel Mate</span>
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            At TravelMate, we believe that traveling is more than just visiting a destination; it's about creating memories that last a lifetime. Based in the heart of Sri Lanka, we specialize in curated experiences that showcase the true soul of our island.
          </p>
          <p className="text-gray-600 leading-relaxed text-lg">
            From the misty mountains of Ella to the golden shores of Mirissa, our mission is to provide authentic, sustainable, and luxury travel solutions for every wanderer.
          </p>
          <div className="pt-4">
             <Link to="/contact" className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-orange-200">
               Contact Our Team
             </Link>
          </div>
        </div>
        <div className="relative">
          <img 
            src="https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=600" 
            alt="Travel Group" 
            className="rounded-[2rem] shadow-2xl z-10 relative"
          />
          <div className="absolute -bottom-6 -left-6 w-64 h-64 bg-orange-100 rounded-full -z-0 opacity-70"></div>
        </div>
      </section>

      {/* 3. Why Choose Us (Icon Cards) */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Why Travelers Love Us</h2>
          <div className="w-20 h-1.5 bg-orange-500 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: <FaGlobe />, title: "Expert Guides", desc: "Local experts who know every secret trail." },
            { icon: <FaShieldAlt />, title: "Safe & Secure", desc: "Your safety is our top priority, always." },
            { icon: <FaUsers />, title: "Happy Travelers", desc: "Over 5,000+ memories created so far." },
            { icon: <FaAward />, title: "Best Prices", desc: "Guaranteed value for every penny you spend." }
          ].map((item, index) => (
            <div key={index} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 text-center group">
              <div className="text-4xl text-orange-500 mb-4 flex justify-center group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Statistics Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          <div>
            <h4 className="text-5xl font-black text-gray-900">120+</h4>
            <p className="text-gray-500 uppercase tracking-widest text-xs mt-2 font-bold">Destinations</p>
          </div>
          <div>
            <h4 className="text-5xl font-black text-gray-900">500+</h4>
            <p className="text-gray-500 uppercase tracking-widest text-xs mt-2 font-bold">Tours Done</p>
          </div>
          <div>
            <h4 className="text-5xl font-black text-gray-900">15+</h4>
            <p className="text-gray-500 uppercase tracking-widest text-xs mt-2 font-bold">Award Won</p>
          </div>
          <div>
            <h4 className="text-5xl font-black text-gray-900">99%</h4>
            <p className="text-gray-500 uppercase tracking-widest text-xs mt-2 font-bold">Satisfaction</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}