import React, { useEffect, useRef, useState } from "react";
import {
  Users,
  TriangleAlert,
  Truck,
  House,
  TrendingUp,
  CheckCircle,
  Info,
  Map as MapIcon,
  Layers,
  ClipboardList,
  PlayCircle,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  Waves,
  Gauge,
} from "lucide-react";
import gsap from "gsap";
import FloodMap from "./FloodMap";
import { getDashboardLive, runSimulation } from "../api/floodSenserApi";

const RiskMap = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [simulationOpen, setSimulationOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [incidentFilter, setIncidentFilter] = useState("all");

  const containerRef = useRef(null);
  const kpiGridRef = useRef(null);
  const simDrawerRef = useRef(null);

  // Definitive scenario descriptions with to-the-point button labels and telemetry parameters
  const scenarios = [
    {
      id: "normal",
      name: "1. Baseline Flow",
      badge: "Normal Routine",
      buttonLabel: "Simulate Baseline Flow",
      level: "223.8 m",
      rain: "8 mm / 24h",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      activeBorder: "border-emerald-500 bg-emerald-50/70",
      cardColor: "hover:border-emerald-400 bg-emerald-50/30",
      desc: "Low catchment precipitation. River channel within stable non-flood capacity.",
    },
    {
      id: "watch",
      name: "2. Heavy-Rain Watch",
      badge: "Elevated Inflow",
      buttonLabel: "Simulate Heavy Rain",
      level: "224.6 m",
      rain: "42 mm / 24h",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
      activeBorder: "border-amber-500 bg-amber-50/70",
      cardColor: "hover:border-amber-400 bg-amber-50/30",
      desc: "Sustained upstream catchment downpour triggers pre-alert monitoring.",
    },
    {
      id: "alert",
      name: "3. Bankfull Alert",
      badge: "Warning Level",
      buttonLabel: "Simulate Bankfull Rise",
      level: "226.2 m",
      rain: "74 mm / 24h",
      badgeColor: "bg-orange-100 text-orange-800 border-orange-300",
      activeBorder: "border-orange-500 bg-orange-50/70",
      cardColor: "hover:border-orange-400 bg-orange-50/30",
      desc: "Warning threshold reached (226.2m). Shelters and rescue teams readied.",
    },
    {
      id: "warning",
      name: "4. Flood Emergency Breach",
      badge: "Crisis Evacuation",
      buttonLabel: "Simulate Flood Emergency",
      level: "227.4 m",
      rain: "112 mm / 24h",
      badgeColor: "bg-red-100 text-red-800 border-red-300",
      activeBorder: "border-red-500 bg-red-50/70",
      cardColor: "hover:border-red-400 bg-red-50/30",
      desc: "Danger threshold exceeded (227.4m). Critical inundation and emergency mobilization.",
    },
  ];

  // Fetch live dashboard data
  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      if (selectedScenario) return;

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

    loadDashboard();
    const interval = setInterval(loadDashboard, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedScenario]);

  // GSAP initial load entrance animation
  useEffect(() => {
    if (!loading && dashboard && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(".gsap-header", {
          opacity: 0,
          y: -15,
          duration: 0.6,
          ease: "power2.out",
        });

        gsap.from(".gsap-kpi-card", {
          opacity: 0,
          y: 20,
          stagger: 0.08,
          duration: 0.6,
          ease: "power3.out",
        });

        gsap.from(".gsap-main-grid", {
          opacity: 0,
          y: 20,
          duration: 0.7,
          delay: 0.2,
          ease: "power2.out",
        });
      }, containerRef);

      return () => ctx.revert();
    }
  }, [loading]);

  // GSAP drawer slide animation when simulationOpen changes
  useEffect(() => {
    if (simDrawerRef.current) {
      if (simulationOpen) {
        gsap.fromTo(
          simDrawerRef.current,
          { opacity: 0, height: 0, scale: 0.98 },
          { opacity: 1, height: "auto", scale: 1, duration: 0.45, ease: "power3.out" }
        );
      }
    }
  }, [simulationOpen]);

  const selectScenario = async (scenario) => {
    setSimulationLoading(true);
    try {
      const data = await runSimulation(scenario.id);
      setDashboard(data);
      setSelectedScenario(scenario.id);
      setError(null);

      // Flash highlight animation on metric values
      if (kpiGridRef.current) {
        gsap.fromTo(
          ".kpi-val",
          { scale: 1.12, color: "#7c3aed" },
          { scale: 1, color: "#002045", duration: 0.6, ease: "elastic.out(1, 0.4)" }
        );
      }
    } catch (err) {
      console.error("Failed to run simulation:", err);
      setError(err.message);
    } finally {
      setSimulationLoading(false);
    }
  };

  const returnToLive = async () => {
    setSelectedScenario(null);
    setSimulationLoading(true);
    try {
      const data = await getDashboardLive();
      setDashboard(data);
      setError(null);
    } catch (err) {
      console.error("Failed to return to live:", err);
    } finally {
      setSimulationLoading(false);
    }
  };

  const incidentStyles = {
    critical: {
      border: "border-red-500",
      bg: "bg-red-50/90",
      text: "text-red-700",
      tag: "bg-red-100 text-red-800",
    },
    warning: {
      border: "border-amber-500",
      bg: "bg-amber-50/90",
      text: "text-amber-700",
      tag: "bg-amber-100 text-amber-800",
    },
    update: {
      border: "border-blue-500",
      bg: "bg-blue-50/90",
      text: "text-blue-700",
      tag: "bg-blue-100 text-blue-800",
    },
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-[#faf9fd]">
        <div className="text-center p-8 rounded-2xl bg-white border border-slate-200 shadow-sm max-w-sm">
          <div className="relative mx-auto mb-4 h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
            <Waves size={20} className="absolute inset-0 m-auto text-blue-600 animate-pulse" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Initializing Flood Sense</h3>
          <p className="mt-1 text-xs text-slate-500">
            Ingesting CWC telemetry and running spatial risk models...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !dashboard) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-[#faf9fd] px-4">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <TriangleAlert size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Unable to connect to Flood Sense
          </h2>
          <p className="mt-2 text-sm text-red-600">
            {error || "No dashboard telemetry received from the server."}
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-[#002045] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#002e63]"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  const kpis = dashboard.kpi_metrics || {};
  const alert = dashboard.alert || {};
  const telemetry = dashboard.telemetry || {};
  const telemetryMode = telemetry.data_mode;
  const isHistoricalReplay = telemetryMode === "HISTORICAL_REPLAY";

  // Incidents mapping
  const rawIncidents = (dashboard.active_incidents || []).map((incident) => {
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

  const filteredIncidents = rawIncidents.filter((inc) => {
    if (incidentFilter === "all") return true;
    return inc.type === incidentFilter;
  });

  // Calculate river danger percentage for progress gauge
  const currentWaterLevel = alert.current_water_level_m ?? telemetry.melli_water_level_m ?? 220.0;
  const warningLevel = alert.warning_level_m ?? 226.2;
  const dangerLevel = alert.danger_level_m ?? 227.4;
  const baseLevel = 215.0;
  const levelPercentage = Math.min(
    100,
    Math.max(0, ((currentWaterLevel - baseLevel) / (dangerLevel + 1.0 - baseLevel)) * 100)
  );

  return (
    <div ref={containerRef} className="min-h-screen bg-[#faf9fd] text-[#1a1c1e]">
      <main className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-6 md:px-8">
        
        {/* ================= DASHBOARD HEADER ================= */}
        <div className="gsap-header flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-5 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800 uppercase tracking-wider">
                Teesta Basin · Melli Gauge
              </span>
              <span className="text-xs text-slate-400">Station ID: 024-MBDNG</span>
            </div>
            
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#002045] md:text-3xl">
              Official Flood Response & Risk Dashboard
            </h2>

            {/* Status Beacon Bar */}
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
              <span
                className={`relative flex h-2.5 w-2.5 rounded-full ${
                  selectedScenario
                    ? "bg-violet-600 animate-ping"
                    : isHistoricalReplay
                    ? "bg-amber-500"
                    : "bg-emerald-500 animate-pulse"
                }`}
              />

              <span
                className={`font-bold uppercase tracking-wider ${
                  selectedScenario
                    ? "text-violet-800 font-extrabold"
                    : isHistoricalReplay
                    ? "text-amber-800"
                    : "text-emerald-700"
                }`}
              >
                {selectedScenario
                  ? "SIMULATION ACTIVE"
                  : isHistoricalReplay
                  ? "VERIFIED REPLAY STREAM"
                  : "LIVE CWC DATA STREAM"}
              </span>

              <span className="text-slate-500">
                · {selectedScenario
                  ? `Running scenario model: ${dashboard.simulation?.name || selectedScenario}`
                  : `Last synced: ${dashboard.last_updated || "Just now"}`}
              </span>
            </div>
          </div>

          {/* Action Control Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {selectedScenario && (
              <button
                type="button"
                onClick={returnToLive}
                disabled={simulationLoading}
                className="flex items-center gap-1.5 rounded-xl border border-violet-300 bg-violet-100 px-4 py-2 text-xs font-bold text-violet-900 transition hover:bg-violet-200 active:scale-95 disabled:opacity-50"
              >
                <RotateCcw size={14} />
                Reset to Live Telemetry
              </button>
            )}

            <button
              type="button"
              onClick={() => setSimulationOpen((open) => !open)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-xs active:scale-95 ${
                simulationOpen
                  ? "bg-slate-800 text-white hover:bg-slate-900"
                  : "bg-gradient-to-r from-violet-700 to-indigo-700 text-white hover:from-violet-800 hover:to-indigo-800 shadow-violet-500/20"
              }`}
            >
              <SlidersHorizontal size={15} />
              {simulationOpen ? "Close Simulation Studio" : "Scenario Simulation Studio"}
            </button>
          </div>
        </div>

        {/* ================= SIMULATION STUDIO DRAWER ================= */}
        {simulationOpen && (
          <div
            ref={simDrawerRef}
            className="overflow-hidden rounded-2xl border-2 border-violet-300/80 bg-gradient-to-br from-violet-50/95 via-white to-indigo-50/90 p-5 shadow-md shadow-violet-200/50"
          >
            <div className="flex flex-col justify-between gap-3 border-b border-violet-200/60 pb-4 md:flex-row md:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-violet-700" />
                  <h3 className="text-base font-bold text-violet-950">
                    Hydrological What-If Model Simulator
                  </h3>
                </div>
                <p className="mt-0.5 text-xs text-violet-800">
                  Select a simulation scenario to rerun the Quantile LSTM forecast and spatial flood inundation models with customized telemetry.
                </p>
              </div>

              {simulationLoading && (
                <div className="flex items-center gap-2 rounded-lg bg-violet-200/70 px-3 py-1 text-xs font-bold text-violet-900">
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-700 border-t-transparent" />
                  <span>Computing Hydro Models...</span>
                </div>
              )}
            </div>

            {/* Scenario Buttons Grid with To-the-Point Nomenclature */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {scenarios.map((scenario) => {
                const isActive = selectedScenario === scenario.id;

                return (
                  <div
                    key={scenario.id}
                    className={`flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 ${
                      isActive
                        ? `${scenario.activeBorder} shadow-sm ring-2 ring-violet-600 ring-offset-1`
                        : `border-slate-200 bg-white ${scenario.cardColor}`
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-extrabold text-slate-900">
                          {scenario.name}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide border ${scenario.badgeColor}`}
                        >
                          {scenario.badge}
                        </span>
                      </div>

                      {/* Telemetry specs chip */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                          🌊 Gauge: <strong className="font-mono">{scenario.level}</strong>
                        </span>
                        <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                          🌧️ Rain: <strong className="font-mono">{scenario.rain}</strong>
                        </span>
                      </div>

                      <p className="mt-2 text-xs leading-relaxed text-slate-600">
                        {scenario.desc}
                      </p>
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      disabled={simulationLoading}
                      onClick={() => selectScenario(scenario)}
                      className={`mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 px-3 text-xs font-bold transition-all disabled:opacity-50 ${
                        isActive
                          ? "bg-violet-700 text-white shadow-xs"
                          : "bg-slate-900 text-white hover:bg-violet-700 active:scale-95"
                      }`}
                    >
                      {isActive ? (
                        <>
                          <CheckCircle size={14} />
                          Active Scenario
                        </>
                      ) : (
                        <>
                          <PlayCircle size={14} />
                          {scenario.buttonLabel}
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Active Simulation Status Banner */}
            {selectedScenario && dashboard.simulation && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet-300 bg-white/90 p-3.5 text-xs text-violet-950">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-violet-600 animate-ping" />
                  <span>
                    <strong>Active Output:</strong> {dashboard.simulation.name} — {dashboard.simulation.description}{" "}
                    <span className="text-violet-700 font-medium font-mono">({dashboard.simulation.assumptions})</span>
                  </span>
                </div>
                <button
                  onClick={returnToLive}
                  className="font-bold text-violet-700 underline hover:text-violet-950"
                >
                  Exit Simulation
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= RIVER WATER LEVEL GAUGE BAR ================= */}
        <div className="gsap-header rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Gauge size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#002045]">
                    Melli CWC River Stage Meter
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                      currentWaterLevel >= dangerLevel
                        ? "bg-red-100 text-red-800"
                        : currentWaterLevel >= warningLevel
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {alert.tier || "Routine Monitoring"}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Real-time gauge level vs India CWC Warning ({warningLevel}m) & Danger ({dangerLevel}m) levels
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
              <div>
                <span className="text-slate-500">Current: </span>
                <strong className="text-base font-extrabold text-[#002045] font-mono">
                  {currentWaterLevel.toFixed(2)} m
                </strong>
              </div>
              <div className="h-6 w-px bg-slate-200 hidden sm:block" />
              <div>
                <span className="text-amber-700 font-semibold">Warning: </span>
                <strong className="font-mono">{warningLevel} m</strong>
              </div>
              <div className="h-6 w-px bg-slate-200 hidden sm:block" />
              <div>
                <span className="text-red-700 font-semibold">Danger: </span>
                <strong className="font-mono">{dangerLevel} m</strong>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                currentWaterLevel >= dangerLevel
                  ? "bg-red-600"
                  : currentWaterLevel >= warningLevel
                  ? "bg-amber-500"
                  : "bg-blue-600"
              }`}
              style={{ width: `${Math.max(5, levelPercentage)}%` }}
            />
          </div>
        </div>

        {/* ================= KPI METRIC CARDS ================= */}
        <div ref={kpiGridRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Total Affected Population */}
          <div className="gsap-kpi-card relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {kpis.total_affected_population?.title || "Affected Population"}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <Users size={17} />
              </div>
            </div>

            <div className="my-2">
              <div className="kpi-val text-3xl font-extrabold text-[#002045] font-mono">
                {kpis.total_affected_population?.value ?? "--"}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-red-600">
              <TrendingUp size={14} />
              <span>{kpis.total_affected_population?.trend || "High exposure"}</span>
            </div>
          </div>

          {/* High Risk Zones */}
          <div className="gsap-kpi-card relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {kpis.active_high_risk_zones?.title || "Active High Risk Zones"}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <TriangleAlert size={17} />
              </div>
            </div>

            <div className="my-2">
              <div className="kpi-val text-3xl font-extrabold text-[#002045] font-mono">
                {kpis.active_high_risk_zones?.value ?? "--"}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-red-600">
              <TriangleAlert size={14} />
              <span>{kpis.active_high_risk_zones?.subtext || "Monitored zones"}</span>
            </div>
          </div>

          {/* Forecast Peak (P90) */}
          <div className="gsap-kpi-card relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {kpis.dispatched_rescue_teams?.title || "Forecast Peak (P90)"}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Truck size={17} />
              </div>
            </div>

            <div className="my-2">
              <div className="kpi-val text-3xl font-extrabold text-[#002045] font-mono">
                {kpis.dispatched_rescue_teams?.value ?? "--"}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
              <CheckCircle size={14} />
              <span>{kpis.dispatched_rescue_teams?.subtext || "Bi-LSTM 24h forecast"}</span>
            </div>
          </div>

          {/* Shelter Occupancy */}
          <div className="gsap-kpi-card relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {kpis.shelter_occupancy?.title || "Shelter Occupancy"}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <House size={17} />
              </div>
            </div>

            <div className="my-2">
              <div className="kpi-val text-3xl font-extrabold text-[#002045] font-mono">
                {kpis.shelter_occupancy?.value ?? "--"}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
              <Info size={14} />
              <span>{kpis.shelter_occupancy?.subtext || "Capacity available"}</span>
            </div>
          </div>
        </div>

        {/* ================= MAP + INCIDENTS SPLIT VIEW ================= */}
        <div className="gsap-main-grid grid h-auto grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* ================= MAP CONTAINER ================= */}
          <div className="relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs lg:col-span-2">
            
            {/* Map Header */}
            <div className="z-10 flex items-center justify-between border-b border-slate-200/80 bg-slate-50/90 px-4 py-3">
              <div className="flex items-center gap-2">
                <MapIcon size={18} className="text-blue-700" />
                <h3 className="text-sm font-bold text-[#002045]">
                  High-Resolution Geospatial Flood Risk Map
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 font-semibold">
                  <Layers size={13} className="text-slate-400" />
                  <span>XGBoost Inundation</span>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="relative min-h-[480px] flex-1 bg-slate-100">
              <FloodMap
                dashboard={dashboard}
                selectedIncidentId={selectedIncidentId}
                onIncidentSelect={setSelectedIncidentId}
              />

              {/* Map Floating Legend */}
              <div className="absolute bottom-4 left-4 z-[1000] rounded-xl border border-slate-200/90 bg-white/95 p-3.5 shadow-lg backdrop-blur-sm max-w-[200px]">
                <h4 className="mb-2 text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Risk Legend
                </h4>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                    <span className="font-medium text-slate-700">Critical Flood Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span className="font-medium text-slate-700">Moderate Inflow</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                    <span className="font-medium text-slate-700">Model Hotspot</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= INCIDENTS / HOTSPOTS LIST ================= */}
          <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
            
            {/* Hotspot Header */}
            <div className="border-b border-slate-200/80 bg-slate-50/90 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList size={18} className="text-red-600" />
                  <h3 className="text-sm font-bold text-[#002045]">
                    Model Detected Hotspots
                  </h3>
                </div>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700 font-mono">
                  {rawIncidents.length}
                </span>
              </div>

              {/* Filter Tabs */}
              <div className="mt-3 flex gap-1 rounded-lg bg-slate-200/70 p-1 text-[11px] font-semibold">
                {["all", "critical", "warning", "update"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setIncidentFilter(tab)}
                    className={`flex-1 rounded-md py-1 capitalize transition ${
                      incidentFilter === tab
                        ? "bg-white text-slate-900 font-bold shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Hotspots scroll container */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4 max-h-[500px]">
              {filteredIncidents.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  No active risk hotspots matching this filter.
                </div>
              ) : (
                filteredIncidents.map((incident) => {
                  const style = incidentStyles[incident.type] || incidentStyles.update;
                  const isSelected = selectedIncidentId === incident.id;

                  return (
                    <div
                      key={incident.id}
                      onClick={() => setSelectedIncidentId(incident.id)}
                      className={`cursor-pointer rounded-xl border-l-4 p-3.5 transition hover:shadow-md ${
                        style.border
                      } ${style.bg} ${
                        isSelected
                          ? "ring-2 ring-blue-600 ring-offset-1"
                          : "hover:bg-opacity-100"
                      }`}
                    >
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${style.tag}`}
                        >
                          {incident.level}
                        </span>

                        <span className="text-[11px] font-medium text-slate-500">
                          {incident.time}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900">
                        {incident.title}
                      </h4>

                      <p className="mt-1 text-xs leading-relaxed text-slate-600">
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
