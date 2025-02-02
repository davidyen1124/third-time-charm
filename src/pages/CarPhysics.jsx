import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, SpotLight } from '@react-three/drei'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'

const colorPalette = [
  '#FF0000',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#FFA500',
  '#00FFFF',
  '#8B00FF',
  '#FFC0CB',
  '#FF1493',
  '#FFD700'
]

function getRandomColor() {
  return colorPalette[Math.floor(Math.random() * colorPalette.length)]
}

function Car({ id, position, velocity, color, onRemoveCar }) {
  const rigidBodyRef = useRef(null)
  const rotationY = Math.atan2(velocity[0], velocity[2])

  const rigidBodyProps = {
    position,
    rotation: [0, rotationY, 0],
    type: 'dynamic',
    mass: 1,
    friction: 0.9,
    restitution: 0.3,
    linearVelocity: velocity,
    angularDamping: 0.3
  }

  // remove the car if it travels too far away
  useFrame(() => {
    if (!rigidBodyRef.current) return
    const { x, y, z } = rigidBodyRef.current.translation()
    const dist = Math.sqrt(x * x + y * y + z * z)
    if (dist > 200) {
      onRemoveCar(id)
    }
  })

  return (
    <RigidBody ref={rigidBodyRef} colliders={false} {...rigidBodyProps}>
      <mesh castShadow>
        <boxGeometry args={[3, 1, 2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <CuboidCollider args={[1.5, 0.5, 1]} />
    </RigidBody>
  )
}

function Ground() {
  return (
    <RigidBody type='fixed' friction={0.9} restitution={0}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color='#228B22' />
      </mesh>
      <CuboidCollider args={[25, 0.1, 25]} />
    </RigidBody>
  )
}

const initialCarsData = [
  {
    position: [25, 0.5, 25],
    velocity: [-50, 0, -50]
  },
  {
    position: [-25, 0.5, 25],
    velocity: [50, 0, -50]
  },
  {
    position: [25, 0.5, -25],
    velocity: [-50, 0, 50]
  },
  {
    position: [-25, 0.5, -25],
    velocity: [50, 0, 50]
  }
]

function Scene({ resetKey }) {
  const [cars, setCars] = useState([])

  useEffect(() => {
    setCars([])
    const newCars = initialCarsData.map((data) => {
      return {
        id: Math.random().toString(36).substring(2),
        position: data.position,
        velocity: data.velocity,
        color: getRandomColor()
      }
    })
    setCars(newCars)
  }, [resetKey])

  const handleRemoveCar = (id) => {
    setCars((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight
        castShadow
        position={[30, 50, 30]}
        intensity={1.2}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <SpotLight
        position={[0, 60, 0]}
        angle={0.6}
        penumbra={0.5}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <Physics key={resetKey} gravity={[0, -9.81, 0]}>
        <Ground />
        {cars.map((car) => (
          <Car
            id={car.id}
            key={car.id}
            position={car.position}
            velocity={car.velocity}
            color={car.color}
            onRemoveCar={handleRemoveCar}
          />
        ))}
      </Physics>

      <OrbitControls />
    </>
  )
}

export default function CarPhysics() {
  const [resetKey, setResetKey] = useState(0)

  const handleClick = () => {
    setResetKey((k) => k + 1)
  }

  return (
    <div className='w-full h-screen bg-gray-300' onClick={handleClick}>
      <Canvas
        shadows
        camera={{ position: [60, 60, 60], fov: 50 }}
        onCreated={(state) => {
          state.gl.shadowMap.enabled = true
          state.gl.shadowMap.type = THREE.PCFSoftShadowMap
        }}
      >
        <Scene resetKey={resetKey} />
      </Canvas>
    </div>
  )
}
