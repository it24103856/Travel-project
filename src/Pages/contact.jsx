import React, { useState, useEffect } from "react";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ContactForm from "../components/ContactForm";

export default function Contact() {
  const [adminDetails, setAdminDetails] = useState({});
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axios.get(`${backendUrl}/contact/get`);
        if (res.data?.data) setAdminDetails(res.data.data);
      } catch (err) { console.error(err); }
    };
    fetchAdmin();
  }, []);

  return (
    <main className="w-full min-h-screen bg-white font-poppins">
      <Toaster position="top-right" />
      <Header />

      {/* 1. Hero Section  */}
      <section className="relative h-[50vh] flex items-center justify-center bg-fixed bg-center bg-cover" 
               style={{ backgroundImage: "url('https://images.pexels.com/photos/2108845/pexels-photo-2108845.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')" }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center text-white px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight uppercase">
            Contact Us
          </motion.h1>
          <p className="mt-4 text-lg md:text-xl font-light max-w-2xl mx-auto italic opacity-90">
            "We’re here to help you plan your next unforgettable Sri Lankan adventure."
          </p>
        </div>
      </section>

      {/* 2. Main Content: Text & Circular Image */}
      <section className="max-w-7xl mx-auto py-20 px-6 grid md:grid-cols-2 gap-16 items-center">
      <motion.div
  initial={{ opacity: 0, x: -30 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true }}
  className="space-y-8"
>
  <div className="space-y-4">
    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
      Let's Start a <span className="text-orange-500">Conversation</span>
    </h2>
    <p className="text-gray-600 leading-relaxed text-lg max-w-lg">
      Have a specific destination in mind or need help crafting the perfect itinerary?
      Our travel experts are ready to assist you.
    </p>
  </div>

  {/* විස්තර සහිත Box එක */}
  <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 hover:shadow-md transition-shadow duration-300">
    
    <div className="flex items-center gap-5 group">
      <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
        <span className="font-bold text-xs uppercase">Name</span>
      </div>
      <div>
        <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Official Name</p>
        <p className="text-gray-800 text-lg font-bold italic">TravelMate Office</p>
      </div>
    </div>

    <div className="flex items-center gap-5 group">
      <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
        <Phone size={20} />
      </div>
      <div>
        <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Phone</p>
        <p className="text-gray-800 text-lg font-bold">{adminDetails.phone || "0788316997"}</p>
      </div>
    </div>

    <div className="flex items-center gap-5 group">
      <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
        <MapPin size={20} />
      </div>
      <div>
        <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Location</p>
        <p className="text-gray-800 text-lg font-medium leading-tight">
          {adminDetails.address || "40/a, wlaassna wilage yalabowa"}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-5 group">
      <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
        <Mail size={20} />
      </div>
      <div>
        <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Mail Us</p>
        <p className="text-orange-600 text-lg font-bold hover:underline cursor-pointer">
          {adminDetails.email || "kavunduminsara@gmail.com"}
        </p>
      </div>
    </div>

  </div>
</motion.div>

        {/*  (Circular Image) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative flex justify-center"
        >
          <div className="w-[320px] h-[320px] md:w-[450px] md:h-[450px] rounded-full overflow-hidden border-[12px] border-white shadow-2xl relative z-10">
            <img 
              src="contact.jpg" 
              alt="Travel Support" 
              className="w-full h-full object-cover"
            />
          </div>
          {/* Background Decor Element (About Page එකේ වගේ) */}
          <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-orange-100 rounded-full -z-0 opacity-60 blur-3xl"></div>
        </motion.div>
      </section>

      {/* 3. Info Boxes with Hover Animation */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Call Us Box */}
          <motion.div 
            whileHover={{ y: -10, scale: 1.02 }}
            className="bg-[#E5D5C8] p-10 rounded-3xl shadow-sm text-center group cursor-pointer transition-all hover:shadow-xl"
          >
            <div className="text-3xl text-gray-900 mb-4 flex justify-center">
              <Phone />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-widest text-sm">Call Us</h3>
            <p className="text-gray-700 font-medium">{adminDetails.phone || "0788316997"}</p>
            <p className="text-gray-500 text-xs mt-2 uppercase">24/7 Service</p>
          </motion.div>

          {/* Location Box */}
          <motion.div 
            whileHover={{ y: -10, scale: 1.02 }}
            className="bg-[#E5D5C8] p-10 rounded-3xl shadow-sm text-center group cursor-pointer transition-all hover:shadow-xl"
          >
            <div className="text-3xl text-gray-900 mb-4 flex justify-center">
              <MapPin />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-widest text-sm">Location</h3>
            <p className="text-gray-700 font-medium leading-relaxed">
              {adminDetails.address || "40/a, wlaassna wilage yalabowa, Monaragala"}
            </p>
          </motion.div>

          {/* Hours Box */}
          <motion.div 
            whileHover={{ y: -10, scale: 1.02 }}
            className="bg-[#E5D5C8] p-10 rounded-3xl shadow-sm text-center group cursor-pointer transition-all hover:shadow-xl"
          >
            <div className="text-3xl text-gray-900 mb-4 flex justify-center">
              <Clock />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-widest text-sm">Hours</h3>
            <p className="text-gray-700 font-medium">Mon - Fri: 09 am - 06 pm</p>
            <p className="text-gray-700 font-medium">Sat - Sun: 10 am - 02 pm</p>
          </motion.div>

        </div>
      </section>

      {/* Floating Message Form Component */}
      <ContactForm />

      <Footer />
    </main>
  );
}