import { useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { asset } from './collection'

export function useMuseumMaterials() {
  const textures = useTexture([
    asset('materials/limestone.webp'),
    asset('materials/plaster.webp'),
  ])
  return useMemo(() => {
    const stoneMap = textures[0].clone()
    stoneMap.wrapS = stoneMap.wrapT = THREE.RepeatWrapping
    stoneMap.colorSpace = THREE.SRGBColorSpace
    stoneMap.anisotropy = 8
    stoneMap.needsUpdate = true
    const plasterMap = textures[1].clone()
    plasterMap.wrapS = plasterMap.wrapT = THREE.RepeatWrapping
    plasterMap.repeat.set(3, 1)
    plasterMap.colorSpace = THREE.SRGBColorSpace
    plasterMap.anisotropy = 8
    plasterMap.needsUpdate = true
    const floorMap = textures[0].clone()
    floorMap.wrapS = floorMap.wrapT = THREE.RepeatWrapping
    floorMap.repeat.set(8, 8)
    floorMap.colorSpace = THREE.SRGBColorSpace
    floorMap.anisotropy = 8
    floorMap.needsUpdate = true
    return {
      stone: new THREE.MeshStandardMaterial({
        color: '#e2d7c1',
        map: stoneMap,
        bumpMap: stoneMap,
        bumpScale: 0.016,
        roughness: 0.66,
      }),
      plaster: new THREE.MeshStandardMaterial({
        color: '#eee5d4',
        map: plasterMap,
        bumpMap: plasterMap,
        bumpScale: 0.025,
        roughness: 0.95,
      }),
      metal: new THREE.MeshStandardMaterial({
        color: '#b2ada2',
        metalness: 0.94,
        roughness: 0.24,
      }),
      darkMetal: new THREE.MeshStandardMaterial({
        color: '#302e29',
        metalness: 0.75,
        roughness: 0.33,
      }),
      floorMap,
    }
  }, [textures])
}
