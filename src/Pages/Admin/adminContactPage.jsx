import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";

const AdminContactPage = () => {
  const [contact, setContact] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchContact();
  }, []);

  const fetchContact = async () => {
    try {
      const response = await axios.get(`${backendUrl}/contact/get`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.data.data) {
        setContact(response.data.data);
        setFormData(response.data.data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = contact
        ? `${backendUrl}/contact/update/${contact._id}`
        : `${backendUrl}/contact/create`;

      const method = contact ? "put" : "post";

      const response = await axios({
        method: method,
        url: url,
        data: formData,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      toast.success(response.data.message || "Contact saved successfully!");
      setContact(response.data.data);
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save contact");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!contact) return;

    if (window.confirm("Are you sure you want to delete this contact?")) {
      const deleteToast = toast.loading("Deleting...");
      try {
        await axios.delete(`${backendUrl}/contact/delete/${contact._id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        toast.success("Contact deleted successfully!", { id: deleteToast });
        setContact(null);
        setFormData({ name: "", email: "", phone: "", address: "" });
      } catch (error) {
        toast.error("Failed to delete contact", { id: deleteToast });
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12">
      <Toaster position="top-center" />

      {/* Header Section */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-bold text-gray-900">
          Contact <span className="text-orange-500">Management</span>
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Configure the official contact details for your travel platform.
        </p>
        <div className="w-24 h-1.5 bg-orange-500 mt-4 rounded-full mx-auto md:mx-0"></div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/60 overflow-hidden border border-gray-100">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold tracking-wide">
              {isEditing ? "Update Information" : "Official Business Details"}
            </h2>
            <p className="text-gray-400 text-sm mt-1 font-medium">
              {contact ? "Currently Active" : "No record found"}
            </p>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-lg">
            {isEditing ? <FaEdit className="text-orange-500 text-2xl animate-pulse" /> : <FaUser className="text-orange-500 text-2xl" />}
          </div>
        </div>

        {/* Dynamic Content: View vs Edit */}
        {!isEditing && contact ? (
          <div className="p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <InfoBlock icon={<FaUser />} label="Full Name" value={contact.name} />
              <InfoBlock icon={<FaEnvelope />} label="Email Address" value={contact.email} />
              <InfoBlock icon={<FaPhone />} label="Phone Number" value={contact.phone} />
              <InfoBlock icon={<FaMapMarkerAlt />} label="Office Address" value={contact.address} />
            </div>

            <div className="flex gap-4 mt-12">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-100 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <FaEdit /> Edit Details
              </button>
              <button
                onClick={handleDelete}
                className="px-6 bg-red-50 hover:bg-red-100 text-red-500 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95"
                title="Delete Record"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup icon={<FaUser />} label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" />
              <InputGroup icon={<FaEnvelope />} label="Email" name="email" value={formData.email} onChange={handleChange} placeholder="admin@example.com" type="email" />
              <InputGroup icon={<FaPhone />} label="Phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+94..." type="tel" />
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Office Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-50 focus:border-orange-500 focus:bg-white outline-none transition-all"
                  placeholder="Street, City, Country"
                ></textarea>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:bg-gray-400"
              >
                {loading ? "Saving..." : <><FaSave /> {contact ? "Update Settings" : "Create Record"}</>}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-8 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3"
                >
                  <FaTimes /> Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// --- Helper Components ---

function InfoBlock({ icon, label, value }) {
  return (
    <div className="flex items-start gap-4 p-5 rounded-[1.5rem] bg-gray-50/50 hover:bg-orange-50/50 transition-colors border border-transparent hover:border-orange-100">
      <div className="bg-white p-3.5 rounded-xl text-orange-500 shadow-sm border border-gray-100">{icon}</div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-lg font-bold text-gray-800 leading-tight">{value || "Not Set"}</p>
      </div>
    </div>
  );
}

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

export default AdminContactPage;