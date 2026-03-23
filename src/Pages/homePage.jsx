import React from "react";
import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import { ArrowUpRight, Star } from "lucide-react"; 

export default function HomePage() {
  const destinations = [
    { 
      id: "ella-01", 
      name: "Ella", 
      listings: "25", 
      img: "/ella.jpg", 
      marginClass: "md:mt-32" // පළමු Card එක පහළට (රතු ඉරට අනුව)
    },
    { 
      id: "mirissa-02", 
      name: "Mirissa", 
      listings: "30", 
      img: "/mirissa.jpg", 
      marginClass: "md:mt-0" // මැද Card එක ඉහළින්
    },
    { 
      id: "sigiriya-03", 
      name: "Sigiriya", 
      listings: "35", 
      img: "/SIGIRIYA.jpg", 
      marginClass: "md:mt-32" // තෙවන Card එක පහළට (රතු ඉරට අනුව)
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: "Emily Johnson",
      img: "https://randomuser.me/api/portraits/women/44.jpg",
      text: "The most incredible experience of my life. Every detail was perfectly planned. Truly a once-in-a-lifetime journey."
    },
    {
      id: 2,
      name: "Michael Chen",
      img: "https://randomuser.me/api/portraits/men/32.jpg",
      text: "Luxury travel redefined. I felt like royalty from start to finish. The guides were knowledgeable and the accommodations were breathtaking."
    }
  ];

  return (
    <main className="w-full min-h-screen bg-white flex flex-col">
      <Hero />
      
      {/* 1. Popular Destinations Section */}
      <section className="max-w-7xl mx-auto py-24 px-6">
        <div className="flex justify-between items-end mb-20">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight uppercase italic">Top Destinations</h2>
            <p className="text-gray-400 mt-2 font-medium">Explore the best of Sri Lanka with our curated tours.</p>
          </div>
          <Link to="/destinations" className="text-gray-900 font-bold hover:text-blue-600 transition-colors flex items-center gap-1 uppercase text-xs tracking-widest border-b-2 border-gray-900 pb-1">
            View All <ArrowUpRight size={16} />
          </Link>
        </div>
        
        {/* Destination Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
          {destinations.map((loc) => (
            <Link 
              key={loc.id} 
              to={`/overview/${loc.id}`} 
              className={`group relative flex flex-col items-center text-center transition-all duration-700 ${loc.marginClass}`}
            >
              {/* Circular Image Container - සුදු කොටස ඉවත් කර ඇත */}
              <div className="relative w-full aspect-[4/5] mb-8 overflow-hidden rounded-[15rem] bg-gray-100 shadow-2xl transition-all duration-500 group-hover:-translate-y-4">
                <img 
                  src={loc.img} 
                  alt={loc.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                
                {/* Floating Arrow on Hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <div className="w-16 h-16 rounded-full bg-white/90 text-gray-900 flex items-center justify-center shadow-xl scale-50 group-hover:scale-100 transition-transform duration-500">
                      <ArrowUpRight size={28} strokeWidth={2.5} />
                   </div>
                </div>
              </div>

              {/* Text Content Below Image */}
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">
                  {loc.name}
                </h3>
                <p className="text-gray-400 font-black uppercase text-[10px] tracking-[0.2em]">
                  {loc.listings} Listings
                </p>
                
                {/* Visual Indicator Circle */}
                <div className="mt-4 flex justify-center">
                   <div className="w-12 h-12 rounded-full border-2 border-gray-100 flex items-center justify-center text-gray-400 transition-all duration-300 group-hover:bg-gray-900 group-hover:border-gray-900 group-hover:text-white group-hover:scale-110">
                      <ArrowUpRight size={20} />
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 2. Testimonials Section (What Our Travelers Say) */}
      <section className="py-24 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 text-left">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">
              What Our <span className="text-amber-500">Travelers Say</span>
            </h2>
            <p className="text-gray-500 mt-4 text-lg font-medium">Real stories from our luxury experiences</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {testimonials.map((item) => (
              <div key={item.id} className="bg-white p-12 rounded-[3.5rem] shadow-sm flex flex-col items-center text-center transition-transform hover:scale-[1.02]">
                <div className="w-24 h-24 rounded-full p-1 border-2 border-amber-500 mb-6">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover rounded-full" />
                </div>
                <div className="flex gap-1 mb-6 text-amber-500">
                  {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                </div>
                <p className="text-gray-600 text-lg italic leading-relaxed mb-8">"{item.text}"</p>
                <h4 className="text-xl font-bold text-gray-900">{item.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer /> 
    </main>
  );
}