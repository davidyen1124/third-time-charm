/* eslint-disable react/prop-types */
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { asset } from './collection'
import { Box, Cylinder, Frame, Plaque } from './primitives'

function Duckling({ index, source, active, controls, reducedMotion }) {
  const duck = useRef()
  const lastHop = useRef(-100)
  const previousHop = useRef(controls.duckHop)
  const elapsed = useRef(0)
  const scene = useMemo(() => source.clone(true), [source])
  const angle = index * 2.39996
  const radius = Math.sqrt((index + 0.5) / 19) * 1.83
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    elapsed.current = t
    if (previousHop.current !== controls.duckHop) {
      previousHop.current = controls.duckHop
      lastHop.current = t + index * 0.025
    }
    const age = t - lastHop.current
    const hop = age > 0 && age < 0.8 ? Math.sin((age / 0.8) * Math.PI) * 0.5 : 0
    const drift = reducedMotion ? 0 : Math.sin(t * 0.35 + index) * 0.1
    duck.current.position.set(
      Math.cos(angle + drift) * radius,
      0.89 + hop + (reducedMotion ? 0 : Math.sin(t * 1.6 + index) * 0.022),
      Math.sin(angle + drift) * radius
    )
    duck.current.rotation.y = angle + 0.7 + drift * 4
    duck.current.rotation.z = reducedMotion ? 0 : Math.sin(t + index) * 0.045
  })
  return (
    <group
      ref={duck}
      name={`duck-${index}`}
      onClick={(e) => {
        if (active) {
          e.stopPropagation()
          lastHop.current = elapsed.current
        }
      }}
      scale={0.265}
    >
      <primitive object={scene} />
    </group>
  )
}

export function DuckPool({
  materials,
  controls,
  active,
  onControl,
  reducedMotion,
}) {
  const { scene } = useGLTF(asset('models/duck.glb'))
  const normal = useTexture(asset('materials/water-normal.jpg'))
  const basin = useRef()
  const rings = useRef([])
  const ripples = useRef(
    Array.from({ length: 4 }, () => ({ x: 0, z: 0, time: -100 }))
  )
  const nextPoint = useRef(new THREE.Vector3())
  const last = useRef(controls.ripple)
  const waterShader = useRef()
  const time = useRef(0)
  const poolGeometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.absarc(0, 0, 2.4, 0, Math.PI * 2, false)
    const hole = new THREE.Path()
    hole.absarc(0, 0, 2.15, 0, Math.PI * 2, true)
    shape.holes.push(hole)
    return new THREE.ExtrudeGeometry(shape, {
      depth: 1,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.025,
      bevelThickness: 0.025,
      curveSegments: 64,
    })
  }, [])
  const waterMaterial = useMemo(() => {
    const texture = normal.clone()
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(2.5, 2.5)
    texture.needsUpdate = true
    const mat = new THREE.MeshPhysicalMaterial({
      color: '#79b7bb',
      roughness: 0.14,
      metalness: 0.25,
      transparent: true,
      opacity: 0.82,
      clearcoat: 1,
      clearcoatRoughness: 0.14,
      normalMap: texture,
      normalScale: new THREE.Vector2(0.24, 0.24),
      side: THREE.DoubleSide,
    })
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uWaterTime = { value: 0 }
      shader.vertexShader = 'uniform float uWaterTime;\n' + shader.vertexShader
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\n transformed.z += sin(position.x * 6.0 + uWaterTime) * cos(position.y * 5.0 + uWaterTime * 0.7) * 0.012;'
      )
      waterShader.current = shader
    }
    return mat
  }, [normal])
  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    time.current = t
    if (!reducedMotion) {
      waterMaterial.normalMap.offset.x += delta * 0.009
      waterMaterial.normalMap.offset.y += delta * 0.005
      if (waterShader.current) waterShader.current.uniforms.uWaterTime.value = t
    }
    if (last.current !== controls.ripple) {
      last.current = controls.ripple
      const p = nextPoint.current
      ripples.current.forEach((r, i) => {
        r.x = p.x
        r.z = p.z
        r.time = t + i * 0.17
      })
    }
    rings.current.forEach((ring, i) => {
      if (!ring) return
      const r = ripples.current[i],
        age = t - r.time
      ring.visible = age > 0 && age < 1.7
      ring.position.set(r.x, 0.917, r.z)
      ring.scale.setScalar(Math.max(0.01, age * 0.6))
      ring.material.opacity = Math.max(0, 0.52 * (1 - age / 1.7))
    })
  })
  const ripple = (e) => {
    if (!active) return
    e.stopPropagation()
    nextPoint.current.copy(basin.current.worldToLocal(e.point.clone()))
    onControl('ripple', controls.ripple + 1)
  }
  return (
    <group ref={basin}>
      <mesh
        geometry={poolGeometry}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <primitive object={materials.stone} attach="material" />
      </mesh>
      <Cylinder
        args={[2.16, 2.16, 0.13, 64]}
        position={[0, 0.48, 0]}
        color="#4a9295"
      />
      <mesh
        name="pool-water"
        position={[0, 0.9, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={waterMaterial}
        onClick={ripple}
        receiveShadow
      >
        <circleGeometry args={[2.15, 96]} />
      </mesh>
      <Plaque number="05" position={[0, 0.56, 2.405]} />
      {Array.from({ length: 19 }, (_, i) => (
        <Duckling
          key={i}
          index={i}
          source={scene}
          active={active}
          controls={controls}
          reducedMotion={reducedMotion}
        />
      ))}
      {Array.from({ length: 4 }, (_, i) => (
        <mesh
          key={i}
          name={`ripple-${i}`}
          ref={(el) => {
            rings.current[i] = el
          }}
          rotation={[-Math.PI / 2, 0, 0]}
          visible={false}
        >
          <ringGeometry args={[0.97, 1, 64]} />
          <meshBasicMaterial
            color="#f7ffff"
            transparent
            opacity={0.5}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

const photoPlaces = [
  [-0.65, 0.35, 0.17, 0.1],
  [0.58, 0.25, 0.22, -0.13],
  [0, 0.95, 0.26, 0.05],
  [-0.36, -0.63, 0.3, -0.08],
  [0.57, -0.64, 0.37, 0.11],
]

function PhotoPrint({ index, photo, selected, active, onSelect }) {
  const ref = useRef()
  const [x, y, z, tilt] = photoPlaces[index]
  const texture = useMemo(() => {
    const t = photo.clone()
    t.colorSpace = THREE.SRGBColorSpace
    t.repeat.set(0.75, 0.85)
    t.offset.set(index % 2 ? 0.25 : 0, 0.075)
    t.needsUpdate = true
    return t
  }, [photo, index])
  useFrame((_, delta) => {
    const enlarged = selected === index
    ref.current.position.x = THREE.MathUtils.damp(
      ref.current.position.x,
      enlarged ? 0 : x,
      5,
      delta
    )
    ref.current.position.y = THREE.MathUtils.damp(
      ref.current.position.y,
      enlarged ? 0 : y,
      5,
      delta
    )
    ref.current.position.z = THREE.MathUtils.damp(
      ref.current.position.z,
      enlarged ? 1.2 : z,
      5,
      delta
    )
    ref.current.rotation.z = THREE.MathUtils.damp(
      ref.current.rotation.z,
      enlarged ? 0 : tilt,
      5,
      delta
    )
    const s = THREE.MathUtils.damp(
      ref.current.scale.x,
      enlarged ? 1.55 : 1,
      5,
      delta
    )
    ref.current.scale.setScalar(s)
  })
  return (
    <group
      ref={ref}
      name={`print-${index}`}
      position={[x, y, z]}
      rotation={[0, 0, tilt]}
      onClick={(e) => {
        if (active) {
          e.stopPropagation()
          onSelect(selected === index ? -1 : index)
        }
      }}
    >
      <Box size={[0.91, 1.07, 0.035]} color="#eee9db" radius={0.008} />
      <mesh position={[0, 0.065, 0.022]}>
        <planeGeometry args={[0.78, 0.78]} />
        <meshStandardMaterial map={texture} roughness={0.45} />
      </mesh>
    </group>
  )
}

export function Polaroids({ materials, controls, active, onControl }) {
  const photo = useTexture(asset('photos/beach.jpg'))
  const group = useRef()
  const spot = useRef()
  const target = useMemo(() => new THREE.Object3D(), [])
  const pointer = useRef(new THREE.Vector3())
  useFrame((_, delta) => {
    target.position.lerp(pointer.current, 1 - Math.exp(-delta * 6))
    if (spot.current) spot.current.intensity = active ? 9 : 4
  })
  return (
    <group
      position={[0, 3.0, 0]}
      ref={group}
      onPointerMove={(e) => {
        if (active) {
          const p = group.current.worldToLocal(e.point.clone())
          pointer.current.set(p.x, p.y, 0.1)
        }
      }}
    >
      <Frame width={2.85} height={3.1} material={materials.darkMetal}>
        <mesh position={[0, 0, 0.084]}>
          <planeGeometry args={[2.72, 2.95]} />
          <meshStandardMaterial color="#202422" roughness={0.92} />
        </mesh>
        {photoPlaces.map((_, i) => (
          <PhotoPrint
            key={i}
            index={i}
            photo={photo}
            selected={controls.photo}
            active={active}
            onSelect={(v) => onControl('photo', v)}
          />
        ))}
      </Frame>
      <spotLight
        ref={spot}
        position={[0, 0.8, 2]}
        target={target}
        intensity={4}
        angle={0.8}
        penumbra={0.9}
        distance={5}
        color="#fff1d5"
      />
      <primitive object={target} />
      <Plaque number="06" position={[0, -1.9, 0]} />
    </group>
  )
}
