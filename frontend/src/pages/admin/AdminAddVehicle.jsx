import { React,useState,useEffect } from 'react'
import adminservices from '../../api/services/adminservices'
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/dashboard/Header';
import { User, Car, LayoutDashboard,MapPin,Truck,Database,Activity,BookOpen} from 'lucide-react';
import VehicleAddForm from '../../components/vehicle/VehicleAddForm';



const AdminNavigationOptions = [
    { label: 'Admin Profile', path: '/dashboard/admin/', icon: LayoutDashboard },
    { label: 'Manage Vehicle', path: '/dashboard/admin/vehicles', icon: Car },
    { label: 'Add Vehicle', path: '/dashboard/admin/addvehicles', icon: Database },
    { label: 'Manage Bookings', path: '/dashboard/admin/bookings', icon: BookOpen },
    { label: 'Manage Dispatch', path: '/dashboard/admin/dispatch', icon: Activity },
];


const AdminAddVehicle = () => {

    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

return (
    <div className="flex h-screen w-screen overflow-hidden bg-ntc-gray font-sans antialiased text-ntc-dark">
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

        <main className="flex-1 p-6 overflow-y-auto bg-ntc-gray space-y-6 flex flex-col items-center">
          <div className="w-full max-w-2xl text-left self-center">
            <h1 className="text-ntc-dark font-black text-2xl tracking-tight flex items-center gap-3">
              <Database className="text-ntc-blue" size={28} />
              Vehicle Addition Module
            </h1>
            <p className="text-xs text-ntc-muted font-medium mt-0.5 mb-6">
              Global administration registry for monitoring line-haul operations assets and assigning active crews.
            </p>
          </div>

          {/* 🟢 Render Form Component cleanly inside your centered column layout space */}
          <VehicleAddForm onAdditionSuccess={() => console.log('Database synchronization updated.')} />
        </main>
      </div>
    </div>
  );
};
export default AdminAddVehicle