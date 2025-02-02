import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { usePageTitle } from '../hooks/usePageTitle'
import Man from '../components/man'

function LockedInCage() {
  const barCount = 8
  const barHeight = 3
  const cageRadius = 1

  return (
    <group>
      {/* Vertical Bars */}
      {Array.from({ length: barCount }).map((_, i) => {
        const angle = (i / barCount) * Math.PI * 2
        const x = Math.cos(angle) * cageRadius
        const z = Math.sin(angle) * cageRadius
        return (
          <mesh key={i} position={[x, 0, z]} rotation={[0, angle, 0]}>
            <cylinderGeometry args={[0.05, 0.05, barHeight, 8]} />
            <meshStandardMaterial color='gray' />
          </mesh>
        )
      })}

      {/* Top Ring */}
      <mesh position={[0, barHeight / 2, 0]}>
        <cylinderGeometry
          args={[cageRadius + 0.05, cageRadius + 0.05, 0.1, 16, 1, false]}
        />
        <meshStandardMaterial color='gray' />
      </mesh>

      {/* Bottom Ring */}
      <mesh position={[0, -barHeight / 2, 0]}>
        <cylinderGeometry
          args={[cageRadius + 0.05, cageRadius + 0.05, 0.1, 16, 1, false]}
        />
        <meshStandardMaterial color='gray' />
      </mesh>
    </group>
  )
}

export default function LockedIn() {
  usePageTitle('The Pink Prisoner')

  return (
    <div className='w-full h-screen flex items-center justify-center bg-gray-900'>
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />

        <LockedInCage />
        <Man />

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={0}
          autoRotate={true}
          autoRotateSpeed={2}
        />
      </Canvas>
    </div>
  )
}
