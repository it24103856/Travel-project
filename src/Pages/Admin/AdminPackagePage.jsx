import { BiTrash, BiEditAlt } from "react-icons/bi";
import { FaPlus, FaMapMarkerAlt, FaCalendarAlt, FaTag, FaSuitcase, FaEye, FaBookOpen, FaStar, FaTrophy, FaSearch, FaChevronDown, FaTimes } from "react-icons/fa";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useEffect, useState, Fragment } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";

export default function AdminPackagePage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Search & Filter states ───────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDays, setSelectedDays] = useState("");

  // ── Stats state ──────────────────────────────────────────────────
  const [mostViewed, setMostViewed]   = useState([]);
  const [mostBooked, setMostBooked]   = useState([]);
  const [mostRated,  setMostRated]    = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  const fetchPackages = async () => {
    try {
      const response = await axios.get(`${backendUrl}/packages/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPackages(response.data.data || response.data);
    } catch (error) {
      toast.error("Failed to fetch packages");
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch interaction logs, bookings, and reviews to build stats ─
  const fetchStats = async () => {
    try {
      const [logsRes, bookingsRes, reviewsRes, pkgsRes] = await Promise.all([
        axios.get(`${backendUrl}/interactions/all`,  { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${backendUrl}/bookings/all`,      { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${backendUrl}/reviews/all`,       { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${backendUrl}/packages/all`,      { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const logs     = logsRes.data?.data     || logsRes.data     || [];
      const bookings = bookingsRes.data?.data || bookingsRes.data || [];
      const reviews  = reviewsRes.data?.data  || reviewsRes.data  || [];
      const pkgs     = pkgsRes.data?.data     || pkgsRes.data     || [];

      // Build a lookup map: packageId → package object
      const pkgMap = {};
      pkgs.forEach(p => { pkgMap[p._id] = p; });

      // ── Most Viewed: count "view" actions per package ──
      const viewCounts = {};
      logs.filter(l => l.action === "view").forEach(l => {
        const pid = l.package_id?._id || l.package_id;
        if (pid) viewCounts[pid] = (viewCounts[pid] || 0) + 1;
      });
      const topViewed = Object.entries(viewCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([pid, count]) => ({ pkg: pkgMap[pid], count }))
        .filter(x => x.pkg);

      // ── Most Booked: count bookings per packageId ──
      const bookingCounts = {};
      bookings.filter(b => b.packageId).forEach(b => {
        const pid = b.packageId?._id || b.packageId;
        if (pid) bookingCounts[pid] = (bookingCounts[pid] || 0) + 1;
      });
      const topBooked = Object.entries(bookingCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([pid, count]) => ({ pkg: pkgMap[pid], count }))
        .filter(x => x.pkg);

      // ── Most Rated: average rating per package ──
      const ratingMap = {};
      reviews.filter(r => r.packageId).forEach(r => {
        const pid = r.packageId?._id || r.packageId;
        if (!pid) return;
        if (!ratingMap[pid]) ratingMap[pid] = { total: 0, count: 0 };
        ratingMap[pid].total += r.rating;
        ratingMap[pid].count += 1;
      });
      const topRated = Object.entries(ratingMap)
        .map(([pid, { total, count }]) => ({ pid, avg: total / count, count }))
        .sort((a, b) => b.avg - a.avg || b.count - a.count)
        .slice(0, 3)
        .map(({ pid, avg, count }) => ({ pkg: pkgMap[pid], avg: avg.toFixed(1), count }))
        .filter(x => x.pkg);

      setMostViewed(topViewed);
      setMostBooked(topBooked);
      setMostRated(topRated);
    } catch (err) {
      // Stats are non-critical — fail silently
      console.error("Stats fetch error:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
    fetchStats();
  }, []);

  const handleDeleteClick = (pkg) => {
    setSelectedPackage(pkg);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPackage) return;
    setDeleting(true);
    try {
      await axios.delete(`${backendUrl}/packages/delete/${selectedPackage._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Package deleted successfully");
      fetchPackages();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete package");
    } finally {
      setDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  // ── Derived filter options ───────────────────────────────────────
  const allLocations = [...new Set(packages.map(p => p.location).filter(Boolean))];
  const allCategories = [...new Set(packages.flatMap(p => p.categories || []).filter(Boolean))];
  const dayOptions = ["1-3", "4-5", "6-7", "8+"];

  const matchesDays = (pkg) => {
    if (!selectedDays) return true;
    const d = pkg.no_of_days;
    if (selectedDays === "1-3") return d >= 1 && d <= 3;
    if (selectedDays === "4-5") return d >= 4 && d <= 5;
    if (selectedDays === "6-7") return d >= 6 && d <= 7;
    if (selectedDays === "8+")  return d >= 8;
    return true;
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch =
      pkg.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !selectedLocation || pkg.location === selectedLocation;
    const matchesCategory = !selectedCategory || pkg.categories?.includes(selectedCategory);
    return matchesSearch && matchesLocation && matchesCategory && matchesDays(pkg);
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedLocation("");
    setSelectedCategory("");
    setSelectedDays("");
  };

  const hasFilters = searchTerm || selectedLocation || selectedCategory || selectedDays;

  if (loading) return (
    <div className="text-center mt-20 text-gray-500 animate-pulse font-bold">
      Loading packages...
    </div>
  );

  return (
    <div className="relative min-h-screen p-6 bg-gray-50">
      <Toaster />

      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Package Management</h1>
        <p className="text-gray-500">Manage your tour packages, itineraries, and pricing</p>
      </div>

      {/* ── STATS SECTION ─────────────────────────────────────────── */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-6 animate-pulse h-52" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

          {/* Most Viewed */}
          <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <FaEye className="text-blue-500" size={16} />
              </div>
              <div>
                <p className="font-black text-gray-800 text-sm">Most Viewed</p>
                <p className="text-gray-400 text-[10px] font-medium">By page views</p>
              </div>
            </div>
            <div className="space-y-3">
              {mostViewed.length === 0 && <p className="text-gray-400 text-xs italic">No view data yet</p>}
              {mostViewed.map(({ pkg, count }, i) => (
                <div key={pkg._id} className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${i === 0 ? "bg-amber-400 text-white" : "bg-gray-100 text-gray-500"}`}>
                    {i + 1}
                  </span>
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {pkg.gallery?.[0]
                      ? <img src={pkg.gallery[0]} alt={pkg.title} className="w-full h-full object-cover" />
                      : <FaSuitcase className="m-auto text-gray-400 mt-1.5" size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-700 text-xs truncate">{pkg.title}</p>
                    <p className="text-gray-400 text-[10px]">{pkg.location}</p>
                  </div>
                  <span className="text-blue-500 font-black text-xs flex-shrink-0">{count} views</span>
                </div>
              ))}
            </div>
          </div>

          {/* Most Booked */}
          <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <FaBookOpen className="text-green-500" size={16} />
              </div>
              <div>
                <p className="font-black text-gray-800 text-sm">Most Booked</p>
                <p className="text-gray-400 text-[10px] font-medium">By total bookings</p>
              </div>
            </div>
            <div className="space-y-3">
              {mostBooked.length === 0 && <p className="text-gray-400 text-xs italic">No booking data yet</p>}
              {mostBooked.map(({ pkg, count }, i) => (
                <div key={pkg._id} className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${i === 0 ? "bg-amber-400 text-white" : "bg-gray-100 text-gray-500"}`}>
                    {i + 1}
                  </span>
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {pkg.gallery?.[0]
                      ? <img src={pkg.gallery[0]} alt={pkg.title} className="w-full h-full object-cover" />
                      : <FaSuitcase className="m-auto text-gray-400 mt-1.5" size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-700 text-xs truncate">{pkg.title}</p>
                    <p className="text-gray-400 text-[10px]">{pkg.location}</p>
                  </div>
                  <span className="text-green-500 font-black text-xs flex-shrink-0">{count} bookings</span>
                </div>
              ))}
            </div>
          </div>

          {/* Most Rated */}
          <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <FaStar className="text-amber-500" size={16} />
              </div>
              <div>
                <p className="font-black text-gray-800 text-sm">Highest Rated</p>
                <p className="text-gray-400 text-[10px] font-medium">By average rating</p>
              </div>
            </div>
            <div className="space-y-3">
              {mostRated.length === 0 && <p className="text-gray-400 text-xs italic">No rating data yet</p>}
              {mostRated.map(({ pkg, avg, count }, i) => (
                <div key={pkg._id} className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${i === 0 ? "bg-amber-400 text-white" : "bg-gray-100 text-gray-500"}`}>
                    {i + 1}
                  </span>
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {pkg.gallery?.[0]
                      ? <img src={pkg.gallery[0]} alt={pkg.title} className="w-full h-full object-cover" />
                      : <FaSuitcase className="m-auto text-gray-400 mt-1.5" size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-700 text-xs truncate">{pkg.title}</p>
                    <p className="text-gray-400 text-[10px]">{count} review{count !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <FaStar className="text-amber-400" size={10} />
                    <span className="text-amber-600 font-black text-xs">{avg}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
      {/* ── END STATS SECTION ─────────────────────────────────────── */}

      {/* ── SEARCH & FILTER BAR ───────────────────────────────────── */}
      <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-5 mb-6 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title or location..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-700 outline-none focus:border-[#2D3748] transition-all"
          />
        </div>

        {/* Location */}
        <div className="relative min-w-[140px]">
          <select
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
            className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-600 font-bold text-xs uppercase tracking-wide px-4 py-3 pr-8 rounded-full outline-none cursor-pointer hover:border-gray-400 transition-all"
          >
            <option value="">Location</option>
            {allLocations.map((loc, i) => <option key={i} value={loc}>{loc}</option>)}
          </select>
          <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none" />
        </div>

        {/* Category */}
        <div className="relative min-w-[140px]">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-600 font-bold text-xs uppercase tracking-wide px-4 py-3 pr-8 rounded-full outline-none cursor-pointer hover:border-gray-400 transition-all"
          >
            <option value="">Category</option>
            {allCategories.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
          </select>
          <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none" />
        </div>

        {/* Days */}
        <div className="relative min-w-[120px]">
          <select
            value={selectedDays}
            onChange={e => setSelectedDays(e.target.value)}
            className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-600 font-bold text-xs uppercase tracking-wide px-4 py-3 pr-8 rounded-full outline-none cursor-pointer hover:border-gray-400 transition-all"
          >
            <option value="">Days</option>
            {dayOptions.map((d, i) => <option key={i} value={d}>{d} days</option>)}
          </select>
          <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none" />
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-xs font-black text-gray-400 hover:text-red-500 transition-all uppercase tracking-wide"
          >
            <FaTimes size={11} /> Clear
          </button>
        )}

        {/* Result count */}
        <span className="ml-auto text-xs text-gray-400 font-medium whitespace-nowrap">
          {filteredPackages.length} of {packages.length} packages
        </span>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[1.5rem] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#2D3748] text-white">
              <th className="p-4 text-xs font-black uppercase tracking-widest">Package Details</th>
              <th className="p-4 text-xs font-black uppercase tracking-widest">Location</th>
              <th className="p-4 text-xs font-black uppercase tracking-widest text-center">Duration</th>
              <th className="p-4 text-xs font-black uppercase tracking-widest text-center">Categories</th>
              <th className="p-4 text-xs font-black uppercase tracking-widest">Price</th>
              <th className="p-4 text-xs font-black uppercase tracking-widest text-center">Bookings</th>
              <th className="p-4 text-xs font-black uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPackages.length > 0 ? (
              filteredPackages.map((pkg) => {
                // Count bookings for this package from mostBooked data + any we can derive
                const bookingEntry = mostBooked.find(b => b.pkg._id === pkg._id);
                const bookingCount = bookingEntry ? bookingEntry.count : 0;

                return (
                  <tr
                    key={pkg._id}
                    className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors"
                  >
                    {/* Package Details */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-12 rounded-lg overflow-hidden border border-gray-100 bg-amber-50 flex items-center justify-center text-amber-500 shadow-sm flex-shrink-0">
                          {pkg.gallery?.[0] ? (
                            <img
                              src={pkg.gallery[0]}
                              alt={pkg.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FaSuitcase size={20} />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-700 leading-tight">{pkg.title}</span>
                          <span className="text-[10px] text-gray-400 mt-1 line-clamp-1 max-w-[180px]">
                            {pkg.description}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <FaMapMarkerAlt className="text-amber-500 text-[10px]" /> {pkg.location}
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="p-4 text-center">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold flex items-center gap-1.5 justify-center w-fit mx-auto">
                        <FaCalendarAlt size={9} /> {pkg.no_of_days} Days
                      </span>
                    </td>

                    {/* Categories */}
                    <td className="p-4 text-center">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {pkg.categories?.slice(0, 2).map((cat, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold"
                          >
                            {cat}
                          </span>
                        ))}
                        {pkg.categories?.length > 2 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold">
                            +{pkg.categories.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="p-4">
                      <div className="text-sm font-bold text-gray-700">
                        LKR {pkg.price?.toLocaleString()}
                        <span className="block text-[10px] text-gray-400 font-normal">Per Person</span>
                      </div>
                    </td>

                    {/* Bookings count */}
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 justify-center w-fit mx-auto ${bookingCount > 0 ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                        <FaBookOpen size={9} /> {bookingCount}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/packages/edit/${pkg._id}`)}
                          className="p-2 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                        >
                          <BiEditAlt size={20} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(pkg)}
                          className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                        >
                          <BiTrash size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="p-20 text-center text-gray-400 font-medium italic">
                  {hasFilters ? "No packages match your search or filters." : "No packages created yet. Click the + button to add your first package."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Add Button */}
      <Link
        to="/admin/add-package"
        className="fixed bottom-10 right-10 w-16 h-16 bg-[#2D3748] text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-black hover:scale-110 transition-all z-50 group"
      >
        <FaPlus size={24} />
        <span className="absolute right-20 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Add New Package
        </span>
      </Link>

      {/* DELETE CONFIRMATION MODAL */}
      <Transition show={isConfirmOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[100]" onClose={() => setIsConfirmOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[2rem] bg-white p-8 shadow-2xl transition-all border border-gray-100 text-center">
                  <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BiTrash size={40} />
                  </div>
                  <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900 leading-6">
                    Delete Package?
                  </Dialog.Title>
                  <p className="mt-4 text-gray-500">
                    Are you sure you want to remove{" "}
                    <span className="font-bold text-gray-800">{selectedPackage?.title}</span>?
                    This package and all its itinerary details will be deleted permanently.
                  </p>

                  <div className="mt-8 flex gap-4">
                    <button
                      type="button"
                      className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all"
                      onClick={() => setIsConfirmOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={deleting}
                      className="flex-1 px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-100 transition-all disabled:bg-gray-400"
                      onClick={confirmDelete}
                    >
                      {deleting ? "Removing..." : "Confirm Delete"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}