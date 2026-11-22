// =============================================================================
// RELIEFROUTE: Interactive Leaflet Disaster GIS Map Component
// OpenStreetMap tiles with custom Lucide pins, routes, and obstacle rendering
// =============================================================================

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { EmergencyRequest, ReliefCentre, Vehicle, RoadCondition, Delivery } from '../../types';
import {
  MapPin,
  Building2,
  Truck,
  AlertTriangle,
  Users,
  Droplets,
  Package,
  Activity,
  Layers,
  Compass
} from 'lucide-react';

interface DisasterMapProps {
  requests?: EmergencyRequest[];
  centres?: ReliefCentre[];
  vehicles?: Vehicle[];
  roads?: RoadCondition[];
  deliveries?: Delivery[];
  activeRoute?: [number, number][];
  routeInfo?: any;
  height?: string;
  selectedRequestId?: string;
  onSelectRequest?: (req: EmergencyRequest) => void;
}

// Center of Uttarakhand demonstration theater (between Rishikesh, Srinagar Garhwal & Joshimath)
const DEFAULT_CENTER: [number, number] = [30.29, 78.95];
const DEFAULT_ZOOM = 8;

// Component to dynamically recenter map when selection changes
const MapRecenter: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom || map.getZoom());
  }, [center, zoom, map]);
  return null;
};

// Create custom SVG Leaflet div icons
const createCustomIcon = (type: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'CENTRE' | 'VEHICLE' | 'ROAD_BLOCK') => {
  let bgClass = 'bg-slate-700';
  let borderClass = 'border-white';
  let pulse = false;
  let text = '!';

  switch (type) {
    case 'CRITICAL':
      bgClass = 'bg-rose-600';
      borderClass = 'border-rose-300 ring-4 ring-rose-500/30';
      pulse = true;
      text = '⚡';
      break;
    case 'HIGH':
      bgClass = 'bg-amber-600';
      borderClass = 'border-amber-300';
      pulse = true;
      text = '▲';
      break;
    case 'MEDIUM':
      bgClass = 'bg-yellow-500';
      borderClass = 'border-yellow-200';
      text = '●';
      break;
    case 'LOW':
      bgClass = 'bg-emerald-600';
      borderClass = 'border-emerald-300';
      text = '■';
      break;
    case 'CENTRE':
      bgClass = 'bg-blue-600';
      borderClass = 'border-cyan-300 ring-4 ring-blue-500/25';
      text = '🏢';
      break;
    case 'VEHICLE':
      bgClass = 'bg-purple-600';
      borderClass = 'border-purple-300';
      pulse = true;
      text = '🚚';
      break;
    case 'ROAD_BLOCK':
      bgClass = 'bg-black text-amber-400';
      borderClass = 'border-amber-400 ring-2 ring-red-500';
      pulse = true;
      text = '⛔';
      break;
  }

  const html = `
    <div class="relative flex items-center justify-center w-8 h-8 rounded-full ${bgClass} ${borderClass} border-2 shadow-xl transform hover:scale-125 transition-transform duration-200">
      ${pulse ? '<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>' : ''}
      <span class="text-xs font-bold text-white select-none">${text}</span>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

export const DisasterMapComponent: React.FC<DisasterMapProps> = ({
  requests = [],
  centres = [],
  vehicles = [],
  roads = [],
  activeRoute = [],
  routeInfo = null,
  height = '580px',
  selectedRequestId,
  onSelectRequest
}) => {
  const [filterCritical, setFilterCritical] = useState(true);
  const [filterCentres, setFilterCentres] = useState(true);
  const [filterRoads, setFilterRoads] = useState(true);
  const [filterVehicles, setFilterVehicles] = useState(true);

  // Selected request coordinates for focus
  const selectedReq = requests.find((r) => r.id === selectedRequestId);
  const centerCoord: [number, number] = selectedReq
    ? [selectedReq.latitude, selectedReq.longitude]
    : DEFAULT_CENTER;
  const zoomLevel = selectedReq ? 11 : DEFAULT_ZOOM;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-[#0B0F19]">
      {/* Map Control Overlay */}
      <div className="absolute top-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 shadow-xl space-y-2 text-xs">
        <div className="flex items-center space-x-1.5 text-slate-300 font-semibold mb-1 pb-1 border-b border-slate-800">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>GIS Map Filters</span>
        </div>
        <div className="space-y-1.5">
          <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={filterCritical}
              onChange={(e) => setFilterCritical(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-rose-500 focus:ring-0"
            />
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
              <span>Emergency Requests ({requests.length})</span>
            </span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={filterCentres}
              onChange={(e) => setFilterCentres(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-0"
            />
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
              <span>Relief Centres ({centres.length})</span>
            </span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={filterRoads}
              onChange={(e) => setFilterRoads(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0"
            />
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-black border border-amber-400 inline-block"></span>
              <span>Road Blockages ({roads.length})</span>
            </span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={filterVehicles}
              onChange={(e) => setFilterVehicles(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-purple-500 focus:ring-0"
            />
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
              <span>Delivery Fleet ({vehicles.length})</span>
            </span>
          </label>
        </div>
      </div>

      {/* Route Badge Overlay if route active */}
      {routeInfo && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-blue-500/50 shadow-2xl text-xs max-w-sm">
          <div className="flex items-center space-x-2 text-cyan-400 font-semibold mb-1">
            <Compass className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Active Convoy Route</span>
          </div>
          <div className="text-slate-300 space-y-0.5 text-[11px]">
            <p>
              Distance: <strong className="text-white">{routeInfo.distanceKm} km</strong> • Duration:{' '}
              <strong className="text-white">{routeInfo.durationMin} min</strong>
            </p>
            {routeInfo.hazardWarning && (
              <p className="text-amber-400 font-medium">⚠️ {routeInfo.hazardWarning}</p>
            )}
            <p className="text-[10px] text-slate-400 italic mt-1">{routeInfo.attribution}</p>
          </div>
        </div>
      )}

      {/* Leaflet Map Container */}
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height, width: '100%' }}
        scrollWheelZoom={true}
        className="z-0"
      >
        <MapRecenter center={centerCoord} zoom={zoomLevel} />

        {/* CartoDB Dark Matter tiles for realistic tactical operations center aesthetic */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Active Route Polyline */}
        {activeRoute && activeRoute.length > 0 && (
          <Polyline
            positions={activeRoute}
            pathOptions={{
              color: '#06B6D4',
              weight: 5,
              opacity: 0.85,
              dashArray: routeInfo?.hasHazardDetour ? '8, 8' : undefined
            }}
          />
        )}

        {/* Relief Centres Markers (Blue) */}
        {filterCentres &&
          centres.map((c) => (
            <Marker key={c.id} position={[c.latitude, c.longitude]} icon={createCustomIcon('CENTRE')}>
              <Popup className="custom-leaflet-popup">
                <div className="p-1 space-y-1 text-slate-900">
                  <div className="flex items-center space-x-1.5 font-bold text-sm text-blue-700">
                    <Building2 className="w-4 h-4" />
                    <span>{c.name}</span>
                  </div>
                  <p className="text-xs text-slate-600">{c.locationName}</p>
                  <div className="text-[11px] pt-1 border-t border-slate-200 grid grid-cols-2 gap-1 font-mono">
                    <div>Food: {c.inventory.foodPackets.toLocaleString()}</div>
                    <div>Water: {c.inventory.waterLitres.toLocaleString()}L</div>
                    <div>Med: {c.inventory.medicalKits.toLocaleString()}</div>
                    <div>Shelter: {c.inventory.shelterKits.toLocaleString()}</div>
                  </div>
                  <p className="text-[10px] text-slate-500 pt-1">Contact: {c.contactPerson} ({c.contactPhone})</p>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Road Closures / Hazard Markers (Black/Red) */}
        {filterRoads &&
          roads.map((r) => (
            <Marker key={r.id} position={[r.latitude, r.longitude]} icon={createCustomIcon('ROAD_BLOCK')}>
              <Popup className="custom-leaflet-popup">
                <div className="p-1 space-y-1 text-slate-900">
                  <div className="flex items-center space-x-1.5 font-bold text-sm text-rose-700">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>{r.status}: {r.conditionType}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">{r.roadName}</p>
                  <p className="text-[11px] text-slate-600">{r.description}</p>
                  <p className="text-[10px] text-slate-500">Reported by: {r.reportedBy}</p>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Vehicle Fleet Markers (Purple) */}
        {filterVehicles &&
          vehicles.map((v) => (
            <Marker
              key={v.id}
              position={[v.currentLatitude, v.currentLongitude]}
              icon={createCustomIcon('VEHICLE')}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-1 space-y-1 text-slate-900">
                  <div className="flex items-center space-x-1.5 font-bold text-sm text-purple-700">
                    <Truck className="w-4 h-4" />
                    <span>{v.vehicleNumber}</span>
                  </div>
                  <p className="text-xs text-slate-700">Type: {v.vehicleType} ({v.capacityKg}kg)</p>
                  <p className="text-xs">
                    Status: <strong className="text-purple-600">{v.status}</strong> • Fuel: {v.fuelLevelPercent}%
                  </p>
                  {v.driverName && <p className="text-[10px] text-slate-500">Driver: {v.driverName}</p>}
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Emergency Requests (Red / Orange / Yellow / Green) */}
        {filterCritical &&
          requests.map((req) => (
            <Marker
              key={req.id}
              position={[req.latitude, req.longitude]}
              icon={createCustomIcon(req.priorityCategory)}
              eventHandlers={{
                click: () => onSelectRequest && onSelectRequest(req)
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-1.5 space-y-1.5 text-slate-900 max-w-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-500">{req.id}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        req.priorityCategory === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-700 border border-rose-300'
                          : req.priorityCategory === 'HIGH'
                          ? 'bg-amber-100 text-amber-700 border border-amber-300'
                          : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                      }`}
                    >
                      {req.priorityCategory} ({req.priorityScore})
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 leading-tight">{req.affectedLocation}</h4>

                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-700 bg-slate-100 p-1.5 rounded-lg">
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3 text-slate-500" />
                      <span>{req.affectedPopulation} people</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Activity className="w-3 h-3 text-rose-500" />
                      <span>Med: {req.medicalUrgency}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Package className="w-3 h-3 text-amber-500" />
                      <span>Food: {req.foodNeeded}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Droplets className="w-3 h-3 text-blue-500" />
                      <span>Water: {req.waterNeeded}L</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-600 line-clamp-2">{req.description}</p>

                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200">
                    <span>Status: <strong>{req.status}</strong></span>
                    {onSelectRequest && (
                      <button
                        onClick={() => onSelectRequest(req)}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Inspect →
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};
