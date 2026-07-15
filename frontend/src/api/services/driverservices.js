import apiClient from "../client";


const driverServices = {

    getDriverProfile: async () => {
        try {
            const response = await apiClient.get('/api/driver/update/');
            return response.data;
        } catch (error) {
            console.error("Error fetching driver profile:", error);
            throw error;
        }
    },

    DriverProfileSetup: async (profileData) => {
        try {
            // 🔑 THE FIX: Pass the headers config object as the 3rd argument
            const response = await apiClient.patch('/api/driver/update/', profileData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error setting up driver profile:", error);
            throw error;
        }
    },
    
    getDriverVehicleInfo: async () => {
        try{
            const response=await apiClient.get('/api/driver/vehicleinfo/')
            return response.data;
        } catch (error) {
            console.error("Error fetching driver vehicle info:", error);
            throw error;
        }
    },

    getVehicletelemetrydata: async (vehicleId) => {
        try{
            const response=await apiClient.get(`/api/vehicles/infoupdate/${vehicleId}/`);
            return response.data;
        } catch (error) {
            console.error("Error fetching vehicle telemetry:", error);
            throw error;
        }
    },
    updateVehicletelemetrydata: async (vehicleId, telemetryData) => {
        try{
            const response=await apiClient.patch(`/api/vehicles/infoupdate/${vehicleId}/`, telemetryData);
            return response.data;
        } catch (error) {
            console.error("Error updating vehicle telemetry:", error);
            throw error;
        }
    },

    getDriverDispatches: async () => {
        try {
            const response = await apiClient.get('/api/driver/mydispatchinfo/');
            return response.data;
        } catch (error) {
            console.error("Error fetching driver dispatches:", error);
            throw error;
        }},

    updateDispatchStatus: async(dispatchId, newStatus) => {
        try {
            const response = await apiClient.patch(`/api/driver/dispatch-status-update/${dispatchId}/`, newStatus);
            return response.data;
        } catch (error) {
            console.error("Error updating dispatch status:", error);
            throw error;
        }},
    ingestTelemetry: async (driverId, latitude, longitude) => {
    const response = await apiClient.post('/api/driver/tracking/ingest/', {
      driver_id: driverId,
      latitude: latitude,
      longitude: longitude,
    });
    return response.data;
  },

  /**
   * PATCH - Submit operational telemetry data for the driver's assigned vehicle.
   * Accepted fields: kilometers_driven, mileage, last_fuel_date, last_service_date
   *
   * @param {Object} telemetryData - Object with one or more accepted telemetry keys.
   * @returns {Promise} Resolves to the backend confirmation payload.
   */
  updateVehicleTelemetry: async (telemetryData) => {
    try {
      const response = await apiClient.patch('/api/driver/vehicle/telemetry/update/', telemetryData);
      return response.data;
    } catch (error) {
      console.error('Error submitting vehicle telemetry update:', error);
      throw error;
    }
  },
}

export default driverServices;
