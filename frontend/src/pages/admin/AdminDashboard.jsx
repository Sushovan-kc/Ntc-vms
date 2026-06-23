import { React,useState,useEffect } from 'react'
import{adminservices} from '../../api/services/adminservices'
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/dashboard/Header';
import ProfileCard from '../../components/dashboard/ProfileCard';
import DocumentVault from '../../components/dashboard/DocumentVault';
import ManifestTable from '../../components/dashboard/UniversalTable';
import { User, Car, LayoutDashboard,MapPin } from 'lucide-react';



const AdminNavigationOptions = [
  { label: 'Add Vehicle', path: '/dashboard/admin/add-vehicle', icon: LayoutDashboard },
];

const AdminDashboard = () => {
    const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
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
            <User className="text-ntc-blue" size={28} />
            Admin Command Center
          </h1>

          {/* <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4">
              <ProfileCard 
                username={user?.username}
                driverId={driverDetails?.id}
                driverStatus={driverDetails?.driver_status}
                vehicle={vehicle}
              />
            </div>

            <div className="lg:col-span-8">
              <DocumentVault 
                licenseImage={driverDetails?.license_image}
                uploading={uploading}
                fileInputRef={fileInputRef}
                onFileUpload={handleFileUpload}
              />
            </div>
          </div>

          <ManifestTable dispatches={dispatches} /> */}
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard