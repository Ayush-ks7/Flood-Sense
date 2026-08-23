import React from "react";
import { Bell, ChevronDown } from "lucide-react";
import { NavLink, useNavigate } from "react-router";

const Navbar = () => {
  const navigate = useNavigate()
  return (
    <div className=" bg-[#faf9fd] text-[#1a1c1e]">
      {/* ================= NAVBAR ================= */}
      <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-gray-200 bg-white/95 px-4 py-4 backdrop-blur-sm md:px-8">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold text-[#002045] cursor-pointer" onClick={()=>navigate('/')}>FloodGuard</h1>

          <nav className="hidden items-center gap-6 md:flex">
            <div className="hidden items-center gap-6 md:flex text-sm font-medium text-gray-500 transition hover:text-blue-600">
              <div className="hidden items-center gap-6 md:flex text-sm font-medium transition">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "text-blue-600" : "text-gray-500"
                  }
                  to="/"
                  end
                >
                  Risk-Map
                </NavLink>
              </div>

              <div className="hidden items-center gap-6 md:flex text-sm font-medium transition">
                <NavLink
                  to="/alert"
                  className={({ isActive }) =>
                    isActive ? "text-blue-600" : "text-gray-500"
                  }
                >
                  Alert
                </NavLink>
              </div>

              <div className="hidden items-center gap-6 md:flex text-sm font-medium transition">
                <NavLink
                  to="/newz"
                  className={({ isActive }) =>
                    isActive ? "text-blue-600" : "text-gray-500"
                  }
                >
                  Newz
                </NavLink>
              </div>

              <div className="hidden items-center gap-6 md:flex text-sm font-medium transition">
                <NavLink
                  to="/helpline"
                  className={({ isActive }) =>
                    isActive ? "text-blue-600" : "text-gray-500"
                  }
                >
                  Helplines
                </NavLink>
              </div>
            </div>
            <div className="hidden items-center gap-6 md:flex text-sm font-medium text-gray-500 transition hover:text-blue-600"></div>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-full p-2 text-[#002045] transition hover:bg-gray-100">
            <Bell size={20} />
          </button>

          <button className="flex items-center gap-2 rounded-lg bg-[#1a365d] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#002045]">
            Admin Profile
            <ChevronDown size={16} />
          </button>
        </div>
      </header>
    </div>
  );
};

export default Navbar;
