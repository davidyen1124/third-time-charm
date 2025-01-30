import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Physics, RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { usePageTitle } from '../hooks/usePageTitle'

function HoverboardWithHumanoid() {
  const boardRef = useRef()

  // Add a small random torque every frame.
  useFrame(() => {
    if (boardRef.current) {
      const randomTorque = new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        0,
        (Math.random() - 0.5) * 0.1
      )
      boardRef.current.applyTorqueImpulse(randomTorque, true)
    }
  })

  // Trigger an upward impulse whenever colliding with the ground.
  const handleCollisionEnter = (event) => {
    // If the other body is the ground, bounce upward.
    if (
      event.other.rigidBodyObject?.userData?.name === 'ground' &&
      boardRef.current
    ) {
      // Apply an upward impulse.
      boardRef.current.applyImpulse({ x: 0, y: 2, z: 0 }, true)
    }
  }

  return (
    <RigidBody
      ref={boardRef}
      type='dynamic'
      position={[0, 1, 0]}
      colliders='cuboid'
      onCollisionEnter={handleCollisionEnter}
    >
      {/* Hoverboard geometry */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 0.05, 0.5]} />
        <meshStandardMaterial color='blue' />
      </mesh>

      {/* Humanoid geometry (all part of the same RigidBody) */}
      {/* Torso */}
      <mesh castShadow receiveShadow position={[0, 1, 0]}>
        <boxGeometry args={[0.5, 1, 0.3]} />
        <meshStandardMaterial color='orange' />
      </mesh>

      {/* Head */}
      <mesh castShadow receiveShadow position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color='pink' />
      </mesh>

      {/* Left Leg */}
      <mesh castShadow receiveShadow position={[-0.15, 0.6, 0]}>
        <boxGeometry args={[0.1, 0.8, 0.1]} />
        <meshStandardMaterial color='gray' />
      </mesh>

      {/* Right Leg */}
      <mesh castShadow receiveShadow position={[0.15, 0.6, 0]}>
        <boxGeometry args={[0.1, 0.8, 0.1]} />
        <meshStandardMaterial color='gray' />
      </mesh>
    </RigidBody>
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
          colliders='cuboid'
          position={[0, -1, 0]}
          userData={{ name: 'ground' }}
        >
          <mesh receiveShadow>
            <boxGeometry args={[20, 0.2, 20]} />
            <meshStandardMaterial color='green' />
          </mesh>
        </RigidBody>

        {/* Hoverboard + Humanoid as a single rigid body */}
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
