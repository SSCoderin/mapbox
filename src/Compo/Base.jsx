import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Styler from "../street/style.json"

mapboxgl.accessToken = 'pk.eyJ1Ijoid2F5cG9ydC13YXlwb3J0IiwiYSI6ImNtMmtjYW5zNjA1cmIyc3NjaTJhMGNzanQifQ.2hORGRlYUxSDDndrA4BmoQ';

const MapComponent = ({
  sourceLocation,
  destinationLocation,
  intermediate1Location,
  intermediate2Location,
  intermediateD1Location,
  intermediateD2Location,
  models
}) => {
  const mapContainerRef = useRef(null);
  // const mapRef = useRef(null);
  const markersRef = useRef({});
  // const labelsRef = useRef({});
  // const planeMarkersRef = useRef({});
  const animationFrameRef = useRef(null);
  // const [visibleLocations, setVisibleLocations] = useState(new Set());
  const [mapRef, setMapRef] = useState(null);

  console.log("Models are as follows ----> ", models);
  // const F = models.includes(1);
  // const T = models.includes(2);
  // const TT = models.includes(3);
  const TF = models?.includes(4);
  const FT = models?.includes(5);
  const TFT = models?.includes(6);

  // Initial zoomed out view
  const INITIAL_VIEW = {
    center: [-95.712891, 37.09024],
    zoom: 0.8,
    pitch: 0,
    bearing: 0
  };

  const hasValidProps = () => {
    return sourceLocation?.coordinates &&
      destinationLocation?.coordinates &&
      intermediate1Location?.coordinates &&
      intermediate2Location?.coordinates &&
      intermediateD1Location?.coordinates &&
      intermediateD2Location?.coordinates;
  };

  const calculateBounds = () => {
    if (!hasValidProps()) return null;

    const coordinates = [
      sourceLocation.coordinates,
      destinationLocation.coordinates,
      intermediate1Location.coordinates,
      intermediate2Location.coordinates,
      intermediateD1Location.coordinates,
      intermediateD2Location.coordinates,
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
        width: 16px;
        height: 16px;
        background: radial-gradient(circle, rgba(9,4,101,1) 0%, rgba(9,9,121,1) 5%, rgba(4,6,94,1) 9%, rgba(0,4,70,0.17471988795518212) 77%, rgba(0,212,255,0) 100%);
        border-radius: 50%;
        animation: blink 1s infinite;
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

  // const createPlaneMarker = () => {
  //   const el = document.createElement('div');
  //   el.className = 'plane-marker';

  //   const style = document.createElement('style');
  //   style.textContent = `
  //     .plane-marker {
  //       width: 24px;
  //       height: 24px;
  //       background-color: #ffffff;
  //       border-radius: 50%;
  //       display: flex;
  //       align-items: center;
  //       justify-content: center;
  //       box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  //       opacity: 0;
  //       transition: opacity 0.5s ease-in-out;
  //     }
  //     .plane-marker svg {
  //       width: 16px;
  //       height: 16px;
  //       color: #4285f4;
  //     }
  //     .plane-marker.visible {
  //       opacity: 1;
  //     }
  //     .plane-marker .plane-trail {
  //       position: absolute;
  //       width: 20px;
  //       height: 2px;
  //       background: linear-gradient(to left, rgba(66, 133, 244, 0.6), transparent);
  //       transform-origin: left center;
  //       pointer-events: none;
  //     }
  //   `;
  //   document.head.appendChild(style);

  //   // Add plane icon using SVG
  //   el.innerHTML = `
  //     <svg viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>airplane</title> <desc>Created with Sketch Beta.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage"> <g id="Icon-Set-Filled" sketch:type="MSLayerGroup" transform="translate(-310.000000, -309.000000)" fill="#000000"> <path d="M341.207,309.82 C339.961,308.57 337.771,308.863 336.518,310.119 L330.141,316.481 L318.313,312.061 C317.18,311.768 316.039,311.389 314.634,312.798 C313.917,313.516 312.427,315.01 314.634,317.221 L322.744,323.861 L317.467,329.127 L312.543,327.896 C311.813,327.708 311.321,327.855 310.946,328.269 C310.757,328.505 309.386,329.521 310.342,330.479 L316.067,334.933 L320.521,340.658 C321.213,341.352 321.856,340.919 322.735,340.084 C323.292,339.526 323.172,339.239 323.004,338.426 L321.892,333.536 L327.133,328.277 L333.763,336.389 C335.969,338.6 337.46,337.105 338.177,336.389 C339.583,334.979 339.205,333.837 338.912,332.702 L334.529,320.854 L340.88,314.481 C342.133,313.226 342.454,311.069 341.207,309.82" id="airplane" sketch:type="MSShapeGroup"> </path> </g> </g> </g></svg>
  //     <div class="plane-trail"></div>
  //   `;

  //   return el;
  // };

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

  // const animatePlaneAlongPath = (map, lineCoordinates, planeId, duration = 3000) => {
  //   const planeEl = createPlaneMarker();
  //   const plane = new mapboxgl.Marker(planeEl)
  //     .setLngLat(lineCoordinates[0])
  //     .addTo(map);

  //   planeMarkersRef.current[planeId] = plane;

  //   // Show plane after a short delay
  //   setTimeout(() => {
  //     planeEl.classList.add('visible');
  //   }, 100);

  //   let start = null;
  //   const animate = (timestamp) => {
  //     if (!start) start = timestamp;
  //     const progress = (timestamp - start) / duration;

  //     if (progress >= 1) {
  //       // Remove plane at end of animation
  //       plane.remove();
  //       return;
  //     }

  //     // Calculate current position along the path
  //     const currentIndex = Math.floor(progress * (lineCoordinates.length - 1));
  //     const nextIndex = Math.min(currentIndex + 1, lineCoordinates.length - 1);
  //     const segmentProgress = progress * (lineCoordinates.length - 1) - currentIndex;

  //     // Interpolate position
  //     const currentPos = lineCoordinates[currentIndex];
  //     const nextPos = lineCoordinates[nextIndex];
  //     const currentLng = currentPos[0] + (nextPos[0] - currentPos[0]) * segmentProgress;
  //     const currentLat = currentPos[1] + (nextPos[1] - currentPos[1]) * segmentProgress;

  //     // Calculate bearing for plane rotation
  //     const bearing = getBearing(currentPos, nextPos);
  //     planeEl.style.transform = `rotate(${bearing}deg)`;

  //     plane.setLngLat([currentLng, currentLat]);
  //     animationFrameRef.current = requestAnimationFrame(animate);
  //   };

  //   requestAnimationFrame(animate);
  // };

  // const getBearing = (start, end) => {
  //   const startLat = start[1] * Math.PI / 180;
  //   const startLng = start[0] * Math.PI / 180;
  //   const endLat = end[1] * Math.PI / 180;
  //   const endLng = end[0] * Math.PI / 180;

  //   const dLng = endLng - startLng;

  //   const y = Math.sin(dLng) * Math.cos(endLat);
  //   const x = Math.cos(startLat) * Math.sin(endLat) -
  //     Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

  //   const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  //   return bearing;
  // };

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
          // Start plane animation from checkpoint to destination
          // const remainingPath = lineCoordinates.slice(i);
          // animatePlaneAlongPath(map, remainingPath, `${pathId}-plane`);
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

  const initializeAnimationSequence = async () => {
    // console.log(mapRef)
    if (!hasValidProps()) return;

    // Add initial markers but keep them invisible
    // addMarkerWithLabel(map, sourceLocation.coordinates, sourceLocation.name, 'source', false);
    // addMarkerWithLabel(map, destinationLocation.coordinates, destinationLocation.name, 'destination', false);

    // Wait for initial load
    await new Promise(resolve => setTimeout(resolve, 1000));

    mapRef.easeTo({
      center: [78.9629, 20.5937],
      zoom: 2,
      duration: 3000,
      curve: 1,
      pitch: 0,
      easing(t) {
        const x1 = 1, y1 = 0.01, x2 = 0.2, y2 = 1;
        return 3 * Math.pow(1 - t, 2) * t * y1 + 3 * (1 - t) * Math.pow(t, 2) * y2 + Math.pow(t, 3);
      }
    });

    await new Promise(resolve => setTimeout(resolve, 3000));


    // Smooth zoom to fit all points
    const bounds = calculateBounds();
    mapRef.fitBounds(bounds, {
      padding: 100,
      duration: 3000,
      pitch: 45,
      bearing: -11.7,
      maxZoom: 4.9
    });

    // Wait for zoom animation to complete
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Show source and destination markers with a slight delay
    addMarkerWithLabel(mapRef, sourceLocation.coordinates, sourceLocation.name, 'source', false);
    addMarkerWithLabel(mapRef, destinationLocation.coordinates, destinationLocation.name, 'destination', false);
    setTimeout(() => {
      showMarker('source');
      showMarker('destination');
    }, 3000);

    const pathF = createArc(sourceLocation.coordinates, destinationLocation.coordinates);

    // Add source and layer for pathF
    mapRef.addSource('pathF', {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [],
        },
      },
    });

    mapRef.addLayer({
      id: 'pathF',
      type: "line",
      source: 'pathF',
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#FD1d1d",
        "line-width": 3,
        "line-opacity": 1,
      },
    });

    // Animate pathF
    await new Promise(resolve => {
      animatePath(mapRef, pathF, "pathF", null, () => { });
      const checkCompletion = () => {
        const source = mapRef.getSource("pathF");
        if (source && source._data.geometry.coordinates.length === pathF.length) {
          resolve();
        } else {
          setTimeout(checkCompletion, 100);
        }
      };
      checkCompletion();
    });

    // Helper function to create a promise that resolves when path animation is complete
    const createAnimationPromise = (mapRef, path, pathId, intermediateCoords, markerCallback) => {
      return new Promise((resolve) => {
        animatePath(mapRef, path, pathId, intermediateCoords, markerCallback);

        const checkCompletion = () => {
          const source = mapRef.getSource(pathId);
          if (source && source._data.geometry.coordinates.length === path.length) {
            markerCallback();
            resolve();
          } else {
            setTimeout(checkCompletion, 100);
          }
        };
        checkCompletion();
      });
    };

    // 2. Handle TFT paths
    if (TFT !== null && TFT === true && !TF && TF !== null && FT !== null && !FT) {
      const pathTFT1 = [
        ...createArc(sourceLocation.coordinates, intermediate1Location.coordinates),
        ...createArc(intermediate1Location.coordinates, intermediateD1Location.coordinates),
        ...createArc(intermediateD1Location.coordinates, destinationLocation.coordinates)
      ];

      const pathTFT2 = [
        ...createArc(sourceLocation.coordinates, intermediate2Location.coordinates),
        ...createArc(intermediate2Location.coordinates, intermediateD2Location.coordinates),
        ...createArc(intermediateD2Location.coordinates, destinationLocation.coordinates)
      ];

      // Add sources and layers for TFT paths
      ['pathTFT1', 'pathTFT2'].forEach((pathId) => {
        mapRef.addSource(pathId, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [],
            },
          },
        });

        mapRef.addLayer({
          id: pathId,
          type: "line",
          source: pathId,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#833AB4",
            "line-width": 3,
            "line-opacity": 1,
          },
        });
      });

      // Animate TFT paths sequentially
      await createAnimationPromise(
        mapRef,
        pathTFT1,
        "pathTFT1",
        intermediate1Location.coordinates,
        () => {
          addMarkerWithLabel(mapRef, intermediate1Location.coordinates, intermediate1Location.name, 'intermediate1', true);
          addMarkerWithLabel(mapRef, intermediateD1Location.coordinates, intermediateD1Location.name, 'intermediateD1', true);
        }
      );

      await createAnimationPromise(
        mapRef,
        pathTFT2,
        "pathTFT2",
        intermediate2Location.coordinates,
        () => {
          addMarkerWithLabel(mapRef, intermediate2Location.coordinates, intermediate2Location.name, 'intermediate2', true);
          addMarkerWithLabel(mapRef, intermediateD2Location.coordinates, intermediateD2Location.name, 'intermediateD2', true);
        }
      );
    }

    // 3. Handle TF and FT paths
    if (TF || FT) {
      if (TF && FT) {
        // Create all paths
        const pathTF1 = [
          ...createArc(sourceLocation.coordinates, intermediate1Location.coordinates),
          ...createArc(intermediate1Location.coordinates, destinationLocation.coordinates)
        ];
        const pathTF2 = [
          ...createArc(sourceLocation.coordinates, intermediate2Location.coordinates),
          ...createArc(intermediate2Location.coordinates, destinationLocation.coordinates)
        ];
        const pathFT1 = [
          ...createArc(sourceLocation.coordinates, intermediateD1Location.coordinates),
          ...createArc(intermediateD1Location.coordinates, destinationLocation.coordinates)
        ];
        const pathFT2 = [
          ...createArc(sourceLocation.coordinates, intermediateD2Location.coordinates),
          ...createArc(intermediateD2Location.coordinates, destinationLocation.coordinates)
        ];

        // Add sources and layers for all paths
        ['pathTF1', 'pathTF2', 'pathFT1', 'pathFT2'].forEach(pathId => {
          mapRef.addSource(pathId, {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: [],
              },
            },
          });

          mapRef.addLayer({
            id: pathId,
            type: "line",
            source: pathId,
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": pathId.startsWith('pathTF') ? "#0047f4" : "#EF00D2",
              "line-width": 3,
              "line-opacity": 1,
            },
          });
        });

        // Animate paths sequentially with completion check
        await createAnimationPromise(
          mapRef,
          pathTF1,
          "pathTF1",
          intermediate1Location.coordinates,
          () => {
            addMarkerWithLabel(mapRef, intermediate1Location.coordinates, intermediate1Location.name, 'intermediate1', true);
          }
        );

        await createAnimationPromise(
          mapRef,
          pathTF2,
          "pathTF2",
          intermediate2Location.coordinates,
          () => {
            addMarkerWithLabel(mapRef, intermediate2Location.coordinates, intermediate2Location.name, 'intermediate2', true);
          }
        );

        await createAnimationPromise(
          mapRef,
          pathFT1,
          "pathFT1",
          intermediateD1Location.coordinates,
          () => {
            addMarkerWithLabel(mapRef, intermediateD1Location.coordinates, intermediateD1Location.name, 'intermediateD1', true);
          }
        );

        await createAnimationPromise(
          mapRef,
          pathFT2,
          "pathFT2",
          intermediateD2Location.coordinates,
          () => {
            addMarkerWithLabel(mapRef, intermediateD2Location.coordinates, intermediateD2Location.name, 'intermediateD2', true);
          }
        );

      } else if (TF) {
        // Handle TF only paths
        const pathTF1 = [
          ...createArc(sourceLocation.coordinates, intermediate1Location.coordinates),
          ...createArc(intermediate1Location.coordinates, destinationLocation.coordinates)
        ];
        const pathTF2 = [
          ...createArc(sourceLocation.coordinates, intermediate2Location.coordinates),
          ...createArc(intermediate2Location.coordinates, destinationLocation.coordinates)
        ];

        ['pathTF1', 'pathTF2'].forEach(pathId => {
          mapRef.addSource(pathId, {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: [],
              },
            },
          });

          mapRef.addLayer({
            id: pathId,
            type: "line",
            source: pathId,
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#0047f4",
              "line-width": 3,
              "line-opacity": 1,
            },
          });
        });

        await createAnimationPromise(
          mapRef,
          pathTF1,
          "pathTF1",
          intermediate1Location.coordinates,
          () => {
            addMarkerWithLabel(mapRef, intermediate1Location.coordinates, intermediate1Location.name, 'intermediate1', true);
          }
        );

        await createAnimationPromise(
          mapRef,
          pathTF2,
          "pathTF2",
          intermediate2Location.coordinates,
          () => {
            addMarkerWithLabel(mapRef, intermediate2Location.coordinates, intermediate2Location.name, 'intermediate2', true);
          }
        );

      } else if (FT) {
        // Handle FT only paths
        const pathFT1 = [
          ...createArc(sourceLocation.coordinates, intermediateD1Location.coordinates),
          ...createArc(intermediateD1Location.coordinates, destinationLocation.coordinates)
        ];
        const pathFT2 = [
          ...createArc(sourceLocation.coordinates, intermediateD2Location.coordinates),
          ...createArc(intermediateD2Location.coordinates, destinationLocation.coordinates)
        ];

        ['pathFT1', 'pathFT2'].forEach(pathId => {
          mapRef.addSource(pathId, {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: [],
              },
            },
          });

          mapRef.addLayer({
            id: pathId,
            type: "line",
            source: pathId,
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#EF00D2",
              "line-width": 3,
              "line-opacity": 1,
            },
          });
        });

        await createAnimationPromise(
          mapRef,
          pathFT1,
          "pathFT1",
          intermediateD1Location.coordinates,
          () => {
            addMarkerWithLabel(mapRef, intermediateD1Location.coordinates, intermediateD1Location.name, 'intermediateD1', true);
          }
        );

        await createAnimationPromise(
          mapRef,
          pathFT2,
          "pathFT2",
          intermediateD2Location.coordinates,
          () => {
            addMarkerWithLabel(mapRef, intermediateD2Location.coordinates, intermediateD2Location.name, 'intermediateD2', true);
          }
        );
      }
    }
  };

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: Styler,
      center: INITIAL_VIEW.center,
      globe: {
        place_label_major: false,
        place_label_minor: false,
        place_label_other: false
      },
      zoom: INITIAL_VIEW.zoom,
      pitch: INITIAL_VIEW.pitch,
      bearing: INITIAL_VIEW.bearing,
      projection: "globe",
      dragRotate: false, // Disable rotation
      interactive: false
    });

    // Add fog and terrain configuration
    // map.on('style.load', () => {
    //   // Configure fog effect
    //   map.setFog({
    //     'color': 'rgb(186, 210, 235)', // Day sky color
    //     'high-color': 'rgb(36, 92, 223)', // Blue atmosphere
    //     'horizon-blend': 0.02, // Atmosphere thickness
    //     'space-color': 'rgb(11, 11, 25)', // Dark space
    //     'star-intensity': 0.6 // Brightness of stars
    //   });

    //   // Add terrain if available in the style
    //   if (map.getSource('mapbox-dem')) {
    //     map.setTerrain({
    //       'source': 'mapbox-dem',
    //       'exaggeration': 1.5 // Terrain exaggeration
    //     });
    //   }
    // });

    // Add quality improvement handlers
    map.on('movestart', () => {
      map.getCanvas().style.imageRendering = 'high-quality';
    });

    map.on('moveend', () => {
      map.getCanvas().style.imageRendering = 'auto';
    });

    setMapRef(map);
  }, [])

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef) return;
    // Add this after map initialization
    mapRef.on('style.load', () => {
      const layersToHide = [
        'settlement-major-label',  // Major cities
        'settlement-minor-label',  // Minor cities
        'settlement-subdivision-label', // Neighborhoods
      ];

      layersToHide.forEach(layer => {
        if (mapRef.getLayer(layer)) {
          mapRef.setLayoutProperty(layer, 'visibility', 'none');
        }
      });
    });


    // mapRef.on('style.load', () => {
    // Only initialize animation sequence if we have valid props
    if (hasValidProps()) {
      initializeAnimationSequence();
    }
    // });

    // return () => {
    //   if (animationFrameRef.current) {
    //     cancelAnimationFrame(animationFrameRef.current);
    //   }
    //   Object.values(markersRef.current).forEach(({ marker, label }) => {
    //     marker.remove();
    //     label.remove();
    //   });
    //   Object.values(planeMarkersRef.current).forEach(marker => {
    //     marker.remove();
    //   });
    //   if (mapRef) {
    //     mapRef.remove();
    //   }
    // };
  }, [sourceLocation, destinationLocation, intermediate1Location, intermediate2Location, mapRef]);

  return <div ref={mapContainerRef} style={{ height: "700px", width: "100%" }} />;
};

export default MapComponent;