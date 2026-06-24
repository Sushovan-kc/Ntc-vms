import React, { useState, useEffect } from 'react';
import { Truck,Car, ShieldCheck, Calendar, Hash, LayoutDashboard,MapPin } from 'lucide-react'; // 🟢 Added LayoutDashboard
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

// Shared Presentation Layout Layers
import Sidebar from '../../components/Sidebar';
import Header from '../../components/dashboard/Header';

// 🟢 FIX 1: Move this configuration array OUTSIDE of the component block
// This locks the memory reference and instantly stops the Django request loop!
const NAVIGATION_MENU_OPTIONS = [
  { label: 'Driver Operations', path: '/dashboard/driver', icon: LayoutDashboard },
  { label: 'My Vehicle', path: '/dashboard/driver/vehicle', icon: Car },
      { label: 'My Dispatches', path: '/dashboard/driver/dispatches', icon: MapPin }
];

const DriverVehiclePage = () => {
  const { user } = useAuth();
  
  // Layout Structural Toggle States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Core Data States
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        // 🟢 Perfect: Keep this path exactly as your log file expects it!
        const response = await apiClient.get('/api/driver/vehicleinfo/');
        setVehicle(response.data || null);
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
    <div className="flex h-screen w-screen overflow-hidden bg-ntc-gray font-sans antialiased text-ntc-dark">
      
      {/* Reusable Sidebar using our reference locked options prop */}
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
      </div>
    </div>
  );
};

export default DriverVehiclePage;




// import React, { useState, useEffect } from 'react';
// import { Car, ShieldCheck, Calendar, Hash, LayoutDashboard, MapPin, User } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext';
// import apiClient from '../../api/client';

// // Shared Presentation Layout Layers
// import Sidebar from '../../components/Sidebar';
// import Header from '../../components/dashboard/Header';
// import ProfileCard from '../../components/dashboard/ProfileCard'; // 🟢 Import your universal profile card engine

// // Static Memory Navigation References
// const NAVIGATION_MENU_OPTIONS = [
//   { label: 'Driver Operations', path: '/dashboard/driver', icon: LayoutDashboard },
//   { label: 'My Vehicle', path: '/dashboard/driver/vehicle', icon: Car },
//   { label: 'My Dispatches', path: '/dashboard/driver/dispatches', icon: MapPin }
// ];

// const DriverVehiclePage = () => {
//   const { user } = useAuth();
  
//   // Layout Structural Toggle States
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [isMobileOpen, setIsMobileOpen] = useState(false);
  
//   // Core Data States
//   const [vehicle, setVehicle] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchVehicleData = async () => {
//       try {
//         const response = await apiClient.get('/api/driver/vehicleinfo/');
//         setVehicle(response.data || null);
//       } catch (err) {
//         if (err.response?.status !== 404) {
//           console.error("Error fetching vehicle allocations:", err);
//         }
//         setVehicle(null);
//       } finally {
//         setLoading(false); 
//       }
//     };

//     if (user) {
//       fetchVehicleData();
//     }
//   }, [user]);

//   // 🟢 1. Build the dynamic fields config mapping over your API response values
//   const vehicleFields = vehicle ? [
//     { 
//       label: "License Identifier Plate", 
//       value: vehicle.license_plate, 
//       icon: Hash,
//       render: (val) => (
//         <span className="inline-block bg-slate-950 text-white px-2.5 py-0.5 text-xs font-mono rounded font-bold tracking-wider shadow-sm">
//           {val || '—'}
//         </span>
//       )
//     },
//     { 
//       label: "Production Model Year", 
//       value: vehicle.year || 'N/A', 
//       icon: Calendar 
//     },
//     { 
//       label: "Current Authenticated Custodian", 
//       value: vehicle.current_driver ? `@${vehicle.current_driver}` : 'Unverified Session User', 
//       icon: ShieldCheck 
//     }
//   ] : [];

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-ntc-gray text-ntc-muted font-semibold tracking-wide">
//         Querying vehicle registry data stream...
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen w-screen overflow-hidden bg-ntc-gray font-sans antialiased text-ntc-dark">
      
//       {/* Sidebar Navigation Context Node */}
//       <Sidebar 
//         isSidebarOpen={isSidebarOpen} 
//         isMobileOpen={isMobileOpen} 
//         setIsMobileOpen={setIsMobileOpen} 
//         sidebarcomp={NAVIGATION_MENU_OPTIONS} 
//       />

//       <div className="flex-1 flex flex-col min-w-0 h-full w-full transition-all duration-300">
        
//         {/* Global Dashboard Header Element */}
//         <Header 
//           userRole={user?.role} 
//           isSidebarOpen={isSidebarOpen} 
//           setIsSidebarOpen={setIsSidebarOpen} 
//           setIsMobileOpen={setIsMobileOpen} 
//           branchName={user?.userbranch || 'N/A'}
//         />

//         {/* Main Work Surface Grid Area */}
//         <main className="flex-1 p-6 overflow-y-auto bg-ntc-gray space-y-6 flex flex-col">
//           <h1 className="text-ntc-dark font-black text-2xl tracking-tight flex items-center gap-3">
//             <Car className="text-ntc-blue" size={28} />
//             My Fleet Assignment
//           </h1>

//           {/* Balanced Containment Container Layout Wrapper */}
//           <div className="max-w-md w-full">
//             <ProfileCard
//               title={vehicle ? `${vehicle.manufacturer} ${vehicle.model}` : "No Vehicle Assigned"}
//               badgeText={vehicle ? `ASSET-ID: #VF-${vehicle.id || 'N/A'}` : "UNASSIGNED"}
//               icon={Car}
//               statusLabel="Asset Dispatch Clearance"
//               statusText={vehicle?.approval_status || 'UNASSIGNED'}
//               statusVariant={vehicle?.approval_status === 'APPROVED' || vehicle?.approval_status === 'AVAILABLE' ? 'success' : 'warning'}
//               fields={vehicleFields}
//               emptyMessage="Your driver profile does not currently have an active line-haul vehicle assigned by operations control."
//             />
//           </div>
//         </main>

//       </div>
//     </div>
//   );
// };

// export default DriverVehiclePage;

