import apiClient from "../client";

const authservice = {
  // 🟢 Destructures credentials parameter to accept standard login payloads
  login: async ({ username, password }) => {
    const response = await apiClient.post('/api/login/', { username, password });
    const access  = response.data.access;
    const refresh = response.data.refresh;

    if (access) {
      localStorage.setItem('accessToken', access);
      if (refresh) localStorage.setItem('refreshToken', refresh);
    }
    
    const userPayload = {
      role: response.data.Role,             
      is_approved: response.data.is_approved,
      userbranch: response.data.branch_name,
    };
    
    localStorage.setItem('userData', JSON.stringify(userPayload));
    return response.data;
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
