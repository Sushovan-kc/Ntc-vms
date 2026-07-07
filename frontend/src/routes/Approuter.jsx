import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import EmployeeNewBooking from '../pages/employee/EmployeeNewBooking' 
import Login from '../pages/Login'
import EmployeeDashboard from '../pages/employee/EmployeeDashboard'
import EmployeeBooking from '../pages/employee/EmployeeBookingList'
import NormalDashboard from '../pages/ApprovalPendingPage'
import DriverDashboard from '../pages/driver/DriverDashboard'
import DriverVehiclePage from '../pages/driver/DriverVehiclePage'
import DriverDispatchPage from '../pages/driver/DriverDispatchPage'
import ApprovalPending from '../pages/ApprovalPendingPage'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminVehiclePage from '../pages/admin/AdminVehiclePage' 
import AdminAddVehicle from '../pages/admin/AdminAddVehicle'
import AdminDispatchPage from '../pages/admin/AdminDispatchPage'
import AdminBookingPage from '../pages/admin/AdminManageBookingPage'
import AdminLayout from '../components/AdminLayout'
import DriverLayout from '../components/DriverLayout'
import EmployeeLayout from '../components/EmployeeLayout'
import AdminUserPage from '../pages/admin/AdminUserPage'
import AdminDriverPage from '../pages/admin/AdminDriverPage'
import Register from '../pages/Register'
import AdminTrackingPage from '../pages/admin/AdminTrackingPage'
import AdminHistoricalTrackingPage from '../pages/admin/AdminHistoricalTrackingPage'

function getLocalAuth() {
  try {
    const token = localStorage.getItem('accessToken')
    const userDataStr = localStorage.getItem('userData')
    const userData = userDataStr ? JSON.parse(userDataStr) : null
    
    return {
      hasAccess: !!token,
      // 🟢 Enforces lowercase string conversion immediately on read
      role: (userData?.role || '').toLowerCase(), 
      isApproved: userData?.is_approved || false 
    }
  } catch {
    return { hasAccess: false, role: '', isApproved: false }
  }
}

// 🟢 Uses strict lowercase matching for routing targets
function resolveDashboardPath(role, isApproved) {
  if (!isApproved) {
    return '/dashboard/normal'
  }

  switch (role) {
    case 'super admin':
      return '/dashboard/admin'
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
  const { hasAccess, role, isApproved } = getLocalAuth()

  if (!hasAccess) {
    return <Navigate to="/" replace />
  }

  if (!isApproved) {
    return allowPending ? children : <Navigate to="/dashboard/normal" replace />
  }

  // 1. Ensure expectedRole is treated as an array
  const allowedRoles = Array.isArray(expectedRole) ? expectedRole : [expectedRole];

  // 2. Normalize user role and allowed roles to lowercase for safe comparison
  const normalizedUserRole = role?.toLowerCase();
  const hasRequiredRole = allowedRoles
    .map(r => r.toLowerCase())
    .includes(normalizedUserRole);

  // 3. Redirect if the user does not have any of the allowed roles
  if (!hasRequiredRole) {
    return <Navigate to={resolveDashboardPath(role, isApproved)} replace />
  }

  return children
}


function RootEntry() {
  const { hasAccess, role, isApproved } = getLocalAuth()

  if (hasAccess) {
    return <Navigate to={resolveDashboardPath(role, isApproved)} replace />
  }

  return <Login />
}

const Approuter = () => {
  return (
    <Routes>
      <Route path="/" element={<RootEntry />} />
      <Route path="/register" element={<Register />} />

      {/* 🟢 Routes configured with strict lowercase role expectations */}
      <Route path="/dashboard/employee"
        element={<DashboardRoute expectedRole="employee">
          <EmployeeLayout />
        </DashboardRoute>} >
        
      <Route index element={<EmployeeDashboard />} />
      <Route path="booking" element={<EmployeeNewBooking />} />
      <Route path="bookinglist" element={<EmployeeBooking />} />
      </Route>


      <Route path="/dashboard/driver"
        element={<DashboardRoute expectedRole="driver">
          <DriverLayout />
        </DashboardRoute>} >
      <Route index element={<DriverDashboard />} />
      <Route path="myvehicle" element={<DriverVehiclePage />} />
      <Route path="dispatches" element={<DriverDispatchPage />} />

      </Route>
      

      <Route path="/dashboard/admin" 
        element={
          <DashboardRoute expectedRole={["admin", "super admin"]}>
            <AdminLayout />
          </DashboardRoute> }>

        <Route index element={<AdminDashboard />} /> 
        <Route path="vehicles" element={<AdminVehiclePage />} /> 
        <Route path="addvehicles" element={<AdminAddVehicle />} /> 
        <Route path="bookings" element={<AdminBookingPage />} /> 
        <Route path="userprofiles" element={<AdminUserPage />} />
        <Route path="dispatch" element={<AdminDispatchPage />} />        
        <Route path="driverprofiles" element={<AdminDriverPage />} />        
        <Route path="livetracking" element={<AdminTrackingPage />} />
        <Route path="livetracking/:dispatchId" element={<AdminTrackingPage />} />

        {/* Feature 2: Historical route polyline map for completed/cancelled trip records */}
        <Route path="routehistory/:recordId" element={<AdminHistoricalTrackingPage />} />

      </Route>

 
    <Route path="/dashboard/normal"
        element={<DashboardRoute expectedRole="" allowPending>
            <ApprovalPending />
          </DashboardRoute>
        }
      />
      {/* Safe fallback catch-all */}
      <Route path="*" element={<RootEntry />} />
    </Routes>
  )
}

export default Approuter
