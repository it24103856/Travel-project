import { Trash2, Pencil } from "lucide-react";
import { Plus, Car, IdCard, User, Phone, MapPin, Mail } from "lucide-react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useEffect, useState, Fragment } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";

export default function AdminDriverPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const fetchDrivers = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/driver/get-all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDrivers(response.data.data || response.data);
    } catch (error) {
      toast.error("Failed to fetch drivers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleDeleteClick = (driver) => {
    setSelectedDriver(driver);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDriver) return;
    const token = localStorage.getItem("token");
    setDeleting(true);
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/driver/delete/${selectedDriver.email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Driver deleted successfully");
      fetchDrivers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete driver");
    } finally {
      setDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  if (loading) return <div className="text-center mt-20 text-gray-500 animate-pulse font-[Inter]">Loading drivers...</div>;

  return (
    <div className="relative min-h-screen p-6 bg-[#FDFDFD]">
      <Toaster />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-[Playfair_Display] font-bold text-gray-900">Driver Management</h1>
        <p className="text-gray-500 font-[Inter]">Manage your official transport staff and their vehicle details</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm hover:shadow-xl overflow-hidden border border-gray-100 transition-all duration-500">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-[#00AEEF] to-[#0095cc] text-white">
              <th className="p-4 text-xs font-black uppercase tracking-widest">Driver</th>
              <th className="p-4 text-xs font-black uppercase tracking-widest">Contact</th>
              <th className="p-4 text-xs font-black uppercase tracking-widest">License</th>
              <th className="p-4 text-xs font-black uppercase tracking-widest">Vehicle</th>
              <th className="p-4 text-xs font-black uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.length > 0 ? (
              drivers.map((driver) => (
                <tr key={driver._id} className="border-b border-gray-50 hover:bg-[#00AEEF]/5 transition-all duration-500">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                     <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#00AEEF]/10 bg-[#00AEEF]/5 flex items-center justify-center text-[#00AEEF] shadow-sm">
                       {driver.profileImage ? (
                        <img src={driver.profileImage} alt={driver.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={20} />
                      )}
                    </div>
                    <div className="flex flex-col">
                       <span className="font-bold text-gray-700 leading-tight font-[Inter]">{driver.name}</span>
                       <span className="text-[10px] text-gray-400 uppercase tracking-tighter">ID: {driver._id.slice(-6)}</span>
                    </div>
                  </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-600 space-y-1 font-[Inter]">
                      <div className="flex items-center gap-2"><Mail size={10} /> {driver.email}</div>
                      <div className="flex items-center gap-2"><Phone size={10} /> {driver.phone}</div>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-600 font-[Inter]">{driver.licenseNumber}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-[#00AEEF]/10 text-[#00AEEF] rounded-full text-xs font-bold uppercase">
                      {driver.vehicleType}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => navigate(`/admin/drivers/edit/${driver.email}`)}
                        className="p-2 bg-[#00AEEF]/10 text-[#00AEEF] rounded-xl hover:bg-[#00AEEF] hover:text-white transition-all duration-500"
                      >
                        <Pencil size={20} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(driver)}
                        className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-500"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-20 text-center text-gray-400 font-medium font-[Inter]">
                   No Drivers found. Click the + button to add.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Add Button */}
      <Link 
        to="/admin/add-drivers" 
        className="fixed bottom-10 right-10 w-16 h-16 bg-[#00AEEF] text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-[#0095cc] hover:scale-110 transition-all duration-500 z-50 group"
      >
        <Plus size={24} />
        <span className="absolute right-20 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-[Inter]">
          Add New Driver
        </span>
      </Link>

      {/* Delete Confirmation Modal */}
      <Transition show={isConfirmOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[100]" onClose={() => setIsConfirmOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-8 shadow-2xl transition-all border border-gray-100 text-center">
                  <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trash2 size={40} />
                  </div>
                  <Dialog.Title as="h3" className="text-2xl font-[Playfair_Display] font-bold text-gray-900 leading-6">
                    Delete Driver?
                  </Dialog.Title>
                  <p className="mt-4 text-gray-500 font-[Inter]">
                    Are you sure you want to delete <span className="font-bold text-gray-800">{selectedDriver?.name}</span>? This action cannot be undone.
                  </p>

                  <div className="mt-8 flex gap-4">
                    <button type="button" className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full font-bold transition-all duration-500 uppercase tracking-widest text-xs" onClick={() => setIsConfirmOpen(false)}>
                      Cancel
                    </button>
                    <button type="button" disabled={deleting} className="flex-1 px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold shadow-lg shadow-red-100 transition-all duration-500 disabled:bg-gray-400 uppercase tracking-widest text-xs" onClick={confirmDelete}>
                      {deleting ? "Deleting..." : "Yes, Delete"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}