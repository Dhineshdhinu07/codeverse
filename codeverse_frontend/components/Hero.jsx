import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text3D, OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

// 3D Code Block Component
function CodeBlock({ position, code }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.2;
  });

  return (
    <Float speed={2} rotationIntensity={1}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[2, 1, 0.5]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.5} />
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          size={0.3}
          height={0.1}
          position={[-0.8, -0.1, 0.26]}
        >
          {code}
          <meshStandardMaterial color="#ffffff" />
        </Text3D>
      </mesh>
    </Float>
  );
}

// Hero Component
export default function Hero() {
  const heroRef = useRef();

  useEffect(() => {
    // GSAP animations
    gsap.from(heroRef.current, {
      opacity: 0,
      y: 50,
      duration: 1.5,
      ease: "power3.out",
    });
  }, []);

  return (
    <section ref={heroRef} className="relative h-screen bg-[#0a0a12] overflow-hidden">
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f0ff" />
        <CodeBlock position={[-3, 1, 0]} code="function()" />
        <CodeBlock position={[3, -1, 0]} code="const x = 5;" />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>

      {/* Hero Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
        <h1 className="text-6xl font-bold mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#ff00aa]">
            Level Up Your Coding
          </span>
        </h1>
        <p className="text-xl mb-8">Solve challenges. Earn XP. Climb leaderboards.</p>
        <button className="px-8 py-3 bg-gradient-to-r from-[#00f0ff] to-[#ff00aa] rounded-full font-bold hover:shadow-lg hover:shadow-[#00f0ff]/50 transition-all">
          Start Coding Now →
        </button>
      </div>
    </section>
  );
}