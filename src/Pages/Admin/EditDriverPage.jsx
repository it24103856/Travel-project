import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaCar, FaSave, FaCamera, FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom"; 
import { uploadFile } from "../../utils/meadiaUpload.js";

const EditDriverPage = () => {
  const { email: driverEmail } = useParams(); // URL එකෙන් email එක ලබා ගැනීම
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    licenseNumber: "",
    vehicleType: "",
    profileImage: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imageFile, setImageFile] = useState(null); 
  const [preview, setPreview] = useState(null);   

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  // 1. මුලින්ම රියදුරාගේ තොරතුරු ලබා ගනිමු
  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        const response = await axios.get(`${backendUrl}/driver/get/${driverEmail}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const driver = response.data.data;
        setFormData(driver);
        setPreview(driver.profileImage); // පැරණි පින්තූරය preview එකට දමමු
      } catch (error) {
        toast.error("Failed to load driver details");
        navigate("/admin/drivers");
      } finally {
        setFetching(false);
      }
    };
    fetchDriverData();
  }, [driverEmail]);

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
      let finalImageUrl = formData.profileImage;

      // 2. අලුත් පින්තූරයක් තෝරාගෙන තිබේ නම් පමණක් Upload කරන්න
      if (imageFile) {
        toast.loading("Uploading new image...", { id: "uploading" });
        finalImageUrl = await uploadFile(imageFile);
        toast.success("Image uploaded!", { id: "uploading" });
      }

      const updatedData = { ...formData, profileImage: finalImageUrl };

      // 3. Backend එකට Update Request එක යැවීම
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

  if (fetching) return <div className="text-center mt-20 animate-pulse text-gray-500">Loading driver details...</div>;

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12">
      <Toaster position="top-center" />
      
      <div className="flex items-center justify-between mb-10">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold text-gray-900">
            Edit <span className="text-orange-500">Driver</span>
          </h1>
          <p className="text-gray-500 mt-2 text-lg">Modify information for {formData.name}</p>
          <div className="w-24 h-1.5 bg-orange-500 mt-4 rounded-full mx-auto md:mx-0"></div>
        </div>
        <button 
          onClick={() => navigate("/admin/drivers")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <FaArrowLeft /> Back to List
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/60 overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold tracking-wide">Update Information</h2>
            <p className="text-gray-400 text-sm mt-1">Edit the fields you wish to change.</p>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-lg">
            <FaUser className="text-orange-500 text-2xl" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          
          {/* --- Image Section --- */}
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
            <p className="text-xs text-gray-400 mt-2 font-medium">Change Photo (Optional)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup icon={<FaUser />} label="Full Name" name="name" value={formData.name} onChange={handleChange} />
            <InputGroup icon={<FaEnvelope />} label="Email Address" name="email" value={formData.email} onChange={handleChange} type="email" disabled />
            <InputGroup icon={<FaPhone />} label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
            <InputGroup icon={<FaIdCard />} label="License Number" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} />
            
            <div className="md:col-span-2">
              <InputGroup icon={<FaCar />} label="Vehicle Type" name="vehicleType" value={formData.vehicleType} onChange={handleChange} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Residential Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-50 focus:border-orange-500 focus:bg-white outline-none transition-all"
              ></textarea>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] disabled:bg-gray-400"
            >
              {loading ? "Saving Changes..." : <><FaSave className="text-orange-500" /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reusable Input Component (AddDriver එකේ එකමයි)
function InputGroup({ icon, label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">{label}</label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-5 text-gray-400">{icon}</span>
        <input
          {...props}
          required
          className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-50 focus:border-orange-500 focus:bg-white outline-none transition-all disabled:opacity-50"
        />
      </div>
    </div>
  );
}

export default EditDriverPage;