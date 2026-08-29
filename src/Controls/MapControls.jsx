import React, { useContext } from "react";
import { useMap } from "react-leaflet";
import { Plus, Minus, LocateFixed } from "lucide-react";
import { Data } from "../Context/AppContext";

const MapControls = () => {
  const context = useContext(Data);
  const map = useMap();

  const goToCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (context?.setCoordinates) {
          context.setCoordinates({ latitude, longitude });
        }
        map.setView([latitude, longitude], 15);
      },
      (error) => {
        console.error(error);
        alert("Unable to get your current location.");
      }
    );
  };

  return (
    <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-1.5 rounded-xl bg-white/95 p-1 shadow-md border border-slate-200 backdrop-blur-sm">
      {/* Zoom In */}
      <button
        type="button"
        title="Zoom in"
        aria-label="Zoom in"
        onClick={() => map.zoomIn()}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100 active:scale-95"
      >
        <Plus size={16} />
      </button>

      {/* Zoom Out */}
      <button
        type="button"
        title="Zoom out"
        aria-label="Zoom out"
        onClick={() => map.zoomOut()}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100 active:scale-95"
      >
        <Minus size={16} />
      </button>

      <div className="my-0.5 h-px bg-slate-200" />

      {/* Current Location */}
      <button
        type="button"
        title="Go to current location"
        aria-label="Go to current location"
        onClick={goToCurrentLocation}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-700 transition hover:bg-blue-50 active:scale-95"
      >
        <LocateFixed size={16} />
      </button>
    </div>
  );
};

export default MapControls;