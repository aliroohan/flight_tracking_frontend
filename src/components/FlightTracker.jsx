import React, { useState, useEffect } from 'react';
import { trackingAPI, flightAPI } from '../services/api';
import FlightMap from './FlightMap';
import './FlightTracker.css';

const FlightTracker = () => {
    const [flightNumber, setFlightNumber] = useState('');
    const [flightPath, setFlightPath] = useState([]);
    const [flightInfo, setFlightInfo] = useState(null);
    const [currentPosition, setCurrentPosition] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeFlights, setActiveFlights] = useState([]);
    const [selectedTimestamp, setSelectedTimestamp] = useState('');

    // Load active flights on component mount
    useEffect(() => {
        loadActiveFlights();
    }, []);

    const loadActiveFlights = async () => {
        try {
            const response = await flightAPI.getActiveFlights();
            setActiveFlights(response.data.data || []);
        } catch (err) {
            console.error('Error loading active flights:', err);
        }
    };

    const handleTrackFlight = async () => {
        if (!flightNumber.trim()) {
            setError('Please enter a flight number');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Get flight info
            const flightResponse = await flightAPI.getFlightByNumber(flightNumber);
            setFlightInfo(flightResponse.data.data);

            // Get flight path
            const pathResponse = await trackingAPI.getFlightPath(flightNumber);
            const pathData = pathResponse.data.data.path;
            setFlightPath(pathData);

            // Get current position (latest)
            if (pathData.length > 0) {
                const locationResponse = await trackingAPI.getFlightLocation(flightNumber);
                setCurrentPosition(locationResponse.data.data.currentPosition);
            }

            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching flight data');
            setFlightPath([]);
            setFlightInfo(null);
            setCurrentPosition(null);
        } finally {
            setLoading(false);
        }
    };

    const handleGetPositionAtTime = async () => {
        if (!flightNumber.trim() || !selectedTimestamp) {
            setError('Please enter flight number and select a timestamp');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await trackingAPI.getFlightLocation(flightNumber, selectedTimestamp);
            setCurrentPosition(response.data.data.currentPosition);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching position at specified time');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectActiveFlight = (flight) => {
        setFlightNumber(flight.flightNumber);
    };

    return (
        <div className="flight-tracker">
            <div className="tracker-sidebar">
                <h1>✈️ FlightAware Tracker</h1>
                
                <div className="search-section">
                    <h2>Track Flight</h2>
                    <input
                        type="text"
                        placeholder="Enter Flight Number (e.g., AA123)"
                        value={flightNumber}
                        onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === 'Enter' && handleTrackFlight()}
                    />
                    <button onClick={handleTrackFlight} disabled={loading}>
                        {loading ? 'Loading...' : 'Track Flight'}
                    </button>
                </div>

                <div className="timestamp-section">
                    <h3>Get Position at Specific Time</h3>
                    <input
                        type="datetime-local"
                        value={selectedTimestamp}
                        onChange={(e) => setSelectedTimestamp(e.target.value)}
                    />
                    <button onClick={handleGetPositionAtTime} disabled={loading}>
                        Get Position
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                {flightInfo && (
                    <div className="flight-info">
                        <h2>Flight Information</h2>
                        <div className="info-item">
                            <strong>Flight:</strong> {flightInfo.flightNumber}
                        </div>
                        <div className="info-item">
                            <strong>Airline:</strong> {flightInfo.airline}
                        </div>
                        <div className="info-item">
                            <strong>Aircraft:</strong> {flightInfo.aircraftType}
                        </div>
                        <div className="info-item">
                            <strong>Status:</strong> 
                            <span className={`status-badge status-${flightInfo.status}`}>
                                {flightInfo.status}
                            </span>
                        </div>
                        <div className="info-item">
                            <strong>Origin:</strong> {flightInfo.origin.airport} - {flightInfo.origin.city}
                        </div>
                        <div className="info-item">
                            <strong>Destination:</strong> {flightInfo.destination.airport} - {flightInfo.destination.city}
                        </div>
                    </div>
                )}

                {currentPosition && (
                    <div className="current-position">
                        <h2>Current Position</h2>
                        <div className="info-item">
                            <strong>Latitude:</strong> {currentPosition.latitude.toFixed(4)}°
                        </div>
                        <div className="info-item">
                            <strong>Longitude:</strong> {currentPosition.longitude.toFixed(4)}°
                        </div>
                        <div className="info-item">
                            <strong>Altitude:</strong> {currentPosition.altitude.toLocaleString()} ft
                        </div>
                        <div className="info-item">
                            <strong>Speed:</strong> {currentPosition.speed} knots
                        </div>
                        <div className="info-item">
                            <strong>Heading:</strong> {currentPosition.heading}°
                        </div>
                        <div className="info-item">
                            <strong>Vertical Speed:</strong> {currentPosition.verticalSpeed} ft/min
                        </div>
                        <div className="info-item">
                            <strong>Time:</strong> {new Date(currentPosition.timestamp).toLocaleString()}
                        </div>
                    </div>
                )}

                {flightPath.length > 0 && (
                    <div className="path-info">
                        <h2>Flight Path</h2>
                        <div className="info-item">
                            <strong>Total Points:</strong> {flightPath.length}
                        </div>
                    </div>
                )}

                <div className="active-flights">
                    <h2>Active Flights</h2>
                    {activeFlights.length > 0 ? (
                        <div className="flights-list">
                            {activeFlights.map((flight) => (
                                <div 
                                    key={flight.flightNumber} 
                                    className="flight-item"
                                    onClick={() => handleSelectActiveFlight(flight)}
                                >
                                    <strong>{flight.flightNumber}</strong>
                                    <span>{flight.airline}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No active flights</p>
                    )}
                </div>
            </div>

            <div className="map-container">
                {flightPath.length > 0 ? (
                    <FlightMap 
                        flightPath={flightPath}
                        flightInfo={flightInfo}
                        currentPosition={currentPosition}
                    />
                ) : (
                    <div className="map-placeholder">
                        <h2>🌍 Track a flight to see its path on the map</h2>
                        <p>Enter a flight number and click "Track Flight"</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FlightTracker;

