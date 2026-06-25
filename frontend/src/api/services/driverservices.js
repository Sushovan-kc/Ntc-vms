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

    getDriverVehicleInfo: async () => {
        try{
            const response=await apiClient.get('/api/driver/vehicleinfo/')
            return response.data;
        } catch (error) {
            console.error("Error fetching driver vehicle info:", error);
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
        }}
}

export default driverServices;