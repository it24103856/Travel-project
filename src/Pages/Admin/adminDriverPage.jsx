import { BiTrash, BiEditAlt } from "react-icons/bi";
import { FaPlus, FaCar, FaIdCard, FaUser, FaPhone, FaMapMarkerAlt ,FaEnvelope} from "react-icons/fa";
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
      // Backend එකෙන් එන්නේ data: [] ආකාරයට නම් response.data.data ලෙස වෙනස් කරන්න
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

  // Delete බටන් එක එබූ විට Confirmation Box එක පෙන්වීම
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

  if (loading) return <div className="text-center mt-20 text-gray-500 animate-pulse">Loading drivers...</div>;

  return (
    <div className="relative min-h-screen p-6 bg-gray-50">
      <Toaster />
      
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Driver Management</h1>
        <p className="text-gray-500">Manage your official transport staff and their vehicle details</p>
      </div>

      {/* Table Container - Image එකේ තිබුණු විදිහටම */}
      <div className="bg-white rounded-[1.5rem] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#2D3748] text-white">
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
                <tr key={driver._id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                     <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-100 bg-orange-50 flex items-center justify-center text-orange-600 shadow-sm">
                       {driver.profileImage ? (
        <img 
          src={driver.profileImage} 
          alt={driver.name} 
          className="w-full h-full object-cover" 
        />
      ) : (
        <FaUser size={20} />
      )}
    </div>
    <div className="flex flex-col">
       <span className="font-bold text-gray-700 leading-tight">{driver.name}</span>
       <span className="text-[10px] text-gray-400 uppercase tracking-tighter">ID: {driver._id.slice(-6)}</span>
    </div>
  </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2"><FaEnvelope className="text-[10px]" /> {driver.email}</div>
                      <div className="flex items-center gap-2"><FaPhone className="text-[10px]" /> {driver.phone}</div>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-600">{driver.licenseNumber}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase">
                      {driver.vehicleType}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => navigate(`/admin/drivers/edit/${driver.email}`)}
                        className="p-2 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                      >
                        <BiEditAlt size={20} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(driver)}
                        className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                      >
                        <BiTrash size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-20 text-center text-gray-400 font-medium">
                   No Drivers found. Click the + button to add.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Add Button - දකුණු පස පහළින් */}
      <Link 
        to="/admin/add-drivers" 
        className="fixed bottom-10 right-10 w-16 h-16 bg-[#2D3748] text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-black hover:scale-110 transition-all z-50 group"
      >
        <FaPlus size={24} />
        <span className="absolute right-20 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Add New Driver
        </span>
      </Link>

      {/* DELETE CONFIRMATION MODAL */}
      <Transition show={isConfirmOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[100]" onClose={() => setIsConfirmOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[2rem] bg-white p-8 shadow-2xl transition-all border border-gray-100 text-center">
                  <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BiTrash size={40} />
                  </div>
                  <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900 leading-6">
                    Delete Driver?
                  </Dialog.Title>
                  <p className="mt-4 text-gray-500">
                    Are you sure you want to delete <span className="font-bold text-gray-800">{selectedDriver?.name}</span>? This action cannot be undone.
                  </p>

                  <div className="mt-8 flex gap-4">
                    <button
                      type="button"
                      className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all"
                      onClick={() => setIsConfirmOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={deleting}
                      className="flex-1 px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-100 transition-all disabled:bg-gray-400"
                      onClick={confirmDelete}
                    >
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