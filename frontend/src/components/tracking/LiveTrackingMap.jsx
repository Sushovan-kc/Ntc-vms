import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import apiClient from '../../api/client';
import { buildWebSocketUrl } from '../../api/runtime';

// 🐛 Leaflet Fix: Webpack/Vite messes up default icon asset paths. This restores them manually.
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper sub-component to auto-center the map window whenever the vehicle moves
function MapRecenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  return null;
}

export default function LiveTrackingMap({ dispatchId }) {
  const [currentPosition, setCurrentPosition] = useState(null); // Format: [lat, lon]
  const [routeTrail, setRouteTrail] = useState([]); // Array of coordinates: [[lat, lon], ...]
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch historical route coordinates logged up to this point using Axios
    apiClient.get(`/api/driver/tracking/history/${dispatchId}/`)
      .then((response) => {
        const coords = response.data.coordinates;
        if (coords && coords.length > 0) {
          setRouteTrail(coords);
          setCurrentPosition(coords[coords.length - 1]); // Set pin to latest point
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading route trail history:", error);
        setLoading(false);
      });

    // 2. Connect directly to the Daphne ASGI WebSocket room for this unique trip
  const ws = new WebSocket(buildWebSocketUrl(`/ws/tracking/${dispatchId}/`));

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      const incomingLocation = [payload.lat, payload.lon];

      // Update state live as the vehicle drives
      setCurrentPosition(incomingLocation);
      setRouteTrail((prevTrail) => [...prevTrail, incomingLocation]);
    };

    ws.onerror = (error) => console.error("WebSocket Pipeline Error:", error);

    // Clean up connection when the manager leaves the page/closes the component
    return () => ws.close();
  }, [dispatchId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-gray-500 animate-pulse text-lg font-medium">Retrieving spatial telemetry layers...</p>
      </div>
    );
  }

  // If no position data is available yet, provide a fallback view centered on a default city
  const defaultCenter = currentPosition || [27.7172, 85.3240]; 

  return (
    <div className="w-full max-w-5xl mx-auto p-4 bg-white shadow-lg rounded-2xl border border-gray-100">
      {/* Tailwind Layout Info Cards */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Vehicle Live Tracking Panel</h2>
          <p className="text-sm text-gray-500">Dispatch ID: #{dispatchId}</p>
        </div>
        <div className="flex items-center space-x-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
          <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
          <span className="text-sm font-semibold text-green-700">Live Streaming</span>
        </div>
      </div>

      {/* Map Window Wrapper Element */}
      <div className="h-[500px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner z-10">
        <MapContainer center={defaultCenter} zoom={14} className="h-full w-full">
          {/* Completely free, no-token OpenStreetMap Tile layer */}
          <TileLayer
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Connect map motion controller */}
          <MapRecenter position={currentPosition} />

          {/* Place Pin at Vehicle's exact location */}
          {currentPosition && (
            <Marker position={currentPosition} />
          )}

          {/* Draw a thick line showing the driver's exact path trail */}
          <Polyline positions={routeTrail} color="#ef4444" weight={5} opacity={0.8} />
        </MapContainer>
      </div>
    </div>
  );
}
