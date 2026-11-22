// =============================================================================
// RELIEFROUTE: Full GIS Command & Disaster Logistics Map Module
// =============================================================================

import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DisasterMapComponent } from '../components/map/DisasterMapComponent';
import { EmergencyRequest, ReliefCentre, Vehicle, RoadCondition, Delivery } from '../types';
import { useToast } from '../context/ToastContext';
import {
  MapPin,
  Building2,
  Truck,
  Compass,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  Navigation
} from 'lucide-react';

export const MapPage: React.FC = () => {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [centres, setCentres] = useState<ReliefCentre[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [roads, setRoads] = useState<RoadCondition[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  // Route calculation state
  const [selectedCentreId, setSelectedCentreId] = useState<string>('');
  const [selectedReqId, setSelectedReqId] = useState<string>('');
  const [activeRoute, setActiveRoute] = useState<[number, number][]>([]);
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [routingLoading, setRoutingLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [reqRes, centreRes, vehRes, roadRes, delRes] = await Promise.all([
          api.getRequests(),
          api.getReliefCentres(),
          api.getVehicles(),
          api.getRoadConditions(),
          api.getDeliveries()
        ]);
        setRequests(reqRes);
        setCentres(centreRes);
        setVehicles(vehRes);
        setRoads(roadRes);
        setDeliveries(delRes);

        if (centreRes.length > 0) setSelectedCentreId(centreRes[0].id);
        if (reqRes.length > 0) setSelectedReqId(reqRes[0].id);
      } catch (err: any) {
        showToast('error', 'Map Data Error', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCalculateRoute = async () => {
    const centre = centres.find((c) => c.id === selectedCentreId);
    const req = requests.find((r) => r.id === selectedReqId);

    if (!centre || !req) {
      showToast('warning', 'Selection Required', 'Select a relief centre and an emergency request destination.');
      return;
    }

    try {
      setRoutingLoading(true);
      const res = await api.getRoute(centre.latitude, centre.longitude, req.latitude, req.longitude);
      setActiveRoute(res.coordinates);
      setRouteInfo(res);
      showToast(
        'success',
        'Route Calculated',
        `${res.distanceKm} km from ${centre.name} to ${req.affectedLocation} (~${res.durationMin} min). ${res.hasHazardDetour ? 'Detour applied around blocked zone.' : ''}`
      );
    } catch (err: any) {
      showToast('error', 'Routing Failed', err.message);
    } finally {
      setRoutingLoading(false);
    }
  };

  const handleClearRoute = () => {
    setActiveRoute([]);
    setRouteInfo(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <Compass className="w-3.5 h-3.5" />
            <span>INTERACTIVE GEOSPATIAL COMMAND CENTER</span>
          </div>
          <h1 className="text-2xl font-black text-white">Disaster Situation & Logistics Map</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Full-theatre interactive map tracking emergency requests, relief supply depots, active vehicles, and mountain road blockages.
          </p>
        </div>

        {/* Legend pills */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
          <span className="flex items-center space-x-1 px-2 py-1 rounded bg-rose-950 text-rose-300 border border-rose-800">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Critical</span>
          </span>
          <span className="flex items-center space-x-1 px-2 py-1 rounded bg-amber-950 text-amber-300 border border-amber-800">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>High</span>
          </span>
          <span className="flex items-center space-x-1 px-2 py-1 rounded bg-blue-950 text-blue-300 border border-blue-800">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Relief Centre</span>
          </span>
          <span className="flex items-center space-x-1 px-2 py-1 rounded bg-purple-950 text-purple-300 border border-purple-800">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span>Vehicle</span>
          </span>
          <span className="flex items-center space-x-1 px-2 py-1 rounded bg-slate-900 text-amber-400 border border-amber-600">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Road Blockage</span>
          </span>
        </div>
      </div>

      {/* Route Generator Bar */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
            <div className="w-full sm:w-1/2">
              <label className="block text-[11px] text-slate-400 font-mono mb-1">Origin Relief Centre:</label>
              <select
                value={selectedCentreId}
                onChange={(e) => setSelectedCentreId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              >
                {centres.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-1/2">
              <label className="block text-[11px] text-slate-400 font-mono mb-1">Destination Emergency Request:</label>
              <select
                value={selectedReqId}
                onChange={(e) => setSelectedReqId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              >
                {requests.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id} — {r.affectedLocation} ({r.priorityCategory})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2 sm:pt-0">
            <button
              onClick={handleCalculateRoute}
              disabled={routingLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 flex items-center space-x-1.5 transition disabled:opacity-50"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{routingLoading ? 'Calculating...' : 'Compute Route'}</span>
            </button>
            {activeRoute.length > 0 && (
              <button
                onClick={handleClearRoute}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl border border-slate-700 transition"
              >
                Clear Route
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Map */}
      <DisasterMapComponent
        requests={requests}
        centres={centres}
        vehicles={vehicles}
        roads={roads}
        deliveries={deliveries}
        activeRoute={activeRoute}
        routeInfo={routeInfo}
        height="640px"
      />
    </div>
  );
};
