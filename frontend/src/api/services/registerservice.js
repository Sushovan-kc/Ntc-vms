import apiclient from '../client';

 const registerservice = {
  register: async (userData) => {
    try {
      const response = await apiclient.post('api/userprofile/register/', userData);
      return response.data; // This returns the raw backend JSON object directly
    } catch (error) {
      // Standardizes the error object threw back to the component
      throw error.response ? error.response.data : new Error('Network error');
    }
  },
  getBranches: async () => {
    try {
      const response = await apiclient.get('api/branch/');
      return response.data; // Returns the list of branches
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }},
    sendResetPasswordEmail: async (username) => {
      try {
        const response = await apiclient.post('api/userprofile/forgot-password/', { username });
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : new Error('Network error');
      }
    },
    confirmResetPassword: async (uidb64, token, newPassword) => {
      try {
        const response = await apiclient.post(`api/userprofile/reset-password-confirm/${uidb64}/${token}/`, { password: newPassword,
          confirm_password: newPassword
        });
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : new Error('Network error');
      }},
}; 

export default registerservice;
