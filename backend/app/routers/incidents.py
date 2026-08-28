from fastapi import APIRouter
from backend.app.services.scheduler import telemetry_scheduler

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.get("")
def get_active_incidents():
    """
    Returns active flood incidents, road submergence notices, and rescue operations status
    for the Melli - Teesta River corridor.
    """
    state = telemetry_scheduler.get_latest_cached_state()
    return {
        "count": len(state.get('active_incidents', [])),
        "last_updated": state.get('last_updated'),
        "incidents": state.get('active_incidents', [])
    }
