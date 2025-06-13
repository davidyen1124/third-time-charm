import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Index from './pages/Index'
import LockedIn from './pages/LockedIn'
import Hoverboard from './pages/Hoverboard'
import ChromaticGate from './pages/ChromaticGate'
import CarPhysics from './pages/CarPhysics'
import Duck from './pages/Duck'
import Polaroid from './pages/Polaroid'
import Conveyor from './pages/Conveyor'
import Marshaller from './pages/Marshaller'

function App() {
  return (
    <Router basename="/third-time-charm">
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/lockedin" element={<LockedIn />} />
            <Route path="/hoverboard" element={<Hoverboard />} />
            <Route path="/chromatic-gate" element={<ChromaticGate />} />
            <Route path="/car-physics" element={<CarPhysics />} />
            <Route path="/duck" element={<Duck />} />
            <Route path="/polaroid" element={<Polaroid />} />
            <Route path="/conveyor" element={<Conveyor />} />
            <Route path="/marshaller" element={<Marshaller />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
