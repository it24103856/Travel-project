import { Routes, Route, useNavigate, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
// All required Icons are properly imported
import { 
  FaThLarge, FaEnvelope, FaPhoneAlt, FaComments, FaUsers, FaTachometerAlt, 
  FaTruck, FaHotel, FaGlobe, FaSignOutAlt, FaUserCog, FaLeaf,
  FaTag, FaPlusCircle, FaInfoCircle, FaClock, FaImage, 
  FaBed, FaBus, FaMapMarkedAlt, FaFlag, FaSave, FaTimes, FaUserShield, FaCar,
  FaIdCard, FaCalendarCheck, FaSyncAlt, FaHome
} from "react-icons/fa";
// Pages
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
import CreatePackage from "./Admin/adminCreatePackage";
import PaymentReportpage from "../components/PaymentReportpage";
import AdminCreateDestination from "./Admin/adminCreateDestination";
import AdminDestinationPage from "./Admin/adminDestination";
import UpdateDestination from "./Admin/updateDestination";


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

    // Sidebar Link Component
    const SidebarLink = ({ to, icon, label }) => {
        const isActive = location.pathname === to;
        return (
            <Link to={to} className={`flex items-center gap-4 px-6 py-4 transition-all ${
                isActive ? "bg-orange-500 text-white shadow-lg" : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}>
                <span className="text-lg">{icon}</span>
                <span className="font-medium">{label}</span>
            </Link>
        );
    };

    const TopNavLink = ({ to, icon, label }) => {
        const isActive = location.pathname === to;
        return (
            <Link to={to} className={`flex items-center gap-1 px-3 py-3 rounded-lg transition-all whitespace-nowrap text-xs font-medium ${
                isActive ? "bg-blue-800 text-white shadow-lg" : "text-blue-900 hover:bg-blue-200 hover:text-blue-900"
            }`}>
                <span className="text-base">{icon}</span>
                <span className="hidden md:inline">{label}</span>
            </Link>
        );
    };

    return (
        <div className="w-full h-screen flex flex-col overflow-hidden bg-gray-50 font-poppins">
            {/* Fixed Top Navbar */}
            <nav className="fixed top-0 left-0 right-0 h-16 background-color: transparent; backdrop-blur-md shadow-lg z-50 border-b border-blue-400/30">
                <div className="h-full px-6 flex items-center justify-between gap-4">
                    {/* Logo and Brand */}
                    <div className="flex items-center gap-4 shrink-0">
                        <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
                        <span className="text-blue-900 font-bold text-sm hidden sm:inline">Admin Panel</span>
                    </div>

                    {/* Navigation Items */}
                    <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-1 px-4 flex-nowrap">
                            <TopNavLink to="/" icon={<FaThLarge />} label="Dashboard" />
                            <TopNavLink to="/admin/contact" icon={<FaPhoneAlt />} label="Contact" />
                            <TopNavLink to="/admin/messages" icon={<FaEnvelope />} label="Messages" />
                            <TopNavLink to="/admin/users" icon={<FaUserShield />} label="Users" />
                            <TopNavLink to="/admin/drivers" icon={<FaCar />} label="Drivers" />
                            <TopNavLink to="/admin/hotels" icon={<FaHotel />} label="Hotels" />
                            <TopNavLink to="/admin/feedback" icon={<FaIdCard />} label="Feedback" />
                            <TopNavLink to="/admin/bookings" icon={<FaCalendarCheck />} label="Bookings" />
                            <TopNavLink to="/admin/payments" icon={<FaSyncAlt />} label="Payments" />
                            <TopNavLink to="/admin/add-package" icon={<FaTag />} label="Package" />
                            <TopNavLink to="/admin/destinations" icon={<FaInfoCircle />} label="Destinations" />
                            <Link to="/" className="flex items-center gap-1 px-3 py-3 rounded-lg text-blue-900 hover:bg-blue-200 transition-all whitespace-nowrap text-xs font-medium">
                                <FaHome /> <span className="hidden md:inline">Website</span>
                            </Link>
                        </div>
                    </div>

                    {/* User Info and Logout */}
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-bold text-blue-900">{user?.firstName} {user?.lastName}</p>
                            <p className="text-[10px] text-blue-800 font-bold uppercase tracking-tighter">Admin</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center text-white shadow-md">
                            <FaUserShield size={20} />
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 bg-red-700 hover:bg-blue-950 text-white rounded-lg transition-all font-bold text-sm">
                            <FaSignOutAlt size={16} />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content Area with top margin for fixed navbar */}
            <div className="flex-1 flex flex-col h-full overflow-hidden pt-16">
                {/* Content Container */}
                <main className="flex-1 overflow-y-auto p-10 bg-[#F8F9FA]">
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
                        <Route path="/add-package" element={<CreatePackage />} />
                        <Route path="/payment-report" element={<PaymentReportpage />} />
                        <Route path="/destinations/edit/:id" element={<UpdateDestination />} />
                        
                        
                        
                        
                        <Route path="/" element={
                            <div className="bg-white p-10 rounded-4xl shadow-sm border border-gray-100">
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