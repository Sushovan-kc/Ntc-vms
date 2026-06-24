import React, { useState, useEffect } from 'react';
import { Car, LayoutDashboard, Hash, Calendar, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {adminservices} from '../../api/services/adminservices';

import Sidebar from '../../components/Sidebar';
import Header from '../../components/dashboard/Header';
import UniversalVehicleCard from '../../components/vehicle/VehicleCard';

const AdminNavigationOptions = [
  { label: 'Admin Profile', path: '/dashboard/admin/', icon: LayoutDashboard },
  { label: 'Add Vehicle', path: '/dashboard/admin/vehicles', icon: Car },
];

const AdminVehiclePage = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Data State Arrays
  const [vehicles, setVehicles] = useState([]); 
  const [unassignedDrivers, setUnassignedDrivers] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // Interactive UI Focus & Submission Controls
  const [activeVehicleSelectId, setActiveVehicleSelectId] = useState(null); 
  const [submittingId, setSubmittingId] = useState(null); 

  // Synchronize both data streams simultaneously on mount
  useEffect(() => {
    const hydrateFleetAndCrews = async () => {
      try {
        const [vehicleData, driverResponse] = await Promise.all([
          adminservices.getVehicleList(),
          adminservices.getDriverList() 
        ]);
        
        setVehicles(vehicleData || []);
        
        // 🟢 Safely extract the 'unassigned_drivers' block from your specific endpoint structure
        const availablePool = driverResponse?.unassigned_drivers || [];
        setUnassignedDrivers(availablePool.filter(d => d.driver_status === 'AVAILABLE'));

      } catch (err) {
        console.error("Core synchronization pipeline fault:", err);
      } finally {
        setLoading(false);
      }
    };
    hydrateFleetAndCrews();
  }, []);

  // 🟢 ASYNC PATCH MUTATION HANDLER
  // 🟢 FIXED ASSIGNMENT PIPELINE: Handles adding replaced drivers back to the pool
  const handleCommitAssignment = async (vehicleId, selectedUserId) => {
    if (!selectedUserId) return;
    setSubmittingId(vehicleId);

    try {
      const parsedUserId = parseInt(selectedUserId, 10);
      
      // 1. Find the vehicle we are about to update to see if it ALREADY has a driver
      const targetVehicle = vehicles.find(v => v.id === vehicleId);
      
      // Extract the old driver's info before overwriting it (handles format fallback)
      let oldDriverId = null;
      if (targetVehicle && targetVehicle.current_driver) {
        // If your state stores raw ID numbers or strings like "User Node #5", extract the digits:
        const matches = String(targetVehicle.current_driver).match(/\d+/);
        oldDriverId = matches ? parseInt(matches[0], 10) : null;
      }

      const partialPatchPayload = {
        current_driver: parsedUserId
      };
      
      // Fire the PATCH request to your vehicle ID endpoint path
      await adminservices.assignVehicle(vehicleId, partialPatchPayload);
      
      // 2. Update local vehicle state to show the new assignment instantly
      setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, current_driver: `User Node #${parsedUserId}` } : v));
      
      // 3. 🟢 CRITICAL FIX: Recalculate your available drivers pool state
      setUnassignedDrivers(prev => {
        // Step A: Remove the newly hired driver from the pool
        let updatedPool = prev.filter(d => d.user !== parsedUserId);
        
        // Step B: If there WAS an old driver, recreate their object and put them BACK into the pool
        if (oldDriverId && oldDriverId !== parsedUserId) {
          const resurrectedDriver = {
            id: Date.now(), // Unique runtime temporary react key
            user: oldDriverId,
            driver_status: 'AVAILABLE',
            branch: targetVehicle.branch || 1
          };
          updatedPool = [...updatedPool, resurrectedDriver];
        }
        
        return updatedPool;
      });
      
      // Collapse selector box panel
      setActiveVehicleSelectId(null);
      alert("Operator replaced successfully! Preceding driver returned to available pool.");
    } catch (err) {
      console.error("Vehicle partial patch modification error:", err);
      alert("Failed to commit vehicle patch assignment updates.");
    } finally {
      setSubmittingId(null);
    }
  };


  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ntc-gray font-sans antialiased text-ntc-dark">
      <Sidebar isSidebarOpen={isSidebarOpen} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} sidebarcomp={AdminNavigationOptions} />

      <div className="flex-1 flex flex-col min-w-0 h-full w-full transition-all duration-300">
        <Header userRole={user?.role} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} setIsMobileOpen={setIsMobileOpen} branchName={user?.userbranch || 'N/A'} />

        <main className="flex-1 p-6 overflow-y-auto bg-ntc-gray space-y-6">
          <div>
            <h1 className="text-ntc-dark font-black text-2xl tracking-tight flex items-center gap-3">
              <Car className="text-ntc-blue" size={28} />
              System Fleet Registry Nodes
            </h1>
            <p className="text-xs text-ntc-muted font-medium mt-0.5">
              Global administration registry for monitoring line-haul operations assets and assigning active crews.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20 text-sm font-bold text-ntc-muted animate-pulse">
              Querying live fleet infrastructure nodes...
            </div>
          ) : vehicles.length === 0 ? (
            <div className="bg-white border rounded-[10px] p-12 text-center text-ntc-muted text-sm font-medium shadow-sm">
              <Car className="mx-auto text-gray-300 mb-3" size={48} />
              No vehicles registered in the system network database.
            </div>
          ) : (
            /* RESPONSIVE GRID LAYOUT CANVAS */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {vehicles.map((vehicle) => {
                const vehicleMetrics = [
                  { label: "Model Variant", value: vehicle.model },
                  { label: "Branch", value: vehicle.branch ? `${vehicle.branch}` : 'Global Float' }
                ];

                const vehicleSpecs = [
                  { 
                    label: "License Plate", 
                    value: vehicle.license_plate, 
                    icon: Hash, 
                    render: (val) => (
                      <span className="font-mono text-xs font-bold bg-ntc-dark text-white px-2 py-0.5 rounded shadow-inner tracking-wider">
                        {val || '—'}
                      </span>
                    ) 
                  },
                  { label: "Production Year", value: vehicle.year || 'N/A', icon: Calendar },
                  { 
                    label: "Current Operator", 
                    value: vehicle.current_driver, 
                    icon: ShieldCheck, 
                    render: (val) => val ? (
                      <span className="text-ntc-blue font-bold">👤 {val}</span>
                    ) : (
                      <span className="text-gray-400 italic text-[11px]">Unassigned Pool</span>
                    ) 
                  }
                ];

                const isSelectingThisCard = activeVehicleSelectId === vehicle.id;

                return (
                  <div key={vehicle.id} className="flex flex-col gap-3 h-full">
                    <UniversalVehicleCard
                      title={vehicle.manufacturer}
                      badgeText={`Vehicle ID: #VN-${vehicle.id}`}
                      icon={Car}
                      statusText={vehicle.approval_status || 'AVAILABLE'}
                      statusVariant={vehicle.approval_status === 'AVAILABLE' ? 'success' : 'warning'}
                      metrics={vehicleMetrics}
                      specs={vehicleSpecs}
                      onActionClick={() => setActiveVehicleSelectId(isSelectingThisCard ? null : vehicle.id)}
                      actionText={isSelectingThisCard ? "Cancel Assignment" : vehicle.current_driver ? "Change Operator" : "Allocate Driver"}
                    />

                    {/* Dynamic Dropdown Select Drawer Box Component Overlay */}
                    {isSelectingThisCard && (
                      <div className="bg-white border border-blue-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] rounded-lg p-3 flex flex-col gap-2 transition-all animate-fadeIn">
                        <label className="text-[10px] font-black text-ntc-muted uppercase tracking-wider flex items-center gap-1.5">
                          <UserCheck size={12} className="text-ntc-blue" />
                          Select Available Crew Operator
                        </label>
                        
                        {unassignedDrivers.length === 0 ? (
                          <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded font-bold text-center">
                            ⚠️ No unassigned drivers currently available.
                          </div>
                        ) : (
                          <select
                                    disabled={submittingId === vehicle.id}
                                    onChange={(e) => handleCommitAssignment(vehicle.id, e.target.value)}
                                    defaultValue=""
                                    className="w-full bg-ntc-gray border border-gray-200 rounded-md px-2.5 py-1.5 text-xs font-bold text-ntc-dark focus:outline-none focus:border-ntc-blue transition-all disabled:opacity-50"
                                    >
                                    <option value="" disabled hidden>— Choose Available Driver —</option>
                                    {unassignedDrivers.map((driver) => (
                                        /* 🟢 Keeps the numerical user ID for the backend, but displays the real username string to the Admin */
                                        <option key={driver.id} value={driver.user}>
                                        👤 {driver.username} ({driver.branch})
                                        </option>
                                    ))}
                                    </select>

                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminVehiclePage;
