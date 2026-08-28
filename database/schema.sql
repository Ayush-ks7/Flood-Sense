-- ============================================================================
-- SERENITY / FloodGuard — Spatiotemporal Flood Risk & Early Warning Platform
-- PostGIS Spatial Database Schema for Melli & Teesta River Corridor, Sikkim
-- ============================================================================

-- 1. Enable PostGIS Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- 2. Clean Existing Tables if Re-initializing
DROP TABLE IF EXISTS simulation_logs CASCADE;
DROP TABLE IF EXISTS telemetry_history CASCADE;
DROP TABLE IF EXISTS incident_logs CASCADE;
DROP TABLE IF EXISTS spatial_grid_cells CASCADE;
DROP TABLE IF EXISTS teesta_waterways CASCADE;
DROP TABLE IF EXISTS osm_roads CASCADE;
DROP TABLE IF EXISTS osm_critical_infra CASCADE;
DROP TABLE IF EXISTS osm_buildings CASCADE;

-- 3. OpenStreetMap Building Footprints & Assets
CREATE TABLE osm_buildings (
    id BIGSERIAL PRIMARY KEY,
    osm_id BIGINT,
    osm_type VARCHAR(20),
    name VARCHAR(255),
    amenity VARCHAR(100),
    building VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    elevation_m DOUBLE PRECISION,
    hand_m DOUBLE PRECISION,
    geom GEOMETRY(Geometry, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_osm_buildings_geom ON osm_buildings USING GIST(geom);
CREATE INDEX idx_osm_buildings_amenity ON osm_buildings(amenity);
CREATE INDEX idx_osm_buildings_building ON osm_buildings(building);

-- 4. OpenStreetMap Road Network (NH-10 & Local Links)
CREATE TABLE osm_roads (
    id BIGSERIAL PRIMARY KEY,
    osm_id BIGINT,
    osm_type VARCHAR(20),
    name VARCHAR(255),
    highway VARCHAR(100),
    ref VARCHAR(50),
    length_km DOUBLE PRECISION,
    geom GEOMETRY(Geometry, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_osm_roads_geom ON osm_roads USING GIST(geom);
CREATE INDEX idx_osm_roads_highway ON osm_roads(highway);
CREATE INDEX idx_osm_roads_ref ON osm_roads(ref);

-- 5. Critical Infrastructure (Hospitals, Emergency Stations, Bridges, Schools)
CREATE TABLE osm_critical_infra (
    id BIGSERIAL PRIMARY KEY,
    osm_id BIGINT,
    name VARCHAR(255),
    infra_type VARCHAR(100), -- 'hospital', 'fire_station', 'police', 'school', 'bridge', 'shelter'
    capacity INTEGER,
    geom GEOMETRY(Geometry, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_osm_critical_infra_geom ON osm_critical_infra USING GIST(geom);
CREATE INDEX idx_osm_critical_infra_type ON osm_critical_infra(infra_type);

-- 6. River Network & Drainage Channels
CREATE TABLE teesta_waterways (
    id BIGSERIAL PRIMARY KEY,
    osm_id BIGINT,
    name VARCHAR(255),
    waterway VARCHAR(100),
    geom GEOMETRY(Geometry, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_teesta_waterways_geom ON teesta_waterways USING GIST(geom);

-- 7. High-Resolution GEE Terrain Grid (83,080 cells)
CREATE TABLE spatial_grid_cells (
    cell_id BIGINT PRIMARY KEY,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    elevation_m DOUBLE PRECISION,
    slope_deg DOUBLE PRECISION,
    aspect_deg DOUBLE PRECISION,
    hand_m DOUBLE PRECISION,
    dist_to_river_m DOUBLE PRECISION,
    upstream_area_km2 DOUBLE PRECISION,
    lulc INTEGER,
    geom GEOMETRY(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_spatial_grid_cells_geom ON spatial_grid_cells USING GIST(geom);
CREATE INDEX idx_spatial_grid_cells_hand ON spatial_grid_cells(hand_m);

-- 8. Real-Time Telemetry Time-Series History
CREATE TABLE telemetry_history (
    id BIGSERIAL PRIMARY KEY,
    station_id VARCHAR(50) NOT NULL, -- 'MELLI', 'KHANITAR'
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    water_level_m DOUBLE PRECISION,
    rainfall_1d_mm DOUBLE PRECISION,
    rainfall_3d_mm DOUBLE PRECISION,
    rainfall_7d_mm DOUBLE PRECISION,
    rate_of_rise_1h DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_telemetry_station_time ON telemetry_history(station_id, timestamp DESC);

-- 9. Active Incident & Emergency Response Logs
CREATE TABLE incident_logs (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    severity VARCHAR(50) NOT NULL, -- 'CRITICAL', 'HIGH ALERT', 'ADVISORY'
    location VARCHAR(255) NOT NULL,
    description TEXT,
    affected_population INTEGER DEFAULT 0,
    rescue_teams_dispatched INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE', 'RESOLVED', 'MONITORING'
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    geom GEOMETRY(Point, 4326)
);
CREATE INDEX idx_incident_logs_geom ON incident_logs USING GIST(geom);
CREATE INDEX idx_incident_logs_status ON incident_logs(status);

-- 10. Spatial Point-in-Polygon Query Function
CREATE OR REPLACE FUNCTION get_flood_exposure(flood_polygon_geojson TEXT)
RETURNS TABLE (
    threatened_buildings_count BIGINT,
    threatened_roads_km DOUBLE PRECISION,
    threatened_critical_count BIGINT,
    hospitals_at_risk BIGINT,
    bridges_at_risk BIGINT
) AS $$
DECLARE
    flood_geom GEOMETRY;
BEGIN
    flood_geom := ST_SetSRID(ST_GeomFromGeoJSON(flood_polygon_geojson), 4326);
    
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM osm_buildings WHERE ST_Intersects(geom, flood_geom)) AS threatened_buildings_count,
        (SELECT COALESCE(SUM(ST_Length(ST_Intersection(geom, flood_geom)::geography)/1000.0), 0.0) FROM osm_roads WHERE ST_Intersects(geom, flood_geom)) AS threatened_roads_km,
        (SELECT COUNT(*) FROM osm_critical_infra WHERE ST_Intersects(geom, flood_geom)) AS threatened_critical_count,
        (SELECT COUNT(*) FROM osm_critical_infra WHERE infra_type = 'hospital' AND ST_Intersects(geom, flood_geom)) AS hospitals_at_risk,
        (SELECT COUNT(*) FROM osm_critical_infra WHERE infra_type = 'bridge' AND ST_Intersects(geom, flood_geom)) AS bridges_at_risk;
END;
$$ LANGUAGE plpgsql;
