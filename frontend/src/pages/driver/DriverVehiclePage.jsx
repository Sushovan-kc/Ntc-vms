import React, { useState, useEffect } from 'react';
import { Truck,Car, ShieldCheck, Calendar, Hash, LayoutDashboard,MapPin } from 'lucide-react'; // 🟢 Added LayoutDashboard
import { useAuth } from '../../context/AuthContext';
import driverServices from '../../api/services/driverservices';
// Shared Presentation Layout Layers
import Sidebar from '../../components/Sidebar';
import Header from '../../components/dashboard/Header';


const DriverVehiclePage = () => {
  const { user } = useAuth();
  
  
  // Core Data States
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        // 🟢 Perfect: Keep this path exactly as your log file expects it!
        const [response] = await Promise.allSettled([driverServices.getDriverVehicleInfo()]);
        setVehicle(response.value || null);
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error("Error fetching vehicle allocations:", err);
        }
        setVehicle(null);
      } finally {
        // 🟢 FIX 2: Guarantees loading state flips off regardless of 404s
        setLoading(false); 
      }
    };

    if (user) {
      fetchVehicleData();
    }
  }, [user]); // Only updates if the authenticated user context object shifts keys

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ntc-gray text-ntc-muted font-semibold tracking-wide">
        Querying vehicle registry data stream...
      </div>
    );
  }

  return (

        <main className="flex-1 p-6 overflow-y-auto bg-ntc-gray space-y-6">
          <h1 className="text-ntc-dark font-black text-2xl tracking-tight flex items-center gap-3">
            <Car className="text-ntc-blue" size={28} />
            My Fleet Assignment
          </h1>

          <div className="max-w-4xl bg-white rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] overflow-hidden">
            {!vehicle ? (
              <div className="text-center p-12 space-y-3">
                <Car size={64} className="text-ntc-muted mx-auto opacity-30" />
                <h3 className="text-lg font-bold text-ntc-dark">No Vehicle Assigned</h3>
                <p className="text-ntc-muted text-sm max-w-sm mx-auto">
                  Your driver profile does not currently have an active line-haul vehicle assigned by operations control.
                </p>
              </div>
            ) : (
              <div>
                {/* Accent Banner Row */}
                <div className="bg-gradient-to-r from-ntc-blue to-blue-700 p-6 text-white flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold tracking-widest uppercase text-ntc-light-blue opacity-80">Active Unit</span>
                    <h2 className="text-2xl font-black mt-1">{vehicle.manufacturer} {vehicle.model}</h2>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black border uppercase ${
                    vehicle.approval_status === 'APPROVED' 
                      ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' 
                      : 'bg-amber-500/20 text-amber-200 border-amber-500/30'
                  }`}>
                    {vehicle.approval_status || 'Operational'}
                  </span>
                </div>

                {/* Technical Specifications Matrix */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* License Plate Specification Item */}
                  <div className="flex items-center gap-4 p-4 bg-ntc-gray rounded-xl border border-gray-100">
                    <div className="p-3 rounded-lg bg-white text-ntc-blue shadow-sm">
                      <Hash size={20} />
                    </div>
                    <div>
                      <span className="text-xs text-ntc-muted font-bold block">License Identifier Plate</span>
                      <span className="font-mono text-base font-black text-ntc-dark bg-white border px-2.5 py-0.5 rounded shadow-sm tracking-wider">
                        {vehicle.license_plate}
                      </span>
                    </div>
                  </div>

                  {/* Model Production Year Specification Item */}
                  <div className="flex items-center gap-4 p-4 bg-ntc-gray rounded-xl border border-gray-100">
                    <div className="p-3 rounded-lg bg-white text-ntc-blue shadow-sm">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <span className="text-xs text-ntc-muted font-bold block">Production Model Year</span>
                      <span className="text-base font-bold text-ntc-dark">{vehicle.year || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Active Profile Custodian Specification Item */}
                  <div className="flex items-center gap-4 p-4 bg-ntc-gray rounded-xl border border-gray-100 md:col-span-2">
                    <div className="p-3 rounded-lg bg-white text-ntc-blue shadow-sm">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <span className="text-xs text-ntc-muted font-bold block">Current Authenticated Custodian</span>
                      <span className="text-sm font-bold text-ntc-dark">
                        {vehicle.current_driver ? `@${vehicle.current_driver}` : 'Unverified Session User'}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </main>
  );
};

export default DriverVehiclePage;





