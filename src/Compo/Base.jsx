import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = 'pk.eyJ1Ijoid2F5cG9ydC13YXlwb3J0IiwiYSI6ImNtMmtjYW5zNjA1cmIyc3NjaTJhMGNzanQifQ.2hORGRlYUxSDDndrA4BmoQ';

const MapComponent = ({ 
  sourceLocation,
  destinationLocation,
  intermediate1Location,
  intermediate2Location
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const labelsRef = useRef({});
  const animationFrameRef = useRef(null);
  const [visibleLocations, setVisibleLocations] = useState(new Set());

  // Initial zoomed out view
  const INITIAL_VIEW = {
    center: [139.6503, 35.6762], // Tokyo coordinates (longitude, latitude)
    zoom: 1,
    pitch: 0,
    bearing: 0
  };

  const hasValidProps = () => {
    return sourceLocation?.coordinates && 
           destinationLocation?.coordinates && 
           intermediate1Location?.coordinates && 
           intermediate2Location?.coordinates;
  };

  const calculateBounds = () => {
    if (!hasValidProps()) return null;
    
    const coordinates = [
      sourceLocation.coordinates,
      destinationLocation.coordinates,
      intermediate1Location.coordinates,
      intermediate2Location.coordinates
    ];
    
    const bounds = coordinates.reduce(
      (bounds, coord) => {
        return {
          minLng: Math.min(bounds.minLng, coord[0]),
          maxLng: Math.max(bounds.maxLng, coord[0]),
          minLat: Math.min(bounds.minLat, coord[1]),
          maxLat: Math.max(bounds.maxLat, coord[1])
        };
      },
      {
        minLng: 180,
        maxLng: -180,
        minLat: 90,
        maxLat: -90
      }
    );

    // Add padding to bounds
    const padding = 1; // degrees
    return new mapboxgl.LngLatBounds(
      [bounds.minLng - padding, bounds.minLat - padding],
      [bounds.maxLng + padding, bounds.maxLat + padding]
    );
  };

  const createArc = (start, end, numPoints = 100, heightMultiplier = 0.3) => {
    const line = [];
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const lon = start[0] + t * (end[0] - start[0]);
      const lat = start[1] + t * (end[1] - start[1]);
      
      const arc = Math.sin(Math.PI * t) * 
                 heightMultiplier * 
                 Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2));
      
      line.push([lon, lat + arc]);
    }
    return line;
  };

  const createBlinkingMarker = (coords) => {
    const markerEl = document.createElement('div');
    markerEl.className = 'blinking-marker';

    const style = document.createElement('style');
    style.textContent = `
      .blinking-marker {
        width: 12px;
        height: 12px;
        background-color: #FF0000;
        border-radius: 50%;
        animation: blink 1s infinite;
        border: 2px solid #FFFFFF;
        opacity: 0;
        transition: opacity 0.5s ease-in-out;
      }
      .blinking-marker.visible {
        opacity: 1;
      }
      @keyframes blink {
        0% { opacity: 1; }
        50% { opacity: 0.4; }
        100% { opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    return markerEl;
  };

  const createLabel = (name) => {
    const labelEl = document.createElement('div');
    labelEl.className = 'location-label';
    labelEl.textContent = name;

    const style = document.createElement('style');
    style.textContent = `
      .location-label {
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: bold;
        transform: translate(-50%, -100%);
        white-space: nowrap;
        margin-top: 10px;
        opacity: 0;
        transition: opacity 0.5s ease-in-out;
      }
      .location-label.visible {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);

    return labelEl;
  };

  const addMarkerWithLabel = (map, coords, name, key, visible = false) => {
    const markerEl = createBlinkingMarker(coords);
    const labelEl = createLabel(name);

    if (visible) {
      markerEl.classList.add('visible');
      labelEl.classList.add('visible');
    }

    const marker = new mapboxgl.Marker(markerEl)
      .setLngLat(coords)
      .addTo(map);

    const label = new mapboxgl.Marker(labelEl)
      .setLngLat(coords)
      .setOffset([0, 8])
      .addTo(map);

    markersRef.current[key] = {
      marker,
      label,
      markerEl,
      labelEl
    };
  };

  const showMarker = (key) => {
    if (markersRef.current[key]) {
      const { markerEl, labelEl } = markersRef.current[key];
      markerEl.classList.add('visible');
      labelEl.classList.add('visible');
    }
  };

  const animatePath = (map, lineCoordinates, pathId, checkPoint, onReachCheckpoint) => {
    let i = 0;
    const coordinates = [];
    const POINTS_PER_FRAME = 2;
    let checkpointReached = false;

    const animateStep = () => {
      for (let step = 0; step < POINTS_PER_FRAME && i < lineCoordinates.length; step++) {
        coordinates.push(lineCoordinates[i]);
        
        if (!checkpointReached && checkPoint && 
            Math.abs(lineCoordinates[i][0] - checkPoint[0]) < 0.01 &&
            Math.abs(lineCoordinates[i][1] - checkPoint[1]) < 0.01) {
          checkpointReached = true;
          onReachCheckpoint();
        }
        
        i++;
      }

      const source = map.getSource(pathId);
      if (source) {
        source.setData({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: coordinates,
          },
        });
      }

      if (i < lineCoordinates.length) {
        animationFrameRef.current = requestAnimationFrame(animateStep);
      }
    };

    animateStep();
  };

  const initializeAnimationSequence = async (map) => {
    if (!hasValidProps()) return;

    // Add initial markers but keep them invisible
    addMarkerWithLabel(map, sourceLocation.coordinates, sourceLocation.name, 'source', false);
    addMarkerWithLabel(map, destinationLocation.coordinates, destinationLocation.name, 'destination', false);

    // Wait for initial load
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Smooth zoom to fit all points
    const bounds = calculateBounds();
    map.fitBounds(bounds, {
      padding: 100,
      duration: 5000,
      pitch: 45,
      bearing: -11.7
    });

    // Wait for zoom animation to complete
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Show source and destination markers with a slight delay
    setTimeout(() => {
      showMarker('source');
      showMarker('destination');
    }, 500);

    // Setup path layers
    ['path1', 'path2'].forEach(pathId => {
      map.addSource(pathId, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [],
          },
        },
      });

      map.addLayer({
        id: pathId,
        type: "line",
        source: pathId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": pathId === 'path1' ? "#4285f4" : "#34a853",
          "line-width": 3,
          "line-opacity": 1,
        },
      });
    });

    // Add delay before starting path animations
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Animate first path
    const path1 = [
      ...createArc(sourceLocation.coordinates, intermediate1Location.coordinates),
      ...createArc(intermediate1Location.coordinates, destinationLocation.coordinates)
    ];

    await new Promise(resolve => {
      animatePath(map, path1, "path1", intermediate1Location.coordinates, () => {
        addMarkerWithLabel(map, intermediate1Location.coordinates, intermediate1Location.name, 'intermediate1', true);
      });
      
      const checkCompletion = () => {
        const source = map.getSource("path1");
        if (source && source._data.geometry.coordinates.length === path1.length) {
          resolve();
        } else {
          setTimeout(checkCompletion, 100);
        }
      };
      checkCompletion();
    });

    // Animate second path
    const path2 = [
      ...createArc(sourceLocation.coordinates, intermediate2Location.coordinates),
      ...createArc(intermediate2Location.coordinates, destinationLocation.coordinates)
    ];

    animatePath(map, path2, "path2", intermediate2Location.coordinates, () => {
      addMarkerWithLabel(map, intermediate2Location.coordinates, intermediate2Location.name, 'intermediate2', true);
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/wayport-wayport/cm2kj74cj009e01qs4wo52tcn",
      center: INITIAL_VIEW.center,
      zoom: INITIAL_VIEW.zoom,
      pitch: INITIAL_VIEW.pitch,
      bearing: INITIAL_VIEW.bearing,
      projection: "globe",
      dragRotate: false, // Disable rotation
      interactive: false
    });

    mapRef.current = map;

    map.on('load', () => {
      // Only initialize animation sequence if we have valid props
      if (hasValidProps()) {
        initializeAnimationSequence(map);
      }
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      Object.values(markersRef.current).forEach(({ marker, label }) => {
        marker.remove();
        label.remove();
      });
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [sourceLocation, destinationLocation, intermediate1Location, intermediate2Location]);

  return <div ref={mapContainerRef} style={{ height: "800px", width: "100%" }} />;
};

export default MapComponent;