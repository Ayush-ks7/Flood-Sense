from fastapi import APIRouter
from backend.app.services.scheduler import telemetry_scheduler
from backend.app.core.config import settings

router = APIRouter(prefix="/forecast", tags=["Forecast"])

@router.get("")
def get_hydrograph_forecast():
    """
    Returns the real-time hydrograph forecast including:
    - 72-hour historical water level sequence
    - Multi-horizon forecasts (+6h, +12h, +24h)
    - P10 / P50 / P90 non-crossing prediction intervals
    - CWC Station Thresholds (Warning: 226m, Danger: 227m, HFL: 228m)
    """
    state = telemetry_scheduler.get_latest_cached_state()
    return {
        "cwc_station": "024-MBDNG (Melli)",
        "current_water_level_m": state['telemetry']['melli_water_level_m'],
        "rate_of_rise_1h": state['telemetry']['melli_rise_1h'],
        "thresholds": {
            "warning_level_m": settings.WARNING_LEVEL_M,
            "danger_level_m": settings.DANGER_LEVEL_M,
            "high_flood_level_m": settings.HIGH_FLOOD_LEVEL_M
        },
        "history_72h": state['history_hydrograph'],
        "forecast_horizons": state['forecast']
    }
