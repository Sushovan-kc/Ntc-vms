import React, { useState, useEffect } from 'react';
import { Car, LayoutDashboard, Hash, Calendar, ShieldCheck, UserCheck, Database,Activity,BookOpen} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import adminservices from '../../api/services/adminservices';
import UniversalVehicleCard from '../../components/vehicle/VehicleCard';



const AdminVehiclePage = () => {
  const { user } = useAuth();


  // Data State Arrays
  const [vehicles, setVehicles] = useState([]); 
  const [unassignedDrivers, setUnassignedDrivers] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // Interactive UI Focus & Submission Controls
  const [activeVehicleSelectId, setActiveVehicleSelectId] = useState(null); 
  const [submittingId, setSubmittingId] = useState(null); 



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
  // Synchronize both data streams simultaneously on mount
  useEffect(() => {
    hydrateFleetAndCrews();
  }, []);

const handleCommitAssignment = async (vehicleId, selectedDriver) => {
  if (!selectedDriver || !selectedDriver.id) return;
  setSubmittingId(vehicleId);

  try {
    const parsedUserId = parseInt(selectedDriver.id, 10);
    
    const partialPatchPayload = {
      current_driver: parsedUserId
    };
    
    // Fire the PATCH request to your backend database
    await adminservices.assignVehicle(vehicleId, partialPatchPayload);
    
    // Close the dropdown drawer view panel upon success
    setActiveVehicleSelectId(null);

    // 🟢 SILENT RE-FETCH: Pull the fresh database state over the network smoothly
    await hydrateFleetAndCrews();

  } catch (error) {
    console.error("Vehicle partial patch modification error:", error);
  } finally {
    setSubmittingId(null);
  }
};


  return (
<>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
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
                  <div key={vehicle.id} className="flex flex-col gap-3 h-fit">
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
                                    onChange={(e) => {
                                      const selectedDriverId = e.target.value;
                                      // Find the driver object to get the username string
                                      const selectedDriver = unassignedDrivers.find(d => String(d.id) === String(selectedDriverId));
                                      
                                      if (selectedDriver) {
                                        handleCommitAssignment(vehicle.id, selectedDriver);
                                      }
                                    }}
                                    defaultValue=""
                                    className="w-full bg-ntc-gray border border-gray-200 rounded-md px-2.5 py-1.5 text-xs font-bold text-ntc-dark focus:outline-none focus:border-ntc-blue transition-all disabled:opacity-50"
                                  >
                                    <option value="" disabled hidden>— Choose Available Driver —</option>
                                    {unassignedDrivers.map((driver) => (
                                      /* 🟢 FIX: Set value cleanly to the driver's unique ID */
                                      <option key={driver.id} value={driver.id}>
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
</>
  );
};

export default AdminVehiclePage;
