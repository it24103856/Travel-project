import React, { useState, useEffect } from "react";
import axios from "axios";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt, FaClock, FaSearch, FaShieldAlt,
  FaCheckCircle, FaLeaf, FaChevronDown, FaStar
} from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";

const PackagePage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter states
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDays, setSelectedDays] = useState("");
  const [filtersApplied, setFiltersApplied] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get(`${backendUrl}/packages/all`);
        if (response.data?.success) {
          setPackages(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, [backendUrl]);

  // Derive unique filter options from data
  const allLocations = [...new Set(packages.map((p) => p.location).filter(Boolean))];
  const allCategories = [...new Set(packages.flatMap((p) => p.categories || []).filter(Boolean))];
  const dayOptions = ["1-3", "4-5", "6-7", "8+"];

  const applyFilters = () => setFiltersApplied(true);
  const clearFilters = () => {
    setSelectedLocation("");
    setSelectedCategory("");
    setSelectedDays("");
    setSearchTerm("");
    setFiltersApplied(false);
  };

  const matchesDays = (pkg) => {
    if (!selectedDays) return true;
    const d = pkg.no_of_days;
    if (selectedDays === "1-3") return d >= 1 && d <= 3;
    if (selectedDays === "4-5") return d >= 4 && d <= 5;
    if (selectedDays === "6-7") return d >= 6 && d <= 7;
    if (selectedDays === "8+") return d >= 8;
    return true;
  };

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !selectedLocation || pkg.location === selectedLocation;
    const matchesCategory =
      !selectedCategory || pkg.categories?.includes(selectedCategory);
    return matchesSearch && matchesLocation && matchesCategory && matchesDays(pkg);
  });

  // Top rated = first 3 from filtered list (or all if less)
  const topRated = filteredPackages.slice(0, 3);
  const remaining = filteredPackages.slice(3);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white pt-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#c87941]"></div>
          <FaLeaf className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#c87941] animate-pulse" />
        </div>
        <p className="mt-6 font-bold text-gray-800 tracking-widest uppercase text-[10px]">
          Discovering Journeys...
        </p>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen bg-white pt-10">

      {/* ── SECTION 1: HERO ── */}
      <section
        className="relative h-[50vh] md:h-[55vh] flex items-center justify-center bg-fixed bg-center bg-cover"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight">
            Explore <span className="text-amber-400">Sri Lanka</span>
          </h1>
          <p className="mt-3 text-sm md:text-xl font-light max-w-2xl mx-auto italic opacity-90">
            "Handcrafted tour packages for every kind of traveller."
          </p>
          <div className="mt-8 max-w-xl mx-auto relative group">
            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
            <input
              type="text"
              placeholder="Search destination or package..."
              className="w-full py-4 md:py-5 pl-12 pr-6 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 text-white placeholder-white/70 outline-none focus:bg-white focus:text-black transition-all shadow-2xl text-sm"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setFiltersApplied(true); }}
            />
          </div>
        </div>
      </section>

      {/* ── SECTION 2: TRUST BADGES ── */}
      <section className="bg-gray-50 border-b border-gray-100 py-8 overflow-x-auto no-scrollbar">
        <div className="flex md:grid md:grid-cols-3 gap-8 px-6 min-w-max md:min-w-0 md:max-w-7xl mx-auto">
          <Badge icon={<FaShieldAlt />} text="Verified Packages" />
          <Badge icon={<FaLeaf />} text="Eco Friendly Travel" />
          <Badge icon={<FaCheckCircle />} text="Instant Confirmation" />
        </div>
      </section>

      {/* ── SECTION 3: FILTER BAR ── */}
      <section className="max-w-5xl mx-auto px-4 mt-12 mb-2">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 text-center mb-8 tracking-tight">
          Explore Tour Packages...
        </h1>
        <div className="bg-gray-100 rounded-full px-4 md:px-8 py-4 flex flex-wrap md:flex-nowrap items-center gap-3 md:gap-4">
          <FilterSelect
            label="Location"
            value={selectedLocation}
            onChange={setSelectedLocation}
            options={allLocations}
          />
          <FilterSelect
            label="Category"
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={allCategories}
          />
          <FilterSelect
            label="Days"
            value={selectedDays}
            onChange={setSelectedDays}
            options={dayOptions}
          />
          <button
            onClick={applyFilters}
            className="ml-auto bg-slate-900 text-white px-7 py-3 rounded-full font-black text-sm hover:scale-105 transition-all flex-shrink-0"
          >
            Apply Filters
          </button>
          {(selectedLocation || selectedCategory || selectedDays) && (
            <button
              onClick={clearFilters}
              className="text-slate-400 text-xs font-black underline flex-shrink-0"
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {/* ── SECTION 4: TOP RATED PACKAGES ── */}
      <section className="max-w-7xl mx-auto py-10 md:py-14 px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-8">
          Top rated packages
        </h2>

        {topRated.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {topRated.map((pkg) => (
              <PackageCard key={pkg._id} pkg={pkg} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>

      {/* ── SECTION 5: AI BANNER ── */}
      <section className="max-w-5xl mx-auto px-4 mb-10">
        <div className="bg-gray-100 rounded-[2rem] px-8 md:px-14 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-2xl md:text-4xl font-black text-slate-900 text-center md:text-left">
            Get AI powered recommendations
          </h3>
          <Link
            to="/ai-recommendations"
            className="flex-shrink-0 bg-slate-900 text-white px-7 py-3 rounded-full font-black text-sm hover:scale-105 transition-all"
          >
            AI recommendations
          </Link>
        </div>
      </section>

      {/* ── SECTION 6: ALL OTHER PACKAGES ── */}
      {remaining.length > 0 && (
        <section className="max-w-7xl mx-auto pb-12 px-4 md:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-none">
                All <span className="text-amber-500">Packages</span>
              </h2>
              <div className="w-16 h-1 bg-amber-500 mt-3 rounded-full"></div>
            </div>
            <p className="text-gray-400 text-xs font-medium italic hidden md:block">
              {remaining.length} more packages available
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {remaining.map((pkg) => (
              <PackageCard key={pkg._id} pkg={pkg} />
            ))}
          </div>
        </section>
      )}

      {/* ── SECTION 7: BOTTOM CTA ── */}
      <section className="bg-[#0b223a] py-16 px-6 rounded-[3rem] md:rounded-[4rem] mx-4 md:mx-6 mb-16 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 italic">
            Can't find the right trip?
          </h2>
          <p className="text-blue-200 text-sm md:text-base mb-10 max-w-xs md:max-w-lg mx-auto opacity-80 font-medium">
            Our travel experts will craft a personalised Sri Lankan itinerary just for you.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-[#f3c26b] text-[#1c3d58] px-10 py-4 rounded-full font-black text-[11px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform"
          >
            Get in Touch
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
};

// ─── PACKAGE CARD ────────────────────────────────────────────────
const PackageCard = ({ pkg }) => (
  <div className="group relative bg-white rounded-[2rem] shadow-lg shadow-gray-200/60 border border-gray-100 overflow-hidden hover:translate-y-[-6px] transition-all duration-500">
    {/* Image */}
    <div className="relative h-52 md:h-60 overflow-hidden rounded-[1.5rem] m-3">
      <img
        src={pkg.gallery?.[0] || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4"}
        alt={pkg.title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 rounded-[1.5rem]"
      />
      {/* Location badge on image */}
      <div className="absolute bottom-3 left-3 bg-[#f0dfc0]/90 backdrop-blur-sm text-[#7a4e1e] px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1.5">
        <FaLocationDot size={9} /> {pkg.location}
      </div>
    </div>

    {/* Info */}
    <div className="px-5 pb-5 pt-2">
      <h3 className="text-lg md:text-xl font-black text-slate-900 mb-2 leading-tight">
        {pkg.title}
      </h3>

      {/* Tags: days + categories */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="bg-[#f0dfc0] text-[#7a4e1e] px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5">
          <FaClock size={9} /> {pkg.no_of_days} days
        </span>
        {pkg.categories?.slice(0, 1).map((cat, i) => (
          <span key={i} className="bg-[#f0dfc0] text-[#7a4e1e] px-3 py-1 rounded-full text-[10px] font-black">
            {cat}
          </span>
        ))}
      </div>

      {/* Price + CTA */}
      <div className="flex items-center justify-between">
        <p className="text-lg md:text-xl font-black text-slate-900">
          LKR {pkg.price?.toLocaleString()}
        </p>
        <Link
          to={`/package-details/${pkg._id}`}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-black text-[11px] uppercase tracking-wide hover:bg-amber-500 hover:text-white transition-all"
        >
          View Details
        </Link>
      </div>
    </div>
  </div>
);

// ─── FILTER SELECT ───────────────────────────────────────────────
const FilterSelect = ({ label, value, onChange, options }) => (
  <div className="relative flex-1 min-w-[120px]">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none bg-white border-2 border-gray-200 text-slate-700 font-black text-xs uppercase tracking-wide px-4 py-3 pr-8 rounded-full outline-none cursor-pointer hover:border-slate-400 transition-all"
    >
      <option value="">{label}</option>
      {options.map((opt, i) => (
        <option key={i} value={opt}>{opt}</option>
      ))}
    </select>
    <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none" />
  </div>
);

// ─── BADGE ───────────────────────────────────────────────────────
const Badge = ({ icon, text }) => (
  <div className="flex items-center gap-3 justify-center px-6">
    <div className="text-amber-500 text-2xl">{icon}</div>
    <span className="font-extrabold text-gray-800 uppercase tracking-tighter text-[10px] whitespace-nowrap">
      {text}
    </span>
  </div>
);

// ─── EMPTY STATE ─────────────────────────────────────────────────
const EmptyState = () => (
  <div className="col-span-full text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 mx-4">
    <FaLeaf className="mx-auto text-4xl text-gray-300 mb-3" />
    <p className="text-gray-400 text-sm font-bold italic">
      No packages found matching your filters...
    </p>
  </div>
);

export default PackagePage;