import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom airplane icon
const createAirplaneIcon = (heading = 0) => {
  return L.divIcon({
    html: `<div style="transform: rotate(${heading}deg); font-size: 24px;">✈️</div>`,
    className: 'custom-airplane-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

// Custom origin/destination icons
const createOriginIcon = () => {
  return L.divIcon({
    html: '<div style="font-size: 24px;">🛫</div>',
    className: 'custom-origin-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

const createDestinationIcon = () => {
  return L.divIcon({
    html: '<div style="font-size: 24px;">🛬</div>',
    className: 'custom-destination-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

// Component to fit map bounds to flight path
const FitBounds = ({ coordinates }) => {
  const map = useMap();
  
  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [coordinates, map]);
  
  return null;
};

const FlightMap = ({ flightPath, flightInfo, currentPosition }) => {
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);

  // Prepare coordinates for the flight path
  const flightCoordinates = useMemo(() => {
    return flightPath && flightPath.length > 0 
      ? flightPath.map(point => [point.latitude, point.longitude])
      : [];
  }, [flightPath]);

  // Calculate map center and zoom based on flight path
  useEffect(() => {
    if (flightCoordinates.length > 0) {
      const bounds = L.latLngBounds(flightCoordinates);
      const center = bounds.getCenter();
      setMapCenter([center.lat, center.lng]);
      setMapZoom(3);
    }
  }, [flightCoordinates]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Dark theme alternative - uncomment to use */}
        {/* <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        /> */}

        {/* Flight path line */}
        {flightCoordinates.length > 0 && (
          <Polyline
            positions={flightCoordinates}
            pathOptions={{
              color: '#00D4FF',
              weight: 3,
              opacity: 0.8
            }}
          />
        )}

        {/* Flight path points */}
        {flightPath && flightPath.map((point, index) => (
          <CircleMarker
            key={index}
            center={[point.latitude, point.longitude]}
            radius={4}
            pathOptions={{
              color: '#00D4FF',
              fillColor: '#00D4FF',
              fillOpacity: 0.6
            }}
          >
            <Popup>
              <div style={{ color: 'black' }}>
                <strong>Tracking Point #{index + 1}</strong><br/>
                <strong>Altitude:</strong> {point.altitude} ft<br/>
                <strong>Speed:</strong> {point.speed} knots<br/>
                <strong>Time:</strong> {new Date(point.timestamp).toLocaleString()}
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Origin marker */}
        {flightInfo && flightInfo.origin && (
          <Marker
            position={[flightInfo.origin.coordinates.latitude, flightInfo.origin.coordinates.longitude]}
            icon={createOriginIcon()}
          >
            <Popup>
              <div style={{ color: 'black' }}>
                <h3>Origin</h3>
                <p>{flightInfo.origin.airport} - {flightInfo.origin.city}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination marker */}
        {flightInfo && flightInfo.destination && (
          <Marker
            position={[flightInfo.destination.coordinates.latitude, flightInfo.destination.coordinates.longitude]}
            icon={createDestinationIcon()}
          >
            <Popup>
              <div style={{ color: 'black' }}>
                <h3>Destination</h3>
                <p>{flightInfo.destination.airport} - {flightInfo.destination.city}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Current position marker */}
        {currentPosition && (
          <Marker
            position={[currentPosition.latitude, currentPosition.longitude]}
            icon={createAirplaneIcon(currentPosition.heading || 0)}
          >
            <Popup>
              <div style={{ color: 'black' }}>
                <strong>Current Position</strong><br/>
                <strong>Altitude:</strong> {currentPosition.altitude} ft<br/>
                <strong>Speed:</strong> {currentPosition.speed} knots<br/>
                <strong>Heading:</strong> {currentPosition.heading}°<br/>
                <strong>Vertical Speed:</strong> {currentPosition.verticalSpeed} ft/min
              </div>
            </Popup>
          </Marker>
        )}

        {/* Fit bounds to flight path */}
        {flightCoordinates.length > 0 && (
          <FitBounds coordinates={flightCoordinates} />
        )}
      </MapContainer>

      {/* Map info overlay */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '50px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 1000,
        fontSize: '12px'
      }}>
        <div>Center: {mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}</div>
        <div>Zoom: {mapZoom}</div>
        <div>Points: {flightCoordinates.length}</div>
      </div>
    </div>
  );
};

export default FlightMap;