from fastapi import APIRouter
from backend.app.services.scheduler import telemetry_scheduler
from backend.app.db.spatial_engine import spatial_engine

router = APIRouter(prefix="/spatial-risk", tags=["Spatial Risk"])

@router.get("/polygons")
def get_flood_polygons():
    """Returns the live GeoJSON Flood Inundation Polygon synthesized from 83k-cell XGBoost."""
    state = telemetry_scheduler.get_latest_cached_state()
    return state.get('flood_polygon_geojson', {"type": "FeatureCollection", "features": []})

@router.get("/heatmap")
def get_risk_heatmap():
    """Returns sampled GeoJSON Points with flood probabilities for Mapbox heatmap visualization."""
    state = telemetry_scheduler.get_latest_cached_state()
    return state.get('risk_heatmap_geojson', {"type": "FeatureCollection", "features": []})

@router.get("/river-network")
def get_river_network():
    """Returns Teesta River vector network GeoJSON."""
    return spatial_engine.river_geojson

@router.get("/impact-summary")
def get_spatial_impact():
    """Returns point-in-polygon exposure impact on buildings, roads, and critical facilities."""
    state = telemetry_scheduler.get_latest_cached_state()
    return state.get('spatial_impact', {})
