import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import { useState, Suspense } from 'react'
import PropTypes from 'prop-types'
import { usePageTitle } from '../hooks/usePageTitle'

function ScanLine({ dotted, running, sensorZ }) {
  const color = '#000000'
  const emissive = running ? '#ff0000' : '#00ff00'
  if (!dotted) {
    return (
      <mesh position={[0, 0.2, sensorZ]}>
        <boxGeometry args={[2.1, 0.02, 0.02]} />
        <meshStandardMaterial
          emissive={emissive}
          emissiveIntensity={5}
          color={color}
        />
      </mesh>
    )
  }
  const segmentCount = 8
  const segmentWidth = 2.1 / segmentCount
  const gapRatio = 0.5
  const boxWidth = segmentWidth * (1 - gapRatio)
  const segments = []
  for (let i = 0; i < segmentCount; i++) {
    const x = -1.05 + segmentWidth * i + boxWidth / 2
    segments.push(
      <mesh key={i} position={[x, 0.2, sensorZ]}>
        <boxGeometry args={[boxWidth, 0.02, 0.02]} />
        <meshStandardMaterial
          emissive={emissive}
          emissiveIntensity={5}
          color={color}
        />
      </mesh>
    )
  }
  return <group>{segments}</group>
}

ScanLine.propTypes = {
  dotted: PropTypes.bool.isRequired,
  running: PropTypes.bool.isRequired,
  sensorZ: PropTypes.number.isRequired,
}

function Belt({ length = 20, width = 2 }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[width, length]} />
      <meshStandardMaterial color="#111" />
    </mesh>
  )
}

Belt.propTypes = {
  length: PropTypes.number,
  width: PropTypes.number,
}

function BoxItem({ position, color, dims }) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={dims} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

BoxItem.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
  color: PropTypes.string.isRequired,
  dims: PropTypes.arrayOf(PropTypes.number).isRequired,
}

function ConveyorScene() {
  const showLine = true
  const dottedLine = false
  const randomDims = () => {
    const min = 0.4
    const max = 0.8
    return [
      min + Math.random() * (max - min),
      min + Math.random() * (max - min),
      min + Math.random() * (max - min),
    ]
  }

  const randomGap = () => 1.5 + Math.random() * 1.5

  const [items, setItems] = useState(() => {
    const initial = []
    let z = -10
    for (let i = 0; i < 6; i++) {
      initial.push({
        id: i,
        z,
        color: `hsl(${Math.random() * 360},70%,60%)`,
        dims: randomDims(),
      })
      z -= randomGap()
    }
    return initial
  })
  const [running, setRunning] = useState(true)

  const speed = 0.045
  const sensorZ = 0.5
  const offscreenZ = 2
  const spawnZ = -14

  useFrame(() => {
    if (running) {
      setItems((prev) => prev.map((it) => ({ ...it, z: it.z + speed })))
    }
    setItems((prev) => prev.filter((it) => it.z < offscreenZ))
    items.forEach((it) => {
      if (running && it.z + speed >= sensorZ && it.z < sensorZ) {
        setRunning(false)
        setTimeout(() => setRunning(true), 1200)
      }
    })
    if (items.length < 6) {
      setItems((prev) => {
        const minZ = prev.reduce((m, it) => Math.min(m, it.z), spawnZ)
        const z = Math.min(spawnZ, minZ - randomGap())
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            z,
            color: `hsl(${Math.random() * 360},70%,60%)`,
            dims: randomDims(),
          },
        ]
      })
    }
  })

  return (
    <>
      <Belt />
      {showLine && (
        <ScanLine dotted={dottedLine} running={running} sensorZ={sensorZ} />
      )}
      {items.map((it) => (
        <BoxItem
          key={it.id}
          position={[0, 0.31, it.z]}
          color={it.color}
          dims={it.dims}
        />
      ))}
      <Html position={[0, 1.4, 0]} transform occlude>
        <div className="rounded-2xl shadow-lg backdrop-blur bg-white/80 px-4 py-2">
          <p className="text-xs font-semibold text-gray-800">
            {running ? 'Belt running …' : 'Scanning item …'}
          </p>
        </div>
      </Html>
    </>
  )
}

export default function Conveyor() {
  usePageTitle('The Grocery Conveyor')
  return (
    <div className="h-screen w-full bg-gray-900 grid place-items-center">
      <Canvas shadows camera={{ position: [4, 4.5, 6], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
        <Suspense fallback={null}>
          <ConveyorScene />
        </Suspense>
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  )
}
