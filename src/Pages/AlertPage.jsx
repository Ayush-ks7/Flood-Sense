import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  AlertTriangle,
  Waves,
  MapPin,
  Clock,
  Radio,
  BellRing,
  ShieldAlert,
  Send,
  Navigation,
  CheckCircle,
  Flame,
  CloudRain,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import gsap from "gsap";
import { getDashboardLive } from "../api/floodSenserApi";

/* =========================================================
   SEVERITY STYLES & ICONS
========================================================= */

const severityStyles = {
  Emergency: {
    border: "border-red-300",
    bar: "bg-red-600",
    icon: ShieldAlert,
    iconColor: "text-red-600",
    badge: "text-red-800 bg-red-100 border-red-200",
  },
  Warning: {
    border: "border-amber-300",
    bar: "bg-amber-500",
    icon: AlertTriangle,
    iconColor: "text-amber-600",
    badge: "text-amber-800 bg-amber-100 border-amber-200",
  },
  Watch: {
    border: "border-blue-300",
    bar: "bg-blue-500",
    icon: CloudRain,
    iconColor: "text-blue-600",
    badge: "text-blue-800 bg-blue-100 border-blue-200",
  },
};

const getAlertSeverity = (backendSeverity) => {
  const severity = String(backendSeverity || "").toUpperCase();
  if (severity.includes("CRITICAL") || severity.includes("EMERGENCY")) {
    return "Emergency";
  }
  if (severity.includes("HIGH") || severity.includes("WARNING")) {
    return "Warning";
  }
  return "Watch";
};

/* =========================================================
   ALERT CARD COMPONENT
========================================================= */

function AlertCard({ alert }) {
  const styles = severityStyles[alert.severity] || severityStyles.Watch;
  const Icon = styles.icon;

  return (
    <article
      className={`gsap-alert-card relative overflow-hidden rounded-2xl border ${styles.border} bg-white p-6 shadow-xs transition hover:shadow-md`}
    >
      {/* Left severity highlight bar */}
      <div className={`absolute bottom-0 left-0 top-0 w-1.5 ${styles.bar}`} />

      {/* Header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 ${styles.iconColor}`}>
            <Icon size={18} />
          </div>

          <span
            className={`rounded-md border px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider ${styles.badge}`}
          >
            {alert.severity}
          </span>
        </div>

        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 font-mono">
          <Clock size={13} />
          {alert.issued}
        </span>
      </div>

      {/* Title */}
      <h3 className="mb-2 text-xl font-bold text-[#002045]">
        {alert.title}
      </h3>

      {/* Location */}
      {alert.location && (
        <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          <MapPin size={14} className="text-red-500" />
          <span>{alert.location}</span>
        </div>
      )}

      {/* Description */}
      <p className="mb-4 text-sm leading-relaxed text-slate-600">
        {alert.description || "No additional critical details reported for this incident."}
      </p>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={
            alert.severity === "Emergency"
              ? "flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-red-700 active:scale-95 shadow-xs"
              : "flex items-center gap-2 rounded-xl bg-[#002045] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#002f66] active:scale-95 shadow-xs"
          }
        >
          <Navigation size={14} />
          {alert.action}
        </button>
      </div>
    </article>
  );
}

/* =========================================================
   TOGGLE COMPONENT
========================================================= */

function Toggle({ label, sublabel, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
      <div>
        <div className="text-xs font-bold text-slate-900">{label}</div>
        {sublabel && <div className="text-[11px] text-slate-500">{sublabel}</div>}
      </div>

      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />
        <div className="h-5 w-9 rounded-full bg-slate-300 transition peer-checked:bg-blue-600 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white shadow-xs" />
      </div>
    </label>
  );
}

/* =========================================================
   ALERT PAGE MAIN
========================================================= */

const AlertPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");

  const [smsAlerts, setSmsAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [sirenAlerts, setSirenAlerts] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        const data = await getDashboardLive();
        if (!mounted) return;
        setDashboard(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load alert data:", err);
        if (!mounted) return;
        setError(err?.message || "Unable to connect to Flood Sense server.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();
    const interval = setInterval(loadDashboard, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // GSAP entrance animation
  useEffect(() => {
    if (!loading && dashboard && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(".gsap-fade-in", {
          opacity: 0,
          y: -15,
          duration: 0.5,
          ease: "power2.out",
        });

        gsap.from(".gsap-alert-card", {
          opacity: 0,
          y: 20,
          stagger: 0.08,
          duration: 0.6,
          ease: "power3.out",
        });
      }, containerRef);

      return () => ctx.revert();
    }
  }, [loading, severityFilter]);

  const alertData = dashboard?.alert || {};
  const telemetry = dashboard?.telemetry || {};

  const alerts = useMemo(() => {
    const backendIncidents = dashboard?.active_incidents || [];

    return backendIncidents.map((incident, index) => {
      const uiSeverity = getAlertSeverity(incident?.severity);

      return {
        id: incident?.id ?? `incident-${index}`,
        severity: uiSeverity,
        issued: incident?.timestamp || "Recently",
        title: incident?.title || "Flood Incident",
        location: incident?.location || "Teesta Corridor Sector",
        description: [incident?.status, incident?.details].filter(Boolean).join(". "),
        action: uiSeverity === "Emergency" ? "Evacuation Protocol" : "View Safe Routing",
        originalSeverity: incident?.severity,
      };
    });
  }, [dashboard]);

  const filteredAlerts = useMemo(() => {
    const query = search.toLowerCase().trim();

    return alerts.filter((alert) => {
      const matchesSeverity =
        severityFilter === "All" || alert.severity === severityFilter;

      const searchableText = [
        alert.title,
        alert.description,
        alert.location,
        alert.originalSeverity,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);

      return matchesSeverity && matchesSearch;
    });
  }, [alerts, search, severityFilter]);

  const alertCounts = useMemo(() => {
    return {
      emergency: alerts.filter((a) => a.severity === "Emergency").length,
      warning: alerts.filter((a) => a.severity === "Warning").length,
      watch: alerts.filter((a) => a.severity === "Watch").length,
    };
  }, [alerts]);

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-[#faf9fd]">
        <div className="text-center p-8 rounded-2xl bg-white border border-slate-200 shadow-sm max-w-sm">
          <div className="relative mx-auto mb-4 h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-red-100 border-t-red-600 animate-spin" />
            <AlertTriangle size={20} className="absolute inset-0 m-auto text-red-600 animate-pulse" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Loading Active Alerts</h3>
          <p className="mt-1 text-xs text-slate-500">
            Checking real-time danger thresholds and telemetry warnings...
          </p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-[#faf9fd] px-4">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Unable to load flood alerts</h2>
          <p className="mt-2 text-sm text-red-600">{error || "No response received."}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-[#002045] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#002e63]"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#faf9fd] text-[#1a1c1e]">
      <main className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
        
        {/* ================= PAGE HEADING ================= */}
        <section className="gsap-fade-in mb-8">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
                </span>
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                  Live Early Warning Center
                </span>
              </div>

              <h2 className="text-2xl font-extrabold tracking-tight text-[#002045] md:text-4xl">
                Real-Time Flood Warnings & Evacuation Advisories
              </h2>

              <p className="mt-1 text-sm text-slate-600 max-w-2xl">
                Verified hydrometeorological alerts, evacuation corridor directives, and danger status updates for the Melli – Teesta river corridor.
              </p>
            </div>

            {/* System Status Pill */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Current Corridor Status
              </span>
              <div className="mt-1 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-600 animate-pulse" />
                <span className="text-base font-extrabold text-[#002045]">
                  {alertData.tier || "MONITORING"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                River Stage: <strong>{alertData.current_water_level_m ?? telemetry.melli_water_level_m ?? "--"}m</strong>
              </p>
            </div>
          </div>
        </section>

        {/* ================= SUMMARY METRIC PILLS ================= */}
        <section className="gsap-fade-in mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-red-200 bg-red-50/70 p-4 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-red-700">
              🚨 Emergency Alerts
            </span>
            <div className="my-1 text-3xl font-extrabold text-[#002045] font-mono">
              {alertCounts.emergency}
            </div>
            <p className="text-xs text-red-600 font-medium">Immediate evacuation & safe zones</p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              ⚠️ Warning Advisories
            </span>
            <div className="my-1 text-3xl font-extrabold text-[#002045] font-mono">
              {alertCounts.warning}
            </div>
            <p className="text-xs text-amber-600 font-medium">High inundation probability</p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              🌧️ Watch & Monitoring
            </span>
            <div className="my-1 text-3xl font-extrabold text-[#002045] font-mono">
              {alertCounts.watch}
            </div>
            <p className="text-xs text-blue-600 font-medium">Telemetry trend watch</p>
          </div>
        </section>

        {/* ================= MAIN SPLIT GRID ================= */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* LEFT: ALERTS FEED */}
          <section className="flex flex-col gap-5 lg:col-span-8">
            
            {/* Search & Filter Bar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by locality, sector, or alert keywords..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Severity Filter Pills */}
                <div className="flex gap-1 rounded-xl bg-slate-100 p-1 text-xs font-bold">
                  {["All", "Emergency", "Warning", "Watch"].map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSeverityFilter(sev)}
                      className={`rounded-lg px-3 py-1.5 transition ${
                        severityFilter === sev
                          ? "bg-white text-slate-900 shadow-xs font-extrabold"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Alerts Stream List */}
            <div className="space-y-4">
              {filteredAlerts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-xs text-slate-500">
                  No active flood alerts match your search filter.
                </div>
              ) : (
                filteredAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))
              )}
            </div>
          </section>

          {/* RIGHT: BROADCAST CONTROLS & EMERGENCY DIRECTIVES */}
          <aside className="space-y-5 lg:col-span-4">
            
            {/* Emergency Broadcast Channel Box */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Radio size={18} className="text-blue-600" />
                <h3 className="text-sm font-bold text-[#002045]">
                  Public Warning Channels
                </h3>
              </div>

              <div className="mt-3 space-y-1 divide-y divide-slate-100">
                <Toggle
                  label="SMS Direct Broadcast"
                  sublabel="Cellular tower emergency push"
                  checked={smsAlerts}
                  onChange={() => setSmsAlerts((v) => !v)}
                />
                <Toggle
                  label="App Push Notifications"
                  sublabel="Real-time geo-fenced trigger"
                  checked={pushAlerts}
                  onChange={() => setPushAlerts((v) => !v)}
                />
                <Toggle
                  label="Acoustic Flood Siren"
                  sublabel="Corridor siren network"
                  checked={sirenAlerts}
                  onChange={() => setSirenAlerts((v) => !v)}
                />
              </div>

              <div className="mt-4 rounded-xl bg-blue-50/80 p-3 text-[11px] font-medium text-blue-900">
                ⚡ Warning broadcasts are verified by the State Disaster Management Authority (SDMA).
              </div>
            </div>

            {/* River Corridor Quick Facts */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Waves size={18} className="text-blue-600" />
                <h3 className="text-sm font-bold text-[#002045]">
                  Teesta River Telemetry
                </h3>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Melli Gauge Level</span>
                  <strong className="font-mono">{telemetry.melli_water_level_m ?? "--"} m</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">1h Level Rise</span>
                  <strong className="font-mono text-amber-600">{telemetry.melli_rise_1h ?? "+0.00"} m/h</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Catchment 24h Rain</span>
                  <strong className="font-mono">{telemetry.rain_prev_1d ?? "--"} mm</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Catchment 3-day Total</span>
                  <strong className="font-mono">{telemetry.rain_prev_3d ?? "--"} mm</strong>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default AlertPage;