import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Eye, CheckCircle, XCircle, Loader2, PieChart as PieIcon, 
    TrendingUp, Filter, FileBarChart, BrainCircuit, Clock, Wallet 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { 
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, 
    AreaChart, Area, XAxis, YAxis, CartesianGrid 
} from 'recharts';

const STATUS_COLORS = {
    COMPLETED: '#10b981',
    PROCESSING: '#f59e0b',
    PENDING: '#3b82f6',
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
    
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    // --- LOGIC: STATS & CHARTS ---
    const stats = useMemo(() => {
        if (!payments.length) return { totalRevenue: 0, pendingCount: 0, cryptoCount: 0, statusData: [], revenueData: [] };
        
        const totalRevenue = payments
            .filter(p => p.paymentStatus?.toLowerCase() === 'completed')
            .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

        const pendingCount = payments.filter(p => ['pending', 'processing'].includes(p.paymentStatus?.toLowerCase())).length;
        const cryptoCount = payments.filter(p => p.paymentMethod === 'crypto').length;

        const statusCounts = payments.reduce((acc, p) => {
            const s = (p.paymentStatus || 'pending').toUpperCase();
            acc[s] = (acc[s] || 0) + 1;
            return acc;
        }, {});
        const statusData = Object.keys(statusCounts).map(name => ({ name, value: statusCounts[name] }));

        const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyRev = payments
            .filter(p => p.paymentStatus?.toLowerCase() === 'completed')
            .reduce((acc, p) => {
                const dateSource = p.paymentDetails?.paymentDate || p.createdAt;
                const month = new Date(dateSource).toLocaleString('en-US', { month: 'short' });
                acc[month] = (acc[month] || 0) + (Number(p.amount) || 0);
                return acc;
            }, {});

        const revenueData = monthOrder
            .filter(m => monthlyRev[m] !== undefined)
            .map(month => ({ month, amount: monthlyRev[month] }));

        return { totalRevenue, pendingCount, cryptoCount, statusData, revenueData };
    }, [payments]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token'); 
            const res = await axios.get(`${API_URL}/payments/admin/all`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            if (res.data?.success) setPayments(res.data.data);
        } catch (err) {
            toast.error("Failed to fetch payments.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPayments(); }, []);

    // Double Filter Sync
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
            const res = await axios.put(`${API_URL}/payments/admin/update-status/${id}`, { status }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                toast.success(`Success!`, { id: loadingToast });
                setIsModalOpen(false); 
                fetchPayments();
            }
        } catch (err) {
            toast.error("Update failed", { id: loadingToast });
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="relative flex flex-col items-center gap-4">
                <div className="absolute inset-0 rounded-full bg-blue-200/50 blur-3xl animate-pulse scale-150"></div>
                <Loader2 className="animate-spin text-blue-500 relative z-10" size={52} strokeWidth={1.5} />
                <p className="text-blue-400 text-xs font-mono tracking-[0.4em] uppercase relative z-10">Loading</p>
            </div>
        </div>
    );

    return (
        <div className="p-6 md:p-10 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 min-h-screen font-sans relative overflow-x-hidden">
            {/* Background decorative blobs */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-100/70 blur-[120px]"></div>
                <div className="absolute top-1/2 -right-60 w-[500px] h-[500px] rounded-full bg-indigo-100/60 blur-[120px]"></div>
                <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-sky-100/70 blur-[100px]"></div>
            </div>

            <Toaster position="top-center" toastOptions={{ className: 'font-bold text-sm bg-white text-gray-800 border border-gray-200 shadow-lg' }} />

            <div className="max-w-7xl mx-auto relative z-10">

                {/* ── Header ── */}
                <header className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <p className="text-blue-400 text-[10px] font-mono uppercase tracking-[0.4em] mb-3 flex items-center gap-2">
                            <span className="inline-block w-6 h-px bg-blue-300"></span>
                            Admin Management Portal
                        </p>
                        <h2 className="text-5xl md:text-6xl font-black leading-none tracking-tighter text-gray-900">
                            Financial{' '}
                            <span className="relative">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500">
                                    Hub
                                </span>
                                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-sky-400 opacity-60 rounded-full"></span>
                            </span>
                        </h2>
                    </div>
                    <button 
                        onClick={() => navigate('/admin/payment-report')} 
                        className="group relative flex items-center gap-3 overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-7 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:scale-[1.03] transition-all duration-300 text-[11px] uppercase tracking-widest"
                    >
                        <span className="absolute inset-0 bg-white/15 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                        <FileBarChart size={16} className="relative z-10 group-hover:rotate-6 transition-transform" />
                        <span className="relative z-10">Payment Reports</span>
                    </button>
                </header>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
                    {/* Revenue */}
                    <div className="group relative overflow-hidden bg-white border border-emerald-100 p-7 rounded-3xl hover:border-emerald-300 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-100/80 shadow-sm">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100 transition-all duration-500"></div>
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
                        <div className="mt-5 h-px bg-gradient-to-r from-emerald-200 to-transparent"></div>
                    </div>

                    {/* Pending */}
                    <div className="group relative overflow-hidden bg-white border border-amber-100 p-7 rounded-3xl hover:border-amber-300 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-100/80 shadow-sm">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-50 rounded-full blur-2xl group-hover:bg-amber-100 transition-all duration-500"></div>
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
                        <div className="mt-5 h-px bg-gradient-to-r from-amber-200 to-transparent"></div>
                    </div>

                    {/* Crypto */}
                    <div className="group relative overflow-hidden bg-white border border-orange-100 p-7 rounded-3xl hover:border-orange-300 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-100/80 shadow-sm">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-50 rounded-full blur-2xl group-hover:bg-orange-100 transition-all duration-500"></div>
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="bg-orange-50 border border-orange-200 text-orange-600 p-4 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <Wallet size={28} strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-500/70 mb-1.5">Crypto Volume</p>
                                <h4 className="text-3xl font-black text-gray-800 leading-none tracking-tight">
                                    <span className="text-orange-600">{stats.cryptoCount}</span>
                                    <span className="text-sm font-bold text-gray-400 ml-1">Transactions</span>
                                </h4>
                            </div>
                        </div>
                        <div className="mt-5 h-px bg-gradient-to-r from-orange-200 to-transparent"></div>
                    </div>
                </div>

                {/* ── Charts ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-12">
                    {/* Area Chart */}
                    <div className="lg:col-span-2 bg-white border border-gray-100 p-7 rounded-3xl shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-500">
                        <div className="flex items-center mb-7 gap-3 border-b border-gray-100 pb-4">
                            <div className="p-2 bg-blue-50 rounded-xl border border-blue-100">
                                <TrendingUp className="text-blue-500" size={16} strokeWidth={2} />
                            </div>
                            <h3 className="font-black text-gray-400 uppercase text-[10px] tracking-[0.3em]">Revenue Growth</h3>
                        </div>
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.revenueData}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94a3b8'}} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `Rs.${val/1000}k`} tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#1e293b', fontWeight: 'bold', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }} />
                                    <Area type="monotone" dataKey="amount" stroke="#3b82f6" fill="url(#colorRev)" strokeWidth={2.5} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-white border border-gray-100 p-7 rounded-3xl shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-500">
                        <div className="flex items-center mb-7 gap-3 border-b border-gray-100 pb-4">
                            <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-100">
                                <PieIcon className="text-indigo-500" size={16} strokeWidth={2} />
                            </div>
                            <h3 className="font-black text-gray-400 uppercase text-[10px] tracking-[0.3em]">Status Ratio</h3>
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

                {/* ── Filters ── */}
                <div className="flex justify-end mb-5">
                    <div className="flex items-center gap-3 bg-white border border-gray-200 p-1.5 pl-5 pr-2 rounded-full shadow-sm">
                        <Filter size={14} className="text-blue-400" />
                        <select 
                            value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest focus:ring-0 cursor-pointer text-gray-500 border-r border-gray-200 pr-4 py-2 hover:text-blue-600 transition-colors"
                        >
                            <option value="all">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="processing">Processing</option>
                            <option value="failed">Rejected</option>
                        </select>
                        <select 
                            value={filterMethod} 
                            onChange={(e) => setFilterMethod(e.target.value)}
                            className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest focus:ring-0 cursor-pointer text-gray-500 pl-2 pr-4 py-2 hover:text-blue-600 transition-colors"
                        >
                            <option value="all">All Methods</option>
                            <option value="bank_transfer">Bank</option>
                            <option value="crypto">Crypto</option>
                        </select>
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="bg-white border border-blue-600 shadow-sm rounded-3xl overflow-hidden mb-12 hover:shadow-xl hover:border-blue-100 transition-all duration-500">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="border-b border-blue-500 bg-gradient-to-r from-slate-50 to-blue-50/50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Customer / ID</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Amount</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-center">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredPayments.map((payment) => (
                                    <tr key={payment._id} className="hover:bg-blue-50/40 transition-all duration-300 group">
                                        <td className="px-8 py-5">
                                            <div className="font-black text-gray-800 text-sm uppercase tracking-tight">{payment.userId?.firstName || "Guest"}</div>
                                            <div className="text-[9px] text-blue-400 font-black uppercase tracking-widest mt-1">{payment.paymentMethod}</div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="font-black text-gray-800 text-xl leading-none">
                                                {payment.amount?.toLocaleString()}
                                                <span className="text-[9px] font-bold text-gray-300 ml-1">LKR</span>
                                            </div>
                                            <div className="text-[9px] font-bold text-gray-300 mt-1">{new Date(payment.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                payment.paymentStatus?.toLowerCase() === 'completed'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                    : payment.paymentStatus?.toLowerCase() === 'processing'
                                                    ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                                    : payment.paymentStatus?.toLowerCase() === 'failed'
                                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                            }`}>
                                                {payment.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <button 
                                                onClick={() => { setSelectedPayment(payment); setIsModalOpen(true); }} 
                                                className="p-3 bg-gray-50 border border-gray-200 text-gray-400 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-500 hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 group-hover:scale-105"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredPayments.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-24 text-center text-gray-300 font-black uppercase text-[10px] tracking-[0.4em]">
                                            No matching records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Modal ── */}
            {isModalOpen && selectedPayment && (
                <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white border border-gray-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.12)] transform animate-in zoom-in-95 duration-300">
                        
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50/60 to-white">
                            <div>
                                <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">
                                    {selectedPayment.paymentMethod === 'crypto' ? 'On-Chain Details' : 'Payment Receipt'}
                                </h3>
                                <p className="text-[9px] text-blue-400 font-mono tracking-[0.3em] uppercase mt-0.5">Admin Review Panel</p>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)} 
                                className="text-gray-300 hover:text-gray-700 text-2xl leading-none transition-colors w-9 h-9 flex items-center justify-center rounded-2xl hover:bg-gray-100 border border-transparent hover:border-gray-200"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="p-8">
                            {/* Detail cells */}
                            <div className="grid grid-cols-2 gap-4 mb-7">
                                {selectedPayment.paymentMethod === 'crypto' ? (
                                    <div className="p-5 bg-orange-50 rounded-2xl border border-orange-200 col-span-2">
                                        <span className="text-[9px] text-orange-500 font-black uppercase tracking-widest block mb-2">TxHash Identifier</span>
                                        <p className="text-[11px] font-mono break-all text-gray-600 leading-relaxed bg-white p-3 rounded-xl border border-orange-100">{selectedPayment.transactionId}</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                                            <span className="text-[9px] text-blue-500 font-black uppercase tracking-widest block mb-2">Bank</span>
                                            <p className="text-gray-800 font-black text-xs uppercase">{selectedPayment.paymentDetails?.bankName || 'N/A'}</p>
                                        </div>
                                        <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                                            <span className="text-[9px] text-blue-500 font-black uppercase tracking-widest block mb-2">Branch</span>
                                            <p className="text-gray-800 font-black text-xs uppercase">{selectedPayment.paymentDetails?.branch || 'N/A'}</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Receipt / Crypto preview */}
                            <div className="mb-7 flex justify-center">
                                {selectedPayment.paymentMethod === 'bank_transfer' ? (
                                    <img src={selectedPayment.receiptUrl} alt="Receipt" className="max-h-[220px] rounded-2xl border border-gray-200 shadow-lg hover:scale-[1.02] transition-transform duration-300" />
                                ) : (
                                    <div className="h-44 w-full bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl flex flex-col items-center justify-center border border-orange-200 shadow-sm">
                                        <Wallet size={44} className="mb-4 text-orange-400 animate-pulse"/>
                                        <a href={`https://blockchain.info/tx/${selectedPayment.transactionId}`} target="_blank" className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-black px-6 py-2.5 rounded-full hover:shadow-lg hover:shadow-orange-200 transition-all uppercase tracking-widest hover:scale-105">
                                            Verify On Explorer
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* AI Scan */}
                            <div className={`mb-8 p-5 rounded-2xl border-l-4 flex items-start gap-4 ${
                                selectedPayment.metadata?.adminNotes?.includes('✅') 
                                    ? 'bg-emerald-50 border-emerald-400' 
                                    : 'bg-amber-50 border-amber-400'
                            }`}>
                                <div className={`p-2.5 rounded-xl border ${
                                    selectedPayment.metadata?.adminNotes?.includes('✅')
                                        ? 'bg-white border-emerald-200'
                                        : 'bg-white border-amber-200'
                                }`}>
                                    <BrainCircuit size={20} className={selectedPayment.metadata?.adminNotes?.includes('✅') ? 'text-emerald-500' : 'text-amber-500'} />
                                </div>
                                <div className="flex-1">
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-1.5">AI Scan Results</span>
                                    <p className="text-xs font-bold leading-snug text-gray-600">"{selectedPayment.metadata?.adminNotes || "Verification logic pending manual review."}"</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {['pending', 'processing'].includes(selectedPayment.paymentStatus?.toLowerCase()) && (
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => handleStatusUpdate(selectedPayment._id, 'completed')} 
                                        className="group bg-emerald-50 border border-emerald-200 text-emerald-700 py-4 rounded-2xl font-black hover:bg-emerald-500 hover:text-white hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-200 transition-all duration-300 flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest"
                                    >
                                        <CheckCircle size={16} className="group-hover:rotate-6 transition-transform" /> 
                                        Approve
                                    </button>
                                    <button 
                                        onClick={() => handleStatusUpdate(selectedPayment._id, 'failed')} 
                                        className="group bg-rose-50 border border-rose-200 text-rose-700 py-4 rounded-2xl font-black hover:bg-rose-500 hover:text-white hover:border-rose-400 hover:shadow-lg hover:shadow-rose-200 transition-all duration-300 flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest"
                                    >
                                        <XCircle size={16} className="group-hover:rotate-6 transition-transform" /> 
                                        Reject
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