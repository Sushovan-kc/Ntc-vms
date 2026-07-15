import React, { useState, useEffect } from 'react';
import { Car } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import driverServices from '../../api/services/driverservices';

// Subcomponents
import LoadingState from '../../components/driver/LoadingState';
import EmptyVehicleState from '../../components/driver/EmptyVehicleState';
import VehicleDetailsCard from '../../components/driver/VehicleDetailsCard';
import VehicleUpdateForm from '../../components/driver/DriverVehicleUpdateForm'; // 🟢 Added form component reference

const DriverVehiclePage = () => {
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const[Vehicletelemetry,setVehicletelemetry]=useState(null)

  // API Retrieval Operation
 const fetchVehicleAndTelemetry = async () => {
    setLoading(true);
    try {
      // 1. Fetch vehicle data first
      const vehicleResult = await driverServices.getDriverVehicleInfo();
      setVehicle(vehicleResult || null);

      // 2. Check if vehicle and ID exist before fetching telemetry
      if (vehicleResult?.id) {
        const telemetryResult = await driverServices.getVehicletelemetrydata(vehicleResult.id);
        setVehicletelemetry(telemetryResult || null);
      } else {
        setVehicletelemetry(null);
      }
    } catch (err) {
      console.error("Error fetching vehicle or telemetry data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger the fetch on component mount
  useEffect(() => {
    fetchVehicleAndTelemetry();
  }, []);

  // Handler sync helper updates state data structure once database patch registers changes 
  const handleUpdateSuccess = (updatedTelemetryData) => {
    setVehicle((prev) => ({
      ...prev,
      ...updatedTelemetryData,
    }));
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <main className="flex-1 p-6 overflow-y-auto bg-ntc-gray space-y-6">
      <h1 className="text-ntc-dark font-black text-2xl tracking-tight flex items-center gap-3">
        <Car className="text-ntc-blue" size={28} /> My Fleet Assignment
      </h1>
      
      <div className="max-w-4xl bg-white rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] overflow-hidden divide-y divide-gray-100">
        {!vehicle ? (
          <EmptyVehicleState />
        ) : (
          <>
            {/* Upper Context Read Card View */}
            <VehicleDetailsCard vehicle={vehicle} />
            
            {/* Interactive Functional Mutation Control Row */}
            <VehicleUpdateForm 
              vehicle={Vehicletelemetry} 
              onUpdateSuccess={handleUpdateSuccess} 
            />
          </>
        )}
      </div>
    </main>
  );
};

export default DriverVehiclePage;