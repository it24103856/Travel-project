import { BiTrash, BiEditAlt } from "react-icons/bi";
import { FaPlus, FaMapMarkerAlt, FaCalendarAlt, FaTag, FaSuitcase } from "react-icons/fa";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useEffect, useState, Fragment } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";

export default function AdminPackagePage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const fetchPackages = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/packages/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPackages(response.data.data || response.data);
    } catch (error) {
      toast.error("Failed to fetch packages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleDeleteClick = (pkg) => {
    setSelectedPackage(pkg);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPackage) return;
    const token = localStorage.getItem("token");
    setDeleting(true);
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/packages/delete/${selectedPackage._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Package deleted successfully");
      fetchPackages();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete package");
    } finally {
      setDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  if (loading) return (
    <div className="text-center mt-20 text-gray-500 animate-pulse font-bold">
      Loading packages...
    </div>
  );

  return (
    <div className="relative min-h-screen p-6 bg-gray-50">
      <Toaster />

      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Package Management</h1>
        <p className="text-gray-500">Manage your tour packages, itineraries, and pricing</p>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[1.5rem] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#2D3748] text-white">
              <th className="p-4 text-xs font-black uppercase tracking-widest">Package Details</th>
              <th className="p-4 text-xs font-black uppercase tracking-widest">Location</th>
              <th className="p-4 text-xs font-black uppercase tracking-widest text-center">Duration</th>
              <th className="p-4 text-xs font-black uppercase tracking-widest text-center">Categories</th>
              <th className="p-4 text-xs font-black uppercase tracking-widest">Price</th>
              <th className="p-4 text-xs font-black uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.length > 0 ? (
              packages.map((pkg) => (
                <tr
                  key={pkg._id}
                  className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors"
                >
                  {/* Package Details */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 rounded-lg overflow-hidden border border-gray-100 bg-amber-50 flex items-center justify-center text-amber-500 shadow-sm flex-shrink-0">
                        {pkg.gallery?.[0] ? (
                          <img
                            src={pkg.gallery[0]}
                            alt={pkg.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaSuitcase size={20} />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-700 leading-tight">{pkg.title}</span>
                        <span className="text-[10px] text-gray-400 mt-1 line-clamp-1 max-w-[180px]">
                          {pkg.description}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                      <FaMapMarkerAlt className="text-amber-500 text-[10px]" /> {pkg.location}
                    </div>
                  </td>

                  {/* Duration */}
                  <td className="p-4 text-center">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold flex items-center gap-1.5 justify-center w-fit mx-auto">
                      <FaCalendarAlt size={9} /> {pkg.no_of_days} Days
                    </span>
                  </td>

                  {/* Categories */}
                  <td className="p-4 text-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {pkg.categories?.slice(0, 2).map((cat, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold"
                        >
                          {cat}
                        </span>
                      ))}
                      {pkg.categories?.length > 2 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold">
                          +{pkg.categories.length - 2}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Price */}
                  <td className="p-4">
                    <div className="text-sm font-bold text-gray-700">
                      LKR {pkg.price?.toLocaleString()}
                      <span className="block text-[10px] text-gray-400 font-normal">Per Person</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => navigate(`/admin/packages/edit/${pkg._id}`)}
                        className="p-2 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                      >
                        <BiEditAlt size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(pkg)}
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
                <td colSpan="6" className="p-20 text-center text-gray-400 font-medium italic">
                  No packages created yet. Click the + button to add your first package.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Add Button */}
      <Link
        to="/admin/add-package"
        className="fixed bottom-10 right-10 w-16 h-16 bg-[#2D3748] text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-black hover:scale-110 transition-all z-50 group"
      >
        <FaPlus size={24} />
        <span className="absolute right-20 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Add New Package
        </span>
      </Link>

      {/* DELETE CONFIRMATION MODAL */}
      <Transition show={isConfirmOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[100]" onClose={() => setIsConfirmOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[2rem] bg-white p-8 shadow-2xl transition-all border border-gray-100 text-center">
                  <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BiTrash size={40} />
                  </div>
                  <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900 leading-6">
                    Delete Package?
                  </Dialog.Title>
                  <p className="mt-4 text-gray-500">
                    Are you sure you want to remove{" "}
                    <span className="font-bold text-gray-800">{selectedPackage?.title}</span>?
                    This package and all its itinerary details will be deleted permanently.
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