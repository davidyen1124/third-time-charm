/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Box, Cylinder, Pedestal, Plaque } from './primitives'

const spectrum = [
  '#672994',
  '#213da8',
  '#138957',
  '#ead341',
  '#e45a28',
  '#bd2734',
]

function Figure({ color = '#e2a0ad', wave = 0, hovering = false }) {
  const arm = useRef()
  const body = useRef()
  const started = useRef(-100)
  const command = useRef(wave)
  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    if (command.current !== wave) {
      command.current = wave
      started.current = t
    }
    const elapsed = t - started.current
    const greeting =
      elapsed < 2.8 ? Math.sin(Math.min(elapsed * 3, Math.PI / 2)) : 0
    arm.current.rotation.z = THREE.MathUtils.damp(
      arm.current.rotation.z,
      greeting * (-2.3 + Math.sin(elapsed * 13) * 0.22),
      8,
      delta
    )
    body.current.position.y = hovering
      ? 0
      : Math.max(0, Math.sin(elapsed * 5)) * (elapsed < 1.25 ? 0.1 : 0)
  })
  return (
    <group ref={body} name="figure-body">
      <Box size={[0.58, 1.02, 0.36]} position={[0, 1.05, 0]} color={color} />
      {[-0.16, 0.16].map((x) => (
        <Box
          key={x}
          size={[0.16, 0.6, 0.2]}
          position={[x, 0.31, 0]}
          color={color}
          radius={0.013}
        />
      ))}
      <Box
        size={[0.15, 0.69, 0.2]}
        position={[-0.43, 1.04, 0]}
        color={color}
        radius={0.015}
      />
      <group ref={arm} name="figure-waving-arm" position={[0.43, 1.42, 0]}>
        <Box
          size={[0.15, 0.7, 0.2]}
          position={[0, -0.33, 0]}
          color={color}
          radius={0.018}
        />
      </group>
      <mesh castShadow position={[0, 1.94, 0]}>
        <sphereGeometry args={[0.36, 32, 24]} />
        <meshStandardMaterial color="#ecb7bf" roughness={0.48} />
      </mesh>
      {!hovering && (
        <mesh castShadow position={[0, 2.26, -0.025]}>
          <sphereGeometry
            args={[0.255, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.65]}
          />
          <meshStandardMaterial color="#8b282c" roughness={0.44} />
        </mesh>
      )}
      {[-0.13, 0.13].map((x) => (
        <mesh key={x} position={[x, 1.98, 0.324]}>
          <sphereGeometry args={[0.047, 12, 12]} />
          <meshStandardMaterial color="#29201f" roughness={0.3} />
        </mesh>
      ))}
      <Box
        size={[0.19, 0.055, 0.026]}
        position={[0, 1.83, 0.351]}
        color="#412529"
        radius={0.008}
      />
    </group>
  )
}

export function Prisoner({ materials, controls, active, onControl }) {
  const door = useRef()
  const radius = 1.02
  useFrame((_, delta) => {
    door.current.rotation.y = THREE.MathUtils.damp(
      door.current.rotation.y,
      controls.cageOpen ? -1.5 : 0,
      5,
      delta
    )
  })
  return (
    <group>
      <Cylinder
        args={[1.31, 1.33, 0.67, 64]}
        position={[0, 0.335, 0]}
        material={materials.stone}
      />
      <Plaque number="01" position={[0, 0.36, 1.325]} />
      <group position={[0, 0.7, 0]}>
        <Cylinder
          args={[1.1, 1.1, 0.13, 64]}
          position={[0, 0.065, 0]}
          material={materials.metal}
        />
        <Cylinder
          args={[1.1, 1.1, 0.16, 64]}
          position={[0, 3.5, 0]}
          material={materials.metal}
        />
        <Cylinder
          args={[1.035, 1.035, 0.023, 64]}
          position={[0, 3.598, 0]}
          material={materials.darkMetal}
        />
        {Array.from({ length: 16 }, (_, i) => {
          const angle = (i / 16) * Math.PI * 2
          if (i > 0 && i < 5) return null
          return (
            <Cylinder
              key={i}
              args={[0.034, 0.034, 3.4, 12]}
              position={[
                Math.sin(angle) * radius,
                1.77,
                Math.cos(angle) * radius,
              ]}
              material={materials.metal}
            />
          )
        })}
        <group
          ref={door}
          name="cage-door"
          position={[0, 0, radius]}
          onClick={(e) => {
            if (active) {
              e.stopPropagation()
              onControl('cageOpen', !controls.cageOpen)
            }
          }}
        >
          {[1, 2, 3, 4].map((i) => {
            const a = (i / 16) * Math.PI * 2
            return (
              <Cylinder
                key={i}
                args={[0.034, 0.034, 3.35, 12]}
                position={[
                  Math.sin(a) * radius,
                  1.77,
                  Math.cos(a) * radius - radius,
                ]}
                material={materials.metal}
              />
            )
          })}
          {[0.4, 2.95].map((y) => (
            <mesh
              key={y}
              rotation={[Math.PI / 2, 0, 0]}
              position={[0, y, -radius]}
            >
              <torusGeometry args={[radius, 0.025, 8, 24, Math.PI / 2]} />
              <primitive object={materials.metal} attach="material" />
            </mesh>
          ))}
        </group>
        <group
          position={[0, 0.17, 0]}
          scale={1.22}
          onClick={(e) => {
            if (active) {
              e.stopPropagation()
              onControl('wave', controls.wave + 1)
            }
          }}
        >
          <Figure wave={controls.wave} />
        </group>
      </group>
    </group>
  )
}

export function Hoverboard({
  materials,
  controls,
  active,
  onControl,
  reducedMotion,
}) {
  const rider = useRef()
  const board = useRef()
  const flipStarted = useRef(-100)
  const flipCommand = useRef(controls.flip)
  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    if (flipCommand.current !== controls.flip) {
      flipCommand.current = controls.flip
      flipStarted.current = t
    }
    const time = t - flipStarted.current
    const flipping = time < 1.2
    const progress = Math.min(1, time / 1.2)
    rider.current.position.y =
      0.43 +
      (flipping
        ? Math.sin(progress * Math.PI) * 1.4
        : reducedMotion
          ? 0
          : Math.sin(t * 1.6) * 0.055)
    rider.current.rotation.z = THREE.MathUtils.damp(
      rider.current.rotation.z,
      controls.tilt * 0.015,
      5,
      delta
    )
    board.current.rotation.z = flipping ? progress * Math.PI * 2 : 0
  })
  return (
    <Pedestal size={[1.95, 1.13, 1.55]} material={materials.stone} number="02">
      <group
        ref={rider}
        name="hoverboard-rider"
        rotation={[0, 0.4, 0]}
        onClick={(e) => {
          if (active) {
            e.stopPropagation()
            onControl('flip', controls.flip + 1)
          }
        }}
      >
        <group ref={board} name="hoverboard-deck">
          <Box size={[1.8, 0.11, 0.63]} color="#204aba" radius={0.05} />
          <Box
            size={[1.6, 0.015, 0.51]}
            position={[0, 0.065, 0]}
            color="#263037"
            radius={0.025}
          />
          {[-0.65, 0.65].map((x) => (
            <Box
              key={x}
              size={[0.1, 0.025, 0.34]}
              position={[x, 0.087, 0]}
              color="#7aa9d4"
            />
          ))}
          {[-0.6, 0.6].map((x) => (
            <mesh
              key={x}
              rotation={[Math.PI / 2, 0, 0]}
              position={[x, -0.08, 0]}
            >
              <cylinderGeometry args={[0.17, 0.17, 0.045, 24]} />
              <meshStandardMaterial
                color="#819cab"
                metalness={0.7}
                roughness={0.25}
              />
            </mesh>
          ))}
        </group>
        <group scale={0.67} position={[0, 0.065, 0]}>
          <Figure color="#d97724" hovering />
        </group>
      </group>
    </Pedestal>
  )
}

export function Gate({
  materials,
  controls,
  active,
  onControl,
  reducedMotion,
}) {
  const arches = useRef([])
  const sculpture = useRef()
  useFrame((_, delta) => {
    const s = controls.spread
    arches.current.forEach((arch, i) => {
      if (!arch) return
      arch.position.z = THREE.MathUtils.damp(
        arch.position.z,
        (2.5 - i) * (0.31 + s * 0.2),
        4,
        delta
      )
      arch.position.x = THREE.MathUtils.damp(
        arch.position.x,
        (i - 2.5) * s * 0.12,
        4,
        delta
      )
      arch.rotation.y = THREE.MathUtils.damp(
        arch.rotation.y,
        (i - 2.5) * s * 0.08,
        4,
        delta
      )
    })
    if (controls.rotateGate && !reducedMotion)
      sculpture.current.rotation.y += delta * 0.3
    else
      sculpture.current.rotation.y = THREE.MathUtils.damp(
        sculpture.current.rotation.y % (Math.PI * 2),
        -0.06,
        2,
        delta
      )
  })
  return (
    <Pedestal size={[3.7, 0.53, 3.2]} material={materials.stone} number="03">
      <group
        ref={sculpture}
        name="chromatic-sculpture"
        onClick={(e) => {
          if (active) {
            e.stopPropagation()
            onControl('spread', controls.spread > 0.8 ? 0.15 : 1.35)
          }
        }}
      >
        {spectrum.map((color, i) => {
          const height = 1.72 + i * 0.285
          const width = 1.65 + i * 0.135
          return (
            <group
              key={color}
              name={`arch-${i}`}
              ref={(el) => {
                arches.current[i] = el
              }}
            >
              <Box
                size={[width, 0.21, 0.22]}
                position={[0, height, 0]}
                color={color}
                radius={0.018}
              />
              {[-1, 1].map((side) => (
                <Box
                  key={side}
                  size={[0.21, height, 0.22]}
                  position={[(side * (width - 0.21)) / 2, height / 2, 0]}
                  color={color}
                  radius={0.015}
                />
              ))}
            </group>
          )
        })}
      </group>
    </Pedestal>
  )
}

const carColors = ['#d7b326', '#bc493b', '#368daf', '#5c8c56']
const origins = [
  [-0.85, -0.75],
  [0.85, -0.75],
  [-0.85, 0.75],
  [0.85, 0.75],
]

function ToyCar({ color }) {
  return (
    <group>
      <Box
        size={[0.51, 0.18, 0.3]}
        color={color}
        position={[0, 0.15, 0]}
        radius={0.025}
      />
      <Box
        size={[0.26, 0.15, 0.27]}
        color={color}
        position={[-0.04, 0.29, 0]}
        radius={0.017}
      />
      <Box
        size={[0.19, 0.085, 0.276]}
        color="#92b2bb"
        position={[-0.02, 0.315, 0]}
        radius={0.01}
      />
      <Box
        size={[0.035, 0.086, 0.282]}
        color={color}
        position={[-0.025, 0.315, 0]}
        radius={0.004}
      />
      {[-0.17, 0.17].flatMap((x) =>
        [-0.17, 0.17].map((z) => (
          <group
            key={`${x}-${z}`}
            position={[x, 0.11, z]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <Cylinder args={[0.1, 0.1, 0.055, 16]} color="#2c2b26" />
            <Cylinder args={[0.046, 0.046, 0.06, 12]} color="#b8b2a5" />
          </group>
        ))
      )}
      {[-0.085, 0.085].map((z) => (
        <Box
          key={z}
          size={[0.018, 0.05, 0.065]}
          color="#f1e6b0"
          position={[0.26, 0.18, z]}
          radius={0.009}
        />
      ))}
    </group>
  )
}

export function Cars({ materials, controls, active, onStatus }) {
  const refs = useRef([])
  const cars = useMemo(
    () => origins.map(([x, z]) => ({ x, z, vx: 0, vz: 0 })),
    []
  )
  const collisions = useRef(0)
  const observed = useRef({
    launch: controls.launch,
    reset: controls.resetCars,
  })
  useEffect(() => {
    if (active) onStatus('cars', `${collisions.current} collisions`)
  }, [active, onStatus])
  useFrame((_, delta) => {
    if (controls.resetCars !== observed.current.reset) {
      observed.current.reset = controls.resetCars
      cars.forEach((c, i) => {
        c.x = origins[i][0]
        c.z = origins[i][1]
        c.vx = c.vz = 0
      })
      collisions.current = 0
      onStatus('cars', '0 collisions')
    }
    if (controls.launch !== observed.current.launch) {
      observed.current.launch = controls.launch
      cars.forEach((c, i) => {
        c.vx = -Math.sign(c.x || origins[i][0]) * (1.8 + i * 0.1)
        c.vz = -Math.sign(c.z || origins[i][1]) * (1.1 + i * 0.13)
      })
    }
    // Integrate delayed frames in small steps so collisions stay stable and
    // the simulation does not slow to a crawl on a lower-powered renderer.
    const elapsed = Math.min(delta, 0.25)
    const steps = Math.max(1, Math.ceil(elapsed / (1 / 120)))
    const dt = elapsed / steps
    const previousCollisions = collisions.current
    for (let step = 0; step < steps; step++) {
      cars.forEach((c) => {
        c.x += c.vx * dt
        c.z += c.vz * dt
        if (Math.abs(c.x) > 1.08) {
          c.x = Math.sign(c.x) * 1.08
          c.vx *= -0.9
        }
        if (Math.abs(c.z) > 0.94) {
          c.z = Math.sign(c.z) * 0.94
          c.vz *= -0.9
        }
        c.vx *= Math.exp(-dt * 0.055)
        c.vz *= Math.exp(-dt * 0.055)
      })
      for (let i = 0; i < cars.length; i++)
        for (let j = i + 1; j < cars.length; j++) {
          const a = cars[i],
            b = cars[j]
          const dx = b.x - a.x,
            dz = b.z - a.z
          const distance = Math.hypot(dx, dz)
          if (distance < 0.46 && distance > 0) {
            const nx = dx / distance,
              nz = dz / distance
            const closingSpeed = (a.vx - b.vx) * nx + (a.vz - b.vz) * nz
            if (closingSpeed > 0) {
              a.vx -= closingSpeed * nx
              a.vz -= closingSpeed * nz
              b.vx += closingSpeed * nx
              b.vz += closingSpeed * nz
              collisions.current++
            }
            const separation = (0.46 - distance) / 2
            a.x -= nx * separation
            a.z -= nz * separation
            b.x += nx * separation
            b.z += nz * separation
          }
        }
    }
    if (active && collisions.current !== previousCollisions)
      onStatus('cars', `${collisions.current} collisions`)
    cars.forEach((c, i) => {
      const mesh = refs.current[i]
      if (!mesh) return
      mesh.position.set(c.x, 0.05, c.z)
      if (Math.hypot(c.vx, c.vz) > 0.03)
        mesh.rotation.y = Math.atan2(-c.vz, c.vx)
    })
  })
  return (
    <Pedestal size={[2.85, 1.1, 2.58]} material={materials.stone} number="04">
      <Box size={[2.65, 0.04, 2.4]} position={[0, 0.025, 0]} color="#567950" />
      {[-1, 1].map((s) => (
        <Box
          key={`x${s}`}
          size={[0.045, 0.13, 2.45]}
          position={[s * 1.34, 0.08, 0]}
          material={materials.metal}
        />
      ))}
      {[-1, 1].map((s) => (
        <Box
          key={`z${s}`}
          size={[2.7, 0.13, 0.045]}
          position={[0, 0.08, s * 1.22]}
          material={materials.metal}
        />
      ))}
      {cars.map((car, i) => (
        <group
          key={i}
          name={`car-${i}`}
          ref={(el) => {
            refs.current[i] = el
          }}
          position={[car.x, 0.05, car.z]}
          onClick={(e) => {
            if (active) {
              e.stopPropagation()
              car.vx += (i % 2 ? -1 : 1) * 1.8
              car.vz += 1.2
            }
          }}
        >
          <ToyCar color={carColors[i]} />
        </group>
      ))}
    </Pedestal>
  )
}
