import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { uploadFile } from "../utils/meadiaUpload";

export default function EditProfileModal({ user, onClose, onUpdate }) {
    // Initialize form state with existing user data
    const [formData, setFormData] = useState({ ...user });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem("token");

        try {
            let imageUrl = formData.image;
            
            // If a new file is selected, upload it first
            if (file) {
                imageUrl = await uploadFile(file);
            }

            // Send PUT request to the backend
            const res = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/users/update-profile/${user.email}`, 
                {
                    ...formData,
                    image: imageUrl
                }, 
                {
                    headers: { 
                        Authorization: `Bearer ${token}` 
                    }
                }
            );

            /* CRITICAL FIX: 
               Your backend returns the updated user object directly.
               Using onUpdate(res.data) instead of res.data.user to trigger 
               immediate UI update without page refresh.
            */
            onUpdate(res.data); 
            
            toast.success("Profile Updated Successfully!");
            onClose(); // Close modal after success
        } catch (err) {
            console.error("Update failed:", err);
            toast.error("Update failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                <h3 className="text-xl font-bold mb-6">Edit Your Details</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Profile Picture Upload */}
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-600">Profile Picture</label>
                        <input 
                            type="file" 
                            accept="image/*"
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                    </div>

                    {/* First Name */}
                    <input 
                        className="w-full p-3 border rounded-xl"
                        value={formData.firstName || ""}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        placeholder="First Name"
                        required
                    />

                    {/* Last Name */}
                    <input 
                        className="w-full p-3 border rounded-xl"
                        value={formData.lastName || ""}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        placeholder="Last Name"
                        required
                    />

                    {/* PHONE NUMBER FIX: 
                        Changed value to formData.phone to match the state key 
                        updated in onChange.
                    */}
                    <input 
                        className="w-full p-3 border rounded-xl"
                        value={formData.phone || ""}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="Phone Number"
                    />

                    {/* Address */}
                    <input 
                        className="w-full p-3 border rounded-xl"
                        value={formData.address || ""}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="Address"
                    />
                    
                    <div className="flex gap-4 mt-6">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="flex-1 py-3 text-gray-500 font-semibold"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="flex-1 bg-cyan-600 text-white py-3 rounded-xl font-bold hover:bg-cyan-700 disabled:bg-gray-400 transition-colors"
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}