// =============================================================================
// RELIEFROUTE: Frontend API Client
// Connects to Express backend on /api (proxied via Vite on port 5173)
// =============================================================================

import {
  Disaster,
  EmergencyRequest,
  ReliefCentre,
  Vehicle,
  RoadCondition,
  Delivery,
  AllocationComparison,
  AnalyticsSummary,
  User
} from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    let errMsg = `API error ${response.status}: ${response.statusText}`;
    try {
      const errObj = await response.json();
      if (errObj.error) errMsg = errObj.error;
    } catch {}
    throw new Error(errMsg);
  }
  return response.json();
}

export const api = {
  // Auth & Users
  login: (role?: string, email?: string) =>
    request<{ success: boolean; user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ role, email })
    }),
  getUsers: () => request<User[]>('/auth/users'),

  // Disasters
  getDisasters: () => request<Disaster[]>('/disasters'),
  createDisaster: (data: Partial<Disaster>) =>
    request<Disaster>('/disasters', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateDisaster: (id: string, data: Partial<Disaster>) =>
    request<Disaster>(`/disasters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteDisaster: (id: string) =>
    request<{ success: boolean }>(`/disasters/${id}`, { method: 'DELETE' }),

  // Emergency Requests
  getRequests: (params?: { status?: string; priority?: string; disasterId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<EmergencyRequest[]>(`/requests${query ? `?${query}` : ''}`);
  },
  getRequestById: (id: string) => request<EmergencyRequest>(`/requests/${id}`),
  createRequest: (data: Partial<EmergencyRequest>) =>
    request<EmergencyRequest>('/requests', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  verifyRequest: (id: string, verifiedBy?: string) =>
    request<{ success: boolean; request: EmergencyRequest }>(`/requests/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ verifiedBy })
    }),
  rejectRequest: (id: string, reason: string, rejectedBy?: string) =>
    request<{ success: boolean; request: EmergencyRequest }>(`/requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason, rejectedBy })
    }),

  // Priority Assessment & ML
  assessPriority: (id: string) => request<any>(`/priority/assess/${id}`),
  getMlEvaluation: (id: string) => request<any>(`/priority/models-evaluation/${id}`),

  // Relief Centres & Inventory
  getReliefCentres: () => request<ReliefCentre[]>('/relief-centres'),
  replenishInventory: (centreId: string, quantities: any, reason?: string) =>
    request<any>('/inventory/replenish', {
      method: 'POST',
      body: JSON.stringify({ centreId, quantities, reason })
    }),
  getInventoryHistory: () => request<any[]>('/inventory/history'),

  // Vehicles
  getVehicles: () => request<Vehicle[]>('/vehicles'),

  // Allocation Engine
  calculateAllocation: () => request<AllocationComparison>('/allocation/calculate', { method: 'POST' }),
  approveAllocation: (items: any[], approvedBy?: string) =>
    request<{ success: boolean; message: string; deliveriesCount: number; deliveries: Delivery[] }>(
      '/allocation/approve',
      {
        method: 'POST',
        body: JSON.stringify({ items, approvedBy })
      }
    ),

  // Deliveries
  getDeliveries: () => request<Delivery[]>('/deliveries'),
  updateDeliveryStatus: (id: string, status: string, notes?: string, updatedBy?: string) =>
    request<Delivery>(`/deliveries/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes, updatedBy })
    }),

  // Routing & Road Hazards
  getRoute: (startLat: number, startLng: number, endLat: number, endLng: number) =>
    request<any>(`/routes/calculate?startLat=${startLat}&startLng=${startLng}&endLat=${endLat}&endLng=${endLng}`),
  getRoadConditions: () => request<RoadCondition[]>('/roads'),

  // Simulation
  runSimulation: (scenarioType: string, customParams?: any) =>
    request<any>('/simulation/run', {
      method: 'POST',
      body: JSON.stringify({ scenarioType, customParams })
    }),

  // Analytics & CSV Reports
  getAnalyticsSummary: () => request<AnalyticsSummary>('/analytics/dashboard'),
  getReportsDownloadUrl: (type: 'requests' | 'deliveries') => `${API_BASE}/reports/export-csv?type=${type}`,

  // System
  resetDemoData: () => request<{ success: boolean; message: string }>('/system/reset-demo', { method: 'POST' }),
  getSystemConfig: () => request<any>('/system/config'),
  updateSystemConfig: (data: any) =>
    request<any>('/system/config', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
};
