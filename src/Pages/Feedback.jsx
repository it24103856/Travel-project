import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Star, Send, Trash2, MessageCircle, Car, UserCheck, Globe } from "lucide-react";
import Footer from '../components/Footer';

export default function CustomerFeedback() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        feedback: "",
        rating: 5,
        category: "Vehicles"
    });

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const fetchMyFeedbacks = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${backendUrl}/feedback/get-all`, config);
            setFeedbacks(data.feedbacks || []);
        } catch (error) {
            toast.error("Could not load your feedbacks.");
        }
    };

    useEffect(() => {
        fetchMyFeedbacks();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.feedback.trim()) return toast.error("Please enter your feedback message.");

        setIsLoading(true);
        const loadingToast = toast.loading("Submitting your feedback...");
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${backendUrl}/feedback/create`, formData, config);
            toast.success("Feedback submitted successfully!", { id: loadingToast });
            setFormData({ feedback: "", rating: 5, category: "Vehicles" });
            fetchMyFeedbacks();
        } catch (error) {
            toast.error("Error submitting feedback", { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this feedback?")) return;
        const deleteToast = toast.loading("Deleting feedback...");
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${backendUrl}/feedback/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Feedback deleted!", { id: deleteToast });
            fetchMyFeedbacks();
        } catch (error) {
            toast.error("Failed to delete.", { id: deleteToast });
        }
    };

    const getCategoryIcon = (category) => {
        if (category === "Vehicles") return <Car size={20} />;
        if (category === "driverse") return <UserCheck size={20} />;
        return <Globe size={20} />;
    };

    return (
        <main className="w-full min-h-screen bg-[#FDFDFD]">
            <Toaster position="top-center" reverseOrder={false} />

            {/* 1. Hero Section */}
            <section className="relative h-[45vh] flex items-center justify-center bg-fixed bg-center bg-cover"
                       style={{ backgroundImage: "url('https://images.pexels.com/photos/2108845/pexels-photo-2108845.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')" }}>
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="relative z-10 text-center text-white px-4">
                    <p className="uppercase text-[11px] tracking-[0.3em] font-semibold text-white/60 mb-4">Your Voice Matters</p>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Guest <span className="italic">Reviews</span>
                    </h1>
                    <p className="mt-4 text-lg md:text-xl font-light max-w-2xl mx-auto text-white/80">
                        Your experiences shape our journey. Thank you for being part of TravelEase.
                    </p>
                </div>
            </section>

            {/* 2. Main Content Section */}
            <section className="max-w-7xl mx-auto py-24 px-6 grid grid-cols-1 lg:grid-cols-3 gap-16">

                {/* Left Side - Feedback Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-lg transition-all duration-500 border border-gray-50 sticky top-28">
                        <div className="mb-8">
                            <p className="uppercase text-[10px] tracking-[0.3em] font-semibold text-[#C8813A] mb-2">Leave a Review</p>
                            <h2 className="text-3xl font-bold text-gray-900 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Share Your <span className="italic text-[#C8813A]">Story</span>
                            </h2>
                            <div className="w-12 h-1 bg-[#C8813A] mt-2 rounded-full"></div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Category Selectors */}
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-400 tracking-widest ml-1">Category</label>
                                <div className="grid grid-cols-3 gap-3 mt-3">
                                    {[
                                        { id: "Vehicles", icon: <Car size={20} />, label: "Vehicle" },
                                        { id: "driverse", icon: <UserCheck size={20} />, label: "Driver" },
                                        { id: "All", icon: <Globe size={20} />, label: "Other" }
                                    ].map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, category: cat.id })}
                                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-500 ${
                                                formData.category === cat.id
                                                ? "border-[#C8813A] bg-[#C8813A]/10 text-[#C8813A] shadow-sm"
                                                : "border-gray-100 bg-gray-50 text-gray-400 hover:border-[#C8813A]/30"
                                            }`}
                                        >
                                            <span className="mb-1">{cat.icon}</span>
                                            <span className="text-[9px] font-bold uppercase">{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Star Rating */}
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-400 tracking-widest ml-1">Rating</label>
                                <div className="flex gap-2 mt-2 py-3 justify-center bg-gray-50 rounded-2xl border border-gray-100">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            onClick={() => setFormData({ ...formData, rating: star })}
                                            size={24}
                                            className={`cursor-pointer transition-all duration-300 ${
                                                star <= formData.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Textarea */}
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-400 tracking-widest ml-1">Message</label>
                                <textarea
                                    required
                                    rows="4"
                                    className="w-full mt-2 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#C8813A]/20 focus:border-[#C8813A] outline-none transition-all duration-500 text-gray-700 placeholder:text-gray-300"
                                    placeholder="How was your trip?"
                                    value={formData.feedback}
                                    onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-[#C8813A] hover:bg-[#A66A28] text-white rounded-full font-bold shadow-lg shadow-[#C8813A]/20 transition-all duration-500 flex items-center justify-center gap-2 uppercase text-[11px] tracking-widest"
                            >
                                {isLoading ? "Sending..." : <><Send size={16} /> Post Feedback</>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Side - Feedback List */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <h3 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>What People Say</h3>
                        <div className="flex items-center gap-2">
                            <span className="bg-[#C8813A]/10 text-[#C8813A] px-3 py-1 rounded-full text-xs font-bold">
                                {feedbacks.length} Reviews
                            </span>
                        </div>
                    </div>

                    {feedbacks.length === 0 ? (
                        <div className="bg-gray-50 p-20 rounded-[2.5rem] text-center border-2 border-dashed border-gray-100">
                            <MessageCircle className="text-gray-200 mx-auto mb-4" size={48} />
                            <p className="text-gray-400 font-medium italic" style={{ fontFamily: "'Playfair Display', serif" }}>No reviews yet. Start the conversation!</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {feedbacks.map((fb) => (
                                <div key={fb._id} className="group bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-lg border border-gray-50 transition-all duration-500 relative">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-5">
                                            <div className="w-14 h-14 bg-[#C8813A]/10 text-[#C8813A] rounded-2xl flex items-center justify-center flex-shrink-0">
                                                {getCategoryIcon(fb.category)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex text-amber-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={14} className={i < fb.rating ? "fill-amber-400" : "text-gray-200"} />
                                                        ))}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                                                        {new Date(fb.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 mt-3 text-lg leading-relaxed font-medium italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                                                    "{fb.feedback}"
                                                </p>
                                                <div className="mt-4 flex items-center gap-2">
                                                    <span className="text-[9px] px-3 py-1 bg-gray-100 text-gray-500 rounded-full font-bold uppercase tracking-widest">
                                                        #{fb.category}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleDelete(fb._id)}
                                            className="text-gray-200 hover:text-red-500 p-2 transition-colors duration-500"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}