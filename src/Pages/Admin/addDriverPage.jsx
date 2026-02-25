import React, { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaIdCard, 
  FaCar, 
  FaSave, 
  FaCamera, 
  FaMapMarkerAlt, 
  FaFileAlt 
} from "react-icons/fa";import { useNavigate } from "react-router-dom"; 
import { uploadFile } from "../../utils/meadiaUpload.js";

const AddDriverPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    licenseNumber: "",
    vehicleType: "",
    description: "" 
  });
  
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null); 
  const [preview, setPreview] = useState(null);   
  
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

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
      let profileImageUrl = "";

      if (imageFile) {
        toast.loading("Uploading image...", { id: "uploading" });
        profileImageUrl = await uploadFile(imageFile);
        toast.success("Image uploaded successfully!", { id: "uploading" });
      }

      const finalData = { ...formData, profileImage: profileImageUrl };

      await axios.post(`${backendUrl}/driver/create`, finalData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Driver registered successfully!");
      
      setTimeout(() => {
        navigate("/admin/drivers");
      }, 1500);

    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12">
      <Toaster position="top-center" />
      
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-bold text-gray-900">
          Register <span className="text-orange-500">New Driver</span>
        </h1>
        <p className="text-gray-500 mt-2 text-lg">Add a new professional driver to your fleet.</p>
        <div className="w-24 h-1.5 bg-orange-500 mt-4 rounded-full mx-auto md:mx-0"></div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/60 overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold tracking-wide">Driver Information</h2>
            <p className="text-gray-400 text-sm mt-1">Please fill all required fields correctly.</p>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-lg">
            <FaCar className="text-orange-500 text-2xl" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          
          {/* --- Image Upload Section --- */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative w-32 h-32 group">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-gray-100 shadow-md bg-gray-50 flex items-center justify-center">
                {preview ? (
                  <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <FaUser className="text-gray-300 text-5xl" />
                )}
              </div>
              <label className="absolute bottom-1 right-1 bg-orange-500 p-2.5 rounded-full text-white cursor-pointer hover:bg-orange-600 transition-all shadow-lg">
                <FaCamera size={18} />
                <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-2 font-medium">Upload Driver Photo (Optional)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup icon={<FaUser />} label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="Ex: Kamal Perera" />
            <InputGroup icon={<FaEnvelope />} label="Email Address" name="email" value={formData.email} onChange={handleChange} placeholder="driver@example.com" type="email" />
            <InputGroup icon={<FaPhone />} label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} placeholder="+94 7..." type="tel" />
            <InputGroup icon={<FaIdCard />} label="License Number" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} placeholder="B1234567" />
            
            <div className="md:col-span-2">
              <InputGroup icon={<FaCar />} label="Vehicle Type" name="vehicleType" value={formData.vehicleType} onChange={handleChange} placeholder="Sedan, Luxury Van, SUV, etc." />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 flex items-center gap-2">
                <FaMapMarkerAlt className="text-orange-500" size={14} /> Residential Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows="2"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-50 focus:border-orange-500 focus:bg-white outline-none transition-all resize-none"
                placeholder="Enter the full address here..."
              ></textarea>
            </div>

            {/* --- Description Section (New) --- */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 flex items-center gap-2">
                <FaFileAlt className="text-orange-500" size={14} /> Driver Description / Bio
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-50 focus:border-orange-500 focus:bg-white outline-none transition-all"
                placeholder="Tell something about the driver's experience, languages spoken, or special skills..."
              ></textarea>
              <p className="text-[10px] text-gray-400 mt-2 ml-2 italic">This information will be displayed on the driver's public profile.</p>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] disabled:bg-gray-400"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <><FaSave className="text-orange-500" /> Confirm & Register Driver</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ... InputGroup component remains same ...

function InputGroup({ icon, label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">{label}</label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-5 text-gray-400">{icon}</span>
        <input
          {...props}
          required
          className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-50 focus:border-orange-500 focus:bg-white outline-none transition-all"
        />
      </div>
    </div>
  );
}

export default AddDriverPage;