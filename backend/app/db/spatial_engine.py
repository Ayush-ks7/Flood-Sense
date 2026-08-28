import os
import json
import time
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
from shapely.geometry import shape, Point, Polygon, MultiPolygon, LineString, MultiLineString
from shapely.strtree import STRtree
from backend.app.core.config import settings

class SpatialEngine:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(SpatialEngine, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def initialize(self):
        if self._initialized:
            return

        print("[SpatialEngine] Initializing Spatial Data and STRtree C-Index...")
        t0 = time.time()

        # Load Infrastructure
        self.infra_geoms: List[Any] = []
        self.infra_props: List[Dict[str, Any]] = []
        if os.path.exists(settings.INFRA_GEOJSON_PATH):
            with open(settings.INFRA_GEOJSON_PATH, 'r', encoding='utf-8') as f:
                infra_data = json.load(f)
            for feat in infra_data.get('features', []):
                try:
                    g = shape(feat['geometry'])
                    if g.is_valid and not g.is_empty:
                        self.infra_geoms.append(g)
                        self.infra_props.append(feat.get('properties', {}))
                except Exception:
                    continue

        # Load Roads
        self.roads_geoms: List[Any] = []
        self.roads_props: List[Dict[str, Any]] = []
        if os.path.exists(settings.ROADS_GEOJSON_PATH):
            with open(settings.ROADS_GEOJSON_PATH, 'r', encoding='utf-8') as f:
                roads_data = json.load(f)
            for feat in roads_data.get('features', []):
                try:
                    g = shape(feat['geometry'])
                    if g.is_valid and not g.is_empty:
                        self.roads_geoms.append(g)
                        self.roads_props.append(feat.get('properties', {}))
                except Exception:
                    continue

        # Build STRtrees
        if self.infra_geoms:
            self.infra_tree = STRtree(self.infra_geoms)
        else:
            self.infra_tree = None

        if self.roads_geoms:
            self.roads_tree = STRtree(self.roads_geoms)
        else:
            self.roads_tree = None

        # Load River Network GeoJSON for map display
        self.river_geojson = {"type": "FeatureCollection", "features": []}
        if os.path.exists(settings.RIVER_GEOJSON_PATH):
            with open(settings.RIVER_GEOJSON_PATH, 'r', encoding='utf-8') as f:
                self.river_geojson = json.load(f)

        elapsed = round((time.time() - t0), 2)
        print(f"[SpatialEngine] Ready! {len(self.infra_geoms):,} infrastructure & {len(self.roads_geoms):,} roads indexed in {elapsed}s.")
        self._initialized = True

    def query_flood_impact(self, flood_polygon: Polygon) -> Dict[str, Any]:
        """
        Executes point-in-polygon & spatial intersection queries against all infrastructure
        and road assets in the Melli corridor.
        """
        if not self._initialized:
            self.initialize()

        if flood_polygon is None or flood_polygon.is_empty:
            return {
                "threatened_buildings_count": 0,
                "threatened_roads_km": 0.0,
                "threatened_nh10_km": 0.0,
                "hospitals_at_risk": 0,
                "schools_at_risk": 0,
                "bridges_at_risk": 0,
                "shelters_at_risk": 0,
                "critical_assets_list": []
            }

        t0 = time.time()

        # 1. Query Infrastructure
        infra_hits = []
        if self.infra_tree is not None:
            infra_indices = self.infra_tree.query(flood_polygon, predicate='intersects')
            infra_hits = [self.infra_props[i] for i in infra_indices]

        # 2. Query Roads
        roads_hits = []
        threatened_roads_km = 0.0
        threatened_nh10_km = 0.0

        if self.roads_tree is not None:
            road_indices = self.roads_tree.query(flood_polygon, predicate='intersects')
            for idx in road_indices:
                r_geom = self.roads_geoms[idx]
                r_prop = self.roads_props[idx]
                roads_hits.append(r_prop)

                # Compute intersected length (approximate deg -> km at ~27N lat: 1 deg lon ~ 99km, 1 deg lat ~ 111km)
                try:
                    inter = r_geom.intersection(flood_polygon)
                    if not inter.is_empty:
                        # 0.01 deg is roughly 1.05 km
                        length_km = inter.length * 105.0
                        threatened_roads_km += length_km
                        ref = str(r_prop.get('ref', '')).upper()
                        name = str(r_prop.get('name', '')).upper()
                        if 'NH10' in ref or 'NH-10' in ref or 'NH31A' in ref or 'NH10' in name or 'HIGHWAY' in name:
                            threatened_nh10_km += length_km
                except Exception:
                    pass

        # 3. Categorize Critical Infrastructure
        hospitals = 0
        schools = 0
        bridges = 0
        shelters = 0
        critical_list = []

        for p in infra_hits:
            amenity = str(p.get('amenity', '')).lower()
            building = str(p.get('building', '')).lower()
            name = p.get('name', 'Unnamed Facility')

            if 'hospital' in amenity or 'clinic' in amenity or 'health' in amenity:
                hospitals += 1
                critical_list.append({"name": name, "type": "Healthcare", "amenity": amenity})
            elif 'school' in amenity or 'college' in amenity or 'kindergarten' in amenity:
                schools += 1
                critical_list.append({"name": name, "type": "Educational", "amenity": amenity})
            elif 'bridge' in building or 'bridge' in p:
                bridges += 1
                critical_list.append({"name": name, "type": "Bridge / Crossing", "amenity": "Bridge"})
            elif 'shelter' in amenity or 'community_centre' in amenity:
                shelters += 1
                critical_list.append({"name": name, "type": "Emergency Shelter", "amenity": amenity})

        # 4. Attempt Direct Supabase PostGIS Query if Database URL is active
        postgis_executed = False
        if settings.DATABASE_URL:
            try:
                import psycopg2
                poly_json = json.dumps(mapping(flood_polygon))
                conn = psycopg2.connect(settings.DATABASE_URL, connect_timeout=3)
                cur = conn.cursor()
                
                # Query building intersections
                cur.execute("SELECT COUNT(*) FROM osm_buildings WHERE ST_Intersects(geom, ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326));", (poly_json,))
                bldg_count = cur.fetchone()[0]
                
                # Query critical infrastructure
                cur.execute("SELECT COUNT(*), COUNT(*) FILTER (WHERE infra_type = 'hospital'), COUNT(*) FILTER (WHERE infra_type = 'bridge') FROM osm_critical_infra WHERE ST_Intersects(geom, ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326));", (poly_json,))
                crit_row = cur.fetchone()
                
                cur.close()
                conn.close()
                
                # Update with verified PostGIS counts
                infra_count = bldg_count if bldg_count > 0 else len(infra_hits)
                hospitals = crit_row[1] if crit_row else hospitals
                bridges = crit_row[2] if crit_row else bridges
                postgis_executed = True
            except Exception as e:
                pass

        query_ms = round((time.time() - t0) * 1000, 2)

        return {
            "query_time_ms": query_ms,
            "engine": "SUPABASE_POSTGIS" if postgis_executed else "IN_MEMORY_STRTREE",
            "threatened_buildings_count": len(infra_hits),
            "threatened_roads_km": round(threatened_roads_km, 2),
            "threatened_nh10_km": round(threatened_nh10_km, 2),
            "hospitals_at_risk": hospitals,
            "schools_at_risk": schools,
            "bridges_at_risk": bridges,
            "shelters_at_risk": shelters,
            "critical_assets_list": critical_list[:15] # Top 15 highlights
        }

spatial_engine = SpatialEngine()
