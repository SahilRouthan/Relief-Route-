// =============================================================================
// RELIEFROUTE: REST API Route Definitions
// =============================================================================

import { Router } from 'express';
import {
  login,
  getUsers,
  getDisasters,
  createDisaster,
  updateDisaster,
  deleteDisaster,
  getRequests,
  getRequestById,
  createRequest,
  updateRequest,
  verifyRequest,
  rejectRequest,
  assessPriority,
  getMlEvaluation,
  getReliefCentres,
  updateReliefCentre,
  replenishInventory,
  getInventoryHistory,
  getVehicles,
  calculateAllocation,
  approveAllocation,
  getDeliveries,
  updateDeliveryStatus,
  getRoute,
  getRoadConditions,
  simulateScenario,
  getAnalyticsSummary,
  exportReportsCsv,
  resetDemoData,
  getSystemConfig,
  updateSystemConfig
} from '../controllers/apiController.js';

const router = Router();

// Health Check
router.get('/health', (req, res) => res.json({ status: 'OK', system: 'ReliefRoute API', timestamp: new Date() }));

// Auth & Users
router.post('/auth/login', login);
router.get('/auth/users', getUsers);

// Disasters
router.get('/disasters', getDisasters);
router.post('/disasters', createDisaster);
router.put('/disasters/:id', updateDisaster);
router.delete('/disasters/:id', deleteDisaster);

// Requests
router.get('/requests', getRequests);
router.get('/requests/:id', getRequestById);
router.post('/requests', createRequest);
router.put('/requests/:id', updateRequest);
router.post('/requests/:id/verify', verifyRequest);
router.post('/requests/:id/reject', rejectRequest);

// Priority Assessment & ML
router.get('/priority/assess/:id', assessPriority);
router.get('/priority/models-evaluation/:id', getMlEvaluation);

// Relief Centres & Inventory
router.get('/relief-centres', getReliefCentres);
router.put('/relief-centres/:id', updateReliefCentre);
router.post('/inventory/replenish', replenishInventory);
router.get('/inventory/history', getInventoryHistory);

// Vehicles
router.get('/vehicles', getVehicles);

// Allocation Engine
router.post('/allocation/calculate', calculateAllocation);
router.post('/allocation/approve', approveAllocation);

// Deliveries
router.get('/deliveries', getDeliveries);
router.put('/deliveries/:id/status', updateDeliveryStatus);

// Routing & Road Hazards
router.get('/routes/calculate', getRoute);
router.get('/roads', getRoadConditions);

// Simulation
router.post('/simulation/run', simulateScenario);

// Analytics & Reports
router.get('/analytics/dashboard', getAnalyticsSummary);
router.get('/reports/export-csv', exportReportsCsv);

// System Management
router.post('/system/reset-demo', resetDemoData);
router.get('/system/config', getSystemConfig);
router.put('/system/config', updateSystemConfig);

export default router;
