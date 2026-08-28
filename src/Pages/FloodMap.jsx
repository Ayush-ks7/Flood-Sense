import React, { useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Popup,
  CircleMarker,
  GeoJSON,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import MapControls from "../Controls/MapControls";

// =========================================================
// AUTOMATICALLY FIT MAP TO FLOOD DATA
// =========================================================

const FitFloodData = ({ geojson }) => {
  const map = useMap();

  useEffect(() => {
    if (!geojson || !geojson.features?.length) {
      return;
    }

    const layer = L.geoJSON(geojson);
    const bounds = layer.getBounds();

    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [30, 30],
        maxZoom: 14,
      });
    }
  }, [geojson, map]);

  return null;
};

const FocusIncident = ({ incident }) => {
  const map = useMap();

  useEffect(() => {
    if (!incident) return;

    if (
      typeof incident.latitude !== "number" ||
      typeof incident.longitude !== "number"
    ) {
      return;
    }

    map.flyTo([incident.latitude, incident.longitude], 15, {
      duration: 1.2,
    });
  }, [incident, map]);

  return null;
};

// =========================================================
// RISK COLOR
// =========================================================

const getRiskColor = (probability) => {
  if (probability >= 0.8) {
    return "#dc2626"; // Critical
  }

  if (probability >= 0.5) {
    return "#f97316"; // High
  }

  if (probability >= 0.3) {
    return "#eab308"; // Moderate
  }

  return "#22c55e"; // Low
};

// =========================================================
// INCIDENT COLOR
// =========================================================

const getIncidentColor = (severity) => {
  const normalizedSeverity = (severity || "").toUpperCase();

  if (normalizedSeverity === "CRITICAL") {
    return "#ef4444";
  }

  if (normalizedSeverity === "HIGH ALERT" || normalizedSeverity === "WARNING") {
    return "#f97316";
  }

  if (normalizedSeverity === "MONITORING" || normalizedSeverity === "UPDATE") {
    return "#3b82f6";
  }

  return "#eab308";
};

// =========================================================
// FLOOD MAP
// =========================================================

const FloodMap = ({ dashboard, selectedIncidentId, onIncidentSelect }) => {
  // =======================================================
  // DATA FROM PARENT COMPONENT
  // =======================================================

  const floodPolygon = dashboard?.flood_polygon_geojson;

  const heatmap = dashboard?.risk_heatmap_geojson;

  const incidents = dashboard?.active_incidents || [];

  const selectedIncident = incidents.find(
    (incident) => incident.id === selectedIncidentId,
  );

  // =======================================================
  // DEFAULT MAP CENTER
  // Melli / Teesta corridor
  // =======================================================

  const defaultCenter = [27.18, 88.49];

  // =======================================================
  // MAP
  // =======================================================

  return (
    <MapContainer
      center={defaultCenter}
      zoom={12}
      zoomControl={false}
      style={{
        height: "500px",
        width: "100%",
      }}
    >
      <FocusIncident incident={selectedIncident} />
      {/* ===================================================
          OPEN STREET MAP
      =================================================== */}

      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* ===================================================
          FLOOD POLYGON
      =================================================== */}

      {floodPolygon && (
        <>
          <GeoJSON
            data={floodPolygon}
            style={() => ({
              color: "#dc2626",
              weight: 1,
              fillColor: "#ef4444",
              fillOpacity: 0.45,
            })}
          />

          <FitFloodData geojson={floodPolygon} />
        </>
      )}

      {/* ===================================================
          ACTIVE INCIDENTS
      =================================================== */}

      {incidents.map((incident) => {
        // Ignore incidents without valid coordinates
        if (
          typeof incident.latitude !== "number" ||
          typeof incident.longitude !== "number"
        ) {
          return null;
        }

        const color = getIncidentColor(incident.severity);

        return (
          <CircleMarker
            key={incident.id}
            center={[incident.latitude, incident.longitude]}
            radius={10}
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: 0.9,
              weight: 3,
            }}
            eventHandlers={{
              click: () => {
                if (onIncidentSelect) {
                  onIncidentSelect(incident.id);
                }
              },
            }}
          >
            {/* =================================================
                INCIDENT POPUP
            ================================================= */}

            <Popup>
              <div className="min-w-[220px]">
                {/* Severity */}
                <div
                  className="mb-1 text-xs font-bold"
                  style={{
                    color: color,
                  }}
                >
                  {incident.severity}
                </div>

                {/* Title */}
                <div className="font-bold text-gray-900">{incident.title}</div>

                {/* Location */}
                <div className="mt-2 text-xs text-gray-600">
                  {incident.location}
                </div>

                {/* Status */}
                <div className="mt-2 text-xs">
                  <strong>Status:</strong> {incident.status}
                </div>

                {/* Details */}
                <div className="mt-1 text-xs">{incident.details}</div>

                {/* Timestamp */}
                <div className="mt-2 text-xs text-gray-400">
                  {incident.timestamp}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {/* ===================================================
          RISK HEATMAP
      =================================================== */}

      {heatmap?.features?.map((feature, index) => {
        // Make sure geometry exists
        if (!feature.geometry || !feature.geometry.coordinates) {
          return null;
        }

        const [longitude, latitude] = feature.geometry.coordinates;

        const probability = feature.properties?.prob ?? 0;

        const riskColor = getRiskColor(probability);

        return (
          <CircleMarker
            key={`risk-${index}`}
            center={[latitude, longitude]}
            radius={7}
            pathOptions={{
              color: riskColor,
              fillColor: riskColor,
              fillOpacity: 0.55,
              weight: 1,
            }}
          >
            {/* =================================================
                RISK POINT POPUP
            ================================================= */}

            <Popup>
              <div className="text-sm">
                <strong>Flood Risk Point</strong>

                {/* Probability */}
                <div className="mt-1">
                  Probability:{" "}
                  <strong>{(probability * 100).toFixed(1)}%</strong>
                </div>

                {/* Elevation */}
                <div>Elevation: {feature.properties?.elev_m ?? "--"} m</div>

                {/* HAND */}
                <div>HAND: {feature.properties?.hand_m ?? "--"} m</div>

                {/* Slope */}
                <div>Slope: {feature.properties?.slope_deg ?? "--"}°</div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {/* ===================================================
          MAP CONTROLS
      =================================================== */}

      <MapControls />
    </MapContainer>
  );
};

export default FloodMap;
