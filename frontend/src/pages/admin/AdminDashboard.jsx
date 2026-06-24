import { React,useState,useEffect } from 'react'
import{adminservices} from '../../api/services/adminservices'
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/dashboard/Header';
import ProfileCard from '../../components/dashboard/ProfileCard';
import DocumentVault from '../../components/dashboard/DocumentVault';
import ManifestTable from '../../components/dashboard/UniversalTable';
import { User, Car, LayoutDashboard,MapPin,Truck} from 'lucide-react';
import { Shield, Mail, Phone, Landmark, CheckCircle,UserCheck,UserStar,Settings2 } from 'lucide-react';
import ProfileUpdateForm from '../../components/ProfileUpdateForm';


const AdminNavigationOptions = [
  { label: 'Admin Profile', path: '/dashboard/admin/', icon: LayoutDashboard },
  { label: 'Add Vehicle', path: '/dashboard/admin/vehicles', icon: Car },
];

const AdminDashboard = () => {
    const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);


  const [userDetails, setUserDetails] = useState(null);
  const [updating, setUpdating] = useState(false);




  // 1. Declare input rules (True configuration-driven setup matching your layout)
  const profileFormFields = [
    { label: "System Username ID", key: "username", icon: User, readOnly: true },
    { label: "Assigned Privilege Level", key: "role", icon: Shield, readOnly: true },
    { label: "First Operational Name", key: "first_name", icon: User, placeholder: "Update legal first name" },
    { label: "Last Operational Name", key: "last_name", icon: User, placeholder: "Update legal last name" },
    { label: "Secure Communications Email", key: "email", type: "email", icon: Mail, placeholder: "driver@company.com" },
    { label: "Mobile Contact String", key: "phone_number", type: "tel", icon: Phone, placeholder: "Enter terminal phone number" },
  ];





  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const profile = await adminservices.AdminProfile();
        setUserDetails(profile);
      } catch (error) {
        console.error('Error fetching admin profile:', error);
      }
    };

    fetchAdminProfile();
  }, []);





const AdminFields = [
  { 
    label: "System Role", 
    value: userDetails?.role || 'User Node', 
    icon: Shield,
    // Formats the text nicely to uppercase with a prominent bold style
    render: (val) => <span className="font-extrabold text-ntc-blue uppercase tracking-wider">{val}</span>
  },
  { 
    label: "Clearance State", 
    value: userDetails?.role_approved, 
    icon: CheckCircle,
    // Generates a status indicator based on boolean true/false values
    render: (val) => val ? (
      <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-ntc-success border border-emerald-200 text-xs font-black rounded-full uppercase">
        Approved Node
      </span>
    ) : (
      <span className="inline-block px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black rounded-full uppercase">
        Pending Validation
      </span>
    )
  },
  { 
    label: "Email Terminal", 
    value: userDetails?.email || '—', 
    icon: Mail,
    render: (val) => <span className="text-gray-500 font-medium lowercase select-all text-xs">{val}</span>
  },
  { 
    label: "Contact String", 
    value: userDetails?.phone_number || '—', 
    icon: Phone,
    render: (val) => <span className="font-mono text-xs font-bold text-slate-700">{val}</span>
  },
  { 
    label: "Branch", 
    value: user?.userbranch, 
    icon: Landmark,
    // Pulls the numerical index and formats it as a corporate branch identifier
    render: (val) => val ? `${val}` : "Global Admin Context"
  }
];


const handleProfilePatchUpdate = async (formData) => {
    setUpdating(true);
    try {
      // 🟢 One clean, descriptive function call completely abstracts the API
      const freshData = await adminservices.handleProfilePatchUpdate(formData,user?.user_id);
      setUserDetails(freshData); 
      alert("System node configuration updated successfully!");
    } catch (err) {
      console.error("Profile synchronization modification error:", err);
      alert("Failed to commit profile updates.");
    } finally {
      setUpdating(false);
    }
  };

  return (
   <div className="flex h-screen w-screen overflow-hidden bg-ntc-gray font-sans antialiased text-ntc-dark">
      {/* 🟢 FIX 3: Linked the Sidebar component down to use the stable static array prop */}
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
        sidebarcomp={AdminNavigationOptions}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full w-full transition-all duration-300">
        <Header 
          userRole={user?.role} 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
          setIsMobileOpen={setIsMobileOpen} 
            branchName={user?.userbranch || 'N/A'}
        />

        <main className="flex-1 p-6 overflow-y-auto bg-ntc-gray space-y-6">
          <h1 className="text-ntc-dark font-black text-2xl tracking-tight flex items-center gap-3">
            <UserStar className="text-ntc-blue" size={28} />
            Admin Command Center
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4">
          <ProfileCard
            // Combines first name and last name dynamically for the top header line
            title={userDetails ? `${userDetails.first_name} ${userDetails.last_name}` : "System Admin"}
            badgeText={`SYS-UID: #AD-${userDetails?.user || 'UNBOUND'}`}
            icon={UserCheck}
            statusLabel="Access Profile Verification"
            statusText={userDetails?.role_approved ? 'AUTHORIZED' : 'LOCKED'}
            statusVariant={userDetails?.role_approved ? 'success' : 'danger'}
            fields={AdminFields} // Injects the configured admin properties list cleanly
          />
            </div> 

             <div className="lg:col-span-8 bg-black">
              <ProfileUpdateForm
                      title="Edit Node Profile Registry"
            icon={Settings2}
            initialData={userDetails}
            fields={profileFormFields}
            onSave={handleProfilePatchUpdate}
            isSubmitting={updating}
          />
            </div>


          {/* <ManifestTable dispatches={dispatches} /> */}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard