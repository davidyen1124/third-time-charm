import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import {
  OrbitControls,
  useGLTF,
  Environment,
  Sky,
  useTexture
} from '@react-three/drei'
import * as THREE from 'three'
import { Water } from 'three/examples/jsm/objects/Water.js'

extend({ Water })

function DuckPrimitive({ position, floatOffset }) {
  const group = useRef()
  const { scene } = useGLTF(
    'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb'
  )

  const clonedScene = useMemo(() => scene.clone(), [scene])
  const heading = useMemo(() => Math.random() * Math.PI * 2, [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + floatOffset
    group.current.position.y = position[1] + Math.sin(t * 0.8) * 0.1
    group.current.rotation.y = heading
  })

  return <primitive ref={group} object={clonedScene} position={position} />
}

function Ocean() {
  const waterRef = useRef()

  const waterNormals = useTexture(
    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/water/Water_1_M_Normal.jpg'
  )

  waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping
  useEffect(() => {
    if (waterRef.current) {
      waterRef.current.material.uniforms.distortionScale.value = 1.5
      waterRef.current.material.uniforms.size.value = 4
      waterRef.current.material.uniforms.alpha.value = 0.8
      waterRef.current.material.uniforms.time.value = 0.1
      waterRef.current.material.fog = true
    }
  }, [waterNormals])

  return (
    <water
      ref={waterRef}
      rotation={[-Math.PI / 2, 0, 0]}
      args={[
        new THREE.PlaneGeometry(1000, 1000),
        {
          textureWidth: 1024,
          textureHeight: 1024,
          waterNormals,
          sunDirection: new THREE.Vector3(0.707, 0.707, 0.707).normalize(),
          sunColor: 0xffffff,
          waterColor: 0x001e0f,
          distortionScale: 1.5,
          fog: true
        }
      ]}
    />
  )
}

function Scene() {
  const ducks = useMemo(() => {
    const positions = []
    const gridSize = 10
    const spacing = 2
    for (let i = -gridSize; i <= gridSize; i += spacing) {
      for (let j = -gridSize; j <= gridSize; j += spacing) {
        positions.push({
          position: [i, 0, j],
          floatOffset: Math.random() * 100
        })
      }
    }
    return positions
  }, [])

  return (
    <>
      <Environment preset='city' />
      <Sky sunPosition={[100, 20, 100]} />

      <ambientLight intensity={0.4} />
      <directionalLight intensity={0.8} position={[10, 20, 10]} />
      <Ocean />
      {ducks.map((duck, index) => (
        <DuckPrimitive
          key={index}
          position={duck.position}
          floatOffset={duck.floatOffset}
        />
      ))}
      <OrbitControls />
    </>
  )
}

export default function Duck() {
  return (
    <div className='w-full h-screen'>
      <Canvas camera={{ position: [0, 10, 25], fov: 70 }}>
        <Scene />
      </Canvas>
    </div>
  )
}
