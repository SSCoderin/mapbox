import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Base({setCoordinates,setModer}) {
  const [sourceCity, setSourceCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [mode, setMode] = useState(''); // Modes: TF, FT, or empty
  const [error, setError] = useState('');
  const [coorder, setCoorder] =useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/get-coordinates', {
        sourceCity,
        destinationCity,
        mode
      });
      console.log(response.data);

      setModer(mode);
      setCoordinates(response.data);
      setCoorder(response.data);

      setTimeout(() => {
        navigate('/map');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching coordinates.'); // Set error message
    }
  };
  console.log("this is coorder" , coorder);

  return (
    <>
      <div className="org">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Source City"
            value={sourceCity}
            onChange={(e) => setSourceCity(e.target.value.toUpperCase())}
            required
          />
          <input
            type="text"
            placeholder="Destination City"
            value={destinationCity}
            onChange={(e) => setDestinationCity(e.target.value.toUpperCase())}
            required
          />
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="">Select Mode</option>
            <option value="TFT">TFT</option>
            <option value="TF">TF</option>
            <option value="FT">FT</option>
            <option value="T">T</option>
            <option value="F">F</option>
          </select>
          <button type="submit">Get Coordinates</button>
        </form>

        {error && <p className="error">{error}</p>} {/* Display error message */}

        {coorder && (
          <div className="coorder">
            <h3>Coordinates:</h3>
            <p>Source: {coorder.sourceCity.city_name} ({coorder.sourceCity.latitude}, {coorder.sourceCity.longitude})</p>
            <p>Destination: {coorder.destinationCity.city_name} ({coorder.destinationCity.latitude}, {coorder.destinationCity.longitude})</p>
            {coorder.nearestStations && (
              <>
                <h4>Nearest Stations:</h4>
                {coorder.nearestStations.nearest_a1 && (
                  <p>Nearest A1: {coorder.nearestStations.nearest_a1.city_name} ({coorder.nearestStations.nearest_a1.latitude}, {coorder.nearestStations.nearest_a1.longitude})</p>
                )}
                {coorder.nearestStations.nearest_a3 && (
                  <p>Nearest A3: {coorder.nearestStations.nearest_a3.city_name} ({coorder.nearestStations.nearest_a3.latitude}, {coorder.nearestStations.nearest_a3.longitude})</p>
                )}
              </>
            )}
            {coorder.TFTnearestStations && (
              <>
                <h4>Source Nearest Stations:</h4>
                {coorder.TFTnearestStations.src_nearest_a1 && (
                  <p>Nearest A1: {coorder.TFTnearestStations.src_nearest_a1.city_name} ({coorder.TFTnearestStations.src_nearest_a1.latitude}, {coorder.TFTnearestStations.src_nearest_a1.longitude})</p>
                )}
                {coorder.TFTnearestStations.src_nearest_a3 && (
                  <p>Nearest A3: {coorder.TFTnearestStations.src_nearest_a3.city_name} ({coorder.TFTnearestStations.src_nearest_a3.latitude}, {coorder.TFTnearestStations.src_nearest_a3.longitude})</p>
                )}
                <h4>Destination Nearest Stations:</h4>
                {coorder.TFTnearestStations.dest_nearest_a1 && (
                  <p>Nearest A1: {coorder.TFTnearestStations.dest_nearest_a1.city_name} ({coorder.TFTnearestStations.dest_nearest_a1.latitude}, {coorder.TFTnearestStations.dest_nearest_a1.longitude})</p>
                )}
                {coorder.TFTnearestStations.dest_nearest_a3 && (
                  <p>Nearest A3: {coorder.TFTnearestStations.dest_nearest_a3.city_name} ({coorder.TFTnearestStations.dest_nearest_a3.latitude}, {coorder.TFTnearestStations.dest_nearest_a3.longitude})</p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
