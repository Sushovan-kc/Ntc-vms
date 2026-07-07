import { React,useState,useEffect } from 'react'
import adminservices from '../../api/services/adminservices'
import { useAuth } from '../../context/AuthContext';
import { User, Car, LayoutDashboard,MapPin,Truck,Database,Activity,BookOpen,ClipboardList,NotebookPen } from 'lucide-react';
import VehicleAddForm from '../../components/vehicle/VehicleAddForm';
import UniversalTable from '../../components/dashboard/UniversalTable';
import bookingServices from '../../api/services/bookingServices'
import PendingBookingsSection from '../../components/booking/PendingBookingsSection';



const bookingColumns = [
  { 
    header: "ID", 
    key: "id", 
    render: (val) => <span className="font-bold text-ntc-dark">BOOKING-#{val}</span> 
  },
  {
    header:"Booked By",
    key:"user",
    render:(val) => <span className="font-medium text-ntc-dark">{val || 'N/A'}</span>
  },
  { 
    header: "Pickup Location", 
    key: "start_location",
  
    render: (val) => {
      return val && val.trim() !== "" ? val : "Not Specified";
    }
  },
  { 
    header: "Drop-off Location", 
    key: "end_location",
  
    render: (val) => {
      return val && val.trim() !== "" ? val : "Not Specified";
    }
  },
 {    
    header: "Operational Schedule Time Slot",
    key: "time_slot", // Fallback key string token identifier
    render: (_, row) => (
      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 text-xs">
        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded shadow-sm border border-slate-200">
          🕒 {row.start_time || '00:00'}
        </span>
        <span className="text-gray-400 font-black text-[10px] uppercase tracking-widest px-0.5">to</span>
        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded shadow-sm border border-slate-200">
          🕒 {row.end_time || '00:00'}
        </span>
      </div>)
  },
{ 
    header: "Purpose of Booking", 
    key: "Purpose",
  
    render: (val) => {
      return val && val.trim() !== "" ? val : "Not Specified";
    }
  },
{ 
  header: "Booking Status", 
  key: "status",
  // Adds beautiful badge styling matching the explicit booking status options from your API
  render: (val) => {
    const normalizedStatus = val?.toUpperCase() || 'PENDING';
    
    let badgeStyle = "bg-slate-100 text-slate-700 border-slate-300"; // Fallback catch style
    
    // 🟢 Mapping logic blocks matching your exact database validation options
    if (normalizedStatus === 'PENDING') {
      badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
    } else if (normalizedStatus === 'APPROVED') {
      badgeStyle = "bg-sky-50 text-sky-700 border-sky-200";
    } else if (normalizedStatus === 'ONGOING') {
      badgeStyle = "bg-blue-50 text-blue-700 border-blue-200";
    } else if (normalizedStatus === 'COMPLETED') {
      badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
    } else if (normalizedStatus === 'REJECTED') {
      badgeStyle = "bg-rose-50 text-rose-700 border-rose-200";
    }

    return (
      <span className={`inline-block px-3 py-1 rounded-[20px] text-xs font-black border uppercase tracking-wider ${badgeStyle}`}>
        {normalizedStatus}
      </span>
    );
  }
},
{
  header: "Registration Date",
  key: "created_at",
  render: (val) => {
    if (!val) return <span className="text-gray-400 italic text-xs">N/A</span>;
    
    // Parse the raw ISO string into a standard JS Date object
    const dateObj = new Date(val);
    
    // Format the date part (e.g., "Jun 5, 2026")
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    // Format the time part (e.g., "12:36 PM")
    const formattedTime = dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return (
      <div className="flex flex-col gap-0.5 text-xs">
        {/* Main visible calendar record */}
        <span className="font-bold text-ntc-dark">🗓️ {formattedDate}</span>
        {/* Subtle, smaller time tracker subtitle */}
        <span className="text-[10px] text-ntc-muted font-semibold uppercase tracking-wide">
          🕒 {formattedTime}
        </span>
      </div>
    );
  }
}



];
const AdminBookingPage = () => {

    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true); 


const hydrateDashboardData = async () => {
  setLoading(true); 
  try {
    const [bookingsResult] = await Promise.allSettled([
      bookingServices.getBookingList()
    ]);

    // 3. Handle Bookings List Data Pipeline
    if (bookingsResult.status === 'fulfilled') {
     
      setBookings(bookingsResult.value || []); 
    } else {
      if (bookingsResult.reason.response?.status !== 404) {
        console.error("Bookings registry stream breakdown:", bookingsResult.reason);
      }
      setBookings([]); 
    }

  } catch (err) {
    console.error("Core booking engine synchronization exception:", err);
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
    if (user) hydrateDashboardData();
  }, [user]);


  return (
<>

        <main className="flex-1 p-6 overflow-y-auto bg-ntc-gray space-y-6">
          <h1 className="text-ntc-dark font-black text-2xl tracking-tight flex items-center gap-3">
            <NotebookPen className="text-ntc-blue" size={28} />
            Booking Management Panel
          </h1>

          {/* 🌟 Added: Action cards render right above the universal data layout */}
          <PendingBookingsSection 
            bookings={bookings} 
            onRefresh={hydrateDashboardData} 
          />

          <UniversalTable 
            title="Booking List" 
            icon={ClipboardList} 
            columns={bookingColumns} 
            data={bookings}
          />
        </main>
</>
  );
}
export default AdminBookingPage