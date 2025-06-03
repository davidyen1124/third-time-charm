import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import { useState, Suspense } from 'react'
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

function Belt({ length = 20, width = 2 }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[length, width]} />
      <meshStandardMaterial color='#111' />
    </mesh>
  )
}

function BoxItem({ position, color }) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[0.6, 0.6, 0.6]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

function ConveyorScene() {
  const showLine = true
  const dottedLine = false
  const [items, setItems] = useState(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      z: -10 - i * 2,
      color: `hsl(${Math.random() * 360},70%,60%)`
    }))
  )
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
      setItems((prev) => [
        ...prev,
        { id: crypto.randomUUID(), z: spawnZ, color: `hsl(${Math.random() * 360},70%,60%)` }
      ])
    }
  })

  return (
    <>
      <Belt />
      {showLine && (
        <ScanLine dotted={dottedLine} running={running} sensorZ={sensorZ} />
      )}
      {items.map((it) => (
        <BoxItem key={it.id} position={[0, 0.31, it.z]} color={it.color} />
      ))}
      <Html position={[0, 1.4, 0]} transform occlude>
        <div className='rounded-2xl shadow-lg backdrop-blur bg-white/80 px-4 py-2'>
          <p className='text-xs font-semibold text-gray-800'>
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
    <div className='h-screen w-full bg-gray-900 grid place-items-center'>
      <Canvas shadows camera={{ position: [4, 4.5, 6], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
        <Suspense fallback={null}>
          <ConveyorScene />
        </Suspense>
        <OrbitControls makeDefault />
      </Canvas>
      <div className='absolute bottom-4 right-4 text-white/70 text-xs pointer-events-none'>
        Click & drag to orbit
      </div>
    </div>
  )
}
