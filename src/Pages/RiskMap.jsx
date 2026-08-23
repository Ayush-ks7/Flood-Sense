import React from "react";
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

const RiskMap = () => {

  // THIS PART WILL BE REPLACED BY AN INCIDENT API
  const incidents = [
    {
      level: "CRITICAL",
      time: "10 min ago",
      title: "Levee Breach Reported",
      description:
        "Sector 4, structural integrity compromised. Immediate evacuation recommended.",
      type: "critical",
    },
    {
      level: "WARNING",
      time: "45 min ago",
      title: "Power Outage",
      description:
        "Community Shelter B operating on backup generators. 4 hours fuel remaining.",
      type: "warning",
    },
    {
      level: "UPDATE",
      time: "1 hr ago",
      title: "Rescue Team Deployment",
      description:
        "Team Alpha successfully reached stranded residents in Zone 2.",
      type: "update",
    },
    {
      level: "CRITICAL",
      time: "2 hrs ago",
      title: "Main Highway Flooded",
      description:
        "Route 66 impassable. Rerouting all emergency traffic to Route 9.",
      type: "critical",
    },
  ];

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
              <span className="h-3 w-3 animate-pulse rounded-full bg-red-600 [animation-duration:0.9s]"></span>

              <span className="text-sm font-bold text-red-600">
                LIVE DATA ACTIVE
              </span>

              <span className="text-sm text-gray-500">
                | Last updated: Today, 14:32 Local Time
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
              Total Affected Population
            </div>

            <div className="text-4xl font-bold text-[#002045]">42.5k</div>

            <div className="flex items-center gap-1 text-xs font-semibold text-red-600">
              <TrendingUp size={16} />
              +1.2k since 08:00
            </div>
          </div>

          {/* High Risk */}
          <div className="relative flex flex-col gap-2 overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-full bg-red-100 opacity-60" />

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <TriangleAlert size={20} className="text-red-600" />
              Active High-Risk Zones
            </div>

            <div className="text-4xl font-bold text-[#002045]">18</div>

            <div className="flex items-center gap-1 text-xs font-semibold text-red-600">
              <TriangleAlert size={16} />
              Critical Level Reached in 3 Zones
            </div>
          </div>

          {/* Rescue Teams */}
          <div className="relative flex flex-col gap-2 overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-full bg-blue-100 opacity-60" />

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Truck size={20} className="text-blue-600" />
              Dispatched Rescue Teams
            </div>

            <div className="text-4xl font-bold text-[#002045]">124</div>

            <div className="flex items-center gap-1 text-xs font-semibold text-blue-600">
              <CheckCircle size={16} />
              92% Deployment Rate
            </div>
          </div>

          {/* Shelter */}
          <div className="relative flex flex-col gap-2 overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-full bg-orange-100 opacity-60" />

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <House size={20} className="text-orange-600" />
              Shelter Occupancy
            </div>

            <div className="text-4xl font-bold text-[#002045]">78%</div>

            <div className="flex items-center gap-1 text-xs font-semibold text-orange-600">
              <Info size={16} />4 Shelters Nearing Capacity
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
              {<FloodMap />}
              {/* Map Legend */}
              <div className="absolute z-[1000] bottom-4 left-4 w-48 rounded-lg border border-gray-300 bg-white p-4 shadow-md">
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
              {incidents.map((incident, index) => {
                const style = incidentStyles[incident.type];

                return (
                  <div
                    key={index}
                    className={`rounded-r-lg border-l-4 ${style.border} ${style.bg} p-3`}
                  >
                    <div className="mb-1 flex items-start justify-between">
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
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RiskMap;
