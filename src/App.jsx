import React from 'react'
import { MapContainer, TileLayer, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import FloodMap from './Pages/FloodMap';
import RiskMap from './Pages/RiskMap';
import Main from './Layouts/Main';


const App = () => {
  return (
    <div>
      <Main/>
    </div>
  )
}

export default App
