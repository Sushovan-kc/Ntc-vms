import apiClient from "../client";

export const adminservices = {

    AddVehicle: async (vehicleData) => {
        try {
            const response = await apiClient.post('/api/vehicles/', vehicleData);
            return response.data;
        } catch (error) {
            console.error('Error adding vehicle:', error);
            throw error;
        }
    }
};

