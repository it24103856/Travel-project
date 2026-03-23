import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";
import { Plus, MapPin, Trash2, Edit3, Search, Eye, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

const AdminDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // 1. Fetch All Destinations from Backend
  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/destinations/all`);
      if (data && data.data) {
        setDestinations(data.data);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Failed to fetch destinations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  // 2. Delete Destination with SweetAlert2
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This destination will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      background: "#ffffff",
      borderRadius: "2rem",
      customClass: {
        popup: "rounded-[2.5rem] border border-gray-100 shadow-2xl",
        confirmButton: "px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px]",
        cancelButton: "px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px]"
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`${backendUrl}/destinations/delete/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          Swal.fire({
            title: "Deleted!",
            text: "Destination deleted successfully.",
            icon: "success",
            confirmButtonColor: "#2563eb",
            borderRadius: "2rem",
          });
          
          fetchDestinations(); 
        } catch (error) {
          toast.error(error.response?.data?.message || "Delete failed!");
        }
      }
    });
  };

  // 3. Search Filter (මෙහි province, district, city පරීක්ෂා කරයි)
  const filteredDestinations = destinations.filter((loc) =>
    loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loc.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loc.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-12 px-6">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">
              Manage <span className="text-blue-600">Destinations</span>
            </h1>
            <p className="text-gray-500 font-medium mt-1 uppercase text-[10px] tracking-widest">
               Total {destinations.length} destinations found
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search name, city or district..." 
                className="pl-12 pr-6 py-3 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64 transition-all font-medium text-sm"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Link 
              to="/admin/destinations/add" 
              className="flex items-center gap-2 bg-gray-900 hover:bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-lg active:scale-95 group"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform" />
              <span className="hidden sm:inline uppercase text-[10px] tracking-widest">Add New</span>
            </Link>
          </div>
        </div>

        {/* Destination Cards Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
             <Loader2 className="animate-spin text-blue-600" size={40} />
             <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Syncing Data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredDestinations.map((loc) => (
              <div 
                key={loc._id} 
                className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col"
              >
                <div className="relative h-60 overflow-hidden bg-gray-100">
                  {loc.image && loc.image.length > 0 ? (
                    <img src={loc.image[0]} alt={loc.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 font-black text-[10px] uppercase">No Image</div>
                  )}
                  
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                    <button onClick={() => handleDelete(loc._id)} className="p-3 bg-white text-red-500 rounded-2xl shadow-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} /></button>
                    <Link to={`/admin/destinations/edit/${loc._id}`} className="p-3 bg-white text-gray-700 rounded-2xl shadow-lg hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={18} /></Link>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-4">
                    <h3 className="text-xl font-black text-gray-900 uppercase italic leading-none truncate group-hover:text-blue-600 transition-colors">{loc.name}</h3>
                    <div className="flex items-center gap-1 text-gray-400 mt-2">
                      <MapPin size={14} className="text-blue-500" />
                      {/* මෙතැන city සහ district පෙන්වයි */}
                      <span className="text-[10px] font-black uppercase tracking-wider">{loc.city}, {loc.district}</span>
                    </div>
                  </div>

                  <p className="text-gray-500 text-xs line-clamp-2 mb-6 font-medium leading-relaxed">{loc.description}</p>

                  <div className="mt-auto pt-5 border-t border-gray-50 flex justify-between items-center">
                    <div className="flex flex-col">
                       <span className="text-[8px] font-black text-gray-300 uppercase">Province</span>
                       <span className="text-[10px] font-black text-gray-700 uppercase">{loc.province}</span>
                    </div>
                    <Link to={`/overview/${loc._id}`} className="text-gray-300 hover:text-blue-600 transition-all hover:scale-110">
                      <Eye size={20} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredDestinations.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[3.5rem] border-4 border-dashed border-gray-50">
            <div className="inline-flex p-6 bg-gray-50 rounded-full mb-4">
               <Search size={40} className="text-gray-200" />
            </div>
            <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-xs">No records found matching search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDestinations;