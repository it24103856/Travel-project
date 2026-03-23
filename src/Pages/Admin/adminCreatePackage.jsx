import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import toast, { Toaster } from "react-hot-toast";
import { 
  FaPlusCircle, FaInfoCircle, FaTag, FaClock, FaImage, FaLayerGroup, 
  FaMapMarkedAlt, FaFlag, FaBed, FaBus, FaSave, FaTimes, FaSpinner 
} from "react-icons/fa";

// ඔබේ file structure එක අනුව මෙහි path එක නිවැරදි දැයි බලන්න
import { uploadFile } from "../../utils/meadiaUpload"; 

const CreatePackage = () => {
  // --- Form States ---
  const [formData, setFormData] = useState({
    name: "",
    duration: "",
    mainImage: "",
    itinerary: "",
    mapUrl: "",
    destinations: "",
    transport: "",
    gallery: "",
    reviews: "",
    faqs: "",
    tips: ""
  });

  const [hotels, setHotels] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedHotels, setSelectedHotels] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // --- Fetch Hotels & Drivers from Backend ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";
        const token = localStorage.getItem("token"); 

        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const [hotelRes, driverRes] = await Promise.all([
          axios.get(`${backendUrl}/hotels/all`), 
          axios.get(`${backendUrl}/driver/customer/get-all`, config) 
        ]);

        const hotelsArray = hotelRes.data.data || hotelRes.data.hotels || hotelRes.data || [];
        const driversArray = driverRes.data.data || driverRes.data.drivers || driverRes.data || [];

        const hotelOptions = hotelsArray.map(h => ({ 
            value: h._id || h.hotelID, 
            label: `${h.name} (${h.city})` 
        }));
        
        const driverOptions = driversArray.map(d => ({ 
            value: d._id, 
            label: `${d.name} - ${d.vehicleType}` 
        }));

        setHotels(hotelOptions);
        setDrivers(driverOptions);
      } catch (error) {
        console.error("Data fetch error:", error);
        toast.error("දත්ත ලබා ගැනීමට අපහසු විය.");
      }
    };
    fetchData();
  }, []);

  // --- Handlers ---
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // --- Image Upload Handler ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const toastId = toast.loading("පින්තූරය Upload වෙමින් පවතී...");

    try {
      const imageUrl = await uploadFile(file); // Supabase util එක භාවිතා කිරීම
      setFormData({ ...formData, mainImage: imageUrl });
      toast.success("පින්තූරය සාර්ථකව Upload විය!", { id: toastId });
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("පින්තූරය Upload කිරීම අසාර්ථකයි.", { id: toastId });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.mainImage) {
        return toast.error("කරුණාකර ප්‍රධාන පින්තූරයක් ඇතුළත් කරන්න.");
    }

    setLoading(true);

    const submissionData = {
      ...formData,
      hotels: selectedHotels.map(h => h.value),
      driver: selectedDriver?.value
    };

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";
      await axios.post(`${backendUrl}/packages`, submissionData);
      toast.success("Package එක සාර්ථකව නිර්මාණය කළා!");
      // Reset form or redirect if needed
    } catch (error) {
      toast.error(error.response?.data?.message || "පැකේජය නිර්මාණය කිරීම අසාර්ථක විය.");
    } finally {
      setLoading(false);
    }
  };

  // --- React Select Custom Styles ---
  const selectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: '30px',
      padding: '5px 15px',
      background: '#f4fafc',
      border: '1px solid #d2e8ec',
      boxShadow: 'none',
      '&:hover': { borderColor: '#1e6f5c' }
    }),
    multiValue: (base) => ({
      ...base,
      background: '#e0f0ec',
      borderRadius: '15px',
      color: '#166153'
    })
  };

  return (
    <div className="min-h-screen bg-[#eef3f7] p-4 md:p-10 font-sans">
      <Toaster />
      <div className="max-w-5xl mx-auto">
        
        {/* Header Area */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg">
               <FaPlusCircle />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-800">New Package</h2>
              <p className="text-slate-500 text-sm">Create and publish a new travel experience</p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Section: Basic Info */}
            <div>
              <div className="flex items-center gap-3 text-emerald-700 font-bold mb-6 text-lg uppercase tracking-wider">
                <FaInfoCircle /> Basic Information
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-600 flex items-center gap-2"><FaTag /> Package Name *</label>
                  <input name="name" onChange={handleChange} className="bg-[#f4fafc] border border-[#d2e8ec] rounded-full px-6 py-3 outline-none focus:border-emerald-500 transition-all" placeholder="e.g. Hill Country Magic" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-600 flex items-center gap-2"><FaClock /> Duration (Days) *</label>
                  <input name="duration" type="number" onChange={handleChange} className="bg-[#f4fafc] border border-[#d2e8ec] rounded-full px-6 py-3 outline-none focus:border-emerald-500 transition-all" placeholder="5" required />
                </div>
              </div>
            </div>

            {/* Section: Selection (Drivers & Hotels) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-y border-slate-50">
               <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-600 flex items-center gap-2"><FaBed /> Include Hotels</label>
                  <Select 
                    isMulti 
                    options={hotels} 
                    styles={selectStyles} 
                    onChange={setSelectedHotels}
                    placeholder="Select hotels..."
                  />
               </div>
               <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-600 flex items-center gap-2"><FaBus /> Assign Driver</label>
                  <Select 
                    options={drivers} 
                    styles={selectStyles} 
                    onChange={setSelectedDriver}
                    placeholder="Search driver..."
                  />
               </div>
            </div>

            {/* Section: Image Upload & Itinerary */}
            <div className="space-y-6">
               <div className="flex flex-col gap-2">
                 <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                    <FaImage /> Main Image *
                 </label>
                 <div className="flex items-center gap-4">
                     <input 
                       type="file" 
                       accept="image/*" 
                       onChange={handleImageUpload} 
                       disabled={uploadingImage}
                       className="bg-[#f4fafc] border border-[#d2e8ec] rounded-full px-4 py-2 w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700" 
                     />
                     {uploadingImage && <FaSpinner className="animate-spin text-emerald-600 text-2xl" />}
                 </div>

                 {/* Preview Area */}
                 {formData.mainImage && (
                    <div className="mt-4 relative rounded-2xl overflow-hidden w-full max-w-sm h-48 border border-slate-200 shadow-sm">
                       <img src={formData.mainImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                 )}
               </div>

               <div className="flex flex-col gap-2">
                 <label className="text-sm font-bold text-slate-600 flex items-center gap-2 italic"><FaLayerGroup /> Itinerary Description</label>
                 <textarea name="itinerary" rows="4" onChange={handleChange} className="bg-[#f4fafc] border border-[#d2e8ec] rounded-[2rem] px-6 py-4 outline-none focus:border-emerald-500 transition-all" placeholder="Day 1: Arrival..."></textarea>
               </div>
            </div>

            {/* Section: Map & Destinations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-600 flex items-center gap-2"><FaMapMarkedAlt /> Map URL</label>
                  <input name="mapUrl" onChange={handleChange} className="bg-[#f4fafc] border border-[#d2e8ec] rounded-full px-6 py-3" placeholder="Google Maps URL" />
               </div>
               <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-600 flex items-center gap-2"><FaFlag /> Destinations</label>
                  <input name="destinations" onChange={handleChange} className="bg-[#f4fafc] border border-[#d2e8ec] rounded-full px-6 py-3" placeholder="Ella, Kandy, Galle" />
               </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end items-center gap-4 pt-8 border-t border-slate-100">
               <button type="reset" className="px-8 py-3 rounded-full font-bold text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-2">
                 <FaTimes /> Reset
               </button>
               <button 
                 type="submit" 
                 disabled={loading || uploadingImage}
                 className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-full font-black shadow-xl shadow-emerald-100 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
               >
                 {loading ? "Creating..." : <><FaSave /> Save Package</>}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePackage;