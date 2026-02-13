import { Routes, Route, useNavigate, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaPhoneAlt, FaEnvelope, FaThLarge, FaUserShield, FaSignOutAlt, FaHome } from "react-icons/fa";
// Pages
import AdminContactPage from "./Admin/adminContactPage";
import AdminMessages from "./Admin/AdminMessages";
import AdminUserPage from "./Admin/adminUserPage";

export default function AdminPage() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then((response) => {
            const userData = response.data; 
            if (userData && userData.role === "admin") {
                setUser(userData);
                setIsLoading(false);
            } else {
                navigate("/");
            }
        }).catch(() => navigate("/login"));
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    if (isLoading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-600 font-medium">Authenticating Admin...</p>
        </div>
    );

    const SidebarLink = ({ to, icon, label }) => {
        const isActive = location.pathname === to;
        return (
            <Link to={to} className={`flex items-center gap-4 px-6 py-4 transition-all ${
                isActive ? "bg-orange-500 text-white shadow-lg" : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}>
                {icon}
                <span className="font-medium">{label}</span>
            </Link>
        );
    };

    return (
        <div className="w-full h-screen flex overflow-hidden bg-gray-50 font-poppins">
            {/* Sidebar */}
            <aside className="w-72 bg-[#1A1C1E] h-full flex flex-col shadow-2xl">
                <div className="p-8">
                    <img src="/logo.png" alt="Logo" className="w-32 mb-2" />
                    <p className="text-orange-500 text-[10px] font-bold uppercase tracking-widest">Control Panel</p>
                </div>

                <nav className="flex-1 mt-4">
                    {/* මෙතන icon={<FaThLarge />} ලෙස වෙනස් කළා */}
                    <SidebarLink to="/admin" icon={<FaThLarge />} label="Dashboard" />
                    <SidebarLink to="/admin/contact" icon={<FaPhoneAlt />} label="Contact Info" />
                    <SidebarLink to="/admin/messages" icon={<FaEnvelope />} label="User Messages" />
                    <SidebarLink to="/admin/users" icon={<FaUserShield />} label="Users" />
                    
                    <div className="mt-10 px-6 text-gray-500 text-[10px] uppercase font-bold tracking-widest border-t border-gray-800 pt-6">Quick Links</div>
                    <Link to="/" className="flex items-center gap-4 px-6 py-4 text-gray-400 hover:text-white transition-all italic text-sm">
                        <FaHome /> <span>Visit Main Website</span>
                    </Link>
                </nav>

                <div className="p-6 border-t border-gray-800">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 bg-red-500/10 text-red-500 py-3 rounded-xl hover:bg-red-500 hover:text-white transition-all font-bold text-sm">
                        <FaSignOutAlt /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-10 shadow-sm z-10">
                    <h2 className="text-xl font-bold text-gray-800 capitalize">
                        {location.pathname.split("/").pop() || "Dashboard"}
                    </h2>
                    
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
                            <p className="text-[10px] text-orange-500 font-bold uppercase tracking-tighter">Verified Admin</p>
                        </div>
                        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-md">
                            <FaUserShield size={20} />
                        </div>
                    </div>
                </header>

                {/* Content Container */}
                <main className="flex-1 overflow-y-auto p-10 bg-[#F8F9FA]">
                    <Routes>
                        <Route path="/contact" element={<AdminContactPage />} />
                        <Route path="/messages" element={<AdminMessages />} />
                        <Route path="/users" element={<AdminUserPage />} />
                        <Route path="/" element={
                            <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100">
                                <h1 className="text-3xl font-black text-gray-800">Welcome, {user?.firstName}! 👋</h1>
                                <p className="text-gray-500 mt-2">Manage your travels, messages and contact details from here.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                                    <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100">
                                        <p className="text-orange-600 font-bold">System Status</p>
                                        <p className="text-sm text-gray-600 mt-1">All systems are running smoothly.</p>
                                    </div>
                                </div>
                            </div>
                        } />
                    </Routes>
                </main>
            </div>
        </div>
    );
}