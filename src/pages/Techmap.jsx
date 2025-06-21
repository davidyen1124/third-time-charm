import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import { usePageTitle } from '../hooks/usePageTitle'
import { useRef, useMemo, useState, useEffect, Suspense } from 'react'
import PropTypes from 'prop-types'
import * as THREE from 'three'

// Constellation types and data
const CONSTELLATIONS = {
  AI_ML: {
    id: 'AI_ML',
    name: 'AI & Machine Learning',
    color: '#6366f1',
    keywords: [
      'AI',
      'artificial intelligence',
      'machine learning',
      'ML',
      'neural',
      'deep learning',
      'NLP',
      'computer vision',
      'language model',
    ],
  },
  FINTECH: {
    id: 'FINTECH',
    name: 'Financial Technology',
    color: '#f59e0b',
    keywords: [
      'financial',
      'finance',
      'payment',
      'banking',
      'fintech',
      'trading',
      'investment',
      'credit',
      'loan',
      'insurance',
    ],
  },
  HARDWARE: {
    id: 'HARDWARE',
    name: 'Hardware & Semiconductors',
    color: '#e5e7eb',
    keywords: [
      'semiconductor',
      'chip',
      'hardware',
      'memory',
      'storage',
      'flash',
      'processor',
      'computing',
      'quantum',
      'electronic',
    ],
  },
  SECURITY: {
    id: 'SECURITY',
    name: 'Security & Infrastructure',
    color: '#ef4444',
    keywords: [
      'security',
      'cybersecurity',
      'protection',
      'endpoint',
      'firewall',
      'threat',
      'vulnerability',
      'encryption',
      'privacy',
    ],
  },
  CONSUMER: {
    id: 'CONSUMER',
    name: 'Consumer & Entertainment',
    color: '#10b981',
    keywords: [
      'streaming',
      'entertainment',
      'consumer',
      'gaming',
      'media',
      'content',
      'platform',
      'social',
      'mobile app',
    ],
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise Software',
    color: '#8b5cf6',
    keywords: [
      'enterprise',
      'business',
      'software',
      'platform',
      'SaaS',
      'productivity',
      'workflow',
      'management',
      'collaboration',
    ],
  },
  BIOTECH: {
    id: 'BIOTECH',
    name: 'Biotechnology & Health',
    color: '#06b6d4',
    keywords: [
      'biotech',
      'health',
      'medical',
      'pharmaceutical',
      'therapy',
      'diagnostic',
      'clinical',
      'biology',
      'genetic',
    ],
  },
  MOBILITY: {
    id: 'MOBILITY',
    name: 'Mobility & Transportation',
    color: '#f97316',
    keywords: [
      'autonomous',
      'vehicle',
      'transportation',
      'mobility',
      'automotive',
      'delivery',
      'logistics',
      'ride',
      'driving',
    ],
  },
}

const calculateBrightness = (employeeCount) => {
  if (!employeeCount) return 0.3

  const count = parseInt(employeeCount.replace(/[^0-9]/g, '') || '0')

  if (count >= 10000) return 1.0
  if (count >= 5000) return 0.9
  if (count >= 2000) return 0.8
  if (count >= 1000) return 0.7
  if (count >= 500) return 0.6
  if (count >= 200) return 0.5
  if (count >= 100) return 0.4
  return 0.3
}

const determineConstellation = (description) => {
  const desc = description.toLowerCase()

  for (const constellation of Object.values(CONSTELLATIONS)) {
    if (
      constellation.keywords.some((keyword) =>
        desc.includes(keyword.toLowerCase())
      )
    ) {
      return constellation
    }
  }

  return CONSTELLATIONS.ENTERPRISE
}

const calculateOrbitRadius = (foundedYear, maxRadius, minRadius) => {
  const currentYear = new Date().getFullYear()
  const age = currentYear - foundedYear

  const maxAge = 50
  const normalizedAge = Math.min(age, maxAge) / maxAge

  return minRadius + normalizedAge * (maxRadius - minRadius)
}

function processCompanies(companies, densityMode) {
  let filteredCompanies = companies

  const densityLimits = {
    low: Math.min(100, filteredCompanies.length),
    medium: Math.min(300, filteredCompanies.length),
    high: filteredCompanies.length,
  }

  if (filteredCompanies.length > densityLimits[densityMode]) {
    filteredCompanies.sort((a, b) => {
      const brightnessA = calculateBrightness(a.employees)
      const brightnessB = calculateBrightness(b.employees)
      return brightnessB - brightnessA
    })
    filteredCompanies = filteredCompanies.slice(0, densityLimits[densityMode])
  }

  const centerX = 0
  const centerY = 0
  const maxRadius = 60
  const minRadius = 15

  return filteredCompanies.map((company, index) => {
    const constellation = determineConstellation(company.description)
    const brightness = calculateBrightness(company.employees)
    const orbitRadius = calculateOrbitRadius(
      company.founded,
      maxRadius,
      minRadius
    )

    const angle = index * 137.5 * (Math.PI / 180)
    const radiusVariation = orbitRadius + (Math.random() - 0.5) * 15

    return {
      ...company,
      brightness,
      constellation: {
        id: constellation.id,
        name: constellation.name,
        color: constellation.color,
      },
      color: constellation.color,
      position: {
        x: centerX + Math.cos(angle) * radiusVariation,
        y: centerY + Math.sin(angle) * radiusVariation,
      },
      orbitRadius,
    }
  })
}

function CompanyPoint({ company, onHover, delay = 0 }) {
  const meshRef = useRef()
  const [opacity, setOpacity] = useState(0)
  const [scale, setScale] = useState(0)
  const size = 0.8

  // Use www.techmap.dev directly (no redirect)
  const logoUrl = `https://www.techmap.dev${company.logo}`

  // Load texture using useLoader
  const texture = useLoader(THREE.TextureLoader, logoUrl)

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(1)
      setScale(1)
    }, delay)
    return () => clearTimeout(timer)
  }, [delay])

  useFrame((_, delta) => {
    if (meshRef.current && meshRef.current.material) {
      meshRef.current.material.opacity = THREE.MathUtils.lerp(
        meshRef.current.material.opacity,
        opacity,
        delta * 3
      )
      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(meshRef.current.scale.x, scale, delta * 3)
      )
    }
  })

  return (
    <group position={company.position}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => onHover(company)}
        onPointerLeave={() => onHover(null)}
        scale={0}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          map={texture}
          emissive={company.color}
          emissiveIntensity={0.2}
          transparent={true}
          opacity={0}
        />
      </mesh>
    </group>
  )
}

CompanyPoint.propTypes = {
  company: PropTypes.object.isRequired,
  onHover: PropTypes.func.isRequired,
  delay: PropTypes.number,
}

function BackgroundStars() {
  const points = useMemo(() => {
    const positions = new Float32Array(1000 * 3)
    for (let i = 0; i < 1000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200
    }
    return positions
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="white" opacity={0.3} transparent />
    </points>
  )
}

function Tooltip({ company, position }) {
  if (!company) return null

  return (
    <Html
      position={position}
      style={{
        pointerEvents: 'none',
        transform: 'translate3d(-50%, -100%, 0)',
        zIndex: 1000,
      }}
    >
      <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-3 max-w-xs shadow-2xl">
        <div className="text-white font-medium text-sm">{company.name}</div>
        <div className="text-slate-300 text-xs mt-1 line-clamp-2">
          {company.description}
        </div>
        {company.employees && (
          <div className="text-slate-400 text-xs mt-1">
            {company.employees} employees
          </div>
        )}
        <div className="text-slate-400 text-xs">Founded {company.founded}</div>
      </div>
    </Html>
  )
}

Tooltip.propTypes = {
  company: PropTypes.object,
  position: PropTypes.object.isRequired,
}

function PlaceholderSphere({
  position,
  color,
  size = 0.8,
}) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial color={color} transparent opacity={0.3} />
    </mesh>
  )
}

PlaceholderSphere.propTypes = {
  position: PropTypes.array.isRequired,
  color: PropTypes.string.isRequired,
  size: PropTypes.number,
}

function ConstellationScene({ companies }) {
  const [hoveredCompany, setHoveredCompany] = useState(null)
  const [visibleCount, setVisibleCount] = useState(0)
  const controlsRef = useRef()

  const processedCompanies = useMemo(() => {
    const processed = processCompanies(companies, 'medium')

    // Inner orbits first – that's what the user asked for
    const sorted = processed.sort((a, b) => a.orbitRadius - b.orbitRadius)

    // Convert 2D positions to 3D with some Z variation
    return sorted.map((company) => ({
      ...company,
      position: [
        company.position.x * 0.5, // Better scaling for 3D space
        company.position.y * 0.5,
        (Math.random() - 0.5) * 20, // More Z depth variation
      ],
    }))
  }, [companies])

  useEffect(() => {
    if (processedCompanies.length === 0) return

    const batchSize = 15
    const interval = 50

    const timer = setInterval(() => {
      setVisibleCount((prev) => {
        const next = Math.min(prev + batchSize, processedCompanies.length)
        if (next >= processedCompanies.length) {
          clearInterval(timer)
        }
        return next
      })
    }, interval)

    return () => clearInterval(timer)
  }, [processedCompanies.length])

  const visibleCompanies = useMemo(
    () => processedCompanies.slice(0, visibleCount),
    [processedCompanies, visibleCount]
  )

  const tooltipPosition = useMemo(() => {
    if (!hoveredCompany) return new THREE.Vector3()
    const company = processedCompanies.find((c) => c.id === hoveredCompany.id)
    if (!company) return new THREE.Vector3()
    return new THREE.Vector3(...company.position).add(
      new THREE.Vector3(0, 2, 0)
    )
  }, [hoveredCompany, processedCompanies])

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={150}
        minDistance={20}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />

      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[30, 30, 30]} intensity={0.5} color="#ffffff" />

      <BackgroundStars />

      {visibleCompanies.map((company, index) => (
        <Suspense
          key={company.id}
          fallback={
            <PlaceholderSphere
              position={company.position}
              color={company.color}
            />
          }
        >
          <CompanyPoint
            company={company}
            onHover={setHoveredCompany}
            delay={index * 20}
          />
        </Suspense>
      ))}

      <Tooltip company={hoveredCompany} position={tooltipPosition} />
    </>
  )
}

ConstellationScene.propTypes = {
  companies: PropTypes.array.isRequired,
}

export default function Techmap() {
  usePageTitle('Tech Company Constellation')
  const [companies, setCompanies] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const res = await fetch('/third-time-charm/companies.json')
        if (!res.ok) throw new Error('Failed to load companies data')
        const data = await res.json()
        setCompanies(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }
    loadCompanies()
  }, [])

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-black">
        <div className="text-center">
          <div className="text-red-400 text-xl font-medium mb-2">
            Error loading constellation
          </div>
          <div className="text-slate-400">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full relative overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 80], fov: 45 }}
        style={{
          background:
            'radial-gradient(ellipse at center, #1e293b 0%, #0f1419 100%)',
        }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <ConstellationScene companies={companies} />
      </Canvas>
    </div>
  )
}
