import os
from typing import List

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

try:
    from pydantic_settings import BaseSettings
except ImportError:
    class BaseSettings:
        pass

class Settings:
    PROJECT_NAME: str = "FloodGuard (SERENITY) Official Flood Response System"
    VERSION: str = "3.0.0"
    API_V1_STR: str = "/api"
    
    # Pilot AOI: Melli - Teesta River Corridor, Sikkim
    AOI_BBOX: List[float] = [27.00, 88.25, 27.20, 88.52] # [South, West, North, East]
    MELLI_COORDS: List[float] = [27.090, 88.457] # [Lat, Lon]
    
    # CWC Thresholds for Melli Gauge (Station #024-MBDNG)
    WARNING_LEVEL_M: float = 226.0
    DANGER_LEVEL_M: float = 227.0
    HIGH_FLOOD_LEVEL_M: float = 228.0
    
    # Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    PROCESSED_DATA_DIR: str = os.path.join(DATA_DIR, "processed")
    SPATIAL_DIR: str = os.path.join(PROCESSED_DATA_DIR, "spatial")
    CWC_DIR: str = os.path.join(PROCESSED_DATA_DIR, "cwc")
    IMD_DIR: str = os.path.join(PROCESSED_DATA_DIR, "imd")
    MODELS_DIR: str = os.path.join(BASE_DIR, "models")
    ONNX_DIR: str = os.path.join(MODELS_DIR, "onnx")
    
    # ONNX Model Artifacts
    LSTM_ONNX_PATH: str = os.path.join(ONNX_DIR, "residual_quantile_lstm.onnx")
    XGB_ONNX_PATH: str = os.path.join(ONNX_DIR, "spatial_xgboost.onnx")
    FEATURE_SCALER_PATH: str = os.path.join(MODELS_DIR, "improved_lstm", "feature_scaler.joblib")
    DELTA_SCALER_PATH: str = os.path.join(MODELS_DIR, "improved_lstm", "delta_scaler.joblib")
    
    # Spatial Datasets
    INFRA_GEOJSON_PATH: str = os.path.join(SPATIAL_DIR, "teesta_infrastructure.geojson")
    ROADS_GEOJSON_PATH: str = os.path.join(SPATIAL_DIR, "teesta_roads.geojson")
    RIVER_GEOJSON_PATH: str = os.path.join(SPATIAL_DIR, "teesta_river_network.geojson")
    STATIC_GRID_PATH: str = os.path.join(SPATIAL_DIR, "real_gee_static_grid.csv")
    BENCHMARKS_JSON_PATH: str = os.path.join(MODELS_DIR, "benchmarks", "serenity_model_benchmarks.json")
    
    # Telemetry Files
    MELLI_TELEMETRY_CSV: str = os.path.join(CWC_DIR, "melli_water_level_2023_2026.csv")
    KHANITAR_TELEMETRY_CSV: str = os.path.join(CWC_DIR, "khanitar_water_level_clean.csv")
    IMD_RAINFALL_CSV: str = os.path.join(IMD_DIR, "teesta_rainfall_features_2023_2025.csv")
    
    # Database (Supabase PostgreSQL + PostGIS)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
    )
    
settings = Settings()
