import os
import time
import joblib
import numpy as np
import pandas as pd
import onnxruntime as ort
from typing import Dict, Any, Tuple, List
from backend.app.core.config import settings

class InferenceEngine:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(InferenceEngine, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def initialize(self):
        if self._initialized:
            return

        print("[InferenceEngine] Initializing C++ ONNX Runtime Engine...")
        t0 = time.time()

        # Session Options
        session_options = ort.SessionOptions()
        session_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
        session_options.intra_op_num_threads = 4

        # Load ONNX Models
        if os.path.exists(settings.LSTM_ONNX_PATH):
            self.lstm_session = ort.InferenceSession(settings.LSTM_ONNX_PATH, session_options, providers=['CPUExecutionProvider'])
            print(f"[InferenceEngine] Loaded Quantile LSTM ONNX: {settings.LSTM_ONNX_PATH}")
        else:
            self.lstm_session = None

        if os.path.exists(settings.XGB_ONNX_PATH):
            self.xgb_session = ort.InferenceSession(settings.XGB_ONNX_PATH, session_options, providers=['CPUExecutionProvider'])
            print(f"[InferenceEngine] Loaded Spatial XGBoost ONNX: {settings.XGB_ONNX_PATH}")
        else:
            self.xgb_session = None

        # Load Scalers
        if os.path.exists(settings.FEATURE_SCALER_PATH):
            self.feat_scaler = joblib.load(settings.FEATURE_SCALER_PATH)
        else:
            self.feat_scaler = None

        if os.path.exists(settings.DELTA_SCALER_PATH):
            self.delta_scaler = joblib.load(settings.DELTA_SCALER_PATH)
        else:
            self.delta_scaler = None

        # Load Static GEE Grid
        if os.path.exists(settings.STATIC_GRID_PATH):
            self.static_grid = pd.read_csv(settings.STATIC_GRID_PATH)
            print(f"[InferenceEngine] Loaded static grid: {len(self.static_grid):,} cells.")
        else:
            self.static_grid = pd.DataFrame()

        elapsed = round((time.time() - t0), 2)
        print(f"[InferenceEngine] C++ Execution Graphs compiled and ready in {elapsed}s.")
        self._initialized = True

    def run_temporal_forecast(self, seq_enhanced: np.ndarray, current_melli_wl: float) -> Dict[str, Any]:
        """
        Runs the compiled Residual Attention Quantile Bi-LSTM ONNX model.
        Returns +6h, +12h, +24h water levels with non-crossing [P10, P50, P90] prediction intervals.
        """
        if not self._initialized:
            self.initialize()

        t0 = time.time()
        # Scale sequence
        seq_scaled = self.feat_scaler.transform(seq_enhanced.reshape(-1, 11)).reshape(1, 72, 11).astype(np.float32)

        # ONNX C++ graph execution
        raw_pred = self.lstm_session.run(None, {'temporal_features_72h': seq_scaled})[0]

        # Inverse transform residual deltas
        p10_d = self.delta_scaler.inverse_transform(raw_pred[:, :, 0])[0]
        p50_d = self.delta_scaler.inverse_transform(raw_pred[:, :, 1])[0]
        p90_d = self.delta_scaler.inverse_transform(raw_pred[:, :, 2])[0]

        # Apply residual addition to current water level
        p10 = current_melli_wl + p10_d
        p50 = current_melli_wl + p50_d
        p90 = current_melli_wl + p90_d

        # Ensure mathematically strict non-crossing monotonicity
        p50 = np.maximum(p10, p50)
        p90 = np.maximum(p50, p90)

        elapsed_ms = round((time.time() - t0) * 1000, 2)

        horizons = ["+6h", "+12h", "+24h"]
        forecast_items = []
        for i, h in enumerate(horizons):
            forecast_items.append({
                "horizon": h,
                "p10_m": round(float(p10[i]), 2),
                "p50_m": round(float(p50[i]), 2),
                "p90_m": round(float(p90[i]), 2),
                "interval_width_m": round(float(p90[i] - p10[i]), 2),
                "warning_threshold_m": settings.WARNING_LEVEL_M,
                "danger_threshold_m": settings.DANGER_LEVEL_M,
                "hfl_threshold_m": settings.HIGH_FLOOD_LEVEL_M
            })

        return {
            "computation_time_ms": elapsed_ms,
            "horizons": horizons,
            "p10": [round(float(v), 2) for v in p10],
            "p50": [round(float(v), 2) for v in p50],
            "p90": [round(float(v), 2) for v in p90],
            "details": forecast_items
        }

    def run_spatial_inference(self, telemetry: Dict[str, Any]) -> Tuple[pd.DataFrame, float]:
        """
        Runs Spatial XGBoost ONNX model across all 83,080 terrain cells for Melli AOI.
        """
        if not self._initialized:
            self.initialize()

        t0 = time.time()
        grid = self.static_grid.copy()
        
        # Populate dynamic hydrologic attributes
        grid['rain_prev_1d'] = telemetry['rain_prev_1d']
        grid['rain_prev_3d'] = telemetry['rain_prev_3d']
        grid['rain_prev_7d'] = telemetry['rain_prev_7d']
        grid['melli_water_level_m'] = telemetry['melli_water_level_m']
        grid['melli_rise_1h'] = telemetry['melli_rise_1h']

        feature_cols = [
            'elevation_m', 'slope_deg', 'aspect_deg', 'hand_m', 'dist_to_river_m',
            'upstream_area_km2', 'lulc', 'rain_prev_1d', 'rain_prev_3d', 'rain_prev_7d',
            'melli_water_level_m', 'melli_rise_1h'
        ]

        spatial_input = grid[feature_cols].values.astype(np.float32)

        # ONNX C++ Execution for XGBoost
        onnx_out = self.xgb_session.run(None, {'geomorphic_features': spatial_input})

        if isinstance(onnx_out[1], list):
            flood_probs = np.array([p[1] for p in onnx_out[1]], dtype=np.float32)
        elif isinstance(onnx_out[1], np.ndarray):
            if len(onnx_out[1].shape) == 2:
                flood_probs = onnx_out[1][:, 1]
            else:
                flood_probs = onnx_out[1]
        else:
            flood_probs = np.array(onnx_out[1], dtype=np.float32)

        grid['flood_probability'] = flood_probs
        elapsed_ms = round((time.time() - t0) * 1000, 2)

        return grid, elapsed_ms

inference_engine = InferenceEngine()
