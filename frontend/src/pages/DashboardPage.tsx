// =============================================================================
// RELIEFROUTE: Overview Command Dashboard
// =============================================================================

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { AnalyticsSummary, EmergencyRequest, ReliefCentre, RoadCondition } from '../types';
import { DisasterMapComponent } from '../components/map/DisasterMapComponent';
import {
  AlertTriangle,
  LifeBuoy,
  Building2,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Boxes,
  MapPin,
  RefreshCw,
  Cpu
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

const SEVERITY_COLORS = {
  CRITICAL: '#EF4444',
  HIGH: '#F97316',
  MEDIUM: '#EAB308',
  LOW: '#10B981'
};

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [centres, setCentres] = useState<ReliefCentre[]>([]);
  const [roads, setRoads] = useState<RoadCondition[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, requestsRes, centresRes, roadsRes] = await Promise.all([
        api.getAnalyticsSummary(),
        api.getRequests(),
        api.getReliefCentres(),
        api.getRoadConditions()
      ]);
      setData(analyticsRes);
      setRequests(requestsRes);
      setCentres(centresRes);
      setRoads(roadsRes);
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-slate-400 font-mono text-sm">Initializing Uttarakhand Command Feed...</p>
      </div>
    );
  }

  const { metrics, priorityBreakdown, totalInventory, totalDemands, activityFeed } = data;

  // Chart data
  const priorityChartData = [
    { name: 'Critical', value: priorityBreakdown.CRITICAL, color: SEVERITY_COLORS.CRITICAL },
    { name: 'High', value: priorityBreakdown.HIGH, color: SEVERITY_COLORS.HIGH },
    { name: 'Medium', value: priorityBreakdown.MEDIUM, color: SEVERITY_COLORS.MEDIUM },
    { name: 'Low', value: priorityBreakdown.LOW, color: SEVERITY_COLORS.LOW }
  ];

  const resourceChartData = [
    { category: 'Food Packets', demand: totalDemands.food, available: totalInventory.food },
    { category: 'Water (Litres)', demand: totalDemands.water, available: totalInventory.water },
    { category: 'Medical Kits', demand: totalDemands.medicines, available: totalInventory.medicines },
    { category: 'Shelter Kits', demand: totalDemands.shelter, available: totalInventory.shelter }
  ];

  // Requests hourly trend mockup
  const trendChartData = [
    { time: '00:00', reports: 1 },
    { time: '04:00', reports: 3 },
    { time: '08:00', reports: 6 },
    { time: '12:00', reports: 12 },
    { time: '16:00', reports: 15 },
    { time: '20:00', reports: 18 }
  ];

  const totalAvailStock = totalInventory.food + totalInventory.water + totalInventory.medicines + totalInventory.shelter;
  const criticalRequestsList = requests.filter((r) => r.priorityCategory === 'CRITICAL');

  return (
    <div className="space-y-6">
      {/* Top Banner with Alert Headline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-slate-900 border border-blue-500/30 p-5 rounded-2xl shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>UTTARAKHAND STATE DISASTER RESPONSE PLATFORM</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Emergency Command & Allocation Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            Live AI-assisted situational awareness, multi-criteria priority assessment, and fairness-constrained logistics dispatch.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/allocation"
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5"
          >
            <Cpu className="w-4 h-4" />
            <span>Run Allocation Engine</span>
          </Link>
          <Link
            to="/requests"
            className="flex items-center space-x-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
          >
            <span>Triage Queue ({metrics.pendingVerification})</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* 8 Statistics Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
        {/* Disasters */}
        <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl shadow-md hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Disaster Incidents</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{metrics.totalDisasters}</span>
            <span className="text-[11px] text-rose-400 font-mono">({metrics.activeDisasters} Active)</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Garhwal & Kumaon divisions</p>
        </div>

        {/* Total Requests */}
        <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl shadow-md hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Emergency Requests</span>
            <LifeBuoy className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{metrics.totalRequests}</span>
            <span className="text-[11px] text-cyan-400 font-mono">Reports</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">18 verified/pending reports</p>
        </div>

        {/* Pending Verification */}
        <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl shadow-md hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Pending Verification</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-amber-400">{metrics.pendingVerification}</span>
            <span className="text-[11px] text-slate-400">Needs Review</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Field volunteer triage queue</p>
        </div>

        {/* Critical Priority */}
        <div className="bg-[#111827] border border-rose-900/50 p-4 rounded-xl shadow-md bg-gradient-to-b from-rose-950/20 to-transparent">
          <div className="flex items-center justify-between text-rose-300 mb-2">
            <span className="text-xs font-medium">Critical Priority</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-rose-400">{metrics.criticalRequests}</span>
            <span className="text-[11px] text-rose-300 font-mono">URGENT</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">High mortality / isolation risk</p>
        </div>

        {/* Available Resources */}
        <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl shadow-md hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Relief Stock Available</span>
            <Boxes className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-emerald-400">{totalAvailStock.toLocaleString()}</span>
            <span className="text-[11px] text-slate-400 font-mono">units</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Across 5 regional depots</p>
        </div>

        {/* Active Relief Centres */}
        <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl shadow-md hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Relief Centres</span>
            <Building2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{metrics.activeReliefCentres}</span>
            <span className="text-[11px] text-emerald-400 font-mono">Operational</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Dehradun, Rishikesh, Joshimath</p>
        </div>

        {/* Deployed Vehicles */}
        <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl shadow-md hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Fleet</span>
            <Truck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-purple-400">{metrics.activeVehicles}</span>
            <span className="text-[11px] text-slate-400">Vehicles</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Trucks, 4x4s, Drones</p>
        </div>

        {/* Successful Deliveries */}
        <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl shadow-md hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Deliveries Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-emerald-400">{metrics.successfulDeliveries}</span>
            <span className="text-[11px] text-slate-400 font-mono">Confirmed</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Direct field handovers</p>
        </div>
      </div>

      {/* Main Interactive Map Preview */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-sm text-white">Live Uttarakhand Geospatial Disaster Map</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
              OpenStreetMap + OSRM
            </span>
          </div>
          <Link
            to="/map"
            className="text-xs text-blue-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
          >
            <span>Full GIS Command Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <DisasterMapComponent
          requests={requests}
          centres={centres}
          roads={roads}
          height="420px"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Disaster Severity Breakdown (Pie Chart) */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white">Priority Severity Breakdown</h3>
            <span className="text-[11px] text-slate-400 font-mono">AI Composite</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#2A364F', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-800/80 text-xs font-mono">
            {priorityChartData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-400">{item.name}:</span>
                <strong className="text-white">{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Demand vs Inventory Availability (Bar Chart) */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white">Demand vs Available Reserves</h3>
            <span className="text-[11px] text-slate-400 font-mono">State Quota</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resourceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="category" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#2A364F', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="demand" fill="#EF4444" name="Demand" radius={[4, 4, 0, 0]} />
                <Bar dataKey="available" fill="#10B981" name="Available" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center space-x-6 mt-2 pt-3 border-t border-slate-800/80 text-xs font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 bg-rose-500 rounded-sm"></span>
              <span className="text-slate-300">Total Demanded</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 bg-emerald-500 rounded-sm"></span>
              <span className="text-slate-300">Depot Stock</span>
            </div>
          </div>
        </div>

        {/* Emergency Requests Timeline Surge (Area Chart) */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white">Report Influx Timeline</h3>
            <span className="text-[11px] text-cyan-400 font-mono">Cumulative</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#2A364F', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="reports" stroke="#06B6D4" fillOpacity={1} fill="url(#colorReports)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400">Peak Surge Rate</span>
            <span className="font-mono text-emerald-400 font-bold">+4 reports / hr</span>
          </div>
        </div>
      </div>

      {/* Critical Alerts & Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Alerts Panel */}
        <div className="bg-[#111827] border border-rose-900/40 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <h3 className="font-bold text-sm text-white">Active Critical Emergency Alerts</h3>
            </div>
            <span className="text-xs font-mono text-rose-400">{criticalRequestsList.length} Immediate Targets</span>
          </div>

          <div className="space-y-3">
            {criticalRequestsList.slice(0, 4).map((cr) => (
              <div
                key={cr.id}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3 hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                      {cr.id}
                    </span>
                    <span className="text-xs font-semibold text-white">{cr.affectedLocation}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-snug line-clamp-1">{cr.description}</p>
                  <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-400 mt-1.5">
                    <span>👥 {cr.affectedPopulation} affected</span>
                    <span>🏥 Med: {cr.medicalUrgency}</span>
                    <span className="text-cyan-400 font-bold">Priority: {cr.priorityScore}/100</span>
                  </div>
                </div>

                <Link
                  to="/priority"
                  className="px-2.5 py-1 text-[11px] font-semibold text-blue-400 hover:text-white bg-blue-950/60 hover:bg-blue-600 rounded-lg border border-blue-800/80 transition flex-shrink-0"
                >
                  Inspect →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Live Operational Activity Log */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">Live Operational Activity Log</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Audit Stream</span>
          </div>

          <div className="space-y-3">
            {activityFeed.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-start space-x-3 text-xs border-b border-slate-800/60 pb-2.5 last:border-0">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-200">{log.userName}</strong>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
