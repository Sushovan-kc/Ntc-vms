import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'; // 🟢 Restored matching path structures
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client'; // 🟢 Uses centralized custom Axios client
import { CarFront, History, ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react';
import ProfileDropdown from '../../components/ProfileDropdown'; 

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({ pending: 0, approved: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployeeMetrics = async () => {
      try {
        // 🟢 Calls your secure server route (handled via automated Bearer token injection)
        const response = await apiClient.get('api/booking/mybookings/');
        const myBookings = response.data;
        
        // Server already narrows down records to the logged-in employee via request.user
        const pending = myBookings.filter(r => 
          ['PENDING', 'Pending', 'Pending approval.'].includes(r.status)
        ).length;
        
        const approved = myBookings.filter(r => 
          ['APPROVED', 'Approved', 'IN_PROGRESS', 'On Trip'].includes(r.status)
        ).length;
        
        setMetrics({ pending, approved, total: myBookings.length });
      } catch (error) {
        console.error('❌ Error fetching employee metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fail-safe execution boundary check covering varying session data layouts
    if (user) {
      fetchEmployeeMetrics();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500 font-sans">
        Loading your portal...
      </div>
    );
  }

  return (
    // 🟢 MASTER CANVAS: Uses native Tailwind gradients and typography constraints
    <div className="w-full min-h-screen p-6 md:p-8 bg-linear-to-br from-ntc-gray to-gray-200/50 font-sans">

      {/* Header Section: Aligns welcome copy and avatar side-by-side cleanly */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10 border-b border-gray-200 pb-6">
        
        {/* Text Message Box */}
        <div className="flex flex-col">
          <h2 className="text-3xl md:text-4xl font-black bg-linear-to-r from-ntc-blue to-cyan-500 bg-clip-text text-transparent mb-2 tracking-tight">
            Welcome back, {user?.first_name || user?.username || 'Employee'}!
          </h2>
          <p className="text-ntc-muted text-lg md:text-xl">What would you like to do today?</p>
        </div>
        
        {/* Profile Picture Avatar Sphere */}
        {/* <div className="bg-ntc-dark-text rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-white font-black text-lg md:text-xl shadow-md select-none shrink-0 border border-white/20">
          {user?.first_name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'E'}
        </div> */}
      <div className="shrink-0 flex items-center justify-end">
        <ProfileDropdown user={user} />
      </div>

      </div>

      {/* Action Hub Option Cards Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        
        {/* Card Entry A: Book a Vehicle */}
        <div 
          className="bg-white/95 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-xs cursor-pointer select-none transition-all duration-300 ease-in-out transform hover:-translate-y-1.5 hover:shadow-xl hover:border-ntc-blue hover:bg-ntc-light-blue/20 group text-center"
          onClick={() => navigate('/dashboard/employee/bookings')}
        >
          <div className="py-4">
            <div className="bg-ntc-blue/10 rounded-full inline-flex p-5 mb-4 group-hover:bg-ntc-blue/15 transition-colors duration-200">
              <CarFront size={48} className="text-ntc-blue" />
            </div>
            <h4 className="text-xl font-bold text-ntc-dark-text mb-2">Book a Vehicle</h4>
            <p className="text-ntc-muted text-sm max-w-sm mx-auto">Submit a new request for official travel.</p>
          </div>
        </div>

        {/* Card Entry B: My Requests */}
        <div 
          className="bg-white/95 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-xs cursor-pointer select-none transition-all duration-300 ease-in-out transform hover:-translate-y-1.5 hover:shadow-xl hover:border-ntc-blue hover:bg-ntc-light-blue/20 group text-center"
          onClick={() => navigate('/dashboard/employee/bookinglist')}
        >
          <div className="py-4">
            <div className="bg-cyan-500/10 rounded-full inline-flex p-5 mb-4 group-hover:bg-cyan-500/15 transition-colors duration-200">
              <History size={48} className="text-cyan-600" />
            </div>
            <h4 className="text-xl font-bold text-ntc-dark-text mb-2">My Requests</h4>
            <p className="text-ntc-muted text-sm max-w-sm mx-auto">View your active trips and request history.</p>
          </div>
        </div>

      </div>

      {/* Analytics Subheader Section */}
      <h4 className="text-xl font-bold text-ntc-dark-text mb-6 tracking-tight">Your Travel Overview</h4>
      
      {/* Travel Metrics Dashboard Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric Element A: Total Requests Card */}
        <div className="bg-white/95 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-xs border-l-4 border-l-ntc-blue flex justify-between items-center transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl">
          <div>
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Total Requests</span>
            <h2 className="text-3xl font-black text-ntc-dark-text">{metrics.total}</h2>
          </div>
          <div className="p-3.5 bg-ntc-blue/10 rounded-full text-ntc-blue">
            <ClipboardList size={28} />
          </div>
        </div>

        {/* Metric Element B: Pending Approvals Card */}
        <div className="bg-white/95 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-xs border-l-4 border-l-amber-500 flex justify-between items-center transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl">
          <div>
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Pending Approval</span>
            <h2 className="text-3xl font-black text-amber-500">{metrics.pending}</h2>
          </div>
          <div className="p-3.5 bg-amber-500/10 rounded-full text-amber-600">
            <AlertCircle size={28} />
          </div>
        </div>

        {/* Metric Element C: Approved Trips Card */}
        <div className="bg-white/95 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-xs border-l-4 border-l-ntc-success flex justify-between items-center transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl">
          <div>
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Approved Trips</span>
            <h2 className="text-3xl font-black text-ntc-success">{metrics.approved}</h2>
          </div>
          <div className="p-3.5 bg-ntc-success/10 rounded-full text-ntc-success">
            <CheckCircle2 size={28} />
          </div>
        </div>

      </div>
    </div>
  );
};


export default EmployeeDashboard;
