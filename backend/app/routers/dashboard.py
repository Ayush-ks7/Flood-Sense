from fastapi import APIRouter
from backend.app.services.scheduler import telemetry_scheduler
from backend.app.services.exposure_analyzer import exposure_analyzer
from backend.app.services.live_telemetry_service import live_telemetry_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/live")
def get_live_dashboard():
    """
    Returns the real-time Official Response Dashboard payload:
    - 4 Top KPI Cards (Affected Population, High Risk Zones, Rescue Teams, Shelter Occupancy)
    - Real-time CWC Telemetry
    - Multi-Tier Alert Guidance (NORMAL, WATCH, ALERT, WARNING)
    - Hydrograph (+6h, +12h, +24h P10/P50/P90)
    - Active Incidents Stream
    - Threatened Infrastructure & Roads Summary
    """
    return telemetry_scheduler.get_latest_cached_state()

@router.post("/refresh")
def force_refresh_telemetry():
    """Manually forces a live telemetry fetch and model re-inference."""
    state = exposure_analyzer.evaluate_live_situation()
    telemetry_scheduler.latest_cache = state
    return state

@router.post("/step-replay")
def step_telemetry_forward():
    """Advances live telemetry stream by 1 hour to observe real flood wave progression."""
    live_telemetry_service.step_forward()
    state = exposure_analyzer.evaluate_live_situation()
    telemetry_scheduler.latest_cache = state
    return state
