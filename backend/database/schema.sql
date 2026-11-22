-- =============================================================================
-- RELIEFROUTE: AI-Driven Disaster Resource Allocation & Logistics System
-- Database Schema: PostgreSQL 14+ with PostGIS Extension
-- =============================================================================

-- Enable PostGIS if available in the PostgreSQL instance
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Users & Authentication
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('ADMINISTRATOR', 'VOLUNTEER', 'CITIZEN')),
    phone VARCHAR(20),
    organization VARCHAR(100),
    assigned_centre_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Disaster Incidents
CREATE TABLE IF NOT EXISTS disasters (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    disaster_type VARCHAR(50) NOT NULL CHECK (disaster_type IN ('Flood', 'Earthquake', 'Landslide', 'Cyclone', 'Forest Fire')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    status VARCHAR(30) NOT NULL CHECK (status IN ('ACTIVE', 'CONTAINED', 'RESOLVED', 'MONITORING')),
    location_name VARCHAR(150) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    affected_population INTEGER DEFAULT 0,
    estimated_damage_inr BIGINT DEFAULT 0,
    description TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Relief Centres
CREATE TABLE IF NOT EXISTS relief_centres (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    code VARCHAR(30) UNIQUE NOT NULL,
    location_name VARCHAR(150) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    contact_person VARCHAR(100),
    contact_phone VARCHAR(20),
    storage_capacity_sqm INTEGER DEFAULT 1000,
    operational_status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (operational_status IN ('ACTIVE', 'CONGESTED', 'OFFLINE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Relief Centre Inventory
CREATE TABLE IF NOT EXISTS inventory (
    id VARCHAR(50) PRIMARY KEY,
    centre_id VARCHAR(50) REFERENCES relief_centres(id) ON DELETE CASCADE,
    food_packets INTEGER NOT NULL DEFAULT 0 CHECK (food_packets >= 0),
    water_litres INTEGER NOT NULL DEFAULT 0 CHECK (water_litres >= 0),
    medical_kits INTEGER NOT NULL DEFAULT 0 CHECK (medical_kits >= 0),
    shelter_kits INTEGER NOT NULL DEFAULT 0 CHECK (shelter_kits >= 0),
    last_replenished_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Emergency Requests
CREATE TABLE IF NOT EXISTS emergency_requests (
    id VARCHAR(50) PRIMARY KEY,
    disaster_id VARCHAR(50) REFERENCES disasters(id) ON DELETE SET NULL,
    reporter_name VARCHAR(100) NOT NULL,
    reporter_contact VARCHAR(30),
    affected_location VARCHAR(150) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    affected_population INTEGER NOT NULL CHECK (affected_population > 0),
    severity_level VARCHAR(20) NOT NULL CHECK (severity_level IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    medical_urgency VARCHAR(20) NOT NULL CHECK (medical_urgency IN ('CRITICAL', 'HIGH', 'MODERATE', 'LOW')),
    accessibility_difficulty VARCHAR(20) NOT NULL CHECK (accessibility_difficulty IN ('EXTREME', 'HARD', 'MODERATE', 'EASY')),
    food_needed INTEGER DEFAULT 0,
    water_needed INTEGER DEFAULT 0,
    medicines_needed INTEGER DEFAULT 0,
    shelter_needed INTEGER DEFAULT 0,
    description TEXT,
    priority_score DECIMAL(5, 2) DEFAULT 0.0,
    priority_category VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority_category IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    verification_status VARCHAR(30) DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    rejection_reason TEXT,
    verified_by VARCHAR(50) REFERENCES users(id),
    status VARCHAR(30) DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'VERIFIED', 'ALLOCATED', 'DISPATCHED', 'DELIVERED', 'REJECTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Emergency Vehicles
CREATE TABLE IF NOT EXISTS vehicles (
    id VARCHAR(50) PRIMARY KEY,
    assigned_centre_id VARCHAR(50) REFERENCES relief_centres(id),
    vehicle_number VARCHAR(30) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL CHECK (vehicle_type IN ('Heavy Truck', '4x4 Off-Road', 'Medical Ambulance', 'Logistics Van', 'Heavy Drone')),
    capacity_kg INTEGER NOT NULL DEFAULT 2000,
    fuel_level_percent INTEGER DEFAULT 100,
    status VARCHAR(30) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'DISPATCHED', 'IN_TRANSIT', 'MAINTENANCE')),
    current_latitude DECIMAL(10, 6),
    current_longitude DECIMAL(10, 6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Resource Allocations & Runs
CREATE TABLE IF NOT EXISTS allocations (
    id VARCHAR(50) PRIMARY KEY,
    run_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    strategy VARCHAR(50) NOT NULL CHECK (strategy IN ('EQUAL_DISTRIBUTION', 'NEAREST_CENTRE', 'FAIRNESS_OPTIMIZED')),
    total_food_allocated INTEGER DEFAULT 0,
    total_water_allocated INTEGER DEFAULT 0,
    total_medical_allocated INTEGER DEFAULT 0,
    total_shelter_allocated INTEGER DEFAULT 0,
    demand_fulfillment_pct DECIMAL(5, 2) DEFAULT 0.0,
    unmet_critical_demand INTEGER DEFAULT 0,
    fairness_index DECIMAL(4, 3) DEFAULT 0.0,
    approved_by VARCHAR(50) REFERENCES users(id),
    approval_status VARCHAR(20) DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- 8. Allocation Items (Per-Request distribution breakdown)
CREATE TABLE IF NOT EXISTS allocation_items (
    id VARCHAR(50) PRIMARY KEY,
    allocation_id VARCHAR(50) REFERENCES allocations(id) ON DELETE CASCADE,
    request_id VARCHAR(50) REFERENCES emergency_requests(id),
    centre_id VARCHAR(50) REFERENCES relief_centres(id),
    allocated_food INTEGER DEFAULT 0,
    allocated_water INTEGER DEFAULT 0,
    allocated_medical INTEGER DEFAULT 0,
    allocated_shelter INTEGER DEFAULT 0,
    fulfillment_ratio DECIMAL(5, 2) DEFAULT 0.0
);

-- 9. Delivery Dispatches
CREATE TABLE IF NOT EXISTS deliveries (
    id VARCHAR(50) PRIMARY KEY,
    allocation_id VARCHAR(50) REFERENCES allocations(id),
    request_id VARCHAR(50) REFERENCES emergency_requests(id),
    vehicle_id VARCHAR(50) REFERENCES vehicles(id),
    centre_id VARCHAR(50) REFERENCES relief_centres(id),
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'FAILED')),
    cargo_summary JSONB,
    estimated_distance_km DECIMAL(6, 2),
    estimated_duration_min INTEGER,
    dispatched_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    status_notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Road Conditions & Obstacles
CREATE TABLE IF NOT EXISTS road_conditions (
    id VARCHAR(50) PRIMARY KEY,
    road_name VARCHAR(150) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('BLOCKED', 'HAZARDOUS', 'RESTRICTED', 'CLEAR')),
    condition_type VARCHAR(50) NOT NULL CHECK (condition_type IN ('Landslide', 'Flooding', 'Bridge Damage', 'Snow/Ice', 'Active Repair')),
    reported_by VARCHAR(100),
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Activity Audit Logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high-performance querying
CREATE INDEX IF NOT EXISTS idx_requests_status ON emergency_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_priority ON emergency_requests(priority_category);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_inventory_centre ON inventory(centre_id);
