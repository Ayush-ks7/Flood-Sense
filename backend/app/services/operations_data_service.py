"""Client for the authority's live operations dashboard feed.

Expected JSON fields are documented in .env.example. Keeping this separate from
hydrology ensures that emergency-management data is never fabricated from a
weather or river-gauge API.
"""
from typing import Any, Dict

import requests

from backend.app.core.config import settings


class OperationsDataService:
    def get_snapshot(self) -> Dict[str, Any]:
        if not settings.OPERATIONS_API_URL:
            return {"available": False, "reason": "OPERATIONS_API_URL is not configured"}

        headers = {"Accept": "application/json"}
        if settings.OPERATIONS_API_TOKEN:
            headers["Authorization"] = f"Bearer {settings.OPERATIONS_API_TOKEN}"

        try:
            response = requests.get(settings.OPERATIONS_API_URL, headers=headers, timeout=10)
            response.raise_for_status()
            payload = response.json()
            if not isinstance(payload, dict):
                raise ValueError("Operations API must return a JSON object")
            payload["available"] = True
            return payload
        except (requests.RequestException, ValueError) as exc:
            return {"available": False, "reason": str(exc)}


operations_data_service = OperationsDataService()
