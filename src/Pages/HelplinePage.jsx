import { useState } from "react";
import RiskMap from "./RiskMap";
import FloodMap from "./FloodMap";

const emergencyContacts = [
  {
    title: "Search & Rescue",
    subtitle: "Highland & Coastal",
    icon: "support",
    iconStyle: "bg-[#1a365d] text-white",
    contacts: [
      {
        name: "Highland Response Team",
        description: "Mountain and hill rescues.",
        phone: "1-800-555-0199",
      },
      {
        name: "Coastal Patrol",
        description: "Waterborne extraction.",
        phone: "1-800-555-0200",
      },
    ],
  },
  {
    title: "Medical & First Aid",
    subtitle: "Triage & Transport",
    icon: "local_hospital",
    iconStyle: "bg-[#7db6ff] text-[#00477f]",
    contacts: [
      {
        name: "Regional Hospital",
        description: "24/7 ER Operations.",
        phone: "1-800-555-0300",
      },
      {
        name: "Mobile Clinics Dispatch",
        description: "Field medical support.",
        phone: "1-800-555-0301",
      },
    ],
  },
];

const vehicleStatus = [
  {
    name: "High-Clearance Trucks",
    status: "Available",
    color: "bg-green-500",
  },
  {
    name: "Waterborne Rescue Boats",
    status: "On Standby",
    color: "bg-yellow-500",
  },
  {
    name: "Aerial Extraction Units",
    status: "Limited Availability",
    color: "bg-yellow-500",
  },
];

const routeStatus = [
  {
    name: "National Highway Route",
    status: "Open",
    color: "bg-green-500",
  },
  {
    name: "Coastal Highway",
    status: "Restricted",
    color: "bg-yellow-500",
  },
  {
    name: "Central Valley Pass",
    status: "Closed - Use Alternate",
    color: "bg-[#ba1a1a]",
  },
];

const shelters = [
  {
    name: "Red Cross",
    capacity: "65% Capacity",
    color: "bg-yellow-500",
  },
  {
    name: "Central Community Center",
    capacity: "FULL",
    color: "bg-[#ba1a1a]",
  },
  {
    name: "Care India",
    capacity: "40% Capacity",
    color: "bg-green-500",
  },
];

function ContactCard({ contactGroup }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-[#c4c6cf] bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start gap-4 border-b border-[#c4c6cf] pb-4">
        <div
          className={`flex-shrink-0 rounded-lg p-3 ${contactGroup.iconStyle}`}
        >
          <span className="material-symbols-outlined">{contactGroup.icon}</span>
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#1a1c1e]">
            {contactGroup.title}
          </h3>

          <p className="text-xs font-semibold uppercase tracking-wider text-[#43474e]">
            {contactGroup.subtitle}
          </p>
        </div>
      </div>

      <div className="flex flex-grow flex-col gap-4">
        {contactGroup.contacts.map((contact) => (
          <div
            key={contact.name}
            className="flex items-center justify-between gap-4"
          >
            <div>
              <p className="font-semibold text-[#002045]">{contact.name}</p>

              <p className="text-sm text-[#43474e]">{contact.description}</p>
            </div>

            <a
              href={`tel:${contact.phone}`}
              aria-label={`Call ${contact.name}`}
              className="flex-shrink-0 rounded-full p-2 text-[#1960a3] transition-colors hover:bg-[#d3e4ff]"
            >
              <span className="material-symbols-outlined">call</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusCard({ title, icon, iconStyle, items }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-[#c4c6cf] bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start gap-4 border-b border-[#c4c6cf] pb-4">
        <div className={`flex-shrink-0 rounded-lg p-3 ${iconStyle}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#1a1c1e]">{title}</h3>

          <p className="text-xs font-semibold uppercase tracking-wider text-[#43474e]">
            {title === "Escape Vehicle Availability"
              ? "Fleet Status"
              : "Traffic & Access"}
          </p>
        </div>
      </div>

      <div className="flex flex-grow flex-col gap-4">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-4"
          >
            <div>
              <p className="font-semibold text-[#002045]">{item.name}</p>

              <p className="text-sm text-[#43474e]">{item.status}</p>
            </div>

            <div
              className={`h-3 w-3 flex-shrink-0 rounded-full ${item.color}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ShelterList() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-[#c4c6cf] bg-white p-6 shadow-sm">
      <h3 className="mb-4 border-b border-[#c4c6cf] pb-4 text-lg font-bold text-[#1a1c1e]">
        Nearby Shelters
      </h3>

      <div className="flex flex-col gap-6">
        {shelters.map((shelter) => (
          <div
            key={shelter.name}
            className="flex items-start justify-between gap-4"
          >
            <div>
              <p className="font-semibold text-[#002045]">{shelter.name}</p>

              <div className="mt-1 flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${shelter.color}`} />

                <p className="text-sm text-[#43474e]">{shelter.capacity}</p>
              </div>
            </div>

            <button
              type="button"
              className="flex items-center gap-1 rounded-lg border border-[#1960a3] px-3 py-1 text-xs font-semibold text-[#1960a3] transition-colors hover:bg-[#d3e4ff]"
            >
              <span className="material-symbols-outlined text-sm">near_me</span>
              Get Directions
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const HelplinePage = () => {
  const [requestType, setRequestType] = useState("Sandbag Delivery");

  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    alert(
      `Request submitted!\nType: ${requestType}\nLocation: ${location}\nPhone: ${phone}`,
    );

    setLocation("");
    setPhone("");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#faf9fd] font-['Public_Sans',sans-serif] text-[#1a1c1e]">
      {/* MAIN */}
      <main className="mx-auto flex w-full max-w-[1440px] flex-grow flex-col gap-12 px-4 py-8 md:px-8 md:py-12">
        {/* SOS */}
        <section className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-xl border border-[#ba1a1a] bg-[#ffdad6] p-8 md:flex-row">
          <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:repeating-linear-gradient(45deg,#ba1a1a_25%,transparent_25%,transparent_75%,#ba1a1a_75%,#ba1a1a),repeating-linear-gradient(45deg,#ba1a1a_25%,#faf9fd_25%,#faf9fd_75%,#ba1a1a_75%,#ba1a1a)] [background-position:0_0,10px_10px] [background-size:20px_20px]" />

          <div className="relative z-10 flex-1">
            <div className="mb-2 flex items-center gap-3 text-[#ba1a1a]">
              <span
                className="material-symbols-outlined text-[32px]"
                style={{
                  fontVariationSettings: "'FILL' 1",
                }}
              >
                warning
              </span>

              <h1 className="text-2xl font-semibold md:text-[32px] md:leading-10">
                Life-Threatening Emergency?
              </h1>
            </div>

            <p className="max-w-2xl text-lg leading-7 text-[#93000a]">
              If you or someone else is in immediate danger, do not wait. Call
              emergency services immediately.
            </p>
          </div>

          <div className="relative z-10">
            <a
              href="tel:911"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#ba1a1a] px-8 py-4 text-2xl font-bold text-white shadow-lg transition-transform hover:scale-105"
            >
              <span className="material-symbols-outlined">call</span>
              Dial 911
            </a>
          </div>
        </section>

        {/* CONTACTS + FORM */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* LEFT */}
          <div className="flex flex-col gap-8 lg:col-span-2">
            {/* Emergency Contacts */}
            <section>
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold text-[#002045]">
                <span className="material-symbols-outlined text-[#1960a3]">
                  contact_phone
                </span>
                Emergency Contacts Directory
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {emergencyContacts.map((group) => (
                  <ContactCard key={group.title} contactGroup={group} />
                ))}
              </div>
            </section>

            {/* Evacuation & Transport */}
            <section>
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold text-[#002045]">
                <span className="material-symbols-outlined text-[#1960a3]">
                  local_shipping
                </span>
                Evacuation &amp; Transport
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <StatusCard
                  title="Escape Vehicle Availability"
                  icon="directions_car"
                  iconStyle="bg-[#1a365d] text-white"
                  items={vehicleStatus}
                />

                <StatusCard
                  title="Evacuation Routes & Safe Zones"
                  icon="map"
                  iconStyle="bg-[#7db6ff] text-[#00477f]"
                  items={routeStatus}
                />
              </div>
            </section>

            {/* Relief Shelters */}
            <section>
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold text-[#002045]">
                <span className="material-symbols-outlined text-[#1960a3]">
                  home_pin
                </span>
                Relief Shelter Locations
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Map */}
                <div className="relative flex h-[400px] flex-col overflow-hidden rounded-xl border border-[#c4c6cf] bg-white shadow-sm">
                  <div className="z-10 flex items-center justify-between border-b border-[#e3e2e6] bg-[#f4f3f7] p-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-[#002045]">
                      <span className="material-symbols-outlined text-[20px]">
                        map
                      </span>
                      Real-time Monitoring Map
                    </h3>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="flex items-center gap-1 rounded border border-[#c4c6cf] bg-white px-2 py-1 text-xs hover:bg-[#e3e2e6]"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          layers
                        </span>
                        Layers
                      </button>

                      <button
                        type="button"
                        className="flex items-center gap-1 rounded border border-[#c4c6cf] bg-white px-2 py-1 text-xs hover:bg-[#e3e2e6]"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          filter_list
                        </span>
                        Filters
                      </button>
                    </div>
                  </div>

                  <div className="relative flex-grow bg-[#dad9dd]">
                    {<FloodMap />}
                  </div>
                </div>

                <ShelterList />
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-8">
            {/* Assistance Form */}
            <section className="rounded-xl border border-[#c4c6cf] bg-white p-6 shadow-sm">
              <h3 className="mb-2 flex items-center gap-2 text-2xl font-semibold text-[#002045]">
                <span className="material-symbols-outlined text-[#1960a3]">
                  assignment
                </span>
                Non-Emergency Assistance
              </h3>

              <p className="mb-6 text-base leading-6 text-[#43474e]">
                Request sandbags, wellness checks, or report minor flooding
                issues.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Request Type
                  </label>

                  <select
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value)}
                    className="w-full rounded border-[#c4c6cf] bg-[#faf9fd] text-base focus:border-[#1960a3] focus:ring-2 focus:ring-[#1960a3]"
                  >
                    <option>Sandbag Delivery</option>
                    <option>Wellness Check</option>
                    <option>Minor Debris Removal</option>
                    <option>Other Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Location Details
                  </label>

                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Address or intersection"
                    className="w-full rounded border-[#c4c6cf] bg-[#faf9fd] text-base focus:border-[#1960a3] focus:ring-2 focus:ring-[#1960a3]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Contact Number
                  </label>

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91"
                    className="w-full rounded border-[#c4c6cf] bg-[#faf9fd] text-base focus:border-[#1960a3] focus:ring-2 focus:ring-[#1960a3]"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1a365d] py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                >
                  Submit Request
                  <span className="material-symbols-outlined">send</span>
                </button>
              </form>
            </section>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-auto grid w-full grid-cols-1 gap-8 bg-[#002045] px-4 py-12 text-white md:grid-cols-4 md:px-8">
        <div className="flex flex-col gap-4 md:col-span-1">
          <span className="text-2xl font-bold">FloodGuard</span>

          <p className="text-base leading-6 text-white/80">
            © 2024 FloodGuard Emergency Management Systems. All rights reserved.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-start gap-x-8 gap-y-4 md:col-span-3 md:justify-end">
          <a
            href="#"
            className="text-sm text-white/80 transition-colors hover:text-white"
          >
            Privacy Policy
          </a>

          <a
            href="#"
            className="text-sm text-white/80 transition-colors hover:text-white"
          >
            Terms of Service
          </a>

          <a
            href="#"
            className="text-sm text-white/80 transition-colors hover:text-white"
          >
            Data Sources
          </a>

          <a
            href="#"
            className="text-sm text-white/80 transition-colors hover:text-white"
          >
            Contact Support
          </a>

          <a
            href="#"
            className="text-sm text-white/80 transition-colors hover:text-white"
          >
            Official Portal
          </a>
        </div>
      </footer>
    </div>
  );
};

export default HelplinePage;
