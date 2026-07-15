import React, { createContext, useState, useEffect, useContext } from 'react';
import registerservice from '../api/services/registerservice';

const BranchContext = createContext(null);

export const BranchProvider = ({ children }) => {
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await registerservice.getBranches();
        setBranches(data);
      } catch (error) {
        console.error('Error fetching global branches:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBranches();
  }, []);

  return (
    <BranchContext.Provider value={{ branches, isLoading }}>
      {children}
    </BranchContext.Provider>
  );
};

// Custom hook for easy consumption
export const useBranches = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranches must be used within a BranchProvider');
  }
  return context;
};
