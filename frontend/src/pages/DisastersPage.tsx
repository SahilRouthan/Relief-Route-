// =============================================================================
// RELIEFROUTE: Disaster Incident Management Module
// =============================================================================

import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Disaster, DisasterType, SeverityLevel, DisasterStatus, EmergencyRequest } from '../types';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  AlertOctagon,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Users,
  Clock,
  Sparkles,
  LifeBuoy,
  X,
  Search,
  CheckCircle2
} from 'lucide-react';

const DISASTER_TYPES: DisasterType[] = ['Flood', 'Earthquake', 'Landslide', 'Cyclone', 'Forest Fire'];
const SEVERITIES: SeverityLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const STATUSES: DisasterStatus[] = ['ACTIVE', 'CONTAINED', 'RESOLVED', 'MONITORING'];

export const DisastersPage: React.FC = () => {
  const { role } = useAuth();
  const { showToast } = useToast();
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDisaster, setEditingDisaster] = useState<Disaster | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    disasterType: 'Flood' as DisasterType,
    severity: 'HIGH' as SeverityLevel,
    status: 'ACTIVE' as DisasterStatus,
    locationName: '',
    latitude: 30.3165,
    longitude: 78.0322,
    affectedPopulation: 2500,
    estimatedDamageInr: 25000000,
    description: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [disRes, reqRes] = await Promise.all([api.getDisasters(), api.getRequests()]);
      setDisasters(disRes);
      setRequests(reqRes);
    } catch (err: any) {
      showToast('error', 'Failed to load disasters', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingDisaster(null);
    setFormData({
      title: '',
      disasterType: 'Flood',
      severity: 'HIGH',
      status: 'ACTIVE',
      locationName: '',
      latitude: 30.3165,
      longitude: 78.0322,
      affectedPopulation: 2500,
      estimatedDamageInr: 25000000,
      description: 'SIMULATED: Incident scenario in Uttarakhand.'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (d: Disaster) => {
    setEditingDisaster(d);
    setFormData({
      title: d.title,
      disasterType: d.disasterType,
      severity: d.severity,
      status: d.status,
      locationName: d.locationName,
      latitude: d.latitude,
      longitude: d.longitude,
      affectedPopulation: d.affectedPopulation,
      estimatedDamageInr: d.estimatedDamageInr,
      description: d.description
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.locationName) {
      showToast('warning', 'Validation Error', 'Title and location are required.');
      return;
    }

    try {
      if (editingDisaster) {
        await api.updateDisaster(editingDisaster.id, formData);
        showToast('success', 'Incident Updated', `Updated ${formData.title}`);
      } else {
        await api.createDisaster(formData);
        showToast('success', 'Incident Created', `Recorded new incident: ${formData.title}`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast('error', 'Operation Failed', err.message);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete disaster record "${title}"?`)) return;
    try {
      await api.deleteDisaster(id);
      showToast('info', 'Incident Removed', `Deleted ${title}`);
      fetchData();
    } catch (err: any) {
      showToast('error', 'Delete Failed', err.message);
    }
  };

  const filteredDisasters = disasters.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.locationName.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'ALL' || d.disasterType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>UTTARAKHAND INCIDENT MANAGEMENT MODULE</span>
          </div>
          <h1 className="text-2xl font-black text-white">Disaster Incidents & Hazards</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Create, track, and monitor natural hazard incidents across Garhwal and Kumaon valleys.
          </p>
        </div>

        {role === 'ADMINISTRATOR' && (
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Declare New Incident</span>
          </button>
        )}
      </div>

      {/* Notice Banner */}
      <div className="bg-amber-950/30 border border-amber-800/60 p-3 rounded-xl flex items-center justify-between text-xs text-amber-200">
        <div className="flex items-center space-x-2">
          <span className="font-mono font-bold bg-amber-900/80 px-2 py-0.5 rounded text-[10px] text-amber-300">
            DEMO / SIMULATED
          </span>
          <span>All disaster event scenarios, flood gauges, and landslide coordinates represent simulated training models.</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111827] p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search incident name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 text-white rounded-lg border border-slate-700 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 whitespace-nowrap">Filter Type:</span>
          {['ALL', ...DISASTER_TYPES].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
                filterType === t
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Disasters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDisasters.map((d) => {
          const associatedReqs = requests.filter((r) => r.disasterId === d.id);
          const isCritical = d.severity === 'CRITICAL';

          return (
            <div
              key={d.id}
              className={`bg-[#111827] border rounded-2xl p-5 shadow-xl transition hover:border-slate-700 flex flex-col justify-between ${
                isCritical ? 'border-rose-900/60 bg-gradient-to-br from-rose-950/20 via-[#111827] to-[#111827]' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        d.severity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : d.severity === 'HIGH'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-yellow-950 text-yellow-300 border border-yellow-800'
                      }`}
                    >
                      {d.severity}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {d.disasterType}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {d.status}
                    </span>
                  </div>

                  {role === 'ADMINISTRATOR' && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEditModal(d)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                        title="Edit Incident"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(d.id, d.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                        title="Delete Incident"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">{d.title}</h3>

                <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span className="truncate">{d.locationName}</span>
                </div>

                <p className="text-xs text-slate-300 mt-2.5 leading-relaxed line-clamp-2">{d.description}</p>

                <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Affected Population</span>
                    <p className="font-bold text-white mt-0.5">👥 {d.affectedPopulation.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Estimated Loss</span>
                    <p className="font-bold text-amber-400 mt-0.5">₹{(d.estimatedDamageInr / 10000000).toFixed(1)} Cr</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-1 text-[11px] font-mono">
                  <LifeBuoy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{associatedReqs.length} Associated Requests</span>
                </div>
                <div className="flex items-center space-x-1 text-[10px] font-mono text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(d.startedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Incident Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-4">
              {editingDisaster ? 'Edit Disaster Incident' : 'Declare New Disaster Incident'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Incident Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Alaknanda River Flash Flood Surge"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Type</label>
                  <select
                    value={formData.disasterType}
                    onChange={(e) => setFormData({ ...formData, disasterType: e.target.value as DisasterType })}
                    className="w-full px-2 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    {DISASTER_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as SeverityLevel })}
                    className="w-full px-2 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    {SEVERITIES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as DisasterStatus })}
                    className="w-full px-2 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Affected Location *</label>
                <input
                  type="text"
                  required
                  value={formData.locationName}
                  onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                  placeholder="e.g. Upper Helang & Joshimath Slopes"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Population Affected</label>
                  <input
                    type="number"
                    value={formData.affectedPopulation}
                    onChange={(e) => setFormData({ ...formData, affectedPopulation: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Estimated Damage (INR)</label>
                  <input
                    type="number"
                    value={formData.estimatedDamageInr}
                    onChange={(e) => setFormData({ ...formData, estimatedDamageInr: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md"
                >
                  {editingDisaster ? 'Save Changes' : 'Confirm & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
