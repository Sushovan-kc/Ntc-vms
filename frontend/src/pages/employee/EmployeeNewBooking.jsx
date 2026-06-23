import React, { useState } from 'react';
import { History, LayoutDashboard, CarFront,Car } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Atomic Core Shared Presentation Layers Import
import Sidebar from '../../components/Sidebar';
import Header from '../../components/dashboard/Header';
import RequestForm from '../../components/employee/RequestForm';

// 🟢 NAVIGATION CONFIGURATION: Matches the options array of the Employee Dashboard
const EMPLOYEE_NAVIGATION_OPTIONS = [
  { label: 'Employee Dashboard', path: '/dashboard/employee', icon: LayoutDashboard },
  { label: 'My Requests', path: '/dashboard/employee/bookinglist', icon: History },
  { label: 'Request Vehicle', path: '/dashboard/employee/booking', icon: Car }
];

const VehicleRequest = () => {
  const { user } = useAuth();

  // 🟢 LAYOUT STATES: Handles smooth responsive sidebar and drawer transitions
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ntc-gray font-sans antialiased text-ntc-dark">
      
      {/* Shared Sidebar Shell */}
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
        sidebarcomp={EMPLOYEE_NAVIGATION_OPTIONS} 
      />

      <div className="flex-1 flex flex-col min-w-0 h-full w-full transition-all duration-300">
        
        {/* Shared Top Navigation Bar */}
        <Header 
          userRole={user?.role} 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
          setIsMobileOpen={setIsMobileOpen} 
          branchName={user?.userbranch || 'N/A'}
        />

        {/* Scroll Container Workspace Main Body Area */}
        <main className="flex-1 p-6 overflow-y-auto bg-ntc-gray space-y-6">
          
          {/* Module Title Context Header Row */}
          <div className="flex flex-col pb-4 border-b border-gray-200">
            <h1 className="text-ntc-dark font-black text-2xl tracking-tight flex items-center gap-3">
              <CarFront className="text-ntc-blue" size={28} />
              Request an Vehicle
            </h1>
            <p className="text-ntc-muted text-xs font-medium mt-1">
              Provide travel itineraries, schedules, and allocation motives to submit a formal line-haul request.
            </p>
          </div>

          {/* Form Containment Node Wrapper */}
          <div className="flex flex-wrap justify-center item-center bg-white p-6 md:p-8 rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-gray-100">
            <RequestForm />
          </div>

        </main>
      </div>
    </div>
  );
};

export default VehicleRequest;
