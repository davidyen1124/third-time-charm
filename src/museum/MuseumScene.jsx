/* eslint-disable react/prop-types */
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { asset, collection } from './collection'
import { useMuseumMaterials } from './materials'
import Room from './Room'
import { Cars, Gate, Hoverboard, Prisoner } from './Sculptures'
import { DuckPool, Polaroids } from './WaterAndPhotos'
import { Constellation, Conveyor } from './KineticDisplays'

const pieces = [
  Prisoner,
  Hoverboard,
  Gate,
  Cars,
  DuckPool,
  Polaroids,
  Conveyor,
  Constellation,
]
const overviewPosition = new THREE.Vector3(9.1, 6.3, 18.5)
const overviewTarget = new THREE.Vector3(0, 2.45, -0.8)

function GalleryCamera({ work, mode, reducedMotion }) {
  const orbit = useRef()
  const { camera, size } = useThree()
  const moving = useRef(true)
  const position = useRef(overviewPosition.clone())
  const target = useRef(overviewTarget.clone())
  useEffect(() => {
    const mobile = size.width / size.height < 1
    if (mode === 'gallery' || mode === 'catalogue') {
      target.current.copy(overviewTarget)
      position.current.copy(overviewPosition)
      if (mobile) position.current.set(13.5, 9, 30)
    } else {
      target.current.fromArray(work.target)
      position.current.fromArray(work.camera)
      if (mobile)
        position.current
          .sub(target.current)
          .multiplyScalar(1.35)
          .add(target.current)
    }
    moving.current = true
  }, [work, mode, size.width, size.height])
  useFrame((_, delta) => {
    if (!orbit.current || !moving.current) return
    const step = reducedMotion ? 1 : 1 - Math.exp(-Math.min(delta, 0.05) * 3.5)
    camera.position.lerp(position.current, step)
    orbit.current.target.lerp(target.current, step)
    orbit.current.update()
    if (
      camera.position.distanceTo(position.current) < 0.015 &&
      orbit.current.target.distanceTo(target.current) < 0.015
    )
      moving.current = false
  })
  return (
    <OrbitControls
      ref={orbit}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.065}
      rotateSpeed={0.5}
      zoomSpeed={0.75}
      minDistance={3}
      maxDistance={37}
      minPolarAngle={0.24}
      maxPolarAngle={Math.PI / 2 - 0.025}
      onStart={() => {
        moving.current = false
      }}
    />
  )
}

function Exhibit({ work, children, selected, active, onSelect }) {
  const [hovered, setHovered] = useState(false)
  return (
    <group
      position={work.position}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = ''
      }}
      onClick={(e) => {
        if (!active) {
          e.stopPropagation()
          onSelect(work.id)
        }
      }}
    >
      {children}
      {hovered && !active && (
        <Html
          center
          position={[0, work.target[1] + 0.8, 0]}
          distanceFactor={12}
          style={{ pointerEvents: 'none' }}
        >
          <div className="exhibit-tooltip">
            <span>{work.number}</span>
            {work.title}
            <small>{selected ? 'Open to interact' : 'Select artwork'}</small>
          </div>
        </Html>
      )}
    </group>
  )
}

function Scene({
  work,
  mode,
  controls,
  onSelect,
  onControl,
  onStatus,
  companies,
  quality,
  reducedMotion,
  onReady,
}) {
  const materials = useMuseumMaterials()
  const { gl, scene } = useThree()
  const sunTarget = useMemo(() => new THREE.Object3D(), [])
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 1.05
    gl.outputColorSpace = THREE.SRGBColorSpace
    scene.traverse((obj) => {
      if (obj.isMesh && obj.material && obj.type !== 'InstancedMesh') {
        if (
          obj.parent?.type === 'Group' &&
          obj.geometry?.type === 'BufferGeometry'
        )
          obj.castShadow = true
      }
    })
    onReady()
  }, [gl, scene, onReady])
  useEffect(
    () => () => {
      document.body.style.cursor = ''
    },
    []
  )
  return (
    <>
      <color attach="background" args={['#e6e1d5']} />
      <fog attach="fog" args={['#e6e1d5', 42, 75]} />
      <ambientLight intensity={0.4} color="#fff8eb" />
      <hemisphereLight args={['#e5efff', '#bc9d75', 1.0]} />
      <directionalLight
        position={[-8, 15, 9]}
        target={sunTarget}
        intensity={4.0}
        color="#fff1d7"
        castShadow
        shadow-mapSize={[
          quality === 'high' ? 4096 : 2048,
          quality === 'high' ? 4096 : 2048,
        ]}
        shadow-camera-left={-17}
        shadow-camera-right={17}
        shadow-camera-top={17}
        shadow-camera-bottom={-17}
        shadow-camera-near={1}
        shadow-camera-far={50}
        shadow-normalBias={0.025}
        shadow-bias={-0.0001}
      />
      <primitive object={sunTarget} position={[0, 0, -2]} />
      <directionalLight
        position={[10, 7, 7]}
        intensity={0.45}
        color="#e9f0ff"
      />
      <Environment
        files={asset('materials/daylight.hdr')}
        environmentIntensity={0.7}
        environmentRotation={[0, 1.6, 0]}
      />
      <Room materials={materials} quality={quality} />
      {collection.map((piece, i) => {
        const Component = pieces[i]
        const active = mode === 'inspect' && work.id === piece.id
        return (
          <Exhibit
            key={piece.id}
            work={piece}
            selected={work.id === piece.id}
            active={active}
            onSelect={onSelect}
          >
            <Component
              materials={materials}
              controls={controls}
              active={active}
              onControl={onControl}
              onStatus={onStatus}
              companies={companies}
              reducedMotion={reducedMotion}
            />
          </Exhibit>
        )
      })}
      <GalleryCamera work={work} mode={mode} reducedMotion={reducedMotion} />
    </>
  )
}

export default function MuseumScene(props) {
  return (
    <Canvas
      shadows={{ type: THREE.PCFSoftShadowMap }}
      camera={{
        position: overviewPosition.toArray(),
        fov: 43,
        near: 0.1,
        far: 100,
      }}
      dpr={props.quality === 'high' ? [1, 1.65] : [1, 1.15]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      fallback={
        <div className="renderer-fallback">
          This browser cannot start the 3D gallery. The complete collection is
          available below.
        </div>
      }
    >
      <Suspense fallback={null}>
        <Scene {...props} />
      </Suspense>
    </Canvas>
  )
}
