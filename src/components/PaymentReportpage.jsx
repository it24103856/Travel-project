import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, TrendingUp, Loader2, ArrowUpRight, ArrowDownRight, Globe } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

const PaymentReportpage = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get(`${API_URL}/payments/admin/all`, config);
                if(res.data && res.data.success) {
                    setPayments(res.data.data);
                }
            } catch (error) {
                toast.error('Failed to fetch real-time data');
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, [API_URL]);

    const reportData = useMemo(() => {
        if (!payments.length) return { methodData: [], monthlySummary: [] };

        // 1. Group by Payment Method
        const methods = payments.reduce((acc, p) => {
            const m = p.paymentMethod || 'Other';
            acc[m] = (acc[m] || 0) + 1;
            return acc;
        }, {});
        const methodData = Object.keys(methods).map(name => ({ name, value: methods[name] }));

        // 2. Group by Month
        const monthlyMap = payments.reduce((acc, p) => {
            const date = new Date(p.paymentDetails?.paymentDate || p.createdAt);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const label = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });

            if (!acc[key]) {
                acc[key] = { key, label, totalRevenue: 0, transactions: 0 };
            }
            acc[key].totalRevenue += (Number(p.amount) || 0);
            acc[key].transactions += 1;
            return acc;
        }, {});

        const sortedMonths = Object.values(monthlyMap).sort((a, b) => b.key.localeCompare(a.key));
        
        const monthlySummary = sortedMonths.map((curr, index) => {
            const prev = sortedMonths[index + 1];
            let growth = 0;
            if (prev && prev.totalRevenue > 0) {
                growth = ((curr.totalRevenue - prev.totalRevenue) / prev.totalRevenue) * 100;
            }
            return {
                ...curr,
                average: curr.totalRevenue / curr.transactions,
                growth: growth.toFixed(1)
            };
        });

        return { methodData, monthlySummary };
    }, [payments]);

    const COLORS = ['#1d70d1', '#4caf50', '#ff9800', '#f44336', '#94a3b8'];

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-white">
            <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans print:bg-white print:p-0">
            <Toaster position="top-right" />
            
           

            <div className="max-w-6xl mx-auto">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 print:mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-3 bg-white hover:bg-gray-100 rounded-2xl shadow-sm border border-gray-200 transition-all no-print">
                            <ArrowLeft size={20} className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase print:text-xl">Financial Analytics Report</h1>
                            <p className="text-blue-600 text-sm font-bold uppercase italic tracking-widest">
                                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 no-print">
                        
                        
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 print:gap-4">
                    
                    {/* 1. Payment Methods Pie Chart */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 print-card">
                        <div className="flex items-center gap-3 mb-8 print:mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg no-print"><FileText size={20} className="text-blue-600" /></div>
                            <h3 className="font-bold text-slate-800 uppercase text-sm tracking-wider">Payment Methods Distribution</h3>
                        </div>
                        <div className="h-[350px] w-full chart-container flex justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={reportData.methodData} 
                                        cx="50%" 
                                        cy="50%" 
                                        innerRadius={70} 
                                        outerRadius={105} 
                                        paddingAngle={5} 
                                        dataKey="value"
                                        isAnimationActive={false} 
                                    >
                                        {reportData.methodData.map((_, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 2. Monthly Summary Table */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 print-card">
                        <div className="flex items-center gap-3 mb-8 print:mb-4">
                            <div className="p-2 bg-emerald-50 rounded-lg no-print"><TrendingUp size={20} className="text-emerald-600" /></div>
                            <h3 className="font-bold text-slate-800 uppercase text-sm tracking-wider">Monthly Performance Summary</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black">Month</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black">Total Revenue</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black text-center">Trans.</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black">Average</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black text-right">Growth</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {reportData.monthlySummary.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-6 font-bold text-slate-450">{item.label}</td>
                                            <td className="px-6 py-6 font-black text-slate-450 italic">Rs. {item.totalRevenue.toLocaleString()}</td>
                                            <td className="px-6 py-6 text-center">
                                                <span className="bg-slate-100 text-slate-450 px-3 py-1 rounded-full text-[10px] font-bold border border-slate-200">
                                                    {item.transactions}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6 font-medium text-slate-450">Rs. {item.average.toLocaleString()}</td>
                                            <td className="px-6 py-6 text-right font-black italic">
                                                {idx === reportData.monthlySummary.length - 1 ? (
                                                    <span className="text-slate-300 text-[10px] uppercase">Initial</span>
                                                ) : (
                                                    <div className={`flex items-center justify-end gap-1 ${Number(item.growth) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        {Number(item.growth) >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                        {item.growth}%
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    

                </div>
            </div>
        </div>
    );
};

export default PaymentReportpage;