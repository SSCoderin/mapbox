import React, { useState } from 'react';
import MapComponent from './Base';
import Plane from "./plane1.png"
import './wayport.css';

const WayportContainer = () => {
    const [isNavHidden, setIsNavHidden] = useState(false);
    const [isAnimationStarted, setIsAnimationStarted] = useState(false);
    const [mapProps, setMapProps] = useState(null);

    const mapData = {
        india: {
            sourceLocation: {
                coordinates: [76.961632, 11.004556],
                name: "Coimbatore"
            },
            destinationLocation: {
                coordinates: [77.2090, 28.6139],
                name: "Delhi"
            },
            intermediate1Location: {
                coordinates: [78.4867, 17.3850],
                name: "Hyderabad"
            },
            intermediate2Location: {
                coordinates: [75.3433, 19.8762],
                name: "Aurangabad"
            }
        }
    };

    const handleGoClick = () => {
        setIsNavHidden(true);
        setIsAnimationStarted(true);
        // Only set the map props when GO is clicked
        setMapProps(mapData.india);
    };

    return (
        <div className="container">
            {/* Top Navigation Bar */}
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

            {/* Search Container */}
            <div className={`search-container ${isNavHidden ? 'moved' : 'initial'}`}>
                <div className="search-inputs">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Source"
                        disabled
                        value="Chennai"
                    />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Destination"
                        disabled
                        value="Delhi"
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
                        disabled={isAnimationStarted}
                    >
                        GO
                    </button>
                </div>
            </div>

            {/* Map Container */}
            <div className={`map-container ${isNavHidden ? 'expanded' : ''}`}>
                <MapComponent
                    {...mapProps} // Spread operator will pass null initially and the actual props after GO is clicked
                />
            </div>
        </div>
    );
};

export default WayportContainer;