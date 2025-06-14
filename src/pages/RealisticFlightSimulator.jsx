import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'

function PaperPlane() {
  const ref = useRef()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref.current) {
      ref.current.position.z = (-t * 2) % 50
      ref.current.position.y = Math.sin(t) * 2
      ref.current.rotation.y = Math.sin(t * 0.5) * 0.5
    }
  })

  return (
    <group ref={ref} position={[0, 0, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.5, 2, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0, 0, -1]} rotation={[0, 0, 0]}>
        <boxGeometry args={[2, 0.1, 1]} />
        <meshStandardMaterial color="lightgray" />
      </mesh>
    </group>
  )
}

export default function RealisticFlightSimulator() {
  usePageTitle('The Realistic Flight Simulator')
  return (
    <div className="w-full h-screen bg-sky-400">
      <Canvas camera={{ position: [10, 5, 10] }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} />
        <PaperPlane />
        <OrbitControls />
      </Canvas>
    </div>
  )
}
