"""Bounded model-backed scenarios for Flood Sense demonstrations."""

from fastapi import APIRouter, HTTPException

from backend.app.services.exposure_analyzer import exposure_analyzer

router = APIRouter(prefix="/simulation", tags=["Simulation"])

# Each selection changes telemetry inputs before the deployed temporal and
# spatial models run. These are not prewritten dashboard outcomes.
SCENARIOS = {
    "normal": {
        "id": "normal", "name": "Normal flow",
        "description": "Low rainfall and a stable river level keep the corridor in routine monitoring.",
        "assumptions": "8 mm rain / 24 h; stable Melli gauge at 223.8 m.",
        "telemetry": {"melli_water_level_m": 223.8, "melli_rise_1h": 0.02, "rain_prev_1d": 8.0, "rain_prev_3d": 24.0, "rain_prev_7d": 55.0},
    },
    "watch": {
        "id": "watch", "name": "Heavy-rain watch",
        "description": "Sustained upstream rainfall triggers enhanced monitoring before river thresholds are crossed.",
        "assumptions": "118 mm rain / 72 h; Melli gauge at 224.6 m and rising slowly.",
        "telemetry": {"melli_water_level_m": 224.6, "melli_rise_1h": 0.12, "rain_prev_1d": 42.0, "rain_prev_3d": 118.0, "rain_prev_7d": 175.0},
    },
    "alert": {
        "id": "alert", "name": "Bankfull alert",
        "description": "The warning level is crossed; shelters and flood-response teams are prepared.",
        "assumptions": "Heavy catchment rain; Melli gauge at 226.2 m (warning threshold).",
        "telemetry": {"melli_water_level_m": 226.2, "melli_rise_1h": 0.31, "rain_prev_1d": 74.0, "rain_prev_3d": 155.0, "rain_prev_7d": 235.0},
    },
    "warning": {
        "id": "warning", "name": "Flood emergency",
        "description": "The danger level is crossed, demonstrating inundation risk and evacuation response.",
        "assumptions": "Intense rainfall; Melli gauge at 227.4 m (danger threshold exceeded).",
        "telemetry": {"melli_water_level_m": 227.4, "melli_rise_1h": 0.52, "rain_prev_1d": 112.0, "rain_prev_3d": 228.0, "rain_prev_7d": 330.0},
    },
}


@router.get("/scenarios")
def get_simulation_scenarios():
    return [{key: value for key, value in scenario.items() if key != "telemetry"} for scenario in SCENARIOS.values()]


@router.post("/{scenario_id}")
def run_simulation(scenario_id: str):
    scenario = SCENARIOS.get(scenario_id)
    if scenario is None:
        raise HTTPException(status_code=404, detail="Unknown simulation scenario")
    return exposure_analyzer.evaluate_live_situation(simulation=scenario)
