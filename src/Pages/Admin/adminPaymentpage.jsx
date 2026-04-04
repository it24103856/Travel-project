import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Eye, CheckCircle, XCircle, Loader2, PieChart as PieIcon, 
    TrendingUp, Filter, FileBarChart, BrainCircuit, Clock, Wallet, Download
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { 
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar
} from 'recharts';

const STATUS_COLORS = {
    COMPLETED: '#10b981',
    PROCESSING: '#f59e0b',
    PENDING: '#C8813A',
    FAILED: '#ef4444',
};

const AdminPaymentPage = () => {
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterMethod, setFilterMethod] = useState('all');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const reportRef = useRef(null);
    
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    const stats = useMemo(() => {
        if (!payments.length) return { totalRevenue: 0, pendingCount: 0, cryptoCount: 0, statusData: [], revenueData: [], paymentMethodData: [] };
        const totalRevenue = payments.filter(p => p.paymentStatus?.toLowerCase() === 'completed').reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        const pendingCount = payments.filter(p => ['pending', 'processing'].includes(p.paymentStatus?.toLowerCase())).length;
        const cryptoCount = payments.filter(p => p.paymentMethod === 'crypto').length;
        const statusCounts = payments.reduce((acc, p) => { const s = (p.paymentStatus || 'pending').toUpperCase(); acc[s] = (acc[s] || 0) + 1; return acc; }, {});
        const statusData = Object.keys(statusCounts).map(name => ({ name, value: statusCounts[name] }));
        const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyRev = payments.filter(p => p.paymentStatus?.toLowerCase() === 'completed').reduce((acc, p) => {
            const dateSource = p.paymentDetails?.paymentDate || p.createdAt;
            const month = new Date(dateSource).toLocaleString('en-US', { month: 'short' });
            acc[month] = (acc[month] || 0) + (Number(p.amount) || 0); return acc;
        }, {});
        const revenueData = monthOrder.filter(m => monthlyRev[m] !== undefined).map(month => ({ month, amount: monthlyRev[month] }));
        
        // Payment Method breakdown
        const bankAmount = payments.filter(p => p.paymentMethod === 'bank_transfer' && p.paymentStatus?.toLowerCase() === 'completed').reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        const cryptoAmount = payments.filter(p => p.paymentMethod === 'crypto' && p.paymentStatus?.toLowerCase() === 'completed').reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        const paymentMethodData = [
            { name: 'Bank Transfer', amount: bankAmount, fill: '#3b82f6' },
            { name: 'Cryptocurrency', amount: cryptoAmount, fill: '#C8813A' }
        ];
        
        return { totalRevenue, pendingCount, cryptoCount, statusData, revenueData, paymentMethodData };
    }, [payments]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token'); 
            const res = await axios.get(`${API_URL}/payments/admin/all`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.data?.success) setPayments(res.data.data);
        } catch (err) { toast.error("Failed to fetch payments."); } finally { setLoading(false); }
    };

    useEffect(() => { fetchPayments(); }, []);

    useEffect(() => {
        let result = payments;
        if (filterStatus !== 'all') result = result.filter(p => p.paymentStatus === filterStatus);
        if (filterMethod !== 'all') result = result.filter(p => p.paymentMethod === filterMethod);
        setFilteredPayments(result);
    }, [filterStatus, filterMethod, payments]);

    const handleStatusUpdate = async (id, status) => {
        if (!window.confirm(`Mark this payment as ${status}?`)) return;
        const loadingToast = toast.loading(`Updating...`);
        try {
            const token = localStorage.getItem('token'); 
            const res = await axios.put(`${API_URL}/payments/admin/update-status/${id}`, { status }, { headers: { Authorization: `Bearer ${token}` } });
            if (res.data.success) { toast.success(`Success!`, { id: loadingToast }); setIsModalOpen(false); fetchPayments(); }
        } catch (err) { toast.error("Update failed", { id: loadingToast }); }
    };

    const exportPDF = () => {
        const loadingToast = toast.loading('Generating PDF...');
        try {
            // Create a new window for printing
            const printWindow = window.open('', '', 'width=1000,height=800');
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Payment Report - ${new Date().toLocaleDateString()}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 30px; color: #333; }
                        .header { border-bottom: 3px solid #C8813A; padding-bottom: 20px; margin-bottom: 30px; }
                        .header h1 { margin: 0; color: #1c0f06; }
                        .header p { color: #C8813A; font-size: 12px; margin: 5px 0; }
                        .stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                        .stat-card { border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px; }
                        .stat-label { color: #999; font-size: 12px; font-weight: bold; margin-bottom: 8px; }
                        .stat-value { font-size: 28px; font-weight: bold; color: #C8813A; }
                        .section { margin-bottom: 40px; }
                        .section-title { color: #C8813A; font-size: 16px; font-weight: bold; border-bottom: 2px solid #C8813A; padding-bottom: 10px; margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th { background: linear-gradient(90deg, #C8813A, #A66A28); color: white; padding: 12px; text-align: left; font-size: 12px; font-weight: bold; }
                        td { padding: 12px; border-bottom: 1px solid #e0e0e0; font-size: 11px; }
                        tr:nth-child(even) { background: #f9f9f9; }
                        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 10px; color: #999; }
                        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: bold; }
                        .completed { background: #e6f7ed; color: #10b981; }
                        .processing { background: #fef3c7; color: #f59e0b; }
                        .pending { background: #fef2e8; color: #C8813A; }
                        .failed { background: #fee2e2; color: #ef4444; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Financial Hub - Payment Report</h1>
                        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                    </div>

                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-label">Total Revenue (Completed)</div>
                            <div class="stat-value">Rs. ${stats.totalRevenue.toLocaleString()}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Pending Approvals</div>
                            <div class="stat-value">${stats.pendingCount}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Crypto Transactions</div>
                            <div class="stat-value">${stats.cryptoCount}</div>
                        </div>
                    </div>

                    <div class="section">
                        <h3 class="section-title">Payment Method Breakdown</h3>
                        <table>
                            <tr>
                                <th>Payment Method</th>
                                <th>Total Amount</th>
                                <th>Percentage</th>
                            </tr>
                            ${stats.paymentMethodData.map(pm => `
                                <tr>
                                    <td>${pm.name}</td>
                                    <td>Rs. ${pm.amount.toLocaleString()}</td>
                                    <td>${stats.totalRevenue > 0 ? ((pm.amount / stats.totalRevenue) * 100).toFixed(2) : 0}%</td>
                                </tr>
                            `).join('')}
                        </table>
                    </div>

                    <div class="section">
                        <h3 class="section-title">Recent Transactions</h3>
                        <table>
                            <tr>
                                <th>Customer</th>
                                <th>Method</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                            ${filteredPayments.slice(0, 20).map(p => `
                                <tr>
                                    <td>${p.userId?.firstName || 'Guest'}</td>
                                    <td>${p.paymentMethod === 'crypto' ? 'Cryptocurrency' : 'Bank Transfer'}</td>
                                    <td>Rs. ${p.amount?.toLocaleString()}</td>
                                    <td><span class="badge ${p.paymentStatus?.toLowerCase()}">${p.paymentStatus}</span></td>
                                    <td>${new Date(p.createdAt).toLocaleDateString()}</td>
                                </tr>
                            `).join('')}
                        </table>
                    </div>

                    <div class="footer">
                        <p><strong>Summary:</strong> This report contains payment information as of the report generation date. For detailed transaction history and additional analysis, please contact the admin support team.</p>
                    </div>
                </body>
                </html>
            `;
            
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.focus();
            
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
                toast.success('PDF exported successfully!', { id: loadingToast });
            }, 250);
        } catch (err) {
            toast.error('Failed to export PDF', { id: loadingToast });
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-[#FDFDFD]">
            <div className="relative flex flex-col items-center gap-4">
                <div className="absolute inset-0 rounded-full bg-[#C8813A]/20 blur-3xl animate-pulse scale-150"></div>
                <Loader2 className="animate-spin text-[#C8813A] relative z-10" size={52} strokeWidth={1.5} />
                <p className="text-[#C8813A] text-xs font-mono tracking-[0.4em] uppercase relative z-10">Loading</p>
            </div>
        </div>
    );

    return (
        <div className="p-6 md:p-10 bg-[#FDFDFD] min-h-screen font-[Inter] relative overflow-x-hidden">
            <Toaster position="top-center" toastOptions={{ className: 'font-bold text-sm bg-white text-gray-800 border border-gray-200 shadow-lg' }} />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <header className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <p className="text-[#C8813A] text-[10px] font-mono uppercase tracking-[0.4em] mb-3 flex items-center gap-2">
                            <span className="inline-block w-6 h-px bg-[#C8813A]"></span> Admin Management Portal
                        </p>
                        <h2 className="text-5xl md:text-6xl font-[Playfair_Display] font-bold leading-none tracking-tighter text-gray-900">
                            Financial <span className="text-[#C8813A]">Management</span>
                        </h2>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={exportPDF}
                            className="group relative flex items-center gap-3 overflow-hidden bg-emerald-600 text-white px-7 py-3.5 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-500 text-[11px] uppercase tracking-widest">
                            <Download size={16} className="relative z-10" />
                            <span className="relative z-10">Export PDF</span>
                        </button>
                        <button onClick={() => navigate('/admin/payment-report')} 
                            className="group relative flex items-center gap-3 overflow-hidden bg-[#C8813A] text-white px-7 py-3.5 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-500 text-[11px] uppercase tracking-widest">
                            <FileBarChart size={16} className="relative z-10" />
                            <span className="relative z-10">Payment Status</span>
                        </button>
                    </div>
                </header>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
                    <div className="group relative overflow-hidden bg-white border border-emerald-100 p-7 rounded-3xl hover:border-emerald-300 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl shadow-sm">
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-4 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <TrendingUp size={28} strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500/70 mb-1.5">Total Revenue</p>
                                <h4 className="text-3xl font-black text-gray-800 leading-none tracking-tight">
                                    Rs.<span className="text-emerald-600">{stats.totalRevenue.toLocaleString()}</span>
                                </h4>
                            </div>
                        </div>
                    </div>
                    <div className="group relative overflow-hidden bg-white border border-amber-100 p-7 rounded-3xl hover:border-amber-300 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl shadow-sm">
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="bg-amber-50 border border-amber-200 text-amber-600 p-4 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <Clock size={28} strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-500/70 mb-1.5">Pending Approval</p>
                                <h4 className="text-3xl font-black text-gray-800 leading-none tracking-tight">
                                    <span className="text-amber-600">{stats.pendingCount}</span>
                                    <span className="text-sm font-bold text-gray-400 ml-1">Tasks</span>
                                </h4>
                            </div>
                        </div>
                    </div>
                    <div className="group relative overflow-hidden bg-white border border-[#C8813A]/20 p-7 rounded-3xl hover:border-[#C8813A]/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl shadow-sm">
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="bg-[#C8813A]/10 border border-[#C8813A]/20 text-[#C8813A] p-4 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <Wallet size={28} strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#C8813A]/70 mb-1.5">Crypto Volume</p>
                                <h4 className="text-3xl font-black text-gray-800 leading-none tracking-tight">
                                    <span className="text-[#C8813A]">{stats.cryptoCount}</span>
                                    <span className="text-sm font-bold text-gray-400 ml-1">Transactions</span>
                                </h4>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-12">
                    <div className="lg:col-span-2 bg-white border border-gray-100 p-7 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500">
                        <div className="flex items-center mb-7 gap-3 border-b border-gray-100 pb-4">
                            <div className="p-2 bg-[#C8813A]/10 rounded-xl border border-[#C8813A]/20">
                                <TrendingUp className="text-[#C8813A]" size={16} strokeWidth={2} />
                            </div>
                            <h3 className="font-black text-gray-400 uppercase text-[20px] tracking-[0.3em]">Revenue Growth</h3>
                        </div>
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.revenueData}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#C8813A" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#C8813A" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94a3b8'}} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `Rs.${val/1000}k`} tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#1e293b', fontWeight: 'bold', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }} />
                                    <Area type="monotone" dataKey="amount" stroke="#C8813A" fill="url(#colorRev)" strokeWidth={2.5} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-100 p-7 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500">
                        <div className="flex items-center mb-7 gap-3 border-b border-gray-100 pb-4">
                            <div className="p-2 bg-[#C8813A]/10 rounded-xl border border-[#C8813A]/20">
                                <PieIcon className="text-[#C8813A]" size={16} strokeWidth={2} />
                            </div>
                            <h3 className="font-black text-gray-400 uppercase text-[20px] tracking-[0.3em]">Status Ratio</h3>
                        </div>
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={stats.statusData} innerRadius={70} outerRadius={95} paddingAngle={6} dataKey="value" stroke="none">
                                        {stats.statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#cbd5e1'} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b', fontWeight: 'bold', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }} />
                                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', paddingTop: '14px', color: '#94a3b8'}} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Amount by Payment Method Chart */}
                <div className="bg-white border border-gray-100 p-7 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 mb-12">
                    <div className="flex items-center mb-7 gap-3 border-b border-gray-100 pb-4">
                        <div className="p-2 bg-[#C8813A]/10 rounded-xl border border-[#C8813A]/20">
                            <TrendingUp className="text-[#C8813A]" size={16} strokeWidth={2} />
                        </div>
                        <h3 className="font-black text-gray-400 uppercase text-[20px] tracking-[0.3em]">Amount by Payment Method</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.paymentMethodData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#64748b'}} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `Rs.${val/1000}k`} tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b', fontWeight: 'bold', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }} formatter={(value) => `Rs. ${value.toLocaleString()}`} />
                                <Bar dataKey="amount" fill="#C8813A" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex justify-end mb-5">
                    <div className="flex items-center gap-3 bg-white border border-gray-200 p-1.5 pl-5 pr-2 rounded-full shadow-sm">
                        <Filter size={14} className="text-[#C8813A]" />
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest focus:ring-0 cursor-pointer text-gray-500 border-r border-gray-200 pr-4 py-2 hover:text-[#C8813A] transition-colors outline-none">
                            <option value="all">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="processing">Processing</option>
                            <option value="failed">Rejected</option>
                        </select>
                        <select value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)}
                            className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest focus:ring-0 cursor-pointer text-gray-500 pl-2 pr-4 py-2 hover:text-[#C8813A] transition-colors outline-none">
                            <option value="all">All Methods</option>
                            <option value="bank_transfer">Bank</option>
                            <option value="crypto">Crypto</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-3xl overflow-hidden mb-12 hover:shadow-xl transition-all duration-500">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gradient-to-r from-[#C8813A] to-[#A66A28] text-white">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em]">Customer / ID</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em]">Amount</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-center">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredPayments.map((payment) => (
                                    <tr key={payment._id} className="hover:bg-[#C8813A]/5 transition-all duration-500 group">
                                        <td className="px-8 py-5">
                                            <div className="font-black text-gray-800 text-sm uppercase tracking-tight">{payment.userId?.firstName || "Guest"}</div>
                                            <div className="text-[9px] text-[#C8813A] font-black uppercase tracking-widest mt-1">{payment.paymentMethod}</div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="font-black text-gray-800 text-xl leading-none">{payment.amount?.toLocaleString()}<span className="text-[9px] font-bold text-gray-300 ml-1">LKR</span></div>
                                            <div className="text-[9px] font-bold text-gray-300 mt-1">{new Date(payment.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                payment.paymentStatus?.toLowerCase() === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                : payment.paymentStatus?.toLowerCase() === 'processing' ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                                : payment.paymentStatus?.toLowerCase() === 'failed' ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                : 'bg-[#C8813A]/10 text-[#C8813A] border-[#C8813A]/20'
                                            }`}>{payment.paymentStatus}</span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <button onClick={() => { setSelectedPayment(payment); setIsModalOpen(true); }} 
                                                className="p-3 bg-gray-50 border border-gray-200 text-gray-400 rounded-xl hover:bg-[#C8813A] hover:text-white hover:border-[#C8813A] hover:shadow-lg transition-all duration-500 group-hover:scale-105">
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredPayments.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-24 text-center text-gray-300 font-black uppercase text-[10px] tracking-[0.4em]">No matching records found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && selectedPayment && (
                <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-white border border-gray-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-[#C8813A]/10 to-white">
                            <div>
                                <h3 className="text-xl font-[Playfair_Display] font-bold text-gray-800 uppercase tracking-tight">
                                    {selectedPayment.paymentMethod === 'crypto' ? 'On-Chain Details' : 'Payment Receipt'}
                                </h3>
                                <p className="text-[9px] text-[#C8813A] font-mono tracking-[0.3em] uppercase mt-0.5">Admin Review Panel</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-300 hover:text-gray-700 text-2xl leading-none transition-colors w-9 h-9 flex items-center justify-center rounded-2xl hover:bg-gray-100">×</button>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-2 gap-4 mb-7">
                                {selectedPayment.paymentMethod === 'crypto' ? (
                                    <div className="p-5 bg-[#C8813A]/5 rounded-2xl border border-[#C8813A]/20 col-span-2">
                                        <span className="text-[9px] text-[#C8813A] font-black uppercase tracking-widest block mb-2">TxHash Identifier</span>
                                        <p className="text-[11px] font-mono break-all text-gray-600 leading-relaxed bg-white p-3 rounded-xl border border-[#C8813A]/10">{selectedPayment.transactionId}</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="p-5 bg-[#C8813A]/5 rounded-2xl border border-[#C8813A]/10">
                                            <span className="text-[9px] text-[#C8813A] font-black uppercase tracking-widest block mb-2">Bank</span>
                                            <p className="text-gray-800 font-black text-xs uppercase">{selectedPayment.paymentDetails?.bankName || 'N/A'}</p>
                                        </div>
                                        <div className="p-5 bg-[#C8813A]/5 rounded-2xl border border-[#C8813A]/10">
                                            <span className="text-[9px] text-[#C8813A] font-black uppercase tracking-widest block mb-2">Branch</span>
                                            <p className="text-gray-800 font-black text-xs uppercase">{selectedPayment.paymentDetails?.branch || 'N/A'}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="mb-7 flex justify-center">
                                {selectedPayment.paymentMethod === 'bank_transfer' ? (
                                    <img src={selectedPayment.receiptUrl} alt="Receipt" className="max-h-[220px] rounded-2xl border border-gray-200 shadow-lg hover:scale-[1.02] transition-transform duration-500" />
                                ) : (
                                    <div className="h-44 w-full bg-gradient-to-br from-[#C8813A]/5 to-[#C8813A]/10 rounded-2xl flex flex-col items-center justify-center border border-[#C8813A]/20 shadow-sm">
                                        <Wallet size={44} className="mb-4 text-[#C8813A] animate-pulse"/>
                                        <a href={`https://blockchain.info/tx/${selectedPayment.transactionId}`} target="_blank" className="bg-[#C8813A] text-white text-[9px] font-black px-6 py-2.5 rounded-full hover:shadow-lg transition-all uppercase tracking-widest hover:scale-105">Verify On Explorer</a>
                                    </div>
                                )}
                            </div>
                            <div className={`mb-8 p-5 rounded-2xl border-l-4 flex items-start gap-4 ${
                                selectedPayment.metadata?.adminNotes?.includes('✅') ? 'bg-emerald-50 border-emerald-400' : 'bg-amber-50 border-amber-400'
                            }`}>
                                <div className={`p-2.5 rounded-xl border ${selectedPayment.metadata?.adminNotes?.includes('✅') ? 'bg-white border-emerald-200' : 'bg-white border-amber-200'}`}>
                                    <BrainCircuit size={20} className={selectedPayment.metadata?.adminNotes?.includes('✅') ? 'text-emerald-500' : 'text-amber-500'} />
                                </div>
                                <div className="flex-1">
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-1.5">AI Scan Results</span>
                                    <p className="text-xs font-bold leading-snug text-gray-600">"{selectedPayment.metadata?.adminNotes || "Verification logic pending manual review."}"</p>
                                </div>
                            </div>
                            {['pending', 'processing'].includes(selectedPayment.paymentStatus?.toLowerCase()) && (
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => handleStatusUpdate(selectedPayment._id, 'completed')} 
                                        className="group bg-emerald-50 border border-emerald-200 text-emerald-700 py-4 rounded-full font-black hover:bg-emerald-500 hover:text-white hover:border-emerald-400 hover:shadow-lg transition-all duration-500 flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest">
                                        <CheckCircle size={16} /> Approve
                                    </button>
                                    <button onClick={() => handleStatusUpdate(selectedPayment._id, 'failed')} 
                                        className="group bg-rose-50 border border-rose-200 text-rose-700 py-4 rounded-full font-black hover:bg-rose-500 hover:text-white hover:border-rose-400 hover:shadow-lg transition-all duration-500 flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest">
                                        <XCircle size={16} /> Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPaymentPage;