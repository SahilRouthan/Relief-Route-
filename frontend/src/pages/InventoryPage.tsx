// =============================================================================
// RELIEFROUTE: Inventory & Supply Chain Management Module
// =============================================================================

import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ReliefCentre } from '../types';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  Boxes,
  Plus,
  AlertTriangle,
  Package,
  Droplets,
  Activity,
  History,
  Building2,
  TrendingDown,
  TrendingUp,
  X,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const { role } = useAuth();
  const { showToast } = useToast();
  const [centres, setCentres] = useState<ReliefCentre[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Replenish Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replenishCentreId, setReplenishCentreId] = useState('');
  const [replenishForm, setReplenishForm] = useState({
    foodPackets: 1000,
    waterLitres: 2000,
    medicalKits: 200,
    shelterKits: 50,
    reason: 'SDRF Central Humanitarian Aid Convoy Deposit'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [centreRes, histRes] = await Promise.all([api.getReliefCentres(), api.getInventoryHistory()]);
      setCentres(centreRes);
      setHistory(histRes);
      if (centreRes.length > 0 && !replenishCentreId) {
        setReplenishCentreId(centreRes[0].id);
      }
    } catch (err: any) {
      showToast('error', 'Inventory Loading Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReplenishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replenishCentreId) {
      showToast('warning', 'Centre Required', 'Please select a relief centre to replenish.');
      return;
    }

    try {
      const res = await api.replenishInventory(replenishCentreId, replenishForm, replenishForm.reason);
      showToast('success', 'Supplies Deposited', `Successfully replenished inventory at ${res.centre.name}`);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast('error', 'Replenishment Failed', err.message);
    }
  };

  // Aggregated totals
  const totalStock = centres.reduce(
    (acc, c) => ({
      food: acc.food + (c.inventory.foodPackets || 0),
      water: acc.water + (c.inventory.waterLitres || 0),
      medical: acc.medical + (c.inventory.medicalKits || 0),
      shelter: acc.shelter + (c.inventory.shelterKits || 0)
    }),
    { food: 0, water: 0, medical: 0, shelter: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <Boxes className="w-4 h-4 text-cyan-400" />
            <span>STATE DISASTER SUPPLY CHAIN MANAGEMENT</span>
          </div>
          <h1 className="text-2xl font-black text-white">Relief Depot Inventory</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor real-time humanitarian supply stockpiles, audit transactions, and manage incoming consignments.
          </p>
        </div>

        {role === 'ADMINISTRATOR' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Record Consignment / Restock</span>
          </button>
        )}
      </div>

      {/* 4 Macro Stock Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Food Packets (Total)</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white font-mono">{totalStock.food.toLocaleString()}</span>
            <span className="text-[11px] text-slate-400">rations</span>
          </div>
          <p className="text-[10px] text-emerald-400 mt-1 font-mono">● 5 Regional Warehouses</p>
        </div>

        <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Potable Water (Total)</span>
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-cyan-400 font-mono">{totalStock.water.toLocaleString()}</span>
            <span className="text-[11px] text-slate-400">litres</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">Purified bottled tankers</p>
        </div>

        <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Medical / Trauma Kits</span>
            <Activity className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-rose-400 font-mono">{totalStock.medical.toLocaleString()}</span>
            <span className="text-[11px] text-slate-400">kits</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">First-aid, IV, burn dressings</p>
        </div>

        <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Emergency Shelter Tents</span>
            <Boxes className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-emerald-400 font-mono">{totalStock.shelter.toLocaleString()}</span>
            <span className="text-[11px] text-slate-400">tents</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">Weatherproof family units</p>
        </div>
      </div>

      {/* Per-Centre Inventory Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>Relief Centre Stockpile Ledger</span>
          </h3>
          <span className="text-xs font-mono text-emerald-400 flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Atomic Non-Negative Constraint Enforced</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Centre Name & Code</th>
                <th className="py-3 px-4">Food Packets</th>
                <th className="py-3 px-4">Drinking Water</th>
                <th className="py-3 px-4">Medical Kits</th>
                <th className="py-3 px-4">Shelter Kits</th>
                <th className="py-3 px-4">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {centres.map((c) => {
                const inv = c.inventory;
                const isWaterLow = inv.waterLitres < 4000;
                const isMedLow = inv.medicalKits < 600;

                return (
                  <tr key={c.id} className="hover:bg-slate-850 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-xs">{c.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {c.code} • {c.locationName}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-200">
                      {inv.foodPackets.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                      {inv.waterLitres.toLocaleString()} L
                      {isWaterLow && (
                        <span className="ml-2 text-[10px] text-amber-400 font-sans font-semibold">⚠️ Low</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-rose-300">
                      {inv.medicalKits.toLocaleString()}
                      {isMedLow && (
                        <span className="ml-2 text-[10px] text-rose-400 font-sans font-semibold">⚠️ Critical</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      {inv.shelterKits.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Audit History Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center space-x-2">
            <History className="w-4 h-4 text-cyan-400" />
            <span>Inventory Transaction Audit Trail</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Timestamped Stock Adjustments</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Tx ID</th>
                <th className="py-3 px-4">Centre</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Quantity Delta</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
              {history.map((h) => {
                const isDeduction = h.action === 'DEDUCTION';

                return (
                  <tr key={h.id} className="hover:bg-slate-850 transition">
                    <td className="py-3 px-4 text-slate-400 font-mono">{h.id.slice(0, 14)}...</td>
                    <td className="py-3 px-4 text-slate-200">{h.centreName}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          isDeduction
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {h.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      Food: {h.delta.foodPackets > 0 ? `+${h.delta.foodPackets}` : h.delta.foodPackets} | Water:{' '}
                      {h.delta.waterLitres > 0 ? `+${h.delta.waterLitres}` : h.delta.waterLitres}L
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-sans">{h.reason}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Replenish Consignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-4">Record Inbound Supply Consignment</h3>

            <form onSubmit={handleReplenishSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Relief Centre *</label>
                <select
                  value={replenishCentreId}
                  onChange={(e) => setReplenishCentreId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  {centres.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Food Packets</label>
                  <input
                    type="number"
                    value={replenishForm.foodPackets}
                    onChange={(e) => setReplenishForm({ ...replenishForm, foodPackets: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Drinking Water (Litres)</label>
                  <input
                    type="number"
                    value={replenishForm.waterLitres}
                    onChange={(e) => setReplenishForm({ ...replenishForm, waterLitres: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Medical Trauma Kits</label>
                  <input
                    type="number"
                    value={replenishForm.medicalKits}
                    onChange={(e) => setReplenishForm({ ...replenishForm, medicalKits: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Shelter Kits</label>
                  <input
                    type="number"
                    value={replenishForm.shelterKits}
                    onChange={(e) => setReplenishForm({ ...replenishForm, shelterKits: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Consignment Source / Reason</label>
                <input
                  type="text"
                  value={replenishForm.reason}
                  onChange={(e) => setReplenishForm({ ...replenishForm, reason: e.target.value })}
                  placeholder="e.g. State Disaster Response Fund consignment #8902"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-800 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-md"
                >
                  Confirm Restock Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
