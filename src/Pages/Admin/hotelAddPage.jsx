import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { 
  FaHotel, FaMapMarkerAlt, FaEnvelope, FaPhone, 
  FaImage, FaBed, FaSave, FaPlus, FaTrash, FaStar,
  FaCrown, FaRegBuilding, FaWifi, FaConciergeBell, FaArrowLeft
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom"; 
import { uploadFile } from "../../utils/meadiaUpload.js";

// --- SRI LANKA DATA CONSTANTS ---
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

const ROOM_ENUM = ["Single", "Double", "Family", "Suite", "Luxury"];

const AddHotelPage = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    hotelID: "", name: "", address: "", city: "", province: "",
    district: "", phone: "", email: "", description: "", category: "Budget", amenities: ""
  });

  const [roomTypes, setRoomTypes] = useState([
    { type: "Double", maxGuests: 2, originalPrice: "", discountPercentage: 0, images: [], imageFiles: [] }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [hotelImageFiles, setHotelImageFiles] = useState([]); 
  const [hotelPreviews, setHotelPreviews] = useState([]);

  // --- Dynamic Location Logic ---
  const provinces = useMemo(() => Object.keys(SRI_LANKA_DATA), []);
  const districts = useMemo(() => formData.province ? Object.keys(SRI_LANKA_DATA[formData.province]) : [], [formData.province]);
  const cities = useMemo(() => (formData.province && formData.district) ? SRI_LANKA_DATA[formData.province][formData.district] : [], [formData.province, formData.district]);

  useEffect(() => {
    if (isEditing) {
      const fetchHotel = async () => {
        try {
          const response = await axios.get(`${backendUrl}/hotels/get/${id}`);
          const hotel = response.data.data;
          setFormData({
            ...hotel,
            amenities: Array.isArray(hotel.amenities) ? hotel.amenities.join(", ") : hotel.amenities
          });
          setRoomTypes(hotel.roomTypes.map(r => ({ ...r, imageFiles: [] })));
          setHotelPreviews(hotel.images || []);
        } catch (error) { toast.error("Failed to load hotel data"); }
      };
      fetchHotel();
    }
  }, [id, backendUrl, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === "province") { updated.district = ""; updated.city = ""; }
      if (name === "district") { updated.city = ""; }
      return updated;
    });
  };

  const handleHotelImgChange = (e) => {
    const files = Array.from(e.target.files);
    setHotelImageFiles(prev => [...prev, ...files]);
    setHotelPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const handleRoomImgChange = (index, e) => {
    const files = Array.from(e.target.files);
    const updatedRooms = [...roomTypes];
    const newPreviews = files.map(f => URL.createObjectURL(f));
    updatedRooms[index].images = [...(updatedRooms[index].images || []), ...newPreviews];
    updatedRooms[index].imageFiles = [...(updatedRooms[index].imageFiles || []), ...files];
    setRoomTypes(updatedRooms);
  };

  const handleRoomChange = (index, name, value) => {
    const list = [...roomTypes];
    list[index][name] = value;
    setRoomTypes(list);
  };

  const addRoomType = () => setRoomTypes([...roomTypes, { type: "Double", maxGuests: 2, originalPrice: "", discountPercentage: 0, images: [], imageFiles: [] }]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.province || !formData.district || !formData.city) {
      return toast.error("Please complete the location details!");
    }
    setLoading(true);
    const tId = toast.loading("Syncing with Cloud...");

    try {
      let finalHotelImages = hotelPreviews.filter(p => p.startsWith('http'));
      if (hotelImageFiles.length > 0) {
        const uploaded = await Promise.all(hotelImageFiles.map(f => uploadFile(f)));
        finalHotelImages = [...finalHotelImages, ...uploaded];
      }

      const finalRooms = await Promise.all(roomTypes.map(async (room) => {
        let existingRoomUrls = (room.images || []).filter(url => url.startsWith('http'));
        if (room.imageFiles && room.imageFiles.length > 0) {
          const uploadedRoomImgs = await Promise.all(room.imageFiles.map(f => uploadFile(f)));
          existingRoomUrls = [...existingRoomUrls, ...uploadedRoomImgs];
        }
        return {
          type: room.type,
          maxGuests: room.maxGuests,
          originalPrice: room.originalPrice,
          discountPercentage: room.discountPercentage,
          images: existingRoomUrls
        };
      }));

      const finalData = { 
        ...formData, 
        images: finalHotelImages,
        roomTypes: finalRooms,
        amenities: formData.amenities.split(",").map(a => a.trim()) 
      };

      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (isEditing) {
        await axios.put(`${backendUrl}/hotels/update/${id}`, finalData, config);
        toast.success("Hotel Updated!", { id: tId });
      } else {
        await axios.post(`${backendUrl}/hotels/create`, finalData, config);
        toast.success("Hotel Registered!", { id: tId });
      }
      setTimeout(() => navigate("/admin/hotels"), 1500);
    } catch (error) {
      toast.error("Operation failed", { id: tId });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4">
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 relative">
          <button onClick={() => navigate(-1)} className="absolute left-0 top-0 flex items-center gap-2 text-gray-500 font-bold hover:text-blue-600 transition-all border border-gray-200 px-4 py-2 rounded-xl bg-white shadow-sm">
            <FaArrowLeft /> Back
          </button>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FaCrown className="w-8 h-8 text-yellow-500" />
            <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              {isEditing ? "Refine Masterpiece" : "New Luxury Listing"}
            </span>
          </div>
          <h1 className="text-5xl font-black text-slate-900">{isEditing ? "Update Property" : "Create Legacy"}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Section 1: Property Essence */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-800">
              <FaHotel className="text-blue-600"/> Property Essence
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InputGroup label="Hotel ID" name="hotelID" value={formData.hotelID} onChange={handleChange} />
              <InputGroup label="Hotel Name" name="name" value={formData.name} onChange={handleChange} />
              <InputGroup label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
              <InputGroup label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
              <div className="md:col-span-2">
                <InputGroup label="Amenities" name="amenities" value={formData.amenities} onChange={handleChange} placeholder="Pool, WiFi, Gym (Comma separated)" />
              </div>
              <SelectGroup label="Category" name="category" value={formData.category} onChange={handleChange} options={["Budget", "Luxury", "Boutique"]} />
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  className="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl h-32 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700 shadow-inner" 
                />
              </div>
            </div>
          </div>

          {/* Section 2: Prime Location */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-800">
              <FaMapMarkerAlt className="text-emerald-600"/> Prime Location
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <SelectGroup label="Province" name="province" value={formData.province} onChange={handleChange} options={provinces} />
              <SelectGroup label="District" name="district" value={formData.district} onChange={handleChange} options={districts} disabled={!formData.province} />
              <SelectGroup label="City" name="city" value={formData.city} onChange={handleChange} options={cities} disabled={!formData.district} />
              <div className="md:col-span-3">
                <InputGroup label="Detailed Address" name="address" value={formData.address} onChange={handleChange} placeholder="No 123, Galle Road, Colombo 03" />
              </div>
            </div>
          </div>

          {/* Section 3: Room Collection (Updated with Enum) */}
          {/* Section 3: Room Collection */}
<div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
  <div className="flex justify-between items-center mb-10">
    <h2 className="text-slate-900 text-2xl font-bold flex items-center gap-4">
      <FaBed className="text-amber-500"/> Room Collection
    </h2>
    <button 
      type="button" 
      onClick={addRoomType} 
      className="bg-amber-500 text-white px-8 py-3 rounded-2xl font-black hover:bg-amber-600 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/40"
    >
      <FaPlus/> Add Unit
    </button>
  </div>

  <div className="space-y-8">
    {roomTypes.map((room, index) => (
      <div key={index} className="bg-slate-50 border border-slate-200 p-8 rounded-[2rem] relative group shadow-inner">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          
          {/* Unit Class Selection */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Unit Class</label>
            <div className="relative">
              <select 
                value={room.type} 
                onChange={(e) => handleRoomChange(index, 'type', e.target.value)}
                className="w-full p-5 bg-white border border-slate-300 rounded-2xl outline-none focus:border-amber-500 transition-all font-bold text-slate-800 appearance-none shadow-sm"
              >
                {ROOM_ENUM.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
            </div>
          </div>

          {/* Reusable Input for Rooms - Clear Text */}
          <RoomInput label="Price (LKR)" type="number" value={room.originalPrice} onChange={(e) => handleRoomChange(index, 'originalPrice', e.target.value)} />
          <RoomInput label="Max Guests" type="number" value={room.maxGuests} onChange={(e) => handleRoomChange(index, 'maxGuests', e.target.value)} />
          <RoomInput label="Discount %" type="number" value={room.discountPercentage} onChange={(e) => handleRoomChange(index, 'discountPercentage', e.target.value)} />
        </div>

        {/* Visual Portfolio Section */}
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Visual Portfolio</label>
          <div className="flex flex-wrap gap-4">
            {room.images?.map((src, i) => (
              <div key={i} className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 relative group/img shadow-md">
                <img src={src} className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => {
                    const up = [...roomTypes];
                    up[index].images = up[index].images.filter((_, imgI) => imgI !== i);
                    setRoomTypes(up);
                  }} 
                  className="absolute inset-0 bg-red-600/80 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity text-white"
                >
                  <FaTrash size={16}/>
                </button>
              </div>
            ))}
            
            {/* Improved Add Photo Button */}
            <label className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-amber-500 text-slate-400 hover:text-amber-500 transition-all group/add">
              <FaPlus className="text-xl group-hover/add:scale-110 transition-transform" />
              <span className="text-[9px] font-black mt-2 uppercase tracking-tighter">Add Photo</span>
              <input type="file" multiple className="hidden" onChange={(e) => handleRoomImgChange(index, e)} />
            </label>
          </div>
        </div>

        {/* Delete Unit Button */}
        {roomTypes.length > 1 && (
          <button 
            type="button" 
            onClick={() => setRoomTypes(roomTypes.filter((_, i) => i !== index))} 
            className="absolute -top-3 -right-3 bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition-all transform hover:scale-110"
          >
            <FaTrash size={14}/>
          </button>
        )}
      </div>
    ))}
  </div>
</div>

          {/* Section 4: Main Gallery */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-800"><FaImage className="text-pink-600"/> Main Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {hotelPreviews.map((src, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-slate-200 relative group shadow-sm">
                  <img src={src} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => {
                    setHotelPreviews(prev => prev.filter((_, idx) => idx !== i));
                    setHotelImageFiles(prev => prev.filter((_, idx) => idx !== i));
                  }} className="absolute inset-0 bg-red-500/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"><FaTrash/></button>
                </div>
              ))}
              <label className="aspect-square border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 text-slate-400 hover:border-blue-400 transition-all">
                <FaPlus size={24}/><span className="text-[10px] font-black mt-2 uppercase">Add Photo</span>
                <input type="file" multiple className="hidden" onChange={handleHotelImgChange} />
              </label>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-8 rounded-[2rem] text-3xl font-black shadow-xl hover:bg-blue-700 transition-all transform hover:-translate-y-1 active:scale-[0.98]">
            {loading ? "PROCESSING..." : (isEditing ? "UPDATE PROPERTY" : "REGISTER HOTEL")}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Updated Reusable Components with Clear Borders ---
const InputGroup = ({ label, ...props }) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">{label}</label>
    <input {...props} required className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-700 shadow-sm" />
  </div>
);

const InputGroupDark = ({ label, ...props }) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">{label}</label>
    <input {...props} required className="w-full p-5 bg-white/5 border border-white/20 rounded-2xl outline-none focus:border-amber-500 transition-all font-bold text-white placeholder:text-slate-600" />
  </div>
);

const SelectGroup = ({ label, options, ...props }) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">{label}</label>
    <div className="relative">
      <select {...props} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-700 disabled:opacity-50 appearance-none shadow-sm cursor-pointer">
        <option value="">Select {label}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
    </div>
  </div>
);
const RoomInput = ({ label, ...props }) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">{label}</label>
    <input 
      {...props} 
      required 
      className="w-full p-5 bg-white border border-slate-300 rounded-2xl outline-none focus:border-amber-500 transition-all font-bold text-slate-800 shadow-sm placeholder:text-slate-300" 
    />
  </div>
);

export default AddHotelPage;