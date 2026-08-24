import { useMemo, useState } from "react";


//This part will be replaced by the API 
const alerts = [
  {
    severity: "Emergency",
    icon: "warning",
    issued: "10 mins ago",
    title: "Immediate Evacuation: Sector 4, River Basin",
    description:
      "River levels have breached critical thresholds. Evacuate immediately following marked routes to elevated shelters.",
    action: "View Details & Routes",
  },
  {
    severity: "Warning",
    icon: "flood",
    issued: "45 mins ago",
    title: "Rising Water Levels: West Coastal Road",
    description:
      "Coastal flooding expected due to high tides and storm surge. Avoid low-lying areas and secure property.",
    action: "View Details",
  },
  {
    severity: "Watch",
    icon: "rainy",
    issued: "2 hours ago",
    title: "Heavy Rainfall Forecast: North Hill District",
    description:
      "Prolonged heavy rain expected. Possibility of localized flash flooding in poor drainage areas over the next 24 hours.",
    action: "View Details",
  },
];

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

function AlertCard({ alert }) {
  const styles = severityStyles[alert.severity];

  return (
    <article
      className={`relative overflow-hidden rounded-xl border ${styles.border} bg-white p-6 shadow-sm`}
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${styles.bar} ${
          alert.severity === "Emergency" ? "pulse-red" : ""
        }`}
      />

      <div className="mb-4 flex items-start justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`material-symbols-outlined ${styles.icon}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {alert.icon}
          </span>

          <span
            className={`rounded-md px-2 py-1 text-xs font-bold uppercase tracking-wider ${styles.badge}`}
          >
            {alert.severity}
          </span>

          <span className="text-sm text-[#43474e]">
            Issued: {alert.issued}
          </span>
        </div>
      </div>

      <h3 className="mb-2 text-2xl font-semibold leading-8 text-[#002045]">
        {alert.title}
      </h3>

      <p className="mb-4 text-base leading-6 text-[#43474e]">
        {alert.description}
      </p>

      <button
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

function RiskMap() {
  return (
    <div className="relative h-48 w-full overflow-hidden rounded-lg bg-[#efedf1]">
      <img
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuARaBj8WDbtLWjsaRz-fj9nLGdV-tapOwhjgBFu79hBASVkUZ5wnpDmwL4qwSelU9n9MQK-CCxPnihnj05SlzWcInf1NBeFM9eKg9KDOmdRbe_MI8immrESioYydpcI4HtQzK102kf_oNzSuCnmJltTsVOm8RGVMdaO2gJbs2uhaiKZjxGZiiEEaaM-6CjbImwuO0l0GVEcZWBboY4Lk-Dlan2jy1E8dOXyC5p811kTedRn5K21D36fLQ"
        className="h-full w-full object-cover"
        alt="Regional Monitoring Map"
      />

      <div className="absolute bottom-2 right-2 rounded bg-white/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter text-[#002045] backdrop-blur-sm">
        Live Satellite View
      </div>

      <div className="group absolute left-1/3 top-1/4 cursor-pointer">
        <div className="pulse-red relative z-10 h-4 w-4 rounded-full bg-red-500" />

        <div className="absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 group-hover:block">
          <div className="whitespace-nowrap rounded bg-[#2f3033] p-2 text-[10px] text-white shadow-lg">
            <span className="block font-bold">
              Sector 4: Severe Flooding
            </span>
            <span>Evacuation Recommended</span>
          </div>

          <div className="mx-auto -mt-1 h-2 w-2 rotate-45 bg-[#2f3033]" />
        </div>
      </div>

      <div className="group absolute left-1/4 top-2/3 cursor-pointer">
        <div className="relative z-10 h-3 w-3 rounded-full bg-orange-500" />

        <div className="absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 group-hover:block">
          <div className="whitespace-nowrap rounded bg-[#2f3033] p-2 text-[10px] text-white shadow-lg">
            <span className="block font-bold">
              West Coast: Moderate Risk
            </span>
            <span>Monitor local news</span>
          </div>

          <div className="mx-auto -mt-1 h-2 w-2 rotate-45 bg-[#2f3033]" />
        </div>
      </div>
    </div>
  );
}

const AlertPage = () => {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("All Severities");
  const [myLocation, setMyLocation] = useState(false);
  const [sms, setSms] = useState(true);
  const [push, setPush] = useState(true);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSeverity =
        severity === "All Severities" || alert.severity === severity;

      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        alert.title.toLowerCase().includes(query) ||
        alert.description.toLowerCase().includes(query);

      return matchesSeverity && matchesSearch;
    });
  }, [search, severity]);

  return (
    <div className="min-h-screen bg-[#faf9fd] font-['Public_Sans',sans-serif] text-[#1a1c1e] antialiased">

      {/* Main */}
      <main className="mx-auto max-w-[1440px] px-4 py-8 md:px-8 md:py-12">

        {/* Page heading */}
        <section className="mb-12">
          <h2 className="mb-4 text-3xl font-semibold leading-10 text-[#002045] md:text-5xl md:leading-[56px]">
            Real-time Alerts & Warnings
          </h2>

          <p className="max-w-3xl text-lg leading-7 text-[#43474e]">
            Stay informed with the latest flood alerts, weather advisories,
            and emergency updates for your area.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

          {/* Left column */}
          <section className="flex flex-col gap-6 lg:col-span-8">

            {/* Search */}
            <div className="rounded-xl border border-[#c4c6cf] bg-white p-4 shadow-sm">
              <div className="flex flex-col items-center gap-4 md:flex-row">

                <div className="relative w-full flex-grow">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#43474e]">
                    search
                  </span>

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by location..."
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
                      onChange={(e) => setMyLocation(e.target.checked)}
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

            {/* Alerts */}
            <div className="flex flex-col gap-4">
              {filteredAlerts.length ? (
                filteredAlerts.map((alert) => (
                  <AlertCard
                    key={alert.title}
                    alert={alert}
                  />
                ))
              ) : (
                <div className="rounded-xl border border-[#c4c6cf] bg-white p-8 text-center text-[#43474e]">
                  No alerts match your search.
                </div>
              )}
            </div>

          </section>

          {/* Right sidebar */}
          <aside className="flex flex-col gap-6 lg:col-span-4">

            {/* Risk map */}
            <section className="rounded-xl border border-[#c4c6cf] bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-2xl font-semibold leading-8 text-[#002045]">
                <span className="material-symbols-outlined">
                  map
                </span>

                Regional Risk Overview
              </h3>

              <RiskMap />

              <a
                  href="/"
                  className="mt-4 block w-full rounded-lg bg-[#1a365d] px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-[#002045]"
                >
                  Open Interactive Risk Map
              </a>

              <ul className="mt-4 space-y-2">
                <li className="flex items-center justify-between text-base">
                  <span>Sector 4</span>
                  <span className="font-bold text-red-500">
                    High Risk
                  </span>
                </li>

                <li className="flex items-center justify-between text-base">
                  <span>West Coast</span>
                  <span className="font-bold text-orange-500">
                    Moderate
                  </span>
                </li>
              </ul>
            </section>

            {/* Legend */}
            <section className="rounded-xl border border-[#c4c6cf] bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-2xl font-semibold leading-8 text-[#002045]">
                <span className="material-symbols-outlined">
                  info
                </span>

                Alert Legend
              </h3>

              <div className="flex flex-col gap-3">

                {[
                  [
                    "bg-red-500",
                    "Emergency (Red)",
                    "Immediate danger to life. Follow evacuation orders immediately.",
                  ],
                  [
                    "bg-orange-500",
                    "Warning (Orange)",
                    "Flooding is expected. Take action to protect property and prepare to move.",
                  ],
                  [
                    "bg-yellow-500",
                    "Watch (Yellow)",
                    "Conditions are favorable for flooding. Stay alert and monitor updates.",
                  ],
                ].map(([dot, title, text]) => (
                  <div
                    key={title}
                    className="flex items-start gap-3"
                  >
                    <div
                      className={`mt-1 h-4 w-4 flex-shrink-0 rounded-full ${dot}`}
                    />

                    <div>
                      <span className="block text-sm font-bold">
                        {title}
                      </span>

                      <span className="text-sm leading-5 text-[#43474e]">
                        {text}
                      </span>
                    </div>
                  </div>
                ))}

              </div>
            </section>

            {/* Notifications */}
            <section className="rounded-xl bg-[#1a365d] p-6 text-white shadow-sm">

              <h3 className="mb-2 flex items-center gap-2 text-2xl font-semibold leading-8">
                <span className="material-symbols-outlined">
                  campaign
                </span>

                Stay Updated
              </h3>

              <p className="mb-4 text-sm leading-5 opacity-90">
                Receive critical alerts directly to your device for selected
                regions.
              </p>

              <div className="mb-4 flex flex-col gap-3">

                <Toggle
                  label="SMS Alerts"
                  checked={sms}
                  onChange={(e) => setSms(e.target.checked)}
                />

                <Toggle
                  label="Push Notifications"
                  checked={push}
                  onChange={(e) => setPush(e.target.checked)}
                />

              </div>

              <button className="w-full rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#1a365d] transition-colors hover:bg-[#f4f3f7]">
                Manage Preferences
              </button>

            </section>

          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 w-full border-t border-[#c4c6cf] bg-[#e3e2e6] py-12">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-4 md:grid-cols-3 md:px-8">

          <div>
            <div className="mb-4 text-2xl font-bold text-[#002045]">
              FloodGuard
            </div>

            <p className="mb-4 text-base leading-6 text-[#43474e]">
              © 2024 FloodGuard Emergency Management Systems. All rights
              reserved.
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
}

export default AlertPage
