import axios from 'axios';

const API_BASE_URL = 'https://flight-tracking-backend.vercel.app/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Flight APIs
export const flightAPI = {
    // Create a new flight
    createFlight: (flightData) => api.post('/flights', flightData),
    
    // Get all flights
    getAllFlights: (params) => api.get('/flights', { params }),
    
    // Get flight by flight number
    getFlightByNumber: (flightNumber) => api.get(`/flights/${flightNumber}`),
    
    // Get active flights
    getActiveFlights: () => api.get('/flights/active'),
    
    // Update flight status
    updateFlightStatus: (flightNumber, statusData) => 
        api.put(`/flights/${flightNumber}/status`, statusData),
    
    // Delete flight
    deleteFlight: (flightNumber) => api.delete(`/flights/${flightNumber}`),
};

// Tracking APIs
export const trackingAPI = {
    // Ingest single tracking data
    ingestTrackingData: (trackingData) => api.post('/tracking/ingest', trackingData),
    
    // Ingest batch tracking data
    ingestBatchTrackingData: (flightNumber, trackingDataArray) => 
        api.post('/tracking/ingest/batch', { flightNumber, trackingDataArray }),
    
    // Get flight location
    getFlightLocation: (flightNumber, timestamp) => 
        api.get(`/tracking/${flightNumber}/location`, { params: { timestamp } }),
    
    // Get flight path
    getFlightPath: (flightNumber, startTime, endTime) => 
        api.get(`/tracking/${flightNumber}/path`, { params: { startTime, endTime } }),
    
    // Get all active tracking
    getAllActiveTracking: (limit) => api.get('/tracking/active', { params: { limit } }),
    
    // Complete flight
    completeFlight: (flightNumber) => api.post(`/tracking/${flightNumber}/complete`),
};

// Log APIs
export const logAPI = {
    // Get all flight logs
    getAllFlightLogs: (params) => api.get('/logs', { params }),
    
    // Get flight log by number
    getFlightLogByNumber: (flightNumber) => api.get(`/logs/${flightNumber}`),
    
    // Get all logs for a flight
    getAllLogsForFlight: (flightNumber) => api.get(`/logs/${flightNumber}/all`),
    
    // Get flight statistics
    getFlightStatistics: (flightNumber) => api.get(`/logs/${flightNumber}/statistics`),
    
    // Delete flight log
    deleteFlightLog: (id) => api.delete(`/logs/${id}`),
};

export default api;

