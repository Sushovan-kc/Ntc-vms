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

  // 🟢 2. LOGIN TASK: Matches their UI parameters but uses your API engine
  const login = async (username, password) => {
    try {
      // Calls your JS service layer directly
      const responseData = await authservice.login({ username, password });
      
      // Construct the payload structure your JS version maps out
      const userPayload = {
        role: responseData.Role,             
        is_approved: responseData.is_approved,
        userbranch: responseData.branch_name,
        username: username // fallback value for display templates
      };

      // Set reactive state so their UI components re-render instantly
      setUser(userPayload);
      return { success: true };
    } catch (error) {
      console.error("❌ Context Layer Login Error:", error);
      // Fallback extraction to prevent crashing if the error structure is dynamic
      const errorMessage = error.error || error.message || 'Login failed';
      return { success: false, error: errorMessage };
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
