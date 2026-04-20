import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  FaArrowLeft, FaImage, FaPlus, FaTrash, FaSuitcase,
  FaMapMarkerAlt, FaCalendarAlt, FaTag, FaBus,
  FaLightbulb, FaQuestionCircle, FaTimes, FaCheck,
  FaClock, FaHotel, FaSearch
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { uploadFile } from "../../utils/meadiaUpload.js";

// ── Matches Package.js enum exactly ──────────────────────────────────────────
const CATEGORY_OPTIONS = [
  { value: "adventure",  label: "Adventure" },
  { value: "wildlife",   label: "Wildlife" },
  { value: "historical", label: "Historical" },
  { value: "cultural",   label: "Cultural" },
  { value: "beach",      label: "Beach" },
  { value: "wellness",   label: "Wellness" },
  { value: "eco",        label: "Eco / Nature" },
  { value: "family",     label: "Family" },
];

const WEATHER_OPTIONS = [
  { value: "sunny",    label: "☀️ Sunny & Warm" },
  { value: "tropical", label: "🌴 Tropical" },
  { value: "humid",    label: "💧 Humid" },
  { value: "cool",     label: "🍂 Cool & Crisp" },
  { value: "dry",      label: "🏜️ Hot & Dry" },
  { value: "rainy",    label: "🌧️ Rainy" },
];

const INTEREST_OPTIONS = [
  { value: "hiking",             label: "🥾 Hiking" },
  { value: "surfing",            label: "🏄 Surfing" },
  { value: "nature_photography", label: "📷 Nature Photography" },
  { value: "wildlife_spotting",  label: "🦁 Wildlife Spotting" },
  { value: "camping",            label: "⛺ Camping" },
  { value: "diving",             label: "🤿 Diving" },
  { value: "paddling_boats",     label: "🚣 Paddling Boats" },
  { value: "stargazing",         label: "🔭 Stargazing" },
  { value: "cycling",            label: "🚴 Cycling" },
  { value: "rock_climbing",      label: "🧗 Rock Climbing" },
  { value: "bird_watching",      label: "🦜 Bird Watching" },
  { value: "cultural_tours",     label: "🏛️ Cultural Tours" },
];

const EditPackagePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    title: "", description: "", location: "", price: "", no_of_days: "",
    min_group_size: 1, max_group_size: 20,
  });
  const [errors, setErrors] = useState({});
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedWeather, setSelectedWeather] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);

  // ── Hotels & Destinations ──
  const [allHotels, setAllHotels] = useState([]);
  const [allDestinations, setAllDestinations] = useState([]);
  const [selectedHotelIds, setSelectedHotelIds] = useState([]);
  const [selectedDestinationIds, setSelectedDestinationIds] = useState([]);
  const [hotelSearch, setHotelSearch] = useState("");
  const [destSearch, setDestSearch] = useState("");

  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [itineraries, setItineraries] = useState([{ day_no: 1, title: "", activities: [{ time: "", task: "" }] }]);
  const [transport, setTransport] = useState([""]);
  const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);
  const [travellerTips, setTravellerTips] = useState([{ title: "", description: "" }]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [hotelsRes, destsRes] = await Promise.all([
          axios.get(`${backendUrl}/hotels/all`),
          axios.get(`${backendUrl}/destinations/all`),
        ]);
        setAllHotels(hotelsRes.data?.data || []);
        setAllDestinations(destsRes.data?.data || []);
      } catch { toast.error("Failed to load hotels/destinations"); }
    };
    fetchOptions();
  }, [backendUrl]);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const res = await axios.get(`${backendUrl}/packages/get/${id}`);
        if (res.data?.data) {
          const pkg = res.data.data;
          setFormData({
            title: pkg.title || "", description: pkg.description || "",
            location: pkg.location || "", price: pkg.price || "",
            no_of_days: pkg.no_of_days || "",
            min_group_size: pkg.min_group_size || 1,
            max_group_size: pkg.max_group_size || 20,
          });
          setSelectedCategories(pkg.categories || []);
          setSelectedWeather(pkg.weather || []);
          setSelectedInterests(pkg.interests || []);
          setGalleryPreviews(pkg.gallery || []);
          setItineraries(pkg.itineraries?.length
            ? pkg.itineraries.map(i => ({ ...i, activities: i.activities?.length ? i.activities : [{ time: "", task: "" }] }))
            : [{ day_no: 1, title: "", activities: [{ time: "", task: "" }] }]);
          setTransport(pkg.transport?.length ? pkg.transport : [""]);
          setFaqs(pkg.faqs?.length ? pkg.faqs : [{ question: "", answer: "" }]);
          setTravellerTips(pkg.traveller_tips?.length ? pkg.traveller_tips : [{ title: "", description: "" }]);
          setSelectedHotelIds((pkg.included_hotels || []).map(h => h._id || h));
          setSelectedDestinationIds((pkg.destinations || []).map(d => d._id || d));
        }
      } catch { toast.error("Failed to load package data!"); }
      finally { setFetching(false); }
    };
    if (id) fetchPackage();
  }, [id, backendUrl]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: "" }));
  };

  const toggleCategory = (cat) => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

  const toggleWeather = (w) => setSelectedWeather(prev => prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w]);
  const toggleInterest = (i) => setSelectedInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const toggleHotel = (hId) => setSelectedHotelIds(prev => prev.includes(hId) ? prev.filter(i => i !== hId) : [...prev, hId]);
  const toggleDestination = (dId) => setSelectedDestinationIds(prev => prev.includes(dId) ? prev.filter(i => i !== dId) : [...prev, dId]);

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setGalleryFiles(prev => [...prev, ...files]);
    setGalleryPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };
  const removeGalleryImage = (i) => {
    const isBlob = galleryPreviews[i]?.startsWith("blob:");
    setGalleryPreviews(prev => prev.filter((_, idx) => idx !== i));
    if (isBlob) {
      const blobIdxs = galleryPreviews.map((p, idx) => p.startsWith("blob:") ? idx : -1).filter(x => x !== -1);
      const fi = blobIdxs.indexOf(i);
      if (fi !== -1) setGalleryFiles(prev => prev.filter((_, idx) => idx !== fi));
    }
  };

  const addItinerary = () => setItineraries(prev => [...prev, { day_no: prev.length + 1, title: "", activities: [{ time: "", task: "" }] }]);
  const removeItinerary = (i) => setItineraries(prev => prev.filter((_, idx) => idx !== i).map((it, idx) => ({ ...it, day_no: idx + 1 })));
  const handleItineraryChange = (i, f, v) => setItineraries(prev => { const u = [...prev]; u[i] = { ...u[i], [f]: v }; return u; });
  const addActivity = (iIdx) => setItineraries(prev => { const u = [...prev]; u[iIdx].activities = [...u[iIdx].activities, { time: "", task: "" }]; return u; });
  const removeActivity = (iIdx, aIdx) => setItineraries(prev => { const u = [...prev]; u[iIdx].activities = u[iIdx].activities.filter((_, i) => i !== aIdx); return u; });
  const handleActivityChange = (iIdx, aIdx, f, v) => setItineraries(prev => { const u = [...prev]; u[iIdx].activities[aIdx] = { ...u[iIdx].activities[aIdx], [f]: v }; return u; });

  const addTransport = () => setTransport(prev => [...prev, ""]);
  const removeTransport = (i) => setTransport(prev => prev.filter((_, idx) => idx !== i));
  const handleTransportChange = (i, v) => setTransport(prev => { const u = [...prev]; u[i] = v; return u; });

  const addFaq = () => setFaqs(prev => [...prev, { question: "", answer: "" }]);
  const removeFaq = (i) => setFaqs(prev => prev.filter((_, idx) => idx !== i));
  const handleFaqChange = (i, f, v) => setFaqs(prev => { const u = [...prev]; u[i] = { ...u[i], [f]: v }; return u; });

  const addTip = () => setTravellerTips(prev => [...prev, { title: "", description: "" }]);
  const removeTip = (i) => setTravellerTips(prev => prev.filter((_, idx) => idx !== i));
  const handleTipChange = (i, f, v) => setTravellerTips(prev => { const u = [...prev]; u[i] = { ...u[i], [f]: v }; return u; });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const newErrors = {};
    if (!formData.title.trim())       newErrors.title       = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.location)           newErrors.location    = "Location is required";
    if (!formData.price)              newErrors.price       = "Price is required";
    else if (Number(formData.price) <= 0) newErrors.price   = "Price must be greater than 0";
    if (!formData.no_of_days)         newErrors.no_of_days  = "Number of days is required";
    else if (Number(formData.no_of_days) <= 0) newErrors.no_of_days = "Number of days must be greater than 0";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      let galleryUrls = galleryPreviews.filter(p => !p.startsWith("blob:"));
      for (const file of galleryFiles) {
        const url = await uploadFile(file);
        if (url) galleryUrls.push(url);
      }
      const payload = {
        ...formData,
        categories:      selectedCategories,
        weather:         selectedWeather,
        interests:       selectedInterests,
        gallery:         galleryUrls,
        itineraries,
        transport:       transport.filter(t => t.trim()),
        faqs:            faqs.filter(f => f.question.trim()),
        traveller_tips:  travellerTips.filter(t => t.title.trim()),
        included_hotels: selectedHotelIds,
        destinations:    selectedDestinationIds,
      };
      await axios.put(`${backendUrl}/packages/update/${id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Package updated!");
      navigate("/admin/packages");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const filteredHotels = allHotels.filter(h => h.name?.toLowerCase().includes(hotelSearch.toLowerCase()));
  const filteredDests  = allDestinations.filter(d => d.name?.toLowerCase().includes(destSearch.toLowerCase()));

  if (fetching) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto px-4 py-10">

        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => navigate(-1)} className="p-3 bg-white border-2 border-slate-200 rounded-2xl hover:bg-slate-100 transition-all"><FaArrowLeft className="text-slate-600" /></button>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Edit Package</h1>
            <p className="text-slate-400 text-sm font-medium">Update the package details below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* SECTION 1: Basic Info */}
          <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-xl p-8 transition-all hover:border-blue-100">
            <div className="flex items-center gap-4 mb-8"><div className="p-3 bg-blue-500 rounded-2xl text-white"><FaSuitcase /></div><h2 className="text-2xl font-black text-slate-800">Basic Info</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="md:col-span-2">
                <InputGroup label="Package Title *" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Magical Hill Country Experience" hasError={!!errors.title} />
                {errors.title && <p className="text-red-500 text-xs font-bold mt-1 ml-2">⚠ {errors.title}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Description *</label>
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe this package..." rows={4}
                  className={`w-full px-5 py-4 bg-white border-2 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all text-slate-800 font-medium resize-none ${errors.description ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-500"}`} />
                {errors.description && <p className="text-red-500 text-xs font-bold mt-1 ml-2">⚠ {errors.description}</p>}
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Location *</label>
                <select name="location" value={formData.location} onChange={handleChange}
                  className={`w-full px-5 py-4 bg-white border-2 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all text-slate-800 font-bold appearance-none ${errors.location ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-500"}`}>
                  <option value="">Select location...</option>
                  {["Colombo","Kandy","Galle","Jaffna","Anuradhapura","Polonnaruwa","Sigiriya","Ella","Nuwara Eliya","Trincomalee","Batticaloa","Hambantota","Mirissa","Hikkaduwa","Arugam Bay","Yala","Wilpattu","Udawalawe","Dambulla","Matara","Bentota","Negombo","Ratnapura","Badulla","Ampara","Multi-location"].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
                {errors.location && <p className="text-red-500 text-xs font-bold mt-1 ml-2">⚠ {errors.location}</p>}
              </div>

              <div>
                <InputGroup label="Price (LKR) *" name="price" type="number" value={formData.price} onChange={handleChange} placeholder="e.g. 25000" hasError={!!errors.price} />
                {errors.price && <p className="text-red-500 text-xs font-bold mt-1 ml-2">⚠ {errors.price}</p>}
              </div>

              <div>
                <InputGroup label="Number of Days *" name="no_of_days" type="number" value={formData.no_of_days} onChange={handleChange} placeholder="e.g. 5" hasError={!!errors.no_of_days} />
                {errors.no_of_days && <p className="text-red-500 text-xs font-bold mt-1 ml-2">⚠ {errors.no_of_days}</p>}
              </div>

            </div>
          </div>

          {/* SECTION 2: Categories */}
          <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-xl p-8 transition-all hover:border-purple-100">
            <div className="flex items-center gap-4 mb-2"><div className="p-3 bg-purple-500 rounded-2xl text-white"><FaTag /></div><h2 className="text-2xl font-black text-slate-800">Categories</h2></div>
            <p className="text-slate-400 text-xs font-medium mb-6 ml-1">Select all that apply</p>
            <div className="flex flex-wrap gap-3">
              {CATEGORY_OPTIONS.map(({ value, label }) => {
                const active = selectedCategories.includes(value);
                return (
                  <button key={value} type="button" onClick={() => toggleCategory(value)}
                    className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wide border-2 transition-all flex items-center gap-2 ${active ? "bg-[#2D3748] text-white border-[#2D3748] shadow-lg" : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-400"}`}>
                    {active && <FaCheck size={9} />} {label}
                  </button>
                );
              })}
            </div>
            {selectedCategories.length > 0 && (
              <p className="mt-4 text-xs font-black text-purple-600 uppercase tracking-widest">
                ✓ {selectedCategories.length} categor{selectedCategories.length > 1 ? "ies" : "y"} selected
              </p>
            )}
          </div>

          {/* SECTION 3: Group Size */}
          <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-xl p-8 transition-all hover:border-teal-100">
            <div className="flex items-center gap-4 mb-8"><div className="p-3 bg-teal-500 rounded-2xl text-white"><FaSuitcase /></div><h2 className="text-2xl font-black text-slate-800">Group Size</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Min Group Size" name="min_group_size" type="number" value={formData.min_group_size} onChange={handleChange} placeholder="e.g. 1" />
              <InputGroup label="Max Group Size" name="max_group_size" type="number" value={formData.max_group_size} onChange={handleChange} placeholder="e.g. 20" />
            </div>
          </div>

          {/* SECTION 4: Weather */}
          <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-xl p-8 transition-all hover:border-sky-100">
            <div className="flex items-center gap-4 mb-2"><div className="p-3 bg-sky-500 rounded-2xl text-white"><FaCalendarAlt /></div><h2 className="text-2xl font-black text-slate-800">Suitable Weather</h2></div>
            <p className="text-slate-400 text-xs font-medium mb-6 ml-1">Select the weather conditions this package is best suited for</p>
            <div className="flex flex-wrap gap-3">
              {WEATHER_OPTIONS.map(({ value, label }) => (
                <button key={value} type="button" onClick={() => toggleWeather(value)}
                  className={`px-5 py-2.5 rounded-full text-xs font-black border-2 transition-all ${selectedWeather.includes(value) ? "bg-sky-500 border-sky-500 text-white scale-[1.04]" : "bg-white border-slate-200 text-slate-500 hover:border-sky-400"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 5: Related Interests */}
          <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-xl p-8 transition-all hover:border-emerald-100">
            <div className="flex items-center gap-4 mb-2"><div className="p-3 bg-emerald-500 rounded-2xl text-white"><FaCheck /></div><h2 className="text-2xl font-black text-slate-800">Related Interests</h2></div>
            <p className="text-slate-400 text-xs font-medium mb-6 ml-1">Select the traveller interests this package caters to</p>
            <div className="flex flex-wrap gap-3">
              {INTEREST_OPTIONS.map(({ value, label }) => (
                <button key={value} type="button" onClick={() => toggleInterest(value)}
                  className={`px-5 py-2.5 rounded-full text-xs font-black border-2 transition-all ${selectedInterests.includes(value) ? "bg-emerald-500 border-emerald-500 text-white scale-[1.04]" : "bg-white border-slate-200 text-slate-500 hover:border-emerald-400"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 6: Destinations */}
          <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-xl p-8 transition-all hover:border-red-100">
            <div className="flex items-center gap-4 mb-2"><div className="p-3 bg-red-500 rounded-2xl text-white"><FaMapMarkerAlt /></div><h2 className="text-2xl font-black text-slate-800">Destinations</h2></div>
            <p className="text-slate-400 text-xs font-medium mb-6 ml-1">{selectedDestinationIds.length} selected</p>
            <div className="relative mb-4">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input value={destSearch} onChange={e => setDestSearch(e.target.value)} placeholder="Search destinations..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-red-400 text-sm" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-1">
              {filteredDests.map(dest => (
                <button key={dest._id} type="button" onClick={() => toggleDestination(dest._id)}
                  className={`flex items-center gap-2 p-3 rounded-2xl border-2 text-xs font-bold transition-all text-left ${selectedDestinationIds.includes(dest._id) ? "bg-red-50 border-red-400 text-red-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-red-300"}`}>
                  {selectedDestinationIds.includes(dest._id) && <FaCheck size={10} className="text-red-500 flex-shrink-0" />}
                  {dest.name}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 7: Hotels */}
          <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-xl p-8 transition-all hover:border-amber-100">
            <div className="flex items-center gap-4 mb-2"><div className="p-3 bg-amber-500 rounded-2xl text-white"><FaHotel /></div><h2 className="text-2xl font-black text-slate-800">Included Hotels</h2></div>
            <p className="text-slate-400 text-xs font-medium mb-6 ml-1">{selectedHotelIds.length} selected</p>
            <div className="relative mb-4">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input value={hotelSearch} onChange={e => setHotelSearch(e.target.value)} placeholder="Search hotels..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-amber-400 text-sm" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-1">
              {filteredHotels.map(hotel => (
                <button key={hotel._id} type="button" onClick={() => toggleHotel(hotel._id)}
                  className={`flex items-center gap-2 p-3 rounded-2xl border-2 text-xs font-bold transition-all text-left ${selectedHotelIds.includes(hotel._id) ? "bg-amber-50 border-amber-400 text-amber-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-amber-300"}`}>
                  {selectedHotelIds.includes(hotel._id) && <FaCheck size={10} className="text-amber-500 flex-shrink-0" />}
                  {hotel.name}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 8: Itinerary */}
          <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-xl p-8 transition-all hover:border-blue-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4"><div className="p-3 bg-blue-500 rounded-2xl text-white"><FaCalendarAlt /></div><h2 className="text-2xl font-black text-slate-800">Itinerary</h2></div>
              <button type="button" onClick={addItinerary} className="bg-blue-500 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all flex items-center gap-2"><FaPlus size={11} /> Add Day</button>
            </div>
            <div className="space-y-6">
              {itineraries.map((itin, iIdx) => (
                <div key={iIdx} className="relative group bg-slate-50 border-2 border-slate-100 rounded-3xl p-6">
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <InputGroup label={`Day ${itin.day_no}`} value={itin.day_no} readOnly />
                    <div className="md:col-span-3"><InputGroup label="Day Title" value={itin.title} onChange={(e) => handleItineraryChange(iIdx, "title", e.target.value)} placeholder="e.g. Arrival · Tea country immersion" /></div>
                  </div>
                  <div className="space-y-3 mb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Activities</p>
                    {itin.activities.map((act, aIdx) => (
                      <div key={aIdx} className="flex gap-3 items-center bg-slate-50 rounded-2xl p-3 border border-slate-200">
                        <FaClock size={12} className="text-slate-400 flex-shrink-0" />
                        <input type="text" value={act.time} onChange={(e) => handleActivityChange(iIdx, aIdx, "time", e.target.value)} placeholder="08:30"
                          className="w-20 p-2 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-400 text-xs font-black text-slate-700 text-center" />
                        <input type="text" value={act.task} onChange={(e) => handleActivityChange(iIdx, aIdx, "task", e.target.value)} placeholder="Describe the activity..."
                          className="flex-1 p-2 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-400 text-sm text-slate-700 font-medium" />
                        {itin.activities.length > 1 && <button type="button" onClick={() => removeActivity(iIdx, aIdx)} className="text-red-400 hover:text-red-600"><FaTimes size={12} /></button>}
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => addActivity(iIdx)} className="text-blue-500 font-black text-xs uppercase tracking-widest flex items-center gap-1.5 hover:text-blue-700"><FaPlus size={9} /> Add Activity</button>
                  {itineraries.length > 1 && (
                    <button type="button" onClick={() => removeItinerary(iIdx)} className="absolute -top-3 -right-3 bg-red-500 text-white p-2.5 rounded-full shadow-lg hover:bg-red-600 transition-all hover:scale-110 opacity-0 group-hover:opacity-100"><FaTrash size={12} /></button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 9: Transport */}
          <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-xl p-8 transition-all hover:border-green-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4"><div className="p-3 bg-green-500 rounded-2xl text-white"><FaBus /></div><h2 className="text-2xl font-black text-slate-800">Transport</h2></div>
              <button type="button" onClick={addTransport} className="bg-green-500 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-green-600 transition-all flex items-center gap-2"><FaPlus size={11} /> Add</button>
            </div>
            <div className="space-y-3">
              {transport.map((t, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <input type="text" value={t} onChange={(e) => handleTransportChange(idx, e.target.value)} placeholder="e.g. Scenic train ride, Private A/C vehicle..."
                    className="flex-1 px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-green-400 transition-all font-bold text-slate-700" />
                  {transport.length > 1 && <button type="button" onClick={() => removeTransport(idx)} className="p-3 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><FaTrash size={16} /></button>}
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 10: Gallery */}
          <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-xl p-8">
            <div className="flex items-center gap-4 mb-8"><div className="p-3 bg-pink-500 rounded-2xl text-white"><FaImage /></div><h2 className="text-2xl font-black text-slate-800">Gallery Assets</h2></div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {galleryPreviews.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-3xl overflow-hidden border-2 border-slate-200 group">
                  <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Gallery" />
                  <button type="button" onClick={() => removeGalleryImage(i)} className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><FaTrash size={24} /></button>
                </div>
              ))}
              <label className="aspect-square border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center hover:bg-pink-50 cursor-pointer transition-all hover:border-pink-400 group">
                <FaPlus className="text-slate-300 group-hover:text-pink-500 mb-2" size={30} />
                <span className="text-xs font-black text-slate-400 group-hover:text-pink-600 uppercase">Add Media</span>
                <input type="file" multiple onChange={handleGalleryChange} className="hidden" accept="image/*" />
              </label>
            </div>
          </div>

          {/* SECTION 11: FAQs */}
          <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden">
            <div className="bg-slate-900 p-6 flex justify-between items-center">
              <h2 className="text-white font-bold flex items-center gap-2"><FaQuestionCircle /> Frequently Asked Questions</h2>
              <button type="button" onClick={addFaq} className="bg-orange-500 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-orange-400 transition-all">+ Add FAQ</button>
            </div>
            <div className="p-8 space-y-6 bg-slate-50/30">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm relative group">
                  <div className="grid grid-cols-1 gap-4">
                    <InputGroup label="Question" value={faq.question} onChange={(e) => handleFaqChange(idx, "question", e.target.value)} placeholder="e.g. Is the train seat guaranteed?" />
                    <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Answer</label>
                      <textarea value={faq.answer} onChange={(e) => handleFaqChange(idx, "answer", e.target.value)} placeholder="Provide a clear answer..." rows={2}
                        className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-orange-400 transition-all text-slate-700 resize-none font-medium" /></div>
                  </div>
                  {faqs.length > 1 && <button type="button" onClick={() => removeFaq(idx)} className="absolute -top-3 -right-3 bg-red-500 text-white p-2.5 rounded-full shadow-lg hover:bg-red-600 transition-all hover:scale-110 opacity-0 group-hover:opacity-100"><FaTrash size={12} /></button>}
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 12: Traveller Tips */}
          <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden">
            <div className="bg-slate-900 p-6 flex justify-between items-center">
              <h2 className="text-white font-bold flex items-center gap-2"><FaLightbulb /> Traveller Tips</h2>
              <button type="button" onClick={addTip} className="bg-yellow-500 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-yellow-400 transition-all">+ Add Tip</button>
            </div>
            <div className="p-8 space-y-6 bg-slate-50/30">
              {travellerTips.map((tip, idx) => (
                <div key={idx} className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm relative group">
                  <div className="grid grid-cols-1 gap-4">
                    <InputGroup label="Tip Title" value={tip.title} onChange={(e) => handleTipChange(idx, "title", e.target.value)} placeholder="e.g. Pack Layers" />
                    <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Description</label>
                      <textarea value={tip.description} onChange={(e) => handleTipChange(idx, "description", e.target.value)} placeholder="Give helpful context..." rows={2}
                        className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-yellow-400 transition-all text-slate-700 resize-none font-medium" /></div>
                  </div>
                  {travellerTips.length > 1 && <button type="button" onClick={() => removeTip(idx)} className="absolute -top-3 -right-3 bg-red-500 text-white p-2.5 rounded-full shadow-lg hover:bg-red-600 transition-all hover:scale-110 opacity-0 group-hover:opacity-100"><FaTrash size={12} /></button>}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] text-2xl font-black shadow-2xl hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-[0.99]">
            {loading ? "SAVING CHANGES..." : "SYNC PACKAGE TO DATABASE"}
          </button>
        </form>
      </div>
    </div>
  );
};

const InputGroup = ({ label, hasError, ...props }) => (
  <div className="w-full">
    {label && <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">{label}</label>}
    <input {...props} className={`w-full px-5 py-4 bg-white border-2 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all text-slate-800 font-bold ${hasError ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-500"}`} />
  </div>
);

export default EditPackagePage;