import React from 'react'
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