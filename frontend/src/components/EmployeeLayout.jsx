import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Fix path if necessary
import Sidebar from './Sidebar';
import Header from './dashboard/Header';
import { LayoutDashboard, Car, Database, BookOpen, Activity,History } from 'lucide-react';

const EMPLOYEE_NAVIGATION_OPTIONS = [
    { label: 'Employee Dashboard', path: '/dashboard/employee', icon: LayoutDashboard },
    { label: 'My Requests', path: '/dashboard/employee/bookinglist', icon: History },
    { label: 'Request Vehicle', path: '/dashboard/employee/booking', icon: Car }
];

const EmployeeLayout = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ntc-gray font-sans antialiased text-ntc-dark">
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
        sidebarcomp={EMPLOYEE_NAVIGATION_OPTIONS}
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

export default EmployeeLayout;
