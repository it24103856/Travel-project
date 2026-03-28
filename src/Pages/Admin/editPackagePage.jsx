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

const CATEGORY_OPTIONS = [
  "Adventure", "Wildlife", "Historical", "Beach",
  "Family", "Cultural", "City Tours", "Wellness and Retreat"
];

const EditPackagePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({ title: "", description: "", location: "", price: "", no_of_days: "" });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [customCategory, setCustomCategory] = useState("");

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

  // ── Fetch hotels & destinations ──
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

  // ── Fetch existing package ──
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const res = await axios.get(`${backendUrl}/packages/get/${id}`);
        if (res.data?.data) {
          const pkg = res.data.data;
          setFormData({ title: pkg.title || "", description: pkg.description || "", location: pkg.location || "", price: pkg.price || "", no_of_days: pkg.no_of_days || "" });
          setSelectedCategories(pkg.categories || []);
          setGalleryPreviews(pkg.gallery || []);
          setItineraries(pkg.itineraries?.length
            ? pkg.itineraries.map(i => ({ ...i, activities: i.activities?.length ? i.activities : [{ time: "", task: "" }] }))
            : [{ day_no: 1, title: "", activities: [{ time: "", task: "" }] }]);
          setTransport(pkg.transport?.length ? pkg.transport : [""]);
          setFaqs(pkg.faqs?.length ? pkg.faqs : [{ question: "", answer: "" }]);
          setTravellerTips(pkg.traveller_tips?.length ? pkg.traveller_tips : [{ title: "", description: "" }]);
          // Prefill selected IDs — handle both populated objects and raw IDs
          setSelectedHotelIds((pkg.included_hotels || []).map(h => h._id || h));
          setSelectedDestinationIds((pkg.destinations || []).map(d => d._id || d));
        }
      } catch { toast.error("Failed to load package data!"); }
      finally { setFetching(false); }
    };
    if (id) fetchPackage();
  }, [id, backendUrl]);

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
  const toggleHotel = (hId) => setSelectedHotelIds(prev => prev.includes(hId) ? prev.filter(i => i !== hId) : [...prev, hId]);
  const toggleDestination = (dId) => setSelectedDestinationIds(prev => prev.includes(dId) ? prev.filter(i => i !== dId) : [...prev, dId]);

  // ── Gallery ──
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (selectedCategories.length === 0) return toast.error("Please select at least one category");
    setLoading(true);
    try {
      let finalGallery = galleryPreviews.filter(p => p.startsWith("http"));
      if (galleryFiles.length > 0) {
        toast.loading("Uploading new images...", { id: "upload" });
        const newUrls = await Promise.all(galleryFiles.map(f => uploadFile(f)));
        finalGallery = [...finalGallery, ...newUrls];
        toast.dismiss("upload");
      }
      const updatedData = {
        ...formData,
        price: Number(formData.price), no_of_days: Number(formData.no_of_days),
        categories: selectedCategories,
        included_hotels: selectedHotelIds,
        destinations: selectedDestinationIds,
        gallery: finalGallery, itineraries,
        transport: transport.filter(t => t.trim() !== ""),
        faqs, traveller_tips: travellerTips,
      };
      await axios.put(`${backendUrl}/packages/update/${id}`, updatedData, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Package updated successfully!");
      setTimeout(() => navigate("/admin/packages"), 1500);
    } catch { toast.error("Update failed!"); }
    finally { setLoading(false); }
  };

  const filteredHotels = allHotels.filter(h => h.name?.toLowerCase().includes(hotelSearch.toLowerCase()) || h.city?.toLowerCase().includes(hotelSearch.toLowerCase()));
  const filteredDestinations = allDestinations.filter(d => d.name?.toLowerCase().includes(destSearch.toLowerCase()));

  if (fetching) return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-600 font-bold tracking-widest uppercase text-sm">Loading Package Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9] py-12 px-4">
      <Toaster position="top-center" />
      <div className="max-w-5xl mx-auto">

        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold transition-all"><FaArrowLeft /> Back</button>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
            <FaSuitcase className="text-amber-500" />
            <span className="text-xs font-black uppercase text-slate-500">Package Editor</span>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-8">

          {/* SECTION 1: Essentials */}
          <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-xl p-8 transition-all hover:border-amber-100">
            <div className="flex items-center gap-4 mb-8"><div className="p-3 bg-amber-500 rounded-2xl text-white"><FaSuitcase /></div><h2 className="text-2xl font-black text-slate-800">Package Essentials</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2"><InputGroup label="Package Title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Hill Country Escape" /></div>
              <InputGroup label="Location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Ella, Bandarawela" />
              <InputGroup label="Price (LKR)" name="price" type="number" value={formData.price} onChange={handleChange} />
              <InputGroup label="Number of Days" name="no_of_days" type="number" value={formData.no_of_days} onChange={handleChange} />
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={4}
                  className="w-full p-5 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-amber-400 transition-all text-slate-800 shadow-sm resize-none font-medium" />
              </div>
            </div>
          </div>

          {/* SECTION 2: Categories */}
          <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-xl p-8 transition-all hover:border-purple-100">
            <div className="flex items-center gap-4 mb-3"><div className="p-3 bg-purple-500 rounded-2xl text-white"><FaTag /></div><h2 className="text-2xl font-black text-slate-800">Categories</h2></div>
            <p className="text-slate-400 text-sm mb-6 ml-1">Select from the list or type a custom category</p>
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
                className="flex-1 px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-purple-400 transition-all text-slate-700 text-sm font-bold" />
              <button type="button" onClick={addCustomCategory} className="bg-purple-500 text-white px-6 py-3 rounded-2xl font-black hover:bg-purple-600 transition-all flex items-center gap-2 shadow-md"><FaPlus size={12} /> Add</button>
            </div>
            {selectedCategories.length > 0 && (
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Selected</p>
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
          <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden">
            <div className="bg-slate-900 p-6 flex justify-between items-center">
              <h2 className="text-white font-bold flex items-center gap-2"><FaHotel /> Included Hotels</h2>
              <span className="text-slate-400 text-xs">{selectedHotelIds.length} selected</span>
            </div>
            <div className="p-8 bg-slate-50/30">
              <div className="relative mb-6">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input type="text" value={hotelSearch} onChange={(e) => setHotelSearch(e.target.value)} placeholder="Search hotels by name or city..."
                  className="w-full pl-10 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-blue-400 transition-all text-sm font-bold text-slate-700" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-1">
                {filteredHotels.length > 0 ? filteredHotels.map((hotel) => {
                  const selected = selectedHotelIds.includes(hotel._id);
                  return (
                    <button key={hotel._id} type="button" onClick={() => toggleHotel(hotel._id)}
                      className={`relative text-left rounded-2xl border-2 overflow-hidden transition-all bg-white ${selected ? "border-blue-500 shadow-lg shadow-blue-100" : "border-slate-200 hover:border-slate-300"}`}>
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
                <p className="mt-4 text-xs font-black text-blue-600 uppercase tracking-widest">✓ {selectedHotelIds.length} hotel{selectedHotelIds.length > 1 ? "s" : ""} selected</p>
              )}
            </div>
          </div>

          {/* SECTION 4: Destinations */}
          <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden">
            <div className="bg-slate-900 p-6 flex justify-between items-center">
              <h2 className="text-white font-bold flex items-center gap-2"><FaMapMarkerAlt /> Destinations</h2>
              <span className="text-slate-400 text-xs">{selectedDestinationIds.length} selected</span>
            </div>
            <div className="p-8 bg-slate-50/30">
              <div className="relative mb-6">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input type="text" value={destSearch} onChange={(e) => setDestSearch(e.target.value)} placeholder="Search destinations by name..."
                  className="w-full pl-10 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-emerald-400 transition-all text-sm font-bold text-slate-700" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-1">
                {filteredDestinations.length > 0 ? filteredDestinations.map((dest) => {
                  const selected = selectedDestinationIds.includes(dest._id);
                  return (
                    <button key={dest._id} type="button" onClick={() => toggleDestination(dest._id)}
                      className={`relative text-left rounded-2xl border-2 overflow-hidden transition-all bg-white ${selected ? "border-emerald-500 shadow-lg shadow-emerald-100" : "border-slate-200 hover:border-slate-300"}`}>
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
                <p className="mt-4 text-xs font-black text-emerald-600 uppercase tracking-widest">✓ {selectedDestinationIds.length} destination{selectedDestinationIds.length > 1 ? "s" : ""} selected</p>
              )}
            </div>
          </div>

          {/* SECTION 5: Itinerary */}
          <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden">
            <div className="bg-slate-900 p-6 flex justify-between items-center">
              <h2 className="text-white font-bold flex items-center gap-2"><FaCalendarAlt /> Travel Itinerary</h2>
              <button type="button" onClick={addItinerary} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-500 transition-all">+ Add Day</button>
            </div>
            <div className="p-8 space-y-6 bg-slate-50/30">
              {itineraries.map((itin, iIdx) => (
                <div key={iIdx} className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm relative group">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="flex items-end"><span className="bg-slate-900 text-white text-xs font-black px-4 py-3 rounded-2xl w-full text-center">Day {itin.day_no}</span></div>
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

          {/* SECTION 6: Transport */}
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

          {/* SECTION 7: Gallery */}
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

          {/* SECTION 8: FAQs */}
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

          {/* SECTION 9: Traveller Tips */}
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

const InputGroup = ({ label, ...props }) => (
  <div className="w-full">
    {label && <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">{label}</label>}
    <input {...props} className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-slate-800 font-bold" />
  </div>
);

export default EditPackagePage;