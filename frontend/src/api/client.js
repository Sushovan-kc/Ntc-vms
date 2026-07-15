import axios from 'axios';
import { getApiBaseUrl } from './runtime';

// 1. Initialize the custom configuration instance
const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 20000,                        
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