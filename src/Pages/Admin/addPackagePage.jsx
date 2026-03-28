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

const CATEGORY_OPTIONS = [
  "Adventure", "Wildlife", "Historical", "Beach",
  "Family", "Cultural", "City Tours", "Wellness and Retreat"
];

const AddPackagePage = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    title: "", description: "", location: "", price: "", no_of_days: "",
  });

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [customCategory, setCustomCategory] = useState("");

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

  // ── Fetch all hotels & destinations on mount ──
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

  // ── Edit mode prefill ──
  useEffect(() => {
    if (isEditing) {
      const fetchPackage = async () => {
        try {
          const res = await axios.get(`${backendUrl}/packages/get/${id}`);
          const pkg = res.data.data;
          setFormData({ title: pkg.title || "", description: pkg.description || "", location: pkg.location || "", price: pkg.price || "", no_of_days: pkg.no_of_days || "" });
          setSelectedCategories(pkg.categories || []);
          setGalleryPreviews(pkg.gallery || []);
          setItineraries(pkg.itineraries?.length ? pkg.itineraries.map(i => ({ ...i, activities: i.activities?.length ? i.activities : [{ time: "", task: "" }] })) : [{ day_no: 1, title: "", activities: [{ time: "", task: "" }] }]);
          setTransport(pkg.transport?.length ? pkg.transport : [""]);
          setFaqs(pkg.faqs?.length ? pkg.faqs : [{ question: "", answer: "" }]);
          setTravellerTips(pkg.traveller_tips?.length ? pkg.traveller_tips : [{ title: "", description: "" }]);
          // Handle both populated objects and raw IDs
          setSelectedHotelIds((pkg.included_hotels || []).map(h => h._id || h));
          setSelectedDestinationIds((pkg.destinations || []).map(d => d._id || d));
        } catch { toast.error("Failed to load package data"); }
      };
      fetchPackage();
    }
  }, [id, backendUrl, isEditing]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // ── Category handlers ──
  const toggleCategory = (cat) => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  const addCustomCategory = () => {
    const t = customCategory.trim();
    if (!t) return;
    if (selectedCategories.includes(t)) { toast.error("Already added"); return; }
    setSelectedCategories(prev => [...prev, t]);
    setCustomCategory("");
  };
  const removeCategory = (cat) => setSelectedCategories(prev => prev.filter(c => c !== cat));

  // ── Hotel / Destination toggles ──
  const toggleHotel = (hotelId) => setSelectedHotelIds(prev => prev.includes(hotelId) ? prev.filter(i => i !== hotelId) : [...prev, hotelId]);
  const toggleDestination = (destId) => setSelectedDestinationIds(prev => prev.includes(destId) ? prev.filter(i => i !== destId) : [...prev, destId]);

  // ── Gallery ──
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setGalleryFiles(prev => [...prev, ...files]);
    setGalleryPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };
  const removeGalleryImage = (i) => { setGalleryPreviews(prev => prev.filter((_, idx) => idx !== i)); setGalleryFiles(prev => prev.filter((_, idx) => idx !== i)); };

  // ── Itinerary ──
  const addItinerary = () => setItineraries(prev => [...prev, { day_no: prev.length + 1, title: "", activities: [{ time: "", task: "" }] }]);
  const removeItinerary = (i) => setItineraries(prev => prev.filter((_, idx) => idx !== i).map((it, idx) => ({ ...it, day_no: idx + 1 })));
  const handleItineraryChange = (i, f, v) => setItineraries(prev => { const u = [...prev]; u[i] = { ...u[i], [f]: v }; return u; });
  const addActivity = (iIdx) => setItineraries(prev => { const u = [...prev]; u[iIdx].activities = [...u[iIdx].activities, { time: "", task: "" }]; return u; });
  const removeActivity = (iIdx, aIdx) => setItineraries(prev => { const u = [...prev]; u[iIdx].activities = u[iIdx].activities.filter((_, i) => i !== aIdx); return u; });
  const handleActivityChange = (iIdx, aIdx, f, v) => setItineraries(prev => { const u = [...prev]; u[iIdx].activities[aIdx] = { ...u[iIdx].activities[aIdx], [f]: v }; return u; });

  // ── Transport / FAQ / Tips ──
  const addTransport = () => setTransport(p => [...p, ""]);
  const removeTransport = (i) => setTransport(p => p.filter((_, idx) => idx !== i));
  const handleTransportChange = (i, v) => setTransport(p => { const u = [...p]; u[i] = v; return u; });
  const addFaq = () => setFaqs(p => [...p, { question: "", answer: "" }]);
  const removeFaq = (i) => setFaqs(p => p.filter((_, idx) => idx !== i));
  const handleFaqChange = (i, f, v) => setFaqs(p => { const u = [...p]; u[i] = { ...u[i], [f]: v }; return u; });
  const addTip = () => setTravellerTips(p => [...p, { title: "", description: "" }]);
  const removeTip = (i) => setTravellerTips(p => p.filter((_, idx) => idx !== i));
  const handleTipChange = (i, f, v) => setTravellerTips(p => { const u = [...p]; u[i] = { ...u[i], [f]: v }; return u; });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedCategories.length === 0) return toast.error("Please select at least one category");
    if (!formData.title || !formData.location || !formData.price || !formData.no_of_days) return toast.error("Please fill all required fields");
    setLoading(true);
    const tId = toast.loading("Syncing with Cloud...");
    try {
      let finalGallery = galleryPreviews.filter(p => p.startsWith("http"));
      if (galleryFiles.length > 0) {
        const uploaded = await Promise.all(galleryFiles.map(f => uploadFile(f)));
        finalGallery = [...finalGallery, ...uploaded];
      }
      const finalData = {
        ...formData,
        price: Number(formData.price), no_of_days: Number(formData.no_of_days),
        categories: selectedCategories,
        included_hotels: selectedHotelIds,
        destinations: selectedDestinationIds,
        gallery: finalGallery, itineraries,
        transport: transport.filter(t => t.trim() !== ""),
        faqs, traveller_tips: travellerTips,
      };
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (isEditing) {
        await axios.put(`${backendUrl}/packages/update/${id}`, finalData, config);
        toast.success("Package Updated!", { id: tId });
      } else {
        await axios.post(`${backendUrl}/packages/create`, finalData, config);
        toast.success("Package Created!", { id: tId });
      }
      setTimeout(() => navigate("/admin/packages"), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed", { id: tId });
    } finally { setLoading(false); }
  };

  const filteredHotels = allHotels.filter(h => h.name?.toLowerCase().includes(hotelSearch.toLowerCase()) || h.city?.toLowerCase().includes(hotelSearch.toLowerCase()));
  const filteredDestinations = allDestinations.filter(d => d.name?.toLowerCase().includes(destSearch.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4">
      <Toaster position="top-center" />
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12 relative">
          <button onClick={() => navigate(-1)} className="absolute left-0 top-0 flex items-center gap-2 text-gray-500 font-bold hover:text-blue-600 transition-all border border-gray-200 px-4 py-2 rounded-xl bg-white shadow-sm">
            <FaArrowLeft /> Back
          </button>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FaSuitcase className="w-8 h-8 text-amber-500" />
            <span className="bg-[#2D3748] text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              {isEditing ? "Edit Package" : "New Tour Package"}
            </span>
          </div>
          <h1 className="text-5xl font-black text-slate-900">{isEditing ? "Update Package" : "Create Package"}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* SECTION 1: Essentials */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-800"><FaSuitcase className="text-amber-500" /> Package Essentials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2"><InputGroup label="Package Title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Hill Country Escape" /></div>
              <InputGroup label="Location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Ella, Bandarawela" />
              <InputGroup label="Price (LKR)" name="price" type="number" value={formData.price} onChange={handleChange} placeholder="e.g. 12000" />
              <InputGroup label="Number of Days" name="no_of_days" type="number" value={formData.no_of_days} onChange={handleChange} placeholder="e.g. 5" />
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Describe what makes this package special..."
                  className="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700 shadow-inner resize-none" />
              </div>
            </div>
          </div>

          {/* SECTION 2: Categories */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3 text-slate-800"><FaTag className="text-purple-500" /> Categories</h2>
            <p className="text-slate-400 text-sm mb-8">Select from the list or type a custom category</p>
            <div className="flex flex-wrap gap-3 mb-6">
              {CATEGORY_OPTIONS.map((cat) => {
                const active = selectedCategories.includes(cat);
                return (
                  <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                    className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wide border-2 transition-all flex items-center gap-2 ${active ? "bg-[#2D3748] text-white border-[#2D3748] shadow-lg" : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-400"}`}>
                    {active && <FaCheck size={9} />} {cat}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3 mb-6">
              <input type="text" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomCategory())}
                placeholder="Type a custom category and press Add..."
                className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-purple-400 focus:bg-white transition-all text-slate-700 text-sm font-bold" />
              <button type="button" onClick={addCustomCategory}
                className="bg-purple-500 text-white px-6 py-3 rounded-2xl font-black hover:bg-purple-600 transition-all flex items-center gap-2 shadow-md shadow-purple-200">
                <FaPlus size={12} /> Add
              </button>
            </div>
            {selectedCategories.length > 0 && (
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Selected Categories</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((cat) => (
                    <span key={cat} className="flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200 px-4 py-2 rounded-full text-xs font-black">
                      {cat} <button type="button" onClick={() => removeCategory(cat)} className="text-amber-400 hover:text-red-500"><FaTimes size={10} /></button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: Included Hotels */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3 text-slate-800"><FaHotel className="text-blue-500" /> Included Hotels</h2>
            <p className="text-slate-400 text-sm mb-6">Select hotels from your database to include in this package</p>
            <div className="relative mb-6">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input type="text" value={hotelSearch} onChange={(e) => setHotelSearch(e.target.value)} placeholder="Search hotels by name or city..."
                className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-400 focus:bg-white transition-all text-sm font-bold text-slate-700" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[420px] overflow-y-auto pr-1">
              {filteredHotels.length > 0 ? filteredHotels.map((hotel) => {
                const selected = selectedHotelIds.includes(hotel._id);
                return (
                  <button key={hotel._id} type="button" onClick={() => toggleHotel(hotel._id)}
                    className={`relative text-left rounded-2xl border-2 overflow-hidden transition-all ${selected ? "border-blue-500 shadow-lg shadow-blue-100" : "border-slate-200 hover:border-slate-300"}`}>
                    <div className="h-28 overflow-hidden">
                      <img src={hotel.images?.[0] || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"} alt={hotel.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3">
                      <p className="font-black text-slate-800 text-sm leading-tight">{hotel.name}</p>
                      <p className="text-slate-400 text-[10px] mt-0.5 flex items-center gap-1"><FaMapMarkerAlt size={8} /> {hotel.city}</p>
                    </div>
                    {selected && <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1.5 shadow-md"><FaCheck size={10} /></div>}
                  </button>
                );
              }) : <p className="text-slate-400 text-sm italic col-span-3 py-4 text-center">No hotels found</p>}
            </div>
            {selectedHotelIds.length > 0 && (
              <p className="mt-4 text-xs font-black text-blue-600 uppercase tracking-widest">
                ✓ {selectedHotelIds.length} hotel{selectedHotelIds.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          {/* SECTION 4: Destinations */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3 text-slate-800"><FaMapMarkerAlt className="text-emerald-500" /> Destinations</h2>
            <p className="text-slate-400 text-sm mb-6">Select destinations that are visited in this package</p>
            <div className="relative mb-6">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input type="text" value={destSearch} onChange={(e) => setDestSearch(e.target.value)} placeholder="Search destinations by name..."
                className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-400 focus:bg-white transition-all text-sm font-bold text-slate-700" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[420px] overflow-y-auto pr-1">
              {filteredDestinations.length > 0 ? filteredDestinations.map((dest) => {
                const selected = selectedDestinationIds.includes(dest._id);
                return (
                  <button key={dest._id} type="button" onClick={() => toggleDestination(dest._id)}
                    className={`relative text-left rounded-2xl border-2 overflow-hidden transition-all ${selected ? "border-emerald-500 shadow-lg shadow-emerald-100" : "border-slate-200 hover:border-slate-300"}`}>
                    <div className="h-28 overflow-hidden">
                      <img src={dest.image || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4"} alt={dest.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3">
                      <p className="font-black text-slate-800 text-sm leading-tight">{dest.name}</p>
                      {dest.description && <p className="text-slate-400 text-[10px] mt-0.5 line-clamp-1">{dest.description}</p>}
                    </div>
                    {selected && <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1.5 shadow-md"><FaCheck size={10} /></div>}
                  </button>
                );
              }) : <p className="text-slate-400 text-sm italic col-span-3 py-4 text-center">No destinations found</p>}
            </div>
            {selectedDestinationIds.length > 0 && (
              <p className="mt-4 text-xs font-black text-emerald-600 uppercase tracking-widest">
                ✓ {selectedDestinationIds.length} destination{selectedDestinationIds.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          {/* SECTION 5: Itinerary */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800"><FaCalendarAlt className="text-blue-500" /> Travel Itinerary</h2>
              <button type="button" onClick={addItinerary} className="bg-blue-500 text-white px-6 py-3 rounded-2xl font-black hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg shadow-blue-200"><FaPlus /> Add Day</button>
            </div>
            <div className="space-y-6">
              {itineraries.map((itin, iIdx) => (
                <div key={iIdx} className="bg-slate-50 border border-slate-200 p-8 rounded-[2rem] relative group shadow-inner">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="flex items-end"><span className="bg-[#2D3748] text-white text-xs font-black px-4 py-3 rounded-2xl w-full text-center">Day {itin.day_no}</span></div>
                    <div className="md:col-span-3"><InputGroup label="Day Title" value={itin.title} onChange={(e) => handleItineraryChange(iIdx, "title", e.target.value)} placeholder="e.g. Arrival · Tea country immersion" /></div>
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

          {/* SECTION 6: Transport */}
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

          {/* SECTION 7: Gallery */}
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

          {/* SECTION 8: FAQs */}
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

          {/* SECTION 9: Traveller Tips */}
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

const InputGroup = ({ label, ...props }) => (
  <div className="space-y-2">
    {label && <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">{label}</label>}
    <input {...props} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-700 shadow-sm placeholder:text-slate-300" />
  </div>
);

export default AddPackagePage;