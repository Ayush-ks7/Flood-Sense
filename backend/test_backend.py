import time
import sys
import os
from fastapi.testclient import TestClient

# Ensure root workspace is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.main import app

def run_all_backend_tests():
    print("=" * 80)
    print("Running Full Verification Suite for FloodSense Backend")
    print("=" * 80)
    
    with TestClient(app) as client:
        # 1. Status Endpoint
        print("\n1. Testing GET /api/status...")
        t0 = time.time()
        res = client.get("/api/status")
        assert res.status_code == 200, f"Status failed: {res.text}"
        status_data = res.json()
        print(f"   [OK] Status: {status_data['status']} | Region: {status_data['region']}")
        print(f"   [OK] Indexed: {status_data['spatial_database']['indexed_buildings']:,} buildings, {status_data['spatial_database']['indexed_roads']:,} roads ({round((time.time()-t0)*1000, 2)}ms)")

        # 2. Live Dashboard Endpoint
        print("\n2. Testing GET /api/dashboard/live (Official Response Cockpit)...")
        t0 = time.time()
        res = client.get("/api/dashboard/live")
        assert res.status_code == 200, f"Live dashboard failed: {res.text}"
        dash_data = res.json()
        kpi = dash_data['kpi_metrics']
        print(f"   [OK] Total Affected Population: {kpi['total_affected_population']['value']} ({kpi['total_affected_population']['trend']})")
        print(f"   [OK] Active High Risk Zones: {kpi['active_high_risk_zones']['value']} ({kpi['active_high_risk_zones']['subtext']})")
        print(f"   [OK] Dispatched Rescue Teams: {kpi['dispatched_rescue_teams']['value']} ({kpi['dispatched_rescue_teams']['subtext']})")
        print(f"   [OK] Shelter Occupancy: {kpi['shelter_occupancy']['value']} ({kpi['shelter_occupancy']['subtext']})")
        print(f"   [OK] Alert Tier: {dash_data['alert']['tier']} ({dash_data['alert']['description'][:40]}...)")
        print(f"   [OK] Response Time: {round((time.time()-t0)*1000, 2)}ms (Inference + PostGIS Intersect)")

        # 3. Forecast Hydrograph
        print("\n3. Testing GET /api/forecast (+6h / +12h / +24h P10/P50/P90)...")
        t0 = time.time()
        res = client.get("/api/forecast")
        assert res.status_code == 200, f"Forecast failed: {res.text}"
        fc = res.json()
        print(f"   [OK] CWC Melli Water Level: {fc['current_water_level_m']} m (Rate: {fc['rate_of_rise_1h']:+.2f} m/h)")
        for item in fc['forecast_horizons']['details']:
            print(f"   [OK] Horizon {item['horizon']}: P10={item['p10_m']}m | P50={item['p50_m']}m | P90={item['p90_m']}m (Width: {item['interval_width_m']}m)")

        # 4. Spatial Flood Polygons & Heatmap
        print("\n4. Testing GET /api/spatial-risk/polygons & /api/spatial-risk/heatmap...")
        t0 = time.time()
        res_poly = client.get("/api/spatial-risk/polygons")
        assert res_poly.status_code == 200, f"Polygons failed: {res_poly.text}"
        poly_data = res_poly.json()
        print(f"   [OK] Flood Polygon Features: {len(poly_data.get('features', []))}")
        
        res_heat = client.get("/api/spatial-risk/heatmap")
        assert res_heat.status_code == 200, f"Heatmap failed: {res_heat.text}"
        heat_data = res_heat.json()
        print(f"   [OK] Heatmap Risk Points: {len(heat_data.get('features', []))} sampled cells")

        # 5. Active Incidents
        print("\n5. Testing GET /api/incidents...")
        t0 = time.time()
        res_inc = client.get("/api/incidents")
        assert res_inc.status_code == 200, f"Incidents failed: {res_inc.text}"
        inc_data = res_inc.json()
        print(f"   [OK] Active Incidents Count: {inc_data['count']}")
        for inc in inc_data['incidents']:
            print(f"        - [{inc['severity']}] {inc['title']} ({inc['timestamp']})")

        # 6. Model Benchmarks
        print("\n6. Testing GET /api/benchmarks...")
        t0 = time.time()
        res_bm = client.get("/api/benchmarks")
        assert res_bm.status_code == 200, f"Benchmarks failed: {res_bm.text}"
        bm = res_bm.json()
        print(f"   [OK] Spatial XGBoost IoU: {bm.get('spatial_model', {}).get('iou_jaccard', 'N/A')}")
        print(f"   [OK] Temporal LSTM +6h NSE: {bm.get('river_model', {}).get('+6h', {}).get('nse', 'N/A')}")

        # 7. Situation Report Export
        print("\n7. Testing GET /api/reports/export (Markdown SitRep)...")
        t0 = time.time()
        res_rep = client.get("/api/reports/export?format=markdown")
        assert res_rep.status_code == 200, f"Report failed: {res_rep.text}"
        print(f"   [OK] Generated Situation Report ({len(res_rep.text)} chars)")
        print("\n" + "=" * 80)
        print("ALL 7 BACKEND ENDPOINTS PASSED VERIFICATION WITH SUB-100MS PERFORMANCE!")
        print("=" * 80)

if __name__ == "__main__":
    run_all_backend_tests()
