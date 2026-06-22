import axios from 'axios';

// 1. Initialize the custom configuration instance
const apiClient = axios.create({
  baseURL:  'http://127.0.0.1:8000/', // Pulls seamlessly from your .env
  timeout: 10000,                        // Cancels request if backend takes > 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // NOTE: Use `Bearer ${token}` for SimpleJWT, or `Token ${token}` for Django's built-in Token Auth
      config.headers.Authorization = `Bearer ${token}`; 
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If Django rejects with a 401 Unauthorized status, clear out memory and send user to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/'; // Routes back to your skeleton login layout
    }
    return Promise.reject(error);
  }
);

export default apiClient;