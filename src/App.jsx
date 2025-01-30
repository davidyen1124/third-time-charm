import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LockedIn from './pages/lockedIn'
import Hoverboard from './pages/hoverboard'

function App() {
  return (
    <Router basename='/third-time-charm'>
      <div className='flex flex-col min-h-screen'>
        <main className='flex-grow'>
          <Routes>
            <Route path='/lockedin' element={<LockedIn />} />
            <Route path='/hoverboard' element={<Hoverboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
