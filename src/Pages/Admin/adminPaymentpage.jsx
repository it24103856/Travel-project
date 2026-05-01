import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Eye, CheckCircle, XCircle, Loader2, PieChart as PieIcon, 
    TrendingUp, Filter, FileBarChart, BrainCircuit, Clock, Wallet, Download, RotateCcw, Trash2,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { 
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar
} from 'recharts';
import MonthlyPerformanceSummary from '../../components/MonthlyPerformanceSummary.jsx';

// ── Status colors — ALL statuses covered ────────────────────────────────────
const STATUS_COLORS = {
    COMPLETED:        '#10b981',   // emerald
    PROCESSING:       '#f59e0b',   // amber
    PENDING:          '#6366F1',   // brand indigo
    FAILED:           '#ef4444',   // red
    CANCEL_REQUESTED: '#8b5cf6',   // purple
    REFUNDED:         '#06b6d4',   // cyan
};

const AdminPaymentPage = () => {
    const [payments, setPayments]               = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [filterStatus, setFilterStatus]       = useState('all');
    const [filterMethod, setFilterMethod]       = useState('all');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isModalOpen, setIsModalOpen]         = useState(false);
    const [loading, setLoading]                 = useState(true);
    // Cancel request modal
    const [cancelModal, setCancelModal]         = useState(false);
    const [cancelPayment, setCancelPayment]     = useState(null);
    const [cancelLoading, setCancelLoading]     = useState(false);
    // Delete modal
    const [deleteModal, setDeleteModal]         = useState(false);
    const [deletePayment, setDeletePayment]     = useState(null);
    const [deleteLoading, setDeleteLoading]     = useState(false);
    const [deleteSuccess, setDeleteSuccess]     = useState(false);

    const reportRef = useRef(null);
    const navigate  = useNavigate();
    const API_URL   = import.meta.env.VITE_BACKEND_URL;
    const authHeader = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    // ── Stats ────────────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        if (!payments.length) return { totalRevenue: 0, pendingCount: 0, cryptoCount: 0, cancelRequestCount: 0, statusData: [], revenueData: [], paymentMethodData: [], monthlySummary: null };

        const totalRevenue   = payments.filter(p => p.paymentStatus?.toLowerCase() === 'completed').reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        const pendingCount   = payments.filter(p => ['pending', 'processing'].includes(p.paymentStatus?.toLowerCase())).length;
        const cryptoCount    = payments.filter(p => p.paymentMethod === 'crypto').length;
        const cancelRequestCount = payments.filter(p => p.paymentStatus?.toLowerCase() === 'cancel_requested').length;

        // Status pie chart — normalise keys to UPPER
        const statusCounts = payments.reduce((acc, p) => {
            const s = (p.paymentStatus || 'pending').toUpperCase();
            acc[s] = (acc[s] || 0) + 1;
            return acc;
        }, {});
        const statusData = Object.keys(statusCounts).map(name => ({ name, value: statusCounts[name] }));

        // Monthly revenue
        const monthOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const monthlyRev = payments
            .filter(p => p.paymentStatus?.toLowerCase() === 'completed')
            .reduce((acc, p) => {
                const month = new Date(p.paymentDetails?.paymentDate || p.createdAt).toLocaleString('en-US', { month: 'short' });
                acc[month] = (acc[month] || 0) + (Number(p.amount) || 0);
                return acc;
            }, {});
        const revenueData = monthOrder.filter(m => monthlyRev[m]).map(month => ({ month, amount: monthlyRev[month] }));

        const revenueByMonth = monthOrder.map(month => ({
            month,
            amount: monthlyRev[month] || 0,
        }));

        const currentMonthIndex = new Date().getMonth();
        const previousMonthIndex = (currentMonthIndex + 11) % 12;
        const currentMonthName = monthOrder[currentMonthIndex];
        const previousMonthName = monthOrder[previousMonthIndex];
        const currentMonthRevenue = revenueByMonth[currentMonthIndex]?.amount || 0;
        const previousMonthRevenue = revenueByMonth[previousMonthIndex]?.amount || 0;
        const monthlyGrowth = previousMonthRevenue === 0
            ? (currentMonthRevenue > 0 ? 100 : 0)
            : ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;

        const bestMonthEntry = revenueByMonth.reduce((best, entry) => entry.amount > best.amount ? entry : best, revenueByMonth[0] || { month: currentMonthName, amount: 0 });
        const averageMonthlyRevenue = revenueByMonth.reduce((sum, entry) => sum + entry.amount, 0) / 12;
        const completedPayments = payments.filter(p => p.paymentStatus?.toLowerCase() === 'completed').length;
        const completionRate = payments.length ? (completedPayments / payments.length) * 100 : 0;

        const monthlySummary = {
            currentMonthName,
            previousMonthName,
            currentMonthRevenue,
            previousMonthRevenue,
            monthlyGrowth,
            bestMonth: bestMonthEntry,
            averageMonthlyRevenue,
            completedPayments,
            completionRate,
            revenueByMonth,
        };

        // Payment method breakdown
        const bankAmount   = payments.filter(p => p.paymentMethod === 'bank_transfer' && p.paymentStatus?.toLowerCase() === 'completed').reduce((s, p) => s + (Number(p.amount) || 0), 0);
        const cryptoAmount = payments.filter(p => p.paymentMethod === 'crypto'         && p.paymentStatus?.toLowerCase() === 'completed').reduce((s, p) => s + (Number(p.amount) || 0), 0);
        const paymentMethodData = [
            { name: 'Bank Transfer',   amount: bankAmount,   fill: '#3b82f6' },
            { name: 'Cryptocurrency',  amount: cryptoAmount, fill: '#fb923c' },
        ];

        return { totalRevenue, pendingCount, cryptoCount, cancelRequestCount, statusData, revenueData, paymentMethodData, monthlySummary };
    }, [payments]);

    // ── Fetch ────────────────────────────────────────────────────────────────
    const fetchPayments = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/payments/admin/all`, { headers: authHeader });
            if (res.data?.success) setPayments(res.data.data);
        } catch { toast.error("Failed to fetch payments."); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchPayments(); }, []);

    // ── Filters ──────────────────────────────────────────────────────────────
    useEffect(() => {
        let result = payments;
        if (filterStatus !== 'all') result = result.filter(p => p.paymentStatus === filterStatus);
        if (filterMethod !== 'all') result = result.filter(p => p.paymentMethod === filterMethod);
        setFilteredPayments(result);
    }, [filterStatus, filterMethod, payments]);

    // ── Approve / Reject payment (processing/pending) ────────────────────────
    const handleStatusUpdate = async (id, status) => {
        if (!window.confirm(`Mark this payment as ${status}?`)) return;
        const t = toast.loading('Updating...');
        try {
            const res = await axios.put(`${API_URL}/payments/admin/update-status/${id}`, { status }, { headers: authHeader });
            if (res.data.success) { toast.success('Success!', { id: t }); setIsModalOpen(false); fetchPayments(); }
        } catch { toast.error('Update failed', { id: t }); }
    };

    // ── Approve / Reject cancel request ──────────────────────────────────────
    const handleCancelDecision = async (decision) => {
        // decision: 'refunded' | 'completed' (reject the cancel → keep completed)
        setCancelLoading(true);
        const t = toast.loading(decision === 'refunded' ? 'Approving refund...' : 'Rejecting cancel request...');
        try {
            const res = await axios.put(
                `${API_URL}/payments/admin/approve-cancel`,
                { paymentId: cancelPayment._id, status: decision },
                { headers: authHeader }
            );
            if (res.data.success) {
                toast.success(decision === 'refunded' ? '✅ Refund approved!' : '❌ Cancel request rejected.', { id: t });
                setCancelModal(false);
                setCancelPayment(null);
                setIsModalOpen(false);
                fetchPayments();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed.', { id: t });
        } finally {
            setCancelLoading(false);
        }
    };

    // ── Delete payment ───────────────────────────────────────────────────────
    const handleDeletePayment = async () => {
        setDeleteLoading(true);
        const t = toast.loading('Deleting payment...');
        try {
            const res = await axios.delete(
                `${API_URL}/payments/admin/delete/${deletePayment._id}`,
                { headers: authHeader }
            );
            if (res.data.success) {
                toast.dismiss(t);
                setDeleteModal(false);
                setDeleteSuccess(true);
                setDeletePayment(null);
                setIsModalOpen(false);
                fetchPayments();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete payment.', { id: t });
        } finally {
            setDeleteLoading(false);
        }
    };

    // ── Export PDF ───────────────────────────────────────────────────────────
    const exportPDF = () => {
        const t = toast.loading('Generating PDF...');
        try {
            const win = window.open('', '', 'width=1000,height=800');
            win.document.write(`<!DOCTYPE html><html><head><title>Payment Report</title>
            <style>
                body{font-family:Arial,sans-serif;margin:30px;color:#333}
                .header{border-bottom:3px solid #C8813A;padding-bottom:20px;margin-bottom:30px}
                .header h1{margin:0;color:#1c0f06}.header p{color:#C8813A;font-size:12px;margin:5px 0}
                .stats-grid{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:20px;margin-bottom:30px}
                .stat-card{border:1px solid #e0e0e0;padding:20px;border-radius:8px}
                .stat-label{color:#999;font-size:12px;font-weight:bold;margin-bottom:8px}
                .stat-value{font-size:24px;font-weight:bold;color:#C8813A}
                table{width:100%;border-collapse:collapse;margin-bottom:20px}
                th{background:linear-gradient(90deg,#C8813A,#A66A28);color:white;padding:12px;text-align:left;font-size:12px}
                td{padding:12px;border-bottom:1px solid #e0e0e0;font-size:11px}
                tr:nth-child(even){background:#f9f9f9}
                .badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:10px;font-weight:bold}
                .completed{background:#e6f7ed;color:#10b981}.processing{background:#fef3c7;color:#f59e0b}
                .pending{background:#fef2e8;color:#C8813A}.failed{background:#fee2e2;color:#ef4444}
                .cancel_requested{background:#ede9fe;color:#8b5cf6}.refunded{background:#cffafe;color:#06b6d4}
                .footer{margin-top:30px;padding-top:20px;border-top:1px solid #e0e0e0;font-size:10px;color:#999}
            </style></head><body>
            <div class="header"><h1>Financial Hub — Payment Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p></div>
            <div class="stats-grid">
                <div class="stat-card"><div class="stat-label">Total Revenue</div><div class="stat-value">Rs. ${stats.totalRevenue.toLocaleString()}</div></div>
                <div class="stat-card"><div class="stat-label">Pending Approvals</div><div class="stat-value">${stats.pendingCount}</div></div>
                <div class="stat-card"><div class="stat-label">Crypto Transactions</div><div class="stat-value">${stats.cryptoCount}</div></div>
                <div class="stat-card"><div class="stat-label">Cancel Requests</div><div class="stat-value">${stats.cancelRequestCount}</div></div>
            </div>
            <h3 style="color:#C8813A;border-bottom:2px solid #C8813A;padding-bottom:8px">Recent Transactions</h3>
            <table><tr><th>Payment ID</th><th>Booking ID</th><th>Customer</th><th>Method</th><th>Amount</th><th>Status</th><th>Date</th></tr>
            ${filteredPayments.slice(0, 20).map(p => `<tr>
                <td>${p._id?.slice(-8).toUpperCase() || 'N/A'}</td>
                <td>${p.bookingId ? p.bookingId._id?.slice(-8).toUpperCase() : 'No Booking'}</td>
                <td>${p.userId?.firstName || 'Guest'}</td>
                <td>${p.paymentMethod === 'crypto' ? 'Cryptocurrency' : 'Bank Transfer'}</td>
                <td>Rs. ${p.amount?.toLocaleString()}</td>
                <td><span class="badge ${p.paymentStatus?.toLowerCase()}">${p.paymentStatus}</span></td>
                <td>${new Date(p.createdAt).toLocaleDateString()}</td>
            </tr>`).join('')}
            </table>
            <div class="footer"><p>This report was auto-generated. Contact admin support for detailed analysis.</p></div>
            </body></html>`);
            win.document.close();
            setTimeout(() => { win.print(); win.close(); toast.success('PDF exported!', { id: t }); }, 250);
        } catch { toast.error('Export failed', { id: t }); }
    };

    // ── Row status style helper ───────────────────────────────────────────────
    const rowStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'processing':       return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'failed':           return 'bg-rose-50 text-rose-700 border-rose-200';
            case 'cancel_requested': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'refunded':         return 'bg-cyan-50 text-cyan-700 border-cyan-200';
            default:                 return 'bg-orange-50 text-[#C8813A] border-[#C8813A]/20';
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-[#FDFDFD]">
            <div className="relative flex flex-col items-center gap-4">
                <div className="absolute inset-0 rounded-full bg-[#C8813A]/20 blur-3xl animate-pulse scale-150" />
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
                        <p className="text-[#6366F1] text-[10px] font-mono uppercase tracking-[0.4em] mb-3 flex items-center gap-2">
                            <span className="inline-block w-6 h-px bg-[#6366F1]" /> Admin Management Portal
                        </p>
                        <h2 className="text-5xl md:text-6xl font-[Playfair_Display] font-bold leading-none tracking-tighter text-gray-900">
                            Financial <span className="text-[#6366F1]">Management</span>
                        </h2>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={exportPDF}
                            className="flex items-center gap-3 bg-emerald-600 text-white px-7 py-3.5 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-500 text-[11px] uppercase tracking-widest">
                            <Download size={16} /> Export PDF
                        </button>
                        <button onClick={() => navigate('/admin/payment-report')}
                            className="flex items-center gap-3 bg-[#6366F1] text-white px-7 py-3.5 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-500 text-[11px] uppercase tracking-widest">
                            <FileBarChart size={16} /> Payment Status
                        </button>
                    </div>
                </header>

                {/* Stat Cards — 4 cards, cancel requests added */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
                    {/* Total Revenue */}
                    <div className="group relative overflow-hidden bg-white border border-emerald-100 p-7 rounded-3xl hover:border-emerald-300 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl shadow-sm">
                        <div className="flex items-center gap-5">
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                <TrendingUp size={24} strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/70 mb-1">Total Revenue</p>
                                <h4 className="text-2xl font-black text-gray-800 leading-none">Rs.<span className="text-emerald-600">{stats.totalRevenue.toLocaleString()}</span></h4>
                            </div>
                        </div>
                    </div>
                    {/* Pending */}
                    <div className="group relative overflow-hidden bg-white border border-amber-100 p-7 rounded-3xl hover:border-amber-300 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl shadow-sm">
                        <div className="flex items-center gap-5">
                            <div className="bg-amber-50 border border-amber-200 text-amber-600 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                <Clock size={24} strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/70 mb-1">Pending Approval</p>
                                <h4 className="text-2xl font-black text-gray-800"><span className="text-amber-600">{stats.pendingCount}</span><span className="text-sm font-bold text-gray-400 ml-1">Tasks</span></h4>
                            </div>
                        </div>
                    </div>
                    {/* Cancel Requests — NEW */}
                    <div className="group relative overflow-hidden bg-white border border-purple-100 p-7 rounded-3xl hover:border-purple-300 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl shadow-sm">
                        <div className="flex items-center gap-5">
                            <div className="bg-purple-50 border border-purple-200 text-purple-600 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                <RotateCcw size={24} strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500/70 mb-1">Cancel Requests</p>
                                <h4 className="text-2xl font-black text-gray-800"><span className="text-purple-600">{stats.cancelRequestCount}</span><span className="text-sm font-bold text-gray-400 ml-1">Pending</span></h4>
                            </div>
                        </div>
                    </div>
                    {/* Crypto */}
                    <div className="group relative overflow-hidden bg-white border border-[#6366F1]/20 p-7 rounded-3xl hover:border-[#6366F1]/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl shadow-sm">
                        <div className="flex items-center gap-5">
                            <div className="bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#6366F1] p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                <Wallet size={24} strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6366F1]/70 mb-1">Crypto Volume</p>
                                <h4 className="text-2xl font-black text-gray-800"><span className="text-[#6366F1]">{stats.cryptoCount}</span><span className="text-sm font-bold text-gray-400 ml-1">Txns</span></h4>
                            </div>
                        </div>
                    </div>
                </div>
                <MonthlyPerformanceSummary
                    monthlyData={[
                        { month: 'April 2026', revenue: 122692, transactions: 6, growth: 513.5, tone: 'positive' },
                        { month: 'August 2020', revenue: 20000, transactions: 2, growth: -83.7, tone: 'negative' },
                    ]}
                />

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-12">
                    {/* Revenue Area Chart */}
                    <div className="lg:col-span-2 bg-white border border-gray-100 p-7 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500">
                        <div className="flex items-center mb-7 gap-3 border-b border-gray-100 pb-4">
                            <div className="p-2 bg-[#6366F1]/10 rounded-xl border border-[#6366F1]/20">
                                <TrendingUp className="text-[#6366F1]" size={16} />
                            </div>
                            <h3 className="font-black text-gray-400 uppercase text-[20px] tracking-[0.3em]">Revenue Growth</h3>
                        </div>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.revenueData}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize:10,fontWeight:800,fill:'#94a3b8'}} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={v=>`Rs.${v/1000}k`} tick={{fontSize:10,fontWeight:600,fill:'#94a3b8'}} />
                                    <Tooltip contentStyle={{borderRadius:'16px',border:'1px solid #e2e8f0',background:'#fff',fontWeight:'bold',boxShadow:'0 10px 40px rgba(0,0,0,0.08)'}} />
                                    <Area type="monotone" dataKey="amount" stroke="#6366F1" fill="url(#colorRev)" strokeWidth={2.5} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Status Pie Chart — now shows all statuses with correct colors */}
                    <div className="bg-white border border-gray-100 p-7 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500">
                        <div className="flex items-center mb-7 gap-3 border-b border-gray-100 pb-4">
                            <div className="p-2 bg-[#6366F1]/10 rounded-xl border border-[#6366F1]/20">
                                <PieIcon className="text-[#6366F1]" size={16} />
                            </div>
                            <h3 className="font-black text-gray-400 uppercase text-[20px] tracking-[0.3em]">Status Ratio</h3>
                        </div>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={stats.statusData} innerRadius={65} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                                        {stats.statusData.map((entry, i) => (
                                            <Cell key={i} fill={STATUS_COLORS[entry.name] || '#cbd5e1'} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{borderRadius:'12px',border:'1px solid #e2e8f0',background:'#fff',fontWeight:'bold',boxShadow:'0 10px 30px rgba(0,0,0,0.08)'}}
                                        formatter={(value, name) => [value, name.replace('_', ' ')]}
                                    />
                                    <Legend
                                        verticalAlign="bottom" height={36}
                                        formatter={(value) => value.replace('_', ' ')}
                                        wrapperStyle={{fontSize:'9px',fontWeight:'800',textTransform:'uppercase',paddingTop:'14px',color:'#94a3b8'}}
                                        iconType="circle"
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Payment Method Bar Chart */}
                <div className="bg-white border border-gray-100 p-7 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 mb-12">
                    <div className="flex items-center mb-7 gap-3 border-b border-gray-100 pb-4">
                        <div className="p-2 bg-[#6366F1]/10 rounded-xl border border-[#6366F1]/20">
                            <TrendingUp className="text-[#6366F1]" size={16} />
                        </div>
                        <h3 className="font-black text-gray-400 uppercase text-[20px] tracking-[0.3em]">Amount by Payment Method</h3>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.paymentMethodData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:11,fontWeight:700,fill:'#64748b'}} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={v=>`Rs.${v/1000}k`} tick={{fontSize:10,fontWeight:600,fill:'#94a3b8'}} />
                                <Tooltip contentStyle={{borderRadius:'12px',border:'1px solid #e2e8f0',background:'#fff',fontWeight:'bold'}} formatter={v=>`Rs. ${v.toLocaleString()}`} />
                                <Bar dataKey="amount" fill="#6366F1" radius={[8,8,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex justify-end mb-5">
                    <div className="flex items-center gap-3 bg-white border border-gray-200 p-1.5 pl-5 pr-2 rounded-full shadow-sm">
                        <Filter size={14} className="text-[#6366F1]" />
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                            className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest focus:ring-0 cursor-pointer text-gray-500 border-r border-gray-200 pr-4 py-2 outline-none hover:text-[#6366F1] transition-colors">
                            <option value="all">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="processing">Processing</option>
                            <option value="cancel_requested">Cancel Requested</option>
                            <option value="refunded">Refunded</option>
                            <option value="failed">Rejected</option>
                        </select>
                        <select value={filterMethod} onChange={e => setFilterMethod(e.target.value)}
                            className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest focus:ring-0 cursor-pointer text-gray-500 pl-2 pr-4 py-2 outline-none hover:text-[#6366F1] transition-colors">
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
                            <thead className="bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em]">Payment ID</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em]">Booking ID</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em]">Customer / Method</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em]">Amount</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-center">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredPayments.map((payment) => (
                                    <tr key={payment._id} className="hover:bg-[#6366F1]/5 transition-all duration-300 group">
                                        {/* Payment ID */}
                                        <td className="px-8 py-5">
                                            <div className="font-mono text-sm font-black text-black tracking-tight bg-gray-100 px-4 py-2 rounded-lg w-fit">
                                                {payment._id?.slice(-8).toUpperCase() || 'N/A'}
                                            </div>
                                            <div className="text-xs text-black font-bold mt-2">{payment._id || 'No ID'}</div>
                                        </td>
                                        {/* Booking ID */}
                                        <td className="px-8 py-5">
                                            {payment.bookingId ? (
                                                <>
                                                    <div className="font-mono text-sm font-black text-black tracking-tight bg-gray-100 px-4 py-2 rounded-lg w-fit">
                                                        {payment.bookingId._id?.slice(-8).toUpperCase() || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-black font-bold mt-2">
                                                        Status: <span className="font-bold uppercase">{payment.bookingId.status || 'Pending'}</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-sm font-bold text-gray-400 italic">No Booking</div>
                                            )}
                                        </td>
                                        {/* Customer / Method */}
                                        <td className="px-8 py-5">
                                            <div className="font-black text-gray-800 text-sm uppercase tracking-tight">{payment.userId?.firstName || 'Guest'}</div>
                                            <div className="text-[9px] text-[#6366F1] font-black uppercase tracking-widest mt-1">{payment.paymentMethod?.replace('_',' ')}</div>
                                        </td>
                                        {/* Amount */}
                                        <td className="px-8 py-5">
                                            <div className="font-black text-gray-800 text-xl leading-none">{payment.amount?.toLocaleString()}<span className="text-[9px] font-bold text-gray-300 ml-1">LKR</span></div>
                                            <div className="text-[9px] font-bold text-gray-300 mt-1">{new Date(payment.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        {/* Status */}
                                        <td className="px-8 py-5 text-center">
                                            <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${rowStatusStyle(payment.paymentStatus)}`}>
                                                {payment.paymentStatus?.replace('_',' ')}
                                            </span>
                                        </td>
                                        {/* Actions */}
                                        <td className="px-8 py-5 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* Quick approve refund button — visible only for cancel_requested */}
                                                {payment.paymentStatus === 'cancel_requested' && (
                                                    <button
                                                        onClick={() => { setCancelPayment(payment); setCancelModal(true); }}
                                                        title="Review Cancel Request"
                                                        className="p-3 bg-purple-50 border border-purple-200 text-purple-600 rounded-xl hover:bg-purple-600 hover:text-white hover:border-purple-600 hover:shadow-lg transition-all duration-300">
                                                        <RotateCcw size={15} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => { setSelectedPayment(payment); setIsModalOpen(true); }}
                                                    className="p-3 bg-gray-50 border border-gray-200 text-gray-400 rounded-xl hover:bg-[#6366F1] hover:text-white hover:border-[#6366F1] hover:shadow-lg transition-all duration-300"
                                                    title="View Details">
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => { setDeletePayment(payment); setDeleteModal(true); }}
                                                    className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-lg transition-all duration-300"
                                                    title="Delete Payment">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredPayments.length === 0 && (
                                    <tr><td colSpan="6" className="px-8 py-24 text-center text-gray-300 font-black uppercase text-[10px] tracking-[0.4em]">No matching records found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Cancel Request Review Modal ───────────────────────────────────── */}
            {cancelModal && cancelPayment && (
                <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white border border-gray-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-purple-50 to-white">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 uppercase tracking-tight flex items-center gap-2">
                                    <RotateCcw className="text-purple-600" size={18} /> Refund Request
                                </h3>
                                <p className="text-[9px] text-purple-500 font-mono tracking-[0.3em] uppercase mt-0.5">Customer Cancel Request</p>
                            </div>
                            <button onClick={() => { setCancelModal(false); setCancelPayment(null); }}
                                className="text-gray-300 hover:text-gray-700 text-2xl w-9 h-9 flex items-center justify-center rounded-2xl hover:bg-gray-100 transition-colors">×</button>
                        </div>
                        <div className="p-8 space-y-5">
                            {/* Amount */}
                            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 text-center">
                                <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1">Refund Amount</p>
                                <p className="text-4xl font-black text-gray-800">{cancelPayment.amount?.toLocaleString()} <span className="text-lg text-gray-400 font-bold">{cancelPayment.currency}</span></p>
                            </div>

                            {/* Customer info */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Customer</p>
                                    <p className="font-black text-gray-700">{cancelPayment.userId?.firstName || 'Guest'}</p>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Method</p>
                                    <p className="font-black text-gray-700 capitalize">{cancelPayment.paymentMethod?.replace('_',' ')}</p>
                                </div>
                            </div>

                            {/* Cancel reason */}
                            {cancelPayment.metadata?.cancelReason && (
                                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                                    <BrainCircuit className="text-amber-500 flex-shrink-0 mt-0.5" size={16} />
                                    <div>
                                        <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1">Customer Reason</p>
                                        <p className="text-xs text-amber-800 font-medium leading-relaxed">"{cancelPayment.metadata.cancelReason}"</p>
                                    </div>
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                {/* Approve Refund */}
                                <button
                                    onClick={() => handleCancelDecision('refunded')}
                                    disabled={cancelLoading}
                                    className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 py-4 rounded-full font-black hover:bg-emerald-500 hover:text-white hover:border-emerald-500 hover:shadow-lg transition-all duration-300 text-[10px] uppercase tracking-widest disabled:opacity-60"
                                >
                                    {cancelLoading ? <Loader2 size={14} className="animate-spin" /> : <><CheckCircle size={14} /> Approve Refund</>}
                                </button>
                                {/* Reject Cancel */}
                                <button
                                    onClick={() => handleCancelDecision('completed')}
                                    disabled={cancelLoading}
                                    className="flex items-center justify-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 py-4 rounded-full font-black hover:bg-rose-500 hover:text-white hover:border-rose-500 hover:shadow-lg transition-all duration-300 text-[10px] uppercase tracking-widest disabled:opacity-60"
                                >
                                    <XCircle size={14} /> Reject Request
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation Modal ──────────────────────────────────────── */}
            {deleteModal && deletePayment && (
                <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white border border-gray-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
                        <div className="p-8 space-y-5 flex flex-col items-center text-center">
                            {/* Warning Icon */}
                            <div className="w-20 h-20 rounded-full border-[3px] border-[#6366F1] flex items-center justify-center mb-4">
                                <p className="text-4xl font-black text-[#6366F1]">!</p>
                            </div>

                            {/* Question Text */}
                            <h3 className="text-3xl font-bold text-gray-800 mb-3">Are you sure?</h3>
                            <p className="text-base text-gray-600 font-medium leading-relaxed">
                                This message will be permanently deleted!
                            </p>

                            {/* Action Buttons */}
                            <div className="flex gap-4 w-full mt-6">
                                {/* Cancel Button */}
                                <button
                                    onClick={() => { setDeleteModal(false); setDeletePayment(null); }}
                                    disabled={deleteLoading}
                                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition-all duration-300 text-base uppercase tracking-wide disabled:opacity-60">
                                    Cancel
                                </button>
                                {/* Confirm Delete Button */}
                                <button
                                    onClick={handleDeletePayment}
                                    disabled={deleteLoading}
                                    className="flex-1 bg-[#6366F1] hover:bg-[#4F46E5] text-white py-3 rounded-lg font-bold transition-all duration-300 text-base uppercase tracking-wide disabled:opacity-60">
                                    {deleteLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Yes, delete it!' }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Success Modal ───────────────────────────────────────────── */}
            {deleteSuccess && (
                <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white border border-gray-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
                        <div className="p-8 space-y-5 flex flex-col items-center text-center">
                            {/* Success Icon */}
                            <div className="w-20 h-20 rounded-full border-[3px] border-emerald-400 flex items-center justify-center mb-4">
                                <CheckCircle size={48} className="text-emerald-400" />
                            </div>

                            {/* Success Text */}
                            <h3 className="text-3xl font-bold text-gray-800 mb-3">Deleted!</h3>
                            <p className="text-base text-gray-600 font-medium leading-relaxed">
                                The message has been deleted.
                            </p>

                            {/* OK Button */}
                            <button
                                onClick={() => setDeleteSuccess(false)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-all duration-300 text-base uppercase tracking-wide mt-6">
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Payment Detail Modal ──────────────────────────────────────────── */}
            {isModalOpen && selectedPayment && (
                <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-white border border-gray-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-[#6366F1]/10 to-white">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 uppercase tracking-tight">
                                    {selectedPayment.paymentMethod === 'crypto' ? 'On-Chain Details' : 'Payment Receipt'}
                                </h3>
                                <p className="text-[9px] text-[#6366F1] font-mono tracking-[0.3em] uppercase mt-0.5">Admin Review Panel</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-300 hover:text-gray-700 text-2xl w-9 h-9 flex items-center justify-center rounded-2xl hover:bg-gray-100 transition-colors">×</button>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-2 gap-4 mb-7">
                                {/* Payment ID */}
                                <div className="p-5 bg-gray-100 rounded-2xl border border-gray-200">
                                    <span className="text-sm font-black text-black uppercase tracking-widest block mb-2">Payment ID</span>
                                    <p className="text-gray-800 font-mono text-xs break-all font-bold">{selectedPayment._id}</p>
                                </div>
                                {/* Booking ID */}
                                <div className="p-5 bg-gray-100 rounded-2xl border border-gray-200">
                                    {selectedPayment.bookingId ? (
                                        <>
                                            <span className="text-sm font-black text-black uppercase tracking-widest block mb-2">Booking ID</span>
                                            <p className="text-gray-800 font-mono text-xs break-all font-bold mb-1.5">{selectedPayment.bookingId._id}</p>
                                            <span className="inline-block bg-gray-200 text-black text-xs font-bold px-2 py-1 rounded-full uppercase tracking-widest">
                                                Status: {selectedPayment.bookingId.status}
                                            </span>
                                        </>
                                    ) : (
                                        <div className="text-gray-500 text-sm italic font-bold">No associated booking</div>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-7">
                                {selectedPayment.paymentMethod === 'crypto' ? (
                                    <div className="p-5 bg-[#6366F1]/5 rounded-2xl border border-[#6366F1]/20 col-span-2">
                                        <span className="text-[9px] text-[#6366F1] font-black uppercase tracking-widest block mb-2">TxHash Identifier</span>
                                        <p className="text-[11px] font-mono break-all text-gray-600 bg-white p-3 rounded-xl border border-[#6366F1]/10">{selectedPayment.transactionId}</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="p-5 bg-[#6366F1]/5 rounded-2xl border border-[#6366F1]/10">
                                            <span className="text-[9px] text-[#6366F1] font-black uppercase tracking-widest block mb-2">Bank</span>
                                            <p className="text-gray-800 font-black text-xs uppercase">{selectedPayment.paymentDetails?.bankName || 'N/A'}</p>
                                        </div>
                                        <div className="p-5 bg-[#6366F1]/5 rounded-2xl border border-[#6366F1]/10">
                                            <span className="text-[9px] text-[#6366F1] font-black uppercase tracking-widest block mb-2">Branch</span>
                                            <p className="text-gray-800 font-black text-xs uppercase">{selectedPayment.paymentDetails?.branch || 'N/A'}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="mb-7 flex justify-center">
                                {selectedPayment.paymentMethod === 'bank_transfer' ? (
                                    <img src={selectedPayment.receiptUrl} alt="Receipt" className="max-h-[220px] rounded-2xl border border-gray-200 shadow-lg hover:scale-[1.02] transition-transform duration-500" />
                                ) : (
                                    <div className="h-44 w-full bg-gradient-to-br from-[#6366F1]/5 to-[#6366F1]/10 rounded-2xl flex flex-col items-center justify-center border border-[#6366F1]/20">
                                        <Wallet size={44} className="mb-4 text-[#6366F1] animate-pulse"/>
                                        <a href={`https://blockchain.info/tx/${selectedPayment.transactionId}`} target="_blank" rel="noreferrer"
                                            className="bg-[#6366F1] text-white text-[9px] font-black px-6 py-2.5 rounded-full hover:shadow-lg transition-all uppercase tracking-widest hover:scale-105">
                                            Verify On Explorer
                                        </a>
                                    </div>
                                )}
                            </div>
                            <div className={`mb-8 p-5 rounded-2xl border-l-4 flex items-start gap-4 ${selectedPayment.metadata?.adminNotes?.includes('✅') ? 'bg-emerald-50 border-emerald-400' : 'bg-amber-50 border-amber-400'}`}>
                                <div className={`p-2.5 rounded-xl border ${selectedPayment.metadata?.adminNotes?.includes('✅') ? 'bg-white border-emerald-200' : 'bg-white border-amber-200'}`}>
                                    <BrainCircuit size={20} className={selectedPayment.metadata?.adminNotes?.includes('✅') ? 'text-emerald-500' : 'text-amber-500'} />
                                </div>
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-1.5">AI Scan Results</span>
                                    <p className="text-xs font-bold leading-snug text-gray-600">"{selectedPayment.metadata?.adminNotes || 'Verification logic pending manual review.'}"</p>
                                </div>
                            </div>
                            {/* Approve/Reject buttons — only for processing/pending */}
                            {['pending', 'processing'].includes(selectedPayment.paymentStatus?.toLowerCase()) && (
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => handleStatusUpdate(selectedPayment._id, 'completed')}
                                        className="bg-emerald-50 border border-emerald-200 text-emerald-700 py-4 rounded-full font-black hover:bg-emerald-500 hover:text-white hover:border-emerald-400 hover:shadow-lg transition-all duration-500 flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest">
                                        <CheckCircle size={16} /> Approve
                                    </button>
                                    <button onClick={() => handleStatusUpdate(selectedPayment._id, 'failed')}
                                        className="bg-rose-50 border border-rose-200 text-rose-700 py-4 rounded-full font-black hover:bg-rose-500 hover:text-white hover:border-rose-400 hover:shadow-lg transition-all duration-500 flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest">
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

const SummaryCard = ({ label, value, note, accent, bg, icon }) => (
    <div className={`rounded-3xl border border-white/10 ${bg} p-5 shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur-md`}>
        <div className="flex items-start justify-between gap-3">
            <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-white/45 font-black mb-2">{label}</p>
                <h4 className={`text-2xl md:text-3xl font-black leading-none ${accent}`}>{value}</h4>
                <p className="mt-2 text-xs text-white/60 font-medium">{note}</p>
            </div>
            <div className={`shrink-0 rounded-2xl border border-white/10 bg-white/10 text-white p-3 ${accent}`}>
                {icon}
            </div>
        </div>
    </div>
);

export default AdminPaymentPage;