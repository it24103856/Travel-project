import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Star, Trash2, Filter, BarChart3, UserCircle, Calendar, Car, UserCog, Globe, ArrowUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function AdminFeedback() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({ category: "", rating: "" });

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const COLORS = ['#00AEEF', '#33BFFF', '#66CFFF', '#99DFFF', '#CCEFFF'];

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [fbRes, statsRes] = await Promise.all([
                axios.get(`${backendUrl}/feedback/get-all?category=${filters.category}&rating=${filters.rating}`, config),
                axios.get(`${backendUrl}/feedback/stats`, config)
            ]);
            setFeedbacks(fbRes.data.feedbacks || []);
            if (statsRes.data.success) setStats(statsRes.data.stats);
        } catch (error) { toast.error("Data synchronization failed."); } finally { setIsLoading(false); }
    };

    useEffect(() => { fetchData(); }, [filters]);

    const handleDelete = async (id) => {
        if (!window.confirm("Confirm permanent deletion?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${backendUrl}/feedback/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Record purged");
            fetchData();
        } catch (error) { toast.error("Delete failed"); }
    };

    const ratingChartData = stats?.rating?.map(item => ({ name: `${item._id} Star`, count: item.count })) || [];

    return (
        <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-8 pt-24 font-[Inter]">
            <Toaster position="top-right" />
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl font-[Playfair_Display] font-bold text-gray-900">Feedback <span className="text-[#00AEEF]">Intelligence</span></h1>
                        <p className="text-gray-500 font-medium">Advanced analytics for customer satisfaction</p>
                    </div>
                    <div className="flex bg-white p-2 rounded-full shadow-sm border border-gray-100">
                        <select className="px-4 py-2 text-sm font-bold bg-transparent outline-none border-r border-gray-100" onChange={(e) => setFilters({...filters, category: e.target.value})}>
                            <option value="">All Services</option>
                            <option value="Vehicles">Vehicles</option>
                            <option value="driverse">Drivers</option>
                        </select>
                        <select className="px-4 py-2 text-sm font-bold bg-transparent outline-none" onChange={(e) => setFilters({...filters, rating: e.target.value})}>
                            <option value="">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <BarChart3 className="text-[#00AEEF]" size={18} /> Rating Distribution
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ratingChartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                    <Tooltip cursor={{fill: '#f0f9ff'}} contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                    <Bar dataKey="count" fill="#00AEEF" radius={[10, 10, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Globe className="text-[#00AEEF]" size={18} /> Category Share
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

                {/* Table */}
                <div className="bg-white rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-500">
                    <div className="p-8 border-b border-gray-50 bg-gray-50/50">
                        <h2 className="text-xl font-[Playfair_Display] font-bold text-gray-800">Review Archive</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-[#00AEEF] to-[#0095cc] text-white text-[10px] uppercase font-black tracking-[0.2em]">
                                <tr>
                                    <th className="px-8 py-4">User Details</th>
                                    <th className="px-8 py-4">Experience</th>
                                    <th className="px-8 py-4">Metric</th>
                                    <th className="px-8 py-4 text-right">Control</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {feedbacks.map((fb) => (
                                    <tr key={fb._id} className="hover:bg-[#00AEEF]/5 transition-all duration-500">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                {fb.userId?.image ? (
                                                    <img src={fb.userId.image} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-[#00AEEF] text-white rounded-full flex items-center justify-center font-bold text-sm uppercase">
                                                        {fb.userId?.firstName?.charAt(0) || "U"}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{fb.userId?.firstName} {fb.userId?.lastName}</p>
                                                    <p className="text-[10px] text-gray-400">{fb.userId?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-sm text-gray-600 line-clamp-1 max-w-xs">"{fb.feedback}"</p>
                                            <span className="text-[9px] font-bold text-gray-300 uppercase flex items-center gap-1 mt-1">
                                                <Calendar size={10} /> {new Date(fb.createdAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="flex text-[#00AEEF]">
                                                    {[...Array(fb.rating)].map((_, i) => <Star key={i} size={10} fill="#00AEEF" />)}
                                                </div>
                                                <span className="text-[9px] px-2 py-0.5 bg-[#00AEEF]/10 text-[#00AEEF] rounded-md font-bold uppercase">{fb.category}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button onClick={() => handleDelete(fb._id)} className="text-gray-200 hover:text-red-500 p-2 transition-all duration-500 hover:bg-red-50 rounded-lg">
                                                <Trash2 size={14} />
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