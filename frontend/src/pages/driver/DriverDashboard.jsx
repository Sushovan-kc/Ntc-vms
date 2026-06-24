import React, { useState, useEffect, useRef } from 'react';
import { User, Car, LayoutDashboard,ClipboardList,Hash} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

// Atomic Presentation Layers Import
import Sidebar from '../../components/Sidebar';
import Header from '../../components/dashboard/Header';
import ProfileCard from '../../components/dashboard/ProfileCard';
import DocumentVault from '../../components/dashboard/DocumentVault';
import UniversalTable from '../../components/dashboard/UniversalTable';

// 🟢 FIX 1: Extracted menu array outside component block to resolve infinite rendering loops
const DRIVER_NAVIGATION_OPTIONS = [
  { label: 'Driver Profile', path: '/dashboard/driver', icon: LayoutDashboard },
  { label: 'My Vehicle', path: '/dashboard/driver/myvehicle', icon: Car },
      { label: 'My Dispatches', path: '/dashboard/driver/dispatches', icon: MapPin }
];

import { MapPin, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react'; // Optional: for badge icons

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



const DriverDashboard = () => {
  const { user } = useAuth();
  const username =user?.username;
  // Application Data States
  const [driverDetails, setDriverDetails] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Responsive UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const fileInputRef = useRef(null);

  const hydrateDashboardData = async () => {
    try {
      const profileResponse = await apiClient.get('/api/driver/update/');
      setDriverDetails(profileResponse.data);

      const [vehicleResult, dispatchResult] = await Promise.allSettled([
        apiClient.get('/api/driver/vehicleinfo/'),
        apiClient.get('/api/driver/mydispatchinfo/')
      ]);

      if (vehicleResult.status === 'fulfilled') {
        setVehicle(vehicleResult.value.data || null);
      } else {
        if (vehicleResult.reason.response?.status !== 404) console.error(vehicleResult.reason);
        setVehicle(null);
      }

      if (dispatchResult.status === 'fulfilled') {
        setDispatches(dispatchResult.value.data || []);
      } else {
        if (dispatchResult.reason.response?.status !== 404) console.error(dispatchResult.reason);
        setDispatches([]);
      }

    } catch (err) {
      console.error("Core engine synchronization exception:", err);
    } finally {
      // 🟢 FIX 2: Moved inside finally block to ensure loading state drops even on partial API failures
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) hydrateDashboardData();
  }, [user]);

  const handleFileUpload = async () => {
    const file = fileInputRef.current?.files[0];
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('license_image', file);

    try {
      await apiClient.post('/api/driver/update/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert("Verification documentation synced successfully!");
      hydrateDashboardData();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e) {
      const errorMsg = e.response?.data?.error || e.response?.data?.detail || e.message;
      alert("Upload failed: " + errorMsg);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ntc-gray text-ntc-muted font-semibold tracking-wide">
        Securely handshaking interface variables with core...
      </div>
    );
  }
const driverFields = [
  { 
    label: "Assigned Vehicle", 
    value: vehicle ? `${vehicle.manufacturer} ${vehicle.model}` : "Unassigned Pool", 
    icon: Car 
  },
  { 
    label: "License Plate", 
    value: vehicle?.license_plate || null, // Matches your verified JSON key
    icon: Hash,
    render: (val) => {
      if (!val) return <span className="text-gray-400">—</span>;
      return (
        <span className="inline-block bg-slate-900 text-white px-2.5 py-1 text-xs font-mono rounded font-bold tracking-wider shadow-sm">
          {val}
        </span>
      );
    }
  }
];
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ntc-gray font-sans antialiased text-ntc-dark">
      {/* 🟢 FIX 3: Linked the Sidebar component down to use the stable static array prop */}
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
        sidebarcomp={DRIVER_NAVIGATION_OPTIONS}
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
            Driver Command Center
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4">
               <ProfileCard
                      title={username || "Loading Account..."} // Directly forces string rendering while loading
                      badgeText={`ID: #${driverDetails?.id || 'UNLINKED'}`}
                      icon={User}
                      statusLabel="Current Profile Status"
                      statusText={driverDetails?.driver_status || 'AVAILABLE'}
                      statusVariant={driverDetails?.driver_status === 'ON TRIP' ? 'warning' : 'success'}
                      fields={driverFields}
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

          <UniversalTable 
                title="Dispatch Manifests" 
                icon={ClipboardList} 
                columns={dispatchColumns} 
                data={dispatches}
              />
                          </main>
              </div>
            </div>
  );
};

export default DriverDashboard;
