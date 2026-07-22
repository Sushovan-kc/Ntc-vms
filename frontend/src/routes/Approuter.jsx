import React from 'react' 
import { Routes, Route, Navigate } from 'react-router-dom' 

//Common pages
import Login from '../pages/Login'
import NormalDashboard from '../pages/ApprovalPendingPage' 
import Register from '../pages/Register' 
import ForgotPassword from '../pages/ForgotPassword' 
import ResetPassword from '../pages/ResetPassword'

//layout components
import DriverLayout from '../components/DriverLayout' 
import EmployeeLayout from '../components/EmployeeLayout' 
import AdminLayout from '../components/AdminLayout' 

//employee pages
import EmployeeDashboard from '../pages/employee/EmployeeDashboard' 
import EmployeeBooking from '../pages/employee/EmployeeBookingList' 
import EmployeeNewBooking from '../pages/employee/EmployeeNewBooking' 

//driver pages
import DriverDashboard from '../pages/driver/DriverDashboard' 
import DriverVehiclePage from '../pages/driver/DriverVehiclePage' 
import DriverDispatchPage from '../pages/driver/DriverDispatchPage' 

//admin pages
import ApprovalPending from '../pages/ApprovalPendingPage' 
import AdminDashboard from '../pages/admin/AdminDashboard' 
import AdminVehiclePage from '../pages/admin/AdminVehiclePage' 
import AdminAddVehicle from '../pages/admin/AdminAddVehicle' 
import AdminDispatchPage from '../pages/admin/AdminDispatchPage' 
import AdminBookingPage from '../pages/admin/AdminManageBookingPage' 
import AdminUserPage from '../pages/admin/AdminUserPage' 
import AdminDriverPage from '../pages/admin/AdminDriverPage' 
import AdminTrackingPage from '../pages/admin/AdminTrackingPage' 
import AdminHistoricalTrackingPage from '../pages/admin/AdminHistoricalTrackingPage' 
import AdminBranchPage from '../pages/admin/AdminBranchPage'

//Authentication context
import { useAuth } from '../context/AuthContext' 


function resolveDashboardPath(role, isApproved) { 
  if (!isApproved) { 
    return '/dashboard/normal' 
  } 
  switch (role) { 
    case 'super admin': 
    case 'admin': 
      return '/dashboard/admin' 
    case 'employee': 
      return '/dashboard/employee' 
    case 'driver': 
      return '/dashboard/driver' 
    default: 
      return '/dashboard/normal' 
  } 
} 

function DashboardRoute({ expectedRole, allowPending = false, children }) { 
  const { user, loading } = useAuth() 

  // Wait for hydration to complete before routing
  if (loading) return <div>Loading...</div>

  // If user object is null, they do not have access
  if (!user) { 
    return <Navigate to="/" replace /> 
  } 

  // Extract verified data from the user object structure
  const role = (user.role || '').toLowerCase()
  const isApproved = user.is_approved || false

  if (!isApproved) { 
    return allowPending ? children : <Navigate to="/dashboard/normal" replace /> 
  } 

  const allowedRoles = Array.isArray(expectedRole) ? expectedRole : [expectedRole]; 
  const hasRequiredRole = allowedRoles 
    .map(r => r.toLowerCase()) 
    .includes(role); 

  if (!hasRequiredRole) { 
    return <Navigate to={resolveDashboardPath(role, isApproved)} replace /> 
  } 

  return children 
} 

function RootEntry() { 
  // Connect RootEntry to the live React context stream
  const { user, loading } = useAuth() 

  if (loading) return <div>Loading...</div>

  // If user state exists, redirect them immediately to their dashboard
  if (user) { 
    const role = (user.role || '').toLowerCase()
    const isApproved = user.is_approved || false
    return <Navigate to={resolveDashboardPath(role, isApproved)} replace /> 
  } 

  return <Login /> 
} 

const Approuter = () => { 
  return ( 
    <Routes> 
      // Root entry point for the application, handles login and redirects
      <Route path="/" element={<RootEntry />} /> 
      <Route path="/register" element={<Register />} /> 
      <Route path="/forgotpassword" element={<ForgotPassword />} /> 
      <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} /> 

      // Employee dashboard routes, protected by role-based access control
      <Route path="/dashboard/employee" element={<DashboardRoute expectedRole="employee"> <EmployeeLayout /> </DashboardRoute>} > 
        <Route index element={<EmployeeDashboard />} /> 
        <Route path="booking" element={<EmployeeNewBooking />} /> 
        <Route path="bookinglist" element={<EmployeeBooking />} /> 
      </Route> 

      // Driver dashboard routes, protected by role-based access control
      <Route path="/dashboard/driver" element={<DashboardRoute expectedRole="driver"> <DriverLayout /> </DashboardRoute>} > 
        <Route index element={<DriverDashboard />} /> 
        <Route path="myvehicle" element={<DriverVehiclePage />} /> 
        <Route path="dispatches" element={<DriverDispatchPage />} /> 
      </Route> 

      // Admin dashboard routes, protected by role-based access control
      <Route path="/dashboard/admin" element={ 
        <DashboardRoute expectedRole={["admin", "super admin"]}> 
          <AdminLayout /> 
        </DashboardRoute> 
      }> 
        <Route index element={<AdminDashboard />} /> 
        <Route path="vehicles" element={<AdminVehiclePage />} /> 
        <Route path="addvehicles" element={<AdminAddVehicle />} /> 
        <Route path="bookings" element={<AdminBookingPage />} /> 
        <Route path="userprofiles" element={<AdminUserPage />} /> 
        <Route path="dispatch" element={<AdminDispatchPage />} /> 
        <Route path="driverprofiles" element={<AdminDriverPage />} /> 
        <Route path="livetracking" element={<AdminTrackingPage />} /> 
        <Route path="livetracking/:dispatchId" element={<AdminTrackingPage />} /> 
        <Route path="routehistory/:recordId" element={<AdminHistoricalTrackingPage />} /> 
        <Route path="branches" element={<AdminBranchPage />} /> 
      </Route> 

      <Route path="/dashboard/normal" element={<DashboardRoute expectedRole="" allowPending> <ApprovalPending /> </DashboardRoute> } /> 
      <Route path="*" element={<RootEntry />} /> 
    </Routes> 
  ) 
} 

export default Approuter
