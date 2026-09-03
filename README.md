# FloodSense
### Operational Spatiotemporal Flood Risk & Early Warning Platform
*Selected for Smart India Hackathon (SIH)*

[![Python Version](https://img.shields.io/badge/Python-3.10%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![ONNX Runtime](https://img.shields.io/badge/ONNX_Runtime-C%2B%2B_Engine-005CED.svg?logo=onnx&logoColor=white)](https://onnxruntime.ai/)
[![PostGIS](https://img.shields.io/badge/PostGIS-3.4-336791.svg?logo=postgresql&logoColor=white)](https://postgis.net/)
[![React](https://img.shields.io/badge/Frontend-React.js_%2B_JS-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Overview

**FloodSense** is an operational, AI-powered spatiotemporal flood early warning and impact assessment platform designed specifically for high-gradient Himalayan river valleys. Focused on the **Melli–Teesta River Corridor in Sikkim** (`27.00°N–27.20°N, 88.25°E–88.52°E`), the platform bridges real-time hydrological telemetry from the Central Water Commission (CWC) and India Meteorological Department (IMD) with compiled C++ ONNX deep learning models, a Supabase PostgreSQL + PostGIS spatial database, and an interactive React.js command-center dashboard.

---

## Key Features

- **Multi-Horizon Hydrological Forecasting**: A 2-layer **Bidirectional LSTM with Multi-Head Self-Attention** trained with Pinball loss to forecast **+6h, +12h, and +24h** river water levels with mathematically non-crossing **[P10, P50, P90]** uncertainty intervals (**NSE = 0.9074**, peak error **1.1 cm**).
- **High-Resolution Spatial Risk Mapping**: A geomorphic **Spatial XGBoost** model evaluating **83,080 30m terrain grid cells** in **< 30 ms** (**IoU = 0.8173**, **Precision = 97.12%**) based on Height Above Nearest Drainage (HAND), slope, elevation, upstream area, and land cover.
- **Microsecond Geospatial Impact Engine**: Dual-mode **PostGIS** (Supabase) + in-memory C-based **Shapely STRtree** executing point-in-polygon spatial queries against **59,601 building footprints** and **3,414 road links** (including National Highway 10).
- **Official Disaster Response KPI Cockpit**: Real-time generation of the 4 official disaster response metrics:
  1. **Total Affected Population** (dynamic flood polygon ∩ residential dwellings × 4.8 density factor)
  2. **Active High Risk Zones** (isolated inundation cluster count)
  3. **Dispatched Rescue Teams** (SDRF/NDRF deployment rates)
  4. **Shelter Occupancy** (real-time capacity tracking across relief camps)
- **Zero GIL Overhead**: All deep learning and decision tree models are compiled into native **ONNX Runtime C++ execution graphs**, enabling **sub-50ms end-to-end API response times** on standard CPU instances.
- **Automated SitRep Generation**: Generates instantaneous Markdown and JSON Situation Reports (SitReps) formatted for the Sikkim State Disaster Management Authority (SSDMA).

---

## System Architecture

```
                                  SYSTEM WORKFLOW
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │ 1. REAL-TIME DATA SOURCES (Live Governmental Telemetry)                                │
 │    - CWC River Gauges: Melli ('DWRIS-06') & Upstream Khanitar ('013-LBDjPG')           │
 │    - IMD / Weather Telemetry: Live 24h / 3-day / 7-day Antecedent Precipitation        │
 └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                             ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │ 2. HIGH-PERFORMANCE ONNX RUNTIME C++ INFERENCE ENGINE                                  │
 │    - Temporal Model : Residual Attention Quantile Bi-LSTM (+6h/+12h/+24h P10/P50/P90)   │
 │    - Spatial Model  : Geomorphic Spatial XGBoost (83,080 30m Terrain Grid Cells)       │
 └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                             ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │ 3. SPATIAL DATABASE & VECTOR INUNDATION ANALYSIS                                       │
 │    - Dynamic Vector Polygonization of Flood Zones (Prob ≥ 0.50)                        │
 │    - PostGIS / STRtree Point-in-Polygon Intersections against 59,601 OSM Assets        │
 └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                             ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │ 4. FASTAPI REST BACKEND & REACT.JS OFFICIAL RESPONSE DASHBOARD                         │
 │    - 4 Top KPI Cards (Affected Pop: 18.2k, Active Zones: 11, Rescue: 86, Shelters: 45%)│
 │    - Multi-Tier Alert Cockpit (NORMAL, WATCH, ALERT, WARNING)                          │
 │    - Live Forecast Uncertainty Hydrograph & Official Situation Reports (SitReps)       │
 └────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **AI & Deep Learning** | PyTorch, XGBoost, ONNX Runtime (C++ Graph Execution), Scikit-Learn, Joblib |
| **Spatial Database** | PostgreSQL 16, PostGIS 3.4 (Supabase Cloud), Shapely 2.1 (STRtree R-Tree) |
| **Backend & APIs** | FastAPI, Uvicorn (ASGI), Pydantic v2, APScheduler, Psycopg2, Requests |
| **Frontend & UI** | React.js, JavaScript, Tailwind CSS, Mapbox GL JS, Recharts, Lucide React |
| **Earth Observation** | Google Earth Engine (GEE), NASA NASADEM (30m), MERIT Hydro (HAND), ESA WorldCover |
| **Live Telemetry** | CWC Flood Forecast System (India-WRIS), IMD / Open-Meteo High-Resolution APIs |

---

## Project Directory Structure

```
hthon/
├── backend/                              # Production FastAPI Backend Service
│   ├── app/
│   │   ├── main.py                       # FastAPI entrypoint, CORS & startup lifespan
│   │   ├── core/
│   │   │   └── config.py                 # CWC thresholds, Supabase DATABASE_URL, paths
│   │   ├── db/
│   │   │   └── spatial_engine.py         # PostGIS SQL queries & in-memory STRtree C-index
│   │   ├── services/
│   │   │   ├── live_telemetry_service.py # Live CWC & IMD rainfall API fetchers
│   │   │   ├── inference_engine.py       # ONNX Runtime C++ execution sessions
│   │   │   ├── polygon_generator.py      # Vector flood polygonization & heatmaps
│   │   │   ├── exposure_analyzer.py      # 4 KPI cards, alert guidance & incidents
│   │   │   └── scheduler.py              # APScheduler background polling daemon
│   │   └── routers/
│   │       ├── dashboard.py              # GET /api/dashboard/live
│   │       ├── forecast.py               # GET /api/forecast (hydrograph + intervals)
│   │       ├── spatial_risk.py           # GET /api/spatial-risk/polygons & /heatmap
│   │       ├── incidents.py              # GET /api/incidents (active incident feed)
│   │       ├── benchmarks.py             # GET /api/benchmarks (model validation)
│   │       └── reports.py                # GET /api/reports/export (SitRep generator)
│   └── test_backend.py                   # Automated 7-endpoint verification suite
│
├── database/                             # Spatial Database Architecture
│   └── schema.sql                        # PostGIS DDL table schema, indexes, & functions
│
├── models/                               # Machine Learning & Deep Learning Artifacts
│   ├── onnx/
│   │   ├── residual_quantile_lstm.onnx   # Compiled ONNX Bi-LSTM model (158 KB)
│   │   ├── residual_quantile_lstm.onnx.data
│   │   └── spatial_xgboost.onnx          # Compiled ONNX XGBoost model (238 KB)
│   ├── improved_lstm/
│   │   ├── feature_scaler.joblib         # 11-feature input standardizer
│   │   ├── delta_scaler.joblib           # Residual delta target scaler
│   │   └── best_residual_lstm.pth        # PyTorch model checkpoint (NSE = 0.9074)
│   ├── spatial_xgboost/
│   │   ├── xgboost_flood_model.joblib    # Scikit-learn model checkpoint
│   │   └── real_feature_importance.csv   # HAND: 75.8%, Upstream Area: 19.5%
│   └── benchmarks/
│       └── serenity_model_benchmarks.json# Complete multi-tier evaluation catalog
│
├── data/processed/                       # Processed Spatial & Hydrological Layers
│   ├── spatial/
│   │   ├── teesta_infrastructure.geojson # 59,601 OSM buildings & facilities (42.7 MB)
│   │   ├── teesta_roads.geojson          # 3,414 road links & NH-10 highway (14.0 MB)
│   │   ├── teesta_river_network.geojson  # 233 Teesta waterway lines (1.28 MB)
│   │   └── real_gee_static_grid.csv      # 83,080 30m terrain grid cells (9.15 MB)
│   ├── cwc/
│   │   └── melli_water_level_2023_2026.csv # 17,916 CWC hourly readings
│   └── master_temporal_safe_2023_2025.csv # 16,052 synchronized hourly records
│
├── scripts/
│   └── ingest_postgis.py                 # PostGIS batch-ingestion & spatial benchmark
├── .env.example                          # Safe environment variable template
├── .gitignore                            # Secrets, caches, and heavy rasters ignored
└── SYSTEM_ARCHITECTURE_DOCUMENTATION.md  # Comprehensive technical documentation & Q&A
```

---

## Quickstart & Setup Guide

### 1. Clone the Repository
```bash
git clone https://github.com/Ayush-ks7/Flood-Sense.git
cd Flood-Sense
```

### 2. Set Up Virtual Environment & Install Dependencies
```bash
# Create virtual environment
python -m venv venv

# Activate (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Activate (Linux / macOS)
source venv/bin/activate

# Install requirements
pip install fastapi uvicorn onnxruntime numpy pandas shapely joblib scikit-learn requests APScheduler pydantic psycopg2-binary python-dotenv
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and set your Supabase PostGIS connection string (optional, system has an automatic in-memory STRtree fallback):
```bash
cp .env.example .env
```
In `.env`:
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
PORT=8000
HOST=0.0.0.0
```

### 4. Run the Automated Verification Suite
Verify all 7 endpoints, ONNX model sessions, and spatial query engines:
```bash
python backend/test_backend.py
```
*Expected output: `ALL 7 BACKEND ENDPOINTS PASSED VERIFICATION WITH SUB-100MS PERFORMANCE!`*

### 5. Start the FastAPI Backend
```bash
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
- **Live API Endpoint**: `http://localhost:8000/api/dashboard/live`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Alternative ReDoc UI**: `http://localhost:8000/redoc`

---

## REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/status` | System health check, active model architectures, and database index counts. |
| `GET` | `/api/dashboard/live` | Complete response cockpit payload (4 KPI cards, alert guidance, hydrograph, incidents). |
| `GET` | `/api/forecast` | +6h / +12h / +24h river hydrograph with shaded [P10, P90] intervals and CWC thresholds. |
| `GET` | `/api/spatial-risk/polygons` | Real-time GeoJSON Flood Inundation Polygons (P ≥ 0.50). |
| `GET` | `/api/spatial-risk/heatmap` | Sampled 30m terrain risk points with HAND, elevation, slope, and flood probability. |
| `GET` | `/api/incidents` | Real-time incident logs (`CRITICAL`, `HIGH ALERT`, `ADVISORY`) with rescue dispatch status. |
| `GET` | `/api/benchmarks` | Complete model evaluation benchmarks (IoU, Precision, Recall, NSE). |
| `GET` | `/api/reports/export` | Generates official Markdown / JSON Situation Report (SitRep) for SSDMA. |

---

## Model Evaluation & Benchmarks

### Temporal Model: Residual Attention Quantile Bi-LSTM
Evaluated on unseen 2025 monsoon test split:
| Forecast Horizon | Nash-Sutcliffe Efficiency (NSE) | Mean Absolute Error (MAE) | Root Mean Square Error (RMSE) | Peak Flood Error | [P10, P90] Empirical Coverage |
|:---:|:---:|:---:|:---:|:---:|:---:|
| **+6 Hours** | **0.9074 (90.7%)** | 0.147 m | 0.195 m | **0.011 m (1.1 cm)** | **95.63%** |
| **+12 Hours** | **0.8050 (80.5%)** | 0.211 m | 0.283 m | 0.102 m (10.2 cm) | **91.90%** |
| **+24 Hours** | **0.8291 (82.9%)** | 0.181 m | 0.265 m | 0.040 m (4.0 cm) | 88.45% |

### Spatial Model: Geomorphic Spatial XGBoost
Evaluated via event-split cross-validation across 498,480 spatiotemporal cell events:
| Metric | Value | Hydrological Significance |
|---|:---:|---|
| **Intersection over Union (IoU)** | **0.8173 (81.7%)** | Accurate high-water mark delineation |
| **Precision** | **97.12%** | Near-zero false alarms on steep mountain valley sidewalls |
| **Recall** | **83.77%** | Comprehensive coverage of endangered low-lying bazaar areas |
| **F1-Score** | **0.8995** | Balanced performance across extreme flood events |
| **ROC-AUC** | **0.9972** | Flawless separability between riverbed and high terraces |

[_metadata_:fingerprint]:- "5e19e2fe29b237b14dcde576374ba0ab8f4cd5efd7a3047e604b8e8d8071c075"

---

## Smart India Hackathon (SIH) Recognition

This project was developed for the **Smart India Hackathon (SIH) Internal Hackathon NIT Raipur** under the disaster management theme, addressing high-priority early warning requirements for Himalayan flash floods and Glacial Lake Outburst Floods (GLOFs) in the Teesta River Basin.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
