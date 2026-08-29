import React, { useEffect, useRef, useState } from "react";
import {
  Newspaper,
  TrendingUp,
  Clock,
  Mail,
  Send,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Flame,
  Radio,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import gsap from "gsap";

const newsArticles = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
    alt: "Weather Front Radar",
    category: "Catchment Weather",
    time: "Today, 09:00 AM",
    title: "Secondary Monsoon Cloudburst Risk Over Upper Teesta Basin",
    description:
      "Meteorological models indicate a high probability of renewed precipitation over already saturated catchment terrain within the next 48 hours.",
    categoryClass: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80",
    alt: "Community Rescue Team",
    category: "Community Resilience",
    time: "Yesterday, 04:30 PM",
    title: "Local Volunteers Reinforce Flood Embankments at Melli Lowlands",
    description:
      "Community-led response teams successfully deployed 1,200 sandbags along vulnerable riverbank stretches ahead of forecasted weekend river rise.",
    categoryClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    alt: "Geological Sensor",
    category: "Highland Sensors",
    time: "Today, 06:30 AM",
    title: "Real-time Soil Saturation Triggers Highland Slope Alert",
    description:
      "Saturated soil conditions across Sector 4 slopes have triggered enhanced monitoring for potential slope instability and debris flow risk.",
    categoryClass: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80",
    alt: "Bridge Reinforcement",
    category: "Infrastructure",
    time: "Yesterday, 11:00 AM",
    title: "National Highway 10 Transit Bridge Structural Assessment Completed",
    description:
      "Border Roads Organisation engineers have reinforced critical bridge abutments to secure essential supply corridors against river scour.",
    categoryClass: "bg-purple-100 text-purple-800 border-purple-200",
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?auto=format&fit=crop&w=800&q=80",
    alt: "Command Unit",
    category: "AI & Tech",
    time: "Today, 02:20 PM",
    title: "Satellite Telemetry Uplink Established for Remote River Gaps",
    description:
      "Automated hydrological telemetry buoys now stream synchronized river stage data directly to the Flood Sense real-time inference engine.",
    categoryClass: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  {
    id: 6,
    image:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
    alt: "Emergency Fleet",
    category: "Emergency Ops",
    time: "Today, 11:45 AM",
    title: "Specialized NDRF Extraction Teams Stationed Along Choke Points",
    description:
      "Swift water rescue teams equipped with high-powered motorized zodiacs have positioned units at critical Melli and Singtam river bends.",
    categoryClass: "bg-red-100 text-red-800 border-red-200",
  },
];

const trending = [
  {
    category: "Policy Directives",
    title: "Revised Teesta Valley Evacuation Guidelines Released by SDMA",
  },
  {
    category: "Hydrology Model",
    title: "LSTM Quantile Forecast Accuracy Exceeds 94% on 24h Gauge Rise",
  },
  {
    category: "Catchment Radar",
    title: "Continuous IMD Doppler Weather Radar Deployed at Gangtok",
  },
  {
    category: "Public Safety",
    title: "Free SMS Emergency Flood Advisory Subscription Activated",
  },
];

function NewsCard({ article }) {
  return (
    <article className="gsap-news-card group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={article.image}
          alt={article.alt}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <span
            className={`rounded-md border px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide backdrop-blur-md ${article.categoryClass}`}
          >
            {article.category}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Clock size={12} />
            <span>{article.time}</span>
          </div>

          <h3 className="text-base font-bold text-[#002045] leading-snug group-hover:text-blue-700 transition">
            {article.title}
          </h3>

          <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-3">
            {article.description}
          </p>
        </div>

        <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-700">
          <span>Read Full Advisory</span>
          <ArrowRight size={13} className="transition group-hover:translate-x-1" />
        </div>
      </div>
    </article>
  );
}

const NewzPage = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(".gsap-hero", {
          opacity: 0,
          y: -15,
          duration: 0.6,
          ease: "power2.out",
        });

        gsap.from(".gsap-news-card", {
          opacity: 0,
          y: 20,
          stagger: 0.08,
          duration: 0.6,
          ease: "power3.out",
        });
      }, containerRef);

      return () => ctx.revert();
    }
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#faf9fd] text-[#1a1c1e] flex flex-col">
      <main className="mx-auto grid w-full max-w-[1440px] flex-grow grid-cols-1 gap-8 px-4 py-8 md:px-8 lg:grid-cols-12">
        
        {/* LEFT COLUMN: HERO & ARTICLES */}
        <div className="flex flex-col gap-8 lg:col-span-8">
          
          {/* FEATURED BREAKING HERO */}
          <article className="gsap-hero overflow-hidden rounded-2xl border border-slate-200 bg-[#002045] text-white shadow-md">
            <div className="relative flex min-h-[380px] flex-col justify-between overflow-hidden p-6 sm:p-10">
              
              {/* Background ambient glow */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-amber-500/15 blur-2xl" />

              <div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-0.5 text-xs font-extrabold uppercase tracking-wide text-white shadow-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                    Breaking Flood Bulletin
                  </span>
                  <span className="text-xs text-white/70 font-mono">Updated 1 hour ago</span>
                </div>

                <h1 className="mt-4 max-w-2xl text-2xl font-extrabold leading-tight sm:text-3xl lg:text-4xl text-white">
                  Teesta River Basin Inundation Modeling & Corridor Evacuation Directives
                </h1>

                <div className="mt-3 border-l-2 border-amber-400 pl-4">
                  <p className="text-sm text-slate-200 leading-relaxed max-w-xl">
                    Hydro-meteorological data from CWC Melli gauge indicates elevated river levels following upstream catchment surges. Emergency teams and district collectors have initiated localized preventive relocations.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4 text-xs">
                <div className="flex items-center gap-4 text-white/80 font-mono">
                  <span>🌊 Melli Water Level: 224.6 m</span>
                  <span>🌧️ 24h Inflow: 42 mm</span>
                </div>

                <a
                  href="#latest"
                  className="flex items-center gap-1.5 font-bold text-amber-300 hover:text-amber-200 transition"
                >
                  <span>Explore Telemetry Bulletins</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </article>

          {/* LATEST UPDATES SECTION */}
          <div id="latest">
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Newspaper size={20} className="text-blue-700" />
                <h2 className="text-xl font-extrabold text-[#002045]">
                  Latest Situation Reports & Advisories
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-semibold font-mono">6 New Bulletins</span>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {newsArticles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TRENDING & NEWSLETTER */}
        <aside className="flex flex-col gap-6 lg:col-span-4">
          
          {/* TRENDING ADVISORIES */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <TrendingUp size={18} className="text-blue-700" />
              <h3 className="text-base font-bold text-[#002045]">
                Trending Flood Advisories
              </h3>
            </div>

            <ul className="space-y-4">
              {trending.map((item, index) => (
                <li
                  key={index}
                  className="group flex cursor-pointer gap-3.5 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-2xl font-extrabold text-slate-300 group-hover:text-blue-700 transition-colors font-mono">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">
                      {item.category}
                    </span>
                    <p className="mt-0.5 text-xs font-semibold text-slate-800 group-hover:text-blue-900 transition leading-snug">
                      {item.title}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* NEWSLETTER / TELEMETRY DISPATCH SUBSCRIPTION */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#002045] to-[#0a356c] p-6 text-white shadow-sm">
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-400/15 blur-2xl" />

            <div className="relative z-10 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                <Mail size={20} />
              </div>

              <h3 className="text-base font-extrabold text-white">
                Daily Flood Bulletin Dispatch
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                Receive official hydrologic forecasts, hourly river warnings, and critical shelter availability in your inbox.
              </p>

              {subscribed ? (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 p-3 text-xs font-bold text-emerald-200">
                  <CheckCircle2 size={16} />
                  <span>Subscribed! You will receive priority bulletins.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-2.5">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="official.email@agency.gov.in"
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-xs text-white placeholder:text-white/40 outline-none focus:border-blue-400 focus:bg-white/20"
                  />
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-500 active:scale-95 shadow-xs"
                  >
                    <Send size={13} />
                    Subscribe to Advisories
                  </button>
                </form>
              )}

              <p className="text-[10px] text-white/50 text-center">
                SDMA Verified Stream. Zero spam guarantee.
              </p>
            </div>
          </section>
        </aside>
      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-4 text-xs text-slate-500 sm:flex-row md:px-8">
          <div>
            © 2025 <strong>Flood Sense</strong> — Spatiotemporal Flood Early Warning Platform.
          </div>
          <div className="flex gap-4">
            <span className="font-semibold text-slate-700">Central Water Commission (CWC) Integrated</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NewzPage;
