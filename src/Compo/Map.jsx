import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
// import * as turf from '@turf/turf';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../App.css';
import indiaGeoJSON from './Indian_States.json';
import indiaGeoJSON1 from './india.geojson';
import indiaGeoJSON3 from './india-states.geojson';


mapboxgl.accessToken = 'pk.eyJ1Ijoic2hpdmtpcmFuIiwiYSI6ImNtMjh6eHNsNjAwOWUyanF4Z3BoN21oMXQifQ.TDGNdQYvaYAS2bKyGplIuQ';


export default function Map({ coordinates, moder }) {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  // const [counter, setCounter] = useState(0);
  // const [isAnimating, setIsAnimating] = useState(false);
  // const steps = 500;

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [78.9629, 20.5937], // Centered on India
      zoom: 4,
      pitch: 40, // No tilt
      dragRotate: false, // Disable rotation
      interactive: true // Keep other interactions like zooming/panning
    });
    console.log(coordinates)

    const origin = [coordinates.sourceCity.longitude, coordinates.sourceCity.latitude];
    const destination = [coordinates.destinationCity.longitude, coordinates.destinationCity.latitude];

    let intermediateTeir1, intermediateTeir2;
    let intermediate1Teir1, intermediate1Teir2, intermediate2Teir1, intermediate2Teir2;


    if (moder === "FT" || moder === "TF") {
      intermediateTeir1 = [coordinates.nearestStations.nearest_a1.longitude, coordinates.nearestStations.nearest_a1.latitude];
      intermediateTeir2 = [coordinates.nearestStations.nearest_a3.longitude, coordinates.nearestStations.nearest_a3.latitude];
    }

    if (moder === "TFT") {
      intermediate1Teir1 = [coordinates.TFTnearestStations.src_nearest_a1.longitude, coordinates.TFTnearestStations.src_nearest_a1.latitude];
      intermediate1Teir2 = [coordinates.TFTnearestStations.src_nearest_a3.longitude, coordinates.TFTnearestStations.src_nearest_a3.latitude];
      intermediate2Teir1 = [coordinates.TFTnearestStations.dest_nearest_a1.longitude, coordinates.TFTnearestStations.dest_nearest_a1.latitude];
      intermediate2Teir2 = [coordinates.TFTnearestStations.dest_nearest_a3.longitude, coordinates.TFTnearestStations.dest_nearest_a3.latitude];
    }


    if (moder === "F") {
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
        map.addSource('india', {
          type: 'geojson',
          data: indiaGeoJSON1,
        });

        // Add fill layer for states
        map.addLayer({
          id: 'state-fill',
          source: 'india',
          type: 'fill',
          paint: {
            'fill-color': '#000000', // Light black for state fill
            'fill-opacity': 0.7,
          },
        });

        //states and districts
        map.addLayer({
          id: 'borders',
          source: 'india',
          type: 'line',
          paint: {
            'line-color': '#A9A9A9', // Dark white for borders
            'line-width': [
              'case',
              ['==', ['get', 'boundary'], 'state'], 3, // Thicker lines for state borders
              1, // Thinner lines for district borders
            ],
          },
        });

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
                },
                'properties': {
                  'title': coordinates.sourceCity.city_name // Label for the source
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
                },
                'properties': {
                  'title': coordinates.destinationCity.city_name // Label for the source
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
            'line-color': '#4682B4'
          }
        });

        map.addLayer({
          'id': 'origin',
          'source': 'origin',
          'type': 'circle',
          'paint': {
            'circle-radius': 6,
            'circle-color': '#ff0000', // Green color for glowing point
            'circle-blur': 0.5, // Blur effect to make it glow
            'circle-opacity': 1 // Slight transparency for glowing effect
          }
        });

        //hide existing labels
        map.getStyle().layers.forEach((layer) => {
          if (layer.type === 'symbol' && layer.layout['text-field']) {
            map.setLayoutProperty(layer.id, 'visibility', 'none');
          }
        });

        // Add glowing destination point
        map.addLayer({
          'id': 'destination',
          'source': 'destination',
          'type': 'circle',
          'paint': {
            'circle-radius': 6,
            'circle-color': '#ff0000', // Red color for glowing point
            'circle-blur': 0.5, // Blur effect to make it glow
            'circle-opacity': 1 // Slight transparency for glowing effect
          }
        });

        // Add source label
        map.addLayer({
          'id': 'origin-label',
          'source': 'origin',
          'type': 'symbol',
          'layout': {
            'text-field': ['get', 'title'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 12,
            'text-offset': [0, 1.5]
          },
          'paint': {
            'text-color': '#ffffff', // White color to contrast with the dark map
            'text-halo-color': '#000000',
            'text-halo-width': 1
          }
        });

        // Add destination label
        map.addLayer({
          'id': 'destination-label',
          'source': 'destination',
          'type': 'symbol',
          'layout': {
            'text-field': ['get', 'title'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 12,
            'text-offset': [0, 1.5]
          },
          'paint': {
            'text-color': '#ffffff', // White color to contrast with the dark map
            'text-halo-color': '#000000',
            'text-halo-width': 1
          }
        });

        setMap(map);
      });
    }
    if (moder === "T") {
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
        map.addSource('india', {
          type: 'geojson',
          data: indiaGeoJSON1,
        });

        // Add fill layer for states
        map.addLayer({
          id: 'state-fill',
          source: 'india',
          type: 'fill',
          paint: {
            'fill-color': '#000000', // Light black for state fill
            'fill-opacity': 0.7,
          },
        });

        //states and districts
        map.addLayer({
          id: 'borders',
          source: 'india',
          type: 'line',
          paint: {
            'line-color': '#A9A9A9', // Dark white for borders
            'line-width': [
              'case',
              ['==', ['get', 'boundary'], 'state'], 3, // Thicker lines for state borders
              1, // Thinner lines for district borders
            ],
          },
        });

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
                },
                'properties': {
                  'title': coordinates.sourceCity.city_name // Label for the source
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
                },
                'properties': {
                  'title': coordinates.destinationCity.city_name // Label for the source
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
            'line-color': '#90ee90'
          }
        });

        map.addLayer({
          'id': 'origin',
          'source': 'origin',
          'type': 'circle',
          'paint': {
            'circle-radius': 6,
            'circle-color': '#ff0000', // Green color for glowing point
            'circle-blur': 0.5, // Blur effect to make it glow
            'circle-opacity': 1 // Slight transparency for glowing effect
          }
        });

        // Add glowing destination point
        map.addLayer({
          'id': 'destination',
          'source': 'destination',
          'type': 'circle',
          'paint': {
            'circle-radius': 6,
            'circle-color': '#ff0000', // Red color for glowing point
            'circle-blur': 0.5, // Blur effect to make it glow
            'circle-opacity': 1 // Slight transparency for glowing effect
          }
        });

        map.getStyle().layers.forEach((layer) => {
          if (layer.type === 'symbol' && layer.layout['text-field']) {
            map.setLayoutProperty(layer.id, 'visibility', 'none');
          }
        });

        // Add source label
        map.addLayer({
          'id': 'origin-label',
          'source': 'origin',
          'type': 'symbol',
          'layout': {
            'text-field': ['get', 'title'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 12,
            'text-offset': [0, 1.5]
          },
          'paint': {
            'text-color': '#ffffff', // White color to contrast with the dark map
            'text-halo-color': '#000000',
            'text-halo-width': 1
          }
        });

        // Add destination label
        map.addLayer({
          'id': 'destination-label',
          'source': 'destination',
          'type': 'symbol',
          'layout': {
            'text-field': ['get', 'title'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 12,
            'text-offset': [0, 1.5]
          },
          'paint': {
            'text-color': '#ffffff', // White color to contrast with the dark map
            'text-halo-color': '#000000',
            'text-halo-width': 1
          }
        });


        setMap(map); // Set the map state after everything is loaded
      });
    }
    if (moder === "TF") {
      const route1 = {
        'type': 'FeatureCollection',
        'features': [
          {
            'type': 'Feature',
            'geometry': {
              'type': 'LineString',
              'coordinates': [origin, intermediateTeir1]
            }
          }
        ]
      };

      const route2 = {
        'type': 'FeatureCollection',
        'features': [
          {
            'type': 'Feature',
            'geometry': {
              'type': 'LineString',
              'coordinates': [intermediateTeir1, destination]
            }
          }
        ]
      };

      const route3 = {
        'type': 'FeatureCollection',
        'features': [
          {
            'type': 'Feature',
            'geometry': {
              'type': 'LineString',
              'coordinates': [origin, intermediateTeir2]
            }
          }
        ]
      };

      const route4 = {
        'type': 'FeatureCollection',
        'features': [
          {
            'type': 'Feature',
            'geometry': {
              'type': 'LineString',
              'coordinates': [intermediateTeir2, destination]
            }
          }
        ]
      };

      map.on('load', () => {
        map.addSource('india', {
          type: 'geojson',
          data: indiaGeoJSON1,
        });

        // Add fill layer for states
        map.addLayer({
          id: 'state-fill',
          source: 'india',
          type: 'fill',
          paint: {
            'fill-color': '#000000', // Light black for state fill
            'fill-opacity': 0.7,
          },
        });

        //states and districts
        map.addLayer({
          id: 'borders',
          source: 'india',
          type: 'line',
          paint: {
            'line-color': '#A9A9A9', // Dark white for borders
            'line-width': [
              'case',
              ['==', ['get', 'boundary'], 'state'], 3, // Thicker lines for state borders
              1, // Thinner lines for district borders
            ],
          },
        });

        map.addSource('route1', {
          'type': 'geojson',
          'data': route1
        });

        map.addSource('route2', {
          'type': 'geojson',
          'data': route2
        });

        map.addSource('route3', {
          'type': 'geojson',
          'data': route3
        });

        map.addSource('route4', {
          'type': 'geojson',
          'data': route4
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
                },
                'properties': {
                  'title': coordinates.sourceCity.city_name // Label for the source
                }
              }
            ]
          }
        });

        map.addSource('intermediateTeir1', {
          'type': 'geojson',
          'data': {
            'type': 'FeatureCollection',
            'features': [
              {
                'type': 'Feature',
                'geometry': {
                  'type': 'Point',
                  'coordinates': intermediateTeir1
                },
                'properties': {
                  'title': coordinates.nearestStations.nearest_a1.city_name // Label for the source
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
                },
                'properties': {
                  'title': coordinates.destinationCity.city_name // Label for the source
                }
              }
            ]
          }
        });

        map.addSource('intermediateTeir2', {
          'type': 'geojson',
          'data': {
            'type': 'FeatureCollection',
            'features': [
              {
                'type': 'Feature',
                'geometry': {
                  'type': 'Point',
                  'coordinates': intermediateTeir2
                },
                'properties': {
                  'title': coordinates.nearestStations.nearest_a3.city_name // Label for the source
                }
              }
            ]
          }
        });

        map.addLayer({
          'id': 'route1',
          'source': 'route1',
          'type': 'line',
          'paint': {
            'line-width': 2,
            'line-color': '#90ee90'
          }
        });

        map.addLayer({
          'id': 'route2',
          'source': 'route2',
          'type': 'line',
          'paint': {
            'line-width': 2,
            'line-color': '#4682B4'
          }
        });

        map.addLayer({
          'id': 'route3',
          'source': 'route3',
          'type': 'line',
          'paint': {
            'line-width': 2,
            'line-color': '#90ee90'
          }
        });

        map.addLayer({
          'id': 'route4',
          'source': 'route4',
          'type': 'line',
          'paint': {
            'line-width': 2,
            'line-color': '#4682B4'
          }
        });

        map.addLayer({
          'id': 'intermediateTeir1',
          'source': 'intermediateTeir1',
          'type': 'circle',
          'paint': {
            'circle-radius': 6,
            'circle-color': '#007cbf', // Blue color for glowing point
            'circle-blur': 0.5, // Blur effect to make it glow
            'circle-opacity': 1 // Slight transparency for glowing effect
          }
        });

        map.addLayer({
          'id': 'intermediateTeir2',
          'source': 'intermediateTeir2',
          'type': 'circle',
          'paint': {
            'circle-radius': 6,
            'circle-color': '#007cbf', // Blue color for glowing point
            'circle-blur': 0.5, // Blur effect to make it glow
            'circle-opacity': 1 // Slight transparency for glowing effect
          }
        });

        map.addLayer({
          'id': 'origin',
          'source': 'origin',
          'type': 'circle',
          'paint': {
            'circle-radius': 10,
            'circle-color': '#ff0000', // Green color for glowing point
            'circle-blur': 0.5, // Blur effect to make it glow
            'circle-opacity': 1 // Slight transparency for glowing effect
          }
        });

        map.addLayer({
          'id': 'destination',
          'source': 'destination',
          'type': 'circle',
          'paint': {
            'circle-radius': 10,
            'circle-color': '#ff0000', // Color for glowing destination point
            'circle-blur': 0.5, // Blur effect to make it glow
            'circle-opacity': 1 // Slight transparency for glowing effect
          }
        });

        map.getStyle().layers.forEach((layer) => {
          if (layer.type === 'symbol' && layer.layout['text-field']) {
            map.setLayoutProperty(layer.id, 'visibility', 'none');
          }
        });

        // Add source label
        map.addLayer({
          'id': 'origin-label',
          'source': 'origin',
          'type': 'symbol',
          'layout': {
            'text-field': ['get', 'title'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 12,
            'text-offset': [0, 1.5]
          },
          'paint': {
            'text-color': '#ffffff', // White color to contrast with the dark map
            'text-halo-color': '#000000',
            'text-halo-width': 1
          }
        });

        // Add label for intermediateTeir1
        map.addLayer({
          'id': 'intermediateTeir1-label',
          'source': 'intermediateTeir1',
          'type': 'symbol',
          'layout': {
            'text-field': ['get', 'title'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 8,
            'text-offset': [0, 1.5]
          },
          'paint': {
            'text-color': '#ffffff', // White color for the label text
            'text-halo-color': '#000000', // Black halo for better visibility
            'text-halo-width': 1
          }
        });

        // Add label for intermediateTeir2
        map.addLayer({
          'id': 'intermediateTeir2-label',
          'source': 'intermediateTeir2',
          'type': 'symbol',
          'layout': {
            'text-field': ['get', 'title'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 8,
            'text-offset': [0, 1.5]
          },
          'paint': {
            'text-color': '#ffffff', // White color for the label text
            'text-halo-color': '#000000', // Black halo for better visibility
            'text-halo-width': 1
          }
        });

        map.addLayer({
          'id': 'destination-label',
          'source': 'destination',
          'type': 'symbol',
          'layout': {
            'text-field': ['get', 'title'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 12,
            'text-offset': [0, 1.5]
          },
          'paint': {
            'text-color': '#ffffff', // White color to contrast with the dark map
            'text-halo-color': '#000000',
            'text-halo-width': 1
          }
        });


        setMap(map); // Set the map state after everything is loaded
      });
    }
    if (moder === "FT") {
      const route1 = {
        'type': 'FeatureCollection',
        'features': [
          {
            'type': 'Feature',
            'geometry': {
              'type': 'LineString',
              'coordinates': [origin, intermediateTeir1]
            }
          }
        ]
      };

      const route2 = {
        'type': 'FeatureCollection',
        'features': [
          {
            'type': 'Feature',
            'geometry': {
              'type': 'LineString',
              'coordinates': [intermediateTeir1, destination]
            }
          }
        ]
      };

      const route3 = {
        'type': 'FeatureCollection',
        'features': [
          {
            'type': 'Feature',
            'geometry': {
              'type': 'LineString',
              'coordinates': [origin, intermediateTeir2]
            }
          }
        ]
      };

      const route4 = {
        'type': 'FeatureCollection',
        'features': [
          {
            'type': 'Feature',
            'geometry': {
              'type': 'LineString',
              'coordinates': [intermediateTeir2, destination]
            }
          }
        ]
      };

      map.on('load', () => {
        map.addSource('india', {
          type: 'geojson',
          data: indiaGeoJSON1,
        });

        // Add fill layer for states
        map.addLayer({
          id: 'state-fill',
          source: 'india',
          type: 'fill',
          paint: {
            'fill-color': '#000000', // Light black for state fill
            'fill-opacity': 0.7,
          },
        });

        //states and districts
        map.addLayer({
          id: 'borders',
          source: 'india',
          type: 'line',
          paint: {
            'line-color': '#A9A9A9', // Dark white for borders
            'line-width': [
              'case',
              ['==', ['get', 'boundary'], 'state'], 3, // Thicker lines for state borders
              1, // Thinner lines for district borders
            ],
          },
        });

        map.addSource('route1', {
          'type': 'geojson',
          'data': route1
        });

        map.addSource('route2', {
          'type': 'geojson',
          'data': route2
        });

        map.addSource('route3', {
          'type': 'geojson',
          'data': route3
        });

        map.addSource('route4', {
          'type': 'geojson',
          'data': route4
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
                },
                'properties': {
                  'title': coordinates.sourceCity.city_name // Label for the source
                }
              }
            ]
          }
        });

        map.addSource('intermediateTeir1', {
          'type': 'geojson',
          'data': {
            'type': 'FeatureCollection',
            'features': [
              {
                'type': 'Feature',
                'geometry': {
                  'type': 'Point',
                  'coordinates': intermediateTeir1
                },
                'properties': {
                  'title': coordinates.nearestStations.nearest_a1.city_name // Label for the source
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
                },
                'properties': {
                  'title': coordinates.destinationCity.city_name // Label for the source
                }
              }
            ]
          }
        });

        map.addSource('intermediateTeir2', {
          'type': 'geojson',
          'data': {
            'type': 'FeatureCollection',
            'features': [
              {
                'type': 'Feature',
                'geometry': {
                  'type': 'Point',
                  'coordinates': intermediateTeir2
                },
                'properties': {
                  'title': coordinates.nearestStations.nearest_a3.city_name // Label for the source
                }
              }
            ]
          }
        });

        map.addLayer({
          'id': 'route1',
          'source': 'route1',
          'type': 'line',
          'paint': {
            'line-width': 2,
            'line-color': '#4682B4'
          }
        });

        map.addLayer({
          'id': 'route2',
          'source': 'route2',
          'type': 'line',
          'paint': {
            'line-width': 2,
            'line-color': '#90ee90'
          }
        });

        map.addLayer({
          'id': 'route3',
          'source': 'route3',
          'type': 'line',
          'paint': {
            'line-width': 2,
            'line-color': '#4682B4'
          }
        });

        map.addLayer({
          'id': 'route4',
          'source': 'route4',
          'type': 'line',
          'paint': {
            'line-width': 2,
            'line-color': '#90ee90'
          }
        });

        map.addLayer({
          'id': 'intermediateTeir1',
          'source': 'intermediateTeir1',
          'type': 'circle',
          'paint': {
            'circle-radius': 6,
            'circle-color': '#007cbf', // Blue color for glowing point
            'circle-blur': 0.5, // Blur effect to make it glow
            'circle-opacity': 0.8 // Slight transparency for glowing effect
          }
        });

        map.addLayer({
          'id': 'intermediateTeir2',
          'source': 'intermediateTeir2',
          'type': 'circle',
          'paint': {
            'circle-radius': 6,
            'circle-color': '#007cbf', // Blue color for glowing point
            'circle-blur': 0.5, // Blur effect to make it glow
            'circle-opacity': 0.8 // Slight transparency for glowing effect
          }
        });

        map.addLayer({
          'id': 'origin',
          'source': 'origin',
          'type': 'circle',
          'paint': {
            'circle-radius': 10,
            'circle-color': '#ff0000', // Green color for glowing point
            'circle-blur': 0.5, // Blur effect to make it glow
            'circle-opacity': 1 // Slight transparency for glowing effect
          }
        });

        map.addLayer({
          'id': 'destination',
          'source': 'destination',
          'type': 'circle',
          'paint': {
            'circle-radius': 10,
            'circle-color': '#ff0000', // Color for glowing destination point
            'circle-blur': 0.5, // Blur effect to make it glow
            'circle-opacity': 1 // Slight transparency for glowing effect
          }
        });

        map.getStyle().layers.forEach((layer) => {
          if (layer.type === 'symbol' && layer.layout['text-field']) {
            map.setLayoutProperty(layer.id, 'visibility', 'none');
          }
        });

        // Add source label
        map.addLayer({
          'id': 'origin-label',
          'source': 'origin',
          'type': 'symbol',
          'layout': {
            'text-field': ['get', 'title'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 12,
            'text-offset': [0, 1.5]
          },
          'paint': {
            'text-color': '#ffffff', // White color to contrast with the dark map
            'text-halo-color': '#000000',
            'text-halo-width': 1
          }
        });

        // Add label for intermediateTeir1
        map.addLayer({
          'id': 'intermediateTeir1-label',
          'source': 'intermediateTeir1',
          'type': 'symbol',
          'layout': {
            'text-field': ['get', 'title'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 8,
            'text-offset': [0, 1.5]
          },
          'paint': {
            'text-color': '#ffffff', // White color for the label text
            'text-halo-color': '#000000', // Black halo for better visibility
            'text-halo-width': 1
          }
        });

        // Add label for intermediateTeir2
        map.addLayer({
          'id': 'intermediateTeir2-label',
          'source': 'intermediateTeir2',
          'type': 'symbol',
          'layout': {
            'text-field': ['get', 'title'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 8,
            'text-offset': [0, 1.5]
          },
          'paint': {
            'text-color': '#ffffff', // White color for the label text
            'text-halo-color': '#000000', // Black halo for better visibility
            'text-halo-width': 1
          }
        });

        map.addLayer({
          'id': 'destination-label',
          'source': 'destination',
          'type': 'symbol',
          'layout': {
            'text-field': ['get', 'title'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 12,
            'text-offset': [0, 1.5]
          },
          'paint': {
            'text-color': '#ffffff', // White color to contrast with the dark map
            'text-halo-color': '#000000',
            'text-halo-width': 1
          }
        });

        setMap(map); // Set the map state after everything is loaded
      });
    }
    if (moder === "TFT") {
      const route11 = {
        'type': 'FeatureCollection',
        'features': [
          {
            'type': 'Feature',
            'geometry': {
              'type': 'LineString',
              'coordinates': [origin, intermediate1Teir1]
            }
          }
        ]
      };

      const route12 = {
        'type': 'FeatureCollection',
        'features': [
          {
            'type': 'Feature',
            'geometry': {
              'type': 'LineString',
              'coordinates': [intermediate1Teir1, intermediate2Teir1]
            }
          }
        ]
      };

      const route13 = {
        'type': 'FeatureCollection',
        'features': [
          {
            'type': 'Feature',
            'geometry': {
              'type': 'LineString',
              'coordinates': [intermediate2Teir1, destination]
            }
          }
        ]
      };

      const route21 = {
        'type': 'FeatureCollection',
        'features': [
          {
            'type': 'Feature',
            'geometry': {
              'type': 'LineString',
              'coordinates': [origin, intermediate1Teir2]
            }
          }
        ]
      };

      const route22 = {
        'type': 'FeatureCollection',
        'features': [
          {
            'type': 'Feature',
            'geometry': {
              'type': 'LineString',
              'coordinates': [intermediate1Teir2, intermediate2Teir2]
            }
          }
        ]
      };

      const route23 = {
        'type': 'FeatureCollection',
        'features': [
          {
            'type': 'Feature',
            'geometry': {
              'type': 'LineString',
              'coordinates': [intermediate2Teir2, destination]
            }
          }
        ]
      };

      map.on('load', () => {
        map.addSource('india', {
          type: 'geojson',
          data: indiaGeoJSON1,
        });

        // Add fill layer for states
        map.addLayer({
          id: 'state-fill',
          source: 'india',
          type: 'fill',
          paint: {
            'fill-color': '#000000', // Light black for state fill
            'fill-opacity': 0.7,
          },
        });

        //states and districts
        map.addLayer({
          id: 'borders',
          source: 'india',
          type: 'line',
          paint: {
            'line-color': '#A9A9A9', // Dark white for borders
            'line-width': [
              'case',
              ['==', ['get', 'boundary'], 'state'], 3, // Thicker lines for state borders
              1, // Thinner lines for district borders
            ],
          },
        });

        map.addSource('route11', {
          'type': 'geojson',
          'data': route11
        });

        map.addSource('route12', {
          'type': 'geojson',
          'data': route12
        });

        map.addSource('route13', {
          'type': 'geojson',
          'data': route13
        });

        map.addSource('route21', {
          'type': 'geojson',
          'data': route21
        });

        map.addSource('route22', {
          'type': 'geojson',
          'data': route22
        });

        map.addSource('route23', {
          'type': 'geojson',
          'data': route23
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
                },
                'properties': {
                  'title': coordinates.sourceCity.city_name // Label for the source
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
                },
                'properties': {
                  'title': coordinates.destinationCity.city_name // Label for the source
                }
              }
            ]
          }
        });

        map.addSource('intermediate1Teir1', {
          'type': 'geojson',
          'data': {
            'type': 'FeatureCollection',
            'features': [
              {
                'type': 'Feature',
                'geometry': {
                  'type': 'Point',
                  'coordinates': intermediate1Teir1
                },
                'properties': {
                  'title': coordinates.TFTnearestStations.src_nearest_a1.city_name // Label for the source
                }
              }
            ]
          }
        });

        map.addSource('intermediate1Teir2', {
          'type': 'geojson',
          'data': {
            'type': 'FeatureCollection',
            'features': [
              {
                'type': 'Feature',
                'geometry': {
                  'type': 'Point',
                  'coordinates': intermediate1Teir2
                },
                'properties': {
                  'title': coordinates.TFTnearestStations.src_nearest_a3.city_name // Label for the source
                }
              }
            ]
          }
        });

        map.addSource('intermediate2Teir1', {
          'type': 'geojson',
          'data': {
            'type': 'FeatureCollection',
            'features': [
              {
                'type': 'Feature',
                'geometry': {
                  'type': 'Point',
                  'coordinates': intermediate2Teir1
                },
                'properties': {
                  'title': coordinates.TFTnearestStations.dest_nearest_a1.city_name // Label for the source
                }
              }
            ]
          }
        });

        map.addSource('intermediate2Teir2', {
          'type': 'geojson',
          'data': {
            'type': 'FeatureCollection',
            'features': [
              {
                'type': 'Feature',
                'geometry': {
                  'type': 'Point',
                  'coordinates': intermediate2Teir2
                },
                'properties': {
                  'title': coordinates.TFTnearestStations.dest_nearest_a3.city_name // Label for the source
                }
              }
            ]
          }
        });

        map.addLayer({
          'id': 'route11',
          'source': 'route11',
          'type': 'line',
          'paint': {
            'line-width': 2,
            'line-color': '#90ee90'
          }
        });

        map.addLayer({
          'id': 'route12',
          'source': 'route12',
          'type': 'line',
          'paint': {
            'line-width': 2,
            'line-color': '#4682B4'
          }
        });

        map.addLayer({
          'id': 'route13',
          'source': 'route13',
          'type': 'line',
          'paint': {
            'line-width': 2,
            'line-color': '#90ee90'
          }
        });

        map.addLayer({
          'id': 'route21',
          'source': 'route21',
          'type': 'line',
          'paint': {
            'line-width': 2,
            'line-color': '#90ee90'
          }
        });

        map.addLayer({
          'id': 'route22',
          'source': 'route22',
          'type': 'line',
          'paint': {
            'line-width': 2,
            'line-color': '#4682B4'
          }
        });

        map.addLayer({
          'id': 'route23',
          'source': 'route23',
          'type': 'line',
          'paint': {
            'line-width': 2,
            'line-color': '#90ee90'
          }
        });

        map.addLayer({
          'id': 'intermediate1Teir1',
          'source': 'intermediate1Teir1',
          'type': 'circle',
          'paint': {
            'circle-radius': 6,
            'circle-color': '#007cbf', // Blue color for glowing point
            'circle-blur': 0.5, // Blur effect to make it glow
            'circle-opacity': 1 // Slight transparency for glowing effect
          }
        });

        map.addLayer({
          'id': 'intermediate2Teir1',
          'source': 'intermediate2Teir1',  // Corrected source name
          'type': 'circle',
          'paint': {
            'circle-radius': 6,
            'circle-color': '#007cbf',
            'circle-blur': 0.5,
            'circle-opacity': 1
          }
        });

        map.addLayer({
          'id': 'intermediate1Teir2',
          'source': 'intermediate1Teir2',
          'type': 'circle',
          'paint': {
            'circle-radius': 6,
            'circle-color': '#007cbf', // Blue color for glowing point
            'circle-blur': 0.5, // Blur effect to make it glow
            'circle-opacity': 1 // Slight transparency for glowing effect
          }
        });

        map.addLayer({
          'id': 'intermediate2Teir2',
          'source': 'intermediate2Teir2',
          'type': 'circle',
          'paint': {
            'circle-radius': 6,
            'circle-color': '#007cbf', // Blue color for glowing point
            'circle-blur': 0.5, // Blur effect to make it glow
            'circle-opacity': 1 // Slight transparency for glowing effect
          }
        });

        map.addLayer({
          'id': 'origin',
          'source': 'origin',
          'type': 'circle',
          'paint': {
            'circle-radius': 10,
            'circle-color': '#ff0000', // Green color for glowing point
            'circle-blur': 0.5, // Blur effect to make it glow
            'circle-opacity': 1 // Slight transparency for glowing effect
          }
        });

        map.addLayer({
          'id': 'destination',
          'source': 'destination',
          'type': 'circle',
          'paint': {
            'circle-radius': 10,
            'circle-color': '#ff0000', // Color for glowing destination point
            'circle-blur': 0.5, // Blur effect to make it glow
            'circle-opacity': 1 // Slight transparency for glowing effect
          }
        });

        map.getStyle().layers.forEach((layer) => {
          if (layer.type === 'symbol' && layer.layout['text-field']) {
            map.setLayoutProperty(layer.id, 'visibility', 'none');
          }
        });

        // Add source label
        map.addLayer({
          'id': 'origin-label',
          'source': 'origin',
          'type': 'symbol',
          'layout': {
            'text-field': ['get', 'title'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 12,
            'text-offset': [0, 1.5]
          },
          'paint': {
            'text-color': '#ffffff', // White color to contrast with the dark map
            'text-halo-color': '#000000',
            'text-halo-width': 1
          }
        });

        // Add intermediate1Teir1 label
        map.addLayer({
          'id': 'intermediate1Teir1-label',
          'source': 'intermediate1Teir1',
          'type': 'symbol',
          'layout': {
            'text-field': ['get', 'title'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 8,
            'text-offset': [0, 1.5]
          },
          'paint': {
            'text-color': '#ffffff', // White color to contrast with the dark map
            'text-halo-color': '#000000',
            'text-halo-width': 1
          }
        });

        // Add intermediate2Teir1 label
        map.addLayer({
          'id': 'intermediate2Teir1-label',
          'source': 'intermediate2Teir1',
          'type': 'symbol',
          'layout': {
            'text-field': ['get', 'title'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 8,
            'text-offset': [0, 1.5]
          },
          'paint': {
            'text-color': '#ffffff', // White color to contrast with the dark map
            'text-halo-color': '#000000',
            'text-halo-width': 1
          }
        });

        // Add intermediate1Teir2 label
        map.addLayer({
          'id': 'intermediate1Teir2-label',
          'source': 'intermediate1Teir2',
          'type': 'symbol',
          'layout': {
            'text-field': ['get', 'title'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 8,
            'text-offset': [0, 1.5]
          },
          'paint': {
            'text-color': '#ffffff', // White color to contrast with the dark map
            'text-halo-color': '#000000',
            'text-halo-width': 1
          }
        });

        // Add intermediate2Teir2 label
        map.addLayer({
          'id': 'intermediate2Teir2-label',
          'source': 'intermediate2Teir2',
          'type': 'symbol',
          'layout': {
            'text-field': ['get', 'title'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 8,
            'text-offset': [0, 1.5]
          },
          'paint': {
            'text-color': '#ffffff', // White color to contrast with the dark map
            'text-halo-color': '#000000',
            'text-halo-width': 1
          }
        });

        // Add destination label
        map.addLayer({
          'id': 'destination-label',
          'source': 'destination',
          'type': 'symbol',
          'layout': {
            'text-field': ['get', 'title'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 12,
            'text-offset': [0, 1.5]
          },
          'paint': {
            'text-color': '#ffffff', // White color to contrast with the dark map
            'text-halo-color': '#000000',
            'text-halo-width': 1
          }
        });


        setMap(map); // Set the map state after everything is loaded
      });
    }


    return () => map.remove();
  }, [coordinates, moder]);

  return (
    <div>
      <div ref={mapContainerRef} className="map-container" />
    </div>
  );
}
