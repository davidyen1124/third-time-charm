import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { usePageTitle } from '../hooks/usePageTitle'

function Man() {
  return (
    <group position={[0, -1.1, 0]}>
      {/* Head group (with eyes, mouth, hair) */}
      <group position={[0, 1.5, 0]}>
        {/* Main head */}
        <mesh>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color='pink' />
        </mesh>
        {/* Hair (small sphere on top) */}
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color='brown' />
        </mesh>
        {/* Right Eye */}
        <mesh position={[0.1, 0, 0.25]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color='black' />
        </mesh>
        {/* Left Eye */}
        <mesh position={[-0.1, 0, 0.25]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color='black' />
        </mesh>
        {/* Mouth (a small, thin box) */}
        <mesh position={[0, -0.1, 0.26]}>
          <boxGeometry args={[0.2, 0.05, 0.05]} />
          <meshStandardMaterial color='black' />
        </mesh>
      </group>

      {/* Torso */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[0.5, 1.0, 0.3]} />
        <meshStandardMaterial color='pink' />
      </mesh>

      {/* Right Arm */}
      <mesh position={[0.35, 0.75, 0]}>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color='pink' />
      </mesh>

      {/* Left Arm */}
      <mesh position={[-0.35, 0.75, 0]}>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color='pink' />
      </mesh>

      {/* Right Leg */}
      <mesh position={[0.15, 0.0, 0]}>
        <boxGeometry args={[0.1, 0.7, 0.1]} />
        <meshStandardMaterial color='pink' />
      </mesh>

      {/* Left Leg */}
      <mesh position={[-0.15, 0.0, 0]}>
        <boxGeometry args={[0.1, 0.7, 0.1]} />
        <meshStandardMaterial color='pink' />
      </mesh>
    </group>
  )
}

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
