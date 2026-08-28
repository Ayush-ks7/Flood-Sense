import time
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from shapely.geometry import Point, MultiPoint, Polygon, MultiPolygon, mapping
from shapely.ops import unary_union

class PolygonGenerator:
    @staticmethod
    def generate_flood_polygons(grid: pd.DataFrame, prob_threshold: float = 0.50) -> Tuple[Dict[str, Any], Polygon]:
        """
        Converts high-probability flood risk cells into smoothed GeoJSON Flood Inundation Polygons.
        Returns:
            geojson_dict: GeoJSON FeatureCollection of flood polygons
            unified_shapely_geom: Unified Shapely Polygon/MultiPolygon for spatial query intersection
        """
        t0 = time.time()
        high_risk = grid[grid['flood_probability'] >= prob_threshold]

        if len(high_risk) == 0:
            empty_geojson = {"type": "FeatureCollection", "features": []}
            return empty_geojson, Polygon()

        # Build buffered circle around each high risk cell (30m cell ~ 0.00035 deg radius)
        # To make it fast, sample or cluster points
        pts = [Point(lon, lat).buffer(0.00045, resolution=4) for lon, lat in zip(high_risk['longitude'], high_risk['latitude'])]
        
        # Merge into unified continuous flood extent polygon
        unified_geom = unary_union(pts)
        
        # Simplify geometry slightly to ensure fast browser vector rendering (< 200KB GeoJSON)
        if not unified_geom.is_empty:
            simplified_geom = unified_geom.simplify(0.0001, preserve_topology=True)
        else:
            simplified_geom = unified_geom

        # Convert to GeoJSON Feature
        feature = {
            "type": "Feature",
            "geometry": mapping(simplified_geom),
            "properties": {
                "risk_level": "HIGH_FLOOD_HAZARD",
                "probability_threshold": prob_threshold,
                "inundated_cells_count": int(len(high_risk)),
                "inundated_area_sqkm": round(len(high_risk) * 0.0009, 2), # 30m x 30m = 900m2 = 0.0009 km2
                "mean_probability": round(float(high_risk['flood_probability'].mean()), 3),
                "generation_time_ms": round((time.time() - t0) * 1000, 2)
            }
        }

        geojson_out = {
            "type": "FeatureCollection",
            "features": [feature]
        }

        return geojson_out, simplified_geom

    @staticmethod
    def generate_risk_heatmap_points(grid: pd.DataFrame, max_points: int = 500) -> Dict[str, Any]:
        """
        Returns sampled GeoJSON Points with probability and geomorphic attributes
        for Mapbox heatmap & click-to-inspect popups.
        """
        risky = grid[grid['flood_probability'] >= 0.25].copy()
        if len(risky) > max_points:
            # Stratified sample favoring highest risk
            risky = pd.concat([
                risky[risky['flood_probability'] >= 0.50],
                risky[risky['flood_probability'] < 0.50].sample(min(max_points // 2, len(risky[risky['flood_probability'] < 0.50])), random_state=42)
            ]).drop_duplicates()
            if len(risky) > max_points:
                risky = risky.sample(max_points, random_state=42)

        features = []
        for _, row in risky.iterrows():
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [round(float(row['longitude']), 4), round(float(row['latitude']), 4)]
                },
                "properties": {
                    "prob": round(float(row['flood_probability']), 3),
                    "hand_m": round(float(row.get('hand_m', 0.0)), 1),
                    "elev_m": round(float(row.get('elevation_m', 0.0)), 1),
                    "slope_deg": round(float(row.get('slope_deg', 0.0)), 1)
                }
            })

        return {
            "type": "FeatureCollection",
            "features": features
        }

polygon_generator = PolygonGenerator()
