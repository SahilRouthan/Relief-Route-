// =============================================================================
// RELIEFROUTE: Persistent Demo Data Store (In-Memory + File Persistence)
// =============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  seedUsers,
  seedDisasters,
  seedReliefCentres,
  seedVehicles,
  seedEmergencyRequests,
  seedRoadConditions,
  seedDeliveries,
  seedActivityLogs
} from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'db_state.json');

class DataStore {
  constructor() {
    this.state = null;
    this.init();
  }

  getInitialState() {
    return {
      users: JSON.parse(JSON.stringify(seedUsers)),
      disasters: JSON.parse(JSON.stringify(seedDisasters)),
      reliefCentres: JSON.parse(JSON.stringify(seedReliefCentres)),
      vehicles: JSON.parse(JSON.stringify(seedVehicles)),
      requests: JSON.parse(JSON.stringify(seedEmergencyRequests)),
      roadConditions: JSON.parse(JSON.stringify(seedRoadConditions)),
      deliveries: JSON.parse(JSON.stringify(seedDeliveries)),
      activityLogs: JSON.parse(JSON.stringify(seedActivityLogs)),
      allocations: [],
      inventoryHistory: [
        {
          id: 'inv-hist-01',
          centreId: 'rc-01',
          centreName: 'Dehradun Central Disaster Logistics Depot',
          action: 'INITIAL_STOCK',
          delta: { foodPackets: 6500, waterLitres: 12000, medicalKits: 1400, shelterKits: 450 },
          reason: 'Initial state inventory deposit by USDMA',
          timestamp: '2026-11-20T00:00:00Z'
        }
      ],
      systemConfig: {
        priorityWeights: {
          disasterSeverity: 0.25,
          medicalUrgency: 0.25,
          affectedPopulation: 0.15,
          essentialSupplyShortage: 0.20,
          accessibilityDifficulty: 0.10,
          timeSinceReport: 0.05
        },
        fairnessAlpha: 0.65, // Balance between efficiency and equity (0 = pure nearest/efficiency, 1 = strict equity)
        usePythonMlService: true
      }
    };
  }

  init() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.state = JSON.parse(raw);
        console.log('[DataStore] Loaded existing persistent database state.');
      } else {
        this.resetToSeed();
      }
    } catch (err) {
      console.error('[DataStore] Error reading persistent store, resetting to seeds:', err.message);
      this.resetToSeed();
    }
  }

  persist() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DataStore] Failed to persist state to disk:', err.message);
    }
  }

  resetToSeed() {
    this.state = this.getInitialState();
    this.persist();
    console.log('[DataStore] Reset database state to pristine seed dataset.');
    return this.state;
  }

  // --- Users ---
  getUsers() { return this.state.users; }
  getUserById(id) { return this.state.users.find(u => u.id === id); }
  getUserByEmail(email) { return this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase()); }

  // --- Disasters ---
  getDisasters() { return this.state.disasters; }
  getDisasterById(id) { return this.state.disasters.find(d => d.id === id); }
  addDisaster(disaster) {
    this.state.disasters.unshift(disaster);
    this.logActivity('Admin', 'ADMINISTRATOR', 'DISASTER_CREATED', 'Disaster', disaster.id, `Created incident: ${disaster.title}`);
    this.persist();
    return disaster;
  }
  updateDisaster(id, updates) {
    const idx = this.state.disasters.findIndex(d => d.id === id);
    if (idx !== -1) {
      this.state.disasters[idx] = { ...this.state.disasters[idx], ...updates, updatedAt: new Date().toISOString() };
      this.logActivity('Admin', 'ADMINISTRATOR', 'DISASTER_UPDATED', 'Disaster', id, `Updated incident: ${this.state.disasters[idx].title}`);
      this.persist();
      return this.state.disasters[idx];
    }
    return null;
  }
  deleteDisaster(id) {
    const idx = this.state.disasters.findIndex(d => d.id === id);
    if (idx !== -1) {
      const removed = this.state.disasters.splice(idx, 1)[0];
      this.persist();
      return removed;
    }
    return null;
  }

  // --- Emergency Requests ---
  getRequests() { return this.state.requests; }
  getRequestById(id) { return this.state.requests.find(r => r.id === id); }
  addRequest(request) {
    this.state.requests.unshift(request);
    this.logActivity(request.reporterName || 'Citizen', 'CITIZEN', 'REQUEST_SUBMITTED', 'EmergencyRequest', request.id, `Submitted request at ${request.affectedLocation}`);
    this.persist();
    return request;
  }
  updateRequest(id, updates) {
    const idx = this.state.requests.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.state.requests[idx] = { ...this.state.requests[idx], ...updates, updatedAt: new Date().toISOString() };
      this.persist();
      return this.state.requests[idx];
    }
    return null;
  }

  // --- Relief Centres & Inventory ---
  getReliefCentres() { return this.state.reliefCentres; }
  getReliefCentreById(id) { return this.state.reliefCentres.find(rc => rc.id === id); }
  addReliefCentre(centre) {
    this.state.reliefCentres.push(centre);
    this.persist();
    return centre;
  }
  updateReliefCentre(id, updates) {
    const idx = this.state.reliefCentres.findIndex(rc => rc.id === id);
    if (idx !== -1) {
      this.state.reliefCentres[idx] = { ...this.state.reliefCentres[idx], ...updates };
      this.persist();
      return this.state.reliefCentres[idx];
    }
    return null;
  }

  // Deduct inventory atomically with safety check
  deductInventory(centreId, quantities, reason = 'Dispatched Allocation') {
    const centre = this.getReliefCentreById(centreId);
    if (!centre) throw new Error(`Relief centre ${centreId} not found`);

    const inv = centre.inventory;
    const reqFood = Number(quantities.foodPackets || 0);
    const reqWater = Number(quantities.waterLitres || 0);
    const reqMed = Number(quantities.medicalKits || 0);
    const reqShelter = Number(quantities.shelterKits || 0);

    // Safety checks: inventory must never be negative
    if (inv.foodPackets < reqFood) throw new Error(`Insufficient food stock in ${centre.name}`);
    if (inv.waterLitres < reqWater) throw new Error(`Insufficient water stock in ${centre.name}`);
    if (inv.medicalKits < reqMed) throw new Error(`Insufficient medical kits in ${centre.name}`);
    if (inv.shelterKits < reqShelter) throw new Error(`Insufficient shelter kits in ${centre.name}`);

    inv.foodPackets -= reqFood;
    inv.waterLitres -= reqWater;
    inv.medicalKits -= reqMed;
    inv.shelterKits -= reqShelter;

    const histEntry = {
      id: `inv-tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      centreId,
      centreName: centre.name,
      action: 'DEDUCTION',
      delta: { foodPackets: -reqFood, waterLitres: -reqWater, medicalKits: -reqMed, shelterKits: -reqShelter },
      reason,
      timestamp: new Date().toISOString()
    };
    this.state.inventoryHistory.unshift(histEntry);
    this.persist();
    return centre;
  }

  // Replenish inventory
  replenishInventory(centreId, additions, reason = 'Restocked Supplies') {
    const centre = this.getReliefCentreById(centreId);
    if (!centre) throw new Error(`Relief centre ${centreId} not found`);

    const inv = centre.inventory;
    const addFood = Number(additions.foodPackets || 0);
    const addWater = Number(additions.waterLitres || 0);
    const addMed = Number(additions.medicalKits || 0);
    const addShelter = Number(additions.shelterKits || 0);

    inv.foodPackets += addFood;
    inv.waterLitres += addWater;
    inv.medicalKits += addMed;
    inv.shelterKits += addShelter;

    const histEntry = {
      id: `inv-tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      centreId,
      centreName: centre.name,
      action: 'REPLENISHMENT',
      delta: { foodPackets: addFood, waterLitres: addWater, medicalKits: addMed, shelterKits: addShelter },
      reason,
      timestamp: new Date().toISOString()
    };
    this.state.inventoryHistory.unshift(histEntry);
    this.persist();
    return centre;
  }

  getInventoryHistory() { return this.state.inventoryHistory; }

  // --- Vehicles ---
  getVehicles() { return this.state.vehicles; }
  getVehicleById(id) { return this.state.vehicles.find(v => v.id === id); }
  updateVehicleStatus(id, status, lat = null, lng = null) {
    const v = this.getVehicleById(id);
    if (v) {
      v.status = status;
      if (lat !== null) v.currentLatitude = lat;
      if (lng !== null) v.currentLongitude = lng;
      this.persist();
      return v;
    }
    return null;
  }

  // --- Road Conditions ---
  getRoadConditions() { return this.state.roadConditions; }
  addRoadCondition(item) {
    this.state.roadConditions.unshift(item);
    this.persist();
    return item;
  }
  updateRoadCondition(id, updates) {
    const idx = this.state.roadConditions.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.state.roadConditions[idx] = { ...this.state.roadConditions[idx], ...updates };
      this.persist();
      return this.state.roadConditions[idx];
    }
    return null;
  }

  // --- Deliveries ---
  getDeliveries() { return this.state.deliveries; }
  getDeliveryById(id) { return this.state.deliveries.find(d => d.id === id); }
  addDelivery(del) {
    this.state.deliveries.unshift(del);
    this.persist();
    return del;
  }
  updateDeliveryStatus(id, newStatus, notes, updatedBy = 'Field Worker') {
    const d = this.getDeliveryById(id);
    if (d) {
      d.status = newStatus;
      d.statusNotes = notes || d.statusNotes;
      d.updatedAt = new Date().toISOString();
      if (newStatus === 'DELIVERED') {
        d.deliveredAt = new Date().toISOString();
        // Also update emergency request status
        const req = this.getRequestById(d.requestId);
        if (req) {
          req.status = 'DELIVERED';
        }
        // Free vehicle
        const v = this.getVehicleById(d.vehicleId);
        if (v) {
          v.status = 'AVAILABLE';
        }
      } else if (newStatus === 'IN_TRANSIT') {
        const v = this.getVehicleById(d.vehicleId);
        if (v) v.status = 'IN_TRANSIT';
      }
      d.timeline = d.timeline || [];
      d.timeline.push({
        status: newStatus,
        timestamp: new Date().toISOString(),
        note: notes || `Status changed to ${newStatus} by ${updatedBy}`
      });
      this.logActivity(updatedBy, 'VOLUNTEER', 'DELIVERY_STATUS_UPDATED', 'Delivery', id, `Updated delivery status to ${newStatus}`);
      this.persist();
      return d;
    }
    return null;
  }

  // --- Allocations ---
  getAllocations() { return this.state.allocations; }
  saveAllocation(allocation) {
    this.state.allocations.unshift(allocation);
    this.persist();
    return allocation;
  }

  // --- Activity Logs ---
  getActivityLogs() { return this.state.activityLogs; }
  logActivity(userName, userRole, action, entityType, entityId, details) {
    const entry = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userName,
      userRole,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString()
    };
    this.state.activityLogs.unshift(entry);
    // Keep max 100 activity logs
    if (this.state.activityLogs.length > 100) {
      this.state.activityLogs.pop();
    }
    return entry;
  }

  // --- System Config ---
  getConfig() { return this.state.systemConfig; }
  updateConfig(updates) {
    this.state.systemConfig = { ...this.state.systemConfig, ...updates };
    this.persist();
    return this.state.systemConfig;
  }
}

export const store = new DataStore();
