import React from 'react'
import Login from './pages/Login'
import Employeedashboard from './pages/employee/Employeedashboard'
import Register from './pages/Register'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import { AuthProvider } from './context/AuthContext';
const App = () => {
  return (
    <AuthProvider>
    <Routes>
      <Route path='/' element={<Login/>}/>
      <Route path='/dashboard' element={<Employeedashboard/>}/>
      <Route path='/register' element={<Register/>}/>
    </Routes>
    </AuthProvider>
  )
}

export default App