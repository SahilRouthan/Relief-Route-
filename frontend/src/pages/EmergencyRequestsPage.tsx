// =============================================================================
// RELIEFROUTE: Emergency Request Reporting & Verification Triage Module
// =============================================================================

import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { EmergencyRequest, SeverityLevel, MedicalUrgency, AccessibilityDifficulty, Disaster } from '../types';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  LifeBuoy,
  Plus,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  Search,
  MapPin,
  Users,
  Activity,
  Package,
  Droplets,
  AlertTriangle,
  X,
  Sparkles,
  Cpu
} from 'lucide-react';

export const EmergencyRequestsPage: React.FC = () => {
  const { user, role } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [inspectRequest, setInspectRequest] = useState<EmergencyRequest | null>(null);
  const [rejectDialogReq, setRejectDialogReq] = useState<EmergencyRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Form Data for Citizen Reporting
  const [reportForm, setReportForm] = useState({
    disasterId: 'dis-01',
    reporterName: user?.name || 'Citizen Reporter',
    reporterContact: user?.phone || '+91-94120-11223',
    affectedLocation: '',
    latitude: 30.3842,
    longitude: 79.3174,
    affectedPopulation: 120,
    severityLevel: 'HIGH' as SeverityLevel,
    medicalUrgency: 'HIGH' as MedicalUrgency,
    accessibilityDifficulty: 'HARD' as AccessibilityDifficulty,
    foodNeeded: 300,
    waterNeeded: 600,
    medicinesNeeded: 50,
    shelterNeeded: 25,
    description: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, disRes] = await Promise.all([api.getRequests(), api.getDisasters()]);
      setRequests(reqRes);
      setDisasters(disRes);
    } catch (err: any) {
      showToast('error', 'Error fetching requests', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.affectedLocation) {
      showToast('warning', 'Missing Details', 'Please specify the affected village or location name.');
      return;
    }

    try {
      const created = await api.createRequest(reportForm);
      showToast('success', 'Emergency Request Submitted', `Generated Request ID: ${created.id}. AI assigned initial priority: ${created.priorityCategory} (${created.priorityScore}/100)`);
      setIsSubmitModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast('error', 'Submission Failed', err.message);
    }
  };

  const handleVerify = async (req: EmergencyRequest) => {
    try {
      const res = await api.verifyRequest(req.id, user?.name || 'Authorized Officer');
      showToast('success', 'Request Verified', `Verified ${req.id} (${req.affectedLocation})`);
      fetchData();
    } catch (err: any) {
      showToast('error', 'Verification Failed', err.message);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectDialogReq) return;
    if (!rejectionReason.trim()) {
      showToast('warning', 'Rejection Reason Required', 'Please provide an official audit reason for rejecting this emergency request.');
      return;
    }

    try {
      await api.rejectRequest(rejectDialogReq.id, rejectionReason, user?.name || 'Authorized Officer');
      showToast('info', 'Request Rejected', `Flagged ${rejectDialogReq.id} as Rejected`);
      setRejectDialogReq(null);
      setRejectionReason('');
      fetchData();
    } catch (err: any) {
      showToast('error', 'Rejection Failed', err.message);
    }
  };

  // Filtered requests
  const filtered = requests.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.affectedLocation.toLowerCase().includes(search.toLowerCase()) ||
      r.reporterName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter || r.verificationStatus === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || r.priorityCategory === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TRIAGE & VERIFICATION QUEUE</span>
          </div>
          <h1 className="text-2xl font-black text-white">Emergency Assistance Requests</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Collect citizen disaster distress reports, execute multi-indicator priority assessment, and manage verification triage.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Emergency Report</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[#111827] p-3 rounded-xl border border-slate-800">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search request ID, location, or reporter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 text-white rounded-lg border border-slate-700 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Priority:</span>
          </div>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2 py-1 text-xs font-medium rounded-lg transition ${
                priorityFilter === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}

          <span className="text-slate-700">|</span>

          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <span>Status:</span>
          </div>
          {['ALL', 'PENDING', 'VERIFIED', 'ALLOCATED', 'DELIVERED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2 py-1 text-xs font-medium rounded-lg transition ${
                statusFilter === st
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Location & Incident</th>
                <th className="py-3 px-4">Urgency & Severity</th>
                <th className="py-3 px-4">Demanded Resources</th>
                <th className="py-3 px-4">AI Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((req) => {
                const isPending = req.verificationStatus === 'PENDING';
                const isVerified = req.verificationStatus === 'VERIFIED';
                const isRejected = req.verificationStatus === 'REJECTED';

                return (
                  <tr key={req.id} className="hover:bg-slate-850 transition">
                    {/* ID & Reporter */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-cyan-400">{req.id}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{req.reporterName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{req.reporterContact}</div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center space-x-1.5 font-semibold text-white">
                        <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                        <span className="truncate">{req.affectedLocation}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1">
                        <span>👥 {req.affectedPopulation} affected</span>
                        <span>•</span>
                        <span>Access: {req.accessibilityDifficulty}</span>
                      </div>
                    </td>

                    {/* Urgency */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            req.priorityCategory === 'CRITICAL'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : req.priorityCategory === 'HIGH'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-yellow-950 text-yellow-300 border border-yellow-800'
                          }`}
                        >
                          {req.priorityCategory}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          Med Urgency: <strong className={req.medicalUrgency === 'CRITICAL' ? 'text-rose-400' : 'text-slate-300'}>{req.medicalUrgency}</strong>
                        </div>
                      </div>
                    </td>

                    {/* Resources Demanded */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                        <span>Food: <strong>{req.foodNeeded}</strong></span>
                        <span>Water: <strong>{req.waterNeeded}L</strong></span>
                        <span>Med: <strong>{req.medicinesNeeded}</strong></span>
                        <span>Shelter: <strong>{req.shelterNeeded}</strong></span>
                      </div>
                    </td>

                    {/* AI Score */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5">
                        <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-mono font-bold text-sm text-white">{req.priorityScore}</span>
                        <span className="text-[10px] text-slate-500 font-mono">/100</span>
                      </div>
                      <div className="w-20 bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            req.priorityScore >= 80 ? 'bg-rose-500' : req.priorityScore >= 60 ? 'bg-amber-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${req.priorityScore}%` }}
                        ></div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          isVerified
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : isPending
                            ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                            : isRejected
                            ? 'bg-slate-800 text-rose-400 border border-rose-900'
                            : 'bg-blue-950 text-blue-300 border border-blue-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setInspectRequest(req)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                          title="View Details & AI Factors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {(role === 'ADMINISTRATOR' || role === 'VOLUNTEER') && isPending && (
                          <>
                            <button
                              onClick={() => handleVerify(req)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-semibold flex items-center space-x-1 transition shadow-sm"
                              title="Verify Request"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verify</span>
                            </button>
                            <button
                              onClick={() => {
                                setRejectDialogReq(req);
                                setRejectionReason('');
                              }}
                              className="px-2 py-1 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg text-[11px] font-semibold flex items-center space-x-1 transition shadow-sm"
                              title="Reject with Reason"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit Emergency Request Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsSubmitModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs mb-1">
              <LifeBuoy className="w-4 h-4" />
              <span>CITIZEN EMERGENCY REPORTING PORTAL</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-4">Submit Disaster Relief Request</h3>

            <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Reporter Name *</label>
                  <input
                    type="text"
                    required
                    value={reportForm.reporterName}
                    onChange={(e) => setReportForm({ ...reportForm, reporterName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={reportForm.reporterContact}
                    onChange={(e) => setReportForm({ ...reportForm, reporterContact: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Linked Disaster Incident</label>
                <select
                  value={reportForm.disasterId}
                  onChange={(e) => setReportForm({ ...reportForm, disasterId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  {disasters.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title} ({d.locationName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Affected Location / Village *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Joshimath Upper Ward 3, Chamoli"
                  value={reportForm.affectedLocation}
                  onChange={(e) => setReportForm({ ...reportForm, affectedLocation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Latitude Coordinate</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={reportForm.latitude}
                    onChange={(e) => setReportForm({ ...reportForm, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Longitude Coordinate</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={reportForm.longitude}
                    onChange={(e) => setReportForm({ ...reportForm, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Affected People</label>
                  <input
                    type="number"
                    value={reportForm.affectedPopulation}
                    onChange={(e) => setReportForm({ ...reportForm, affectedPopulation: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Medical Urgency</label>
                  <select
                    value={reportForm.medicalUrgency}
                    onChange={(e) => setReportForm({ ...reportForm, medicalUrgency: e.target.value as MedicalUrgency })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MODERATE">MODERATE</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Accessibility</label>
                  <select
                    value={reportForm.accessibilityDifficulty}
                    onChange={(e) => setReportForm({ ...reportForm, accessibilityDifficulty: e.target.value as AccessibilityDifficulty })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="EXTREME">EXTREME</option>
                    <option value="HARD">HARD</option>
                    <option value="MODERATE">MODERATE</option>
                    <option value="EASY">EASY</option>
                  </select>
                </div>
              </div>

              {/* Resource Requirements */}
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-2 font-bold">
                  Estimated Supply Requirements
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400">Food Packs</label>
                    <input
                      type="number"
                      value={reportForm.foodNeeded}
                      onChange={(e) => setReportForm({ ...reportForm, foodNeeded: parseInt(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Water (L)</label>
                    <input
                      type="number"
                      value={reportForm.waterNeeded}
                      onChange={(e) => setReportForm({ ...reportForm, waterNeeded: parseInt(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Med Kits</label>
                    <input
                      type="number"
                      value={reportForm.medicinesNeeded}
                      onChange={(e) => setReportForm({ ...reportForm, medicinesNeeded: parseInt(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Shelter Kits</label>
                    <input
                      type="number"
                      value={reportForm.shelterNeeded}
                      onChange={(e) => setReportForm({ ...reportForm, shelterNeeded: parseInt(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Ground Situation Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe road blockage, trapped casualties, structural damages..."
                  value={reportForm.description}
                  onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md"
                >
                  Submit Emergency Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Request Modal */}
      {inspectRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setInspectRequest(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 mb-2">
              <span className="font-mono text-cyan-400 font-bold text-sm">{inspectRequest.id}</span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  inspectRequest.priorityCategory === 'CRITICAL'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}
              >
                {inspectRequest.priorityCategory} ({inspectRequest.priorityScore}/100)
              </span>
            </div>

            <h3 className="text-base font-bold text-white">{inspectRequest.affectedLocation}</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800">
              {inspectRequest.description}
            </p>

            {inspectRequest.scoringFactors && (
              <div className="mt-4 p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                <h4 className="text-[11px] font-mono text-cyan-400 font-bold mb-2 uppercase">
                  AI Weighted Scoring Factor Breakdown
                </h4>
                <div className="space-y-1.5 text-xs">
                  {Object.entries(inspectRequest.scoringFactors).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between text-slate-300">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="font-mono font-bold text-white">{(val as any)} / 100</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectRequest(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Request Dialog */}
      {rejectDialogReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-rose-900/60 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-sm font-bold text-rose-400 mb-2">Reject Emergency Request</h3>
            <p className="text-xs text-slate-300 mb-3">
              Provide an official reason for rejecting {rejectDialogReq.id} ({rejectDialogReq.affectedLocation}).
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Field inspection confirmed location was commercial storage; zero trapped victims."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setRejectDialogReq(null)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg text-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
