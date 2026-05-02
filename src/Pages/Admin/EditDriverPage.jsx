import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { User, Mail, Phone, IdCard, Car, Save, Camera, ArrowLeft, MapPin, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom"; 
import { uploadFile } from "../../utils/meadiaUpload.js";

const EditDriverPage = () => {
  const { email: driverEmail } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: "",
    licenseNumber: "", vehicleType: "", profileImage: "", description: "" 
  });
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imageFile, setImageFile] = useState(null); 
  const [preview, setPreview] = useState(null);   

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        console.log("Fetching driver by email (request):", driverEmail);
        const response = await axios.get(`${backendUrl}/driver/get/${driverEmail}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const driver = response.data.data;
        setFormData(driver);
        setPreview(driver.profileImage);
      } catch (error) {
        toast.error("Failed to load driver details");
        navigate("/admin/drivers");
      } finally {
        setFetching(false);
      }
    };
    fetchDriverData();
  }, [driverEmail, backendUrl, token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Updating driver (email):", driverEmail);
      let finalImageUrl = formData.profileImage;

      if (imageFile) {
        toast.loading("Uploading new image...", { id: "uploading" });
        finalImageUrl = await uploadFile(imageFile);
        toast.success("Image uploaded!", { id: "uploading" });
      }

      const updatedData = { ...formData, profileImage: finalImageUrl };

      await axios.put(`${backendUrl}/driver/update/${driverEmail}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Driver updated successfully!");
      setTimeout(() => navigate("/admin/drivers"), 1500);

    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#6366F1] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium animate-pulse font-[Inter]">Fetching driver details...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12">
      <Toaster position="top-center" />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-[Playfair_Display] font-bold text-gray-900">
            Edit <span className="text-[#C8813A]">Driver</span>
          </h1>
          <p className="text-gray-500 mt-2 text-lg italic font-[Inter]">Modifying: {formData.name}</p>
          <div className="w-24 h-1.5 bg-[#C8813A] mt-4 rounded-full"></div>
        </div>
        <button 
          onClick={() => navigate("/admin/drivers")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 text-gray-600 hover:bg-[#C8813A] hover:text-white hover:border-[#C8813A] transition-all duration-500 w-fit font-semibold uppercase tracking-widest text-xs"
        >
          <ArrowLeft size={14}/> Back to Fleet
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm hover:shadow-2xl overflow-hidden border border-gray-100 transition-all duration-500">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-[Playfair_Display] font-bold tracking-wide uppercase">Update Profile</h2>
            <p className="text-gray-400 text-sm mt-1 font-[Inter]">Keep the driver information up to date.</p>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-lg border border-white/10">
            <IdCard className="text-[#C8813A] w-6 h-6" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-36 h-36 group">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#C8813A]/10 shadow-xl bg-gray-50 flex items-center justify-center">
                {preview ? (
                  <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="text-gray-300 w-16 h-16" />
                )}
              </div>
              <label className="absolute bottom-2 right-2 bg-[#C8813A] p-3 rounded-full text-white cursor-pointer hover:bg-[#A66A28] transition-all duration-500 shadow-lg border-2 border-white">
                <Camera size={16} />
                <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-4 font-bold uppercase tracking-widest font-[Inter]">Driver Profile Photo</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputGroup icon={<User size={16} />} label="Full Name" name="name" value={formData.name} onChange={handleChange} />
            <InputGroup icon={<Mail size={16} />} label="Email Address" name="email" value={formData.email} onChange={handleChange} type="email" disabled />
            <InputGroup icon={<Phone size={16} />} label="Phone Number" name="phone" value={formData.phone} onChange={(e) => { const val = e.target.value.replace(/\D/g, '').slice(0, 10); setFormData({...formData, phone: val}); }} maxLength="10" type="tel" />
            <InputGroup icon={<IdCard size={16} />} label="License Number" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} />
            
            <div className="md:col-span-2">
              <InputGroup icon={<Car size={16} />} label="Vehicle Type" name="vehicleType" value={formData.vehicleType} onChange={handleChange} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 flex items-center gap-2">
                <MapPin className="text-[#C8813A]" size={14}/> Permanent Address
              </label>
              <textarea name="address" value={formData.address} onChange={handleChange} required rows="2"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#C8813A]/10 focus:border-[#C8813A] focus:bg-white outline-none transition-all duration-500 resize-none font-[Inter]"
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 flex items-center gap-2">
                <FileText className="text-[#C8813A]" size={14}/> Driver Bio / Description
              </label>
              <textarea name="description" value={formData.description} onChange={handleChange} required rows="4"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#C8813A]/10 focus:border-[#C8813A] focus:bg-white outline-none transition-all duration-500 font-[Inter]"
                placeholder="Briefly describe the driver's experience and skills..."
              ></textarea>
            </div>
          </div>

          <div className="pt-6">
            <button type="submit" disabled={loading}
              className="w-full bg-[#C8813A] hover:bg-[#A66A28] text-white font-bold py-5 rounded-full transition-all duration-500 flex items-center justify-center gap-3 shadow-xl uppercase tracking-widest active:scale-[0.98] disabled:bg-gray-400"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </div>
              ) : (
                <><Save className="text-white" size={18} /> Update Driver Details</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function InputGroup({ icon, label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">{label}</label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-5 text-gray-400">{icon}</span>
        <input {...props} required
          className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#C8813A]/10 focus:border-[#C8813A] focus:bg-white outline-none transition-all duration-500 disabled:opacity-60 disabled:bg-gray-100 disabled:cursor-not-allowed font-[Inter]"
        />
      </div>
    </div>
  );
}

export default EditDriverPage;
