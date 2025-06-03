import { Canvas, useFrame } from '@react-three/fiber'
import { Image, OrbitControls } from '@react-three/drei'
import { usePageTitle } from '../hooks/usePageTitle'
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'

const demos = [
  {
    path: '/lockedin',
    name: 'The Pink Prisoner',
    img: 'https://github.com/davidyen1124/third-time-charm/raw/main/.github/assets/screenshots/locked-in.png',
  },
  {
    path: '/hoverboard',
    name: 'The Physics-Defying Dude',
    img: 'https://github.com/davidyen1124/third-time-charm/raw/main/.github/assets/screenshots/hoverboard.png',
  },
  {
    path: '/chromatic-gate',
    name: 'The Chromatic Gate',
    img: 'https://github.com/davidyen1124/third-time-charm/raw/main/.github/assets/screenshots/chromatic-gate.png',
  },
  {
    path: '/car-physics',
    name: 'The Physics-Challenged Cars',
    img: 'https://github.com/davidyen1124/third-time-charm/raw/main/.github/assets/screenshots/car-physics.png',
  },
  {
    path: '/duck',
    name: 'The Rubber Duck Flotilla',
    img: 'https://github.com/davidyen1124/third-time-charm/raw/main/.github/assets/screenshots/duck.png',
  },
  {
    path: '/polaroid',
    name: 'The Spotlight Polaroids',
    img: 'https://github.com/davidyen1124/third-time-charm/raw/main/.github/assets/screenshots/polaroid.png',
  },
  {
    path: '/conveyor',
    name: 'The Grocery Lane Conveyor',
    img: 'https://github.com/davidyen1124/third-time-charm/raw/main/.github/assets/screenshots/conveyor.png',
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
        return (
          <Image
            key={demo.path}
            url={demo.img}
            position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]}
            scale={[2.4, 1.6, 1]}
            rotation={[0, angle + Math.PI, 0]}
            onClick={() => navigate(demo.path)}
          />
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
