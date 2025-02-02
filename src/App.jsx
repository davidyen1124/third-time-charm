import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LockedIn from './pages/LockedIn'
import Hoverboard from './pages/Hoverboard'
import ChromaticGate from './pages/ChromaticGate'

function App() {
  return (
    <Router basename='/third-time-charm'>
      <div className='flex flex-col min-h-screen'>
        <main className='flex-grow'>
          <Routes>
            <Route path='/lockedin' element={<LockedIn />} />
            <Route path='/hoverboard' element={<Hoverboard />} />
            <Route path='/chromatic-gate' element={<ChromaticGate />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
