// =============================================================================
// RELIEFROUTE: Master API Controller
// =============================================================================

import { store } from '../data/store.js';
import { calculatePriorityScore, getMlModelEvaluation } from '../services/priorityEngine.js';
import { runAllocationComparison, approveAndCommitAllocation } from '../services/allocationEngine.js';
import { getRouteCoordinates } from '../services/routingService.js';
import { runScenarioSimulation } from '../services/simulationService.js';

// --- Auth & Users ---
export const login = (req, res) => {
  const { email, role } = req.body;
  const users = store.getUsers();

  let user = null;
  if (role) {
    user = users.find(u => u.role.toUpperCase() === role.toUpperCase());
  } else if (email) {
    user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  if (!user) {
    user = users[0]; // fallback to admin
  }

  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      organization: user.organization,
      assignedCentreId: user.assignedCentreId,
      avatar: user.avatar
    },
    token: `demo-jwt-token-${user.id}`
  });
};

export const getUsers = (req, res) => {
  return res.json(store.getUsers());
};

// --- Disasters ---
export const getDisasters = (req, res) => {
  return res.json(store.getDisasters());
};

export const createDisaster = (req, res) => {
  const { title, disasterType, severity, status, locationName, latitude, longitude, affectedPopulation, estimatedDamageInr, description } = req.body;

  if (!title || !locationName) {
    return res.status(400).json({ error: 'Title and location are required' });
  }

  const newDisaster = {
    id: `dis-${Date.now().toString().slice(-4)}`,
    title,
    disasterType: disasterType || 'Flood',
    severity: severity || 'MEDIUM',
    status: status || 'ACTIVE',
    locationName,
    latitude: Number(latitude) || 30.3165,
    longitude: Number(longitude) || 78.0322,
    affectedPopulation: Number(affectedPopulation) || 0,
    estimatedDamageInr: Number(estimatedDamageInr) || 0,
    description: description || 'SIMULATED incident report.',
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSimulated: true
  };

  const created = store.addDisaster(newDisaster);
  return res.status(201).json(created);
};

export const updateDisaster = (req, res) => {
  const { id } = req.params;
  const updated = store.updateDisaster(id, req.body);
  if (!updated) return res.status(404).json({ error: 'Disaster incident not found' });
  return res.json(updated);
};

export const deleteDisaster = (req, res) => {
  const { id } = req.params;
  const removed = store.deleteDisaster(id);
  if (!removed) return res.status(404).json({ error: 'Disaster incident not found' });
  return res.json({ success: true, removed });
};

// --- Emergency Requests ---
export const getRequests = (req, res) => {
  const { status, priority, disasterId } = req.query;
  let requests = store.getRequests();

  if (status) requests = requests.filter(r => r.status.toUpperCase() === status.toUpperCase());
  if (priority) requests = requests.filter(r => r.priorityCategory.toUpperCase() === priority.toUpperCase());
  if (disasterId) requests = requests.filter(r => r.disasterId === disasterId);

  return res.json(requests);
};

export const getRequestById = (req, res) => {
  const { id } = req.params;
  const request = store.getRequestById(id);
  if (!request) return res.status(404).json({ error: 'Emergency request not found' });
  return res.json(request);
};

export const createRequest = (req, res) => {
  const {
    disasterId,
    reporterName,
    reporterContact,
    affectedLocation,
    latitude,
    longitude,
    affectedPopulation,
    severityLevel,
    medicalUrgency,
    accessibilityDifficulty,
    foodNeeded,
    waterNeeded,
    medicinesNeeded,
    shelterNeeded,
    description
  } = req.body;

  if (!affectedLocation || !latitude || !longitude) {
    return res.status(400).json({ error: 'Location coordinates and place name are required' });
  }

  const newReq = {
    id: `REQ-2026-${Math.floor(100 + Math.random() * 900)}`,
    disasterId: disasterId || 'dis-01',
    reporterName: reporterName || 'Anonymous Citizen',
    reporterContact: reporterContact || '+91-XXXXXXXXXX',
    affectedLocation,
    latitude: Number(latitude),
    longitude: Number(longitude),
    affectedPopulation: Number(affectedPopulation) || 50,
    severityLevel: severityLevel || 'MEDIUM',
    medicalUrgency: medicalUrgency || 'MODERATE',
    accessibilityDifficulty: accessibilityDifficulty || 'MODERATE',
    foodNeeded: Number(foodNeeded) || 0,
    waterNeeded: Number(waterNeeded) || 0,
    medicinesNeeded: Number(medicinesNeeded) || 0,
    shelterNeeded: Number(shelterNeeded) || 0,
    description: description || 'Emergency request submitted via citizen portal.',
    verificationStatus: 'PENDING',
    rejectionReason: null,
    status: 'SUBMITTED',
    createdAt: new Date().toISOString()
  };

  // Run AI Priority Assessment automatically
  const assessment = calculatePriorityScore(newReq);
  newReq.priorityScore = assessment.score;
  newReq.priorityCategory = assessment.category;
  newReq.scoringFactors = assessment.scoringFactors;

  const saved = store.addRequest(newReq);
  return res.status(201).json(saved);
};

export const updateRequest = (req, res) => {
  const { id } = req.params;
  const updated = store.updateRequest(id, req.body);
  if (!updated) return res.status(404).json({ error: 'Request not found' });
  return res.json(updated);
};

export const verifyRequest = (req, res) => {
  const { id } = req.params;
  const { verifiedBy } = req.body;

  const existing = store.getRequestById(id);
  if (!existing) return res.status(404).json({ error: 'Request not found' });

  // Recalculate priority to make sure factors are fresh
  const assessment = calculatePriorityScore(existing);

  const updated = store.updateRequest(id, {
    verificationStatus: 'VERIFIED',
    status: 'VERIFIED',
    priorityScore: assessment.score,
    priorityCategory: assessment.category,
    scoringFactors: assessment.scoringFactors,
    verifiedBy: verifiedBy || 'Dr. Rajeshwar Sharma',
    rejectionReason: null
  });

  store.logActivity(verifiedBy || 'Dr. Rajeshwar Sharma', 'ADMINISTRATOR', 'REQUEST_VERIFIED', 'EmergencyRequest', id, `Verified emergency request at ${existing.affectedLocation}`);

  return res.json({ success: true, request: updated });
};

export const rejectRequest = (req, res) => {
  const { id } = req.params;
  const { reason, rejectedBy } = req.body;

  const existing = store.getRequestById(id);
  if (!existing) return res.status(404).json({ error: 'Request not found' });

  const updated = store.updateRequest(id, {
    verificationStatus: 'REJECTED',
    status: 'REJECTED',
    rejectionReason: reason || 'Invalid or duplicate field submission.'
  });

  store.logActivity(rejectedBy || 'Dr. Rajeshwar Sharma', 'ADMINISTRATOR', 'REQUEST_REJECTED', 'EmergencyRequest', id, `Rejected request: ${reason}`);

  return res.json({ success: true, request: updated });
};

// --- Priority Assessment ---
export const assessPriority = (req, res) => {
  const { id } = req.params;
  const request = store.getRequestById(id);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  const result = calculatePriorityScore(request);
  return res.json(result);
};

export const getMlEvaluation = async (req, res) => {
  const { id } = req.params;
  const request = store.getRequestById(id);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  const evaluation = await getMlModelEvaluation(request);
  return res.json(evaluation);
};

// --- Relief Centres & Inventory ---
export const getReliefCentres = (req, res) => {
  return res.json(store.getReliefCentres());
};

export const updateReliefCentre = (req, res) => {
  const { id } = req.params;
  const updated = store.updateReliefCentre(id, req.body);
  if (!updated) return res.status(404).json({ error: 'Relief centre not found' });
  return res.json(updated);
};

export const replenishInventory = (req, res) => {
  const { centreId, quantities, reason } = req.body;
  if (!centreId || !quantities) return res.status(400).json({ error: 'centreId and quantities are required' });

  try {
    const updated = store.replenishInventory(centreId, quantities, reason);
    return res.json({ success: true, centre: updated });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const getInventoryHistory = (req, res) => {
  return res.json(store.getInventoryHistory());
};

// --- Vehicles ---
export const getVehicles = (req, res) => {
  return res.json(store.getVehicles());
};

// --- Allocations ---
export const calculateAllocation = (req, res) => {
  const comparison = runAllocationComparison();
  return res.json(comparison);
};

export const approveAllocation = (req, res) => {
  const { items, approvedBy } = req.body;
  try {
    const result = approveAndCommitAllocation(items, approvedBy);
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// --- Deliveries ---
export const getDeliveries = (req, res) => {
  return res.json(store.getDeliveries());
};

export const updateDeliveryStatus = (req, res) => {
  const { id } = req.params;
  const { status, notes, updatedBy } = req.body;

  const updated = store.updateDeliveryStatus(id, status, notes, updatedBy);
  if (!updated) return res.status(404).json({ error: 'Delivery record not found' });
  return res.json(updated);
};

// --- Routing & Maps ---
export const getRoute = async (req, res) => {
  const { startLat, startLng, endLat, endLng } = req.query;
  if (!startLat || !startLng || !endLat || !endLng) {
    return res.status(400).json({ error: 'Coordinates missing for start and end positions' });
  }

  const routeData = await getRouteCoordinates(
    Number(startLat),
    Number(startLng),
    Number(endLat),
    Number(endLng)
  );

  return res.json(routeData);
};

export const getRoadConditions = (req, res) => {
  return res.json(store.getRoadConditions());
};

// --- Scenario Simulation ---
export const simulateScenario = (req, res) => {
  const { scenarioType, customParams } = req.body;
  if (!scenarioType) return res.status(400).json({ error: 'scenarioType is required' });

  const result = runScenarioSimulation(scenarioType, customParams);
  return res.json(result);
};

// --- Analytics & Summary ---
export const getAnalyticsSummary = (req, res) => {
  const requests = store.getRequests();
  const disasters = store.getDisasters();
  const centres = store.getReliefCentres();
  const vehicles = store.getVehicles();
  const deliveries = store.getDeliveries();

  const totalDemands = requests.reduce((acc, r) => ({
    food: acc.food + (r.foodNeeded || 0),
    water: acc.water + (r.waterNeeded || 0),
    medicines: acc.medicines + (r.medicinesNeeded || 0),
    shelter: acc.shelter + (r.shelterNeeded || 0)
  }), { food: 0, water: 0, medicines: 0, shelter: 0 });

  const totalInventory = centres.reduce((acc, c) => ({
    food: acc.food + (c.inventory.foodPackets || 0),
    water: acc.water + (c.inventory.waterLitres || 0),
    medicines: acc.medicines + (c.inventory.medicalKits || 0),
    shelter: acc.shelter + (c.inventory.shelterKits || 0)
  }), { food: 0, water: 0, medicines: 0, shelter: 0 });

  const priorityBreakdown = {
    CRITICAL: requests.filter(r => r.priorityCategory === 'CRITICAL').length,
    HIGH: requests.filter(r => r.priorityCategory === 'HIGH').length,
    MEDIUM: requests.filter(r => r.priorityCategory === 'MEDIUM').length,
    LOW: requests.filter(r => r.priorityCategory === 'LOW').length
  };

  const statusBreakdown = {
    SUBMITTED: requests.filter(r => r.status === 'SUBMITTED').length,
    VERIFIED: requests.filter(r => r.status === 'VERIFIED').length,
    ALLOCATED: requests.filter(r => r.status === 'ALLOCATED').length,
    IN_TRANSIT: requests.filter(r => r.status === 'IN_TRANSIT').length,
    DELIVERED: requests.filter(r => r.status === 'DELIVERED').length,
    REJECTED: requests.filter(r => r.status === 'REJECTED').length
  };

  const deliveryPerformance = {
    total: deliveries.length,
    delivered: deliveries.filter(d => d.status === 'DELIVERED').length,
    inTransit: deliveries.filter(d => d.status === 'IN_TRANSIT').length,
    dispatched: deliveries.filter(d => d.status === 'DISPATCHED').length,
    approved: deliveries.filter(d => d.status === 'APPROVED').length
  };

  return res.json({
    metrics: {
      totalDisasters: disasters.length,
      activeDisasters: disasters.filter(d => d.status === 'ACTIVE').length,
      totalRequests: requests.length,
      pendingVerification: requests.filter(r => r.verificationStatus === 'PENDING').length,
      criticalRequests: priorityBreakdown.CRITICAL,
      activeReliefCentres: centres.filter(c => c.operationalStatus === 'ACTIVE').length,
      activeVehicles: vehicles.filter(v => v.status === 'AVAILABLE' || v.status === 'IN_TRANSIT').length,
      successfulDeliveries: deliveryPerformance.delivered
    },
    totalDemands,
    totalInventory,
    priorityBreakdown,
    statusBreakdown,
    deliveryPerformance,
    disasters: disasters.map(d => ({ id: d.id, title: d.title, type: d.disasterType, severity: d.severity })),
    activityFeed: store.getActivityLogs().slice(0, 10)
  });
};

export const exportReportsCsv = (req, res) => {
  const type = req.query.type || 'requests';

  if (type === 'requests') {
    const requests = store.getRequests();
    let csv = 'ID,Location,Severity,MedicalUrgency,Population,FoodNeeded,WaterNeeded,MedicinesNeeded,ShelterNeeded,PriorityScore,PriorityCategory,Status,CreatedAt\n';
    for (const r of requests) {
      csv += `"${r.id}","${r.affectedLocation}","${r.severityLevel}","${r.medicalUrgency}",${r.affectedPopulation},${r.foodNeeded},${r.waterNeeded},${r.medicinesNeeded},${r.shelterNeeded},${r.priorityScore},"${r.priorityCategory}","${r.status}","${r.createdAt}"\n`;
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="reliefroute_emergency_requests.csv"');
    return res.send(csv);
  }

  if (type === 'deliveries') {
    const deliveries = store.getDeliveries();
    let csv = 'ID,RequestID,VehicleID,CentreID,Destination,Status,DistanceKm,DurationMin,DispatchedAt,DeliveredAt\n';
    for (const d of deliveries) {
      csv += `"${d.id}","${d.requestId}","${d.vehicleId}","${d.centreId}","${d.destinationName}","${d.status}",${d.estimatedDistanceKm},${d.estimatedDurationMin},"${d.dispatchedAt || ''}","${d.deliveredAt || ''}"\n`;
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="reliefroute_deliveries.csv"');
    return res.send(csv);
  }

  return res.status(400).json({ error: 'Invalid report type' });
};

// --- System & Reset ---
export const resetDemoData = (req, res) => {
  const freshState = store.resetToSeed();
  return res.json({ success: true, message: 'Reset database to pristine Uttarakhand demonstration state.' });
};

export const getSystemConfig = (req, res) => {
  return res.json(store.getConfig());
};

export const updateSystemConfig = (req, res) => {
  const updated = store.updateConfig(req.body);
  return res.json(updated);
};
