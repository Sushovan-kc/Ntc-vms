import React from 'react'
import { useState, useEffect } from 'react';
import registerservice from '../api/services/registerservice';

const BranchDropdown = () => {
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await registerservice.getBranches();
        setBranches(data);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };

    fetchBranches();
  }, []);


  return (
    branches
  )
}

export default BranchDropdown