import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshTransmissionMaterial, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

interface FloatingItemProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  color?: string
  speed?: number
  type?: 'box' | 'sphere' | 'coin' | 'card' | 'torus'
}

function FloatingShape({
  position,
  rotation = [0, 0, 0],
  scale = 1,
  color = '#FFD43B',
  speed = 1.2,
  type = 'box',
}: FloatingItemProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.getElapsedTime() * speed
    meshRef.current.rotation.x = rotation[0] + Math.sin(t * 0.5) * 0.2
    meshRef.current.rotation.y = rotation[1] + Math.cos(t * 0.4) * 0.3
    meshRef.current.rotation.z = rotation[2] + Math.sin(t * 0.3) * 0.15
  })

  return (
    <Float
      speed={speed * 1.5}
      rotationIntensity={0.6}
      floatIntensity={1.2}
      floatingRange={[-0.2, 0.2]}
      position={position}
    >
      <mesh ref={meshRef} scale={scale} castShadow receiveShadow>
        {type === 'box' && (
          <>
            <RoundedBox args={[1.2, 1.2, 1.2]} radius={0.18} smoothness={4}>
              <meshStandardMaterial
                color={color}
                roughness={0.18}
                metalness={0.25}
                emissive={color === '#FFD43B' ? '#FFD43B' : '#000000'}
                emissiveIntensity={0.08}
              />
            </RoundedBox>
          </>
        )}
        {type === 'sphere' && (
          <>
            <sphereGeometry args={[0.7, 32, 32]} />
            <meshStandardMaterial
              color={color}
              roughness={0.12}
              metalness={0.6}
              emissive={color === '#FFD43B' ? '#FFD43B' : '#111111'}
              emissiveIntensity={0.15}
            />
          </>
        )}
        {type === 'coin' && (
          <>
            <cylinderGeometry args={[0.8, 0.8, 0.18, 32]} />
            <meshStandardMaterial
              color="#FFD43B"
              roughness={0.15}
              metalness={0.85}
            />
          </>
        )}
        {type === 'torus' && (
          <>
            <torusGeometry args={[0.75, 0.22, 24, 48]} />
            <meshStandardMaterial
              color={color}
              roughness={0.2}
              metalness={0.4}
            />
          </>
        )}
        {type === 'card' && (
          <>
            <RoundedBox args={[1.8, 1.1, 0.08]} radius={0.08} smoothness={4}>
              <meshStandardMaterial
                color="#FFFFFF"
                roughness={0.1}
                metalness={0.1}
              />
            </RoundedBox>
          </>
        )}
      </mesh>
    </Float>
  )
}

function SceneLights() {
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[10, 15, 10]} intensity={1.8} castShadow />
      <pointLight position={[-10, -5, -5]} intensity={0.8} color="#FFF4BF" />
      <pointLight position={[5, -5, 5]} intensity={1.2} color="#FFD43B" />
      <spotLight
        position={[0, 10, 0]}
        intensity={1.5}
        angle={0.6}
        penumbra={0.8}
        color="#FFFFFF"
      />
    </>
  )
}

export function Hero3DCanvas({ className = 'h-[460px] w-full' }: { className?: string }) {
  return (
    <div className={`relative ${className} select-none`}>
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <SceneLights />

        {/* Central Core: Yellow stylized retail gift cube */}
        <FloatingShape
          type="box"
          position={[0, 0.2, 0]}
          scale={1.55}
          color="#FFD43B"
          speed={1.0}
        />

        {/* Accent floating shapes around */}
        <FloatingShape
          type="sphere"
          position={[-2.6, 1.4, 0.5]}
          scale={0.9}
          color="#171717"
          speed={1.4}
        />
        <FloatingShape
          type="coin"
          position={[2.7, 1.1, 0.8]}
          rotation={[Math.PI / 4, Math.PI / 6, 0]}
          scale={1.1}
          color="#FFD43B"
          speed={1.2}
        />
        <FloatingShape
          type="torus"
          position={[-2.4, -1.3, 0.2]}
          scale={0.85}
          color="#FFF4BF"
          speed={0.9}
        />
        <FloatingShape
          type="box"
          position={[2.5, -1.2, -0.2]}
          scale={0.8}
          color="#171717"
          speed={1.3}
        />
        <FloatingShape
          type="sphere"
          position={[0.3, -2.0, 0.6]}
          scale={0.65}
          color="#FFD43B"
          speed={1.6}
        />
      </Canvas>
    </div>
  )
}

export function MiniFloatingPillScene({ className = 'h-40 w-40' }: { className?: string }) {
  return (
    <div className={`relative ${className} select-none pointer-events-none`}>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <SceneLights />
        <FloatingShape
          type="coin"
          position={[0, 0, 0]}
          scale={1.2}
          color="#FFD43B"
          speed={1.8}
        />
      </Canvas>
    </div>
  )
}
