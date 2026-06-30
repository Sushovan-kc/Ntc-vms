import { React,useState,useEffect } from 'react'
import adminservices from '../../api/services/adminservices'
import { useAuth } from '../../context/AuthContext';
import { User, Car, LayoutDashboard,MapPin,Truck,Database,Activity,BookOpen,ClipboardList} from 'lucide-react';
import VehicleAddForm from '../../components/vehicle/VehicleAddForm';
import UniversalTable from '../../components/dashboard/UniversalTable';



const dispatchColumns = [
  { 
    header: "ID", 
    key: "id", 
    render: (val) => <span className="font-bold text-ntc-dark">DISPATCH-#{val}</span> 
  },
  {
    header:"Booked By",
    key:"booking_user",
    render:(val) => <span className="font-medium text-ntc-dark">{val || 'N/A'}</span>
  },
  { 
    header: "Purpose", 
    key: "booking_purpose",
    // Fixes the empty string fallback
    render: (val) => {
      return val && val.trim() !== "" ? val : "General Operations / Not Specified";
    }
  },
  {
    header:"Driver Assigned",
    key:"driver_name",
    render:(val) => <span className="font-medium text-ntc-dark">{val || 'N/A'}</span>
  },
 {
    header: "Assigned Fleet Unit",
    key: "vehicle_model", // This can be any key from your row; the render function overrides it
    // 💡 Accessing 'row' allows you to read multiple fields at once
    render: (val, row) => {
      const vehicleDetails = `${row.vehicle_manufacturer} ${row.vehicle_model}`;
      const plateNumber = row.vehicle_license_plate;

      return (
        <div className="flex flex-col">
          <span className="font-semibold text-ntc-dark">{vehicleDetails}</span>
          <span className="text-xs text-ntc-blue font-mono font-bold tracking-wide mt-0.5">
            💳 {plateNumber || 'No Plate Registered'}
          </span>
        </div>
      );
    }
  },
{
  header: "Operational Schedule Time Slot",
  key: "time_slot", 
  render: (_, row) => {
    // Helper function to format ISO strings cleanly
    const formatDateTime = (isoString) => {
      if (!isoString) return { date: 'N/A', time: '00:00' };
      
      const dateObj = new Date(isoString);
      
      // Formats to: YYYY-MM-DD
      const dateStr = new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(dateObj);

      // Formats to: 24-hour HH:MM
      const timeStr = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(dateObj);

      return { date: dateStr, time: timeStr };
    };

    const start = formatDateTime(row.booking_start_time);
    const end = formatDateTime(row.booking_end_time);

    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs font-mono">
        {/* Start Time Slot */}
        <div className="flex flex-col items-start bg-slate-100 px-2 py-1 rounded shadow-sm border border-slate-200">
          <span className="text-[10px] text-slate-500 font-sans tracking-tight">{start.date}</span>
          <span className="font-bold text-slate-800 text-sm"> {start.time}</span>
        </div>

        <span className="text-gray-400 font-black text-[10px] uppercase tracking-widest px-0.5 text-center sm:self-center">
          to
        </span>

        {/* End Time Slot */}
        <div className="flex flex-col items-start bg-slate-100 px-2 py-1 rounded shadow-sm border border-slate-200">
          <span className="text-[10px] text-slate-500 font-sans tracking-tight">{end.date}</span>
          <span className="font-bold text-slate-800 text-sm">{end.time}</span>
        </div>
      </div>
    );
  }
},
  { 
    header: "Dispatch Status", 
    key: "dispatch_status",
    // Adds beautiful badge styling matching the driver_status from your API
    render: (val) => {
      const normalizedStatus = val?.toUpperCase();
      
      let badgeStyle = "bg-blue-50 text-ntc-blue border-blue-200"; // Default / PENDING
      
      if (normalizedStatus === 'COMPLETED') {
        badgeStyle = "bg-emerald-50 text-ntc-success border-emerald-200";
      } else if (normalizedStatus === 'IN PROGRESS') {
        badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
      } else if (normalizedStatus === 'CANCELLED') {
        // Style for your current API data state
        badgeStyle = "bg-red-50 text-red-700 border-red-200"; 
      }

      return (
        <span className={`inline-block px-3 py-1 rounded-[20px] text-xs font-bold border ${badgeStyle}`}>
          {normalizedStatus || 'PENDING DISPATCH'}
        </span>
      );
    }
  }
];

const AdminDispatchPage = () => {

    const { user } = useAuth();
    const [dispatches, setDispatches] = useState([]);
    const [loading, setLoading] = useState(true);

      const hydrateDashboardData = async () => {
    try {
      const [dispatchResult] = await Promise.allSettled([
        adminservices.adminDispatchList()
      ]);

      if (dispatchResult.status === 'fulfilled') {
        setDispatches(dispatchResult.value || []);
      } else {
        if (dispatchResult.reason.response?.status !== 404) console.error(dispatchResult.reason);
        setDispatches([]);
      }

    } catch (err) {
      console.error("Core engine synchronization exception:", err);
    } finally {
      // 🟢 FIX 2: Moved inside finally block to ensure loading state drops even on partial API failures
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
            <Car className="text-ntc-blue" size={28} />
            Admin Command Center
          </h1>
          </main>

          <UniversalTable 
                title="Admin Dispatch Manifest Stream" 
                icon={ClipboardList} 
                columns={dispatchColumns} 
                data={dispatches}
              />
</>
  )
}

export default AdminDispatchPage