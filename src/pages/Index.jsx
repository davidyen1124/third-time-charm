import { Canvas, useFrame } from '@react-three/fiber'
import { Image, OrbitControls, Html } from '@react-three/drei'
import { usePageTitle } from '../hooks/usePageTitle'
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'

// 👇 local copies of the screenshots
import lockedIn from '../../.github/assets/screenshots/locked-in.png'
import hoverboard from '../../.github/assets/screenshots/hoverboard.png'
import chromaticGate from '../../.github/assets/screenshots/chromatic-gate.png'
import carPhysics from '../../.github/assets/screenshots/car-physics.png'
import duck from '../../.github/assets/screenshots/duck.png'
import polaroid from '../../.github/assets/screenshots/polaroid.png'
import conveyor from '../../.github/assets/screenshots/conveyor.png'

const demos = [
  {
    path: '/lockedin',
    name: 'The Pink Prisoner',
    img: lockedIn,
  },
  {
    path: '/hoverboard',
    name: 'The Physics-Defying Dude',
    img: hoverboard,
  },
  {
    path: '/chromatic-gate',
    name: 'The Chromatic Gate',
    img: chromaticGate,
  },
  {
    path: '/car-physics',
    name: 'The Physics-Challenged Cars',
    img: carPhysics,
  },
  {
    path: '/duck',
    name: 'The Rubber Duck Flotilla',
    img: duck,
  },
  {
    path: '/polaroid',
    name: 'The Spotlight Polaroids',
    img: polaroid,
  },
  {
    path: '/conveyor',
    name: 'The Grocery Lane Conveyor',
    img: conveyor,
  },
  {
    path: '/marshaller',
    name: 'The Runway Maestro',
  },
]

function Carousel({ items }) {
  const group = useRef()
  const navigate = useNavigate()
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.5
  })

  const radius = 4
  return (
    <group ref={group}>
      {items.map((demo, i) => {
        const angle = (i / items.length) * Math.PI * 2
        const pos = [Math.sin(angle) * radius, 0, Math.cos(angle) * radius]
        const rot = [0, angle + Math.PI, 0]
        if (demo.img) {
          return (
            <Image
              key={demo.path}
              url={demo.img}
              position={pos}
              scale={[2.4, 1.6, 1]}
              rotation={rot}
              onClick={() => navigate(demo.path)}
            />
          )
        }
        return (
          <mesh
            key={demo.path}
            position={pos}
            rotation={rot}
            scale={[2.4, 1.6, 1]}
            onClick={() => navigate(demo.path)}
          >
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial color="gray" />
            <Html center>
              <div className="text-white text-xs">{demo.name}</div>
            </Html>
          </mesh>
        )
      })}
    </group>
  )
}

Carousel.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default function Index() {
  usePageTitle('The Not-So-Grand Gallery')
  return (
    <div className="relative h-screen bg-gray-900">
      <Canvas className="absolute inset-0">
        <ambientLight intensity={0.5} />
        <Carousel items={demos} />
        <OrbitControls enableZoom={false} />
      </Canvas>
      <h1 className="absolute top-4 left-1/2 -translate-x-1/2 text-3xl font-bold text-white">
        Third Time Charm Gallery
      </h1>
    </div>
  )
}
