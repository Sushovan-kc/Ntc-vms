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



const dispatchColumns = [
  { 
    header: "ID", 
    key: "id", 
    render: (val) => <span className="font-bold text-ntc-dark">DISPATCH-#{val}</span> 
  },
  {
    header:"Booked By",
    key:"booking_user",
    render:(val) => <span className="font-medium text-ntc-dark">{val || 'N/A'}</span>
  },
  { 
    header: "Destination", 
    key: "booking_purpose",
    // Fixes the empty string fallback
    render: (val) => {
      return val && val.trim() !== "" ? val : "General Operations / Not Specified";
    }
  },
 {
    header: "Assigned Fleet Unit",
    key: "vehicle_model", // This can be any key from your row; the render function overrides it
    // 💡 Accessing 'row' allows you to read multiple fields at once
    render: (val, row) => {
      const vehicleDetails = `${row.vehicle_manufacturer} ${row.vehicle_model}`;
      const plateNumber = row.vehicle_license_plate;

      return (
        <div className="flex flex-col">
          <span className="font-semibold text-ntc-dark">{vehicleDetails}</span>
          <span className="text-xs text-ntc-blue font-mono font-bold tracking-wide mt-0.5">
            💳 {plateNumber || 'No Plate Registered'}
          </span>
        </div>
      );
    }
  },
  { 
    header: "Booking Status", 
    key: "booking_status",
    // Adds beautiful badge styling matching the driver_status from your API
    render: (val) => {
      const normalizedStatus = val?.toUpperCase();
      
      let badgeStyle = "bg-blue-50 text-ntc-blue border-blue-200"; // Default / PENDING
      
      if (normalizedStatus === 'COMPLETED') {
        badgeStyle = "bg-emerald-50 text-ntc-success border-emerald-200";
      } else if (normalizedStatus === 'ON TRIP') {
        badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
      } else if (normalizedStatus === 'AVAILABLE') {
        // Style for your current API data state
        badgeStyle = "bg-teal-50 text-teal-700 border-teal-200"; 
      }

      return (
        <span className={`inline-block px-3 py-1 rounded-[20px] text-xs font-bold border ${badgeStyle}`}>
          {normalizedStatus || 'PENDING DISPATCH'}
        </span>
      );
    }
  }
];
const AdminDispatchPage = () => {

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
            <Car className="text-ntc-blue" size={28} />
            Admin Command Center
          </h1>
          </main>
      </div>
    </div>
  )
}

export default AdminDispatchPage