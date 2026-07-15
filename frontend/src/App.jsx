import React from 'react'
import { AuthProvider } from './context/AuthContext';
import { BranchProvider } from './context/BranchContext';
import Approuter from './routes/Approuter'
const App = () => {
  return (
    <AuthProvider>
      <BranchProvider>
        <Approuter />
      </BranchProvider>
    </AuthProvider>
  )
}

export default App