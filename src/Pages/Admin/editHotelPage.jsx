import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { 
  FaHotel, FaMapMarkerAlt, FaEnvelope, FaPhone, 
  FaImage, FaBed, FaSave, FaStar, FaCrown, 
  FaRegBuilding, FaWifi, FaConciergeBell, FaPlus, FaTrash, FaArrowLeft 
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom"; 
import { uploadFile } from "../../utils/meadiaUpload.js";

// --- SRI LANKA DATA ---
const SRI_LANKA_DATA = {
   "Western": {
    "Colombo": ["Colombo 01-15", "Dehiwala", "Mount Lavinia", "Moratuwa", "Kotte", "Battaramulla", "Maharagama", "Kesbewa", "Avissawella", "Homagama", "Hanwella"],
    "Gampaha": ["Negombo", "Gampaha", "Veyangoda", "Wattala", "Ja-Ela", "Kadawatha", "Kelaniya", "Kiribathgoda", "Minuwangoda", "Nittambuwa"],
    "Kalutara": ["Kalutara", "Panadura", "Horana", "Beruwala", "Aluthgama", "Matugama", "Wadduwa"]
  },
  "Central": {
    "Kandy": ["Kandy", "Peradeniya", "Gampola", "Nawalapitiya", "Katugastota", "Kundasale", "Digana", "Gelioya"],
    "Matale": ["Matale", "Dambulla", "Sigiriya", "Ukuwela", "Pallepola"],
    "Nuwara Eliya": ["Nuwara Eliya", "Hatton", "Talawakele", "Walapane", "Hanguranketha"]
  },
  "Southern": {
    "Galle": ["Galle", "Hikkaduwa", "Ambalangoda", "Baddegama", "Bentota", "Karapitiya", "Elpitiya", "Ahangama"],
    "Matara": ["Matara", "Weligama", "Mirissa", "Dikwella", "Hakmana", "Deniyaya", "Kamburupitiya"],
    "Hambantota": ["Hambantota", "Tangalle", "Tissamaharama", "Ambalantota", "Beliatta"]
  },
  "North Western": {
    "Kurunegala": ["Kurunegala", "Kuliyapitiya", "Narammala", "Wariyapola", "Pannala", "Polgahawela"],
    "Puttalam": ["Puttalam", "Chilaw", "Marawila", "Wennappuwa", "Kalpitiya", "Dankotuwa"]
  },
  "North Central": {
    "Anuradhapura": ["Anuradhapura", "Eppawala", "Kekirawa", "Medawachchiya", "Mihintale", "Thalawa"],
    "Polonnaruwa": ["Polonnaruwa", "Kaduruwela", "Medirigiriya", "Hingurakgoda"]
  },
  "Uva": {
    "Badulla": ["Badulla", "Bandarawela", "Hali-Ela", "Ella", "Mahiyanganaya", "Welimada", "Passara"],
    "Monaragala": ["Monaragala", "Wellawaya", "Buttala", "Bibile", "Kataragama"]
  },
  "Sabaragamuwa": {
    "Rathnapura": ["Rathnapura", "Balangoda", "Embilipitiya", "Pelmadulla", "Eheliyagoda", "Kuruwita"],
    "Kegalle": ["Kegalle", "Mawanella", "Warakapola", "Rambukkana", "Deraniyagala"]
  },
  "Northern": {
    "Jaffna": ["Jaffna", "Chavakachcheri", "Point Pedro", "Karainagar"],
    "Kilinochchi": ["Kilinochchi", "Pallai"],
    "Mannar": ["Mannar", "Nanattan"],
    "Vavuniya": ["Vavuniya", "Cheddikulam"],
    "Mullaitivu": ["Mullaitivu", "Oddusuddan"]
  },
  "Eastern": {
    "Trincomalee": ["Trincomalee", "Kinniya", "Mutur"],
    "Batticaloa": ["Batticaloa", "Eravur", "Kattankudy", "Valaichchenai"],
    "Ampara": ["Ampara", "Akkaraipattu", "Kalmunai", "Sainthamaruthu"]
  }
};

const EditHotelPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    hotelID: "", name: "", address: "", city: "", province: "",
    district: "", phone: "", email: "", description: "", category: "Budget", amenities: ""
  });

  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  // --- Safe Dynamic Location Selectors ---
  const provinces = useMemo(() => Object.keys(SRI_LANKA_DATA), []);

  const districts = useMemo(() => {
    if (!formData.province || !SRI_LANKA_DATA[formData.province]) return [];
    return Object.keys(SRI_LANKA_DATA[formData.province]);
  }, [formData.province]);

  const cities = useMemo(() => {
    if (!formData.province || !formData.district || !SRI_LANKA_DATA[formData.province]?.[formData.district]) return [];
    return SRI_LANKA_DATA[formData.province][formData.district];
  }, [formData.province, formData.district]);

  // 1. Fetch Existing Data
  useEffect(() => {
    const fetchHotel = async () => {
      try {
        // FIXED URL: Backend route එකට අනුව /get/ එකතු කළා
        const response = await axios.get(`${backendUrl}/hotels/get/${id}`);
        
        if (response.data.data) {
          const hotel = response.data.data;
          
          setFormData({
            hotelID: hotel.hotelID || "",
            name: hotel.name || "",
            address: hotel.address || "",
            city: hotel.city || "",
            province: hotel.province || "",
            district: hotel.district || "",
            phone: hotel.phone || "",
            email: hotel.email || "",
            description: hotel.description || "",
            category: hotel.category || "Budget",
            amenities: Array.isArray(hotel.amenities) ? hotel.amenities.join(", ") : ""
          });
          setRoomTypes(hotel.roomTypes || []);
          setPreviews(hotel.images || []);
        }
      } catch (error) {
        console.error("Fetch error details:", error);
        toast.error("Hotel data load කිරීමට නොහැකි විය!");
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchHotel();
  }, [id, backendUrl]);

  // 2. Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === "province") { updated.district = ""; updated.city = ""; }
      if (name === "district") { updated.city = ""; }
      return updated;
    });
  };

  const handleRoomChange = (index, field, value) => {
    const updatedRooms = [...roomTypes];
    updatedRooms[index][field] = value;
    setRoomTypes(updatedRooms);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalImages = previews.filter(p => p.startsWith('http'));
      if (imageFiles.length > 0) {
        toast.loading("Uploading new images...", { id: "upload" });
        const newUrls = await Promise.all(imageFiles.map(file => uploadFile(file)));
        finalImages = [...finalImages, ...newUrls];
        toast.dismiss("upload");
      }

      const updatedData = {
        ...formData,
        images: finalImages,
        roomTypes,
        amenities: formData.amenities.split(",").map(a => a.trim())
      };

      await axios.put(`${backendUrl}/hotels/update/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Hotel updated successfully!");
      setTimeout(() => navigate("/admin/hotels"), 1500);
    } catch (error) {
      toast.error("Update failed!");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-600 font-bold tracking-widest">LOADING SYSTEM DATA...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9] py-12 px-4">
      <Toaster position="top-center" />
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold transition-all">
            <FaArrowLeft /> Back
          </button>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
             <FaCrown className="text-amber-500" />
             <span className="text-xs font-black uppercase text-slate-500">Editor Panel</span>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-8">
          
          {/* SECTION: GENERAL INFO */}
          <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-xl p-8 transition-all hover:border-blue-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-blue-600 rounded-2xl text-white"><FaHotel /></div>
              <h2 className="text-2xl font-black text-slate-800">Property Essence</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InputGroup label="Hotel Name" name="name" value={formData.name} onChange={handleChange} />
              <InputGroup label="Official Email" name="email" value={formData.email} onChange={handleChange} type="email" />
              <InputGroup label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
              <SelectGroup label="Category" name="category" value={formData.category} onChange={handleChange} options={["Budget", "Luxury", "Boutique"]} />
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-3 ml-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-5 bg-white border-2 border-slate-200 rounded-2xl h-32 outline-none focus:border-blue-500 transition-all shadow-sm" />
              </div>
            </div>
          </div>

          {/* SECTION: LOCATION */}
          <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-xl p-8 transition-all hover:border-emerald-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-emerald-600 rounded-2xl text-white"><FaMapMarkerAlt /></div>
              <h2 className="text-2xl font-black text-slate-800">Location Map</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SelectGroup label="Province" name="province" value={formData.province} onChange={handleChange} options={provinces} />
              <SelectGroup label="District" name="district" value={formData.district} onChange={handleChange} options={districts} disabled={!formData.province} />
              <SelectGroup label="City" name="city" value={formData.city} onChange={handleChange} options={cities} disabled={!formData.district} />
              <div className="md:col-span-3">
                <InputGroup label="Detailed Address" name="address" value={formData.address} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* SECTION: ROOMS */}
          <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden">
            <div className="bg-slate-900 p-6 flex justify-between items-center">
              <h2 className="text-white font-bold flex items-center gap-2"><FaBed /> Inventory Control</h2>
              <button type="button" onClick={() => setRoomTypes([...roomTypes, { type: "Standard", originalPrice: 0, discountPercentage: 0 }])} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-500 transition-all">+ Add Unit</button>
            </div>
            <div className="p-8 space-y-6 bg-slate-50/30">
              {roomTypes.map((room, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm relative group">
                  <InputGroup label="Type" value={room.type} onChange={(e) => handleRoomChange(index, "type", e.target.value)} />
                  <InputGroup label="Base Price" type="number" value={room.originalPrice} onChange={(e) => handleRoomChange(index, "originalPrice", e.target.value)} />
                  <InputGroup label="Discount %" type="number" value={room.discountPercentage} onChange={(e) => handleRoomChange(index, "discountPercentage", e.target.value)} />
                  <div className="flex items-end">
                    <button type="button" onClick={() => setRoomTypes(roomTypes.filter((_, i) => i !== index))} className="w-full py-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 font-bold"><FaTrash /> Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION: MEDIA */}
          <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-xl p-8">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-2 text-slate-800"><FaImage className="text-pink-600"/> Gallery Assets</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {previews.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-3xl overflow-hidden border-2 border-slate-200 group">
                  <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Gallery" />
                  <button type="button" onClick={() => setPreviews(previews.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FaTrash size={24}/>
                  </button>
                </div>
              ))}
              <label className="aspect-square border-3 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center hover:bg-blue-50 cursor-pointer transition-all hover:border-blue-400 group">
                <FaPlus className="text-slate-300 group-hover:text-blue-500 mb-2" size={30} />
                <span className="text-xs font-black text-slate-400 group-hover:text-blue-600 uppercase">Add Media</span>
                <input type="file" multiple onChange={handleImageChange} className="hidden" accept="image/*" />
              </label>
            </div>
          </div>

          {/* FINAL SUBMIT */}
          <button type="submit" disabled={loading} className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] text-2xl font-black shadow-2xl hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-[0.99]">
            {loading ? "SAVING CHANGES..." : "SYNC RECORDS TO DATABASE"}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- REUSABLE COMPONENTS ---
const InputGroup = ({ label, ...props }) => (
  <div className="w-full">
    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">{label}</label>
    <input {...props} required className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-slate-800 font-bold" />
  </div>
);

const SelectGroup = ({ label, options, ...props }) => (
  <div className="w-full">
    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">{label}</label>
    <div className="relative">
      <select {...props} required className="w-full p-5 bg-white border-2 border-slate-200 rounded-2xl appearance-none outline-none focus:border-blue-500 transition-all font-bold text-slate-700 disabled:bg-slate-50 disabled:text-slate-300">
        <option value="">Choose {label}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-20"><FaPlus size={10}/></div>
    </div>
  </div>
);

export default EditHotelPage;