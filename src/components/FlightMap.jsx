import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// You need to get a free Mapbox token from https://www.mapbox.com/
const MAPBOX_TOKEN = import.meta.env.MAP_API; // Replace with your actual token
console.log(MAPBOX_TOKEN);

const FlightMap = ({ flightPath, flightInfo, currentPosition }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(0);
    const [lat, setLat] = useState(20);
    const [zoom, setZoom] = useState(2);

    useEffect(() => {
        if (map.current) return; // Initialize map only once
        
        mapboxgl.accessToken = MAPBOX_TOKEN;
        
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: [lng, lat],
            zoom: zoom,
            projection: 'globe'
        });

        map.current.on('move', () => {
            setLng(map.current.getCenter().lng.toFixed(4));
            setLat(map.current.getCenter().lat.toFixed(4));
            setZoom(map.current.getZoom().toFixed(2));
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add fog effect for globe
        map.current.on('style.load', () => {
            map.current.setFog({
                'horizon-blend': 0.3,
                'color': '#242B4B',
                'high-color': '#161B36',
                'space-color': '#0B1026',
                'star-intensity': 0.8
            });
        });
    }, []);

    useEffect(() => {
        if (!map.current || !flightPath || flightPath.length === 0) return;

        // Clear existing layers and sources
        if (map.current.getSource('route')) {
            map.current.removeLayer('route');
            map.current.removeSource('route');
        }
        if (map.current.getSource('route-points')) {
            map.current.removeLayer('route-points');
            map.current.removeSource('route-points');
        }

        // Prepare coordinates for the flight path
        const coordinates = flightPath.map(point => [point.longitude, point.latitude]);

        // Add the route as a line
        map.current.addSource('route', {
            type: 'geojson',
            data: {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: coordinates
                }
            }
        });

        map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#00D4FF',
                'line-width': 3,
                'line-opacity': 0.8
            }
        });

        // Add points along the route
        const pointsFeatures = flightPath.map((point, index) => ({
            type: 'Feature',
            properties: {
                altitude: point.altitude,
                speed: point.speed,
                timestamp: point.timestamp,
                index: index
            },
            geometry: {
                type: 'Point',
                coordinates: [point.longitude, point.latitude]
            }
        }));

        map.current.addSource('route-points', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: pointsFeatures
            }
        });

        map.current.addLayer({
            id: 'route-points',
            type: 'circle',
            source: 'route-points',
            paint: {
                'circle-radius': 4,
                'circle-color': '#00D4FF',
                'circle-opacity': 0.6
            }
        });

        // Add markers for origin and destination
        if (flightInfo) {
            // Origin marker
            const originEl = document.createElement('div');
            originEl.className = 'origin-marker';
            originEl.innerHTML = '🛫';
            originEl.style.fontSize = '24px';
            
            new mapboxgl.Marker(originEl)
                .setLngLat([flightInfo.origin.coordinates.longitude, flightInfo.origin.coordinates.latitude])
                .setPopup(new mapboxgl.Popup({ offset: 25 })
                    .setHTML(`<h3>Origin</h3><p>${flightInfo.origin.airport} - ${flightInfo.origin.city}</p>`))
                .addTo(map.current);

            // Destination marker
            const destEl = document.createElement('div');
            destEl.className = 'destination-marker';
            destEl.innerHTML = '🛬';
            destEl.style.fontSize = '24px';
            
            new mapboxgl.Marker(destEl)
                .setLngLat([flightInfo.destination.coordinates.longitude, flightInfo.destination.coordinates.latitude])
                .setPopup(new mapboxgl.Popup({ offset: 25 })
                    .setHTML(`<h3>Destination</h3><p>${flightInfo.destination.airport} - ${flightInfo.destination.city}</p>`))
                .addTo(map.current);
        }

        // Fit map to show the entire route
        const bounds = coordinates.reduce((bounds, coord) => {
            return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

        map.current.fitBounds(bounds, {
            padding: 100,
            duration: 1000
        });

        // Add popup on hover
        map.current.on('click', 'route-points', (e) => {
            const coordinates = e.features[0].geometry.coordinates.slice();
            const properties = e.features[0].properties;
            
            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(`
                    <div style="color: black;">
                        <strong>Tracking Point #${properties.index + 1}</strong><br/>
                        <strong>Altitude:</strong> ${properties.altitude} ft<br/>
                        <strong>Speed:</strong> ${properties.speed} knots<br/>
                        <strong>Time:</strong> ${new Date(properties.timestamp).toLocaleString()}
                    </div>
                `)
                .addTo(map.current);
        });

        // Change cursor on hover
        map.current.on('mouseenter', 'route-points', () => {
            map.current.getCanvas().style.cursor = 'pointer';
        });

        map.current.on('mouseleave', 'route-points', () => {
            map.current.getCanvas().style.cursor = '';
        });

    }, [flightPath, flightInfo]);

    // Add current position marker
    useEffect(() => {
        if (!map.current || !currentPosition) return;

        // Remove existing current position marker if it exists
        const existingMarkers = document.getElementsByClassName('current-position-marker');
        while(existingMarkers.length > 0){
            existingMarkers[0].remove();
        }

        // Create airplane marker
        const el = document.createElement('div');
        el.className = 'current-position-marker';
        el.innerHTML = '✈️';
        el.style.fontSize = '28px';
        el.style.transform = `rotate(${currentPosition.heading || 0}deg)`;

        new mapboxgl.Marker(el)
            .setLngLat([currentPosition.longitude, currentPosition.latitude])
            .setPopup(new mapboxgl.Popup({ offset: 25 })
                .setHTML(`
                    <div style="color: black;">
                        <strong>Current Position</strong><br/>
                        <strong>Altitude:</strong> ${currentPosition.altitude} ft<br/>
                        <strong>Speed:</strong> ${currentPosition.speed} knots<br/>
                        <strong>Heading:</strong> ${currentPosition.heading}°<br/>
                        <strong>Vertical Speed:</strong> ${currentPosition.verticalSpeed} ft/min
                    </div>
                `))
            .addTo(map.current);

    }, [currentPosition]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div className="map-info" style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '10px',
                borderRadius: '5px',
                zIndex: 1,
                fontSize: '12px'
            }}>
                Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
            </div>
            <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

export default FlightMap;

