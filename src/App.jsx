import { useState } from 'react'
import FlightTracker from './components/FlightTracker'
import FlightManager from './components/FlightManager'
import './App.css'

function App() {
  const [activeView, setActiveView] = useState('tracker')

  return (
    <div className="app">
      <nav className="main-nav">
        <div className="nav-brand">
          <h1>✈️ FlightAware - Flight Tracking System</h1>
        </div>
        <div className="nav-buttons">
          <button 
            className={activeView === 'tracker' ? 'active' : ''}
            onClick={() => setActiveView('tracker')}
          >
            Flight Tracker
          </button>
          <button 
            className={activeView === 'manager' ? 'active' : ''}
            onClick={() => setActiveView('manager')}
          >
            Manage Flights
          </button>
        </div>
      </nav>

      <div className="app-content">
        {activeView === 'tracker' ? <FlightTracker /> : <FlightManager />}
      </div>
    </div>
  )
}

export default App
