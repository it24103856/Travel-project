import React, { useState, useEffect, Fragment } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Trash2, Pencil, Plus, Car, Fuel, Users, Settings, Search } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";

export default function AdminVehiclePage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/vehicles`);
      setVehicles(response.data.data || response.data);
    } catch (error) {
      toast.error("Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleDeleteClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedVehicle) return;
    const token = localStorage.getItem("token");
    setDeleting(true);
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/vehicles/${selectedVehicle._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Vehicle removed successfully");
      fetchVehicles();
    } catch (error) {
      toast.error("Failed to delete vehicle");
    } finally {
      setDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  if (loading) return <div className="text-center mt-20 text-[#6366F1] animate-pulse font-[Inter]">Loading Fleet Assets...</div>;

  return (
    <div className="relative min-h-screen p-6 bg-[#FDFDFD] font-[Inter]">
      <Toaster />
      
      {/* Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-[Playfair_Display] font-bold text-gray-900">Fleet Management</h1>
          <p className="text-gray-500">Monitor and manage all transport assets in the inventory</p>
        </div>
        <Link to="/admin/vehicles/create" className="bg-[#6366F1] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#4F46E5] transition-all shadow-lg shadow-[#6366F1]/20 uppercase tracking-widest text-xs">
          <Plus size={18} /> Add Asset
        </Link>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl shadow-sm hover:shadow-xl overflow-hidden border border-gray-100 transition-all duration-500">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white">
              <th className="p-4 text-[10px] font-black uppercase tracking-widest">Asset Image</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest">Vehicle Details</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest">Reg. Number</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest">Specs</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v._id} className="border-b border-gray-50 hover:bg-[#6366F1]/5 transition-all duration-500">
                <td className="p-4">
                  <div className="w-20 h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                    <img src={v.images?.[0]} alt="vehicle" className="w-full h-full object-cover" />
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-700">{v.make} {v.model}</span>
                    <span className="text-[10px] text-[#6366F1] font-bold uppercase tracking-tighter">{v.type}</span>
                  </div>
                </td>
                <td className="p-4 font-mono text-sm text-gray-600">{v.registrationNumber}</td>
                <td className="p-4">
                  <div className="flex gap-3 text-gray-400">
                    <div className="flex items-center gap-1 text-[11px]"><Users size={12}/> {v.seatingCapacity}</div>
                    <div className="flex items-center gap-1 text-[11px]"><Fuel size={12}/> {v.fuelType}</div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => navigate(`/admin/vehicles/update/${v._id}`)} className="p-2 bg-[#6366F1]/10 text-[#6366F1] rounded-xl hover:bg-[#6366F1] hover:text-white transition-all">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => handleDeleteClick(v)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
      <Transition show={isConfirmOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[100]" onClose={() => setIsConfirmOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-8 shadow-2xl transition-all text-center">
                  <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trash2 size={40} />
                  </div>
                  <Dialog.Title as="h3" className="text-2xl font-[Playfair_Display] font-bold text-gray-900">Remove Asset?</Dialog.Title>
                  <p className="mt-4 text-gray-500">Are you sure you want to delete <span className="font-bold">{selectedVehicle?.make} {selectedVehicle?.model}</span>?</p>
                  <div className="mt-8 flex gap-4">
                    <button className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 rounded-full font-bold uppercase text-[10px] tracking-widest" onClick={() => setIsConfirmOpen(false)}>Cancel</button>
                    <button disabled={deleting} className="flex-1 px-6 py-4 bg-red-500 text-white rounded-full font-bold shadow-lg shadow-red-100 uppercase text-[10px] tracking-widest" onClick={confirmDelete}>
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