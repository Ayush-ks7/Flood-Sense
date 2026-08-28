import datetime
from fastapi import APIRouter
from fastapi.responses import PlainTextResponse
from backend.app.services.scheduler import telemetry_scheduler
from backend.app.core.config import settings

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/export")
def export_situation_report(format: str = "json"):
    """
    Generates an official Situation Report (SitRep) for Disaster Management Authorities.
    Supports 'json' and 'markdown' formats.
    """
    state = telemetry_scheduler.get_latest_cached_state()
    tel = state['telemetry']
    kpi = state['kpi_metrics']
    alert = state['alert']
    impact = state['spatial_impact']
    forecast = state['forecast']

    if format.lower() == "markdown":
        md = f"""# SIKKIM STATE DISASTER MANAGEMENT AUTHORITY (SSDMA)
## FLOOD SITUATION REPORT (SITREP) — TEESTA RIVER CORRIDOR (MELLI)
**Report Generated**: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S IST')}
**Current Alert Status**: **{alert['tier']}** ({alert['description']})

---

### 1. Real-Time Hydrological Status (CWC Melli Station #024-MBDNG)
- **Current River Water Level**: `{tel['melli_water_level_m']} m`
- **1-Hour Trend Rate of Rise**: `{tel['melli_rise_1h']:+.2f} m/h`
- **Upstream Khanitar Water Level**: `{tel['khanitar_water_level_m']} m`
- **Catchment 24h Rainfall**: `{tel['rain_prev_1d']} mm` (3-day total: `{tel['rain_prev_3d']} mm`)
- **Hydrological Freeboard to Danger**: `{round(settings.DANGER_LEVEL_M - tel['melli_water_level_m'], 2)} m`

---

### 2. Multi-Horizon AI Hydrograph Forecast (+6h / +12h / +24h)
| Horizon | P10 Lower Bound | P50 Median Forecast | P90 Upper Bound | Prediction Interval Width |
|---|:---:|:---:|:---:|:---:|
| **+6 Hours** | `{forecast['p10'][0]} m` | `{forecast['p50'][0]} m` | `{forecast['p90'][0]} m` | `{forecast['details'][0]['interval_width_m']} m` |
| **+12 Hours** | `{forecast['p10'][1]} m` | `{forecast['p50'][1]} m` | `{forecast['p90'][1]} m` | `{forecast['details'][1]['interval_width_m']} m` |
| **+24 Hours** | `{forecast['p10'][2]} m` | `{forecast['p50'][2]} m` | `{forecast['p90'][2]} m` | `{forecast['details'][2]['interval_width_m']} m` |

---

### 3. Spatial Vulnerability & Infrastructure Exposure (PostGIS Impact Analysis)
- **Estimated Affected Population**: `{kpi['total_affected_population']['value']}` ({kpi['total_affected_population']['trend']})
- **Active High Risk Zones**: `{kpi['active_high_risk_zones']['value']}` ({kpi['active_high_risk_zones']['subtext']})
- **Dispatched Rescue Teams**: `{kpi['dispatched_rescue_teams']['value']}` ({kpi['dispatched_rescue_teams']['subtext']})
- **Evacuation Shelter Occupancy**: `{kpi['shelter_occupancy']['value']}` ({kpi['shelter_occupancy']['subtext']})
- **Threatened Structures & Buildings**: `{impact['threatened_buildings_count']}`
- **Submerged / Threatened NH-10 Highway**: `{impact['threatened_nh10_km']} km`
- **Bridges Under Active Observation**: `{impact['bridges_at_risk']}`

---
*Report synthesized automatically by FloodGuard (SERENITY) C++ ONNX Engine.*
"""
        return PlainTextResponse(content=md, media_type="text/markdown")

    return {
        "report_id": f"SITREP-{datetime.datetime.now().strftime('%Y%m%d-%H%M')}",
        "timestamp": datetime.datetime.now().isoformat(),
        "authority": "Sikkim State Disaster Management Authority (SSDMA)",
        "pilot_corridor": "Teesta River, Melli to Teesta Bridge",
        "data": state
    }
