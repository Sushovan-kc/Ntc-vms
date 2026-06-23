import React, { useState, useEffect, useRef } from 'react';
import { User, Car, LayoutDashboard,MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

// Atomic Presentation Layers Import
import Sidebar from '../../components/Sidebar';
import Header from '../../components/dashboard/Header';
import ProfileCard from '../../components/dashboard/ProfileCard';
import DocumentVault from '../../components/dashboard/DocumentVault';
import ManifestTable from '../../components/dashboard/ManifestTable';

// 🟢 FIX 1: Extracted menu array outside component block to resolve infinite rendering loops
const DRIVER_NAVIGATION_OPTIONS = [
  { label: 'Driver Operations', path: '/dashboard/driver', icon: LayoutDashboard },
  { label: 'My Vehicle', path: '/dashboard/driver/myvehicle', icon: Car },
      { label: 'My Dispatches', path: '/dashboard/driver/dispatches', icon: MapPin }
];

const DriverDashboard = () => {
  const { user } = useAuth();
  
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

          <ManifestTable dispatches={dispatches} />
        </main>
      </div>
    </div>
  );
};

export default DriverDashboard;
