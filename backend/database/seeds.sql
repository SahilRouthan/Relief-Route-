-- =============================================================================
-- RELIEFROUTE: Seed Data Script for PostgreSQL & PostGIS
-- Region: Uttarakhand, India (Simulated Scenarios)
-- =============================================================================

INSERT INTO users (id, name, email, password_hash, role, phone, organization)
VALUES
('usr-admin-01', 'Dr. Rajeshwar Sharma', 'admin@reliefroute.gov.in', 'demo_hash_admin', 'ADMINISTRATOR', '+91-98765-43210', 'Uttarakhand State Disaster Management Authority'),
('usr-vol-01', 'Sunita Rawat', 'volunteer@reliefroute.gov.in', 'demo_hash_vol', 'VOLUNTEER', '+91-98111-22334', 'Garhwal Quick Response Volunteer Corps'),
('usr-cit-01', 'Anand Mohan Joshi', 'citizen@reliefroute.gov.in', 'demo_hash_cit', 'CITIZEN', '+91-94120-77889', 'Joshimath Ward-4 Resident Association')
ON CONFLICT (id) DO NOTHING;

INSERT INTO disasters (id, title, disaster_type, severity, status, location_name, latitude, longitude, affected_population, estimated_damage_inr, description)
VALUES
('dis-01', 'Alaknanda River Flash Flood & Silt Surge', 'Flood', 'CRITICAL', 'ACTIVE', 'Chamoli & Rudraprayag Basin, Uttarakhand', 30.3842, 79.3174, 14200, 125000000, 'Extreme cloudburst triggered rapid flash flooding along Alaknanda tributary, submerging low-lying riverside hamlets.'),
('dis-02', 'Joshimath Slope Failure & Fissure Subsidence', 'Landslide', 'CRITICAL', 'ACTIVE', 'Upper Helang & Manohar Bagh, Joshimath', 30.5564, 79.5661, 6800, 85000000, 'Progressive structural settlement causing ground fissures across 4 municipal wards; 320 residential structures evacuated.'),
('dis-03', 'Rishikesh-Tapovan Urban Flash Inundation', 'Flood', 'HIGH', 'ACTIVE', 'Tapovan & Muni Ki Reti, Rishikesh', 30.0869, 78.2676, 9500, 45000000, '180mm torrential downpour overwhelmed storm drains, trapping tourists and pilgrims in lower riverbank settlements.'),
('dis-04', 'Pithoragarh Border Valley Debris Inflow', 'Landslide', 'HIGH', 'ACTIVE', 'Dharchula Corridor, Pithoragarh', 29.8488, 80.5369, 4100, 32000000, 'Major mountain slope slippage severed road links, leaving 5 highland villages isolated without potable pipeline water.'),
('dis-05', 'Haridwar Riverbank High-Water Alert', 'Flood', 'MEDIUM', 'MONITORING', 'Ghats & Bairagi Camp, Haridwar', 29.9457, 78.1642, 7500, 15000000, 'Ganga water level hovering 0.4m above warning level; 6 temporary pilgrimage camps relocated to highland shelters.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO relief_centres (id, name, code, location_name, latitude, longitude, contact_person, contact_phone, storage_capacity_sqm, operational_status)
VALUES
('rc-01', 'Dehradun Central Disaster Logistics Depot', 'DED-HQ-01', 'ISBT Transport Nagar, Dehradun', 30.3165, 78.0322, 'Col. V.K. Negi', '+91-135-2718820', 8000, 'ACTIVE'),
('rc-02', 'Rishikesh Emergency Staging Hub', 'RSH-STG-02', 'AIIMS Bypass Road, Rishikesh', 30.0869, 78.2676, 'Dr. Meenakshi Bhatt', '+91-135-2462910', 4500, 'ACTIVE'),
('rc-03', 'Joshimath High-Altitude Forward Base', 'JSH-FWD-03', 'Army Cantonment Transit Ground, Joshimath', 30.5564, 79.5661, 'Capt. R.P. Semwal', '+91-138-9222140', 2500, 'ACTIVE'),
('rc-04', 'Srinagar Garhwal Medical & Food Stockpile', 'SNG-LOG-04', 'Srinagar Valley Industrial Area', 30.2226, 78.7846, 'Mr. Arvind Bhandari', '+91-134-6252011', 3800, 'ACTIVE'),
('rc-05', 'Haridwar South Relief Distribution Centre', 'HDW-DIS-05', 'BHEL Complex, Haridwar', 29.9457, 78.1642, 'Ms. Kavita Sundaram', '+91-133-4281900', 5000, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO inventory (id, centre_id, food_packets, water_litres, medical_kits, shelter_kits)
VALUES
('inv-01', 'rc-01', 6500, 12000, 1400, 450),
('inv-02', 'rc-02', 4200, 7500, 950, 320),
('inv-03', 'rc-03', 2100, 3800, 520, 280),
('inv-04', 'rc-04', 3400, 5900, 680, 210),
('inv-05', 'rc-05', 5100, 9200, 820, 390)
ON CONFLICT (id) DO NOTHING;

INSERT INTO vehicles (id, assigned_centre_id, vehicle_number, vehicle_type, capacity_kg, fuel_level_percent, status, current_latitude, current_longitude)
VALUES
('veh-01', 'rc-01', 'UK-07-TR-4421', 'Heavy Truck', 8500, 92, 'AVAILABLE', 30.3165, 78.0322),
('veh-02', 'rc-02', 'UK-07-4X-8812', '4x4 Off-Road', 2800, 88, 'IN_TRANSIT', 30.1245, 78.3412),
('veh-03', 'rc-03', 'UK-11-TR-1029', '4x4 Off-Road', 2200, 75, 'DISPATCHED', 30.5210, 79.5120),
('veh-04', 'rc-02', 'UK-08-AM-9904', 'Medical Ambulance', 1200, 95, 'AVAILABLE', 30.0869, 78.2676),
('veh-05', 'rc-04', 'UK-12-HV-3310', 'Logistics Van', 3500, 82, 'AVAILABLE', 30.2226, 78.7846),
('veh-06', 'rc-01', 'UK-07-DR-01', 'Heavy Drone', 45, 100, 'AVAILABLE', 30.3165, 78.0322),
('veh-07', 'rc-05', 'UK-08-TR-5520', 'Heavy Truck', 9000, 90, 'AVAILABLE', 29.9457, 78.1642)
ON CONFLICT (id) DO NOTHING;

INSERT INTO road_conditions (id, road_name, latitude, longitude, status, condition_type, reported_by, reported_at)
VALUES
('rd-01', 'NH-58 (Badrinath Highway) near Sirobagarh Landslide Zone', 30.2520, 78.8910, 'BLOCKED', 'Landslide', 'Border Roads Organisation (BRO)', NOW()),
('rd-02', 'Joshimath-Badrinath Link Road (Km 12)', 30.5750, 79.5820, 'HAZARDOUS', 'Active Repair', 'Garhwal Volunteer Team', NOW()),
('rd-03', 'Rishikesh-Devprayag Alternate Mountain Road', 30.1450, 78.5980, 'RESTRICTED', 'Flooding', 'Uttarakhand Traffic Police', NOW()),
('rd-04', 'Dehradun to Rishikesh Four-Lane Expressway', 30.1980, 78.1820, 'CLEAR', 'Clear Highway', 'NHAI Regional Traffic Control', NOW())
ON CONFLICT (id) DO NOTHING;
