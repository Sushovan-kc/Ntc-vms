import apiClient from "../client";

const authservice = {
  // 🟢 FIXED: Wrapped in try/catch to catch Axios 400/401 rejections safely
  login: async ({ username, password }) => {
    try {
      const response = await apiClient.post('/api/login/', { username, password });
      
      const access = response.data.access;
      const refresh = response.data.refresh;
      
      if (access) {
        localStorage.setItem('accessToken', access);
        if (refresh) localStorage.setItem('refreshToken', refresh);
      }
      
      const userPayload = {
        user_id: response.data.user_id,
        username: response.data.username,
        role: response.data.Role,
        is_approved: response.data.is_approved,
        userbranch: response.data.branch_name,
      };
      
      localStorage.setItem('userData', JSON.stringify(userPayload));
      return response.data;

    } catch (error) {
      console.error("📦 API Service Level Login Error Captured:", error);
      
      // 🟢 CRITICAL: Re-throw the error object so AuthContext's catch block can catch it
      throw error; 
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    return !!token;
  }
};

export { authservice };
