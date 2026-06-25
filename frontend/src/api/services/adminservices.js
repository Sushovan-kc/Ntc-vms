import apiClient from "../client";

const adminservices = {

    AdminProfile: async () => {
        try {
            const response = await apiClient.get('/api/userprofile/myprofile/');
            return response.data;
        } catch (error) {
            console.error('Error fetching admin profile:', error);
            throw error;
        }
    },

    AddVehicle: async (vehicleData) => {
        try {
            const response = await apiClient.post('/api/vehicles/add/', vehicleData);
            return response.data;
        } catch (error) {
            console.error('Error adding vehicle:', error);
            throw error;
        }
    },

    handleProfilePatchUpdate : async (updatedFieldsPayload,userid) => {
      // Isolate precisely the editable subset properties expected by backend rules
      const patchData = {
        first_name: updatedFieldsPayload.first_name,
        last_name: updatedFieldsPayload.last_name,
        email: updatedFieldsPayload.email,
        phone_number: updatedFieldsPayload.phone_number,
      }

      // Fire payload to endpoint matching your project's api client instance conventions
      const response = await apiClient.patch(`/api/userprofile/myprofile/`, patchData);

      return response.data; // Return the updated profile data for local state hydration
    },

    getVehicleList: async () => {
      try {
        const response = await apiClient.get('/api/vehicles/list/');
        return response.data;
      } catch (error) {
        console.error('Error fetching vehicle list:', error);
        throw error;
      }
    },

    assignVehicle: async (vehicleId, payload) => {
        try {
            // Note the closing trailing slash for absolute routing framework security
            const response = await apiClient.patch(`/api/vehicles/assign/${vehicleId}/`, payload);
            return response.data;
        } catch (error) {
            console.error(`Error executing partial patch update on vehicle #${vehicleId}:`, error);
            throw error;
        }
    },

    getDriverList: async () => {
      try {
        const response = await apiClient.get('/api/driver/unassigned-driver-list/');
        return response.data;
      } catch (error) {
        console.error('Error fetching unassigned driver list:', error);
        throw error;
      }
    },

    getBookingList: async () => {
      try {
        const response = await apiClient.get('/api/booking/list/');
        return response.data;
      } catch (error) {
        console.error('Error fetching booking list:', error);
        throw error;
      }
    }

};


export default adminservices;
