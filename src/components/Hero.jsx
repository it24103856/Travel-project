import React from 'react';

const Hero = () => {
  return (
    <div className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden">
      {/* 1. මේක තමයි වීඩියෝ එක ප්ලේ කරන කොටස */}
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

      {/* 2. වීඩියෝ එක උඩින් වැටෙන කළු පාට ලේයර් එක (Overlay) */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/30 z-10"></div>

      {/* 3. වීඩියෝ එක උඩ පේන අකුරු */}
      <div className="relative z-20 text-center text-white px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-4">Discover Sri Lanka</h1>
        <p className="text-xl md:text-2xl font-light">The ultimate travel experience awaits you</p>
        <button className="mt-8 px-8 py-3 bg-orange-500 hover:bg-orange-600 rounded-full font-semibold transition-all">
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Hero;