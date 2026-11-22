// =============================================================================
// RELIEFROUTE: Logistics & Vehicle Delivery Tracking Module
// =============================================================================

import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Delivery, Vehicle } from '../types';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Navigation,
  Compass,
  Package,
  Droplets,
  Activity,
  Boxes,
  Edit3,
  X
} from 'lucide-react';

const STATUS_ORDER = ['PENDING', 'APPROVED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED'];

export const DeliveryTrackingPage: React.FC = () => {
  const { user, role } = useAuth();
  const { showToast } = useToast();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // Status update modal
  const [selectedDel, setSelectedDel] = useState<Delivery | null>(null);
  const [newStatus, setNewStatus] = useState<string>('IN_TRANSIT');
  const [statusNotes, setStatusNotes] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [delRes, vehRes] = await Promise.all([api.getDeliveries(), api.getVehicles()]);
      setDeliveries(delRes);
      setVehicles(vehRes);
    } catch (err: any) {
      showToast('error', 'Error fetching fleet dispatches', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDel) return;

    try {
      await api.updateDeliveryStatus(selectedDel.id, newStatus, statusNotes, user?.name || 'Field Operator');
      showToast('success', 'Status Updated', `Delivery ${selectedDel.id} marked as ${newStatus}`);
      setSelectedDel(null);
      fetchData();
    } catch (err: any) {
      showToast('error', 'Status Update Failed', err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <Truck className="w-4 h-4 text-cyan-400" />
            <span>LAST-MILE FLEET & DISPATCH TRACKING</span>
          </div>
          <h1 className="text-2xl font-black text-white">Emergency Logistics & Deliveries</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track humanitarian relief convoys, monitor mountain transit progress, and record direct field handovers.
          </p>
        </div>
      </div>

      {/* Grid of Active Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {deliveries.map((del) => {
          const veh = vehicles.find((v) => v.id === del.vehicleId);
          const isDelivered = del.status === 'DELIVERED';
          const isInTransit = del.status === 'IN_TRANSIT';

          const currentIdx = STATUS_ORDER.indexOf(del.status);

          return (
            <div
              key={del.id}
              className={`bg-[#111827] border rounded-2xl p-5 shadow-xl transition flex flex-col justify-between ${
                isDelivered
                  ? 'border-emerald-900/50 bg-gradient-to-br from-emerald-950/15 via-[#111827] to-[#111827]'
                  : isInTransit
                  ? 'border-purple-900/60 bg-gradient-to-br from-purple-950/20 via-[#111827] to-[#111827]'
                  : 'border-slate-800'
              }`}
            >
              <div>
                {/* Top ID & Status Badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-cyan-400 font-bold text-xs">{del.id}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Req: {del.requestId}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded ${
                        isDelivered
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : isInTransit
                          ? 'bg-purple-950 text-purple-300 border border-purple-800 animate-pulse'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}
                    >
                      {del.status}
                    </span>

                    {(role === 'ADMINISTRATOR' || role === 'VOLUNTEER') && (
                      <button
                        onClick={() => {
                          setSelectedDel(del);
                          setNewStatus(del.status);
                          setStatusNotes(del.statusNotes || '');
                        }}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                        title="Update Delivery Status"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white mt-1 flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="truncate">{del.destinationName}</span>
                </h3>

                {/* Progress Step Indicator */}
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-1.5 text-[10px] font-mono text-slate-400">
                    <span>Approved</span>
                    <span>Dispatched</span>
                    <span>In Transit</span>
                    <span>Delivered</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {['APPROVED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED'].map((step, idx) => {
                      const isComplete = currentIdx >= STATUS_ORDER.indexOf(step);
                      return (
                        <div
                          key={step}
                          className={`h-1.5 rounded-full ${
                            isComplete
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
                              : 'bg-slate-800'
                          }`}
                        ></div>
                      );
                    })}
                  </div>
                </div>

                {/* Cargo breakdown */}
                <div className="mt-4 p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1.5 uppercase font-bold">
                    <span>Loaded Consignment Cargo</span>
                    <span className="text-slate-300">
                      Vehicle: <strong className="text-white">{veh?.vehicleNumber || 'UK-07-TR'}</strong>
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-slate-300">
                    <div>Food: <strong className="text-white">{del.cargo.foodPackets}</strong></div>
                    <div>Water: <strong className="text-cyan-400">{del.cargo.waterLitres}L</strong></div>
                    <div>Med: <strong className="text-rose-400">{del.cargo.medicalKits}</strong></div>
                    <div>Shelter: <strong className="text-emerald-400">{del.cargo.shelterKits}</strong></div>
                  </div>
                </div>

                {/* Status notes */}
                {del.statusNotes && (
                  <p className="text-xs text-slate-300 mt-3 p-2 rounded-lg bg-slate-900/50 border border-slate-800/60 leading-relaxed italic">
                    "{del.statusNotes}"
                  </p>
                )}
              </div>

              {/* Transit Distance & Duration */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <div className="flex items-center space-x-1">
                  <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Distance: <strong className="text-white">{del.estimatedDistanceKm} km</strong></span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Est. Time: <strong className="text-white">{del.estimatedDurationMin} min</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Update Modal */}
      {selectedDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedDel(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-2">Update Delivery Status</h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">
              Delivery ID: {selectedDel.id} ({selectedDel.destinationName})
            </p>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">New Delivery Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="APPROVED">APPROVED (Awaiting Departure)</option>
                  <option value="DISPATCHED">DISPATCHED (Departed Depot)</option>
                  <option value="IN_TRANSIT">IN TRANSIT (En Route)</option>
                  <option value="DELIVERED">DELIVERED (Handover Confirmed)</option>
                  <option value="FAILED">FAILED (Route Impassable)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Field Update Notes</label>
                <textarea
                  rows={3}
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="e.g. Cleared Devprayag waypoint; convoy continuing along valley route."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedDel(null)}
                  className="px-3.5 py-1.5 bg-slate-800 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
