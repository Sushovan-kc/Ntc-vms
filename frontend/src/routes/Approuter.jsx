import React from 'react'
// FIXED: Included Navigate in the react-router-dom imports
import { Routes, Route, Navigate } from 'react-router-dom'

// FIXED: Ensure these components are imported from your project paths
import EmployeeNewBooking from '../pages/employee/EmployeeNewBooking' 
import Login from '../pages/Login'
import EmployeeDashboard from '../pages/employee/EmployeeDashboard'
import EmployeeBooking from '../pages/employee/EmployeeBookingList'
// import EmployeeProfile from '../pages/employee/EmployeeProfile'
import NormalDashboard from '../pages/NormalDashboard'

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
    case 'admin':
      return '/dashboard/superadmin'
    case 'manager':
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

  // 🟢 Clean direct check against lowercase value
  if (role !== expectedRole.toLowerCase()) {
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

      {/* 🟢 Routes configured with strict lowercase role expectations */}
      <Route path="/dashboard/employee"
        element={<DashboardRoute expectedRole="employee">
          <EmployeeDashboard />
        </DashboardRoute>} />
        
      <Route path="/dashboard/employee/bookings"
        element={<DashboardRoute expectedRole="employee">
          <EmployeeNewBooking />
        </DashboardRoute>} />
        
      <Route path="/dashboard/employee/bookinglist"
        element={<DashboardRoute expectedRole="employee">
          <EmployeeBooking />
        </DashboardRoute>} />
        
    <Route path="/dashboard/normal"
        element={<DashboardRoute expectedRole="" allowPending>
            <NormalDashboard />
          </DashboardRoute>
        }
      />
      {/* Safe fallback catch-all */}
      <Route path="*" element={<RootEntry />} />
    </Routes>
  )
}

export default Approuter
