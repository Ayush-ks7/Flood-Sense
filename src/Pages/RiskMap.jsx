import React, { useEffect, useState } from "react";
import {
  Users,
  TriangleAlert,
  Truck,
  House,
  TrendingUp,
  CheckCircle,
  Info,
  Map,
  Layers,
  ListFilter,
  Waves,
  Clipboard,
} from "lucide-react";
import FloodMap from "./FloodMap";
import { getDashboardLive } from "../api/floodSenserApi";

const RiskMap = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);

  // Fetch live dashboard data
  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const data = await getDashboardLive();

        if (isMounted) {
          setDashboard(data);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to load dashboard:", err);

        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Initial request
    loadDashboard();

    // Refresh every 30 seconds
    const interval = setInterval(loadDashboard, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const incidentStyles = {
    critical: {
      border: "border-red-600",
      bg: "bg-red-50",
      text: "text-red-600",
    },
    warning: {
      border: "border-orange-600",
      bg: "bg-orange-50",
      text: "text-orange-600",
    },
    update: {
      border: "border-blue-600",
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9fd]">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="text-sm font-medium text-gray-600">
            Loading Flood-Sense data...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !dashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9fd]">
        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <TriangleAlert size={32} className="mx-auto mb-3 text-red-600" />

          <h2 className="text-lg font-semibold text-red-700">
            Unable to connect to Flood-Sense
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error || "No dashboard data received from the backend."}
          </p>

          <p className="mt-4 text-xs text-gray-500">
            Make sure the FastAPI server is running on port 8000.
          </p>
        </div>
      </div>
    );
  }

  const kpis = dashboard.kpi_metrics || {};
  const alert = dashboard.alert || {};

  // Convert backend incidents into the format used by the existing UI
  const incidents = (dashboard.active_incidents || []).map((incident) => {
    const severity = (incident.severity || "").toUpperCase();

    let type = "update";

    if (severity.includes("CRITICAL")) {
      type = "critical";
    } else if (severity.includes("WARNING") || severity.includes("HIGH")) {
      type = "warning";
    }

    return {
      id: incident.id,
      level: incident.severity,
      time: incident.timestamp,
      title: incident.title,
      description: `${incident.status}. ${incident.details}`,
      type,
    };
  });

  return (
    <div className="min-h-screen bg-[#faf9fd] text-[#1a1c1e]">
      {/* ================= MAIN ================= */}
      <main className="mx-auto w-full max-w-[1440px] space-y-6 p-4 md:p-8">
        {/* Dashboard Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-gray-300 pb-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-2xl font-semibold text-[#002045] md:text-3xl">
              Official Response Dashboard
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="h-3 w-3 animate-pulse rounded-full bg-red-600 [animation-duration:0.9s]" />

              <span className="text-sm font-bold text-red-600">
                LIVE DATA ACTIVE
              </span>

              <span className="text-sm text-gray-500">
                | Last updated: {dashboard.last_updated}
              </span>
            </div>
          </div>

          <button className="hidden rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50 md:block">
            Export Report
          </button>
        </div>

        {/* ================= KPI CARDS ================= */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Population */}
          <div className="relative flex flex-col gap-2 overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-full bg-red-100 opacity-60" />

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users size={20} className="text-red-600" />
              {kpis.total_affected_population?.title ||
                "Total Affected Population"}
            </div>

            <div className="text-4xl font-bold text-[#002045]">
              {kpis.total_affected_population?.value ?? "--"}
            </div>

            <div className="flex items-center gap-1 text-xs font-semibold text-red-600">
              <TrendingUp size={16} />
              {kpis.total_affected_population?.trend || "--"}
            </div>
          </div>

          {/* High Risk */}
          <div className="relative flex flex-col gap-2 overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-full bg-red-100 opacity-60" />

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <TriangleAlert size={20} className="text-red-600" />
              {kpis.active_high_risk_zones?.title || "Active High Risk Zones"}
            </div>

            <div className="text-4xl font-bold text-[#002045]">
              {kpis.active_high_risk_zones?.value ?? "--"}
            </div>

            <div className="flex items-center gap-1 text-xs font-semibold text-red-600">
              <TriangleAlert size={16} />
              {kpis.active_high_risk_zones?.subtext || "--"}
            </div>
          </div>

          {/* Rescue Teams */}
          <div className="relative flex flex-col gap-2 overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-full bg-blue-100 opacity-60" />

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Truck size={20} className="text-blue-600" />
              {kpis.dispatched_rescue_teams?.title || "Dispatched Rescue Teams"}
            </div>

            <div className="text-4xl font-bold text-[#002045]">
              {kpis.dispatched_rescue_teams?.value ?? "--"}
            </div>

            <div className="flex items-center gap-1 text-xs font-semibold text-blue-600">
              <CheckCircle size={16} />
              {kpis.dispatched_rescue_teams?.subtext || "--"}
            </div>
          </div>

          {/* Shelter */}
          <div className="relative flex flex-col gap-2 overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-full bg-orange-100 opacity-60" />

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <House size={20} className="text-orange-600" />
              {kpis.shelter_occupancy?.title || "Shelter Occupancy"}
            </div>

            <div className="text-4xl font-bold text-[#002045]">
              {kpis.shelter_occupancy?.value ?? "--"}
            </div>

            <div className="flex items-center gap-1 text-xs font-semibold text-orange-600">
              <Info size={16} />
              {kpis.shelter_occupancy?.subtext || "--"}
            </div>
          </div>
        </div>

        {/* ================= ALERT ================= */}
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <TriangleAlert size={22} className="mt-0.5 shrink-0 text-red-600" />

            <div>
              <div className="text-sm font-bold text-red-700">
                {alert.tier || "ALERT"}
              </div>

              <p className="mt-1 text-sm text-red-700">
                {alert.description || "No alert information available."}
              </p>

              <div className="mt-2 text-xs text-red-600">
                Current water level:{" "}
                <strong>{alert.current_water_level_m ?? "--"} m</strong>
                {" · "}
                Danger level: <strong>{alert.danger_level_m ?? "--"} m</strong>
              </div>
            </div>
          </div>
        </div>

        {/* ================= MAP + INCIDENTS ================= */}
        <div className="grid h-auto grid-cols-1 gap-4 lg:h-[600px] lg:grid-cols-3">
          {/* ================= MAP ================= */}
          <div className="relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm lg:col-span-2">
            {/* Map Header */}
            <div className="z-10 flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4">
              <h3 className="flex items-center gap-2 text-xl font-semibold text-[#002045]">
                <Map size={22} />
                Real-time Monitoring Map
              </h3>

              <div className="flex gap-2">
                <button className="flex items-center gap-1 rounded border border-gray-300 bg-white p-2 text-xs transition hover:bg-gray-100">
                  <Layers size={17} />
                  <span className="hidden sm:inline">Layers</span>
                </button>

                <button className="flex items-center gap-1 rounded border border-gray-300 bg-white p-2 text-xs transition hover:bg-gray-100">
                  <ListFilter size={17} />
                  <span className="hidden sm:inline">Filters</span>
                </button>
              </div>
            </div>

            {/* Map */}
            <div className="relative min-h-[450px] flex-1 bg-gray-200">
              <FloodMap
                dashboard={dashboard}
                selectedIncidentId={selectedIncidentId}
                onIncidentSelect={setSelectedIncidentId}
              />

              {/* Map Legend */}
              <div className="absolute bottom-4 left-4 z-[1000] w-48 rounded-lg border border-gray-300 bg-white p-4 shadow-md">
                <h4 className="mb-2 text-sm font-bold">Legend</h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-600" />
                    Critical Risk
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-orange-600" />
                    Moderate Risk
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-blue-600" />
                    Rescue Team
                  </div>

                  <div className="flex items-center gap-2">
                    <Waves size={16} className="text-[#002045]" />
                    Flood Gate
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= INCIDENTS ================= */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 bg-gray-50 p-4">
              <h3 className="flex items-center gap-2 text-xl font-semibold text-[#002045]">
                <Clipboard size={22} className="text-red-600" />
                Active Incidents
              </h3>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {incidents.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  No active incidents.
                </div>
              ) : (
                incidents.map((incident) => {
                  const style =
                    incidentStyles[incident.type] || incidentStyles.update;

                  return (
                    <div
                      key={incident.id}
                      onClick={() => setSelectedIncidentId(incident.id)}
                      className={`cursor-pointer rounded-r-lg border-l-4 ${style.border} ${style.bg} p-3 transition hover:shadow-md ${
                        selectedIncidentId === incident.id
                          ? "ring-2 ring-blue-500"
                          : ""
                      }`}
                    >
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <span className={`text-xs font-bold ${style.text}`}>
                          {incident.level}
                        </span>

                        <span className="text-xs text-gray-500">
                          {incident.time}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-gray-900">
                        {incident.title}
                      </h4>

                      <p className="mt-1 text-sm leading-5 text-gray-500">
                        {incident.description}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RiskMap;
