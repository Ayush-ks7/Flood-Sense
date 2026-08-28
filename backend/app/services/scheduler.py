import time
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from backend.app.services.live_telemetry_service import live_telemetry_service
from backend.app.services.exposure_analyzer import exposure_analyzer

logger = logging.getLogger("scheduler")

class TelemetryScheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.is_running = False
        self.latest_cache = None

    def tick_telemetry_job(self):
        try:
            # Advance telemetry feed by 1 hour (or fetch latest live gauge API)
            live_telemetry_service.step_forward()
            # Recompute model inference and impact analytics
            self.latest_cache = exposure_analyzer.evaluate_live_situation()
            # logging
            wl = self.latest_cache['telemetry']['melli_water_level_m']
            tier = self.latest_cache['alert']['tier']
            logger.info(f"[APScheduler] Real Telemetry Updated | Melli: {wl}m | Alert: {tier}")
        except Exception as e:
            logger.error(f"[APScheduler Error] {e}")

    def start(self):
        if not self.is_running:
            # Initial compute
            self.latest_cache = exposure_analyzer.evaluate_live_situation()
            # Schedule periodic ingestion job every 60 seconds
            self.scheduler.add_job(self.tick_telemetry_job, 'interval', seconds=60, id='telemetry_ingestion_job')
            self.scheduler.start()
            self.is_running = True
            print("[APScheduler] Background Telemetry Ingestion Scheduler ACTIVE.")

    def shutdown(self):
        if self.is_running:
            self.scheduler.shutdown()
            self.is_running = False
            print("[APScheduler] Scheduler stopped.")

    def get_latest_cached_state(self):
        if self.latest_cache is None:
            self.latest_cache = exposure_analyzer.evaluate_live_situation()
        return self.latest_cache

telemetry_scheduler = TelemetryScheduler()
