import { BiTrash, BiEditAlt, BiBlock, BiCheckShield } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState, Fragment } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Dialog, Transition } from "@headlessui/react";

export default function AdminUserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // 1. Load all users from backend
  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${backendUrl}/users/all-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Role Change Logic
  const handleRoleChange = async (user, newRole) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `${backendUrl}/users/update-role/${user.email}`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`User role updated to ${newRole}`);
      
      // 
      setUsers((prev) =>
        prev.map((u) => (u.email === user.email ? { ...u, role: newRole } : u))
      );
    } catch (error) {
      toast.error("Failed to update role. Check backend route!");
    }
  };

  // 3. Block/Unblock Logic 
  const handleToggleBlock = async (user) => {
    const token = localStorage.getItem("token");
    const newStatus = user.isblocked;
    try {
      await axios.put(
        `${backendUrl}/users/update-status/${user.email}`,
        { isblocked: !newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`User ${newStatus ? "unblocked" : "blocked"} successfully`);
      setUsers((prev) =>
        prev.map((u) => (u.email === user.email ? { ...u, isblocked: !newStatus } : u))
      );
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  // 4. Delete Confirmation Logic
  const openDeleteConfirm = (user) => {
    setSelectedUser(user);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    setDeleting(true);
    try {
      await axios.delete(`${backendUrl}/users/delete-user/${selectedUser.email}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("User deleted successfully!");
      setUsers(users.filter((user) => user._id !== selectedUser._id));
      setIsConfirmOpen(false);
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 p-10">
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600">Admin control panel for user accounts</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-20 text-center text-gray-400 animate-pulse text-xl">Loading Users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="px-6 py-4">Profile</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4 text-center">Role</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((item) => (
                    <tr key={item.email} className={`${item.isblocked ? "bg-red-50" : "hover:bg-gray-50"} transition-colors`}>
                      <td className="px-6 py-4">
                        <img src={item.image || "https://via.placeholder.com/40"} className="w-10 h-10 rounded-full object-cover border border-gray-200" alt="avatar" />
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800">
                        {item.firstName} {item.lastName}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{item.email}</td>
                      
                      {/* --- මෙන්න ඔයා ඉල්ලපු Role Dropdown එක --- */}
                      <td className="px-6 py-4 text-center">
                        <select 
                          value={item.role} 
                          onChange={(e) => handleRoleChange(item, e.target.value)}
                          className={`px-3 py-1 rounded-full text-[11px] font-black uppercase border-none outline-none cursor-pointer transition-all ${
                            item.role === "admin" ? "bg-purple-200 text-purple-800" : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                          <option value="agent">Driver</option>
                        </select>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${item.isblocked ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"}`}>
                          {item.isblocked ? "BLOCKED" : "ACTIVE"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleToggleBlock(item)}
                            className={`p-2 rounded-lg text-white transition-transform active:scale-90 ${item.isblocked ? "bg-green-600" : "bg-orange-500"}`}
                            title={item.isblocked ? "Unblock User" : "Block User"}
                          >
                            {item.isblocked ? <BiCheckShield size={18} /> : <BiBlock size={18} />}
                          </button>
                          <button 
                             onClick={() => navigate(`/admin/update-user/${item.email}`, { state: item })}
                             className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                             title="Edit User"
                          >
                            <BiEditAlt size={18} />
                          </button>
                          <button 
                            onClick={() => openDeleteConfirm(item)} 
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <BiTrash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Transition appear show={isConfirmOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsConfirmOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-2xl transition-all">
              <Dialog.Title className="text-xl font-bold leading-6 text-gray-900">Confirm Deletion</Dialog.Title>
              <p className="mt-3 text-sm text-gray-500">
                Are you sure you want to delete <span className="font-bold text-gray-800">{selectedUser?.email}</span>? This action cannot be undone.
              </p>
              <div className="mt-8 flex justify-end gap-3">
                <button onClick={() => setIsConfirmOpen(false)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors">Cancel</button>
                <button 
                  onClick={confirmDelete} 
                  disabled={deleting}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-100 transition-all active:scale-95 disabled:bg-red-400"
                >
                   {deleting ? "Deleting..." : "Yes, Delete User"}
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}