import React from "react";
import { Link } from "react-router-dom"; // Link එක import කරන්න
import Header from "../components/Header";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import { Routes, Route } from "react-router-dom";

export default function HomePage() {
  return (
    <main className="w-full min-h-screen bg-gray-50 flex flex-col">
      {/* 1. Navbar */}
      <Header />
      
      {/* 2. Hero Section (වීඩියෝ එක සහිත) */}
      <Hero />
      
      {/* 3. Travel Cards Section */}
      <section className="max-w-7xl mx-auto py-20 px-6">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Popular Destinations</h2>
            <p className="text-gray-500 mt-2">Explore the best of Sri Lanka with our curated tours.</p>
          </div>
          <Link to="/products" className="text-orange-500 font-semibold hover:underline">
            View All →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Travel Card 1 - Ella */}
            <Link to="/overview/ella-01" className="group relative h-96 bg-white rounded-3xl overflow-hidden shadow-lg transition-transform hover:scale-[1.02]">
                <img src="/tour-img09.jpg" alt="Ella" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-8 text-white">
                    <span className="bg-orange-500 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block">Adventure</span>
                    <h3 className="text-2xl font-bold">Ella, Sri Lanka</h3>
                    <p className="text-gray-300 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Experience the misty mountains and tea estates.</p>
                </div>
            </Link>

            {/* Travel Card 2 - Mirissa */}
            <Link to="/overview/mirissa-02" className="group relative h-96 bg-white rounded-3xl overflow-hidden shadow-lg transition-transform hover:scale-[1.02]">
                <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                    {/* මෙතනට ඔයාගේ Mirissa photo එක දාන්න */}
                    <p className="text-gray-400 italic">Mirissa Beach Photo</p> 
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-8 text-white">
                    <span className="bg-blue-500 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block">Relaxation</span>
                    <h3 className="text-2xl font-bold">Mirissa Beach</h3>
                    <p className="text-gray-300 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Sunshine, blue waves, and whale watching.</p>
                </div>
            </Link>

            {/* Travel Card 3 - Sigiriya */}
            <Link to="/overview/sigiriya-03" className="group relative h-96 bg-white rounded-3xl overflow-hidden shadow-lg transition-transform hover:scale-[1.02]">
                <div className="w-full h-full bg-green-100 flex items-center justify-center">
                     {/* මෙතනට ඔයාගේ Sigiriya photo එක දාන්න */}
                    <p className="text-gray-400 italic">Sigiriya Rock Photo</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-8 text-white">
                    <span className="bg-green-600 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block">Heritage</span>
                    <h3 className="text-2xl font-bold">Sigiriya Rock</h3>
                    <p className="text-gray-300 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Discover the ancient wonders of the Lion Rock.</p>
                </div>
            </Link>
             
        
        </div>
      </section>

      {/* 4. Footer */}
      <Footer /> 
    </main>
  );
}