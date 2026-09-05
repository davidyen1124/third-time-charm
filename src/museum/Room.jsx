/* eslint-disable react/prop-types */
import { useLayoutEffect, useMemo, useRef } from 'react'
import { MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { Box, Cylinder, Label } from './primitives'

function TrackLight({ position, materials }) {
  return (
    <group position={position}>
      <Cylinder
        args={[0.025, 0.025, 0.22, 8]}
        position={[0, -0.12, 0]}
        material={materials.darkMetal}
      />
      <group position={[0, -0.29, 0]} rotation={[0.32, 0, 0.16]}>
        <Cylinder
          args={[0.075, 0.095, 0.24, 16]}
          material={materials.darkMetal}
        />
        <mesh position={[0, -0.126, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.073, 16]} />
          <meshStandardMaterial
            color="#fff4d3"
            emissive="#fff1ca"
            emissiveIntensity={1.5}
          />
        </mesh>
      </group>
    </group>
  )
}

function Plant({ materials, position, scale = 1 }) {
  const leaves = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  useLayoutEffect(() => {
    for (let i = 0; i < 150; i++) {
      const angle = i * 2.39996
      const y = 1.05 + ((i % 41) / 41) * 1.8
      const width = Math.sin(((y - 0.65) / 2.9) * Math.PI) * 0.63
      dummy.position.set(Math.cos(angle) * width, y, Math.sin(angle) * width)
      dummy.rotation.set(angle * 0.7, angle, i * 0.61)
      dummy.scale.set(0.05 + (i % 4) * 0.006, 0.15, 0.013)
      dummy.updateMatrix()
      leaves.current.setMatrixAt(i, dummy.matrix)
      leaves.current.setColorAt(
        i,
        new THREE.Color(['#6c7852', '#687348', '#80906a', '#536544'][i % 4])
      )
    }
    leaves.current.instanceMatrix.needsUpdate = true
  }, [dummy])
  return (
    <group position={position} scale={scale}>
      <Cylinder
        args={[0.48, 0.33, 0.68, 32]}
        position={[0, 0.34, 0]}
        material={materials.stone}
      />
      <Cylinder
        args={[0.435, 0.435, 0.035, 32]}
        position={[0, 0.677, 0]}
        color="#5c5240"
      />
      <Cylinder
        args={[0.021, 0.043, 2, 9]}
        position={[0, 1.64, 0]}
        color="#74664a"
      />
      {Array.from({ length: 9 }, (_, i) => (
        <Cylinder
          key={i}
          args={[0.009, 0.018, 0.75, 7]}
          position={[
            Math.sin(i * 2.4) * 0.19,
            1.25 + i * 0.16,
            Math.cos(i * 2.4) * 0.19,
          ]}
          rotation={[Math.sin(i) * 0.65, 0, Math.cos(i) * 0.65]}
          color="#756e52"
        />
      ))}
      <instancedMesh ref={leaves} args={[null, null, 150]} castShadow>
        <sphereGeometry args={[1, 8, 5]} />
        <meshStandardMaterial roughness={0.87} side={THREE.DoubleSide} />
      </instancedMesh>
    </group>
  )
}

export default function Room({ materials, quality }) {
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.015, 0]}
        receiveShadow
      >
        <planeGeometry args={[34, 34]} />
        {quality === 'high' ? (
          <MeshReflectorMaterial
            resolution={512}
            blur={[240, 80]}
            mixBlur={1}
            mixStrength={0.62}
            roughness={0.68}
            metalness={0.18}
            map={materials.floorMap}
            bumpMap={materials.floorMap}
            bumpScale={0.014}
            color="#dfd3bb"
            mirror={0.2}
            depthScale={0.15}
            minDepthThreshold={0.8}
            maxDepthThreshold={1.2}
          />
        ) : (
          <meshStandardMaterial
            map={materials.floorMap}
            bumpMap={materials.floorMap}
            bumpScale={0.012}
            color="#e0d4bd"
            roughness={0.4}
            metalness={0.16}
          />
        )}
      </mesh>
      {Array.from({ length: 16 }, (_, i) => (
        <mesh
          key={`h${i}`}
          position={[0, 0.001, -14 + i * 2]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[34, 0.012]} />
          <meshStandardMaterial color="#b9af99" roughness={1} />
        </mesh>
      ))}
      {Array.from({ length: 14 }, (_, i) => (
        <mesh
          key={`v${i}`}
          position={[-14 + i * 2.4, 0.001, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.01, 34]} />
          <meshStandardMaterial color="#b9af99" roughness={1} />
        </mesh>
      ))}

      <Box
        size={[27, 8.5, 0.45]}
        position={[0, 4.25, -6.4]}
        material={materials.plaster}
        radius={0.015}
      />
      <Box
        size={[27, 0.075, 0.07]}
        position={[0, 0.12, -6.145]}
        color="#c4bca8"
        radius={0.004}
      />
      <Box
        size={[0.5, 8.5, 20]}
        position={[12.4, 4.25, 3.6]}
        material={materials.plaster}
      />
      <Box
        size={[0.5, 8.5, 20]}
        position={[-12.4, 4.25, 3.6]}
        material={materials.plaster}
      />

      <Box
        size={[6.1, 1.25, 0.65]}
        position={[-7.5, 5.5, -2.5]}
        material={materials.plaster}
      />
      <Box
        size={[0.65, 5, 0.65]}
        position={[-10.25, 2.5, -2.5]}
        material={materials.plaster}
      />
      <Box
        size={[0.55, 5, 0.65]}
        position={[-4.65, 2.5, -2.5]}
        material={materials.plaster}
      />
      <Box
        size={[5.9, 0.22, 5]}
        position={[-7.5, 5.98, -4.8]}
        material={materials.plaster}
      />

      {[-4.8, -0.2, 4.4, 9].map((z) => (
        <Box
          key={z}
          size={[25, 0.32, 0.3]}
          position={[0, 7.4, z]}
          material={materials.plaster}
        />
      ))}
      {[-10, -6, -2, 2, 6, 10].map((x) => (
        <Box
          key={x}
          size={[0.17, 0.22, 17]}
          position={[x, 7.55, 1.8]}
          material={materials.metal}
        />
      ))}
      {Array.from({ length: 13 }, (_, i) => (
        <Box
          key={i}
          size={[24, 0.13, 0.12]}
          position={[0, 7.58, -5.5 + i * 1.15]}
          material={materials.metal}
        />
      ))}
      <mesh position={[0, 7.64, 1.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 16]} />
        <meshPhysicalMaterial
          color="#d8eff4"
          transparent
          opacity={0.09}
          roughness={0.04}
          metalness={0.08}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {[-3.5, 2.6].map((z) => (
        <group key={z}>
          <Box
            size={[23, 0.08, 0.07]}
            position={[0, 6.86, z]}
            material={materials.darkMetal}
          />
          {[-9, -6, -2.5, 1, 4.5, 8].map((x) => (
            <TrackLight key={x} position={[x, 6.83, z]} materials={materials} />
          ))}
        </group>
      ))}

      <mesh position={[-11.6, 4, -6.14]}>
        <planeGeometry args={[1.1, 5.5]} />
        <meshBasicMaterial color="#dcecf0" />
      </mesh>
      <mesh position={[10.95, 4.2, -6.14]}>
        <planeGeometry args={[1.35, 6.8]} />
        <meshBasicMaterial color="#dfedef" />
      </mesh>
      {[-11.6, 10.95].map((x) => (
        <group key={x}>
          <Box
            size={[0.045, 6.7, 0.08]}
            position={[x, 4.15, -6.06]}
            material={materials.metal}
          />
          {[1.5, 3.7, 5.9].map((y) => (
            <Box
              key={y}
              size={[1.4, 0.045, 0.08]}
              position={[x, y, -6.06]}
              material={materials.metal}
            />
          ))}
        </group>
      ))}

      <Label
        position={[-1.05, 4.7, -6.145]}
        anchorX="left"
        size={0.19}
        lineHeight={1.25}
        color="#82755e"
      >
        {'Interactive 3D\nExperiences for\na More Playful Internet.'}
      </Label>
      <Label
        position={[4.7, 3.9, -6.145]}
        anchorX="center"
        size={0.21}
        lineHeight={1.28}
        color="#82755e"
      >
        {'Play\nCreate\nExplore\nRepeat'}
      </Label>

      <Plant materials={materials} position={[-9.55, 0, 1.2]} scale={1.32} />
      <Plant materials={materials} position={[-4.3, 0, -5.5]} scale={0.76} />
      <Plant materials={materials} position={[11.05, 0, 3.9]} scale={1.28} />
      <Plant materials={materials} position={[10.9, 0, -4.8]} scale={1.08} />
      <group position={[-4.4, 0, 6.0]} rotation={[0, 0.12, 0]}>
        <Box
          size={[3.3, 0.18, 0.85]}
          position={[0, 0.62, 0]}
          material={materials.stone}
          radius={0.04}
        />
        {[-1.28, 1.28].map((x) => (
          <Box
            key={x}
            size={[0.2, 0.59, 0.73]}
            position={[x, 0.295, 0]}
            material={materials.stone}
          />
        ))}
      </group>
    </group>
  )
}
