import React, { useEffect, useState } from 'react';
import { Car, Clock, RefreshCw, AlertCircle, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adminservices from '../../api/services/adminservices';

export default function ActiveDispatchCard() {
  const navigate = useNavigate();
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActiveDispatches = async () => {
    setLoading(true);
    setError(null);

    try {
      const [dispatchResult] = await Promise.allSettled([adminservices.adminDispatchList()]);

      if (dispatchResult.status === 'fulfilled') {
        setDispatches(dispatchResult.value || []);
      } else {
        if (dispatchResult.reason.response?.status !== 404) console.error(dispatchResult.reason);
        setDispatches([]);
      }
    } catch (err) {
      console.error("Core engine synchronization exception:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveDispatches();
    const interval = setInterval(fetchActiveDispatches, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[350px] w-full">
      
      {/* Card Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Clock className="text-ntc-blue" size={20} />
          <h2 className="font-bold text-ntc-dark text-lg">Active Fleet Operations</h2>
          <span className="bg-blue-50 text-ntc-blue text-xs font-semibold px-2 py-0.5 rounded-full">
            {dispatches?.length || 0} Live
          </span>
        </div>
        <button 
          onClick={fetchActiveDispatches}
          disabled={loading}
          className="text-gray-400 hover:text-ntc-blue transition-colors disabled:opacity-50"
          title="Refresh Feed"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Card Body */}
      <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-white w-full scrollbar-thin">
        {loading && (!dispatches || dispatches.length === 0) ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
            <RefreshCw className="animate-spin text-ntc-blue" size={24} />
            <p className="text-sm font-medium">Streaming active roster...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-500 text-center p-4 gap-2">
            <AlertCircle size={24} />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : !dispatches || dispatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-4 gap-2">
            <Car size={32} className="stroke-[1.5]" />
            <p className="text-sm font-medium">All vehicles currently stationary.</p>
          </div>
        ) : (
          dispatches.map((dispatch) => (
            <div 
              key={dispatch.id} 
              className="p-4 border border-gray-100 rounded-lg hover:border-gray-200 hover:shadow-sm transition-all bg-gray-50/50 flex items-center justify-between gap-4"
            >
              {/* Left Side: Vehicle Info & Driver */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="p-2.5 bg-blue-50 rounded-lg text-ntc-blue shrink-0">
                  <Car size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                    <span>{dispatch.vehicle_manufacturer} {dispatch.vehicle_model}</span>
                    <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded font-mono uppercase">
                      {dispatch.vehicle_license_plate || 'No Plate'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-0.5 truncate">
                    Driver: <span className="text-gray-700 font-semibold">{dispatch.driver_name || 'Unassigned Duty'}</span>
                  </p>
                </div>
              </div>

              {/* Right Side: Operational Status Badges */}
              <div className="shrink-0 flex flex-col items-end gap-1.5">
                <span className={`text-[11px] font-black tracking-wider uppercase px-2.5 py-1 rounded-md border ${
                  dispatch.dispatch_status === 'IN_PROGRESS' 
                    ? 'bg-amber-50 text-amber-700 border-amber-200' 
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {dispatch.dispatch_status === 'IN_PROGRESS' ? 'On Route' : 'Dispatched'}
                </span>
                {dispatch.dispatch_status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => navigate(`/dashboard/admin/livetracking/${dispatch.id}`)}
                    className="flex items-center gap-1 mt-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Navigation size={10} className="rotate-45" />
                    Track Live
                  </button>
                )}
                <span className="text-[10px] font-bold text-gray-400 font-mono">
                  Ref: #{dispatch.booking}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}