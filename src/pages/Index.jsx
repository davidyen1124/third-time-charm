import { Canvas, useFrame } from '@react-three/fiber'
import { Image, OrbitControls, Html, Environment } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'
import { usePageTitle } from '../hooks/usePageTitle'
import { useRef, useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'

import lockedIn from '../../.github/assets/screenshots/locked-in.png'
import hoverboard from '../../.github/assets/screenshots/hoverboard.png'
import chromaticGate from '../../.github/assets/screenshots/chromatic-gate.png'
import carPhysics from '../../.github/assets/screenshots/car-physics.png'
import duck from '../../.github/assets/screenshots/duck.png'
import polaroid from '../../.github/assets/screenshots/polaroid.png'
import conveyor from '../../.github/assets/screenshots/conveyor.png'
import techmap from '../../.github/assets/screenshots/techmap.png'

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
    path: '/techmap',
    name: 'The Tech Company Constellation',
    img: techmap,
  },
]

function SceneLighting() {
  const pointLightRef = useRef()
  const spotLightRef = useRef()

  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    if (pointLightRef.current) {
      pointLightRef.current.position.x = Math.sin(time * 0.5) * 6
      pointLightRef.current.position.z = Math.cos(time * 0.5) * 6
      pointLightRef.current.intensity = 0.8 + Math.sin(time * 2) * 0.2
    }

    if (spotLightRef.current) {
      spotLightRef.current.position.y = 3 + Math.sin(time * 0.3) * 0.5
      spotLightRef.current.angle = Math.PI / 6 + Math.sin(time) * 0.1
    }
  })

  return (
    <>
      <ambientLight intensity={0.2} color="#4a5568" />

      <directionalLight
        position={[5, 5, 5]}
        intensity={0.8}
        color="#ffd89b"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <directionalLight
        position={[-3, 3, -3]}
        intensity={0.4}
        color="#87ceeb"
      />

      <pointLight
        ref={pointLightRef}
        position={[0, 4, 0]}
        intensity={1}
        color="#ff6b6b"
        distance={12}
        decay={2}
      />

      <spotLight
        ref={spotLightRef}
        position={[0, 8, 0]}
        target-position={[0, 0, 0]}
        angle={Math.PI / 6}
        penumbra={0.5}
        intensity={0.6}
        color="#a8e6cf"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <directionalLight position={[0, 2, -8]} intensity={0.3} color="#ffffff" />
    </>
  )
}

function CarouselItem({
  demo,
  position,
  rotation,
  index,
  onHover,
  onLeave,
  onClick,
}) {
  const [hovered, setHovered] = useState(false)
  const [mounted, setMounted] = useState(false)
  const itemRef = useRef()

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), index * 150)
    return () => clearTimeout(timer)
  }, [index])

  const { scale, positionY, glowOpacity, emissiveIntensity } = useSpring({
    scale: hovered ? [2.8, 1.9, 1] : mounted ? [2.4, 1.6, 1] : [0, 0, 0],
    positionY: hovered ? (position[1] || 0) + 0.3 : position[1] || 0,
    glowOpacity: hovered ? 0.4 : 0.1,
    emissiveIntensity: hovered ? 0.3 : 0.1,
    config: {
      tension: 180,
      friction: 12,
    },
  })

  useFrame((state) => {
    if (itemRef.current && mounted) {
      const time = state.clock.getElapsedTime()
      const floatOffset = Math.sin(time * 0.8 + index) * 0.1
      const baseY = position[1] || 0
      itemRef.current.position.y = baseY + floatOffset + (hovered ? 0.3 : 0)
    }
  })

  const handlePointerOver = useCallback(
    (e) => {
      e.stopPropagation()
      setHovered(true)
      onHover()
    },
    [onHover]
  )

  const handlePointerOut = useCallback(
    (e) => {
      e.stopPropagation()
      setHovered(false)
      onLeave()
    },
    [onLeave]
  )

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation()
      onClick()
    },
    [onClick]
  )

  if (demo.img) {
    return (
      <animated.group
        ref={itemRef}
        position={[position[0] || 0, positionY, position[2] || 0]}
        rotation={rotation || [0, 0, 0]}
        scale={scale}
      >
        <Image
          url={demo.img}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
          transparent
          opacity={0.95}
          castShadow
          receiveShadow
        />

        <animated.mesh position={[0, 0, -0.01]} scale={[1.1, 1.1, 1]}>
          <planeGeometry args={[1, 1]} />
          <animated.meshBasicMaterial
            color={
              hovered ? new THREE.Color(0x00ffff) : new THREE.Color(0x4a90e2)
            }
            transparent
            opacity={glowOpacity}
            side={THREE.DoubleSide}
          />
        </animated.mesh>

        {hovered && (
          <Html center distanceFactor={8} position={[0, -1.4, 0]}>
            <div className="bg-black bg-opacity-80 text-white px-6 py-3 rounded-lg text-sm font-medium backdrop-blur-sm border border-cyan-400 shadow-lg shadow-cyan-400/20 animate-pulse text-center min-w-48">
              {demo.name}
            </div>
          </Html>
        )}
      </animated.group>
    )
  }

  return (
    <animated.group
      ref={itemRef}
      position={[position[0] || 0, positionY, position[2] || 0]}
      rotation={rotation || [0, 0, 0]}
      scale={scale}
    >
      <mesh
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        castShadow
        receiveShadow
      >
        <planeGeometry args={[1, 1]} />
        <animated.meshStandardMaterial
          color={
            hovered ? new THREE.Color(0x4a5568) : new THREE.Color(0x2d3748)
          }
          roughness={0.3}
          metalness={0.6}
          envMapIntensity={1.0}
          emissive={new THREE.Color(0x1a202c)}
          emissiveIntensity={emissiveIntensity}
        />
        <Html center>
          <div className="text-white text-xs font-semibold drop-shadow-lg">
            {demo.name}
          </div>
        </Html>
      </mesh>

      <animated.mesh position={[0, 0, -0.01]} scale={[1.1, 1.1, 1]}>
        <planeGeometry args={[1, 1]} />
        <animated.meshBasicMaterial
          color={
            hovered ? new THREE.Color(0x9f7aea) : new THREE.Color(0x6b46c1)
          }
          transparent
          opacity={glowOpacity}
          side={THREE.DoubleSide}
        />
      </animated.mesh>
    </animated.group>
  )
}

CarouselItem.propTypes = {
  demo: PropTypes.shape({
    path: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    img: PropTypes.string,
  }).isRequired,
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
  rotation: PropTypes.arrayOf(PropTypes.number).isRequired,
  index: PropTypes.number.isRequired,
  onHover: PropTypes.func.isRequired,
  onLeave: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
}

function Carousel({ items }) {
  const group = useRef()
  const [isPaused, setIsPaused] = useState(false)
  useFrame((_, delta) => {
    if (group.current && !isPaused) {
      group.current.rotation.y += delta * 0.2
    }
  })

  const handleItemHover = useCallback(() => {
    setIsPaused(true)
  }, [])

  const handleItemLeave = useCallback(() => {
    setIsPaused(false)
  }, [])

  const handleItemClick = useCallback((path) => {
    setTimeout(() => window.open(path, '_blank'), 100)
  }, [])

  const radius = 4
  return (
    <group ref={group}>
      {items.map((demo, i) => {
        const angle = (i / items.length) * Math.PI * 2
        const pos = [Math.sin(angle) * radius, 0, Math.cos(angle) * radius]
        const rot = [0, angle + Math.PI, 0]

        return (
          <CarouselItem
            key={demo.path}
            demo={demo}
            position={pos}
            rotation={rot}
            index={i}
            onHover={handleItemHover}
            onLeave={handleItemLeave}
            onClick={() => handleItemClick(demo.path)}
          />
        )
      })}
    </group>
  )
}

Carousel.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      img: PropTypes.string,
    })
  ).isRequired,
}

export default function Index() {
  usePageTitle('The Not-So-Grand Gallery')

  return (
    <div className="relative h-screen animated-bg overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              top: `${Math.random() * 100}%`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="corner-decoration top-0 left-0" />
      <div className="corner-decoration top-0 right-0 rotate-90" />
      <div className="corner-decoration bottom-0 left-0 -rotate-90" />
      <div className="corner-decoration bottom-0 right-0 rotate-180" />

      <Canvas
        className="absolute inset-0"
        shadows
        camera={{ position: [0, 2, 8], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
      >
        <SceneLighting />

        <Environment preset="night" background={false} />

        <mesh
          position={[0, -2, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[20, 20, 50, 50]} />
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={0.15}
            wireframe={true}
          />
        </mesh>

        <fog attach="fog" args={['#0f0f23', 8, 25]} />

        <Carousel items={demos} />
        <OrbitControls
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 6}
        />
      </Canvas>

      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center z-10">
        <h1 className="text-4xl md:text-5xl font-bold gallery-title mb-2">
          Third Time Charm Gallery
        </h1>
        <p className="text-sm text-gray-300 opacity-80">
          Interactive 3D Portfolio Showcase
        </p>
      </div>
    </div>
  )
}
