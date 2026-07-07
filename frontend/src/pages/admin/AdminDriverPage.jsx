import { React, useState, useEffect } from 'react'
import adminservices from '../../api/services/adminservices'
import { useAuth } from '../../context/AuthContext';
import { Users, ClipboardList, Edit2, Trash2 } from 'lucide-react';
import UniversalTable from '../../components/dashboard/UniversalTable';
import PendingUsersSection from '../../components/admin/PendingUserSection';
import UserDetailEditForm from '../../components/admin/UserDetailEditForm';



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
      const statusStr = val?.toUpperCase() || 'UNAVAILABLE';
      let badgeStyle = "bg-slate-100 text-slate-700 border-slate-300";
      
      if (statusStr === 'UNAVAILABLE') badgeStyle = "bg-red-50 text-red-700 border-red-200";
      if (statusStr === 'ON_TRIP') badgeStyle = "bg-sky-50 text-sky-700 border-sky-200";
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
    render: (val) => val && val.trim() !== "" ? val : "N/A"
   
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
          onClick={() => onDelete(row.id, row.username)} // 🌟 Added username parameter for clearer confirmations
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
  const [loading, setLoading] = useState(true);

  // 🌟 Added: Local state tracking handles modal UI toggles and selected record context
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);


    const handleEditProfile = (profileRow) => {
    setSelectedUser(profileRow);
    setIsEditOpen(true);
  };

    const hydrateUserDashboardData = async () => {
    setLoading(true);
    try {
      const [usersResult] = await Promise.allSettled([
        adminservices.getDriverProfileList() 
      ]);

      if (usersResult.status === 'fulfilled') {
        const profileData = usersResult.value?.results || usersResult.value || [];
        setUsers(profileData);
      } else {
        if (usersResult.reason.response?.status !== 404) {
          console.error("User profiles registry stream breakdown:", usersResult.reason);
        }
        setUsers([]);
      }
    } catch (err) {
      console.error("Core user management engine synchronization exception:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {if (user) hydrateUserDashboardData();}, [user]);
  // 🌟 Added: Live connection handling for backend account removal actions
  const handleDeleteProfile = async (profileId, username) => {
    if (window.confirm(`Are you sure you want to permanently remove user profile "${username || profileId}"?`)) {
      try {
        // Change "deleteUserProfile" to match your exact backend method string inside adminservices
        const [response] = await Promise.allSettled([
          adminservices.deleteUserProfile(profileId)
        ]);

        if (response.status === 'fulfilled') {
          await hydrateUserDashboardData(); // Re-fetch list to sync data arrays
        } else {
          alert("Failed to delete user profile.");
        }
      } catch (err) {
        console.error("Profile termination hook failure:", err);
      }
    }
  };

  return (
    <>
      <main className="flex-1 p-6 overflow-y-auto bg-ntc-gray space-y-6">
        <h1 className="text-ntc-dark font-black text-2xl tracking-tight flex items-center gap-3">
          <Users className="text-ntc-blue" size={28} />
          Driver Details Management
        </h1>

        <UniversalTable 
          title="Driver Details" 
          icon={ClipboardList} 
          columns={userColumns(handleEditProfile, handleDeleteProfile)} 
          data={users}
        />
      </main>


    </>)

}


export default AdminDriverPage
