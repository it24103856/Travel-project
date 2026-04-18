import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { FiUploadCloud, FiTrash2, FiLoader } from "react-icons/fi";
import { Car, Info, Settings, ArrowLeft, Upload, Users, Briefcase, Fuel, Wind } from "lucide-react";
import { uploadFile } from "../../utils/meadiaUpload.js";

const AdminVehicleCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [drivers, setDrivers] = useState([]);

  // Form States
  const [formData, setFormData] = useState({
    type: "Car",
    make: "",
    model: "",
    registrationNumber: "",
    seatingCapacity: "",
    luggageCapacity: "",
    hasAC: true,
    fuelType: "Petrol",
    pricePerKm: "",
    driverId: "", 
  });

  const [images, setImages] = useState([]);

  // 1. Fetch Drivers
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/driver/customer/get-all`);
        if (res.data && res.data.data) {
          setDrivers(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch drivers", err);
      }
    };
    fetchDrivers();
  }, []);

  // 2. Handle Image Upload
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    try {
      const uploadPromises = files.map(file => uploadFile(file));
      const urls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...urls]);
      toast.success(`${urls.length} images uploaded`);
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  // 3. Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) return toast.error("Please upload at least one image");
    
    setLoading(true);
    try {
      const payload = { 
        ...formData, 
        images,
        driverId: formData.driverId === "" ? undefined : formData.driverId 
      };
      
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/vehicles`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      if (res.data.success) {
        toast.success("Vehicle created successfully");
        navigate("/admin/vehicles");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-12 px-6 font-[Inter]">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/admin/vehicles" className="flex items-center gap-2 text-gray-500 hover:text-[#6366F1] transition-all">
            <ArrowLeft size={20} /> <span className="font-medium">Back to Vehicles</span>
          </Link>
          <h1 className="text-2xl font-[Playfair_Display] font-bold text-gray-900">Add <span className="text-[#C8813A]">New Vehicle</span></h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm hover:shadow-2xl p-8 md:p-12 border border-gray-100 space-y-8 transition-all duration-500">
          
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-[Playfair_Display] font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Car className="text-[#C8813A]" size={20} /> Vehicle Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Vehicle Type</label>
                <select className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-[#C8813A] outline-none"
                  value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                  <option value="Car">Car</option>
                  <option value="Van">Van</option>
                  <option value="SUV">SUV</option>
                  <option value="Bus">Bus</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Registration Number</label>
                <input required type="text" placeholder="WP CAS-1234" className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-[#C8813A] outline-none"
                  value={formData.registrationNumber} onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})} />
              </div>
              <input required placeholder="Make (e.g. Toyota)" className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-[#C8813A] outline-none"
                value={formData.make} onChange={(e) => setFormData({...formData, make: e.target.value})} />
              <input required placeholder="Model (e.g. Prius)" className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-[#C8813A] outline-none"
                value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} />
            </div>
          </div>

          {/* Specifications - Luggage Added Here */}
          <div>
            <h3 className="text-lg font-[Playfair_Display] font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Settings className="text-[#C8813A]" size={20} /> Specifications
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-sm font-bold text-gray-700 mb-2">Seating Capacity</label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl px-4">
                  <Users size={18} className="text-gray-400" />
                  <input required type="number" className="w-full p-4 bg-transparent outline-none" placeholder="No. of seats" min="1"
                    value={formData.seatingCapacity} onChange={(e) => { const val = e.target.value; if(val === '' || parseInt(val) >= 1) setFormData({...formData, seatingCapacity: val}); }} />
                </div>
              </div>

              {/* LUGGAGE CAPACITY FIELD */}
              <div className="relative">
                <label className="block text-sm font-bold text-gray-700 mb-2">Luggage Capacity</label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl px-4">
                  <Briefcase size={18} className="text-gray-400" />
                  <input required type="number" className="w-full p-4 bg-transparent outline-none" placeholder="No. of bags" min="0"
                    value={formData.luggageCapacity} onChange={(e) => { const val = e.target.value; if(val === '' || parseInt(val) >= 0) setFormData({...formData, luggageCapacity: val}); }} />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Fuel Type</label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl px-4">
                   <Fuel size={18} className="text-gray-400" />
                   <select className="w-full p-4 bg-transparent outline-none"
                    value={formData.fuelType} onChange={(e) => setFormData({...formData, fuelType: e.target.value})}>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Price per KM (LKR)</label>
                <input required type="number" className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-[#C8813A] outline-none font-bold text-[#C8813A]" min="0"
                  value={formData.pricePerKm} onChange={(e) => { const val = e.target.value; if(val === '' || parseFloat(val) >= 0) setFormData({...formData, pricePerKm: val}); }} />
              </div>

              {/* AC / NON-AC TOGGLE */}
              <div className="md:col-span-2 flex items-center gap-4 bg-[#C8813A]/5 p-4 rounded-2xl border border-[#C8813A]/10">
                <Wind size={20} className="text-[#C8813A]" />
                <span className="text-sm font-bold text-gray-700">Air Conditioning (A/C)</span>
                <input type="checkbox" className="w-5 h-5 accent-[#C8813A]" 
                  checked={formData.hasAC} onChange={(e) => setFormData({...formData, hasAC: e.target.checked})} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Assign Driver (Optional)</label>
                <select className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-[#C8813A] outline-none"
                  value={formData.driverId} onChange={(e) => setFormData({...formData, driverId: e.target.value})}>
                  <option value="">No Driver Assigned</option>
                  {drivers.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Photos */}
          <div>
            <h3 className="text-lg font-[Playfair_Display] font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Upload className="text-[#C8813A]" size={20} /> Photos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="cursor-pointer border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center h-32 hover:bg-[#C8813A]/5 transition-all group">
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} disabled={uploading} />
                {uploading ? <FiLoader className="animate-spin text-[#C8813A]" /> : <FiUploadCloud className="text-2xl text-gray-400 group-hover:text-[#C8813A]" />}
                <span className="text-[10px] font-bold text-gray-500 mt-2 uppercase">Upload</span>
              </label>
              {images.map((url, idx) => (
                <div key={idx} className="relative h-32 rounded-3xl overflow-hidden group shadow-md border border-gray-100">
                  <img src={url} alt="vehicle" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading || uploading} className="w-full py-5 rounded-full font-black uppercase tracking-widest text-white bg-[#C8813A] hover:bg-[#A66A28] transition-all shadow-xl disabled:bg-gray-300">
            {loading ? "Creating..." : "Register Vehicle"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminVehicleCreatePage;