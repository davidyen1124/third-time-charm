import { useMemo, useRef } from 'react'
import PropTypes from 'prop-types'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { usePageTitle } from '../hooks/usePageTitle'

const archColors = [
  '#D9281E', // Red
  '#F46F1B', // Orange
  '#FFED00', // Yellow
  '#008542', // Green
  '#1548C0', // Blue
  '#721C8D' // Purple
]

function createGrassTexture() {
  const size = 512
  const data = new Uint8Array(size * size * 4) // 4 components per pixel

  for (let i = 0; i < size * size; i++) {
    const stride = i * 4 // R, G, B, A

    // Generate your color logic however you like
    // Here’s a trivial example:
    const r = 10 + Math.random() * 30 // a bit of red
    const g = 100 + Math.random() * 80 // mostly green
    const b = 10 + Math.random() * 20 // a bit of blue
    const a = 255 // fully opaque

    data[stride] = r
    data[stride + 1] = g
    data[stride + 2] = b
    data[stride + 3] = a
  }

  // Create a DataTexture with RGBA format
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  texture.needsUpdate = true

  // Because we’re using a power-of-two size (256×256),
  // we can safely generate mipmaps if we want smoother scaling:
  texture.generateMipmaps = true
  texture.minFilter = THREE.NearestMipmapNearestFilter
  texture.magFilter = THREE.NearestFilter

  // Optional wrapping if you want it to tile
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(10, 10)

  return texture
}

function MovingSun() {
  const sunRef = useRef()

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime
    const speed = 0.2
    const angle = elapsed * speed
    const radius = 20

    const x = radius * Math.cos(angle)
    const z = radius * Math.sin(angle)
    const y = 10 + 5 * Math.sin(angle)

    sunRef.current.position.set(x, y, z)

    // Sunrise->midday->sunset color transition
    const sunriseColor = new THREE.Color('#FFD1A9')
    const middayColor = new THREE.Color('#ffffff')
    const sunsetColor = new THREE.Color('#FFAA88')

    const phase = (Math.sin(angle) * 0.5 + 0.5) * 2 // 0..2
    let sunColor
    if (phase < 1) {
      // sunrise -> midday
      sunColor = sunriseColor.lerp(middayColor, phase)
    } else {
      // midday -> sunset
      sunColor = middayColor.lerp(sunsetColor, phase - 1)
    }
    sunRef.current.color = sunColor
  })

  return (
    <directionalLight
      ref={sunRef}
      castShadow
      intensity={1.0}
      shadow-mapSize={[1024, 1024]}
    />
  )
}

function Gate() {
  // A helper to create a geometry with a given "archHeight"
  function createArchGeometry(archHeight) {
    const shape = new THREE.Shape()
    // Reduced width from 1.5 to 1.0 for outer shape
    shape.moveTo(-1.0, 0)
    shape.lineTo(-1.0, archHeight)
    shape.lineTo(1.0, archHeight)
    shape.lineTo(1.0, 0)

    // Reduced width from 1.0 to 0.6 for inner hole
    const hole = new THREE.Path()
    hole.moveTo(-0.7, 0)
    hole.lineTo(-0.7, archHeight - 0.4)
    hole.lineTo(0.7, archHeight - 0.4)
    hole.lineTo(0.7, 0)
    shape.holes.push(hole)

    // Extrude settings
    const extrudeSettings = {
      depth: 0.3,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.02,
      bevelSegments: 2
    }

    // Create the extruded geometry
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings)
    geo.computeBoundingBox()

    // Translate the geometry so its bottom is at local y=0
    const bbox = geo.boundingBox // THREE.Box3
    const minY = bbox.min.y
    geo.translate(0, -minY, 0)

    return geo
  }

  const Arch = ({ color, index, total }) => {
    // Reduced maximum height from 7 to 4
    const archHeight = 4 - index * 0.5
    // Create the geometry for this specific height
    const geometry = useMemo(() => createArchGeometry(archHeight), [archHeight])

    // Reduced gap between arches
    const gap = 0.4
    const xPos = -index * gap + (total * gap) / 2
    const zPos = index * gap - (total * gap) / 2

    return (
      <mesh geometry={geometry} castShadow receiveShadow position={[xPos, 0, zPos]}>
        <meshPhysicalMaterial
          color={color}
          metalness={0.85}
          roughness={0.4}
          reflectivity={0.8}
          clearcoat={0.5}
          clearcoatRoughness={0.2}
        />
      </mesh>
    )
  }

  Arch.propTypes = {
    color: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired
  }

  return (
    // Position the whole group so its bottom sits on world y=-4.5 (where your plane is)
    <group position={[0, -4.5, 0]}>
      {archColors.map((color, i) => (
        <Arch key={i} color={color} index={i} total={archColors.length} />
      ))}
    </group>
  )
}

export default function ChromaticGate() {
  usePageTitle('The Chromatic Gate')
  const grassTexture = useMemo(() => createGrassTexture(), [])

  return (
    <div className='w-full h-screen bg-black text-white'>
      <Canvas
        camera={{ position: [0, 3, 15], fov: 75 }}
        shadows
        gl={{
          physicallyCorrectLights: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          outputEncoding: THREE.sRGBEncoding
        }}
      >
        <color attach='background' args={['#87CEEB']} />
        <ambientLight intensity={0.2} />
        <MovingSun />
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -4.5, 0]}
          receiveShadow
        >
          <planeGeometry args={[100, 100]} />
          {/* <meshStandardMaterial color="#666" /> */}
          <meshStandardMaterial map={grassTexture} />
        </mesh>
        <Gate />
        <Environment preset='sunset' />
        <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
      </Canvas>
    </div>
  )
}
