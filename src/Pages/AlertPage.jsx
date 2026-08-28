import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Map,
  Info,
  Megaphone,
  AlertTriangle,
  Waves,
  MapPin,
  Clock,
} from "lucide-react";

import { getDashboardLive } from "../api/floodSenserApi";
import FloodMap from "../Pages/FloodMap";

/* =========================================================
   SEVERITY STYLES
========================================================= */

const severityStyles = {
  Emergency: {
    border: "border-red-300",
    bar: "bg-red-500",
    icon: "text-red-500",
    badge: "text-red-800 bg-red-100",
  },

  Warning: {
    border: "border-orange-300",
    bar: "bg-orange-500",
    icon: "text-orange-500",
    badge: "text-orange-800 bg-orange-100",
  },

  Watch: {
    border: "border-yellow-300",
    bar: "bg-yellow-500",
    icon: "text-yellow-600",
    badge: "text-yellow-800 bg-yellow-100",
  },
};

/* =========================================================
   CONVERT BACKEND SEVERITY TO UI SEVERITY
========================================================= */

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
   GET ICON FOR ALERT
========================================================= */

const getAlertIcon = (severity) => {
  if (severity === "Emergency") {
    return "warning";
  }

  if (severity === "Warning") {
    return "flood";
  }

  return "rainy";
};

/* =========================================================
   ALERT CARD
========================================================= */

function AlertCard({ alert }) {
  const styles = severityStyles[alert.severity] || severityStyles.Watch;

  return (
    <article
      className={`relative overflow-hidden rounded-xl border ${styles.border} bg-white p-6 shadow-sm`}
    >
      {/* Left severity bar */}
      <div
        className={`absolute bottom-0 left-0 top-0 w-1.5 ${styles.bar} ${
          alert.severity === "Emergency" ? "pulse-red" : ""
        }`}
      />

      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* Icon */}
          <span
            className={`material-symbols-outlined ${styles.icon}`}
            style={{
              fontVariationSettings: "'FILL' 1",
            }}
          >
            {alert.icon}
          </span>

          {/* Severity */}
          <span
            className={`rounded-md px-2 py-1 text-xs font-bold uppercase tracking-wider ${styles.badge}`}
          >
            {alert.severity}
          </span>

          {/* Time */}
          <span className="flex items-center gap-1 text-sm text-[#43474e]">
            <Clock size={14} />
            Issued: {alert.issued}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="mb-2 text-2xl font-semibold leading-8 text-[#002045]">
        {alert.title}
      </h3>

      {/* Location */}
      {alert.location && (
        <div className="mb-3 flex items-center gap-1.5 text-sm font-medium text-[#43474e]">
          <MapPin size={15} />
          <span>{alert.location}</span>
        </div>
      )}

      {/* Description */}
      <p className="mb-4 text-base leading-6 text-[#43474e]">
        {alert.description || "No additional details available."}
      </p>

      {/* Action */}
      <button
        type="button"
        className={
          alert.severity === "Emergency"
            ? "rounded-lg bg-[#1a365d] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#002045]"
            : "rounded-lg border border-[#74777f] px-6 py-2 text-sm font-semibold text-[#002045] transition-colors hover:bg-[#f4f3f7]"
        }
      >
        {alert.action}
      </button>
    </article>
  );
}

/* =========================================================
   TOGGLE
========================================================= */

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between">
      <span className="text-sm font-semibold">{label}</span>

      <span className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />

        <span className="block h-5 w-9 rounded-full bg-[#455f88] transition peer-checked:bg-[#1960a3] after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full" />
      </span>
    </label>
  );
}

/* =========================================================
   ALERT PAGE
========================================================= */

const AlertPage = () => {
  /* =======================================================
     STATE
  ======================================================= */

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("All Severities");
  const [myLocation, setMyLocation] = useState(false);

  const [sms, setSms] = useState(true);
  const [push, setPush] = useState(true);

  /* =======================================================
     FETCH LIVE DASHBOARD
  ======================================================= */

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

        setError(
          err?.message || "Unable to connect to Flood-Sense backend."
        );
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

  /* =======================================================
     BACKEND DATA
     
     These are NOT hooks.
     Keeping them here makes the rest of the component
     easier to read.
  ======================================================= */

  const alertData = dashboard?.alert || {};
  const telemetry = dashboard?.telemetry || {};

  /* =======================================================
     CONVERT BACKEND INCIDENTS
  ======================================================= */

  const alerts = useMemo(() => {
    const backendIncidents = dashboard?.active_incidents || [];

    return backendIncidents.map((incident, index) => {
      const uiSeverity = getAlertSeverity(incident?.severity);

      return {
        id: incident?.id ?? `incident-${index}`,

        severity: uiSeverity,

        icon: getAlertIcon(uiSeverity),

        issued: incident?.timestamp || "Recently",

        title: incident?.title || "Flood Incident",

        location: incident?.location || "",

        description: [incident?.status, incident?.details]
          .filter(Boolean)
          .join(". "),

        action:
          uiSeverity === "Emergency"
            ? "View Details & Routes"
            : "View Details",

        latitude: incident?.latitude,
        longitude: incident?.longitude,

        originalSeverity: incident?.severity,
      };
    });
  }, [dashboard]);

  /* =======================================================
     FILTER ALERTS
  ======================================================= */

  const filteredAlerts = useMemo(() => {
    const query = search.toLowerCase().trim();

    return alerts.filter((alert) => {
      const matchesSeverity =
        severity === "All Severities" ||
        alert.severity === severity;

      const searchableText = [
        alert.title,
        alert.description,
        alert.location,
        alert.originalSeverity,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      /*
       * My Location filtering is not enabled yet because
       * the current backend data does not provide the
       * user's actual location.
       */

      return matchesSeverity && matchesSearch;
    });
  }, [alerts, search, severity]);

  /* =======================================================
     ALERT COUNTS
  ======================================================= */

  const alertCounts = useMemo(() => {
    return {
      emergency: alerts.filter(
        (alert) => alert.severity === "Emergency"
      ).length,

      warning: alerts.filter(
        (alert) => alert.severity === "Warning"
      ).length,

      watch: alerts.filter(
        (alert) => alert.severity === "Watch"
      ).length,
    };
  }, [alerts]);

  /* =======================================================
     LOADING STATE
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9fd]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="text-sm font-medium text-gray-600">
            Loading Flood-Sense alerts...
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Connecting to live flood monitoring data
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR STATE
  ======================================================= */

  if (error || !dashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9fd] p-6">
        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <AlertTriangle
            size={36}
            className="mx-auto mb-3 text-red-600"
          />

          <h2 className="text-lg font-semibold text-red-700">
            Unable to load flood alerts
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error ||
              "No dashboard data received from the backend."}
          </p>

          <p className="mt-4 text-xs text-gray-500">
            Make sure your FastAPI server is running on port 8000.
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-[#1a365d] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#002045]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#faf9fd] font-['Public_Sans',sans-serif] text-[#1a1c1e] antialiased">
      <main className="mx-auto max-w-[1440px] px-4 py-8 md:px-8 md:py-12">

        {/* =================================================
            PAGE HEADING
        ================================================= */}

        <section className="mb-12">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-3 w-3 animate-pulse rounded-full bg-red-600" />

                <span className="text-sm font-bold text-red-600">
                  LIVE ALERT SYSTEM
                </span>
              </div>

              <h2 className="mb-4 text-3xl font-semibold leading-10 text-[#002045] md:text-5xl md:leading-[56px]">
                Real-time Alerts & Warnings
              </h2>

              <p className="max-w-3xl text-lg leading-7 text-[#43474e]">
                Stay informed with the latest flood alerts, telemetry
                warnings, and emergency updates for the Melli – Teesta
                corridor.
              </p>
            </div>

            {/* Current alert */}
            <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Current System Status
              </div>

              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`h-3 w-3 rounded-full ${
                    alertData.tier === "WARNING"
                      ? "bg-red-600"
                      : alertData.tier === "ALERT"
                        ? "bg-orange-500"
                        : "bg-yellow-500"
                  }`}
                />

                <span className="text-lg font-bold text-[#002045]">
                  {alertData.tier || "MONITORING"}
                </span>
              </div>

              <div className="mt-1 text-xs text-gray-500">
                {dashboard.last_updated || "Live"}
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            SUMMARY STRIP
        ================================================= */}

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="text-xs font-bold uppercase tracking-wide text-red-600">
              Emergency
            </div>

            <div className="mt-1 text-3xl font-bold text-[#002045]">
              {alertCounts.emergency}
            </div>

            <div className="text-xs text-red-700">
              Immediate action alerts
            </div>
          </div>

          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <div className="text-xs font-bold uppercase tracking-wide text-orange-600">
              Warning
            </div>

            <div className="mt-1 text-3xl font-bold text-[#002045]">
              {alertCounts.warning}
            </div>

            <div className="text-xs text-orange-700">
              High-risk conditions
            </div>
          </div>

          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <div className="text-xs font-bold uppercase tracking-wide text-yellow-700">
              Watch
            </div>

            <div className="mt-1 text-3xl font-bold text-[#002045]">
              {alertCounts.watch}
            </div>

            <div className="text-xs text-yellow-700">
              Conditions under monitoring
            </div>
          </div>

        </section>

        {/* =================================================
            GRID
        ================================================= */}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <section className="flex flex-col gap-6 lg:col-span-8">

            {/* Search */}
            <div className="rounded-xl border border-[#c4c6cf] bg-white p-4 shadow-sm">
              <div className="flex flex-col items-center gap-4 md:flex-row">

                <div className="relative w-full flex-grow">
                  <Search
                    size={19}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#43474e]"
                  />

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by location, incident, or alert..."
                    type="text"
                    className="w-full rounded-lg border border-[#c4c6cf] bg-[#faf9fd] py-2 pl-10 pr-4 text-base outline-none focus:border-[#1960a3] focus:ring-2 focus:ring-[#1960a3]"
                  />
                </div>

                <div className="flex w-full gap-4 md:w-auto">

                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="rounded-lg border border-[#c4c6cf] bg-[#faf9fd] px-4 py-2 text-base outline-none focus:border-[#1960a3] focus:ring-2 focus:ring-[#1960a3]"
                  >
                    <option>All Severities</option>
                    <option>Emergency</option>
                    <option>Warning</option>
                    <option>Watch</option>
                  </select>

                  <label className="flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg border border-[#c4c6cf] bg-[#faf9fd] px-4 py-2 transition-colors hover:bg-[#f4f3f7]">
                    <input
                      checked={myLocation}
                      onChange={(e) =>
                        setMyLocation(e.target.checked)
                      }
                      type="checkbox"
                      className="h-4 w-4 rounded text-[#002045]"
                    />

                    <span className="text-sm font-medium">
                      My Location
                    </span>
                  </label>

                </div>
              </div>
            </div>

            {/* Live data notice */}
            <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <Info
                size={20}
                className="mt-0.5 shrink-0 text-blue-600"
              />

              <div>
                <div className="text-sm font-bold text-blue-700">
                  Live Flood-Sense Feed
                </div>

                <p className="mt-1 text-xs leading-5 text-blue-700">
                  Alerts below are generated from the current backend
                  telemetry, forecast, spatial risk analysis, and active
                  incident stream.
                </p>
              </div>
            </div>

            {/* Alerts */}
            <div className="flex flex-col gap-4">

              {filteredAlerts.length ? (
                filteredAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                  />
                ))
              ) : (
                <div className="rounded-xl border border-[#c4c6cf] bg-white p-8 text-center text-[#43474e] shadow-sm">
                  <AlertTriangle
                    size={30}
                    className="mx-auto mb-3 text-gray-400"
                  />

                  <p className="font-semibold">
                    No alerts match your search.
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Try another location or severity.
                  </p>
                </div>
              )}

            </div>
          </section>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <aside className="flex flex-col gap-6 lg:col-span-4">

            {/* =================================================
                RISK MAP
            ================================================= */}

            <section className="rounded-xl border border-[#c4c6cf] bg-white p-6 shadow-sm">

              <h3 className="mb-4 flex items-center gap-2 text-2xl font-semibold leading-8 text-[#002045]">
                <Map size={23} />
                Regional Risk Overview
              </h3>

              <div className="overflow-hidden rounded-lg">
                <FloodMap dashboard={dashboard} />
              </div>

              {/* Temporary button until actual route is confirmed */}
              <button
                type="button"
                className="mt-4 block w-full rounded-lg bg-[#1a365d] px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-[#002045]"
                onClick={() => {
                  console.log(
                    "Open Interactive Risk Map clicked"
                  );
                }}
              >
                Open Interactive Risk Map
              </button>

              {/* Current water level */}
              <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">

                <div className="flex items-center gap-2 text-sm font-semibold text-[#002045]">
                  <Waves
                    size={18}
                    className="text-blue-600"
                  />

                  Current Water Level
                </div>

                <div className="mt-2 flex items-end justify-between">

                  <span className="text-3xl font-bold text-[#002045]">
                    {telemetry.melli_water_level_m ??
                      alertData.current_water_level_m ??
                      "--"}

                    <span className="ml-1 text-base font-medium">
                      m
                    </span>
                  </span>

                  <span className="text-xs text-gray-500">
                    Melli
                  </span>

                </div>
              </div>
            </section>

            {/* =================================================
                ALERT LEGEND
            ================================================= */}

            <section className="rounded-xl border border-[#c4c6cf] bg-white p-6 shadow-sm">

              <h3 className="mb-4 flex items-center gap-2 text-2xl font-semibold leading-8 text-[#002045]">
                <Info size={22} />
                Alert Legend
              </h3>

              <div className="flex flex-col gap-4">

                <div className="flex items-start gap-3">
                  <div className="mt-1 h-4 w-4 flex-shrink-0 rounded-full bg-red-500" />

                  <div>
                    <span className="block text-sm font-bold">
                      Emergency (Red)
                    </span>

                    <span className="text-sm leading-5 text-[#43474e]">
                      Immediate danger. Follow evacuation instructions
                      and emergency response guidance.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 h-4 w-4 flex-shrink-0 rounded-full bg-orange-500" />

                  <div>
                    <span className="block text-sm font-bold">
                      Warning (Orange)
                    </span>

                    <span className="text-sm leading-5 text-[#43474e]">
                      High-risk conditions detected. Prepare to move and
                      follow official instructions.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 h-4 w-4 flex-shrink-0 rounded-full bg-yellow-500" />

                  <div>
                    <span className="block text-sm font-bold">
                      Watch (Yellow)
                    </span>

                    <span className="text-sm leading-5 text-[#43474e]">
                      Conditions are being monitored. Stay alert for
                      changing conditions.
                    </span>
                  </div>
                </div>

              </div>
            </section>

            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            <section className="rounded-xl bg-[#1a365d] p-6 text-white shadow-sm">

              <h3 className="mb-2 flex items-center gap-2 text-2xl font-semibold leading-8">
                <Megaphone size={22} />
                Stay Updated
              </h3>

              <p className="mb-4 text-sm leading-5 opacity-90">
                Configure how you want to receive flood alerts and
                emergency updates.
              </p>

              <div className="mb-4 flex flex-col gap-3">

                <Toggle
                  label="SMS Alerts"
                  checked={sms}
                  onChange={(e) =>
                    setSms(e.target.checked)
                  }
                />

                <Toggle
                  label="Push Notifications"
                  checked={push}
                  onChange={(e) =>
                    setPush(e.target.checked)
                  }
                />

              </div>

              <button
                type="button"
                className="w-full rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#1a365d] transition-colors hover:bg-[#f4f3f7]"
              >
                Manage Preferences
              </button>

            </section>

          </aside>
        </div>
      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="mt-12 w-full border-t border-[#c4c6cf] bg-[#e3e2e6] py-12">

        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-4 md:grid-cols-3 md:px-8">

          <div>
            <div className="mb-4 text-2xl font-bold text-[#002045]">
              Flood-Sense
            </div>

            <p className="mb-4 text-base leading-6 text-[#43474e]">
              Real-time flood monitoring, risk analysis, and emergency
              response support for vulnerable regions.
            </p>

            <p className="text-xs text-gray-500">
              Live data source: Flood-Sense backend
            </p>
          </div>

          <div className="flex flex-wrap justify-start gap-x-8 gap-y-4 md:col-span-2 md:justify-end">

            {[
              "Resources",
              "Legal Information",
              "Support Contacts",
              "Privacy Policy",
              "Accessibility",
            ].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs font-semibold text-[#43474e] underline-offset-4 transition-all hover:text-[#002045] hover:underline"
              >
                {item}
              </a>
            ))}

          </div>
        </div>
      </footer>
    </div>
  );
};

export default AlertPage;