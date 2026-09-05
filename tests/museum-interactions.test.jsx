/* eslint-disable react/prop-types */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useFrame } from '@react-three/fiber'
import { create, act } from '@react-three/test-renderer'
import * as THREE from 'three'
import { Prisoner, Hoverboard, Gate, Cars } from '../src/museum/Sculptures'
import { DuckPool, Polaroids } from '../src/museum/WaterAndPhotos'
import { Conveyor, Constellation } from '../src/museum/KineticDisplays'
import { collection, initialControls } from '../src/museum/collection'

// This suite exercises the real Three.js scene graph and frame callbacks.
// Only network-dependent assets and text rasterization are replaced. It does
// not claim to test GPU shader compilation, lighting, or visual appearance.
vi.mock('@react-three/drei', async () => {
  const actual = await vi.importActual('@react-three/drei')
  const three = await import('three')
  const textures = new Map()
  const getTexture = (url) => {
    if (!textures.has(url)) textures.set(url, new three.Texture())
    return textures.get(url)
  }
  const duck = new three.Group()
  duck.add(
    new three.Mesh(
      new three.SphereGeometry(0.3),
      new three.MeshStandardMaterial()
    )
  )
  return {
    ...actual,
    Text: ({ children, position }) => (
      <group position={position} userData={{ text: children }} />
    ),
    useTexture: (urls) =>
      Array.isArray(urls) ? urls.map(getTexture) : getTexture(urls),
    useGLTF: () => ({ scene: duck }),
  }
})

globalThis.IS_REACT_ACT_ENVIRONMENT = true
const renderers = []
const materials = {
  stone: new THREE.MeshStandardMaterial(),
  metal: new THREE.MeshStandardMaterial(),
  darkMetal: new THREE.MeshStandardMaterial(),
}
const companies = Array.from({ length: 35 }, (_, i) => ({
  id: `company-${i}`,
  name: `Company ${i}`,
  description: `Description ${i}`,
  founded: 2000 + i,
}))

function Clock() {
  useFrame((state, delta) => {
    state.clock.elapsedTime += delta
  }, -100)
  return null
}

async function mount(Exhibit, overrides = {}) {
  const onControl = vi.fn(),
    onStatus = vi.fn()
  let controls = { ...initialControls, ...overrides }
  const node = () => (
    <>
      <Clock />
      <Exhibit
        materials={materials}
        controls={controls}
        active
        onControl={onControl}
        onStatus={onStatus}
        companies={companies}
        reducedMotion={false}
      />
    </>
  )
  const renderer = await create(node())
  renderers.push(renderer)
  const update = async (values) => {
    controls = { ...controls, ...values }
    await renderer.update(node())
  }
  const frames = async (count = 60, delta = 1 / 60) => {
    await act(async () => {
      for (let i = 0; i < count; i++) await renderer.advanceFrames(1, delta)
    })
  }
  const object = (name) => renderer.scene.findByProps({ name }).instance
  const click = (name, extra = {}) =>
    renderer.fireEvent(renderer.scene.findByProps({ name }), 'click', extra)
  return { renderer, update, frames, object, click, onControl, onStatus }
}

afterEach(async () => {
  for (const renderer of renderers.splice(0)) await renderer.unmount()
})

describe('The complete museum', () => {
  it('registers all eight unique works with finite inspection cameras', () => {
    expect(collection).toHaveLength(8)
    expect(new Set(collection.map((w) => w.id)).size).toBe(8)
    for (const work of collection) {
      expect(
        [...work.position, ...work.camera, ...work.target].every(
          Number.isFinite
        )
      ).toBe(true)
      expect(work.thumbnail).toContain('/museum/thumbnails/')
      expect(
        new THREE.Vector3(...work.camera).distanceTo(
          new THREE.Vector3(...work.target)
        )
      ).toBeGreaterThan(3)
    }
  })

  it('opens the cage door and animates the resident’s greeting', async () => {
    const scene = await mount(Prisoner)
    await scene.click('cage-door')
    expect(scene.onControl).toHaveBeenCalledWith('cageOpen', true)
    await scene.update({ cageOpen: true, wave: 1 })
    await scene.frames(40)
    expect(scene.object('cage-door').rotation.y).toBeLessThan(-1.3)
    expect(scene.object('figure-waving-arm').rotation.z).toBeLessThan(-1)
    await scene.update({ cageOpen: false })
    await scene.frames(80)
    expect(Math.abs(scene.object('cage-door').rotation.y)).toBeLessThan(0.02)
  })

  it('tilts the hoverboard and completes an airborne kickflip', async () => {
    const scene = await mount(Hoverboard)
    await scene.frames(2)
    await scene.click('hoverboard-rider')
    expect(scene.onControl).toHaveBeenCalledWith('flip', 1)
    await scene.update({ flip: 1, tilt: 25 })
    await scene.frames(35)
    expect(scene.object('hoverboard-rider').position.y).toBeGreaterThan(1.5)
    expect(scene.object('hoverboard-deck').rotation.z).toBeGreaterThan(2)
    expect(scene.object('hoverboard-rider').rotation.z).toBeGreaterThan(0.3)
    await scene.frames(60)
    expect(scene.object('hoverboard-deck').rotation.z).toBe(0)
    expect(scene.object('hoverboard-rider').position.y).toBeLessThan(0.6)
  })

  it('spreads the six gates and rotates the whole sculpture', async () => {
    const scene = await mount(Gate)
    await scene.frames(80)
    const before = scene.object('arch-0').position.z
    await scene.update({ spread: 1.5, rotateGate: true })
    await scene.frames(80)
    expect(scene.object('arch-0').position.z).toBeGreaterThan(before + 0.45)
    expect(scene.object('arch-5').position.z).toBeLessThan(-1.45)
    expect(scene.object('chromatic-sculpture').rotation.y).toBeGreaterThan(0.2)
  })

  it('launches colliding cars, keeps them on the track, and resets them', async () => {
    const scene = await mount(Cars)
    const initial = scene.object('car-0').position.clone()
    await scene.update({ launch: 1 })
    await scene.frames(160)
    expect(scene.object('car-0').position.distanceTo(initial)).toBeGreaterThan(
      0.1
    )
    expect(
      scene.onStatus.mock.calls.some(([, value]) =>
        /^[1-9]\d* collisions$/.test(value)
      )
    ).toBe(true)
    for (let i = 0; i < 4; i++) {
      expect(Math.abs(scene.object(`car-${i}`).position.x)).toBeLessThanOrEqual(
        1.12
      )
      expect(Math.abs(scene.object(`car-${i}`).position.z)).toBeLessThanOrEqual(
        1.0
      )
    }
    await scene.update({ resetCars: 1 })
    await scene.frames(1)
    expect(scene.object('car-0').position.x).toBeCloseTo(-0.85)
    expect(scene.object('car-0').position.z).toBeCloseTo(-0.75)
    scene.onStatus.mockClear()
    await scene.update({ launch: 2 })
    await scene.frames(4, 0.25)
    expect(
      scene.onStatus.mock.calls.some(([, value]) =>
        /^[1-9]\d* collisions$/.test(value)
      )
    ).toBe(true)
  })

  it('creates water ripples and makes individual ducks hop', async () => {
    const scene = await mount(DuckPool)
    await scene.frames(2)
    await scene.click('pool-water', { point: new THREE.Vector3(0.3, 0.9, 0.2) })
    expect(scene.onControl).toHaveBeenCalledWith('ripple', 1)
    await scene.update({ ripple: 1 })
    await scene.frames(20)
    expect(scene.object('ripple-0').visible).toBe(true)
    expect(scene.object('ripple-0').scale.x).toBeGreaterThan(0.1)
    await scene.click('duck-0')
    await scene.frames(20)
    expect(scene.object('duck-0').position.y).toBeGreaterThan(1.25)
    await scene.frames(140)
    expect(scene.object('ripple-0').visible).toBe(false)
    expect(scene.object('duck-0').position.y).toBeLessThan(0.95)
  })

  it('brings a selected Polaroid forward and returns it to the wall', async () => {
    const scene = await mount(Polaroids)
    await scene.click('print-2')
    expect(scene.onControl).toHaveBeenCalledWith('photo', 2)
    await scene.update({ photo: 2 })
    await scene.frames(90)
    expect(scene.object('print-2').position.z).toBeGreaterThan(1.18)
    expect(scene.object('print-2').scale.x).toBeGreaterThan(1.5)
    await scene.update({ photo: -1 })
    await scene.frames(90)
    expect(scene.object('print-2').position.z).toBeCloseTo(0.26, 1)
    expect(scene.object('print-2').scale.x).toBeCloseTo(1, 1)
  })

  it('moves the conveyor, pauses its items, and scans each item once per pass', async () => {
    const scene = await mount(Conveyor)
    const before = scene.object('grocery-0').position.x
    await scene.frames(60)
    expect(scene.object('grocery-0').position.x).toBeGreaterThan(before + 0.15)
    await scene.update({ beltPaused: true })
    const pausedAt = scene.object('grocery-0').position.x
    await scene.frames(60)
    expect(scene.object('grocery-0').position.x).toBeCloseTo(pausedAt)
    scene.onStatus.mockClear()
    await scene.click('grocery-0')
    await scene.click('grocery-0')
    expect(scene.onStatus).toHaveBeenCalledTimes(1)
    expect(scene.onStatus).toHaveBeenCalledWith(
      'conveyor',
      expect.stringContaining('scanned')
    )
  })

  it('selects constellation companies and reveals search results beyond the preview', async () => {
    const scene = await mount(Constellation)
    await scene.click('company-company-2')
    expect(scene.onControl).toHaveBeenCalledWith('company', 'company-2')
    await scene.update({ company: 'company-34' })
    await scene.frames(70)
    expect(scene.object('company-company-34').scale.x).toBeGreaterThan(1.45)
    const before = scene.object('company-company-3').position.clone()
    await scene.frames(100)
    expect(
      scene.object('company-company-3').position.distanceTo(before)
    ).toBeGreaterThan(0.01)
  })
})
