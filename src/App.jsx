import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Index from './pages/Index'

const demos = {
  lockedin: lazy(() => import('./pages/LockedIn')),
  hoverboard: lazy(() => import('./pages/Hoverboard')),
  'chromatic-gate': lazy(() => import('./pages/ChromaticGate')),
  'car-physics': lazy(() => import('./pages/CarPhysics')),
  duck: lazy(() => import('./pages/Duck')),
  polaroid: lazy(() => import('./pages/Polaroid')),
  conveyor: lazy(() => import('./pages/Conveyor')),
  techmap: lazy(() => import('./pages/Techmap')),
}

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Index />} />
            {Object.entries(demos).map(([path, Demo]) => (
              <Route
                key={path}
                path={`/${path}`}
                element={
                  <>
                    <Link className="legacy-gallery-link" to={`/?work=${path}`}>
                      Back to the museum
                    </Link>
                    <Suspense
                      fallback={
                        <div className="legacy-loading">
                          Opening the experiment…
                        </div>
                      }
                    >
                      <Demo />
                    </Suspense>
                  </>
                }
              />
            ))}
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
