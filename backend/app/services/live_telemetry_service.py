import os
import time
import datetime
import json
import requests
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple, Optional
from backend.app.core.config import settings

class LiveTelemetryService:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(LiveTelemetryService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    # Live CWC & Weather Endpoints
    CWC_API_URL = "https://ffs.india-water.gov.in/web-api/getHGStationDataForFFS/"
    WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast"
    MELLI_CWC_CODE = "'DWRIS-06'"
    KHANITAR_CWC_CODE = "'013-LBDjPG'"

    def fetch_live_rainfall_from_api(self, lat: float = 27.090, lon: float = 88.457) -> Dict[str, float]:
        """Fetches live real-time precipitation telemetry for Melli/Teesta catchment."""
        try:
            params = {
                "latitude": lat,
                "longitude": lon,
                "hourly": "precipitation,rain",
                "past_days": 7,
                "forecast_days": 1,
                "timezone": "Asia/Kolkata"
            }
            res = requests.get(self.WEATHER_API_URL, params=params, timeout=10)
            if res.status_code == 200:
                data = res.json()
                hourly_precip = data.get("hourly", {}).get("precipitation", [])
                if len(hourly_precip) >= 168: # 7 days * 24h = 168h
                    r_1d = float(np.sum(hourly_precip[-24:]))
                    r_3d = float(np.sum(hourly_precip[-72:]))
                    r_7d = float(np.sum(hourly_precip[:168]))
                    return {
                        "rain_prev_1d": round(r_1d, 1),
                        "rain_prev_3d": round(r_3d, 1),
                        "rain_prev_7d": round(r_7d, 1),
                        "source": "LIVE_METEOROLOGICAL_API"
                    }
        except Exception as e:
            print(f"[LiveTelemetryService] Weather API fetch notice: {e}")
        return {}

    def fetch_live_cwc_from_api(self, station_code: str = "'DWRIS-06'") -> Optional[float]:
        """Fetches live water level directly from CWC India-WRIS Flood Forecast System."""
        try:
            today_str = datetime.date.today().strftime("%Y-%m-%d")
            past_str = (datetime.date.today() - datetime.timedelta(days=3)).strftime("%Y-%m-%d")
            payload = {
                "stationCode": station_code,
                "startDate": past_str,
                "endDate": today_str
            }
            headers = {
                "Accept": "application/json, text/plain, */*",
                "Content-Type": "application/json",
                "Origin": "https://ffs.india-water.gov.in",
                "Referer": "https://ffs.india-water.gov.in/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            }
            res = requests.post(self.CWC_API_URL, json=payload, headers=headers, timeout=15)
            if res.status_code == 200:
                data = res.json()
                if isinstance(data, list) and len(data) > 0:
                    last_reading = data[-1]
                    val = float(last_reading.get("waterLevel", last_reading.get("stage", 0.0)))
                    if val > 100.0:
                        return val
        except Exception as e:
            print(f"[LiveTelemetryService] CWC API fetch notice: {e}")
        return None

    def initialize(self):
        if self._initialized:
            return

        print("[LiveTelemetryService] Ingesting Real CWC Gauge & IMD Rainfall Feeds...")
        
        # 1. Load Master Safe Temporal Dataset
        master_safe_path = os.path.join(settings.PROCESSED_DATA_DIR, "master_temporal_safe_2023_2025.csv")
        if os.path.exists(master_safe_path):
            self.master_df = pd.read_csv(master_safe_path)
            self.master_df['timestamp'] = pd.to_datetime(self.master_df['timestamp'])
            
            # Normalize column names
            if 'melli_level_m' in self.master_df.columns and 'melli_water_level_m' not in self.master_df.columns:
                self.master_df['melli_water_level_m'] = self.master_df['melli_level_m']
            if 'khanitar_level_m' in self.master_df.columns and 'khanitar_water_level_m' not in self.master_df.columns:
                self.master_df['khanitar_water_level_m'] = self.master_df['khanitar_level_m']
                
            self.master_df = self.master_df.sort_values('timestamp').reset_index(drop=True)
            print(f"[LiveTelemetryService] Loaded {len(self.master_df):,} real hourly synchronized observations (2023-2025).")
        else:
            self.master_df = pd.DataFrame()

        # Replay begins at the most recent verified Melli observation. Never
        # select a flood event merely to make the dashboard look active.
        if len(self.master_df) > 0 and 'melli_water_level_m' in self.master_df.columns:
            valid_melli = self.master_df.index[self.master_df['melli_water_level_m'].notna()]
            self.current_idx = int(valid_melli[-1]) if len(valid_melli) else 0
        else:
            self.current_idx = 0

        self.last_update_time = datetime.datetime.now()
        self._initialized = True

    def get_latest_reading(self) -> Dict[str, Any]:
        """Returns the current real-time telemetry snapshot, attempting live API ingestion first."""
        if not self._initialized:
            self.initialize()

        # Attempt Live APIs
        live_rain = self.fetch_live_rainfall_from_api()
        live_melli_cwc = self.fetch_live_cwc_from_api(self.MELLI_CWC_CODE)
        live_khan_cwc = self.fetch_live_cwc_from_api(self.KHANITAR_CWC_CODE)

        if len(self.master_df) == 0:
            raise RuntimeError(
                "Verified telemetry history is required to calculate model features; no fallback values are published."
            )

        history = self.master_df.iloc[:self.current_idx + 1]

        def latest_observed(column: str) -> float:
            observed = history[column].dropna() if column in history else pd.Series(dtype=float)
            if observed.empty:
                observed = self.master_df[column].dropna() if column in self.master_df else pd.Series(dtype=float)
            if observed.empty:
                return 0.0
            return float(observed.iloc[-1])

        def observed_rise(column: str) -> float:
            observed = history[column].dropna() if column in history else pd.Series(dtype=float)
            if len(observed) < 2:
                observed = self.master_df[column].dropna() if column in self.master_df else pd.Series(dtype=float)
            if len(observed) < 2:
                return 0.0
            return float(observed.iloc[-1] - observed.iloc[-2])

        row = self.master_df.iloc[self.current_idx]
        melli_rise = observed_rise('melli_water_level_m')
        khanitar_rise = observed_rise('khanitar_water_level_m')

        # Use live values if available
        melli_wl = live_melli_cwc if live_melli_cwc is not None else latest_observed('melli_water_level_m')
        khan_wl = live_khan_cwc if live_khan_cwc is not None else latest_observed('khanitar_water_level_m')
        r1 = live_rain.get('rain_prev_1d', latest_observed('rain_prev_1d'))
        r3 = live_rain.get('rain_prev_3d', latest_observed('rain_prev_3d'))
        r7 = live_rain.get('rain_prev_7d', latest_observed('rain_prev_7d'))

        is_fully_live = (
            live_melli_cwc is not None
            and live_khan_cwc is not None
            and all(key in live_rain for key in ('rain_prev_1d', 'rain_prev_3d', 'rain_prev_7d'))
        )

        return {
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S") if is_fully_live else str(row['timestamp']),
            "melli_water_level_m": melli_wl,
            "melli_rise_1h": round(melli_rise, 2),
            "khanitar_water_level_m": khan_wl,
            "khanitar_rise_1h": round(khanitar_rise, 2),
            "rain_prev_1d": r1,
            "rain_prev_3d": r3,
            "rain_prev_7d": r7,
            "data_source": "LIVE_CWC_AND_METEOROLOGICAL_NETWORK" if is_fully_live else "VERIFIED_HISTORICAL_TELEMETRY_REPLAY",
            "data_mode": "LIVE" if is_fully_live else "HISTORICAL_REPLAY",
            "cwc_station_id": "024-MBDNG (Melli)",
            "cwc_basin": "Teesta River Basin, Sikkim"
        }

    def get_rolling_72h_sequence(self) -> Tuple[np.ndarray, list[Dict[str, Any]]]:
        """
        Builds the 72-hour historical feature matrix (1, 72, 11) for ONNX Residual Attention LSTM.
        Returns:
            seq_enhanced: np.ndarray of shape (1, 72, 11)
            history_series: List of dicts for charting past 72h hydrograph
        """
        if not self._initialized:
            self.initialize()

        start_idx = max(0, self.current_idx - 71)
        end_idx = self.current_idx + 1

        if len(self.master_df) > 0 and (end_idx - start_idx) >= 10:
            slice_df = self.master_df.iloc[start_idx:end_idx].copy()
            if len(slice_df) < 72:
                # Pad earlier rows
                pad_count = 72 - len(slice_df)
                first_row = slice_df.iloc[0:1]
                padded = pd.concat([first_row] * pad_count + [slice_df]).reset_index(drop=True)
                slice_df = padded
            elif len(slice_df) > 72:
                slice_df = slice_df.iloc[-72:]
        else:
            raise RuntimeError(
                "At least 10 verified telemetry observations are required for a model forecast."
            )

        # CWC gauge streams are asynchronous, so a synchronized historical row
        # can legitimately be missing one station. Carry the nearest verified
        # observation within this 72-step window; do not create nominal values.
        feature_columns = [
            'melli_water_level_m', 'khanitar_water_level_m',
            'rain_prev_1d', 'rain_prev_3d', 'rain_prev_7d',
        ]
        slice_df[feature_columns] = slice_df[feature_columns].ffill().bfill()
        if slice_df[feature_columns].isna().any().any():
            missing = slice_df[feature_columns].columns[
                slice_df[feature_columns].isna().any()
            ].tolist()
            raise RuntimeError(
                f"Verified telemetry is incomplete for model features: {', '.join(missing)}."
            )

        # Build feature matrix (1, 72, 9 raw features)
        # cols: 0: melli_wl, 1: melli_rise, 2: khan_wl, 3: khan_rise, 4: rain_12h, 5: rain_24h, 6: rain_1d, 7: rain_3d, 8: rain_7d
        seq_raw = np.zeros((1, 72, 9), dtype=np.float32)
        seq_raw[0, :, 0] = slice_df['melli_water_level_m'].values
        seq_raw[0, 1:, 1] = np.diff(slice_df['melli_water_level_m'].values)
        seq_raw[0, :, 2] = slice_df.get('khanitar_water_level_m', 294.0).values
        seq_raw[0, 1:, 3] = np.diff(slice_df.get('khanitar_water_level_m', 294.0).values)
        seq_raw[0, :, 4] = slice_df.get('rain_prev_1d', 50.0).values / 2.0
        seq_raw[0, :, 5] = slice_df.get('rain_prev_1d', 50.0).values
        seq_raw[0, :, 6] = slice_df.get('rain_prev_1d', 50.0).values
        seq_raw[0, :, 7] = slice_df.get('rain_prev_3d', 100.0).values
        seq_raw[0, :, 8] = slice_df.get('rain_prev_7d', 180.0).values

        # Enhanced features (API factor + Khanitar normalized)
        api_f = 0.5 * seq_raw[:, :, 6:7] + 0.3 * seq_raw[:, :, 7:8] + 0.2 * seq_raw[:, :, 8:9]
        khan_n = (seq_raw[:, :, 2:3] - 290.0) / 10.0
        seq_enhanced = np.concatenate([seq_raw, api_f, khan_n], axis=-1).astype(np.float32)
        if not np.isfinite(seq_enhanced).all():
            raise RuntimeError("Model feature window contains non-finite telemetry values.")

        history_series = []
        for _, r in slice_df.iterrows():
            ts_str = str(r['timestamp'])
            history_series.append({
                "time": ts_str[-8:-3] if len(ts_str) >= 8 else ts_str,
                "full_time": ts_str,
                "water_level_m": round(float(r['melli_water_level_m']), 2)
            })

        return seq_enhanced, history_series

    def step_forward(self):
        """Advances real telemetry feed by 1 hour."""
        if len(self.master_df) > 0:
            self.current_idx = (self.current_idx + 1) % len(self.master_df)
            self.last_update_time = datetime.datetime.now()

live_telemetry_service = LiveTelemetryService()
