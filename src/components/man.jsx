export default function Man() {
  return (
    <group position={[0, -1.1, 0]}>
      {/* Head group (with eyes, mouth, hair) */}
      <group position={[0, 1.5, 0]}>
        {/* Main head */}
        <mesh>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="pink" />
        </mesh>
        {/* Hair (small sphere on top) */}
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="brown" />
        </mesh>
        {/* Right Eye */}
        <mesh position={[0.1, 0, 0.25]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="black" />
        </mesh>
        {/* Left Eye */}
        <mesh position={[-0.1, 0, 0.25]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="black" />
        </mesh>
        {/* Mouth (a small, thin box) */}
        <mesh position={[0, -0.1, 0.26]}>
          <boxGeometry args={[0.2, 0.05, 0.05]} />
          <meshStandardMaterial color="black" />
        </mesh>
      </group>

      {/* Torso */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[0.5, 1.0, 0.3]} />
        <meshStandardMaterial color="pink" />
      </mesh>

      {/* Right Arm */}
      <mesh position={[0.35, 0.75, 0]}>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color="pink" />
      </mesh>

      {/* Left Arm */}
      <mesh position={[-0.35, 0.75, 0]}>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color="pink" />
      </mesh>

      {/* Right Leg */}
      <mesh position={[0.15, 0.0, 0]}>
        <boxGeometry args={[0.1, 0.7, 0.1]} />
        <meshStandardMaterial color="pink" />
      </mesh>

      {/* Left Leg */}
      <mesh position={[-0.15, 0.0, 0]}>
        <boxGeometry args={[0.1, 0.7, 0.1]} />
        <meshStandardMaterial color="pink" />
      </mesh>
    </group>
  )
}
