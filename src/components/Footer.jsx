import React from "react";
// Icons ඔක්කොම මෙතනින් import කරගන්න
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* 1. About section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Travel<span className="text-orange-500">Mate</span>
          </h2>
          <p className="text-sm leading-6">
            Your ultimate travel companion, providing the best destinations and experiences.
          </p>
          
          {/* Social Icons - මම මේක About section එක යටට දැම්මා, එතකොට වඩාත් පිළිවෙලයි */}
          <div className="flex space-x-4 mt-6">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-white hover:bg-[#1877F2] hover:-translate-y-1 transition-all duration-300 shadow-lg"
            >
              <FaFacebook className="text-xl" />
            </a>

            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-white hover:bg-[#E4405F] hover:-translate-y-1 transition-all duration-300 shadow-lg"
            >
              <FaInstagram className="text-xl" />
            </a>

            <a
              href="https://www.twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-white hover:bg-[#1DA1F2] hover:-translate-y-1 transition-all duration-300 shadow-lg"
            >
              <FaTwitter className="text-xl" />
            </a>

            <a
              href="https://www.youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-white hover:bg-[#FF0000] hover:-translate-y-1 transition-all duration-300 shadow-lg"
            >
              <FaYoutube className="text-xl" />
            </a>
          </div>
        </div>

        {/* 2. Quick Links (හිස්ව තිබුණ නිසා මම පිරෙව්වා) */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-orange-500 transition">Home</a></li>
            <li><a href="/destinations" className="hover:text-orange-500 transition">Destinations</a></li>
            <li><a href="/about" className="hover:text-orange-500 transition">About Us</a></li>
            <li><a href="/contact" className="hover:text-orange-500 transition">Contact</a></li>
          </ul>
        </div>

        {/* 3. Contact Info */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-orange-500" />
              No. 123, Galle Road, Colombo, Sri Lanka
            </li>
            <li className="flex items-center gap-3">
              <FaPhoneAlt className="text-orange-500" />
              +94 77 123 4567
            </li>
            <li className="flex items-center gap-3">
              <FaEnvelope className="text-orange-500" />
              travelmate@gmail.com
            </li>
          </ul>
        </div>

        {/* 4. Newsletter */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Newsletter</h3>
          <p className="text-sm mb-4">Join us to discover our latest travel packages.</p>
          <div className="flex overflow-hidden rounded-lg">
            <input
              type="email"
              placeholder="Your Email"
              className="w-full px-4 py-2 text-gray-900 outline-none"
            />
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 transition">
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Copyright Bottom Bar */}
      <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
        <p>© 2026 TravelMate Project. All Rights Reserved.</p>
      </div>
    </footer>
  );
}