import React, { useContext } from "react";
import { MapContainer, TileLayer, Marker, Popup , Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import MapControls from "../Controls/MapControls";
import { Data } from "../Context/AppContext";

const FloodMap = () => {
      const {coordinates} = useContext(Data)
      const { latitude, longitude } = coordinates;
     
  
  return (
    <MapContainer
      center={[latitude , longitude]}
      zoom={14}
      zoomControl ={false}
      style={{
        height: "500px",
        width: "100%",
      }}>
        <Circle
  center={[21.2514, 81.6296]}
  radius={500}
  pathOptions={{
    color: "red",
    fillColor: "red",
    fillOpacity: 0.4
  }}
/>
 <Circle
  center={[21.2514, 81.6190]}
  radius={500}
  pathOptions={{
    color: "green",
    fillColor: "green",
    fillOpacity: 0.4
  }}
/>

      <Marker position={[latitude , longitude]}>
        <Popup>Flood Shelter</Popup>
      </Marker>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapControls />
    </MapContainer>
  );
};

export default FloodMap;
