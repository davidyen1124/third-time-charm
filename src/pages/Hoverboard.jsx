import React, { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import Man from '../components/man'
import { usePageTitle } from '../hooks/usePageTitle'

function HoverboardWithHumanoid() {
  const boardRef = useRef()

  const handleCollisionEnter = (event) => {
    if (!boardRef.current) return
    if (event.other.rigidBodyObject?.userData?.name === 'ground') {
      // Generate a random horizontal angle (0 to 2π)
      const randomAngle = Math.random() * 2 * Math.PI

      // Define the upward impulse and a horizontal impulse factor (adjust these as needed)
      const upwardImpulse = 5
      const horizontalImpulse = 2

      // Compute a random horizontal impulse vector
      const impulseVector = {
        x: horizontalImpulse * Math.cos(randomAngle),
        y: upwardImpulse,
        z: horizontalImpulse * Math.sin(randomAngle)
      }

      boardRef.current.applyImpulse(impulseVector, true)
    }
  }

  return (
    <RigidBody
      ref={boardRef}
      type='dynamic'
      ccd={true}
      position={[0, 5, 0]}
      onCollisionEnter={handleCollisionEnter}
    >
      {/* Hoverboard Mesh */}
      <mesh castShadow receiveShadow position={[0, -1.475, 0]}>
        <boxGeometry args={[1.5, 0.05, 0.5]} />
        <meshStandardMaterial color='blue' />
      </mesh>

      {/* Man (visual only) */}
      <Man />

      {/* Collider for the Hoverboard */}
      <CuboidCollider args={[0.75, 0.025, 0.25]} position={[0, -1.475, 0]} />

      {/* Additional Collider for the Man */}
      <CuboidCollider args={[0.25, 1.075, 0.25]} position={[0, -0.1, 0]} />
    </RigidBody>
  )
}

function InvisibleBoundary({ position, size }) {
  const halfSize = [size[0] / 2, size[1] / 2, size[2] / 2]
  return (
    <RigidBody type='fixed' position={position}>
      <CuboidCollider args={halfSize} />
      <mesh>
        <boxGeometry args={size} />
        <meshBasicMaterial color='white' transparent opacity={0} />
      </mesh>
    </RigidBody>
  )
}

function Boundaries() {
  const groundY = -1
  const ceilingY = 10
  const wallHeight = ceilingY - groundY // 11
  const wallCenterY = groundY + wallHeight / 2 // 4.5

  return (
    <>
      {/* Left Wall */}
      <InvisibleBoundary
        position={[-10, wallCenterY, 0]}
        size={[0.5, wallHeight, 20]}
      />
      {/* Right Wall */}
      <InvisibleBoundary
        position={[10, wallCenterY, 0]}
        size={[0.5, wallHeight, 20]}
      />
      {/* Back Wall */}
      <InvisibleBoundary
        position={[0, wallCenterY, -10]}
        size={[20, wallHeight, 0.5]}
      />
      {/* Front Wall */}
      <InvisibleBoundary
        position={[0, wallCenterY, 10]}
        size={[20, wallHeight, 0.5]}
      />
      {/* Ceiling */}
      <InvisibleBoundary
        position={[0, ceilingY + 0.25, 0]}
        size={[20, 0.5, 20]}
      />
    </>
  )
}

function Scene() {
  return (
    <>
      <OrbitControls />
      {/* Basic lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        intensity={0.8}
        position={[5, 10, 5]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <Physics gravity={[0, -9.81, 0]}>
        {/* Ground plane (with userData) */}
        <RigidBody
          type='fixed'
          position={[0, -1, 0]}
          userData={{ name: 'ground' }}
        >
          {/* Explicitly define the ground collider with half-extents */}
          <CuboidCollider args={[10, 0.1, 10]} />
          <mesh receiveShadow>
            <boxGeometry args={[20, 0.2, 20]} />
            <meshStandardMaterial color='green' />
          </mesh>
        </RigidBody>

        <Boundaries />
        <HoverboardWithHumanoid />
      </Physics>
    </>
  )
}

export default function Hoverboard() {
  usePageTitle('The Physics-Defying Dude')

  return (
    <div className='w-full h-screen bg-black text-white'>
      <Canvas shadows camera={{ position: [0, 15, 20], fov: 55 }}>
        <Scene />
      </Canvas>
    </div>
  )
}
