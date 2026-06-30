import React, { useState } from 'react';
import { UserCheck, ShieldAlert, AlertCircle } from 'lucide-react';
import adminservices from '../../api/services/adminservices';

const PendingUserCard = ({ profile, onUpdateSuccess }) => {
  const [role, setRole] = useState(profile.role || 'employee');
  // 🟢 Track the raw string representation locally in select component state
  const [approvedState, setApprovedState] = useState(profile.role_approved ? 'true' : 'false');
  const [submitting, setSubmitting] = useState(false);

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      const payload = {
        id: profile.id,
        user: profile.user,
        role: role,
        role_approved: approvedState === 'true',
        phone_number: profile.phone_number,
        branch: profile.branch
      };

      const [response] = await Promise.allSettled([
        adminservices.approvalStatusUpdate(profile.id, payload)
      ]);

      if (response.status === 'fulfilled') {
        onUpdateSuccess();
      } else {
        alert("Failed to update user profile approval status.");
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-md">
      {/* Card Header */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-bold text-ntc-blue uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full">
            Profile ID: #{profile.id}
          </span>
          <h3 className="text-lg font-bold text-ntc-dark mt-2 flex items-center gap-1.5">
            <UserCheck size={18} className="text-gray-400" />
            {fullName || profile.username}
          </h3>
        </div>
        <span className="flex items-center gap-1 text-sm font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
          <AlertCircle size={14} />
          Pending Approval
        </span>
      </div>

      {/* User Meta Details */}
      <div className="text-sm text-gray-500 space-y-1">
        <p><span className="font-semibold text-gray-700">Username:</span> {profile.username}</p>
        <p><span className="font-semibold text-gray-700">Email:</span> {profile.email || 'N/A'}</p>
      </div>

      {/* Form Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {/* Manage Role Assignment */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
            Assign System Role
          </label>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="w-full text-sm rounded-lg border border-gray-300 bg-gray-50 p-2.5 font-medium text-ntc-dark focus:border-ntc-blue focus:ring-1 focus:ring-ntc-blue outline-none"
          >
            <option value="employee">Employee</option>
            <option value="driver">Driver</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Action Status Change */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
            Set Action
          </label>
          <select 
            value={approvedState} 
            onChange={(e) => setApprovedState(e.target.value)}
            className="w-full text-sm rounded-lg border border-gray-300 bg-gray-50 p-2.5 font-medium text-ntc-dark focus:border-ntc-blue focus:ring-1 focus:ring-ntc-blue outline-none"
          >
            <option value="false">Pending</option>
            <option value="true">Approved</option>
          </select>
        </div>
      </div>

      {/* Submit Action Button */}
      <button
        onClick={handleUpdate}
        disabled={submitting}
        className="w-full bg-ntc-blue text-white text-sm font-bold py-2.5 px-4 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
      >
        {submitting ? 'Processing...' : 'Submit Decision'}
      </button>
    </div>
  );
};

const PendingUsersSection = ({ users, onRefresh }) => {
  // Filters out profiles where role_approved boolean is strictly false
  const pendingUsers = users.filter(u => u.role_approved === false);

  if (pendingUsers.length === 0) {
    return (
      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-400 font-medium text-sm">
         No user access profile registrations require immediate manager verification.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black tracking-tight text-ntc-dark flex items-center gap-2">
          <ShieldAlert className="text-amber-500" size={22} />
          Pending Role Access Requests ({pendingUsers.length})
        </h2>
      </div>
      
      {/* Cards Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingUsers.map((profile) => (
          <PendingUserCard 
            key={profile.id} 
            profile={profile} 
            onUpdateSuccess={onRefresh} 
          />
        ))}
      </div>
    </div>
  );
};

export default PendingUsersSection;
