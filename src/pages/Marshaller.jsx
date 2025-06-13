import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import Man from '../components/man'

function ManWithWands() {
  const leftWand = useRef()
  const rightWand = useRef()
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (leftWand.current) leftWand.current.rotation.z = Math.sin(t) * 0.5
    if (rightWand.current) rightWand.current.rotation.z = -Math.sin(t) * 0.5
  })
  return (
    <group>
      <Man />
      <mesh
        ref={leftWand}
        position={[-0.45, 1, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.05, 0.05, 1, 16]} />
        <meshStandardMaterial
          color="orange"
          emissive="red"
          emissiveIntensity={2}
        />
      </mesh>
      <mesh
        ref={rightWand}
        position={[0.45, 1, 0]}
        rotation={[0, 0, -Math.PI / 2]}
      >
        <cylinderGeometry args={[0.05, 0.05, 1, 16]} />
        <meshStandardMaterial
          color="orange"
          emissive="red"
          emissiveIntensity={2}
        />
      </mesh>
    </group>
  )
}

export default function Marshaller() {
  usePageTitle('The Runway Maestro')
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-900">
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <ManWithWands />
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>
    </div>
  )
}
