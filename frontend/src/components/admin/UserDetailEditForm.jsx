import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import adminservices from '../../api/services/adminservices';
import { useBranches } from '../../context/BranchContext'; 

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
  // 2. ✅ State to capture backend validation or general errors
  const [errors, setErrors] = useState({}); 

  // 3. ✅ Consume the global branches data and loading state
  const { branches, isLoading: isBranchesLoading } = useBranches();

  // Sync state data whenever a new user profile object is loaded into the canvas context
  useEffect(() => {
    if (userProfile) {
      setFormData({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        email: userProfile.email || '',
        phone_number: userProfile.phone_number || '',
        role: userProfile.role || 'employee',
        // Support both object structures (userProfile.branch.id or a flat integer primitive)
        branch: userProfile.branch?.id || userProfile.branch || '',
        role_approved: !!userProfile.role_approved
      });
      setErrors({}); // Reset error states when switching profiles
    }
  }, [userProfile]);

  if (!isOpen || !userProfile) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    
    // Clear targeted field error instantly on user alteration
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  setErrors({}); // Wipe previous errors cleanly

  try {
    const payload = {
      ...formData,
      id: userProfile.id,
      user: userProfile.user, // Keep core foreign key binding intact
      branch: formData.branch ? parseInt(formData.branch, 10) : null
    };

    const [response] = await Promise.allSettled([
      adminservices.updateUserProfile(userProfile.id, payload)
    ]);

    if (response.status === 'fulfilled') {
      onUpdateSuccess();
      onClose();
    } else {
      const rawError = response.reason;
      console.error("Backend validation rejection details:", rawError);

      // ✅ FIX: Safely unwrap Axios backend response payloads
      const errorData = rawError?.response?.data || rawError;

      if (typeof errorData === 'object' && errorData !== null) {
        const formattedErrors = {};
        
        Object.keys(errorData).forEach((key) => {
          // Unwraps array error messages (e.g., ["Email already exists"]) or captures raw strings
          formattedErrors[key] = Array.isArray(errorData[key]) ? errorData[key][0] : errorData[key];
        });
        
        setErrors(formattedErrors);
      } else {
        setErrors({ general: rawError?.message || "Failed to update user profile record details." });
      }
    }
  } catch (error) {
    console.error("Profile modification patch workflow failure:", error);
    setErrors({ general: "An unexpected system error occurred during submission." });
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
          
          {/* 5. ✅ General Alert Error Display */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold">
              {errors.general}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">First Name</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={`w-full text-sm rounded-lg border bg-gray-50 p-2.5 font-medium text-ntc-dark outline-none focus:ring-1 ${errors.first_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-ntc-blue focus:ring-ntc-blue'}`} />
              {errors.first_name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.first_name}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={`w-full text-sm rounded-lg border bg-gray-50 p-2.5 font-medium text-ntc-dark outline-none focus:ring-1 ${errors.last_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-ntc-blue focus:ring-ntc-blue'}`} />
              {errors.last_name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.last_name}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full text-sm rounded-lg border bg-gray-50 p-2.5 font-medium text-ntc-dark outline-none focus:ring-1 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-ntc-blue focus:ring-ntc-blue'}`} />
            {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Phone Number</label>
              <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} className={`w-full text-sm rounded-lg border bg-gray-50 p-2.5 font-medium text-ntc-dark outline-none focus:ring-1 ${errors.phone_number ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-ntc-blue focus:ring-ntc-blue'}`} placeholder="N/A" />
              {errors.phone_number && <p className="mt-1 text-xs text-red-500 font-medium">{errors.phone_number}</p>}
            </div>
            
            {/* 6. ✅ Replaced input element with Dropdown implementation matching Register component */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Branch</label>
              <select 
                name="branch" 
                value={formData.branch} 
                onChange={handleChange} 
                disabled={isBranchesLoading}
                className={`w-full text-sm rounded-lg border bg-gray-50 p-2.5 font-medium text-ntc-dark outline-none focus:ring-1 ${errors.branch ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-ntc-blue focus:ring-ntc-blue'}`}
              >
                <option value="">{isBranchesLoading ? "Loading branches..." : "Select a branch"}</option>
                {branches && branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              {errors.branch && <p className="mt-1 text-xs text-red-500 font-medium">{errors.branch}</p>}
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
              {errors.role && <p className="mt-1 text-xs text-red-500 font-medium">{errors.role}</p>}
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
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-ntc-blue"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-ntc-blue border border-transparent rounded-lg hover:bg-ntc-dark focus:outline-none focus:ring-2 focus:ring-ntc-blue disabled:opacity-50"
            >
              {submitting ? 'Saving changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserDetailEditForm;