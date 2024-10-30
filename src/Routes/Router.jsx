import React, { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import MapComponent from '../Compo/Base'
import WayportLanding from '../Compo/WayportLanding'
import Map from '../Compo/Map'

export default function Router() {
  // const [coordinates, setCoordinates] = useState(null);
  // const [moder, setModer] = useState("");
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/maper" element={
            <MapComponent
              sourceLocation={{
                coordinates: [80.2705, 13.0843],
                name: "Chennai"
              }}
              destinationLocation={{
                coordinates: [77.2090, 28.6139],
                name: "Delhi"
              }}
              intermediate1Location={{
                coordinates: [78.4867, 17.3850],
                name: "Hyderabad"
              }}
              intermediate2Location={{
                coordinates: [75.3433, 19.8762],
                name: "Aurangabad"
              }}
            />} />
          <Route path="/access" element={<Map />} />
          <Route path="/" element={<WayportLanding />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}
