import React, { createContext, useState, useContext, useEffect } from 'react';
// 🟢 Import your JS version authservice directly
import { authservice } from '../api/services/authservices'; 

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🟢 1. HYDRATION TASK: Reads from your localStorage structure on boot up
  useEffect(() => {
    if (authservice.isAuthenticated()) {
      const savedUser = localStorage.getItem('userData');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error("Error parsing user payload:", e);
        }
      }
    }
    setLoading(false);
  }, []);

const login = async (username, password) => {
  try {
    const responseData = await authservice.login({ username, password });
    
    const userPayload = { 
      user_id: responseData.user_id, 
      role: responseData.Role, 
      is_approved: responseData.is_approved, 
      userbranch: responseData.branch_name, 
      username: username 
    };

    setUser(userPayload); 
    return { success: true };
    
  } catch (error) {
    console.error("❌ Context Layer Login Error:", error);
    
    let processedError = 'Login failed. Please try again.';

    // Safely check if Axios caught a response payload from Django (like a 400 or 401 error)
    if (error.response && error.response.data) {
      const data = error.response.data;
      
      // 🟢 FIXED: Target the exact 'error' key sent by your backend
      processedError = data.error || data.non_field_errors || data.detail || 'Invalid credentials';
    } else if (error.message) {
      processedError = error.message;
    }

    // Always pass back a clean string wrapper object
    return { 
      success: false, 
      error: typeof processedError === 'string' ? processedError : 'Invalid credentials' 
    };
  }
};



  // 🟢 3. LOGOUT TASK: Triggers your storage sweeps and updates global UI state
  const logout = () => {
    authservice.logout();
    setUser(null);
  };

  const updateSessionUser = (updatedUser) => {
    localStorage.setItem('userData', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateSessionUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
