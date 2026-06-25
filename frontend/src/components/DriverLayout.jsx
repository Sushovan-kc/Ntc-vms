import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Fix path if necessary
import Sidebar from './Sidebar';
import Header from './dashboard/Header';
import { LayoutDashboard, Car, Database, BookOpen, Activity,MapPin } from 'lucide-react';


const DRIVER_NAVIGATION_OPTIONS = [
    { label: 'Driver Profile', path: '/dashboard/driver', icon: LayoutDashboard },
    { label: 'My Vehicle', path: '/dashboard/driver/myvehicle', icon: Car },
    { label: 'My Dispatches', path: '/dashboard/driver/dispatches', icon: MapPin }
];

const DriverLayout = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ntc-gray font-sans antialiased text-ntc-dark">
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

        {/* Dynamic workspace context updates here */}
        <main className="flex-1 p-6 overflow-y-auto bg-ntc-gray space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DriverLayout;
