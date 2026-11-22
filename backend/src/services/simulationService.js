// =============================================================================
// RELIEFROUTE: Scenario Simulation Engine (What-If Sandbox)
// Strictly Isolated from Production/Live Database State
// =============================================================================

import { store } from '../data/store.js';
import { calculatePriorityScore } from './priorityEngine.js';
import { runAllocationComparison } from './allocationEngine.js';

export function runScenarioSimulation(scenarioType, customParams = {}) {
  // Deep clone live state to guarantee total isolation
  const baseRequests = JSON.parse(JSON.stringify(store.getRequests().filter(r => r.verificationStatus === 'VERIFIED')));
  const baseCentres = JSON.parse(JSON.stringify(store.getReliefCentres()));
  const baseRoads = JSON.parse(JSON.stringify(store.getRoadConditions()));

  // Run baseline allocation before any scenario modifications
  const baselineResults = runAllocationComparison(baseRequests, baseCentres);

  // Apply scenario modifications to simulated copy
  const simRequests = JSON.parse(JSON.stringify(baseRequests));
  const simCentres = JSON.parse(JSON.stringify(baseCentres));
  const simRoads = JSON.parse(JSON.stringify(baseRoads));

  let scenarioDescription = '';
  let affectedEntities = [];

  switch (scenarioType) {
    case 'POPULATION_SURGE': {
      // Scenario 1: Increase affected population by 30%
      const surgeFactor = customParams.surgeFactor || 1.30;
      scenarioDescription = `Simulated 30% sudden surge in displaced population due to secondary slope failure across active disaster zones.`;

      for (const req of simRequests) {
        const oldPop = req.affectedPopulation;
        req.affectedPopulation = Math.round(oldPop * surgeFactor);
        req.foodNeeded = Math.round(req.foodNeeded * surgeFactor);
        req.waterNeeded = Math.round(req.waterNeeded * surgeFactor);
        req.medicinesNeeded = Math.round(req.medicinesNeeded * (1 + (surgeFactor - 1) * 1.5)); // medicine surges faster

        // Recalculate priority score
        const updated = calculatePriorityScore(req);
        req.priorityScore = updated.score;
        req.priorityCategory = updated.category;
        req.scoringFactors = updated.scoringFactors;

        affectedEntities.push({
          requestId: req.id,
          location: req.affectedLocation,
          populationBefore: oldPop,
          populationAfter: req.affectedPopulation,
          priorityBefore: (req.priorityScore / surgeFactor).toFixed(1),
          priorityAfter: req.priorityScore
        });
      }
      break;
    }

    case 'WATER_STOCK_DEPLETION': {
      // Scenario 2: Reduce available drinking water stock by 40%
      const reductionFactor = customParams.reductionFactor || 0.40;
      scenarioDescription = `Simulated 40% loss of drinking water reserves due to pipeline rupture and silt contamination at forward depots.`;

      for (const c of simCentres) {
        const oldWater = c.inventory.waterLitres;
        c.inventory.waterLitres = Math.round(oldWater * (1 - reductionFactor));
        affectedEntities.push({
          centreId: c.id,
          centreName: c.name,
          waterBefore: oldWater,
          waterAfter: c.inventory.waterLitres,
          deficit: oldWater - c.inventory.waterLitres
        });
      }
      break;
    }

    case 'ROAD_CLOSURE': {
      // Scenario 3: Close an important road
      scenarioDescription = `Simulated emergency total closure of NH-58 Badrinath Highway and Rishikesh bypass due to active debris slide.`;
      const targetRoad = simRoads.find(r => r.roadName.includes('NH-58')) || simRoads[0];
      if (targetRoad) {
        targetRoad.status = 'BLOCKED';
        targetRoad.severity = 'CRITICAL';
        targetRoad.description = 'SIMULATED TOTAL CLOSURE: Active cliff collapse blocking all heavy convoy passage.';
      }
      affectedEntities.push({
        roadName: targetRoad.roadName,
        statusBefore: 'RESTRICTED / OPEN',
        statusAfter: 'BLOCKED',
        impact: 'Convoys must take 65km southern detour via Devprayag-Kotdwar mountain crest.'
      });
      break;
    }

    case 'CRITICAL_MEDICAL_EMERGENCY': {
      // Scenario 4: Create a new critical medical emergency
      scenarioDescription = `Simulated sudden cloudburst at Chamoli high-altitude hamlet causing multiple crush injuries and flash water contamination.`;
      const newEmergency = {
        id: `REQ-SIM-${Date.now().toString().slice(-4)}`,
        disasterId: 'dis-01',
        reporterName: 'Emergency Medevac Flight Team',
        reporterContact: '+91-99887-11223',
        affectedLocation: 'Ghat Sub-District Cliff Hamlet, Chamoli',
        latitude: 30.2780,
        longitude: 79.4120,
        affectedPopulation: 450,
        severityLevel: 'CRITICAL',
        medicalUrgency: 'CRITICAL',
        accessibilityDifficulty: 'EXTREME',
        foodNeeded: 850,
        waterNeeded: 1800,
        medicinesNeeded: 340,
        shelterNeeded: 110,
        description: 'SIMULATED CRITICAL EMERGENCY: Sudden landslide crushed 14 hillside cottages. 26 trauma victims requiring surgical kits and blood plasma units.',
        verificationStatus: 'VERIFIED',
        status: 'VERIFIED',
        createdAt: new Date().toISOString()
      };

      const evalResult = calculatePriorityScore(newEmergency);
      newEmergency.priorityScore = evalResult.score;
      newEmergency.priorityCategory = evalResult.category;
      newEmergency.scoringFactors = evalResult.scoringFactors;

      simRequests.unshift(newEmergency);
      affectedEntities.push({
        requestId: newEmergency.id,
        location: newEmergency.affectedLocation,
        priority: newEmergency.priorityCategory,
        score: newEmergency.priorityScore,
        medicalDemand: newEmergency.medicinesNeeded
      });
      break;
    }

    default:
      scenarioDescription = 'Custom Multi-Factor Stress Simulation';
  }

  // Run new simulated allocation
  const simulatedResults = runAllocationComparison(simRequests, simCentres);

  // Compute Before vs After Delta
  const baseFairness = baselineResults.strategies.fairness;
  const simFairness = simulatedResults.strategies.fairness;

  const delta = {
    demandDelta: simFairness.totalDemand - baseFairness.totalDemand,
    allocatedDelta: simFairness.totalAllocated - baseFairness.totalAllocated,
    unmetCriticalDemandDelta: simFairness.unmetCriticalDemand - baseFairness.unmetCriticalDemand,
    fulfillmentPctDelta: Math.round((simFairness.demandFulfillmentPct - baseFairness.demandFulfillmentPct) * 10) / 10,
    fairnessIndexDelta: Math.round((simFairness.fairnessIndex - baseFairness.fairnessIndex) * 1000) / 1000
  };

  return {
    scenarioType,
    scenarioDescription,
    simulatedAt: new Date().toISOString(),
    isIsolatedSandbox: true,
    affectedEntities,
    before: {
      totalDemand: baseFairness.totalDemand,
      totalAllocated: baseFairness.totalAllocated,
      demandFulfillmentPct: baseFairness.demandFulfillmentPct,
      unmetCriticalDemand: baseFairness.unmetCriticalDemand,
      fairnessIndex: baseFairness.fairnessIndex,
      remainingStock: baseFairness.remainingStock
    },
    after: {
      totalDemand: simFairness.totalDemand,
      totalAllocated: simFairness.totalAllocated,
      demandFulfillmentPct: simFairness.demandFulfillmentPct,
      unmetCriticalDemand: simFairness.unmetCriticalDemand,
      fairnessIndex: simFairness.fairnessIndex,
      remainingStock: simFairness.remainingStock
    },
    delta,
    simulatedAllocations: simFairness.items
  };
}
