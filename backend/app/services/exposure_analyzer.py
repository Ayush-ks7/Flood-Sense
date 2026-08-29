import time
import datetime
from typing import Dict, Any, List
from backend.app.core.config import settings
from backend.app.db.spatial_engine import spatial_engine
from backend.app.services.live_telemetry_service import live_telemetry_service
from backend.app.services.inference_engine import inference_engine
from backend.app.services.polygon_generator import polygon_generator

class ExposureAnalyzer:
    @staticmethod
    def evaluate_live_situation(simulation: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        End-to-end evaluation of the live situation driven entirely by real data feeds:
        1. Ingests current real telemetry
        2. Runs 72h LSTM temporal forecast with P10/P50/P90 prediction intervals
        3. Runs 83k-cell Spatial XGBoost model
        4. Synthesizes Flood Inundation Polygon
        5. Executes PostGIS / STRtree Point-in-Polygon intersection queries
        6. Generates the 4 Official Response Dashboard KPI cards and Active Incident stream!
        """
        t0 = time.time()

        # 1. Telemetry
        telemetry = live_telemetry_service.get_latest_reading().copy()
        if simulation:
            # Scenarios use the deployed forecast and spatial models, without
            # changing the live telemetry stream.
            telemetry.update(simulation["telemetry"])
            telemetry["data_source"] = "MODEL_SIMULATION_SCENARIO"
            telemetry["data_mode"] = "SIMULATION"
        current_wl = telemetry['melli_water_level_m']
        rise_rate = telemetry['melli_rise_1h']

        # 2. 72h Temporal Forecasting (Quantile LSTM)
        seq_enhanced, history_series = live_telemetry_service.get_rolling_72h_sequence()
        if simulation:
            baseline_level = float(seq_enhanced[0, -1, 0])
            level_delta = current_wl - baseline_level
            seq_enhanced[0, :, 0] += level_delta
            seq_enhanced[0, :, 1] = telemetry['melli_rise_1h']
            seq_enhanced[0, :, 4] = telemetry['rain_prev_1d'] / 2.0
            seq_enhanced[0, :, 5] = telemetry['rain_prev_1d']
            seq_enhanced[0, :, 6] = telemetry['rain_prev_1d']
            seq_enhanced[0, :, 7] = telemetry['rain_prev_3d']
            seq_enhanced[0, :, 8] = telemetry['rain_prev_7d']
            seq_enhanced[0, :, 9] = (0.5 * seq_enhanced[0, :, 6] + 0.3 * seq_enhanced[0, :, 7] + 0.2 * seq_enhanced[0, :, 8])
            history_series = [{**point, "water_level_m": round(point["water_level_m"] + level_delta, 2)} for point in history_series]
        forecast = inference_engine.run_temporal_forecast(seq_enhanced, current_wl)

        # 3. Spatial Hazard Inference (Spatial XGBoost)
        grid, spatial_time_ms = inference_engine.run_spatial_inference(telemetry)

        # 4. Generate Flood Polygon
        flood_geojson, flood_poly = polygon_generator.generate_flood_polygons(grid, prob_threshold=0.50)
        heatmap_points = polygon_generator.generate_risk_heatmap_points(grid, max_points=400)

        # 5. Spatial Intersect Query against 59.6k OSM Infrastructure & Roads
        impact = spatial_engine.query_flood_impact(flood_poly)

        # 6. Multi-tier alert determination from forecast thresholds only.
        max_p90 = float(max(forecast['p90']))
        high_risk_cells = int((grid['flood_probability'] >= 0.50).sum())
        critical_risk_cells = int((grid['flood_probability'] >= 0.80).sum())
        critical_assets = sum(
            impact[key]
            for key in ('hospitals_at_risk', 'schools_at_risk', 'bridges_at_risk', 'shelters_at_risk')
        )

        if max_p90 >= settings.DANGER_LEVEL_M or current_wl >= settings.DANGER_LEVEL_M:
            tier = "WARNING"
            tier_color = "#ef4444"
        elif max_p90 >= settings.WARNING_LEVEL_M or current_wl >= settings.WARNING_LEVEL_M:
            tier = "ALERT"
            tier_color = "#f97316"
        elif telemetry['rain_prev_3d'] >= 100.0 or max_p90 >= 224.5:
            tier = "WATCH"
            tier_color = "#eab308"
        else:
            tier = "NORMAL"
            tier_color = "#22c55e"
        tier_desc = (
            f"Model-derived {tier.lower()} condition: current gauge {current_wl:.2f} m; "
            f"maximum P90 forecast {max_p90:.2f} m."
        )

        # 7. Place markers only at the highest-probability XGBoost grid cells.
        # No operational incidents, locations, timestamps, or response actions are fabricated.
        hotspots = grid[grid['flood_probability'] >= 0.25].nlargest(3, 'flood_probability')
        incidents = []
        for rank, (_, cell) in enumerate(hotspots.iterrows(), start=1):
            probability = float(cell['flood_probability'])
            severity = "CRITICAL" if probability >= 0.80 else "HIGH RISK" if probability >= 0.50 else "MODERATE RISK"
            incidents.append({
                "id": f"MODEL-HOTSPOT-{rank}",
                "title": "Model-detected flood hotspot",
                "severity": severity,
                "severity_color": "#ef4444" if probability >= 0.80 else "#f97316" if probability >= 0.50 else "#eab308",
                "location": f"Model grid cell {float(cell['latitude']):.4f}, {float(cell['longitude']):.4f}",
                "latitude": round(float(cell['latitude']), 6),
                "longitude": round(float(cell['longitude']), 6),
                "timestamp": "Current model run",
                "status": f"Spatial XGBoost probability: {probability:.1%}",
                "details": (
                    f"Elevation {float(cell['elevation_m']):.1f} m; "
                    f"HAND {float(cell['hand_m']):.1f} m; slope {float(cell['slope_deg']):.1f} degrees."
                ),
            })

        total_elapsed_ms = round((time.time() - t0) * 1000, 1)

        result = {
            "status": "SUCCESS",
            "last_updated": datetime.datetime.now().strftime("Today, %H:%M Local Time"),
            "telemetry": telemetry,
            "computation_time_ms": total_elapsed_ms,
            "kpi_metrics": {
                "total_affected_population": {
                    "value": f"{impact['threatened_buildings_count']:,}",
                    "raw_value": impact['threatened_buildings_count'],
                    "trend": "Spatial intersection output",
                    "title": "Exposed Buildings"
                },
                "active_high_risk_zones": {
                    "value": f"{high_risk_cells:,}",
                    "raw_value": high_risk_cells,
                    "subtext": f"{critical_risk_cells:,} cells at critical probability (>=80%)",
                    "title": "High-risk Model Cells"
                },
                "dispatched_rescue_teams": {
                    "value": f"{max_p90:.2f} m",
                    "raw_value": max_p90,
                    "subtext": "Maximum temporal-model P90 forecast",
                    "title": "Forecast Peak (P90)"
                },
                "shelter_occupancy": {
                    "value": str(critical_assets),
                    "raw_value": critical_assets,
                    "subtext": "Assets intersecting model flood geometry",
                    "title": "Critical Assets at Risk"
                }
            },
            "alert": {
                "tier": tier,
                "color": tier_color,
                "description": tier_desc,
                "current_water_level_m": current_wl,
                "warning_level_m": settings.WARNING_LEVEL_M,
                "danger_level_m": settings.DANGER_LEVEL_M,
                "high_flood_level_m": settings.HIGH_FLOOD_LEVEL_M
            },
            "forecast": forecast,
            "history_hydrograph": history_series,
            "spatial_impact": impact,
            "flood_polygon_geojson": flood_geojson,
            "risk_heatmap_geojson": heatmap_points,
            "active_incidents": incidents
        }

        if simulation:
            result["simulation"] = {
                "active": True,
                "id": simulation["id"],
                "name": simulation["name"],
                "description": simulation["description"],
                "assumptions": simulation["assumptions"],
            }
        return result

exposure_analyzer = ExposureAnalyzer()
