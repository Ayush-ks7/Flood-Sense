import { useMap } from "react-leaflet";
import { Plus, Minus, LocateFixed } from "lucide-react";
import { useContext } from "react";
import { Data } from "../Context/AppContext";

const MapControls = () => {
    const { setCoordinates} = useContext(Data)
  const map = useMap();

  const goToCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({latitude , longitude})

        map.setView([latitude, longitude], 15);
      },
      (error) => {
        console.error(error);
        alert("Unable to get your current location.");
      }
    );
  };

  return (
    <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-2">

      {/* Zoom In */}
      <button
        onClick={() => map.zoomIn()}
        className="flex h-10 w-10 items-center justify-center rounded bg-white shadow-md transition hover:bg-gray-100"
      >
        <Plus size={20} />
      </button>

      {/* Zoom Out */}
      <button
        onClick={() => map.zoomOut()}
        className="flex h-10 w-10 items-center justify-center rounded bg-white shadow-md transition hover:bg-gray-100"
      >
        <Minus size={20} />
      </button>

      {/* Current Location */}
      <button
        onClick={goToCurrentLocation}
        className="mt-2 flex h-10 w-10 items-center justify-center rounded bg-white shadow-md transition hover:bg-gray-100"
      >
        <LocateFixed size={19} />
      </button>

    </div>
  );
};

export default MapControls;