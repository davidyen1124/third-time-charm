import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'

function Plane() {
  const ref = useRef()
  const angle = useRef(0)
  useFrame((_, delta) => {
    angle.current += delta * 0.3
    const a = angle.current
    const radius = 10
    ref.current.position.set(
      Math.sin(a) * radius,
      5 + Math.sin(a * 2),
      Math.cos(a) * radius
    )
    ref.current.rotation.y = a + Math.PI / 2
    ref.current.rotation.z = Math.sin(a * 2) * 0.1
  })
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[1.5, 0.3, 4]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* wings */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[6, 0.1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
      <mesh position={[0, -0.2, -1.5]}>
        <boxGeometry args={[1, 0.1, 1]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </group>
  )
}

function Scene() {
  return (
    <>
      <color attach="background" args={[0x87ceeb]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1} />
      <Plane />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="green" />
      </mesh>
      <OrbitControls />
    </>
  )
}

export default function FlightSimulator() {
  usePageTitle('The Realistic Flight Simulator')
  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [20, 10, 20], fov: 60 }}>
        <Scene />
      </Canvas>
    </div>
  )
}
