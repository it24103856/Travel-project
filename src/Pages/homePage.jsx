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
      marginClass: "md:mt-32"
    },
    {
      id: "mirissa-02",
      name: "Mirissa",
      listings: "30",
      img: "/mirissa.jpg",
      marginClass: "md:mt-0"
    },
    {
      id: "sigiriya-03",
      name: "Sigiriya",
      listings: "35",
      img: "/SIGIRIYA.jpg",
      marginClass: "md:mt-32"
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
    <main className="w-full min-h-screen bg-[#FDFDFD] flex flex-col">
      <Hero />

      {/* 1. Popular Destinations Section */}
      <section className="max-w-7xl mx-auto py-24 px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-4">
          <div>
            <p className="uppercase text-[11px] tracking-[0.3em] font-semibold text-[#00AEEF] mb-3">Featured Places</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Top Destinations
            </h2>
            <p className="text-gray-400 mt-3 font-medium max-w-md">
              Explore the best of Sri Lanka with our curated tours.
            </p>
          </div>
          <Link to="/destinations" className="text-gray-900 font-bold hover:text-[#00AEEF] transition-all duration-500 flex items-center gap-1 uppercase text-[10px] tracking-widest border-b-2 border-gray-900 hover:border-[#00AEEF] pb-1">
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
              {/* Signature Rounded Image Container */}
              <div className="relative w-full aspect-[4/5] mb-8 overflow-hidden rounded-[15rem] bg-gray-100 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-4">
                <img
                  src={loc.img}
                  alt={loc.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Floating Arrow on Hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                   <div className="w-16 h-16 rounded-full bg-white/90 text-gray-900 flex items-center justify-center shadow-xl scale-50 group-hover:scale-100 transition-transform duration-500">
                      <ArrowUpRight size={28} strokeWidth={2.5} />
                   </div>
                </div>
              </div>

              {/* Text Content Below Image */}
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {loc.name}
                </h3>
                <p className="text-gray-400 font-semibold uppercase text-[10px] tracking-[0.2em]">
                  {loc.listings} Listings
                </p>

                {/* Visual Indicator Circle */}
                <div className="mt-4 flex justify-center">
                   <div className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 transition-all duration-500 group-hover:bg-[#00AEEF] group-hover:border-[#00AEEF] group-hover:text-white group-hover:scale-110">
                      <ArrowUpRight size={20} />
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 2. Testimonials Section */}
      <section className="py-24 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 text-left">
            <p className="uppercase text-[11px] tracking-[0.3em] font-semibold text-[#00AEEF] mb-3">Testimonials</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              What Our <span className="italic text-[#00AEEF]">Travelers Say</span>
            </h2>
            <p className="text-gray-500 mt-4 text-lg font-medium">Real stories from our luxury experiences</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {testimonials.map((item) => (
              <div key={item.id} className="bg-white p-12 rounded-[3.5rem] shadow-sm flex flex-col items-center text-center transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
                <div className="w-24 h-24 rounded-full p-1 border-2 border-[#00AEEF] mb-6">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover rounded-full" />
                </div>
                <div className="flex gap-1 mb-6 text-[#00AEEF]">
                  {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                </div>
                <p className="text-gray-600 text-lg italic leading-relaxed mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>"{item.text}"</p>
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