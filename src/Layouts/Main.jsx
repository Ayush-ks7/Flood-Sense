import React, { useEffect, useRef } from "react";
import Navbar from "../Components/Navbar";
import { Outlet, useLocation } from "react-router";
import Lenis from "lenis";
import gsap from "gsap";

const Main = () => {
  const location = useLocation();
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    const tickerCallback = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
    };
  }, []);

  // Scroll to top smoothly on page transition
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-[#faf9fd] font-['Outfit','Inter',sans-serif] text-[#1a1c1e] antialiased">
      <Navbar />
      <div className="w-full flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default Main;

