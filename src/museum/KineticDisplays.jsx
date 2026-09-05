/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Box, Cylinder, Frame, Label, Pedestal, Plaque } from './primitives'
import { companyColors } from './collection'

const groceries = [
  { color: '#cb4542', height: 0.48, name: 'TEA' },
  { color: '#385cad', height: 0.56, name: 'OATS' },
  { color: '#c8ad39', height: 0.42, name: 'RICE' },
  { color: '#5b8c58', height: 0.6, name: 'MINT' },
  { color: '#a85b8a', height: 0.51, name: 'COCOA' },
]

export function Conveyor({ materials, controls, active, onStatus }) {
  const items = useRef([])
  const rollers = useRef([])
  const scanner = useRef()
  const objects = useMemo(
    () =>
      groceries.map((_, i) => ({
        x: -1.42 + i * 0.62,
        scanned: false,
        flash: -100,
      })),
    []
  )
  const count = useRef(0)
  const elapsed = useRef(0)
  const lastScan = useRef(controls.scan)
  const lastFlash = useRef(-100)
  const scanItem = (object) => {
    if (object.scanned) return
    object.scanned = true
    object.flash = elapsed.current
    lastFlash.current = elapsed.current
    count.current++
    onStatus(
      'conveyor',
      `${count.current} ${count.current === 1 ? 'item' : 'items'} scanned`
    )
  }
  useEffect(() => {
    if (active) onStatus('conveyor', `${count.current} items scanned`)
  }, [active, onStatus])
  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    elapsed.current = t
    if (controls.scan !== lastScan.current) {
      lastScan.current = controls.scan
      const nearest = objects
        .filter((o) => !o.scanned)
        .sort((a, b) => Math.abs(a.x - 0.63) - Math.abs(b.x - 0.63))[0]
      if (nearest) scanItem(nearest)
    }
    const speed = controls.beltPaused
      ? 0
      : (active ? controls.beltSpeed : 0.45) * 0.22
    objects.forEach((o, i) => {
      o.x += speed * Math.min(delta, 0.05)
      if (o.x > 1.62) {
        o.x = -1.5
        o.scanned = false
      }
      if (active && o.x > 0.65 && !o.scanned) scanItem(o)
      const ref = items.current[i]
      if (ref) {
        ref.position.x = o.x
        ref.position.y =
          0.22 +
          groceries[i].height / 2 +
          (t - o.flash < 0.5
            ? Math.sin((t - o.flash) * Math.PI * 2) * 0.075
            : 0)
      }
    })
    rollers.current.forEach((r) => {
      if (r) r.rotation.x += speed * delta * 6
    })
    if (scanner.current)
      scanner.current.material.emissiveIntensity =
        t - lastFlash.current < 0.4 ? 3.5 : 0.5
  })
  return (
    <Pedestal size={[3.65, 1.1, 1.45]} material={materials.stone} number="07">
      <Box
        size={[3.4, 0.17, 1.05]}
        position={[0, 0.085, 0]}
        material={materials.darkMetal}
      />
      <Box size={[3.1, 0.04, 0.95]} position={[0, 0.19, 0]} color="#252624" />
      {[-1.55, 1.55].map((x, i) => (
        <group
          key={x}
          ref={(el) => {
            rollers.current[i] = el
          }}
          position={[x, 0.12, 0]}
        >
          <Cylinder
            args={[0.15, 0.15, 1.03, 24]}
            rotation={[Math.PI / 2, 0, 0]}
            material={materials.darkMetal}
          />
          <Cylinder
            args={[0.085, 0.085, 1.075, 20]}
            rotation={[Math.PI / 2, 0, 0]}
            material={materials.metal}
          />
        </group>
      ))}
      {[-0.56, 0.56].map((z) => (
        <Box
          key={z}
          size={[3.4, 0.12, 0.035]}
          position={[0, 0.07, z]}
          material={materials.metal}
        />
      ))}
      {Array.from({ length: 22 }, (_, i) => (
        <Box
          key={i}
          size={[0.008, 0.003, 0.9]}
          position={[-1.45 + i * 0.138, 0.213, 0]}
          color="#45433d"
          radius={0.001}
        />
      ))}
      {groceries.map((item, i) => (
        <group
          key={item.name}
          name={`grocery-${i}`}
          ref={(el) => {
            items.current[i] = el
          }}
          position={[objects[i].x, 0.22 + item.height / 2, 0]}
          onClick={(e) => {
            if (active) {
              e.stopPropagation()
              scanItem(objects[i])
            }
          }}
        >
          <Box
            size={[0.36, item.height, 0.4]}
            color={item.color}
            radius={0.015}
          />
          <Box
            size={[0.23, item.height * 0.51, 0.004]}
            position={[0, 0, 0.203]}
            color="#e8e0c7"
            radius={0.003}
          />
          <Label size={0.065} position={[0, 0.015, 0.21]}>
            {item.name}
          </Label>
          <Box
            size={[0.01, 0.01, 0.385]}
            position={[0, item.height / 2 + 0.001, 0]}
            color="#d1c5a2"
          />
        </group>
      ))}
      <mesh
        ref={scanner}
        position={[0.65, 0.22, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[0.025, 0.98]} />
        <meshStandardMaterial
          color="#b0dcc8"
          emissive="#55bfb0"
          emissiveIntensity={0.5}
        />
      </mesh>
      <Box
        size={[0.2, 0.14, 0.15]}
        position={[0.65, 0.23, -0.62]}
        color="#474640"
      />
      <mesh position={[0.65, 0.28, -0.536]}>
        <sphereGeometry args={[0.024, 8, 8]} />
        <meshStandardMaterial
          color="#84d5aa"
          emissive="#6ba885"
          emissiveIntensity={1.2}
        />
      </mesh>
    </Pedestal>
  )
}

function CompanyOrb({
  company,
  index,
  total,
  selected,
  onSelect,
  active,
  rotation,
  reducedMotion,
}) {
  const ref = useRef()
  const size = 0.105 + ((index * 7) % 5) * 0.025
  const angle = index * 2.39996
  const r = Math.sqrt((index + 0.5) / total) * 1.24
  const base = useMemo(
    () =>
      new THREE.Vector3(
        Math.cos(angle) * r,
        Math.sin(angle) * r * 1.19,
        0.3 + ((index * 13) % 7) * 0.045
      ),
    [angle, r, index]
  )
  const destination = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ clock }, delta) => {
    const spin = rotation.current
    const cos = Math.cos(spin),
      sin = Math.sin(spin)
    const isSelected = company.id === selected
    const x = base.x * cos - base.z * sin * 0.4
    const y =
      base.y +
      (reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.45 + index) * 0.025)
    const z = base.z + base.x * sin * 0.32
    destination.set(x, y, z)
    ref.current.position.lerp(destination, 1 - Math.exp(-delta * 6))
    const targetScale = isSelected ? 1.5 : 1
    ref.current.scale.setScalar(
      THREE.MathUtils.damp(ref.current.scale.x, targetScale, 6, delta)
    )
  })
  return (
    <group
      ref={ref}
      name={`company-${company.id}`}
      position={base.toArray()}
      onClick={(e) => {
        if (active) {
          e.stopPropagation()
          onSelect(company.id)
        }
      }}
    >
      <mesh castShadow>
        <sphereGeometry args={[size, 24, 16]} />
        <meshPhysicalMaterial
          color={companyColors[index % companyColors.length]}
          roughness={0.22}
          metalness={0.26}
          clearcoat={0.8}
          emissive={company.id === selected ? '#958150' : '#000000'}
          emissiveIntensity={0.25}
        />
      </mesh>
      {active && (company.id === selected || index < 5) && (
        <Label
          size={0.095}
          position={[0, -size - 0.07, 0.02]}
          color="#eee9db"
          outlineWidth={0.007}
          outlineColor="#182026"
        >
          {company.name}
        </Label>
      )}
    </group>
  )
}

export function Constellation({
  materials,
  controls,
  companies,
  active,
  onControl,
  reducedMotion,
}) {
  const rotation = useRef(0)
  const selected = controls.company
  const visible = useMemo(() => {
    const group = companies.slice(0, 29)
    const highlighted = companies.find((c) => c.id === selected)
    if (highlighted && !group.some((c) => c.id === highlighted.id))
      group[0] = highlighted
    return group
  }, [companies, selected])
  useFrame((_, delta) => {
    if (controls.constellationSpin && (!reducedMotion || active))
      rotation.current += delta * 0.18
  })
  return (
    <group position={[0, 3.1, 0]}>
      <Frame width={3.15} height={3.9} material={materials.darkMetal}>
        <mesh position={[0, 0, 0.085]}>
          <planeGeometry args={[3.04, 3.78]} />
          <meshStandardMaterial color="#17232b" roughness={0.8} />
        </mesh>
        {visible.map((company, i) => (
          <CompanyOrb
            key={company.id}
            company={company}
            index={i}
            total={visible.length}
            selected={selected}
            onSelect={(id) => onControl('company', id)}
            active={active}
            rotation={rotation}
            reducedMotion={reducedMotion}
          />
        ))}
        {Array.from({ length: 55 }, (_, i) => (
          <mesh
            key={i}
            position={[
              Math.sin(i * 123.45) * 1.45,
              Math.cos(i * 98.31) * 1.75,
              0.1,
            ]}
          >
            <sphereGeometry args={[0.006 + (i % 3) * 0.002, 5, 5]} />
            <meshBasicMaterial color="#b7c0c5" />
          </mesh>
        ))}
      </Frame>
      <Plaque number="08" position={[0, -2.24, 0]} />
    </group>
  )
}
