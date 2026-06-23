import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import { 
  CarFront, 
  History, 
  ClipboardList, 
  CheckCircle2, 
  AlertCircle, 
  LayoutDashboard,
  Car
} from 'lucide-react';

// Atomic Core Shared Presentation Layers Import
import Sidebar from '../../components/Sidebar';
import Header from '../../components/dashboard/Header';
import ActionHubCard from '../../components/dashboard/ActionHubCard';
import StatCard from '../../components/dashboard/StatCard';

// 🟢 FIX 1: Extracted navigation menu array outside component block to stop infinite rendering loops
const EMPLOYEE_NAVIGATION_OPTIONS = [
  { label: 'Employee Dashboard', path: '/dashboard/employee', icon: LayoutDashboard },
  { label: 'My Requests', path: '/dashboard/employee/bookinglist', icon: History },
  { label: 'Request Vehicle', path: '/dashboard/employee/booking', icon: Car }
];

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // 🟢 FIX 2: Added structural layout responsive toggle state handlers
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Local Operational Analytics State Variables
  const [metrics, setMetrics] = useState({ pending: 0, approved: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployeeMetrics = async () => {
      try {
        const response = await apiClient.get('api/booking/mybookings/');
        const myBookings = response.data || [];
        
        // Safe standard data-array evaluation filters
        const pending = myBookings.filter(r => 
          ['PENDING', 'Pending', 'Pending approval.'].includes(r.status)
        ).length;
        
        const approved = myBookings.filter(r => 
          ['APPROVED', 'Approved', 'IN_PROGRESS', 'On Trip'].includes(r.status)
        ).length;
        
        setMetrics({ pending, approved, total: myBookings.length });
      } catch (error) {
        console.error('❌ Error fetching employee metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchEmployeeMetrics();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ntc-gray text-ntc-muted font-semibold tracking-wide">
        Loading your portal workspace variables...
      </div>
    );
  }

  return (
    // 🟢 FIX 3: Replaced raw canvas with the dual-column fluid enterprise structure
    <div className="flex h-screen w-screen overflow-hidden bg-ntc-gray font-sans antialiased text-ntc-dark">
      
      {/* Shared Sidebar Component Hook */}
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
        sidebarcomp={EMPLOYEE_NAVIGATION_OPTIONS} 
      />

      <div className="flex-1 flex flex-col min-w-0 h-full w-full transition-all duration-300">
        
        {/* Shared Top Header Component Hook */}
        <Header 
          userRole={user?.role} 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
          setIsMobileOpen={setIsMobileOpen} 
          branchName={user?.userbranch || 'N/A'}
        />

        {/* Scroll Container Workspace Main Body Area */}
        <main className="flex-1 p-6 overflow-y-auto bg-ntc-gray space-y-6">
          
          {/* Welcome Copy Panel Row Section */}
          <div className="flex flex-col mb-4 pb-2">
            <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-ntc-blue to-cyan-500 bg-clip-text text-transparent mb-1 tracking-tight">
              Welcome back, {user?.first_name || user?.username || 'Employee'}!
            </h2>
            <p className="text-ntc-muted text-base">What would you like to do today?</p>
          </div>

          {/* Action Cards Hub Grid Layout Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ActionHubCard 
              title="Book a Vehicle"
              description="Submit a new booking request for official enterprise travel."
              icon={CarFront}
              iconBgColor="bg-ntc-blue/10 group-hover:bg-ntc-blue/15"
              iconColor="text-ntc-blue"
              onClick={() => navigate('/dashboard/employee/bookings')}
            />

            <ActionHubCard 
              title="My Requests"
              description="View your active dispatch trips and historical travel logs."
              icon={History}
              iconBgColor="bg-cyan-500/10 group-hover:bg-cyan-500/15"
              iconColor="text-cyan-600"
              onClick={() => navigate('/dashboard/employee/bookinglist')}
            />
          </div>

          {/* Analytics Header Summary Segment */}
          <div className="pt-4">
            <h4 className="text-xl font-bold text-ntc-dark mb-4 tracking-tight">Your Travel Overview</h4>
            
            {/* Travel Operational Metrics Widgets Grid Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                title="Total Requests"
                value={metrics.total}
                icon={ClipboardList}
                borderLeftColor="border-l-ntc-blue"
                iconBgColor="bg-ntc-blue/10"
                iconColor="text-ntc-blue"
              />

              <StatCard 
                title="Pending Approval"
                value={metrics.pending}
                icon={AlertCircle}
                borderLeftColor="border-l-amber-500"
                iconBgColor="bg-amber-500/10"
                iconColor="text-amber-600"
              />

              <StatCard 
                title="Approved Trips"
                value={metrics.approved}
                icon={CheckCircle2}
                borderLeftColor="border-l-ntc-success"
                iconBgColor="bg-ntc-success/10"
                iconColor="text-ntc-success"
              />
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
