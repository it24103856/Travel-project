import { Routes, Route, useNavigate, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { 
  LayoutDashboard, Mail, Phone, ShieldCheck, Car, Hotel, 
    IdCard, CalendarCheck, RefreshCw, Tag, Info, Home, LogOut , Truck
} from "lucide-react";

// Pages (ඔබේ පැරණි Imports එලෙසම තබා ගන්න)
import AdminContactPage from "./Admin/adminContactPage";
import AdminMessages from "./Admin/AdminMessages";
import AdminUserPage from "./Admin/adminUserPage";
import AddDriverPage from "./Admin/addDriverPage";
import AdminDriverPage from "./Admin/adminDriverPage";
import EditDriverPage from "./Admin/EditDriverPage";
import AddHotelPage from "./Admin/hotelAddPage";
import AdminHotelPage from "./Admin/AdminHotelPage";
import EditHotelPage from "./Admin/editHotelPage";
import AdminFeedback from "./Admin/AdminFeedbackPage";
import AdminBookingPage from "./Admin/AdminBookingPage";
import AdminPaymentPage from "./Admin/adminPaymentpage";
import AdminPackagePage from "./Admin/AdminPackagePage";
import AddPackagePage from "./Admin/addPackagePage";
import EditPackagePage from "./Admin/editPackagePage";
import PaymentReportpage from "../components/PaymentReportpage";
import AdminCreateDestination from "./Admin/adminCreateDestination";
import AdminDestinationPage from "./Admin/adminDestination";
import UpdateDestination from "./Admin/updateDestination";
import AdminVehicleCreatePage from "./Admin/adminVehicleCreatePage";
import AdminVehiclePage from "./Admin/AdminVehiclePage";
import AdminVehicleUpdatePage from "./Admin/AdminVehicleUpdatePage";



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
        <div className="h-screen flex flex-col items-center justify-center bg-[#FDFDFD]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00AEEF]"></div>
            <p className="mt-4 text-gray-600 font-medium font-[Inter]">Authenticating Admin...</p>
        </div>
    );

    const TopNavLink = ({ to, icon, label }) => {
        const isActive = location.pathname === to;
        return (
            <Link to={to} className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-500 whitespace-nowrap text-[11px] font-bold uppercase tracking-wider ${
                isActive ? "bg-[#00AEEF] text-white shadow-lg shadow-blue-100" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            }`}>
                <span className={isActive ? "text-white" : "text-gray-400 group-hover:text-gray-900"}>{icon}</span>
                <span>{label}</span>
            </Link>
        );
    };

    return (
        <div className="w-full h-screen flex flex-col overflow-hidden bg-[#FDFDFD] font-[Inter]">
            
            {/* --- Updated Fixed Top Navbar --- */}
            <nav className="fixed top-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-md shadow-sm z-50 border-b border-gray-100 px-6 flex items-center">
                <div className="w-full flex items-center justify-between gap-8">
                    
                    {/* 1. Logo Section */}
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white">
                            <ShieldCheck size={22} />
                        </div>
                        <div className="hidden lg:block">
                            <h2 className="font-[Playfair_Display] text-gray-900 font-black text-sm uppercase tracking-tighter">Admin Panel</h2>
                            <p className="text-[9px] text-[#00AEEF] font-bold tracking-[0.2em] uppercase">TravelMate</p>
                        </div>
                    </div>

                    {/* 2. Scrollable Navigation (The Fix) */}
                    <div className="flex-1 overflow-x-auto no-scrollbar py-2">
                        <div className="flex items-center gap-1 min-w-max px-2">
                            <TopNavLink to="/admin" icon={<LayoutDashboard size={14} />} label="Dashboard" />
                            <TopNavLink to="/admin/contact" icon={<Phone size={14} />} label="Contact" />
                            <TopNavLink to="/admin/messages" icon={<Mail size={14} />} label="Messages" />
                            <TopNavLink to="/admin/users" icon={<ShieldCheck size={14} />} label="Users" />
                            <TopNavLink to="/admin/drivers" icon={<Car size={14} />} label="Drivers" />
                            <TopNavLink to="/admin/hotels" icon={<Hotel size={14} />} label="Hotels" />
                            <TopNavLink to="/admin/feedback" icon={<IdCard size={14} />} label="Feedback" />
                            <TopNavLink to="/admin/bookings" icon={<CalendarCheck size={14} />} label="Bookings" />
                            <TopNavLink to="/admin/payments" icon={<RefreshCw size={14} />} label="Payments" />
                            <TopNavLink to="/admin/packages" icon={<Tag size={14} />} label="Packages" />                             <TopNavLink to="/admin/destinations" icon={<Info size={14} />} label="Destinations" />
                            <TopNavLink to="/admin/vehicles" icon={<Truck size={14} />} label="Vehicles" />
                        </div>
                    </div>

                    {/* 3. Right Side Actions */}
                    <div className="flex items-center gap-4 shrink-0 pl-4 border-l border-gray-100">
                        <Link to="/" className="p-2.5 text-gray-400 hover:text-gray-900 transition-colors">
                            <Home size={18} />
                        </Link>
                        <button 
                            onClick={handleLogout}
                            className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all duration-300"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden pt-20">
                <main className="flex-1 overflow-y-auto p-8 lg:p-12">
                    <Routes>
                        <Route path="/contact" element={<AdminContactPage />} />
                        <Route path="/messages" element={<AdminMessages />} />
                        <Route path="/users" element={<AdminUserPage />} />
                        <Route path="/destinations" element={<AdminDestinationPage />} />
                        <Route path="/destinations/add" element={<AdminCreateDestination />} />
                        <Route path="/drivers" element={<AdminDriverPage />} /> 
                        <Route path="/add-drivers" element={<AddDriverPage />} />
                        <Route path="/drivers/edit/:email" element={<EditDriverPage />} />
                        <Route path="/hotels" element={<AdminHotelPage />} />
                        <Route path="/add-hotel" element={<AddHotelPage />} />
                        <Route path="/hotels/edit/:id" element={<EditHotelPage />} />
                        <Route path="/feedback" element={<AdminFeedback />} />
                        <Route path="/bookings" element={<AdminBookingPage />} />
                        <Route path="/payments" element={<AdminPaymentPage />} />
                        <Route path="/packages" element={<AdminPackagePage />} />
                        <Route path="/add-package" element={<AddPackagePage />} />
                        <Route path="/packages/edit/:id" element={<EditPackagePage />} />                        <Route path="/payment-report" element={<PaymentReportpage />} />
                        <Route path="/destinations/edit/:id" element={<UpdateDestination />} />
                        <Route path="/vehicles" element={<AdminVehiclePage />} />
                        <Route path="/vehicles/create" element={<AdminVehicleCreatePage />} />
                        <Route path="/vehicles/update/:id" element={<AdminVehicleUpdatePage />} />
                        
                        <Route path="/" element={
                            <div className="animate-fade-in">
                                <span className="text-[10px] font-bold text-[#00AEEF] uppercase tracking-[0.3em]">Management Console</span>
                                <h1 className="text-4xl md:text-5xl font-[Playfair_Display] font-black text-gray-900 mt-2 italic">
                                    Welcome, {user?.firstName}
                                </h1>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                                    <div className="p-8 bg-white rounded-[2rem] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] group hover:border-[#00AEEF] transition-all duration-500">
                                        <div className="w-12 h-12 bg-[#00AEEF]/10 rounded-2xl flex items-center justify-center text-[#00AEEF] mb-6">
                                            <LayoutDashboard size={20} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">System Status</h3>
                                        <p className="text-sm text-gray-500 leading-relaxed font-medium">All TravelMate systems are currently operational and synchronized.</p>
                                    </div>
                                    {/* මෙතැනට තවත් Stats cards එක් කළ හැක */}
                                </div>
                            </div>
                        } />
                    </Routes>
                </main>
            </div>

            {/* Custom Styles for hidden scrollbar and animation */}
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
            `}</style>
        </div>
    );
}