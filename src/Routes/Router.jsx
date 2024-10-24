import React, {useState} from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Base from '../Compo/Base'
import Map from '../Compo/Map'

export default function Router() {
  const [coordinates, setCoordinates] = useState(null);
  const [moder, setModer] = useState("");
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* <Route path="/" element={<Base />} /> */}
          <Route path="/" element={<Map />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}
