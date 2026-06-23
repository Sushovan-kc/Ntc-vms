import React, { useState, useEffect } from 'react';
import { ClipboardList, Calendar, MapPin, Truck, Shield, Clock, HelpCircle ,Car} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

// Shared Presentation Layout Layers
import Sidebar from '../../components/Sidebar';
import Header from '../../components/dashboard/Header';

// Static Reference Navigation Array to prevent infinite render loops
const NAVIGATION_MENU_OPTIONS = [
  { label: 'Driver Operations', path: '/dashboard/driver', icon: ClipboardList },
  { label: 'My Vehicle', path: '/dashboard/driver/vehicle', icon: Car},
    { label: 'My Dispatches', path: '/dashboard/driver/dispatches', icon: MapPin },  

];

const DriverDispatchesPage = () => {
  const { user } = useAuth();
  
  // Layout Structural Toggle States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Data States
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDispatchData = async () => {
      try {
        // Hits your exact 'driver-dispatches' Django REST endpoint logged in your console
        const response = await apiClient.get('/api/driver/mydispatchinfo/');
        setDispatches(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error("Error fetching driver manifest streams:", err);
        }
        setDispatches([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDispatchData();
  }, [user]);

  // Utility to format ISO Timestamps into highly readable text logs
  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ntc-gray text-ntc-muted font-semibold tracking-wide">
        Querying logistics manifest stream...
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ntc-gray font-sans antialiased text-ntc-dark">
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
        sidebarcomp={NAVIGATION_MENU_OPTIONS} 
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
            <ClipboardList className="text-ntc-blue" size={28} />
            My Dispatch Assignments
          </h1>

          {dispatches.length === 0 ? (
            /* Empty Fallback State Card */
            <div className="max-w-4xl bg-white rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-center p-12 space-y-3">
              <ClipboardList size={64} className="text-ntc-muted mx-auto opacity-30" />
              <h3 className="text-lg font-bold text-ntc-dark">No Dispatches Scheduled</h3>
              <p className="text-ntc-muted text-sm max-w-sm mx-auto">
                You do not have any operational dispatch requests allocated to your profile at the moment.
              </p>
            </div>
          ) : (
            /* Detailed Dispatch Cards Container Layout */
            <div className="space-y-6 max-w-4xl">
              {dispatches.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] overflow-hidden border border-gray-100 transition-all duration-200 hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)]"
                >
                  {/* Banner Top Header */}
                  <div className="bg-gradient-to-r from-ntc-blue to-blue-800 px-6 py-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-ntc-light-blue uppercase block opacity-80">Line-haul Manifest Node</span>
                      <h3 className="text-lg font-black tracking-wide">DISPATCH #00{item.id}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide border ${
                        item.booking_status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-200 border-amber-500/30'
                      }`}>
                        Booking: {item.booking_status}
                      </span>
                    </div>
                  </div>

                  {/* Core Metrics Content Panel Section */}
                  <div className="p-6 space-y-6">
                    {/* Primary Route Specs and Info Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Booking Requestor details */}
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-lg bg-ntc-light-blue text-ntc-blue mt-0.5">
                          <Shield size={18} />
                        </div>
                        <div>
                          <span className="text-xs text-ntc-muted font-bold block uppercase tracking-wider">Assigned Task Custodian</span>
                          <span className="text-sm font-bold text-ntc-dark block mt-0.5">{item.booking_user}</span>
                          <span className="text-xs text-ntc-muted font-medium mt-1 flex items-center gap-1">
                            <HelpCircle size={12} /> Purpose: {item.booking_purpose || 'Standard Operational Assignment'}
                          </span>
                        </div>
                      </div>

                      {/* Fleet Asset Details Section */}
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-lg bg-ntc-light-blue text-ntc-blue mt-0.5">
                          <Car size={18} />
                        </div>
                        <div>
                          <span className="text-xs text-ntc-muted font-bold block uppercase tracking-wider">Allocated Fleet Machine</span>
                          <span className="text-sm font-bold text-ntc-dark block mt-0.5">{item.vehicle_manufacturer} {item.vehicle_model}</span>
                          <span className="inline-block mt-1.5 font-mono text-xs font-black text-ntc-dark bg-ntc-gray border px-2 py-0.5 rounded shadow-sm tracking-wider">
                            {item.vehicle_license_plate}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Operational Timeframe Schedule Block Section */}
                    <div className="border-t border-gray-100 pt-4 bg-ntc-gray/50 rounded-xl p-4 border border-dashed border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Start Time Schedule block */}
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg text-ntc-blue shadow-sm border border-gray-100">
                          <Calendar size={16} />
                        </div>
                        <div>
                          <span className="text-[10px] text-ntc-muted font-bold uppercase tracking-wider">Deployment Start Time</span>
                          <span className="text-xs font-bold text-ntc-dark block mt-0.5">{formatDateTime(item.booking_start_time)}</span>
                        </div>
                      </div>

                      {/* End Time Schedule block */}
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg text-ntc-danger shadow-sm border border-gray-100">
                          <Clock size={16} />
                        </div>
                        <div>
                          <span className="text-[10px] text-ntc-muted font-bold uppercase tracking-wider">Expected Completion</span>
                          <span className="text-xs font-bold text-ntc-dark block mt-0.5">{formatDateTime(item.booking_end_time)}</span>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DriverDispatchesPage;
