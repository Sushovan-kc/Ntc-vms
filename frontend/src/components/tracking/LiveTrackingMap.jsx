import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Centrifuge } from 'centrifuge';
import apiClient from '../../api/client';
import { buildCentrifugoWebSocketUrl } from '../../api/runtime';

// 🐛 Leaflet Fix: Restores default icon asset paths manually.
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize:[25, 41],
  iconAnchor:[12, 41],
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
  const [connectionActive, setConnectionActive] = useState(false);

  useEffect(() => {
    // 1. 🔥 RESTORED: Fetch historical route coordinates so loading state resolves
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

    if (!dispatchId) {
      setLoading(false);
      return;
    }

    // 2. Fetch authenticated JWT access token used by Centrifugo
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setConnectionActive(false);
      return;
    }

    // 3. Connect straight to your Centrifugo deployment engine
    const wsUrl = buildCentrifugoWebSocketUrl();
    const centrifugo = new Centrifuge(wsUrl, {
      token: token
    });

    // 4. Open a channel subscription to the dedicated tracking channel namespace string
    const sub = centrifugo.newSubscription(`tracking:dispatch_${dispatchId}`);

    centrifugo.on('connected', () => setConnectionActive(true));
    centrifugo.on('disconnected', () => setConnectionActive(false));

    // 5. Fire callback whenever Centrifugo pushes new location updates
    sub.on('publication', (ctx) => {
      const payload = ctx.data;
      const incomingLocation = [payload.lat, payload.lon];
      setCurrentPosition(incomingLocation);
      setRouteTrail((prevTrail) => [...prevTrail, incomingLocation]);
    });

    sub.subscribe();
    centrifugo.connect();

    return () => {
      sub.unsubscribe();
      centrifugo.disconnect();
    };
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
        
        {/* Dynamic Connection Indicator */}
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border ${
          connectionActive ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'
        }`}>
          <span className={`w-2.5 h-2.5 rounded-full ${connectionActive ? 'bg-green-500 animate-ping' : 'bg-amber-500'}`}></span>
          <span className="text-sm font-semibold">{connectionActive ? 'Live Streaming' : 'Connecting Engine...'}</span>
        </div>
      </div>

      {/* Map Window Wrapper Element */}
      <div className="h-[500px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner z-10">
        <MapContainer center={defaultCenter} zoom={14} className="h-full w-full">
          <TileLayer attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
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
