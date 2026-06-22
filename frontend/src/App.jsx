import React from 'react'
import Login from './pages/Login'
import Employeedashboard from './pages/employee/Employeedashboard'
import Register from './pages/Register'
import EmployeeBooking from './pages/employee/EmployeeBookingList'
import EmployeeNewBooking from './pages/employee/EmployeeNewBooking'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import { AuthProvider } from './context/AuthContext';
import Approuter from './routes/Approuter'
const App = () => {
  return (
    <AuthProvider>
      {/* <Route path='/' element={<Login/>}/>
      <Route path='/dashboard' element={<Employeedashboard/>}/>
      <Route path='/register' element={<Register/>}/>
      <Route path='/dashboard/my-bookings' element={<EmployeeBooking />}/>
      <Route path='/dashboard/new-booking' element={<EmployeeNewBooking />}/> */}
      <Approuter />
    </AuthProvider>
  )
}

export default App