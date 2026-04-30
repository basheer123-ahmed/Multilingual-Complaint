import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Float, 
  OrbitControls,
  Points,
  PointMaterial,
  Stars
} from '@react-three/drei';
import * as THREE from 'three';

const NeuralCore = () => {
  const coreRef = useRef();
  const wireframeRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    coreRef.current.rotation.y = t * 0.2;
    coreRef.current.rotation.x = t * 0.1;
    wireframeRef.current.rotation.y = -t * 0.15;
    wireframeRef.current.rotation.z = t * 0.1;
  });

  return (
    <group>
      {/* Inner Solid Core */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial 
          color="#1e40af" 
          emissive="#3b82f6"
          emissiveIntensity={0.5}
          wireframe={false}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Outer Wireframe Shell */}
      <mesh ref={wireframeRef}>
        <icosahedronGeometry args={[1.6, 1]} />
        <meshStandardMaterial 
          color="#60a5fa" 
          wireframe 
          transparent 
          opacity={0.4} 
          emissive="#60a5fa"
          emissiveIntensity={1}
        />
      </mesh>

      {/* Orbiting Data Nodes */}
      <Float speed={2} rotationIntensity={2} floatIntensity={2}>
        <group rotation={[0, 0, Math.PI / 4]}>
          <mesh position={[2.5, 0, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-2.5, 0, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      </Float>
      <Float speed={3} rotationIntensity={1.5} floatIntensity={1}>
        <group rotation={[Math.PI / 3, 0, 0]}>
          <mesh position={[0, 2.2, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color="#93c5fd" />
          </mesh>
          <mesh position={[0, -2.2, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color="#93c5fd" />
          </mesh>
        </group>
      </Float>
    </group>
  );
};

const DataStreamParticles = () => {
  const count = 1000;
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 3 + Math.random() * 2;
      const theta = Math.random() * 2 * Math.PI;
      const y = (Math.random() - 0.5) * 15;
      
      p[i * 3] = radius * Math.cos(theta);
      p[i * 3 + 1] = y;
      p[i * 3 + 2] = radius * Math.sin(theta);
    }
    return p;
  }, []);

  const pointsRef = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = t * 0.05;
    const positions = pointsRef.current.geometry.attributes.position.array;
    for(let i=0; i<count; i++) {
        positions[i*3 + 1] += 0.02;
        if(positions[i*3 + 1] > 7.5) {
            positions[i*3 + 1] = -7.5;
        }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#3b82f6"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

const Hero3D = () => {
  return (
    <div className="w-full h-full min-h-[500px] relative bg-slate-50/20 rounded-[4rem] border border-white/50 backdrop-blur-sm shadow-inner overflow-hidden">
      <Canvas shadows camera={{ position: [0, 0, 7], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#3b82f6" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
        
        <NeuralCore />
        <DataStreamParticles />
        
        <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={2} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
      
      {/* High-Tech Overlay UI */}
      <div className="absolute inset-0 pointer-events-none p-10 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="w-12 h-12 border-t-2 border-l-2 border-blue-500/30" />
          <div className="w-12 h-12 border-t-2 border-r-2 border-blue-500/30" />
        </div>
        <div className="flex justify-between items-end">
          <div className="w-12 h-12 border-b-2 border-l-2 border-blue-500/30" />
          <div className="w-12 h-12 border-b-2 border-r-2 border-blue-500/30" />
        </div>
      </div>
    </div>
  );
};

export default Hero3D;
