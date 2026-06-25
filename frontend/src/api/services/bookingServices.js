import apiClient from "../client";


const bookingServices = {
  // Fetch all bookings
      getBookingList: async () => {
      try {
        const response = await apiClient.get('/api/booking/list/');
        return response.data;
      } catch (error) {
        console.error('Error fetching booking list:', error);
        throw error;
      }
    },

    getAvailableVehicles: async (startTime, endTime) => {
      try {
        const response = await apiClient.get(`/api/booking/available-vehicles/?start_time=${startTime}&end_time=${endTime}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching available vehicles:', error);
        throw error;
      }
    },

    approvalStatusUpdate: async (bookingId, payload) => {
      try {
        const response = await apiClient.patch(`/api/booking/approve/${bookingId}/`, payload);
        return response.data;
      } catch (error) {
        console.error(`Error updating booking approval status for booking ID ${bookingId}:`, error);
        throw error;
      }}
}

export default bookingServices;