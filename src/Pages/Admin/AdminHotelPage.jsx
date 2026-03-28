import { Trash2, Pencil } from "lucide-react";
import { Plus, Hotel, MapPin, BedDouble, Phone, Star } from "lucide-react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useEffect, useState, Fragment } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";

export default function AdminHotelPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const fetchHotels = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/hotels/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHotels(response.data.data || response.data);
    } catch (error) {
      toast.error("Failed to fetch hotels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHotels(); }, []);

  const handleDeleteClick = (hotel) => { setSelectedHotel(hotel); setIsConfirmOpen(true); };

  const confirmDelete = async () => {
    if (!selectedHotel) return;
    const token = localStorage.getItem("token");
    setDeleting(true);
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/hotels/delete/${selectedHotel._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Hotel deleted successfully");
      fetchHotels();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete hotel");
    } finally {
      setDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  if (loading) return <div className="text-center mt-20 text-gray-500 animate-pulse font-bold font-[Inter]">Loading properties...</div>;

  return (
    <div className="relative min-h-screen p-6 bg-[#FDFDFD]">
      <Toaster />
      
      <div className="mb-8">
        <h1 className="text-3xl font-[Playfair_Display] font-bold text-gray-900">Hotel Management</h1>
        <p className="text-gray-500 font-[Inter]">Manage your partner hotels, room rates, and locations</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm hover:shadow-xl overflow-hidden border border-gray-100 transition-all duration-500">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-[#00AEEF] to-[#0095cc] text-white">
              <th className="p-4 text-xs font-black uppercase tracking-widest">Hotel Details</th>
              <th className="p-4 text-xs font-black uppercase tracking-widest">Location</th>
              <th className="p-4 text-xs font-black uppercase tracking-widest text-center">Rooms</th>
              <th className="p-4 text-xs font-black uppercase tracking-widest">Starting Price</th>
              <th className="p-4 text-xs font-black uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {hotels.length > 0 ? (
              hotels.map((hotel) => (
                <tr key={hotel._id} className="border-b border-gray-50 hover:bg-[#00AEEF]/5 transition-all duration-500">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 rounded-lg overflow-hidden border border-gray-100 bg-[#00AEEF]/5 flex items-center justify-center text-[#00AEEF] shadow-sm">
                        {hotel.images && hotel.images[0] ? (
                          <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
                        ) : (
                          <Hotel size={20} />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-700 leading-tight font-[Inter]">{hotel.name}</span>
                        <div className="flex items-center gap-1 text-[10px] text-[#00AEEF] font-bold mt-1">
                          <Star size={10} /> {hotel.rating || "N/A"} Category: {hotel.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-600 space-y-1 font-[Inter]">
                      <div className="flex items-center gap-2 font-medium"><MapPin className="text-[#00AEEF]" size={10} /> {hotel.city}</div>
                      <div className="text-[11px] text-gray-400">{hotel.district}, {hotel.province}</div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="px-3 py-1 bg-[#00AEEF]/10 text-[#00AEEF] rounded-full text-xs font-bold">
                      {hotel.roomTypes?.length || 0} Types
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-bold text-gray-700 font-[Inter]">
                      LKR {hotel.roomTypes && hotel.roomTypes[0]?.finalPrice.toLocaleString()}
                      <span className="block text-[10px] text-gray-400 font-normal">Per Night</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => navigate(`/admin/hotels/edit/${hotel._id}`)} className="p-2 bg-[#00AEEF]/10 text-[#00AEEF] rounded-xl hover:bg-[#00AEEF] hover:text-white transition-all duration-500">
                        <Pencil size={20} />
                      </button>
                      <button onClick={() => handleDeleteClick(hotel)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-500">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-20 text-center text-gray-400 font-medium italic font-[Inter]">
                   No hotels registered yet. Click the + button to add your first property.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Link to="/admin/add-hotel" className="fixed bottom-10 right-10 w-16 h-16 bg-[#00AEEF] text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-[#0095cc] hover:scale-110 transition-all duration-500 z-50 group">
        <Plus size={24} />
        <span className="absolute right-20 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-[Inter]">Add New Hotel</span>
      </Link>

      <Transition show={isConfirmOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[100]" onClose={() => setIsConfirmOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-8 shadow-2xl transition-all border border-gray-100 text-center">
                  <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><Trash2 size={40} /></div>
                  <Dialog.Title as="h3" className="text-2xl font-[Playfair_Display] font-bold text-gray-900">Delete Hotel?</Dialog.Title>
                  <p className="mt-4 text-gray-500 font-[Inter]">Are you sure you want to remove <span className="font-bold text-gray-800">{selectedHotel?.name}</span>? This property and all its room details will be deleted permanently.</p>
                  <div className="mt-8 flex gap-4">
                    <button type="button" className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full font-bold transition-all duration-500 uppercase tracking-widest text-xs" onClick={() => setIsConfirmOpen(false)}>Cancel</button>
                    <button type="button" disabled={deleting} className="flex-1 px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold shadow-lg shadow-red-100 transition-all duration-500 disabled:bg-gray-400 uppercase tracking-widest text-xs" onClick={confirmDelete}>
                      {deleting ? "Removing..." : "Confirm Delete"}
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