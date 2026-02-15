import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header"; 
import Footer from "../components/Footer"; 
import EditProfileModal from "../components/EditProfileModal"; 
import { BiEditAlt, BiPhone, BiEnvelope, BiUserCircle, BiMap } from "react-icons/bi";

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");
                
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(res.data);
            } catch (err) {
                console.error("Error fetching user data. Make sure token is valid.");
            }
        };
        fetchUser();
    }, []);

    if (!user) return <div className="text-center mt-20 font-semibold text-gray-500">Loading Profile...</div>;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />

            <main className="flex-grow pt-16">
                {/* 1. Top Banner */}
                <div className="h-64 w-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-inner"></div>

                <div className="max-w-4xl mx-auto px-4 relative">
                    {/* 2. Overlapping Card */}
                    <div className="bg-white rounded-[40px] shadow-2xl -mt-32 p-12 text-center relative z-10 border border-gray-100">
                        
                        {/* Profile Photo (මැදට සහ ලොකුවට) */}
                        <div className="absolute left-1/2 -translate-x-1/2 -top-24">
                            <div className="w-48 h-48 rounded-full border-[8px] border-white shadow-2xl overflow-hidden bg-white">
                                <img 
                                    src={user.image || "/default-profile.png"} 
                                    className="w-full h-full object-cover"
                                    alt="Profile"
                                />
                            </div>
                        </div>

                        {/* User Details Area */}
                        <div className="pt-20">
                            <h1 className="text-4xl font-extrabold text-gray-800">
                                {user.firstName} {user.lastName}
                            </h1>
                            <p className="text-gray-500 mt-3 font-medium flex justify-center items-center gap-2 text-lg">
                                <BiMap className="text-cyan-500" /> {user.address || "Location not provided"}
                            </p>
                        </div>

                        {/* Information Grid */}
                        <div className="grid md:grid-cols-2 gap-6 mt-12 text-left border-t border-gray-100 pt-10">
                            {/* Email */}
                            <div className="flex items-center gap-5 p-5 rounded-3xl bg-gray-50 border border-transparent hover:border-cyan-100 hover:bg-cyan-50 transition-all duration-300">
                                <div className="p-3 bg-white rounded-2xl shadow-sm text-cyan-600">
                                    <BiEnvelope size={28}/>
                                </div>
                                <div>
                                    <p className="text-xs uppercase font-bold text-gray-400 tracking-widest">Email Address</p>
                                    <p className="font-semibold text-gray-700">{user.email}</p>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex items-center gap-5 p-5 rounded-3xl bg-gray-50 border border-transparent hover:border-green-100 hover:bg-green-50 transition-all duration-300">
                                <div className="p-3 bg-white rounded-2xl shadow-sm text-green-600">
                                    <BiPhone size={28}/>
                                </div>
                                <div>
                                    <p className="text-xs uppercase font-bold text-gray-400 tracking-widest">Phone Number</p>
                                    <p className="font-semibold text-gray-700">{user.phone || "Not provided"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Edit Button at Bottom (මැදට) */}
                        <div className="mt-14">
                            <button 
                                onClick={() => setIsEditOpen(true)}
                                className="inline-flex items-center gap-2 bg-gray-900 text-white px-12 py-4 rounded-full font-bold shadow-xl hover:bg-cyan-600 hover:scale-105 transition-all duration-300"
                            >
                                <BiEditAlt size={22} /> Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {isEditOpen && (
                <EditProfileModal 
                    user={user} 
                    onClose={() => setIsEditOpen(false)} 
                    onUpdate={(updatedData) => setUser(updatedData)}
                />
            )}
        </div>
    );
}