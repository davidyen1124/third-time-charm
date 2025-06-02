import { useRef, useEffect } from 'react'
import * as THREE from 'three'

function PolaroidScene() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current

    // 1. Scene, Camera, and Renderer Setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)

    const camera = new THREE.PerspectiveCamera(
      70,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 5)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.physicallyCorrectLights = true
    container.appendChild(renderer.domElement)

    // 2. Lighting: Ambient Light, Background Plane, and SpotLight
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.009)
    scene.add(ambientLight)

    const bgGeometry = new THREE.PlaneGeometry(40, 40)
    const bgMaterial = new THREE.MeshPhongMaterial({
      color: 0x111111,
      shininess: 0
    })
    const bgPlane = new THREE.Mesh(bgGeometry, bgMaterial)
    bgPlane.position.z = -2
    bgPlane.receiveShadow = true
    scene.add(bgPlane)

    const spotlight = new THREE.SpotLight(0xffffff, 2)
    spotlight.angle = Math.PI / 4
    spotlight.penumbra = 0.5
    spotlight.decay = 2
    spotlight.distance = 20
    spotlight.castShadow = true
    scene.add(spotlight)
    scene.add(spotlight.target)
    spotlight.position.set(0, 0, 2)
    spotlight.target.position.set(0, 0, -2)

    // 3. Setup for Raycasting to Update the Spotlight
    const planeRoom = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
    const mouse = new THREE.Vector2()

    function updateSpotlight(clientX, clientY) {
      // Convert pointer coordinates to normalized device coordinates
      mouse.x = (clientX / container.clientWidth) * 2 - 1
      mouse.y = -(clientY / container.clientHeight) * 2 + 1
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(mouse, camera)
      const intersectionPoint = new THREE.Vector3()
      raycaster.ray.intersectPlane(planeRoom, intersectionPoint)
      spotlight.position.set(intersectionPoint.x, intersectionPoint.y, 2)
      spotlight.target.position.set(
        intersectionPoint.x,
        intersectionPoint.y,
        -2
      )
    }

    function pointerMoveHandler(event) {
      updateSpotlight(event.clientX, event.clientY)
    }
    window.addEventListener('pointermove', pointerMoveHandler, false)

    function touchMoveHandler(event) {
      event.preventDefault()
      const touch = event.touches[0]
      updateSpotlight(touch.clientX, touch.clientY)
    }
    window.addEventListener('touchmove', touchMoveHandler, { passive: false })

    // 4. Helper Function to Create a Polaroid
    function createPolaroid() {
      const polaroid = new THREE.Group()
      polaroid.visible = false // Hide until the texture loads

      const photoWidth = 4
      const photoHeight = 3
      const borderExtraX = 0.4
      const borderExtraYTop = 0.2
      const borderExtraYBottom = 0.5
      const borderWidth = photoWidth + borderExtraX
      const borderHeight = photoHeight + borderExtraYTop + borderExtraYBottom

      const textureLoader = new THREE.TextureLoader()
      textureLoader.load(
        'https://plus.unsplash.com/premium_photo-1676667573109-273586405c96?w=1280&auto=format&fit=crop&ixlib=rb-4.0.3',
        (photoTexture) => {
          // Create the white border
          const borderGeometry = new THREE.PlaneGeometry(
            borderWidth,
            borderHeight
          )
          const borderMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff
          })
          const borderMesh = new THREE.Mesh(borderGeometry, borderMaterial)
          borderMesh.castShadow = true
          borderMesh.receiveShadow = true
          polaroid.add(borderMesh)

          // Create the photo
          const photoGeometry = new THREE.PlaneGeometry(photoWidth, photoHeight)
          const photoMaterial = new THREE.MeshPhongMaterial({
            map: photoTexture
          })
          const photoMesh = new THREE.Mesh(photoGeometry, photoMaterial)
          photoMesh.castShadow = true
          photoMesh.receiveShadow = true
          // Center the photo vertically within the border
          photoMesh.position.y = (borderExtraYBottom - borderExtraYTop) / 2
          polaroid.add(photoMesh)

          polaroid.visible = true
        }
      )

      return polaroid
    }

    // 5. Create and Position the Polaroids
    const tiltRange = 0.2

    // Center polaroid
    const mainPolaroid = createPolaroid()
    mainPolaroid.rotation.z = (Math.random() - 0.5) * tiltRange
    mainPolaroid.position.set(0, 0, 0)
    scene.add(mainPolaroid)

    // Calculate dimensions for placement of edge polaroids
    const mainPhotoWidth = 4
    const mainPhotoHeight = 3
    const mainBorderExtraX = 0.4
    const mainBorderExtraYTop = 0.2
    const mainBorderExtraYBottom = 0.5
    const mainWidth = mainPhotoWidth + mainBorderExtraX
    const mainHeight =
      mainPhotoHeight + mainBorderExtraYTop + mainBorderExtraYBottom
    const offset = 0.7

    // Top polaroid
    const topPolaroid = createPolaroid()
    topPolaroid.rotation.z = (Math.random() - 0.5) * tiltRange
    topPolaroid.position.set(0, mainHeight / 2 + offset, 0)
    scene.add(topPolaroid)

    // Bottom polaroid
    const bottomPolaroid = createPolaroid()
    bottomPolaroid.rotation.z = (Math.random() - 0.5) * tiltRange
    bottomPolaroid.position.set(0, -mainHeight / 2 - offset, 0)
    scene.add(bottomPolaroid)

    // Left polaroid
    const leftPolaroid = createPolaroid()
    leftPolaroid.rotation.z = (Math.random() - 0.5) * tiltRange
    leftPolaroid.position.set(-mainWidth / 2 - offset, 0, 0)
    scene.add(leftPolaroid)

    // Right polaroid
    const rightPolaroid = createPolaroid()
    rightPolaroid.rotation.z = (Math.random() - 0.5) * tiltRange
    rightPolaroid.position.set(mainWidth / 2 + offset, 0, 0)
    scene.add(rightPolaroid)

    // 6. Animation and Rendering Loop
    let reqId
    function animate() {
      reqId = requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    // 7. Handle Window Resizing
    function onResize() {
      const width = container.clientWidth
      const height = container.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', onResize)

    // Cleanup when the component unmounts
    return () => {
      cancelAnimationFrame(reqId)
      window.removeEventListener('pointermove', pointerMoveHandler)
      window.removeEventListener('touchmove', touchMoveHandler)
      window.removeEventListener('resize', onResize)
      container.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  return <div ref={containerRef} className='w-full h-screen overflow-hidden' />
}

export default PolaroidScene
