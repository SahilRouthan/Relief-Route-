// =============================================================================
// RELIEFROUTE: Relief Centre Management Module
// =============================================================================

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ReliefCentre } from '../types';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  MapPin,
  Phone,
  User,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Package,
  Droplets,
  Activity
} from 'lucide-react';

export const ReliefCentresPage: React.FC = () => {
  const { role } = useAuth();
  const { showToast } = useToast();
  const [centres, setCentres] = useState<ReliefCentre[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCentres = async () => {
    try {
      setLoading(true);
      const res = await api.getReliefCentres();
      setCentres(res);
    } catch (err: any) {
      showToast('error', 'Error loading relief centres', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCentres();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>REGIONAL DEPOT & STAGING HUBS</span>
          </div>
          <h1 className="text-2xl font-black text-white">Relief Logistics Centres</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational disaster supply hubs across Uttarakhand holding food rations, clean drinking water, trauma kits, and shelter tents.
          </p>
        </div>

        <Link
          to="/inventory"
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5"
        >
          <Boxes className="w-4 h-4" />
          <span>Manage Depot Inventories</span>
        </Link>
      </div>

      {/* Grid of Relief Centres */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {centres.map((c) => {
          const inv = c.inventory;
          const isHighAltitude = c.locationName.includes('Joshimath') || c.name.includes('High-Altitude');

          return (
            <div
              key={c.id}
              className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                {/* Top Badges */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                    {c.code}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      c.operationalStatus === 'ACTIVE'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {c.operationalStatus}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight leading-snug">{c.name}</h3>

                <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span className="truncate">{c.locationName}</span>
                </div>

                {/* Storage & Contact Info */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Storage Area:</span>
                    <strong className="text-white font-mono">{c.storageCapacitySqm.toLocaleString()} sqm</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Depot Commander:</span>
                    <strong className="text-slate-200">{c.contactPerson}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Emergency Hotline:</span>
                    <span className="font-mono text-cyan-400">{c.contactPhone}</span>
                  </div>
                </div>

                {/* Live Inventory Preview */}
                <div className="mt-4 p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-2">
                    Current Stock Holdings
                  </span>
                  <div className="grid grid-cols-2 gap-2 font-mono">
                    <div className="flex items-center space-x-1.5 text-slate-300">
                      <Package className="w-3.5 h-3.5 text-amber-400" />
                      <span>Food: <strong className="text-white">{inv.foodPackets.toLocaleString()}</strong></span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-300">
                      <Droplets className="w-3.5 h-3.5 text-blue-400" />
                      <span>Water: <strong className="text-white">{inv.waterLitres.toLocaleString()}L</strong></span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-300">
                      <Activity className="w-3.5 h-3.5 text-rose-400" />
                      <span>Med: <strong className="text-white">{inv.medicalKits.toLocaleString()}</strong></span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-300">
                      <Boxes className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Shelter: <strong className="text-white">{inv.shelterKits.toLocaleString()}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-slate-500">
                  Lat: {c.latitude.toFixed(3)}, Lng: {c.longitude.toFixed(3)}
                </span>
                <Link
                  to="/inventory"
                  className="text-blue-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
                >
                  <span>Inventory Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
