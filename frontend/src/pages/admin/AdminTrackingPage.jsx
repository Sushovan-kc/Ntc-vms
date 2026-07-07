import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import { Navigation, Radio, MapPin, ArrowLeft, RefreshCw, Car, Clock, Activity } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client'; // Adjust path to target your configured wrapper instance
import { buildWebSocketUrl } from '../../api/runtime';
import adminservices from '../../api/services/adminservices';
import L from 'leaflet';

// 🐛 Leaflet Webpack/Vite Asset Reference Patch Configuration
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Sub-component to seamlessly shift and center map perspective when coordinates change
function MapRecenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  return null;
}

export default function ManagerTrackingPage({ dispatchId: propDispatchId, onBack: propOnBack }) {
  const { dispatchId: routeDispatchId } = useParams();
  const navigate = useNavigate();

  // Support both inline prop mounting and direct route URL navigation
  const dispatchId = propDispatchId || routeDispatchId;
  const isSubComponent = !!propDispatchId;

  const [currentPosition, setCurrentPosition] = useState(null); // Format: [lat, lon]
  const [routeTrail, setRouteTrail] = useState([]); // Format: [[lat, lon], ...]
  const [loading, setLoading] = useState(true);
  const [telemetryMetaData, setTelemetryMetaData] = useState({ speed: 0, lastPing: 'Never' });

  // List states for selection view when no dispatchId is selected
  const [activeDispatches, setActiveDispatches] = useState([]);
  const [fetchingDispatches, setFetchingDispatches] = useState(false);

  // Fetch active dispatches when no dispatchId is provided
  const fetchActiveDispatches = async () => {
    setFetchingDispatches(true);
    try {
      const data = await adminservices.adminDispatchList();
      setActiveDispatches(data || []);
    } catch (err) {
      console.error("Error loading active dispatches:", err);
    } finally {
      setFetchingDispatches(false);
    }
  };

  useEffect(() => {
    if (!dispatchId) {
      fetchActiveDispatches();
      setLoading(false);
      return;
    }

    setLoading(true);
    setCurrentPosition(null);
    setRouteTrail([]);

    // 1. Recover preceding vehicle path records from PostgreSQL JSONField on initialization
    apiClient.get(`/api/driver/tracking/history/${dispatchId}/`)
      .then((response) => {
        const coords = response.data.coordinates;
        if (coords && coords.length > 0) {
          setRouteTrail(coords);
          setCurrentPosition(coords[coords.length - 1]); // Locate current marker at latest known node
          setTelemetryMetaData(prev => ({ ...prev, lastPing: new Date().toLocaleTimeString() }));
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error retrieving historical dispatch route layout:", error);
        setLoading(false);
      });

    // 2. Establish live WebSocket communication line targeting your Daphne ASGI server channels
    const ws = new WebSocket(buildWebSocketUrl(`/ws/tracking/${dispatchId}/`));

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      const incomingLocation = [payload.lat, payload.lon];

      console.log("🛰️ Live Tracking Broadcast Received via WebSocket:", incomingLocation);

      // Extend state trail limits dynamically
      setCurrentPosition(incomingLocation);
      setRouteTrail((prevTrail) => [...prevTrail, incomingLocation]);
      setTelemetryMetaData({
        speed: payload.speed || 'N/A',
        lastPing: new Date().toLocaleTimeString()
      });
    };

    ws.onerror = (err) => console.error("Tracking channel pipeline dropped:", err);

    // 🧼 Disengage connection stream cleanly when leaving monitoring panel layout
    return () => ws.close();
  }, [dispatchId]);

  const handleBack = () => {
    if (isSubComponent && propOnBack) {
      propOnBack();
    } else if (!isSubComponent && routeDispatchId) {
      navigate('/dashboard/admin/livetracking');
    } else {
      navigate('/dashboard/admin/dispatch');
    }
  };

  const handleSelectDispatch = (id) => {
    if (isSubComponent && propOnBack) {
      // If used as a sub-component, we let parent manage it or we can't change state directly
      // In this setup, navigating is the cleanest way
      navigate(`/dashboard/admin/livetracking/${id}`);
    } else {
      navigate(`/dashboard/admin/livetracking/${id}`);
    }
  };

  // Render Selection View if no dispatch ID is active
  if (!dispatchId) {
    const liveTrips = activeDispatches.filter(d => d.dispatch_status === 'IN_PROGRESS');

    return (
      <main className="flex-1 p-6 overflow-y-auto bg-ntc-gray space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-ntc-dark font-black text-2xl tracking-tight flex items-center gap-3">
              <Navigation className="text-ntc-blue animate-pulse" size={28} />
              Live Fleet Tracking Command Center
            </h1>
            <p className="text-xs text-ntc-muted font-medium">Select an active operational vehicle to monitor its real-time GPS location.</p>
          </div>
          <button
            onClick={fetchActiveDispatches}
            disabled={fetchingDispatches}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw size={14} className={fetchingDispatches ? 'animate-spin' : ''} />
            Refresh List
          </button>
        </div>

        {fetchingDispatches ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
            <RefreshCw className="animate-spin text-ntc-blue" size={32} />
            <p className="text-sm font-semibold">Scanning fleet telemetry frequencies...</p>
          </div>
        ) : liveTrips.length === 0 ? (
          <div className="max-w-xl mx-auto bg-white rounded-xl shadow-xs border border-gray-100 text-center p-12 space-y-4 mt-6">
            <div className="p-4 bg-blue-50 rounded-full w-fit mx-auto text-ntc-blue">
              <Activity size={40} className="opacity-70" />
            </div>
            <h3 className="text-lg font-bold text-ntc-dark">No Active Trips Running</h3>
            <p className="text-ntc-muted text-sm max-w-sm mx-auto">
              There are currently no active dispatch vehicles en route (`IN_PROGRESS`). All fleet assets are stationary or pending dispatch.
            </p>
            <button
              onClick={() => navigate('/dashboard/admin/dispatch')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Go to Dispatch Center
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mt-4">
            {liveTrips.map((dispatch) => (
              <div 
                key={dispatch.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 bg-blue-50 text-ntc-blue rounded-lg">
                      <Car size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 font-mono">DISPATCH #{dispatch.id}</span>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-ntc-dark text-base">{dispatch.vehicle_manufacturer} {dispatch.vehicle_model}</h3>
                    <span className="inline-block mt-1 text-xs font-mono font-bold text-ntc-blue bg-blue-50/50 px-2 py-0.5 rounded border border-blue-100/50">
                      {dispatch.vehicle_license_plate || 'No Plate'}
                    </span>
                  </div>

                  <div className="border-t border-gray-50 pt-3 space-y-1.5 text-xs text-ntc-muted">
                    <p className="flex items-center gap-1.5">
                      <span className="font-bold text-gray-700">Driver:</span> {dispatch.driver_name || 'Unassigned'}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="font-bold text-gray-700">Booking Ref:</span> #{dispatch.booking}
                    </p>
                    <p className="truncate flex items-center gap-1.5">
                      <span className="font-bold text-gray-700">Purpose:</span> {dispatch.booking_purpose || 'General operations'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectDispatch(dispatch.id)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Navigation size={14} className="rotate-45" />
                  Track Live Location
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ntc-gray text-ntc-muted font-semibold tracking-wide">
        <div className="text-center space-y-3">
          <Radio className="text-ntc-blue animate-pulse mx-auto" size={48} />
          <p className="animate-pulse">Syncing real-time fleet transit arrays...</p>
        </div>
      </div>
    );
  }

  // Use the last captured position, or fall back to standard regional view center coordinates
  const mapCenter = currentPosition || [27.7172, 85.3240]; 

  return (
    <main className="flex-1 p-6 overflow-y-auto bg-ntc-gray space-y-6">
      
      {/* Dynamic Upper Header Panel Navigation Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <button 
            onClick={handleBack}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ntc-blue hover:text-blue-800 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to dashboard
          </button>
          <h1 className="text-ntc-dark font-black text-2xl tracking-tight flex items-center gap-3">
            <Navigation className="text-ntc-blue" size={28} />
            Live Journey Monitor
          </h1>
          <p className="text-xs text-ntc-muted font-medium">Tracking Route Node for Operations Manifest: #{dispatchId}</p>
        </div>

        {/* Live Signal Status Badge */}
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 font-bold text-xs px-4 py-2 rounded-full border border-emerald-200 uppercase tracking-wider self-start sm:self-auto shadow-xs">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
          Live Feed Active
        </div>
      </div>

      {/* Telemetry Real-Time Stats Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl">
        <div className="bg-white p-4 rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-ntc-blue rounded-lg"><Navigation size={20} /></div>
          <div>
            <span className="text-[10px] text-ntc-muted font-bold block uppercase tracking-wider">Current Velocity</span>
            <span className="text-lg font-black text-ntc-dark">{telemetryMetaData.speed} <span className="text-xs font-normal text-ntc-muted">km/h</span></span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><Clock size={20} /></div>
          <div>
            <span className="text-[10px] text-ntc-muted font-bold block uppercase tracking-wider">Latest Location Ping</span>
            <span className="text-sm font-mono font-bold text-ntc-dark">{telemetryMetaData.lastPing}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center gap-4 sm:col-span-2 md:col-span-1">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><MapPin size={20} /></div>
          <div>
            <span className="text-[10px] text-ntc-muted font-bold block uppercase tracking-wider">Nodes Logged</span>
            <span className="text-lg font-black text-ntc-dark">{routeTrail.length} <span className="text-xs font-normal text-ntc-muted">Coordinates</span></span>
          </div>
        </div>
      </div>

      {/* Primary Leaflet Interactive Map Window Block Canvas Element */}
      <div className="h-[520px] w-full max-w-6xl rounded-[10px] overflow-hidden border border-gray-200 shadow-[0_4px_25px_rgba(0,0,0,0.04)] z-10 bg-white p-2">
        <MapContainer center={mapCenter} zoom={15} className="h-full w-full rounded-[8px]">
          <TileLayer
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Connect interactive viewport alignment hook */}
          <MapRecenter position={currentPosition} />

          {/* Dynamic Pin marker location pointer */}
          {currentPosition && (
            <Marker position={currentPosition} />
          )}

          {/* Render operational transit polyline path trace lines matching your layout's blue theme style formats */}
          <Polyline positions={routeTrail} color="#2563eb" weight={5} opacity={0.85} lineCap="round" lineJoin="round" />
        </MapContainer>
      </div>

    </main>
  );
}
