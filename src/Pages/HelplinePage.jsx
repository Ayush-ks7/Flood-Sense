import React, { useEffect, useRef, useState } from "react";
import {
  PhoneCall,
  LifeBuoy,
  Hospital,
  Shield,
  Truck,
  Building,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Radio,
  Clock,
  PhoneForwarded,
  MapPin,
  Flame,
  ArrowUpRight,
} from "lucide-react";
import gsap from "gsap";

const emergencyContacts = [
  {
    title: "Search & Rescue Operations",
    subtitle: "NDRF, SDRF & Teesta Patrols",
    icon: LifeBuoy,
    iconStyle: "bg-blue-600 text-white",
    contacts: [
      {
        name: "NDRF 2nd Battalion (Sikkim Unit)",
        description: "Specialized waterborne flood rescue & swift extraction.",
        phone: "1078",
        rawPhone: "1078",
        badge: "24/7 Rapid Response",
      },
      {
        name: "SDRF Teesta River Patrol",
        description: "Zodiac boat deployment along Melli – Singtam banks.",
        phone: "+91-3592-202986",
        rawPhone: "+913592202986",
        badge: "Standby Boats",
      },
      {
        name: "Highland Search & Mountain Rescue",
        description: "Slope stability & landslide clearance squads.",
        phone: "+91-3592-202112",
        rawPhone: "+913592202112",
        badge: "Mountain Squad",
      },
    ],
  },
  {
    title: "Emergency Medical & Trauma Care",
    subtitle: "Triage & Field Ambulances",
    icon: Hospital,
    iconStyle: "bg-emerald-600 text-white",
    contacts: [
      {
        name: "District Emergency Hospital (Singtam)",
        description: "24/7 Level-2 Trauma Care & Emergency Inpatient.",
        phone: "108",
        rawPhone: "108",
        badge: "National Medical 108",
      },
      {
        name: "STNM Multispeciality Hospital (Gangtok)",
        description: "Critical ICU, ventilator support, and emergency surgeries.",
        phone: "+91-3592-202944",
        rawPhone: "+913592202944",
        badge: "Tertiary Referral",
      },
      {
        name: "Mobile Flood Relief Medical Vans",
        description: "Field triage, waterborne disease prevention & clean supplies.",
        phone: "+91-3592-202319",
        rawPhone: "+913592202319",
        badge: "On Field",
      },
    ],
  },
  {
    title: "Control Rooms & Flood Operations",
    subtitle: "CWC, SDMA & District Collectors",
    icon: Radio,
    iconStyle: "bg-indigo-600 text-white",
    contacts: [
      {
        name: "CWC Teesta Basin Hydrology Cell",
        description: "Official real-time river level updates & flood forecasting.",
        phone: "+91-3592-203401",
        rawPhone: "+913592203401",
        badge: "Telemetry Ops",
      },
      {
        name: "District Emergency Ops Centre (DEOC)",
        description: "District Collectorate emergency coordination & evacuation orders.",
        phone: "1077",
        rawPhone: "1077",
        badge: "DEOC Control",
      },
      {
        name: "State Disaster Management Authority (SSDMA)",
        description: "High-level state coordination and resource deployment.",
        phone: "+91-3592-205387",
        rawPhone: "+913592205387",
        badge: "SDMA HQ",
      },
    ],
  },
];

const vehicleStatus = [
  {
    name: "High-Clearance All-Terrain Trucks",
    status: "8 Units Active",
    color: "bg-emerald-500",
    detail: "Stationed at Melli Checkpost & Singtam Bridge",
  },
  {
    name: "Inflatable Waterborne Rescue Zodiacs",
    status: "6 Boats Deployed",
    color: "bg-emerald-500",
    detail: "Equipped with outboard engines and life buoys",
  },
  {
    name: "Drone Aerial Reconnaissance Units",
    status: "3 Squads Airborne",
    color: "bg-blue-500",
    detail: "Monitoring landslide choke points & river breach areas",
  },
  {
    name: "Helicopter Air-Evacuation Helipad",
    status: "Standby at Gangtok",
    color: "bg-amber-500",
    detail: "Subject to highland cloud ceiling conditions",
  },
];

const shelters = [
  {
    name: "Melli Senior Secondary School Shelter",
    capacity: 250,
    occupied: 140,
    percent: 56,
    color: "bg-blue-600",
    location: "Melli Bazaar Upper Plateau",
  },
  {
    name: "Singtam Community Relief Centre",
    capacity: 400,
    occupied: 330,
    percent: 82,
    color: "bg-amber-500",
    location: "National Highway 10 Highland",
  },
  {
    name: "Red Cross Emergency Transit Shelter",
    capacity: 180,
    occupied: 65,
    percent: 36,
    color: "bg-emerald-500",
    location: "Rangpo Sector 3",
  },
];

const HelplinePage = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(".gsap-helpline-card", {
          opacity: 0,
          y: 20,
          stagger: 0.1,
          duration: 0.6,
          ease: "power2.out",
        });
      }, containerRef);

      return () => ctx.revert();
    }
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#faf9fd] text-[#1a1c1e]">
      <main className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
        
        {/* Header */}
        <section className="mb-8 border-b border-slate-200 pb-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 uppercase tracking-wider">
                  Official Emergency Directory
                </span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-[#002045] md:text-4xl">
                Emergency Helplines & Rescue Dispatch
              </h2>
              <p className="mt-1 text-sm text-slate-600 max-w-2xl">
                Direct phone lines to National Disaster Response Force, medical trauma centres, emergency control rooms, and flood evacuation shelters.
              </p>
            </div>

            {/* Quick SOS Card */}
            <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50/90 p-4 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm">
                <PhoneForwarded size={22} className="animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-red-700 uppercase tracking-wide">
                  Universal Disaster Helpline
                </span>
                <div className="text-xl font-extrabold text-[#002045]">
                  <a href="tel:112" className="hover:underline">112</a> / <a href="tel:1078" className="hover:underline">1078 (NDRF)</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {emergencyContacts.map((group, index) => {
            const Icon = group.icon;

            return (
              <div
                key={index}
                className="gsap-helpline-card flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition hover:shadow-md"
              >
                <div>
                  {/* Category Header */}
                  <div className="mb-5 flex items-center gap-3.5 border-b border-slate-100 pb-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${group.iconStyle} shadow-xs`}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-[#002045]">
                        {group.title}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500">
                        {group.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Contacts List */}
                  <div className="space-y-4">
                    {group.contacts.map((contact, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {contact.name}
                          </span>
                          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-extrabold text-blue-800 uppercase tracking-wide">
                            {contact.badge}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                          {contact.description}
                        </p>

                        <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2.5">
                          <span className="font-mono text-xs font-bold text-slate-800">
                            {contact.phone}
                          </span>
                          <a
                            href={`tel:${contact.rawPhone}`}
                            className="flex items-center gap-1 rounded-lg bg-[#002045] px-3 py-1 text-xs font-bold text-white transition hover:bg-blue-700 active:scale-95 shadow-xs"
                          >
                            <PhoneCall size={12} />
                            Call Now
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= RESCUE FLEET & SHELTERS STATUS ================= */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          
          {/* Fleet Status */}
          <div className="gsap-helpline-card rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-3">
              <Truck size={20} className="text-blue-700" />
              <h3 className="text-base font-bold text-[#002045]">
                Rescue Fleet & Equipment Readiness
              </h3>
            </div>

            <div className="space-y-3">
              {vehicleStatus.map((vehicle, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3.5"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{vehicle.name}</h4>
                    <p className="text-[11px] text-slate-500">{vehicle.detail}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${vehicle.color}`} />
                    <span className="text-xs font-bold text-slate-800">{vehicle.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shelter Capacity */}
          <div className="gsap-helpline-card rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-3">
              <Building size={20} className="text-blue-700" />
              <h3 className="text-base font-bold text-[#002045]">
                Designated Evacuation Shelters
              </h3>
            </div>

            <div className="space-y-4">
              {shelters.map((shelter, index) => (
                <div key={index} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{shelter.name}</h4>
                      <p className="flex items-center gap-1 text-[11px] text-slate-500">
                        <MapPin size={11} /> {shelter.location}
                      </p>
                    </div>
                    <span className="text-xs font-extrabold text-slate-800 font-mono">
                      {shelter.occupied} / {shelter.capacity} Beds
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full ${shelter.color}`}
                        style={{ width: `${shelter.percent}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-700 font-mono">
                      {shelter.percent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HelplinePage;
