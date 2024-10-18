// import React, { useEffect, useRef } from 'react';
// import mapboxgl from 'mapbox-gl';

// import 'mapbox-gl/dist/mapbox-gl.css';

// const MapboxExample = () => {
//   const mapContainerRef = useRef();
//   const mapRef = useRef();

//   useEffect(() => {
//     // Add the Mapbox access token directly in the file
//     mapboxgl.accessToken = 'pk.eyJ1Ijoic2hpdmtpcmFuIiwiYSI6ImNtMjh6eHNsNjAwOWUyanF4Z3BoN21oMXQifQ.TDGNdQYvaYAS2bKyGplIuQ';

//     mapRef.current = new mapboxgl.Map({
//       container: mapContainerRef.current,
//       style: 'mapbox://styles/shivkiran/cm2dl59nk007l01pk9macg254',
//       bounds: [
//         [77.3191471, 19.1485289],
//         [88.3628734, 22.5743545]
//       ]
//     });

//     mapRef.current.on('load', () => {
//       // Create the coordinates for the arc
//       const start = [77.3191471, 19.1485289];
//       const end = [88.3628734, 22.5743545];

//       const arc = createArc(start, end, 50); // 50 segments for smoothness

//       // Add the arc as a GeoJSON source
//       mapRef.current.addSource('arc', {
//         type: 'geojson',
//         data: {
//           type: 'Feature',
//           geometry: {
//             type: 'LineString',
//             coordinates: arc
//           }
//         }
//       });

//       // Add the line layer to display the arc
//       mapRef.current.addLayer({
//         id: 'arc',
//         type: 'line',
//         source: 'arc',
//         layout: {
//           'line-join': 'round',
//           'line-cap': 'round'
//         },
//         paint: {
//           'line-color': '#FF0000', // Arc color
//           'line-width': 4 // Arc width
//         }
//       });
//     });

//     // Cleanup on unmount
//     return () => {
//       if (mapRef.current) {
//         mapRef.current.remove();
//       }
//     };
//   }, []);

//   // Function to create an arc between two points
//   const createArc = (start, end, numPoints) => {
//     const arc = [];
//     const startLat = start[1];
//     const startLng = start[0];
//     const endLat = end[1];
//     const endLng = end[0];

//     for (let i = 0; i <= numPoints; i++) {
//       const fraction = i / numPoints;
//       const lat = interpolate(startLat, endLat, fraction);
//       const lng = interpolate(startLng, endLng, fraction);
//       arc.push([lng, lat]);
//     }
    
//     return arc;
//   };

//   // Function to interpolate between two values
//   const interpolate = (start, end, fraction) => {
//     return start + (end - start) * fraction;
//   };

//   return <div id="map" style={{ height: '100vh' }} ref={mapContainerRef}></div>;
// };

// export default MapboxExample;












import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css';

mapboxgl.accessToken = 'pk.eyJ1Ijoic2hpdmtpcmFuIiwiYSI6ImNtMjh6eHNsNjAwOWUyanF4Z3BoN21oMXQifQ.TDGNdQYvaYAS2bKyGplIuQ';

const App = () => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [78.9629, 20.5937], // Centered on India
      zoom: 4, // Adjusted zoom for India
      pitch: 0, // No tilt
      dragRotate: false, // Disable rotation
      interactive: true // Keep other interactions like zooming/panning
    });

    const origin = [77.3191471, 19.1485289]; // Source point in India
    const destination = [88.3628734, 22.5743545]; // Destination point in India

    const route = {
      'type': 'FeatureCollection',
      'features': [
        {
          'type': 'Feature',
          'geometry': {
            'type': 'LineString',
            'coordinates': [origin, destination]
          }
        }
      ]
    };

    map.on('load', () => {
      map.addSource('route', {
        'type': 'geojson',
        'data': route
      });

      map.addSource('origin', {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': [
            {
              'type': 'Feature',
              'geometry': {
                'type': 'Point',
                'coordinates': origin
              }
            }
          ]
        }
      });

      map.addSource('destination', {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': [
            {
              'type': 'Feature',
              'geometry': {
                'type': 'Point',
                'coordinates': destination
              }
            }
          ]
        }
      });

      // Add the route line
      map.addLayer({
        'id': 'route',
        'source': 'route',
        'type': 'line',
        'paint': {
          'line-width': 2,
          'line-color': '#007cbf'
        }
      });

      // Add glowing source point
      map.addLayer({
        'id': 'origin',
        'source': 'origin',
        'type': 'circle',
        'paint': {
          'circle-radius': 6,
          'circle-color': '#007cbf', // Green color for glowing point
          'circle-blur': 0.5, // Blur effect to make it glow
          'circle-opacity': 0.8 // Slight transparency for glowing effect
        }
      });

      // Add glowing destination point
      map.addLayer({
        'id': 'destination',
        'source': 'destination',
        'type': 'circle',
        'paint': {
          'circle-radius': 6,
          'circle-color': '#007cbf', // Red color for glowing point
          'circle-blur': 0.5, // Blur effect to make it glow
          'circle-opacity': 0.8 // Slight transparency for glowing effect
        }
      });

      setMap(map); // Set the map state after everything is loaded
    });

    return () => map.remove();
  }, []);

  return (
    <div>
      <div ref={mapContainerRef} className="map-container" />
    </div>
  );
};

export default App;
