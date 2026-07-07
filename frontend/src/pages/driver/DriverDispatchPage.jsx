// import React, { useState, useEffect } from 'react';
// import { ClipboardList } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext';
// import driverServices from '../../api/services/driverservices'; 
// import DispatchCard from '../../components/driver/DispatchCard'; // Adjust path if placed elsewhere

// const DriverDispatchesPage = () => {
//   const { user } = useAuth();
  
//   // Data States
//   const [dispatches, setDispatches] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchDispatchData = async () => {
//       try {
//         const [response] = await Promise.allSettled([driverServices.getDriverDispatches()]);
//         setDispatches(Array.isArray(response.value) ? response.value : []);
//       } catch (err) {
//         if (err.response?.status !== 404) {
//           console.error("Error fetching driver manifest streams:", err);
//         }
//         setDispatches([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (user) fetchDispatchData();
//   }, [user]);

//   // Callback to dynamically manage inner array states
//   const handleDispatchUpdate = (id, updatedFields) => {
//     setDispatches(prev => 
//       prev.map(dispatch => dispatch.id === id ? { ...dispatch, ...updatedFields } : dispatch)
//     );
//   };

//   // Immediate layout update: filter out completed trips
//   const activeDispatches = dispatches.filter(item => item.booking_status !== 'completed');

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-ntc-gray text-ntc-muted font-semibold tracking-wide">
//         Querying logistics manifest stream...
//       </div>
//     );
//   }

//   return (
//     <main className="flex-1 p-6 overflow-y-auto bg-ntc-gray space-y-6">
//       <h1 className="text-ntc-dark font-black text-2xl tracking-tight flex items-center gap-3">
//         <ClipboardList className="text-ntc-blue" size={28} />
//         My Dispatch Assignments
//       </h1>

//       {activeDispatches.length === 0 ? (
//         /* Empty Fallback State Card */
//         <div className="max-w-4xl bg-white rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-center p-12 space-y-3">
//           <ClipboardList size={64} className="text-ntc-muted mx-auto opacity-30" />
//           <h3 className="text-lg font-bold text-ntc-dark">No Active Dispatches</h3>
//           <p className="text-ntc-muted text-sm max-w-sm mx-auto">
//             You do not have any active operational dispatch requests allocated to your profile at the moment.
//           </p>
//         </div>
//       ) : (
//         /* Render Lists via Extracted Component Mapping */
//         <div className="space-y-6 max-w-4xl">
//           {activeDispatches.map((item) => (
//             <DispatchCard 
//               key={item.id} 
//               item={item} 
//               onStatusUpdate={handleDispatchUpdate} 
//             />
//           ))}
//         </div>
//       )}
//     </main>
//   );
// };

// export default DriverDispatchesPage;
import React, { useState, useEffect } from 'react';
import { ClipboardList } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import driverServices from '../../api/services/driverservices'; 
import DispatchCard from '../../components/driver/DispatchCard'; 

const DriverDispatchesPage = () => {
  const { user } = useAuth();
  
  // Data States
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch trip assignments loop
  useEffect(() => {
    const fetchDispatchData = async () => {
      try {
        const [response] = await Promise.allSettled([driverServices.getDriverDispatches()]);
        setDispatches(Array.isArray(response.value) ? response.value : []);
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

  // 2. 🚀 The Real-Time Background Tracking Monitor Engine
  useEffect(() => {
    // 🌟 FIX: Checked for item.dispatch_status to match your Django model variable name perfectly
    const activeTrip = dispatches.find(item => item.dispatch_status === 'IN_PROGRESS');
    
    let trackingInterval = null;

    if (activeTrip && user) {
      console.log(`📡 Initializing location loop for Active Dispatch ID: #${activeTrip.id}`);
      
      // Fire tracking updates directly to your Django backend every 5 seconds
      trackingInterval = setInterval(() => {
        if (!navigator.geolocation) {
          console.error("Geolocation services are completely missing from this browser instance.");
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              
              // 🌟 FIX: Fires data through your newly cleaned up driverServices.ingestTelemetry handler using the driver profile ID
              await driverServices.ingestTelemetry(activeTrip.driver, latitude, longitude);
              console.log(`📍 Coordinate bundle synced: [${latitude}, ${longitude}]`);
            } catch (error) {
              console.error("Telemetry ingest network drop:", error);
            }
          },
          (geoError) => {
            console.error("Native GPS hardware execution failure:", geoError.message);
          },
          { 
            enableHighAccuracy: true, // Forces precise GPS tracking on mobile devices
            timeout: 10000, 
            maximumAge: 0 
          }
        );
      }, 5000);
    }

    // 🧼 Cleanup lifecycle hook
    return () => {
      if (trackingInterval) {
        clearInterval(trackingInterval);
        console.log("🛑 Background telemetry loops disengaged successfully.");
      }
    };
  }, [dispatches, user]);

  // Callback to dynamically manage inner array states
  const handleDispatchUpdate = (id, updatedFields) => {
    setDispatches(prev => 
      prev.map(dispatch => dispatch.id === id ? { ...dispatch, ...updatedFields } : dispatch)
    );
  };

  // Immediate layout update: filter out completed trips
  // 🌟 FIX: Changed item.booking_status to item.dispatch_status to keep your table flags uniform
  const activeDispatches = dispatches.filter(item => item.dispatch_status !== 'COMPLETED' && item.dispatch_status !== 'CANCELLED');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ntc-gray text-ntc-muted font-semibold tracking-wide">
        Querying logistics manifest stream...
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 overflow-y-auto bg-ntc-gray space-y-6">
      <h1 className="text-ntc-dark font-black text-2xl tracking-tight flex items-center gap-3">
        <ClipboardList className="text-ntc-blue" size={28} />
        My Dispatch Assignments
      </h1>

      {activeDispatches.length === 0 ? (
        /* Empty Fallback State Card */
        <div className="max-w-4xl bg-white rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-center p-12 space-y-3">
          <ClipboardList size={64} className="text-ntc-muted mx-auto opacity-30" />
          <h3 className="text-lg font-bold text-ntc-dark">No Active Dispatches</h3>
          <p className="text-ntc-muted text-sm max-w-sm mx-auto">
            You do not have any active operational dispatch requests allocated to your profile at the moment.
          </p>
        </div>
      ) : (
        /* Render Lists via Extracted Component Mapping */
        <div className="space-y-6 max-w-4xl">
          {activeDispatches.map((item) => (
            <DispatchCard 
              key={item.id} 
              item={item} 
              onStatusUpdate={handleDispatchUpdate} 
            />
          ))}
        </div>
      )}
    </main>
  );
};

export default DriverDispatchesPage;
