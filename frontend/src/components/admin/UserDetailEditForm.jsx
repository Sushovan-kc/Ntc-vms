import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import adminservices from '../../api/services/adminservices';

const UserDetailEditForm = ({ isOpen, onClose, userProfile, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    role: 'employee',
    branch: '',
    role_approved: false
  });
  const [submitting, setSubmitting] = useState(false);

  // Sync state data whenever a new user profile object is loaded into the canvas context
  useEffect(() => {
    if (userProfile) {
      setFormData({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        email: userProfile.email || '',
        phone_number: userProfile.phone_number || '',
        role: userProfile.role || 'employee',
        branch: userProfile.branch || '',
        role_approved: !!userProfile.role_approved
      });
    }
  }, [userProfile]);

  if (!isOpen || !userProfile) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        id: userProfile.id,
        user: userProfile.user, // Keep core foreign key binding intact
        branch: formData.branch ? parseInt(formData.branch) : null
      };

      const [response] = await Promise.allSettled([
        adminservices.updateUserProfile(userProfile.id, payload)
      ]);

      if (response.status === 'fulfilled') {
        onUpdateSuccess();
        onClose();
      } else {
        alert("Failed to update user profile record details.");
      }
    } catch (error) {
      console.error("Profile modification patch workflow failure:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-opacity duration-300">
    {/* Modal Box */}
    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-ntc-dark">Edit User Profile</h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Modifying account fields for ID: #{userProfile.id}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 text-gray-400 hover:text-slate-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Contents */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">First Name</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full text-sm rounded-lg border border-gray-300 bg-gray-50 p-2.5 font-medium text-ntc-dark outline-none focus:border-ntc-blue focus:ring-1 focus:ring-ntc-blue" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full text-sm rounded-lg border border-gray-300 bg-gray-50 p-2.5 font-medium text-ntc-dark outline-none focus:border-ntc-blue focus:ring-1 focus:ring-ntc-blue" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full text-sm rounded-lg border border-gray-300 bg-gray-50 p-2.5 font-medium text-ntc-dark outline-none focus:border-ntc-blue focus:ring-1 focus:ring-ntc-blue" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Phone Number</label>
              <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full text-sm rounded-lg border border-gray-300 bg-gray-50 p-2.5 font-medium text-ntc-dark outline-none focus:border-ntc-blue focus:ring-1 focus:ring-ntc-blue" placeholder="N/A" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Branch ID</label>
              <input type="number" name="branch" value={formData.branch} onChange={handleChange} className="w-full text-sm rounded-lg border border-gray-300 bg-gray-50 p-2.5 font-medium text-ntc-dark outline-none focus:border-ntc-blue focus:ring-1 focus:ring-ntc-blue" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">System Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full text-sm rounded-lg border border-gray-300 bg-gray-50 p-2.5 font-medium text-ntc-dark outline-none focus:border-ntc-blue focus:ring-1 focus:ring-ntc-blue">
                <option value="employee">Employee</option>
                <option value="driver">Driver</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div className="flex items-center mt-5">
              <label className="relative flex items-center gap-2.5 cursor-pointer select-none">
                <input type="checkbox" name="role_approved" checked={formData.role_approved} onChange={handleChange} className="w-4 h-4 rounded text-ntc-blue border-gray-300 bg-gray-50 focus:ring-ntc-blue" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Approve Access Role</span>
              </label>
            </div>
          </div>

          {/* Action Buttons footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="bg-ntc-blue text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center gap-1.5">
              <Save size={16} />
              {submitting ? 'Saving changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserDetailEditForm;
