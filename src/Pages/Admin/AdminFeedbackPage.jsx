import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { 
    FaStar, FaTrash, FaFilter, FaChartBar, FaUserCircle, 
    FaCalendarAlt, FaCar, FaUserTie, FaGlobe, FaArrowUp 
} from "react-icons/fa";
// Recharts Components ආනයනය කිරීම
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';

export default function AdminFeedback() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({ category: "", rating: "" });

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'];

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            // Feedbacks සහ Stats එකවර ලබා ගැනීම
            const [fbRes, statsRes] = await Promise.all([
                axios.get(`${backendUrl}/feedback/get-all?category=${filters.category}&rating=${filters.rating}`, config),
                axios.get(`${backendUrl}/feedback/stats`, config)
            ]);

            setFeedbacks(fbRes.data.feedbacks || []);
            if (statsRes.data.success) setStats(statsRes.data.stats);
        } catch (error) {
            toast.error("Data synchronization failed.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters]);

    const handleDelete = async (id) => {
        if (!window.confirm("Confirm permanent deletion?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${backendUrl}/feedback/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Record purged");
            fetchData();
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    // Chart එක සඳහා දත්ත සකස් කිරීම (Rating counts)
    const ratingChartData = stats?.rating?.map(item => ({
        name: `${item._id} Star`,
        count: item.count
    })) || [];

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 pt-24 font-sans">
            <Toaster position="top-right" />
            
            <div className="max-w-7xl mx-auto">
                {/* 1. Header & Filters */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">Feedback <span className="text-orange-500 underline">Intelligence</span></h1>
                        <p className="text-slate-500 font-medium">Advanced analytics for customer satisfaction</p>
                    </div>
                    
                    <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
                        <select className="px-4 py-2 text-sm font-bold bg-transparent outline-none border-r border-slate-100" 
                                onChange={(e) => setFilters({...filters, category: e.target.value})}>
                            <option value="">All Services</option>
                            <option value="Vehicles">Vehicles</option>
                            <option value="driverse">Drivers</option>
                        </select>
                        <select className="px-4 py-2 text-sm font-bold bg-transparent outline-none"
                                onChange={(e) => setFilters({...filters, rating: e.target.value})}>
                            <option value="">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
                    </div>
                </div>

                {/* 2. Visual Analytics (Charts) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    {/* Bar Chart - Rating Distribution */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <FaChartBar className="text-orange-500" /> Rating Distribution
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ratingChartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                    <Tooltip cursor={{fill: '#fff7ed'}} contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                    <Bar dataKey="count" fill="#f97316" radius={[10, 10, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Pie Chart - Category Share */}
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <FaGlobe className="text-orange-500" /> Category Share
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={stats?.category || []} dataKey="count" nameKey="_id" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                        {stats?.category?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* 3. Detailed Data Table */}
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-50 bg-slate-50/50">
                        <h2 className="text-xl font-bold text-slate-800">Review Archive</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">
                                <tr>
                                    <th className="px-8 py-4">User Details</th>
                                    <th className="px-8 py-4">Experience</th>
                                    <th className="px-8 py-4">Metric</th>
                                    <th className="px-8 py-4 text-right">Control</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {feedbacks.map((fb) => (
                                    <tr key={fb._id} className="hover:bg-orange-50/30 transition-colors">
                                        
                                        <td className="px-8 py-5">
    <div className="flex items-center gap-3">
        {/* පින්තූරය පරීක්ෂා කිරීම */}
        {fb.userId?.image ? (
            <img 
                src={fb.userId.image} 
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-sm"
            />
        ) : (
            /* පින්තූරයක් නැතිනම් නමේ මුල් අකුර පෙන්වයි */
            <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm uppercase">
                {fb.userId?.firstName?.charAt(0) || "U"}
            </div>
        )}
        
        <div>
            <p className="text-sm font-bold text-slate-900">
                {fb.userId?.firstName} {fb.userId?.lastName}
            </p>
            <p className="text-[10px] text-slate-400">
                {fb.userId?.email}
            </p>
        </div>
    </div>
</td>
                                        
                                        
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold">
                                                    {fb.userId?.firstName?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{fb.userId?.firstName} {fb.userId?.lastName}</p>
                                                    <p className="text-[10px] text-slate-400 italic">{fb.userId?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-sm text-slate-600 line-clamp-1 max-w-xs">"{fb.feedback}"</p>
                                            <span className="text-[9px] font-bold text-slate-300 uppercase flex items-center gap-1 mt-1">
                                                <FaCalendarAlt /> {new Date(fb.createdAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="flex text-yellow-400">
                                                    {[...Array(fb.rating)].map((_, i) => <FaStar key={i} size={10} />)}
                                                </div>
                                                <span className="text-[9px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md font-bold uppercase">{fb.category}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button onClick={() => handleDelete(fb._id)} className="text-slate-200 hover:text-red-500 p-2 transition-all hover:bg-red-50 rounded-lg">
                                                <FaTrash size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}