/* eslint-disable react/prop-types */
import { RoundedBox, Text } from '@react-three/drei'
import { asset } from './collection'

export function Box({
  size = [1, 1, 1],
  color = '#e7decd',
  material,
  radius = 0.025,
  ...props
}) {
  return (
    <RoundedBox
      args={size}
      radius={Math.min(radius, Math.min(...size) / 3)}
      smoothness={2}
      bevelSegments={2}
      castShadow
      receiveShadow
      {...props}
    >
      {material ? (
        <primitive object={material} attach="material" />
      ) : (
        <meshStandardMaterial color={color} roughness={0.6} />
      )}
    </RoundedBox>
  )
}

export function Label({ children, size = 0.17, color = '#4d473c', ...props }) {
  return (
    <Text
      font={asset('fonts/caslon.ttf')}
      fontSize={size}
      gpuAccelerateSDF={false}
      color={color}
      anchorX="center"
      anchorY="middle"
      {...props}
    >
      {children}
    </Text>
  )
}

export function Plaque({ number, position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      <Box size={[0.39, 0.31, 0.028]} color="#c5bba7" radius={0.009} />
      <Label size={0.2} position={[0, -0.005, 0.023]}>
        {number}
      </Label>
      {[-0.16, 0.16].map((x) => (
        <mesh key={x} position={[x, 0.12, 0.021]}>
          <sphereGeometry args={[0.012, 6, 6]} />
          <meshStandardMaterial
            color="#857d6a"
            metalness={0.7}
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  )
}

export function Pedestal({
  size = [2, 0.6, 2],
  material,
  number,
  children,
  ...props
}) {
  return (
    <group {...props}>
      <Box
        size={size}
        position={[0, size[1] / 2, 0]}
        material={material}
        radius={0.035}
      />
      <Box
        size={[size[0] - 0.08, 0.04, size[2] - 0.08]}
        position={[0, 0.025, 0]}
        color="#a89f8c"
      />
      {number && (
        <Plaque
          number={number}
          position={[0, size[1] / 2, size[2] / 2 + 0.022]}
        />
      )}
      <group position={[0, size[1], 0]}>{children}</group>
    </group>
  )
}

export function Cylinder({ args, material, color = '#a8a496', ...props }) {
  return (
    <mesh castShadow receiveShadow {...props}>
      <cylinderGeometry args={args} />
      {material ? (
        <primitive object={material} attach="material" />
      ) : (
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
      )}
    </mesh>
  )
}

export function Frame({ width, height, children, material, ...props }) {
  return (
    <group {...props}>
      <Box size={[width, height, 0.15]} color="#181a19" radius={0.015} />
      {[
        [-width / 2, 0, 0.07],
        [width / 2, 0, 0.07],
      ].map((p, i) => (
        <Box
          key={i}
          position={p}
          size={[0.045, height + 0.055, 0.08]}
          material={material}
          radius={0.008}
        />
      ))}
      {[
        [0, -height / 2, 0.07],
        [0, height / 2, 0.07],
      ].map((p, i) => (
        <Box
          key={i}
          position={p}
          size={[width, 0.045, 0.08]}
          material={material}
          radius={0.008}
        />
      ))}
      {children}
    </group>
  )
}
