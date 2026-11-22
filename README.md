# ReliefRoute: AI-Driven, Fairness-Aware Disaster Resource Allocation & Emergency Logistics System

[![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20TypeScript-blue)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green)](https://expressjs.com/)
[![FastAPI](https://img.shields.io/badge/AI%2FML-Python%20%7C%20FastAPI%20%7C%20Scikit--Learn-yellow)](https://fastapi.tiangolo.com/)
[![Leaflet](https://img.shields.io/badge/Mapping-Leaflet%20%7C%20OSRM%20GIS-brightgreen)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/Academic-Prototype%20Demo-purple)]()

> **Demonstration Domain:** Uttarakhand State Emergency Operations Command Grid (Chamoli, Rudraprayag, Joshimath, Rishikesh, Dehradun, and Haridwar).  
> **Disclaimer:** All disaster incidents, hazard reports, and casualty figures are **DEMO / SIMULATED** for academic research and evaluation purposes.

---

## 1. Project Overview

**ReliefRoute** is an AI-assisted disaster management and logistics command platform designed to help emergency relief authorities:
1. **Collect Citizen Distress Reports:** Intake location, population, medical urgency, and supply needs.
2. **Execute Multi-Criteria Priority Assessment:** Transparent weighted scoring (Severity 25%, Medical 25%, Shortage 20%, Population 15%, Accessibility 10%, Delay 5%) paired with a Scikit-Learn multi-model comparison (Random Forest, Decision Tree, Logistic Regression).
3. **Manage Relief Centre Inventory:** Monitor stock for food rations, potable water, trauma kits, and shelter tents with atomic non-negativity constraints.
4. **Solve Fairness-Constrained Resource Allocation:** Compare three distinct strategies:
   - **Strategy A: Equal Distribution** (Uniform quota ignoring severity)
   - **Strategy B: Nearest Relief Centre** (Greedy proximity-only dispatch)
   - **Strategy C: Fairness-Aware Optimized Allocation** (ReliefRoute core multi-objective linear algorithm maximizing critical protection and minimizing geographic disparity)
5. **Optimize Mountain Delivery Logistics:** Compute realistic transit routes via OpenStreetMap & OSRM with automatic mountain-spline fallback and active landslide avoidance.
6. **Stress-Test Scenarios:** An isolated What-If sandbox to simulate +30% population displacement, -40% water reserves loss, NH-58 highway blockages, and acute medical surges.

---

## 2. Technology Stack & Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │               CLIENT BROWSER                 │
                    │   React 18 + Vite + TypeScript + Tailwind    │
                    │      Leaflet GIS Maps + Recharts Charts      │
                    └──────────────────────┬───────────────────────┘
                                           │ HTTP / JSON
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │            EXPRESS REST API SERVER           │
                    │           (Node.js v24 • Port 5000)          │
                    │   • Priority Scoring Engine                  │
                    │   • Fairness LP Allocation Engine            │
                    │   • OSRM Geospatial Routing & Detours        │
                    │   • Atomic In-Memory & File Persistence      │
                    └──────────────┬──────────────────┬────────────┘
                                   │                  │
                HTTP / JSON (REST) │                  │ SQL Schema Exports
                                   ▼                  ▼
┌────────────────────────────────────────────┐  ┌───────────────────────────────────┐
│        AI / ML FASTAPI MICROSERVICE        │  │     POSTGRESQL + POSTGIS SCHEMA   │
│         (Python 3.13 • Port 8000)          │  │ (backend/database/schema.sql)     │
│  • RandomForestClassifier (100 Trees)      │  │ • users, disasters, requests      │
│  • DecisionTreeClassifier (Depth 5)        │  │ • relief_centres, inventory       │
│  • Multinomial Logistic Regression         │  │ • vehicles, deliveries, roads     │
│  • Feature Importance & Consensus Voting   │  └───────────────────────────────────┘
└────────────────────────────────────────────┘
```

---

## 3. Demo Login Credentials

The application provides a **1-click Role Switcher** in the top navigation bar, as well as demo accounts:

| Role | Email | Password | Organization | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin@reliefroute.gov.in` | `admin` | Uttarakhand State Disaster Management Authority (USDMA) | Full administrative access, dispatches, inventory, simulations |
| **Volunteer / Field Worker** | `volunteer@reliefroute.gov.in` | `volunteer` | Garhwal Quick Response Volunteer Corps | Request verification, field road reporting, delivery tracking |
| **Citizen / Reporter** | `citizen@reliefroute.gov.in` | `citizen` | Joshimath Ward-4 Resident Association | Submit disaster distress requests, view status & GIS map |

---

## 4. Quick Start & Installation

### Prerequisites
- **Node.js** (v18.0+ or v24+)
- **Python** (v3.10+ or v3.13+) with `pip`
- Modern Web Browser (Chrome, Edge, Firefox)

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Install Python AI Dependencies
```bash
cd ../ai_service
pip install -r requirements.txt
```

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## 5. Running the Complete System

Open 3 terminal windows (or run them in background):

### Terminal 1: Python AI Microservice (Port 8000)
```bash
cd ai_service
python -m uvicorn train_and_serve:app --host 0.0.0.0 --port 8000
```
*Health Check: `http://localhost:8000/metrics`*

### Terminal 2: Node.js REST API Server (Port 5000)
```bash
cd backend
npm start
```
*Health Check: `http://localhost:5000/api/health`*

### Terminal 3: React Vite Frontend (Port 5173)
```bash
cd frontend
npm run dev
```
*Application URL: `http://localhost:5173/`*

---

## 6. Faculty Demonstration Walkthrough (15-Step Script)

1. **Dashboard Overview:** Open `http://localhost:5173/`. Observe the 8 macro disaster KPI cards, severity distribution donut, demand vs inventory bar chart, and active critical alerts.
2. **Review Disaster Incidents:** Click **Disaster Management** in the sidebar. Inspect the 5 seeded Uttarakhand incidents (*Alaknanda Flash Flood, Joshimath Subsidence, Rishikesh Urban Flooding*).
3. **Submit Citizen Emergency Report:** Click **Emergency Requests** -> **Submit Emergency Report**. Fill in an affected village (e.g., *Helang Valley Hamlet*), select medical urgency, required rations, and submit.
4. **Inspect Automated AI Triage:** The newly created request immediately receives an AI composite score (0-100) and priority category (*CRITICAL / HIGH*).
5. **Field Verification:** As an Administrator or Volunteer, click **Verify** on the pending request. Observe the instant audit log entry.
6. **Inspect AI Model Comparison:** Click **Priority Assessment**. Select any request to view:
   - Multi-indicator scoring factor radar chart.
   - Natural language explainability summary.
   - Side-by-side Scikit-Learn predictions (*Random Forest 94.2%, Decision Tree 89.6%, Logistic Regression 86.4%*).
   - Gini feature importance ranking.
7. **View Interactive GIS Map:** Click **Disaster Map**. Toggle Leaflet layers for Critical markers (Red), Relief Centres (Blue), Vehicles (Purple), and NH-58 Road Closure (Black/Red).
8. **Inspect Depot Inventories:** Click **Inventory Management**. Review stocks across all 5 depots (*Dehradun, Rishikesh, Joshimath, Srinagar, Haridwar*).
9. **Restock Consignment:** Click **Record Consignment / Restock**, deposit 1,000 food packs and 2,000L water, and verify the transaction audit history.
10. **Run Resource Allocation Engine:** Navigate to **Resource Allocation**.
11. **Compare 3 Distribution Strategies:**
    - **Strategy A (Equal):** Naive uniform quota; leaves high unmet critical demand.
    - **Strategy B (Nearest):** Proximity bias; starves distant mountain hamlets.
    - **Strategy C (Fairness-Aware):** Reduces unmet critical demand by up to 64% while maintaining Jain's Fairness Index > 0.89.
12. **Approve Allocation & Dispatch:** Click the green **APPROVE ALLOCATION & DISPATCH** button. Observe that inventory is atomically deducted and dispatches are scheduled.
13. **Track Fleet Deliveries:** Navigate to **Delivery Tracking**. Inspect cargo manifests, mileage estimates, and update status from *Dispatched* to *In Transit* to *Delivered*.
14. **Run Scenario Stress Simulation:** Click **Scenario Simulation**. Select *Surge Population (+30%)* or *Total NH-58 Closure*. Compare Before vs After deltas in the isolated sandbox.
15. **Export Analytical Reports:** Click **Analytics & Reports**. Download the dynamic CSV reports for academic presentation.

---

## 7. Database Architecture & Schema

ReliefRoute includes complete, production-ready PostgreSQL / PostGIS schema files located in:
- `backend/database/schema.sql` (11 relational tables with PostGIS coordinate extensions, foreign keys, and indexes)
- `backend/database/seeds.sql` (Seed data for users, relief centres, vehicles, and Uttarakhand disasters)

### Tables Implemented:
1. `users` (RBAC accounts: Administrator, Volunteer, Citizen)
2. `disasters` (Natural disaster classification & damage telemetry)
3. `relief_centres` (Storage facilities, locations, depot managers)
4. `inventory` (Food, water, medicine, shelter stocks with non-negative constraints)
5. `emergency_requests` (Citizen triage claims with coordinates & priority scores)
6. `vehicles` (Fleet assets: trucks, 4x4s, ambulances, heavy drones)
7. `allocations` (Allocation run outcomes, fairness metrics, approval signatures)
8. `allocation_items` (Per-site supply distributions)
9. `deliveries` (Last-mile transit timeline & cargo manifests)
10. `road_conditions` (Hazard telemetry: landslides, floods, road blocks)
11. `activity_logs` (Immutable operational audit log stream)

---

## 8. Resetting Demo State

To restore all databases back to pristine demonstration state at any time:
- Click the **Reset Demo** button in the top navigation bar, or
- Navigate to **Settings** -> **Reset All Demo Data**, or
- Send `POST /api/system/reset-demo`.
#   R e l i e f - R o u t e -  
 