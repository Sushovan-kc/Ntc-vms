import { React, useState, useEffect } from 'react'
import adminservices from '../../api/services/adminservices'
import { useAuth } from '../../context/AuthContext';
import { Users, ClipboardList, Edit2, Trash2 } from 'lucide-react';
import UniversalTable from '../../components/dashboard/UniversalTable';

// Imported your Edit Component here
import AdminEditDriverForm from '../../components/admin/AdminEditDriverForm'; 

const userColumns = (onEdit, onDelete) => [
  { 
    header: "ID", 
    key: "id", 
    render: (val) => <span className="font-bold text-ntc-dark">USER-#{val}</span> 
  },
  {
    header: "Username",
    key: "username",
    render: (val) => <span className="font-medium text-ntc-dark">{val || 'N/A'}</span>
  },
  {
    header: "Full Name",
    key: "first_name",
    render: (_, row) => {
      const full = `${row.first_name || ''} ${row.last_name || ''}`.trim();
      return <span className="text-ntc-dark">{full || <span className="text-gray-400 italic">Not Provided</span>}</span>;
    }
  },
  { 
    header: "Address", 
    key: "address",
    render: (val) => val && val.trim() !== "" ? val : "N/A"
  },
  { 
    header: "Phone", 
    key: "phone_number",
    render: (val) => val || "N/A"
  },
  { 
    header: "Driver Status", 
    key: "driver_status",
    render: (val) => {
      const statusStr = val?.toUpperCase().replace('_', ' ') || 'UNAVAILABLE';
      let badgeStyle = "bg-slate-100 text-slate-700 border-slate-300";
      
      if (statusStr === 'UNAVAILABLE') badgeStyle = "bg-red-50 text-red-700 border-red-200";
      if (statusStr === 'ON TRIP') badgeStyle = "bg-sky-50 text-sky-700 border-sky-200";
      if (statusStr === 'AVAILABLE') badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";

      return (
        <span className={`inline-block px-3 py-0.5 rounded-[20px] text-xs font-black border uppercase tracking-wider ${badgeStyle}`}>
          {statusStr}
        </span>
      );
    }
  },
  { 
    header: "License Number", 
    key: "license_number",
    render: (val) => val && val.trim() !== "" && !val.startsWith("PENDING-SETUP-") ? val : <span className="text-amber-600 italic text-xs">Pending Setup</span>
  },
  {
    header: "Actions",
    key: "actions",
    render: (_, row) => (
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onEdit(row)}
          className="p-1.5 rounded bg-slate-100 hover:bg-ntc-blue hover:text-white text-slate-600 transition-colors shadow-sm"
          title="Edit Profile"
        >
          <Edit2 size={14} />
        </button>
        <button 
          onClick={() => onDelete(row.id, row.username)} 
          className="p-1.5 rounded bg-slate-100 hover:bg-rose-500 hover:text-white text-rose-600 transition-colors shadow-sm"
          title="Delete Profile"
        >
          <Trash2 size={14} />
        </button>
      </div>
    )
  }
];

const AdminDriverPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); 

  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleEditProfile = (profileRow) => {
    setSelectedUser(profileRow);
    setIsEditOpen(true);
  };

  const hydrateUserDashboardData = async () => {
    setLoading(true);
    try {
      const [usersResult, branchesResult] = await Promise.allSettled([
        adminservices.getDriverProfileList(),
        adminservices.getBranchList ? adminservices.getBranchList() : Promise.resolve([])
      ]);

      if (usersResult.status === 'fulfilled') {
        const profileData = usersResult.value?.results || usersResult.value || [];
        setUsers(profileData);
      } else {
        setUsers([]);
      }

      if (branchesResult.status === 'fulfilled') {
        setBranches(branchesResult.value?.results || branchesResult.value || []);
      }
    } catch (err) {
      console.error("Core user management engine exception:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) hydrateUserDashboardData(); }, [user]);

  const handleSaveDriverProfile = async (driverId, packedFormData) => {
    setIsSaving(true);
    try {
      await adminservices.updateDriverProfile(driverId, packedFormData);
      alert("Driver information updated and synced successfully!");
      setIsEditOpen(false); 
      setSelectedUser(null);
      await hydrateUserDashboardData(); 
    } catch (err) {
      const apiError = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      alert("Failed to save changes: " + apiError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProfile = async (profileId, username) => {
    if (window.confirm(`Are you sure you want to permanently remove user profile "${username || profileId}"?`)) {
      try {
        const [response] = await Promise.allSettled([
          adminservices.deleteUserProfile(profileId)
        ]);
        if (response.status === 'fulfilled') {
          await hydrateUserDashboardData(); 
        } else {
          alert("Failed to delete user profile.");
        }
      } catch (err) {
        console.error("Profile termination hook failure:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ntc-gray text-ntc-muted font-semibold tracking-wide">
        Synchronizing administrative driver metrics with core database arrays...
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 overflow-y-auto bg-ntc-gray space-y-6 relative">
      
      {/* 1. Header Frame */}
      <h1 className="text-ntc-dark font-black text-2xl tracking-tight flex items-center gap-3">
        <Users className="text-ntc-blue" size={28} />
        Driver Details Management
      </h1>

      {/* 2. Background Table (Always Visible) */}
      <UniversalTable 
        title="Driver Details" 
        icon={ClipboardList} 
        columns={userColumns(handleEditProfile, handleDeleteProfile)} 
        data={users}
      />

      {/* 3. Absolute Overlay Modal (Renders on top of table if isEditOpen is True) */}
      {isEditOpen && (
          <div 
            // 🔑 THE FIX: Using explicit inline style with rgba ensures perfect transparency regardless of Tailwind build settings
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[2px] p-4 animate-fadeIn"
            // 💡 Optional UX: Clicking the translucent background area exits edit mode automatically
            onClick={() => { setIsEditOpen(false); setSelectedUser(null); }}
          >
            {/* Form Container Wrapper */}
            <div 
              className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl border border-gray-100"
              // 🔑 CRITICAL: stopPropagation stops clicks inside the form from accidentally closing the modal
              onClick={(e) => e.stopPropagation()}
            >
              <AdminEditDriverForm 
                driverData={selectedUser}
                branches={branches}
                onSave={handleSaveDriverProfile}
                onCancel={() => { setIsEditOpen(false); setSelectedUser(null); }}
                isSaving={isSaving}
              />
            </div>
           </div>
)}

    </main>
  );
}

export default AdminDriverPage;
