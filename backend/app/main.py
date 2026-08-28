import time
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.db.spatial_engine import spatial_engine
from backend.app.services.inference_engine import inference_engine
from backend.app.services.live_telemetry_service import live_telemetry_service
from backend.app.services.scheduler import telemetry_scheduler
from backend.app.routers import dashboard, forecast, spatial_risk, incidents, benchmarks, reports

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup Sequence
    print("=" * 80)
    print("Starting FloodGuard (SERENITY) — Production Flood Response API")
    print("=" * 80)
    
    t0 = time.time()
    # 1. Initialize Spatial Engine (STRtree C-Index over 59.6k assets)
    spatial_engine.initialize()
    
    # 2. Initialize ONNX Runtime Engine (C++ Graph execution)
    inference_engine.initialize()
    
    # 3. Initialize Real-Time Telemetry Service
    live_telemetry_service.initialize()
    
    # 4. Start Background Scheduler for continuous telemetry polling
    telemetry_scheduler.start()
    
    elapsed = round((time.time() - t0), 2)
    print(f"[FloodGuard Core] All services online and ready in {elapsed}s!")
    print("=" * 80)
    
    yield
    
    # Shutdown Sequence
    print("[FloodGuard Core] Shutting down background tasks...")
    telemetry_scheduler.shutdown()
    print("[FloodGuard Core] Clean shutdown complete.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Operational Spatiotemporal Flood Risk & Early Warning Platform for Melli, Sikkim",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(forecast.router, prefix=settings.API_V1_STR)
app.include_router(spatial_risk.router, prefix=settings.API_V1_STR)
app.include_router(incidents.router, prefix=settings.API_V1_STR)
app.include_router(benchmarks.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)

@app.get("/api/status", tags=["Status"])
def get_system_status():
    return {
        "status": "ONLINE",
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "region": "Teesta River Basin, Sikkim (Melli -> Teesta Bridge)",
        "coordinates": settings.MELLI_COORDS,
        "models": {
            "spatial": "Spatial XGBoost (Compiled ONNX Opset 15, 83,080 cells)",
            "temporal": "Residual Attention Quantile Bi-LSTM (Compiled ONNX Opset 18, +6h/+12h/+24h)"
        },
        "spatial_database": {
            "indexed_buildings": len(spatial_engine.infra_geoms),
            "indexed_roads": len(spatial_engine.roads_geoms),
            "engine": "PostGIS + In-Memory Shapely STRtree C-Index"
        }
    }

@app.get("/", tags=["Root"])
def root_status():
    return {
        "message": "FloodGuard (SERENITY) API is running.",
        "documentation": "/docs",
        "dashboard_endpoint": "/api/dashboard/live"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
