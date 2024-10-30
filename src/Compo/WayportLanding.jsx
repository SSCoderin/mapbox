import React, { useState } from 'react';
import MapComponent from './Base';
import axios from "axios";
import Plane from "./plane1.png"
import './wayport.css';

const WayportContainer = () => {
    const [isNavHidden, setIsNavHidden] = useState(false);
    const [isAnimationStarted, setIsAnimationStarted] = useState(false);
    const [mapProps, setMapProps] = useState(null);
    const [sourceCity, setSourceCity] = useState('NANDED');
    const [destinationCity, setDestinationCity] = useState('NEW DELHI');
    const [mode, setMode] = useState('ALL');
    const [coordinates, setCoordinates] = useState(null);

    const createMapData = (coordinates) => {
        if (!coordinates) return null;

        return {
            sourceLocation: {
                coordinates: [coordinates.sourceCity?.longitude, coordinates.sourceCity?.latitude],
                name: coordinates.sourceCity?.city_name
            },
            destinationLocation: {
                coordinates: [coordinates.destinationCity?.longitude, coordinates.destinationCity?.latitude],
                name: coordinates.destinationCity?.city_name
            },
            intermediate1Location: {
                coordinates: [coordinates.TFTnearestStations?.src_nearest_a1?.longitude, coordinates.TFTnearestStations?.src_nearest_a1?.latitude],
                name: coordinates.TFTnearestStations?.src_nearest_a1?.city_name
            },
            intermediate2Location: {
                coordinates: [coordinates.TFTnearestStations?.src_nearest_a3?.longitude, coordinates.TFTnearestStations?.src_nearest_a3?.latitude],
                name: coordinates.TFTnearestStations?.src_nearest_a3?.city_name
            },
            intermediateD1Location: {
                coordinates: [coordinates.TFTnearestStations?.dest_nearest_a1?.longitude, coordinates.TFTnearestStations?.dest_nearest_a1?.latitude],
                name: coordinates.TFTnearestStations?.dest_nearest_a1?.city_name
            },
            intermediateD2Location: {
                coordinates: [coordinates.TFTnearestStations?.dest_nearest_a3?.longitude, coordinates.TFTnearestStations?.dest_nearest_a3?.latitude],
                name: coordinates.TFTnearestStations?.dest_nearest_a3?.city_name
            },
            models: coordinates.models,
            // intermediate1Location: {
            //     coordinates: [coordinates.nearestStations?.nearest_a1?.longitude, coordinates.nearestStations?.nearest_a1?.latitude],
            //     name: coordinates.nearestStations?.nearest_a1?.city_name
            // },
            // intermediate2Location: {
            //     coordinates: [coordinates.nearestStations?.nearest_a3?.longitude, coordinates.nearestStations?.nearest_a3?.latitude],
            //     name: coordinates.nearestStations?.nearest_a3?.city_name
            // }
        };
    };

    const handleGoClick = async (e) => {
        e.preventDefault();

        if (!sourceCity || !destinationCity) {
            alert('Please enter both source and destination cities');
            return;
        }

        try {
            console.log("hi................frontend")
            const response = await axios.post('http://localhost:5000/get-coordinates', {
                source_city: sourceCity,    // Changed from sourceCity to source_city
                desti_city: destinationCity
            });

            if (response.data) {
                setCoordinates(response.data);
                const mapData = createMapData(response.data);

                if (mapData) {
                    setIsNavHidden(true);
                    setIsAnimationStarted(true);
                    setMapProps(mapData);
                } else {
                    alert('Invalid coordinate data received');
                }
                console.log(response.data)
            }
        } catch (err) {
            console.error('Error fetching coordinates:', err);
            alert('Error fetching coordinates. Please try again.');
            setIsAnimationStarted(false);
        }
    };

    const handleInputChange = (setter) => (e) => {
        setter(e.target.value.toUpperCase());
    };

    return (
        <div className="container">
            <nav className={`wayport-nav ${isNavHidden ? 'hidden' : ''}`}>
                <div className="nav-content">
                    <div className="wayport-logo">
                        <h1>Wayport</h1>
                    </div>
                    <div className="nav-links">
                        <a href="#" className="nav-link">About Us</a>
                        <a href="#" className="nav-link">Login</a>
                    </div>
                </div>
            </nav>

            <div className={`search-container ${isNavHidden ? 'moved' : 'initial'}`}>
                <div className="search-inputs">
                    <input
                        type="text"
                        placeholder="Source City"
                        className="search-input"
                        value={sourceCity}
                        onChange={handleInputChange(setSourceCity)}
                        disabled={isAnimationStarted}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Destination City"
                        className="search-input"
                        value={destinationCity}
                        onChange={handleInputChange(setDestinationCity)}
                        disabled={isAnimationStarted}
                        required
                    />
                    <input
                        type="date"
                        className="date-input"
                        disabled
                        value="2024-10-27"
                    />
                    <button
                        className="go-button"
                        onClick={handleGoClick}
                        disabled={isAnimationStarted || !sourceCity || !destinationCity}
                    >
                        GO
                    </button>
                </div>
            </div>

            <div className={`map-container ${isNavHidden ? 'expanded' : ''}`}>
                {<MapComponent {...mapProps} />}
            </div>
        </div>
    );
};

export default WayportContainer;