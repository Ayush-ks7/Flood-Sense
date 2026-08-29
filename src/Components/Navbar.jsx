import React, { useState } from "react";
import {
  Waves,
  MapPin,
  AlertTriangle,
  Newspaper,
  PhoneCall,
  Bell,
  ChevronDown,
  Menu,
  X,
  Radio,
  ShieldAlert,
} from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Risk Map", path: "/", icon: MapPin },
    { name: "Alert Center", path: "/alert", icon: AlertTriangle },
    { name: "Bulletins & News", path: "/newz", icon: Newspaper },
    { name: "Emergency Helplines", path: "/helpline", icon: PhoneCall },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Brand & Live Stream Indicator */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => navigate("/")}
            className="group flex cursor-pointer items-center gap-2.5 transition"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white shadow-sm shadow-blue-900/20 group-hover:scale-105 transition-transform">
              <Waves size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-[#002045]">
                  Flood Sense
                </span>
                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wide">
                  AI
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                Teesta Corridor Early Warning
              </p>
            </div>
          </div>

          {/* Live Sensor Feed Badge */}
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-800">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>CWC Gauge: Melli Active</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100/70 p-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-white text-blue-700 shadow-xs shadow-slate-300 font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`
                }
              >
                <Icon size={14} className={isActive ? "text-blue-600" : "text-slate-400"} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate("/alert")}
            aria-label="View Active Alerts"
            className="relative rounded-full p-2 text-slate-700 transition hover:bg-slate-100"
          >
            <Bell size={19} />
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
          </button>

          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-[#002045] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#002b5e]">
            <ShieldAlert size={15} className="text-amber-400" />
            <span>Emergency Operations</span>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden shadow-lg animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition ${
                      isActive
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`
                  }
                >
                  <Icon size={18} className="text-slate-500" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-xs text-slate-500">CWC Real-time Telemetry</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
              Online
            </span>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

