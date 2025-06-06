import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, Text } from '@react-three/drei'
import { useState, Suspense, useRef } from 'react'
import PropTypes from 'prop-types'
import { usePageTitle } from '../hooks/usePageTitle'

// Funny grocery items with different behaviors
const GROCERY_ITEMS = [
  { name: 'Suspicious Banana', color: '#FFD700', shape: 'banana', price: 2.99, bouncy: true, emoji: '🍌' },
  { name: 'Quantum Apple', color: '#FF4444', shape: 'sphere', price: 1.50, spinning: true, emoji: '🍎' },
  { name: 'Invisible Milk', color: '#FFFFFF', shape: 'box', price: 3.25, transparent: true, emoji: '🥛' },
  { name: 'Dancing Carrot', color: '#FF6600', shape: 'cone', price: 0.99, wobbly: true, emoji: '🥕' },
  { name: 'Grumpy Potato', color: '#8B4513', shape: 'blob', price: 1.75, grumpy: true, emoji: '🥔' },
  { name: 'Escape Artist Egg', color: '#FFFACD', shape: 'egg', price: 2.50, escaping: true, emoji: '🥚' },
  { name: 'Mysterious Cheese', color: '#FFFF00', shape: 'wedge', price: 4.99, glowing: true, emoji: '🧀' },
  { name: 'Hyperactive Coffee', color: '#4B2F20', shape: 'cylinder', price: 5.99, jittery: true, emoji: '☕' },
  { name: 'Zen Watermelon', color: '#00AA00', shape: 'sphere', price: 6.50, peaceful: true, emoji: '🍉' },
  { name: 'Disco Broccoli', color: '#228B22', shape: 'tree', price: 2.25, party: true, emoji: '🥦' }
]

function ScanLine({ dotted, running, sensorZ, scanEffect }) {
  const color = '#000000'
  const emissive = running ? '#ff0000' : scanEffect ? '#00ffff' : '#00ff00'
  const intensity = scanEffect ? 10 : 5
  
  if (!dotted) {
    return (
      <mesh position={[0, 0.2, sensorZ]}>
        <boxGeometry args={[2.1, 0.02, 0.02]} />
        <meshStandardMaterial
          emissive={emissive}
          emissiveIntensity={intensity}
          color={color}
        />
        {scanEffect && (
          <mesh position={[0, 0, 0]}>
            <ringGeometry args={[0, 2, 16]} />
            <meshStandardMaterial
              emissive="#00ffff"
              emissiveIntensity={8}
              transparent
              opacity={0.5}
            />
          </mesh>
        )}
      </mesh>
    )
  }
  const segmentCount = 8
  const segmentWidth = 2.1 / segmentCount
  const gapRatio = 0.5
  const boxWidth = segmentWidth * (1 - gapRatio)
  const segments = []
  for (let i = 0; i < segmentCount; i++) {
    const x = -1.05 + segmentWidth * i + boxWidth / 2
    segments.push(
      <mesh key={i} position={[x, 0.2, sensorZ]}>
        <boxGeometry args={[boxWidth, 0.02, 0.02]} />
        <meshStandardMaterial
          emissive={emissive}
          emissiveIntensity={intensity}
          color={color}
        />
      </mesh>
    )
  }
  return <group>{segments}</group>
}

ScanLine.propTypes = {
  dotted: PropTypes.bool.isRequired,
  running: PropTypes.bool.isRequired,
  sensorZ: PropTypes.number.isRequired,
  scanEffect: PropTypes.bool
}

function Belt({ length = 20, width = 2 }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[width, length]} />
      <meshStandardMaterial color="#111" />
    </mesh>
  )
}

Belt.propTypes = {
  length: PropTypes.number,
  width: PropTypes.number,
}

function GroceryItem({ item, position, onClick, time }) {
  const meshRef = useRef()
  const itemData = GROCERY_ITEMS.find(g => g.name === item.type) || GROCERY_ITEMS[0]
  
  useFrame(() => {
    if (!meshRef.current) return
    
    // Different animations based on item type
    if (itemData.spinning) {
      meshRef.current.rotation.y += 0.05
    }
    
    if (itemData.bouncy) {
      meshRef.current.position.y = position[1] + Math.sin(time * 5) * 0.1
    }
    
    if (itemData.wobbly) {
      meshRef.current.rotation.z = Math.sin(time * 3) * 0.2
    }
    
    if (itemData.jittery) {
      meshRef.current.position.x = position[0] + Math.sin(time * 10) * 0.05
    }
    
    if (itemData.escaping) {
      meshRef.current.position.x = position[0] + Math.sin(time * 2) * 0.2
    }
    
    if (itemData.party) {
      meshRef.current.rotation.x = Math.sin(time * 4) * 0.3
      meshRef.current.rotation.z = Math.cos(time * 4) * 0.3
    }
  })

  const getGeometry = () => {
    switch (itemData.shape) {
      case 'sphere':
        return <sphereGeometry args={[0.3, 16, 16]} />
      case 'cone':
        return <coneGeometry args={[0.2, 0.8, 8]} />
      case 'cylinder':
        return <cylinderGeometry args={[0.2, 0.2, 0.5, 8]} />
      case 'egg':
        return <sphereGeometry args={[0.25, 16, 16]} />
      default:
        return <boxGeometry args={item.dims} />
    }
  }

  return (
    <>
      <mesh 
        ref={meshRef}
        position={position} 
        castShadow 
        onClick={onClick}
        onPointerOver={(e) => { e.object.scale.setScalar(1.1) }}
        onPointerOut={(e) => { e.object.scale.setScalar(1) }}
      >
        {getGeometry()}
        <meshStandardMaterial 
          color={itemData.color}
          transparent={itemData.transparent}
          opacity={itemData.transparent ? 0.3 : 1}
          emissive={itemData.glowing ? itemData.color : '#000000'}
          emissiveIntensity={itemData.glowing ? 0.2 : 0}
        />
      </mesh>
      
      {/* Floating emoji label */}
      <Html position={[position[0], position[1] + 0.8, position[2]]} center>
        <div className="text-2xl select-none pointer-events-none">
          {itemData.emoji}
        </div>
      </Html>
    </>
  )
}

GroceryItem.propTypes = {
  item: PropTypes.object.isRequired,
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
  onClick: PropTypes.func,
  time: PropTypes.number.isRequired,
}

function ConveyorScene({ speed, onItemScanned, manualScan }) {
  const [items, setItems] = useState(() => {
    const initial = []
    let z = -10
    for (let i = 0; i < 6; i++) {
      const groceryType = GROCERY_ITEMS[Math.floor(Math.random() * GROCERY_ITEMS.length)]
      initial.push({
        id: i,
        z,
        type: groceryType.name,
        dims: [0.4 + Math.random() * 0.4, 0.4 + Math.random() * 0.4, 0.4 + Math.random() * 0.4],
        scanned: false,
      })
      z -= (1.5 + Math.random() * 1.5)
    }
    return initial
  })
  
  const [running, setRunning] = useState(true)
  const [scanEffect, setScanEffect] = useState(false)
  const [time, setTime] = useState(0)

  const sensorZ = 0.5
  const offscreenZ = 2
  const spawnZ = -14

  useFrame((state) => {
    setTime(state.clock.elapsedTime)
    
    if (running) {
      setItems((prev) => prev.map((it) => ({ ...it, z: it.z + speed })))
    }
    
    // Remove offscreen items
    setItems((prev) => prev.filter((it) => it.z < offscreenZ))
    
    // Auto-scan items at sensor
    items.forEach((it) => {
      if (running && !it.scanned && it.z + speed >= sensorZ && it.z < sensorZ) {
        setRunning(false)
        setScanEffect(true)
        const groceryType = GROCERY_ITEMS.find(g => g.name === it.type)
        onItemScanned(groceryType)
        setItems(prev => prev.map(item => 
          item.id === it.id ? { ...item, scanned: true } : item
        ))
        
        setTimeout(() => {
          setRunning(true)
          setScanEffect(false)
        }, 1200)
      }
    })
    
    // Spawn new items
    if (items.length < 8) {
      setItems((prev) => {
        const minZ = prev.reduce((m, it) => Math.min(m, it.z), spawnZ)
        const z = Math.min(spawnZ, minZ - (1.5 + Math.random() * 2))
        const groceryType = GROCERY_ITEMS[Math.floor(Math.random() * GROCERY_ITEMS.length)]
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            z,
            type: groceryType.name,
            dims: [0.4 + Math.random() * 0.4, 0.4 + Math.random() * 0.4, 0.4 + Math.random() * 0.4],
            scanned: false,
          },
        ]
      })
    }
  })

  const handleItemClick = (item) => {
    if (!item.scanned && manualScan) {
      const groceryType = GROCERY_ITEMS.find(g => g.name === item.type)
      onItemScanned(groceryType)
      setItems(prev => prev.map(it => 
        it.id === item.id ? { ...it, scanned: true } : it
      ))
      setScanEffect(true)
      setTimeout(() => setScanEffect(false), 500)
    }
  }

  return (
    <>
      <Belt />
      <ScanLine dotted={false} running={running} sensorZ={sensorZ} scanEffect={scanEffect} />
      {items.map((it) => (
        <GroceryItem
          key={it.id}
          item={it}
          position={[0, 0.31, it.z]}
          onClick={() => handleItemClick(it)}
          time={time}
        />
      ))}
      <Html position={[0, 1.4, 0]} transform occlude>
        <div className="rounded-2xl shadow-lg backdrop-blur bg-white/80 px-4 py-2 text-center">
          <p className="text-xs font-semibold text-gray-800">
            {running ? 'Belt running …' : scanEffect ? '✨ SCANNING ✨' : 'Processing item …'}
          </p>
        </div>
      </Html>
    </>
  )
}

ConveyorScene.propTypes = {
  speed: PropTypes.number.isRequired,
  onItemScanned: PropTypes.func.isRequired,
  manualScan: PropTypes.bool.isRequired,
}

export default function Conveyor() {
  usePageTitle('The Grocery Conveyor of Chaos')
  
  const [score, setScore] = useState(0)
  const [itemsScanned, setItemsScanned] = useState(0)
  const [speed, setSpeed] = useState(0.045)
  const [manualScan, setManualScan] = useState(false)
  const [lastScanned, setLastScanned] = useState(null)
  const [funnyMessages, setFunnyMessages] = useState([])

  const handleItemScanned = (item) => {
    setScore(prev => prev + item.price)
    setItemsScanned(prev => prev + 1)
    setLastScanned(item)
    
    // Add funny messages
    const messages = [
      `${item.emoji} Scanned ${item.name}! The cashier is confused.`,
      `${item.emoji} Beep! $${item.price} - That's suspiciously expensive for a ${item.name.toLowerCase()}.`,
      `${item.emoji} Warning: ${item.name} may cause spontaneous laughter.`,
      `${item.emoji} ${item.name} added to cart. Your grocery list is getting weird.`,
      `${item.emoji} Cha-ching! ${item.name} for $${item.price}. Worth every penny?`
    ]
    
    const newMessage = {
      id: Date.now(),
      text: messages[Math.floor(Math.random() * messages.length)]
    }
    
    setFunnyMessages(prev => [...prev.slice(-2), newMessage])
  }

  return (
    <div className="h-screen w-full bg-gradient-to-b from-purple-900 to-gray-900 flex">
      {/* 3D Scene */}
      <div className="flex-1">
        <Canvas shadows camera={{ position: [4, 4.5, 6], fov: 45 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
          <pointLight position={[0, 5, 0]} intensity={0.5} color="#ff6b9d" />
          <Suspense fallback={null}>
            <ConveyorScene 
              speed={speed} 
              onItemScanned={handleItemScanned}
              manualScan={manualScan}
            />
          </Suspense>
          <OrbitControls makeDefault />
        </Canvas>
      </div>

      {/* Control Panel */}
      <div className="w-80 bg-gray-800 p-6 text-white overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">🛒 Grocery Scanner Supreme</h2>
        
        {/* Score */}
        <div className="bg-green-600 rounded-lg p-4 mb-4 text-center">
          <h3 className="text-lg font-semibold">Total: ${score.toFixed(2)}</h3>
          <p className="text-sm">Items scanned: {itemsScanned}</p>
        </div>

        {/* Last Scanned Item */}
        {lastScanned && (
          <div className="bg-blue-600 rounded-lg p-3 mb-4">
            <h4 className="font-semibold">Last Scanned:</h4>
            <p className="text-sm">{lastScanned.emoji} {lastScanned.name}</p>
            <p className="text-xs">${lastScanned.price}</p>
          </div>
        )}

        {/* Controls */}
        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Belt Speed: {(speed * 100).toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.01"
              max="0.15"
              step="0.01"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="manualScan"
              checked={manualScan}
              onChange={(e) => setManualScan(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="manualScan" className="text-sm">
              Manual Scan Mode (Click items!)
            </label>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => {
            setScore(0)
            setItemsScanned(0)
            setLastScanned(null)
            setFunnyMessages([])
          }}
          className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold mb-4"
        >
          🗑️ Reset Register
        </button>

        {/* Funny Messages */}
        <div className="space-y-2">
          <h4 className="font-semibold text-yellow-400">📢 Scanner Updates:</h4>
          {funnyMessages.map((msg) => (
            <div key={msg.id} className="bg-gray-700 rounded p-2 text-xs">
              {msg.text}
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-6 text-xs text-gray-400">
          <h4 className="font-semibold mb-2">🎮 How to Play:</h4>
          <ul className="space-y-1">
            <li>• Watch items move on the conveyor</li>
            <li>• Enable manual mode to click items</li>
            <li>• Adjust belt speed for chaos</li>
            <li>• Each item has unique animations!</li>
            <li>• Try to spot the invisible milk 👻</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
