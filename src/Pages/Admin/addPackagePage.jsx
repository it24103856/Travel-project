import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  FaPlus, FaTrash, FaArrowLeft, FaImage,
  FaCalendarAlt, FaTag, FaHotel, FaBus,
  FaLightbulb, FaQuestionCircle, FaTimes,
  FaCheck, FaSuitcase, FaClock, FaMapMarkerAlt, FaSearch
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

const AddPackagePage = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    title: "", description: "", location: "", price: "", no_of_days: "",
    min_group_size: 1, max_group_size: 20,                // ✦ new
  });

  const [errors, setErrors] = useState({});

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedWeather, setSelectedWeather] = useState([]);      // ✦ new
  const [selectedInterests, setSelectedInterests] = useState([]);  // ✦ new

  // ── Hotels & Destinations from DB ──
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

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [hotelsRes, destsRes] = await Promise.all([
          axios.get(`${backendUrl}/hotels/all`),
          axios.get(`${backendUrl}/destinations/all`),
        ]);
        setAllHotels(hotelsRes.data?.data || []);
        setAllDestinations(destsRes.data?.data || []);
      } catch (error) {
        toast.error("Failed to load hotels/destinations");
      }
    };
    fetchOptions();
  }, [backendUrl]);

  useEffect(() => {
    if (isEditing) {
      const fetchPackage = async () => {
        try {
          const res = await axios.get(`${backendUrl}/packages/get/${id}`);
          const pkg = res.data.data;
          setFormData({
            title: pkg.title || "", description: pkg.description || "",
            location: pkg.location || "", price: pkg.price || "",
            no_of_days: pkg.no_of_days || "",
            min_group_size: pkg.min_group_size || 1,   // ✦ new
            max_group_size: pkg.max_group_size || 20,  // ✦ new
          });
          setSelectedCategories(pkg.categories || []);
          setSelectedWeather(pkg.weather || []);        // ✦ new
          setSelectedInterests(pkg.interests || []);    // ✦ new
          setGalleryPreviews(pkg.gallery || []);
          setItineraries(pkg.itineraries?.length ? pkg.itineraries.map(i => ({ ...i, activities: i.activities?.length ? i.activities : [{ time: "", task: "" }] })) : [{ day_no: 1, title: "", activities: [{ time: "", task: "" }] }]);
          setTransport(pkg.transport?.length ? pkg.transport : [""]);
          setFaqs(pkg.faqs?.length ? pkg.faqs : [{ question: "", answer: "" }]);
          setTravellerTips(pkg.traveller_tips?.length ? pkg.traveller_tips : [{ title: "", description: "" }]);
          setSelectedHotelIds((pkg.included_hotels || []).map(h => h._id || h));
          setSelectedDestinationIds((pkg.destinations || []).map(d => d._id || d));
        } catch { toast.error("Failed to load package data"); }
      };
      fetchPackage();
    }
  }, [id, backendUrl, isEditing]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: "" }));
  };

  const toggleCategory = (cat) => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

  // ✦ new handlers
  const toggleWeather = (w) => setSelectedWeather(prev => prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w]);
  const toggleInterest = (i) => setSelectedInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const toggleHotel = (hotelId) => setSelectedHotelIds(prev => prev.includes(hotelId) ? prev.filter(i => i !== hotelId) : [...prev, hotelId]);
  const toggleDestination = (destId) => setSelectedDestinationIds(prev => prev.includes(destId) ? prev.filter(i => i !== destId) : [...prev, destId]);

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setGalleryFiles(prev => [...prev, ...files]);
    setGalleryPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };
  const removeGalleryImage = (i) => { setGalleryPreviews(prev => prev.filter((_, idx) => idx !== i)); setGalleryFiles(prev => prev.filter((_, idx) => idx !== i)); };

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
        weather:         selectedWeather,       // ✦ new
        interests:       selectedInterests,     // ✦ new
        gallery:         galleryUrls,
        itineraries,
        transport:       transport.filter(t => t.trim()),
        faqs:            faqs.filter(f => f.question.trim()),
        traveller_tips:  travellerTips.filter(t => t.title.trim()),
        included_hotels: selectedHotelIds,
        destinations:    selectedDestinationIds,
      };
      if (isEditing) {
        await axios.put(`${backendUrl}/packages/update/${id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Package updated!");
      } else {
        await axios.post(`${backendUrl}/packages/create`, payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Package created!");
      }
      navigate("/admin/packages");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const filteredHotels = allHotels.filter(h => h.name?.toLowerCase().includes(hotelSearch.toLowerCase()));
  const filteredDests  = allDestinations.filter(d => d.name?.toLowerCase().includes(destSearch.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto px-4 py-10">

        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => navigate(-1)} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-100 transition-all"><FaArrowLeft className="text-slate-600" /></button>
          <div>
            <h1 className="text-3xl font-black text-slate-900">{isEditing ? "Edit Package" : "Add New Package"}</h1>
            <p className="text-slate-400 text-sm font-medium">Fill in the details below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* SECTION 1: Basic Info */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-800"><FaSuitcase className="text-blue-500" /> Basic Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="md:col-span-2">
                <InputGroup
                  label="Package Title *"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Magical Hill Country Experience"
                  hasError={!!errors.title}
                />
                {errors.title && <p className="text-red-500 text-xs font-bold mt-1 ml-2">⚠ {errors.title}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the package experience..."
                  rows={4}
                  className={`w-full p-5 bg-slate-50 border rounded-2xl outline-none focus:bg-white transition-all text-slate-700 resize-none shadow-sm ${errors.description ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-500"}`}
                />
                {errors.description && <p className="text-red-500 text-xs font-bold mt-1 ml-2">⚠ {errors.description}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 mb-2">Location *</label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full p-5 bg-slate-50 border rounded-2xl outline-none focus:bg-white transition-all text-slate-700 font-bold appearance-none shadow-sm ${errors.location ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-500"}`}
                >
                  <option value="">Select location...</option>
                  {["Colombo","Kandy","Galle","Jaffna","Anuradhapura","Polonnaruwa","Sigiriya","Ella","Nuwara Eliya","Trincomalee","Batticaloa","Hambantota","Mirissa","Hikkaduwa","Arugam Bay","Yala","Wilpattu","Udawalawe","Dambulla","Matara","Bentota","Negombo","Ratnapura","Badulla","Ampara","Multi-location"].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
                {errors.location && <p className="text-red-500 text-xs font-bold mt-1 ml-2">⚠ {errors.location}</p>}
              </div>

              <div>
                <InputGroup
                  label="Price (LKR) *"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 25000"
                  hasError={!!errors.price}
                />
                {errors.price && <p className="text-red-500 text-xs font-bold mt-1 ml-2">⚠ {errors.price}</p>}
              </div>

              <div>
                <InputGroup
                  label="Number of Days *"
                  name="no_of_days"
                  type="number"
                  value={formData.no_of_days}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  hasError={!!errors.no_of_days}
                />
                {errors.no_of_days && <p className="text-red-500 text-xs font-bold mt-1 ml-2">⚠ {errors.no_of_days}</p>}
              </div>

            </div>
          </div>

          {/* SECTION 2: Categories */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3 text-slate-800"><FaTag className="text-purple-500" /> Categories</h2>
            <p className="text-slate-400 text-xs font-medium mb-6">Select all that apply</p>
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

          {/* SECTION 3: Group Size ✦ new */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-800"><FaSuitcase className="text-teal-500" /> Group Size</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Min Group Size" name="min_group_size" type="number" value={formData.min_group_size} onChange={handleChange} placeholder="e.g. 1" />
              <InputGroup label="Max Group Size" name="max_group_size" type="number" value={formData.max_group_size} onChange={handleChange} placeholder="e.g. 20" />
            </div>
          </div>

          {/* SECTION 4: Weather ✦ new */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3 text-slate-800"><FaCalendarAlt className="text-sky-500" /> Suitable Weather</h2>
            <p className="text-slate-400 text-xs font-medium mb-6">Select the weather conditions this package is best suited for</p>
            <div className="flex flex-wrap gap-3">
              {WEATHER_OPTIONS.map(({ value, label }) => (
                <button key={value} type="button" onClick={() => toggleWeather(value)}
                  className={`px-5 py-2.5 rounded-full text-xs font-black border-2 transition-all ${selectedWeather.includes(value) ? "bg-sky-500 border-sky-500 text-white scale-[1.04]" : "bg-white border-slate-200 text-slate-500 hover:border-sky-400"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 5: Related Interests ✦ new */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3 text-slate-800"><FaCheck className="text-emerald-500" /> Related Interests</h2>
            <p className="text-slate-400 text-xs font-medium mb-6">Select the traveller interests this package caters to</p>
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
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3 text-slate-800"><FaMapMarkerAlt className="text-red-500" /> Destinations</h2>
            <p className="text-slate-400 text-xs font-medium mb-6">{selectedDestinationIds.length} selected</p>
            <div className="relative mb-4">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input value={destSearch} onChange={e => setDestSearch(e.target.value)} placeholder="Search destinations..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-red-400 text-sm" />
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
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3 text-slate-800"><FaHotel className="text-amber-500" /> Included Hotels</h2>
            <p className="text-slate-400 text-xs font-medium mb-6">{selectedHotelIds.length} selected</p>
            <div className="relative mb-4">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input value={hotelSearch} onChange={e => setHotelSearch(e.target.value)} placeholder="Search hotels..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-amber-400 text-sm" />
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
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800"><FaCalendarAlt className="text-blue-500" /> Itinerary</h2>
              <button type="button" onClick={addItinerary} className="bg-blue-500 text-white px-6 py-3 rounded-2xl font-black hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg shadow-blue-200"><FaPlus /> Add Day</button>
            </div>
            <div className="space-y-6">
              {itineraries.map((itin, iIdx) => (
                <div key={iIdx} className="bg-slate-50 border border-slate-200 p-6 rounded-[1.5rem] relative shadow-inner">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <InputGroup label={`Day ${itin.day_no}`} value={itin.day_no} readOnly className="w-full p-5 bg-white border border-slate-200 rounded-2xl text-center font-black text-blue-600" />
                    <div className="md:col-span-3"><InputGroup label="Day Title" value={itin.title} onChange={(e) => handleItineraryChange(iIdx, "title", e.target.value)} placeholder="e.g. Arrival & Exploration" /></div>
                  </div>
                  <div className="space-y-3 mb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Activities</p>
                    {itin.activities.map((act, aIdx) => (
                      <div key={aIdx} className="flex gap-3 items-center bg-white rounded-2xl p-3 border border-slate-200 shadow-sm">
                        <FaClock size={12} className="text-slate-400 flex-shrink-0" />
                        <input type="text" value={act.time} onChange={(e) => handleActivityChange(iIdx, aIdx, "time", e.target.value)} placeholder="08:30"
                          className="w-20 p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-xs font-black text-slate-700 text-center" />
                        <input type="text" value={act.task} onChange={(e) => handleActivityChange(iIdx, aIdx, "task", e.target.value)} placeholder="Describe the activity..."
                          className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-sm text-slate-700" />
                        {itin.activities.length > 1 && <button type="button" onClick={() => removeActivity(iIdx, aIdx)} className="text-red-400 hover:text-red-600"><FaTimes size={12} /></button>}
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => addActivity(iIdx)} className="text-blue-500 font-black text-xs uppercase tracking-widest flex items-center gap-1.5 hover:text-blue-700"><FaPlus size={9} /> Add Activity</button>
                  {itineraries.length > 1 && (
                    <button type="button" onClick={() => removeItinerary(iIdx)} className="absolute -top-3 -right-3 bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition-all hover:scale-110"><FaTrash size={14} /></button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 9: Transport */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800"><FaBus className="text-green-500" /> Transport</h2>
              <button type="button" onClick={addTransport} className="bg-green-500 text-white px-6 py-3 rounded-2xl font-black hover:bg-green-600 transition-all flex items-center gap-2 shadow-lg shadow-green-200"><FaPlus /> Add</button>
            </div>
            <div className="space-y-3">
              {transport.map((t, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <input type="text" value={t} onChange={(e) => handleTransportChange(idx, e.target.value)} placeholder="e.g. Scenic train ride, Private A/C vehicle..."
                    className="flex-1 p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-green-400 focus:bg-white transition-all font-bold text-slate-700 shadow-sm" />
                  {transport.length > 1 && <button type="button" onClick={() => removeTransport(idx)} className="p-3 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><FaTrash size={16} /></button>}
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 10: Gallery */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-800"><FaImage className="text-pink-500" /> Package Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {galleryPreviews.map((src, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-slate-200 relative group shadow-sm">
                  <img src={src} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeGalleryImage(i)} className="absolute inset-0 bg-red-500/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"><FaTrash /></button>
                </div>
              ))}
              <label className="aspect-square border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 text-slate-400 hover:border-pink-400 hover:text-pink-400 transition-all">
                <FaPlus size={24} /><span className="text-[10px] font-black mt-2 uppercase">Add Photo</span>
                <input type="file" multiple className="hidden" onChange={handleGalleryChange} />
              </label>
            </div>
          </div>

          {/* SECTION 11: FAQs */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800"><FaQuestionCircle className="text-orange-500" /> FAQs</h2>
              <button type="button" onClick={addFaq} className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-black hover:bg-orange-600 transition-all flex items-center gap-2 shadow-lg shadow-orange-200"><FaPlus /> Add FAQ</button>
            </div>
            <div className="space-y-6">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 p-6 rounded-[1.5rem] relative shadow-inner">
                  <div className="grid grid-cols-1 gap-4">
                    <InputGroup label="Question" value={faq.question} onChange={(e) => handleFaqChange(idx, "question", e.target.value)} placeholder="e.g. Is the train seat guaranteed?" />
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Answer</label>
                      <textarea value={faq.answer} onChange={(e) => handleFaqChange(idx, "answer", e.target.value)} placeholder="Provide a clear answer..." rows={2}
                        className="w-full p-5 bg-white border border-slate-200 rounded-2xl outline-none focus:border-orange-400 transition-all text-slate-700 resize-none shadow-sm" />
                    </div>
                  </div>
                  {faqs.length > 1 && <button type="button" onClick={() => removeFaq(idx)} className="absolute -top-3 -right-3 bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition-all hover:scale-110"><FaTrash size={14} /></button>}
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 12: Traveller Tips */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800"><FaLightbulb className="text-yellow-500" /> Traveller Tips</h2>
              <button type="button" onClick={addTip} className="bg-yellow-500 text-white px-6 py-3 rounded-2xl font-black hover:bg-yellow-600 transition-all flex items-center gap-2 shadow-lg shadow-yellow-200"><FaPlus /> Add Tip</button>
            </div>
            <div className="space-y-6">
              {travellerTips.map((tip, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 p-6 rounded-[1.5rem] relative shadow-inner">
                  <div className="grid grid-cols-1 gap-4">
                    <InputGroup label="Tip Title" value={tip.title} onChange={(e) => handleTipChange(idx, "title", e.target.value)} placeholder="e.g. Pack Layers" />
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Description</label>
                      <textarea value={tip.description} onChange={(e) => handleTipChange(idx, "description", e.target.value)} placeholder="Give helpful context..." rows={2}
                        className="w-full p-5 bg-white border border-slate-200 rounded-2xl outline-none focus:border-yellow-400 transition-all text-slate-700 resize-none shadow-sm" />
                    </div>
                  </div>
                  {travellerTips.length > 1 && <button type="button" onClick={() => removeTip(idx)} className="absolute -top-3 -right-3 bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition-all hover:scale-110"><FaTrash size={14} /></button>}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full bg-slate-900 text-white py-8 rounded-[2rem] text-3xl font-black shadow-xl hover:bg-blue-700 transition-all transform hover:-translate-y-1 active:scale-[0.98] disabled:bg-slate-400">
            {loading ? "PROCESSING..." : (isEditing ? "UPDATE PACKAGE" : "CREATE PACKAGE")}
          </button>
        </form>
      </div>
    </div>
  );
};

const InputGroup = ({ label, hasError, ...props }) => (
  <div className="space-y-2">
    {label && <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">{label}</label>}
    <input
      {...props}
      className={`w-full p-5 bg-slate-50 border rounded-2xl outline-none transition-all font-bold text-slate-700 shadow-sm placeholder:text-slate-300 ${hasError ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-500 focus:bg-white"}`}
    />
  </div>
);

export default AddPackagePage;