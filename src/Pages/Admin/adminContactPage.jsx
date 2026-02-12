import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Axios use kirima lesiyi
import toast, { Toaster } from 'react-hot-toast';

const AdminContactPage = () => {
  const [contact, setContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // .env eken backend URL eka gannawa
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchContact();
  }, []);

  const fetchContact = async () => {
    try {
      // Path eka "/contact/get" widiyata danna (VITE_BACKEND_URL eke "/api" thiyena nisa)
      const response = await axios.get(`${backendUrl}/contact/get`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success || response.status === 200) {
        setContact(response.data.data);
        setFormData(response.data.data);
      }
    } catch (error) {
      // Data nathi unama error ekak pennana eka nawathwannna (Publicly initialize karaddi)
      console.error('Fetch error:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Backend eke thiyena paths anuwa meka update kala
      const url = contact 
        ? `${backendUrl}/contact/update/${contact._id}` 
        : `${backendUrl}/contact/create`;
      
      const method = contact ? 'put' : 'post';

      const response = await axios({
        method: method,
        url: url,
        data: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      toast.success(response.data.message || 'Contact saved successfully!');
      setContact(response.data.data);
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save contact');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!contact) return;

    if (window.confirm('Are you sure you want to delete this contact?')) {
      const deleteToast = toast.loading("Deleting...");
      try {
        await axios.delete(`${backendUrl}/contact/delete/${contact._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        toast.success('Contact deleted successfully!', { id: deleteToast });
        setContact(null);
        setFormData({ name: '', email: '', phone: '', address: '' });
      } catch (error) {
        toast.error('Failed to delete contact', { id: deleteToast });
      }
    }
  };

  return (
    <div className='w-full max-w-4xl mx-auto px-4 py-12 text-left'>
      <Toaster position="top-center" />
      <h1 className='text-4xl font-bold text-center mb-8'>Admin Contact Management</h1>

      {!isEditing && contact ? (
        <div className='bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1'>Full Name</label>
              <p className='text-lg font-semibold text-gray-900'>{contact.name}</p>
            </div>
            <div>
              <label className='block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1'>Email Address</label>
              <p className='text-lg font-semibold text-gray-900'>{contact.email}</p>
            </div>
            <div>
              <label className='block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1'>Phone Number</label>
              <p className='text-lg font-semibold text-gray-900'>{contact.phone}</p>
            </div>
            <div>
              <label className='block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1'>Address</label>
              <p className='text-lg font-semibold text-gray-900'>{contact.address}</p>
            </div>
          </div>

          <div className='flex gap-4 pt-6 border-t border-gray-50'>
            <button onClick={() => setIsEditing(true)} className='flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-blue-100'>
              Edit Details
            </button>
            <button onClick={handleDelete} className='flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-4 rounded-xl transition'>
              Delete Contact
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className='bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100'>
          <div className="space-y-4 text-left">
             <div>
              <label className='block text-sm font-bold text-gray-700 mb-2 ml-1'>Full Name</label>
              <input type='text' name='name' value={formData.name} onChange={handleChange} required className='w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all' placeholder='John Doe' />
            </div>
            <div>
              <label className='block text-sm font-bold text-gray-700 mb-2 ml-1'>Email Address</label>
              <input type='email' name='email' value={formData.email} onChange={handleChange} required className='w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all' placeholder='john@example.com' />
            </div>
            <div>
              <label className='block text-sm font-bold text-gray-700 mb-2 ml-1'>Phone Number</label>
              <input type='tel' name='phone' value={formData.phone} onChange={handleChange} required className='w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all' placeholder='+94 77 123 4567' />
            </div>
            <div>
              <label className='block text-sm font-bold text-gray-700 mb-2 ml-1'>Address</label>
              <textarea name='address' value={formData.address} onChange={handleChange} required rows='3' className='w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all' placeholder='Colombo, Sri Lanka'></textarea>
            </div>
          </div>

          <div className='flex gap-4 pt-4'>
            <button type='submit' disabled={loading} className='flex-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-4 px-8 rounded-xl transition shadow-lg shadow-green-100 w-full'>
              {loading ? 'Processing...' : (contact ? 'Update Details 🚀' : 'Create Contact ✨')}
            </button>
            {isEditing && (
              <button type='button' onClick={() => setIsEditing(false)} className='bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 px-8 rounded-xl transition'>
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminContactPage;