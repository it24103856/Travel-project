import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Hotel, MapPin, BedDouble, Image, Save, ArrowLeft, Plus, Trash2, Upload, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { uploadFile } from "../../utils/meadiaUpload";

const SRI_LANKA_DATA = {
  "Western": { "Colombo": ["Colombo 01-15","Dehiwala","Mount Lavinia","Moratuwa","Kotte","Battaramulla","Maharagama","Kesbewa","Avissawella","Homagama","Hanwella"], "Gampaha": ["Negombo","Gampaha","Veyangoda","Wattala","Ja-Ela","Kadawatha","Kelaniya","Kiribathgoda","Minuwangoda","Nittambuwa"], "Kalutara": ["Kalutara","Panadura","Horana","Beruwala","Aluthgama","Matugama","Wadduwa"] },
  "Central": { "Kandy": ["Kandy","Peradeniya","Gampola","Nawalapitiya","Katugastota","Kundasale","Digana","Gelioya"], "Matale": ["Matale","Dambulla","Sigiriya","Ukuwela","Pallepola"], "Nuwara Eliya": ["Nuwara Eliya","Hatton","Talawakele","Walapane","Hanguranketha"] },
  "Southern": { "Galle": ["Galle","Hikkaduwa","Ambalangoda","Baddegama","Bentota","Karapitiya","Elpitiya","Ahangama"], "Matara": ["Matara","Weligama","Mirissa","Dikwella","Hakmana","Deniyaya","Kamburupitiya"], "Hambantota": ["Hambantota","Tangalle","Tissamaharama","Ambalantota","Beliatta"] },
  "North Western": { "Kurunegala": ["Kurunegala","Kuliyapitiya","Narammala","Wariyapola","Pannala","Polgahawela"], "Puttalam": ["Puttalam","Chilaw","Marawila","Wennappuwa","Kalpitiya","Dankotuwa"] },
  "North Central": { "Anuradhapura": ["Anuradhapura","Eppawala","Kekirawa","Medawachchiya","Mihintale","Thalawa"], "Polonnaruwa": ["Polonnaruwa","Kaduruwela","Medirigiriya","Hingurakgoda"] },
  "Uva": { "Badulla": ["Badulla","Bandarawela","Hali-Ela","Ella","Mahiyanganaya","Welimada","Passara"], "Monaragala": ["Monaragala","Wellawaya","Buttala","Bibile","Kataragama"] },
  "Sabaragamuwa": { "Rathnapura": ["Rathnapura","Balangoda","Embilipitiya","Pelmadulla","Eheliyagoda","Kuruwita"], "Kegalle": ["Kegalle","Mawanella","Warakapola","Rambukkana","Deraniyagala"] },
  "Northern": { "Jaffna": ["Jaffna","Chavakachcheri","Point Pedro","Karainagar"], "Kilinochchi": ["Kilinochchi","Pallai"], "Mannar": ["Mannar","Nanattan"], "Vavuniya": ["Vavuniya","Cheddikulam"], "Mullaitivu": ["Mullaitivu","Oddusuddan"] },
  "Eastern": { "Trincomalee": ["Trincomalee","Kinniya","Mutur"], "Batticaloa": ["Batticaloa","Eravur","Kattankudy","Valaichchenai"], "Ampara": ["Ampara","Akkaraipattu","Kalmunai","Sainthamaruthu"] }
};

export default function EditHotelPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "", description: "", province: "", district: "", city: "",
    category: "", rating: "", phone: "", email: "", images: [],
    roomTypes: [{ type: "", originalPrice: "", finalPrice: "", description: "" }]
  });

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/hotels/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (data.data) setFormData(data.data);
      } catch (error) { toast.error("Failed to load hotel data"); navigate("/admin/hotels"); } finally { setLoading(false); }
    };
    fetchHotel();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "province") setFormData({ ...formData, province: value, district: "", city: "" });
    else if (name === "district") setFormData({ ...formData, district: value, city: "" });
    else setFormData({ ...formData, [name]: value });
  };

  const handleRoomChange = (index, field, value) => { const u = [...formData.roomTypes]; u[index][field] = value; setFormData({ ...formData, roomTypes: u }); };
  const addRoom = () => setFormData({ ...formData, roomTypes: [...formData.roomTypes, { type: "", originalPrice: "", finalPrice: "", description: "" }] });
  const removeRoom = (index) => setFormData({ ...formData, roomTypes: formData.roomTypes.filter((_, i) => i !== index) });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const imageUrl = await uploadFile(file);
      setFormData(prev => ({ ...prev, images: [...prev.images, imageUrl] }));
      toast.success("Image uploaded!");
    } catch (error) { toast.error("Upload failed!"); } finally { setUploading(false); }
  };

  const removeImage = (index) => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/hotels/update/${id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Hotel updated successfully!");
      setTimeout(() => navigate("/admin/hotels"), 1500);
    } catch (error) { toast.error(error.response?.data?.message || "Failed to update hotel"); } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFDFD]">
      <Loader2 className="animate-spin text-[#00AEEF] mb-4" size={40} />
      <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Loading Hotel Details...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-12 px-6 font-[Inter]">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate("/admin/hotels")} className="flex items-center gap-2 text-gray-500 hover:text-[#00AEEF] transition-all duration-500">
            <ArrowLeft size={20} /> <span className="font-medium">Back to Hotels</span>
          </button>
          <h1 className="text-2xl font-[Playfair_Display] font-bold text-gray-900">Edit <span className="text-[#00AEEF]">Hotel</span></h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm hover:shadow-2xl p-8 md:p-12 border border-gray-100 space-y-8 transition-all duration-500">
          <div>
            <h3 className="text-lg font-[Playfair_Display] font-bold text-gray-800 mb-6 flex items-center gap-2"><Hotel className="text-[#00AEEF]" size={20} /> Hotel Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Hotel Name" name="name" value={formData.name} onChange={handleChange} />
              <InputField label="Category" name="category" value={formData.category} onChange={handleChange} />
              <InputField label="Rating" name="rating" value={formData.rating} onChange={handleChange} type="number" />
              <InputField label="Phone" name="phone" value={formData.phone} onChange={handleChange} type="tel" />
              <InputField label="Email" name="email" value={formData.email} onChange={handleChange} type="email" />
            </div>
            <div className="mt-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="3" required className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#00AEEF]/10 focus:border-[#00AEEF] focus:bg-white outline-none transition-all duration-500"></textarea>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-[Playfair_Display] font-bold text-gray-800 mb-6 flex items-center gap-2"><MapPin className="text-[#00AEEF]" size={20} /> Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Province</label>
                <select name="province" value={formData.province} onChange={handleChange} required className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#00AEEF] transition-all duration-500">
                  <option value="">Select Province</option>
                  {Object.keys(SRI_LANKA_DATA).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">District</label>
                <select name="district" value={formData.district} onChange={handleChange} required disabled={!formData.province} className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#00AEEF] transition-all duration-500 disabled:opacity-50">
                  <option value="">Select District</option>
                  {formData.province && Object.keys(SRI_LANKA_DATA[formData.province]).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                <select name="city" value={formData.city} onChange={handleChange} required disabled={!formData.district} className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#00AEEF] transition-all duration-500 disabled:opacity-50">
                  <option value="">Select City</option>
                  {formData.district && SRI_LANKA_DATA[formData.province]?.[formData.district]?.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-[Playfair_Display] font-bold text-gray-800 flex items-center gap-2"><BedDouble className="text-[#00AEEF]" size={20} /> Room Types</h3>
              <button type="button" onClick={addRoom} className="flex items-center gap-1 px-4 py-2 bg-[#00AEEF]/10 text-[#00AEEF] rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#00AEEF] hover:text-white transition-all duration-500"><Plus size={14} /> Add Room</button>
            </div>
            {formData.roomTypes.map((room, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 relative">
                <InputField label="Type" value={room.type} onChange={(e) => handleRoomChange(index, "type", e.target.value)} />
                <InputField label="Original Price" value={room.originalPrice} onChange={(e) => handleRoomChange(index, "originalPrice", e.target.value)} type="number" />
                <InputField label="Final Price" value={room.finalPrice} onChange={(e) => handleRoomChange(index, "finalPrice", e.target.value)} type="number" />
                <div className="md:col-span-2 flex gap-4">
                  <div className="flex-1"><label className="block text-sm font-bold text-gray-700 mb-2">Description</label><input value={room.description} onChange={(e) => handleRoomChange(index, "description", e.target.value)} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#00AEEF]/10 focus:border-[#00AEEF] outline-none transition-all duration-500" /></div>
                  {formData.roomTypes.length > 1 && <button type="button" onClick={() => removeRoom(index)} className="self-end p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-500"><Trash2 size={18} /></button>}
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-lg font-[Playfair_Display] font-bold text-gray-800 mb-6 flex items-center gap-2"><Image className="text-[#00AEEF]" size={20} /> Photos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="cursor-pointer border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center h-32 hover:bg-[#00AEEF]/5 hover:border-[#00AEEF]/30 transition-all duration-500 group">
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                {uploading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00AEEF]"></div> : <Upload className="text-gray-400 group-hover:text-[#00AEEF]" />}
              </label>
              {formData.images?.map((url, index) => (
                <div key={index} className="relative h-32 rounded-3xl overflow-hidden group shadow-md">
                  <img src={url} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={submitting || uploading}
            className="w-full py-5 rounded-full font-black uppercase tracking-widest text-white bg-[#00AEEF] hover:bg-[#0095cc] transition-all duration-500 shadow-xl active:scale-[0.98] disabled:bg-gray-300">
            {submitting ? "Updating..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

function InputField({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>}
      <input {...props} required className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#00AEEF]/10 focus:border-[#00AEEF] focus:bg-white outline-none transition-all duration-500 font-[Inter]" />
    </div>
  );
}