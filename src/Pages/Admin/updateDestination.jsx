import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, Image as ImageIcon, MapPin, Type, FileText, Trash2, UploadCloud, Loader2 } from "lucide-react";
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

const UpdateDestination = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "", description: "", province: "", district: "", city: "", image: []
  });

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/destinations/${id}`);
        if (data && data.data) {
          setFormData({ name: data.data.name || "", description: data.data.description || "", province: data.data.province || "", district: data.data.district || "", city: data.data.city || "", image: data.data.image || [] });
        }
      } catch (error) { toast.error("Failed to load destination details"); } finally { setLoading(false); }
    };
    fetchDestination();
  }, [id, backendUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "province") setFormData({ ...formData, province: value, district: "", city: "" });
    else if (name === "district") setFormData({ ...formData, district: value, city: "" });
    else setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const imageUrl = await uploadFile(file);
      setFormData((prev) => ({ ...prev, image: [...prev.image, imageUrl] }));
      toast.success("Image uploaded!");
    } catch (error) { toast.error("Upload failed!"); } finally { setUploading(false); }
  };

  const removeImage = (index) => setFormData({ ...formData, image: formData.image.filter((_, i) => i !== index) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${backendUrl}/destinations/update/${id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Destination updated successfully!");
      setTimeout(() => navigate("/admin/destinations"), 2000);
    } catch (error) { toast.error(error.response?.data?.message || "Update failed!"); } finally { setUpdating(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFDFD]">
        <Loader2 className="animate-spin text-[#00AEEF] mb-4" size={40} />
        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Loading Record Details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-12 px-6 font-[Inter]">
      <Toaster position="top-right" />
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/admin/destinations" className="flex items-center gap-2 text-gray-500 hover:text-[#00AEEF] transition-all duration-500">
            <ArrowLeft size={20} /> <span className="font-medium">Cancel Edit</span>
          </Link>
          <h1 className="text-2xl font-[Playfair_Display] font-bold text-gray-900">Update <span className="text-[#00AEEF]">Destination</span></h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm hover:shadow-2xl p-8 md:p-12 border border-gray-100 transition-all duration-500">
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Type size={16} className="text-[#00AEEF]" /> Destination Name
              </label>
              <input type="text" name="name" value={formData.name} required className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#00AEEF]/20 focus:border-[#00AEEF] transition-all duration-500" onChange={handleChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Province</label>
                <select name="province" required value={formData.province} onChange={handleChange} className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#00AEEF] transition-all duration-500">
                  <option value="">Select Province</option>
                  {Object.keys(SRI_LANKA_DATA).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">District</label>
                <select name="district" required value={formData.district} onChange={handleChange} disabled={!formData.province} className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#00AEEF] transition-all duration-500 disabled:opacity-50">
                  <option value="">Select District</option>
                  {formData.province && Object.keys(SRI_LANKA_DATA[formData.province]).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                <select name="city" required value={formData.city} onChange={handleChange} disabled={!formData.district} className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#00AEEF] transition-all duration-500 disabled:opacity-50">
                  <option value="">Select City</option>
                  {formData.district && SRI_LANKA_DATA[formData.province][formData.district].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <FileText size={16} className="text-[#00AEEF]" /> Description
              </label>
              <textarea name="description" rows="4" value={formData.description} required className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#00AEEF]/20 focus:border-[#00AEEF] transition-all duration-500" onChange={handleChange}></textarea>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <ImageIcon size={16} className="text-[#00AEEF]" /> Photos
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <label className="cursor-pointer border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center h-32 hover:bg-[#00AEEF]/5 hover:border-[#00AEEF]/30 transition-all duration-500 group">
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                  {uploading ? <Loader2 className="animate-spin text-[#00AEEF]" size={24} /> : <UploadCloud size={24} className="text-gray-400 group-hover:text-[#00AEEF]" />}
                </label>
                {formData.image.map((url, index) => (
                  <div key={index} className="relative h-32 rounded-3xl overflow-hidden group shadow-md border border-gray-100">
                    <img src={url} className="w-full h-full object-cover" alt="preview" />
                    <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={updating || uploading} className="w-full py-5 rounded-full font-black uppercase tracking-widest text-white bg-[#00AEEF] hover:bg-[#0095cc] transition-all duration-500 shadow-xl active:scale-[0.98] disabled:bg-gray-300">
              {updating ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateDestination;