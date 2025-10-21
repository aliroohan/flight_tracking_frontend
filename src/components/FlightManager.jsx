import React, { useState } from 'react';
import { flightAPI, trackingAPI } from '../services/api';
import './FlightManager.css';

const FlightManager = () => {
    const [activeTab, setActiveTab] = useState('createFlight');
    const [message, setMessage] = useState({ type: '', text: '' });

    // Flight form state
    const [flightData, setFlightData] = useState({
        flightNumber: '',
        airline: '',
        aircraftType: '',
        origin: {
            airport: '',
            city: '',
            country: '',
            coordinates: { latitude: 0, longitude: 0 }
        },
        destination: {
            airport: '',
            city: '',
            country: '',
            coordinates: { latitude: 0, longitude: 0 }
        },
        scheduledDeparture: '',
        scheduledArrival: '',
        status: 'scheduled'
    });

    // Tracking data state
    const [trackingData, setTrackingData] = useState({
        flightNumber: '',
        position: {
            latitude: 0,
            longitude: 0,
            altitude: 0
        },
        speed: 0,
        heading: 0,
        verticalSpeed: 0,
        receiverInfo: {
            receiverId: '',
            receiverLocation: { latitude: 0, longitude: 0 },
            signalStrength: 100
        },
        squawk: ''
    });

    const handleCreateFlight = async (e) => {
        e.preventDefault();
        try {
            const response = await flightAPI.createFlight(flightData);
            setMessage({ type: 'success', text: response.data.message });
            // Reset form
            setFlightData({
                flightNumber: '',
                airline: '',
                aircraftType: '',
                origin: {
                    airport: '',
                    city: '',
                    country: '',
                    coordinates: { latitude: 0, longitude: 0 }
                },
                destination: {
                    airport: '',
                    city: '',
                    country: '',
                    coordinates: { latitude: 0, longitude: 0 }
                },
                scheduledDeparture: '',
                scheduledArrival: '',
                status: 'scheduled'
            });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error creating flight' });
        }
    };

    const handleIngestTracking = async (e) => {
        e.preventDefault();
        try {
            const response = await trackingAPI.ingestTrackingData(trackingData);
            setMessage({ type: 'success', text: response.data.message });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error ingesting tracking data' });
        }
    };

    const handleCompleteFlight = async () => {
        if (!trackingData.flightNumber) {
            setMessage({ type: 'error', text: 'Please enter a flight number' });
            return;
        }
        try {
            const response = await trackingAPI.completeFlight(trackingData.flightNumber);
            setMessage({ type: 'success', text: response.data.message });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error completing flight' });
        }
    };

    return (
        <div className="flight-manager">
            <h1>✈️ Flight Management</h1>
            
            <div className="tabs">
                <button 
                    className={activeTab === 'createFlight' ? 'active' : ''}
                    onClick={() => setActiveTab('createFlight')}
                >
                    Create Flight
                </button>
                <button 
                    className={activeTab === 'ingestData' ? 'active' : ''}
                    onClick={() => setActiveTab('ingestData')}
                >
                    Ingest Tracking Data
                </button>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {activeTab === 'createFlight' && (
                <form onSubmit={handleCreateFlight} className="flight-form">
                    <h2>Create New Flight</h2>
                    
                    <div className="form-section">
                        <h3>Flight Details</h3>
                        <input
                            type="text"
                            placeholder="Flight Number (e.g., AA123)"
                            value={flightData.flightNumber}
                            onChange={(e) => setFlightData({...flightData, flightNumber: e.target.value.toUpperCase()})}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Airline"
                            value={flightData.airline}
                            onChange={(e) => setFlightData({...flightData, airline: e.target.value})}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Aircraft Type (e.g., Boeing 737)"
                            value={flightData.aircraftType}
                            onChange={(e) => setFlightData({...flightData, aircraftType: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-section">
                        <h3>Origin</h3>
                        <input
                            type="text"
                            placeholder="Airport Code (e.g., JFK)"
                            value={flightData.origin.airport}
                            onChange={(e) => setFlightData({...flightData, origin: {...flightData.origin, airport: e.target.value.toUpperCase()}})}
                            required
                        />
                        <input
                            type="text"
                            placeholder="City"
                            value={flightData.origin.city}
                            onChange={(e) => setFlightData({...flightData, origin: {...flightData.origin, city: e.target.value}})}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Country"
                            value={flightData.origin.country}
                            onChange={(e) => setFlightData({...flightData, origin: {...flightData.origin, country: e.target.value}})}
                            required
                        />
                        <div className="coordinates">
                            <input
                                type="number"
                                step="0.000001"
                                placeholder="Latitude"
                                value={flightData.origin.coordinates.latitude}
                                onChange={(e) => setFlightData({...flightData, origin: {...flightData.origin, coordinates: {...flightData.origin.coordinates, latitude: parseFloat(e.target.value)}}})}
                                required
                            />
                            <input
                                type="number"
                                step="0.000001"
                                placeholder="Longitude"
                                value={flightData.origin.coordinates.longitude}
                                onChange={(e) => setFlightData({...flightData, origin: {...flightData.origin, coordinates: {...flightData.origin.coordinates, longitude: parseFloat(e.target.value)}}})}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Destination</h3>
                        <input
                            type="text"
                            placeholder="Airport Code (e.g., LAX)"
                            value={flightData.destination.airport}
                            onChange={(e) => setFlightData({...flightData, destination: {...flightData.destination, airport: e.target.value.toUpperCase()}})}
                            required
                        />
                        <input
                            type="text"
                            placeholder="City"
                            value={flightData.destination.city}
                            onChange={(e) => setFlightData({...flightData, destination: {...flightData.destination, city: e.target.value}})}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Country"
                            value={flightData.destination.country}
                            onChange={(e) => setFlightData({...flightData, destination: {...flightData.destination, country: e.target.value}})}
                            required
                        />
                        <div className="coordinates">
                            <input
                                type="number"
                                step="0.000001"
                                placeholder="Latitude"
                                value={flightData.destination.coordinates.latitude}
                                onChange={(e) => setFlightData({...flightData, destination: {...flightData.destination, coordinates: {...flightData.destination.coordinates, latitude: parseFloat(e.target.value)}}})}
                                required
                            />
                            <input
                                type="number"
                                step="0.000001"
                                placeholder="Longitude"
                                value={flightData.destination.coordinates.longitude}
                                onChange={(e) => setFlightData({...flightData, destination: {...flightData.destination, coordinates: {...flightData.destination.coordinates, longitude: parseFloat(e.target.value)}}})}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Schedule</h3>
                        <label>Scheduled Departure:</label>
                        <input
                            type="datetime-local"
                            value={flightData.scheduledDeparture}
                            onChange={(e) => setFlightData({...flightData, scheduledDeparture: e.target.value})}
                            required
                        />
                        <label>Scheduled Arrival:</label>
                        <input
                            type="datetime-local"
                            value={flightData.scheduledArrival}
                            onChange={(e) => setFlightData({...flightData, scheduledArrival: e.target.value})}
                            required
                        />
                    </div>

                    <button type="submit" className="submit-btn">Create Flight</button>
                </form>
            )}

            {activeTab === 'ingestData' && (
                <form onSubmit={handleIngestTracking} className="tracking-form">
                    <h2>Ingest Tracking Data</h2>
                    
                    <div className="form-section">
                        <input
                            type="text"
                            placeholder="Flight Number"
                            value={trackingData.flightNumber}
                            onChange={(e) => setTrackingData({...trackingData, flightNumber: e.target.value.toUpperCase()})}
                            required
                        />
                    </div>

                    <div className="form-section">
                        <h3>Position</h3>
                        <input
                            type="number"
                            step="0.000001"
                            placeholder="Latitude"
                            value={trackingData.position.latitude}
                            onChange={(e) => setTrackingData({...trackingData, position: {...trackingData.position, latitude: parseFloat(e.target.value)}})}
                            required
                        />
                        <input
                            type="number"
                            step="0.000001"
                            placeholder="Longitude"
                            value={trackingData.position.longitude}
                            onChange={(e) => setTrackingData({...trackingData, position: {...trackingData.position, longitude: parseFloat(e.target.value)}})}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Altitude (feet)"
                            value={trackingData.position.altitude}
                            onChange={(e) => setTrackingData({...trackingData, position: {...trackingData.position, altitude: parseFloat(e.target.value)}})}
                            required
                        />
                    </div>

                    <div className="form-section">
                        <h3>Flight Parameters</h3>
                        <input
                            type="number"
                            placeholder="Speed (knots)"
                            value={trackingData.speed}
                            onChange={(e) => setTrackingData({...trackingData, speed: parseFloat(e.target.value)})}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Heading (0-360°)"
                            value={trackingData.heading}
                            onChange={(e) => setTrackingData({...trackingData, heading: parseFloat(e.target.value)})}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Vertical Speed (ft/min)"
                            value={trackingData.verticalSpeed}
                            onChange={(e) => setTrackingData({...trackingData, verticalSpeed: parseFloat(e.target.value)})}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Squawk Code (optional)"
                            value={trackingData.squawk}
                            onChange={(e) => setTrackingData({...trackingData, squawk: e.target.value})}
                        />
                    </div>

                    <div className="form-section">
                        <h3>Receiver Info</h3>
                        <input
                            type="text"
                            placeholder="Receiver ID"
                            value={trackingData.receiverInfo.receiverId}
                            onChange={(e) => setTrackingData({...trackingData, receiverInfo: {...trackingData.receiverInfo, receiverId: e.target.value}})}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Signal Strength (0-100)"
                            value={trackingData.receiverInfo.signalStrength}
                            onChange={(e) => setTrackingData({...trackingData, receiverInfo: {...trackingData.receiverInfo, signalStrength: parseFloat(e.target.value)}})}
                            required
                        />
                    </div>

                    <button type="submit" className="submit-btn">Ingest Tracking Data</button>
                    
                    <button 
                        type="button" 
                        className="complete-btn"
                        onClick={handleCompleteFlight}
                    >
                        Complete Flight & Move to Logs
                    </button>
                </form>
            )}
        </div>
    );
};

export default FlightManager;

