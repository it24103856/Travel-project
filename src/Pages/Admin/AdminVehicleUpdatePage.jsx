import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { FiUploadCloud, FiTrash2, FiLoader, FiChevronLeft, FiSave } from "react-icons/fi";
import { Car, Settings, Upload, Fuel, Users, Briefcase, DollarSign } from "lucide-react";
import { uploadFile } from "../../utils/meadiaUpload.js";

export default function AdminVehicleUpdatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [images, setImages] = useState([]);

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

  // 1. Fetch Vehicle Data & Drivers List
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const baseUrl = import.meta.env.VITE_BACKEND_URL;

        // Vehicle details fetch
        const vehicleRes = await axios.get(`${baseUrl}/vehicles/${id}`);
        if (vehicleRes.data.success) {
          const v = vehicleRes.data.data;
          setFormData({
            type: v.type || "Car",
            make: v.make || "",
            model: v.model || "",
            registrationNumber: v.registrationNumber || "",
            seatingCapacity: v.seatingCapacity || "",
            luggageCapacity: v.luggageCapacity || "",
            hasAC: v.hasAC ?? true,
            fuelType: v.fuelType || "Petrol",
            pricePerKm: v.pricePerKm || "",
            driverId: v.driverId || "",
          });
          setImages(v.images || []);
        }

        // Drivers list fetch (Dropdown එක සඳහා)
        const driverRes = await axios.get(`${baseUrl}/driver/customer/get-all`);
        if (driverRes.data && driverRes.data.data) {
          setDrivers(driverRes.data.data);
        }

      } catch (err) {
        toast.error("Error loading details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // 2. Handle Image Upload
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    try {
      const uploadPromises = files.map(file => uploadFile(file));
      const urls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...urls]);
      toast.success("Images uploaded");
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  // 3. Handle Update Submission
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (images.length === 0) return toast.error("At least one image is required");
    
    setUpdating(true);
    try {
      const payload = { 
        ...formData, 
        images,
        driverId: formData.driverId === "" ? undefined : formData.driverId 
      };
      
      const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/vehicles/${id}`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      if (res.data.success) {
        toast.success("Vehicle updated successfully");
        navigate("/admin/vehicles");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
      <div className="flex flex-col items-center gap-4">
        <FiLoader className="animate-spin text-[#C8813A] text-4xl" />
        <p className="text-gray-400 font-medium">Fetching Asset Data...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-12 px-6 font-[Inter]">
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/admin/vehicles" className="flex items-center gap-2 text-gray-500 hover:text-[#C8813A] transition-all">
            <FiChevronLeft size={20} /> <span className="font-medium text-sm uppercase tracking-widest">Inventory</span>
          </Link>
          <h1 className="text-2xl font-[Playfair_Display] font-bold text-gray-900">Edit <span className="text-[#C8813A]">Vehicle Asset</span></h1>
        </div>

        <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Side: Form Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-8">
              
              {/* Basic Details */}
              <section>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#C8813A] mb-6 flex items-center gap-2">
                  <Car size={18} /> Essential Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Type</label>
                    <select className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#C8813A] transition-all"
                      value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                      <option value="Car">Car</option>
                      <option value="Van">Van</option>
                      <option value="SUV">SUV</option>
                      <option value="Bus">Bus</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Reg. Number</label>
                    <input required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#C8813A] transition-all font-mono"
                      value={formData.registrationNumber} onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})} />
                  </div>
                  <input required placeholder="Make (e.g. Toyota)" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#C8813A] transition-all"
                    value={formData.make} onChange={(e) => setFormData({...formData, make: e.target.value})} />
                  <input required placeholder="Model (e.g. Axio)" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#C8813A] transition-all"
                    value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} />
                </div>
              </section>

              {/* Specifications */}
              <section className="pt-8 border-t border-gray-50">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#C8813A] mb-6 flex items-center gap-2">
                  <Settings size={18} /> Performance & Capacity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <Users size={20} className="text-gray-400" />
                    <input type="number" placeholder="Seats" className="bg-transparent outline-none w-full" min="1"
                      value={formData.seatingCapacity} onChange={(e) => { const val = e.target.value; if(val === '' || parseInt(val) >= 1) setFormData({...formData, seatingCapacity: val}); }} />
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <Briefcase size={20} className="text-gray-400" />
                    <input type="number" placeholder="Luggage" className="bg-transparent outline-none w-full" min="0"
                      value={formData.luggageCapacity} onChange={(e) => { const val = e.target.value; if(val === '' || parseInt(val) >= 0) setFormData({...formData, luggageCapacity: val}); }} />
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <Fuel size={20} className="text-gray-400" />
                    <select className="bg-transparent outline-none w-full" value={formData.fuelType} onChange={(e) => setFormData({...formData, fuelType: e.target.value})}>
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 bg-[#C8813A]/5 p-4 rounded-2xl border border-[#C8813A]/10">
                    <DollarSign size={20} className="text-[#C8813A]" />
                    <input type="number" placeholder="Price/KM" className="bg-transparent outline-none w-full font-bold text-[#C8813A]" min="0"
                      value={formData.pricePerKm} onChange={(e) => { const val = e.target.value; if(val === '' || parseFloat(val) >= 0) setFormData({...formData, pricePerKm: val}); }} />
                  </div>
                </div>
              </section>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Assign Driver</label>
                <select className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#C8813A] transition-all"
                  value={formData.driverId} onChange={(e) => setFormData({...formData, driverId: e.target.value})}>
                  <option value="">No Driver Assigned</option>
                  {drivers.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>

              <button type="submit" disabled={updating || uploading} className="w-full py-5 bg-[#C8813A] text-white rounded-full font-black uppercase tracking-widest shadow-xl shadow-[#C8813A]/20 hover:bg-[#A66A28] transition-all disabled:bg-gray-300">
                {updating ? "Syncing Data..." : "Update Asset Details"}
              </button>
            </div>
          </div>

          {/* Right Side: Photos */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <Upload size={14} /> Asset Gallery
              </h3>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {images.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm border border-gray-100">
                    <img src={url} alt="vehicle" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <button type="button" onClick={() => removeImage(idx)} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                ))}
                
                <label className="cursor-pointer border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center aspect-square hover:bg-[#C8813A]/5 hover:border-[#C8813A]/30 transition-all">
                  <input type="file" hidden multiple onChange={handleImageChange} disabled={uploading} />
                  {uploading ? <FiLoader className="animate-spin text-[#C8813A]" /> : <FiUploadCloud className="text-gray-300 text-xl" />}
                  <span className="text-[9px] font-bold text-gray-400 mt-2 uppercase">Add New</span>
                </label>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}