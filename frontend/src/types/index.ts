// =============================================================================
// RELIEFROUTE: TypeScript Type Definitions
// =============================================================================

export type UserRole = 'ADMINISTRATOR' | 'VOLUNTEER' | 'CITIZEN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  organization?: string;
  assignedCentreId?: string;
  avatar?: string;
}

export type DisasterType = 'Flood' | 'Earthquake' | 'Landslide' | 'Cyclone' | 'Forest Fire';
export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type DisasterStatus = 'ACTIVE' | 'CONTAINED' | 'RESOLVED' | 'MONITORING';

export interface Disaster {
  id: string;
  title: string;
  disasterType: DisasterType;
  severity: SeverityLevel;
  status: DisasterStatus;
  locationName: string;
  latitude: number;
  longitude: number;
  affectedPopulation: number;
  estimatedDamageInr: number;
  description: string;
  startedAt: string;
  updatedAt: string;
  isSimulated?: boolean;
}

export type MedicalUrgency = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
export type AccessibilityDifficulty = 'EXTREME' | 'HARD' | 'MODERATE' | 'EASY';
export type RequestStatus = 'SUBMITTED' | 'VERIFIED' | 'ALLOCATED' | 'IN_TRANSIT' | 'DELIVERED' | 'REJECTED';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface ScoringFactors {
  disasterSeverity: number;
  medicalUrgency: number;
  affectedPopulation: number;
  essentialSupplyShortage: number;
  accessibilityDifficulty: number;
  timeSinceReport: number;
}

export interface EmergencyRequest {
  id: string;
  disasterId: string;
  reporterName: string;
  reporterContact: string;
  affectedLocation: string;
  latitude: number;
  longitude: number;
  affectedPopulation: number;
  severityLevel: SeverityLevel;
  medicalUrgency: MedicalUrgency;
  accessibilityDifficulty: AccessibilityDifficulty;
  foodNeeded: number;
  waterNeeded: number;
  medicinesNeeded: number;
  shelterNeeded: number;
  description: string;
  priorityScore: number;
  priorityCategory: SeverityLevel;
  verificationStatus: VerificationStatus;
  rejectionReason?: string | null;
  status: RequestStatus;
  createdAt: string;
  scoringFactors?: ScoringFactors;
}

export interface Inventory {
  foodPackets: number;
  waterLitres: number;
  medicalKits: number;
  shelterKits: number;
}

export interface ReliefCentre {
  id: string;
  name: string;
  code: string;
  locationName: string;
  latitude: number;
  longitude: number;
  contactPerson: string;
  contactPhone: string;
  storageCapacitySqm: number;
  operationalStatus: 'ACTIVE' | 'CONGESTED' | 'OFFLINE';
  inventory: Inventory;
}

export interface Vehicle {
  id: string;
  assignedCentreId: string;
  vehicleNumber: string;
  vehicleType: string;
  capacityKg: number;
  fuelLevelPercent: number;
  status: 'AVAILABLE' | 'DISPATCHED' | 'IN_TRANSIT' | 'MAINTENANCE';
  currentLatitude: number;
  currentLongitude: number;
  driverName?: string;
}

export interface RoadCondition {
  id: string;
  roadName: string;
  latitude: number;
  longitude: number;
  status: 'BLOCKED' | 'HAZARDOUS' | 'RESTRICTED' | 'CLEAR';
  conditionType: string;
  reportedBy: string;
  reportedAt: string;
  severity: SeverityLevel;
  description: string;
}

export interface DeliveryTimelineItem {
  status: string;
  timestamp: string;
  note: string;
}

export interface Delivery {
  id: string;
  allocationId: string;
  requestId: string;
  vehicleId: string;
  centreId: string;
  destinationName: string;
  destinationLat: number;
  destinationLng: number;
  status: 'PENDING' | 'APPROVED' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';
  cargo: Inventory;
  estimatedDistanceKm: number;
  estimatedDurationMin: number;
  dispatchedAt?: string | null;
  deliveredAt?: string | null;
  statusNotes?: string;
  timeline: DeliveryTimelineItem[];
}

export interface AllocationItem {
  requestId: string;
  requestName: string;
  priorityCategory: SeverityLevel;
  priorityScore: number;
  assignedCentreId: string;
  assignedCentreName: string;
  distanceKm: number;
  allocated: Inventory;
  demanded: Inventory;
  fulfillmentRatio: number;
}

export interface AllocationStrategyResult {
  strategyName: string;
  strategyKey: string;
  description: string;
  totalDemand: number;
  totalAllocated: number;
  demandFulfillmentPct: number;
  unmetCriticalDemand: number;
  remainingStock: Inventory;
  fairnessIndex: number;
  items: AllocationItem[];
}

export interface AllocationComparison {
  evaluatedAt: string;
  totalVerifiedRequests: number;
  activeReliefCentres: number;
  strategies: {
    equal: AllocationStrategyResult;
    nearest: AllocationStrategyResult;
    fairness: AllocationStrategyResult;
  };
  metricsTable: Array<{
    metric: string;
    equal: string;
    nearest: string;
    fairness: string;
  }>;
  explanation: {
    whyOptimizedWins: string;
    constraintsChecked: string[];
  };
}

export interface ActivityLog {
  id: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}

export interface AnalyticsSummary {
  metrics: {
    totalDisasters: number;
    activeDisasters: number;
    totalRequests: number;
    pendingVerification: number;
    criticalRequests: number;
    activeReliefCentres: number;
    activeVehicles: number;
    successfulDeliveries: number;
  };
  totalDemands: { food: number; water: number; medicines: number; shelter: number };
  totalInventory: { food: number; water: number; medicines: number; shelter: number };
  priorityBreakdown: { CRITICAL: number; HIGH: number; MEDIUM: number; LOW: number };
  statusBreakdown: { [key: string]: number };
  deliveryPerformance: { total: number; delivered: number; inTransit: number; dispatched: number; approved: number };
  disasters: Array<{ id: string; title: string; type: string; severity: string }>;
  activityFeed: ActivityLog[];
}
