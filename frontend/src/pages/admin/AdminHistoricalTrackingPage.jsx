import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import { Navigation, Route, MapPin, ArrowLeft, Clock, Activity, CheckCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
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

export default function AdminHistoricalTrackingPage({ recordId: propRecordId, onBack: propOnBack }) {
  const { recordId: routeRecordId } = useParams();
  const navigate = useNavigate();

  // Support both inline prop mounting and direct route URL navigation
  const recordId = propRecordId || routeRecordId;
  const isSubComponent = !!propRecordId;

  const [routeTrail, setRouteTrail] = useState([]);    // [[lat, lon], ...]
  const [distanceKm, setDistanceKm] = useState(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [dispatchStatus, setDispatchStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!recordId) return;

    setLoading(true);
    setRouteTrail([]);
    setError(null);

    // Fetch the completed route from the HistoricalDispatchRouteView endpoint
    apiClient.get(`/api/driver/tracking/history/record/${recordId}/`)
      .then((response) => {
        const { coordinates, distance_km, total_points, dispatch_status } = response.data;
        setRouteTrail(coordinates || []);
        setDistanceKm(distance_km ?? null);
        setTotalPoints(total_points || 0);
        setDispatchStatus(dispatch_status || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading historical route data:', err);
        setError('Could not retrieve route history for this record.');
        setLoading(false);
      });
  }, [recordId]);

  const handleBack = () => {
    if (isSubComponent && propOnBack) {
      propOnBack();
    } else {
      navigate('/dashboard/admin/dispatch');
    }
  };

  // Default center: Kathmandu; overridden by first coordinate if available
  const mapCenter =
    routeTrail.length > 0 ? routeTrail[0] : [27.7172, 85.3240];

  // ── Loading State ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ntc-gray text-ntc-muted font-semibold tracking-wide">
        <div className="text-center space-y-3">
          <Route className="text-ntc-blue animate-pulse mx-auto" size={48} />
          <p className="animate-pulse">Loading historical route data...</p>
        </div>
      </div>
    );
  }

  // ── Error State ──
  if (error) {
    return (
      <main className="flex-1 p-6 overflow-y-auto bg-ntc-gray space-y-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ntc-blue hover:text-blue-800 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Dispatch
        </button>
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm border border-red-100 text-center p-12 space-y-4 mt-6">
          <div className="p-4 bg-red-50 rounded-full w-fit mx-auto text-red-500">
            <Activity size={40} className="opacity-70" />
          </div>
          <h3 className="text-lg font-bold text-ntc-dark">Route Data Unavailable</h3>
          <p className="text-ntc-muted text-sm max-w-sm mx-auto">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 overflow-y-auto bg-ntc-gray space-y-6">

      {/* ── Header Navigation Panel ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ntc-blue hover:text-blue-800 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Dispatch
          </button>
          <h1 className="text-ntc-dark font-black text-2xl tracking-tight flex items-center gap-3">
            <Route className="text-ntc-blue" size={28} />
            Route History Trace
          </h1>
          <p className="text-xs text-ntc-muted font-medium">
            Completed journey trail for Dispatch Record: #{recordId}
          </p>
        </div>

        {/* Completion Status Badge */}
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 font-bold text-xs px-4 py-2 rounded-full border border-emerald-200 uppercase tracking-wider self-start sm:self-auto shadow-xs">
          <CheckCircle size={14} />
          {dispatchStatus || 'Archived'}
        </div>
      </div>

      {/* ── Summary Metrics Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-6xl">
        {/* Distance Traveled */}
        <div className="bg-white p-4 rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-ntc-blue rounded-lg">
            <Navigation size={20} />
          </div>
          <div>
            <span className="text-[10px] text-ntc-muted font-bold block uppercase tracking-wider">Total Distance</span>
            <span className="text-lg font-black text-ntc-dark">
              {distanceKm !== null ? distanceKm : '—'}
              <span className="text-xs font-normal text-ntc-muted"> km</span>
            </span>
          </div>
        </div>

        {/* Waypoint Nodes Count */}
        <div className="bg-white p-4 rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <MapPin size={20} />
          </div>
          <div>
            <span className="text-[10px] text-ntc-muted font-bold block uppercase tracking-wider">Nodes Logged</span>
            <span className="text-lg font-black text-ntc-dark">
              {totalPoints}
              <span className="text-xs font-normal text-ntc-muted"> coordinates</span>
            </span>
          </div>
        </div>

        {/* Record ID */}
        <div className="bg-white p-4 rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center gap-4 sm:col-span-1">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[10px] text-ntc-muted font-bold block uppercase tracking-wider">Dispatch Record</span>
            <span className="text-sm font-mono font-black text-ntc-dark">#{recordId}</span>
          </div>
        </div>
      </div>

      {/* ── Static Leaflet Map Canvas ── */}
      <div className="h-[520px] w-full max-w-6xl rounded-[10px] overflow-hidden border border-gray-200 shadow-[0_4px_25px_rgba(0,0,0,0.04)] z-10 bg-white p-2">
        {routeTrail.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-ntc-muted">
            <MapPin size={48} className="opacity-20" />
            <p className="text-sm font-semibold">No GPS waypoints were recorded for this trip.</p>
          </div>
        ) : (
          <MapContainer center={mapCenter} zoom={14} className="h-full w-full rounded-[8px]">
            <TileLayer
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Start pin — first recorded coordinate */}
            <Marker position={routeTrail[0]} />

            {/* End pin — final recorded coordinate (only if more than one point) */}
            {routeTrail.length > 1 && (
              <Marker position={routeTrail[routeTrail.length - 1]} />
            )}

            {/* Static completed route polyline trail */}
            <Polyline
              positions={routeTrail}
              color="#2563eb"
              weight={5}
              opacity={0.85}
              lineCap="round"
              lineJoin="round"
              dashArray={null}
            />
          </MapContainer>
        )}
      </div>

    </main>
  );
}
